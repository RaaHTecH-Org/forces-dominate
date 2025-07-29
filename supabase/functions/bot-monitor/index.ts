import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOT-MONITOR] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Bot monitor function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // This function can be called without auth for scheduled monitoring
    const { action, monitorIds, userId } = await req.json();
    logStep("Monitor request received", { action, monitorIds, userId });

    if (action === 'check_all_monitors') {
      // Get all active monitors
      const { data: monitors, error: monitorsError } = await supabaseClient
        .from('bot_monitors')
        .select(`
          *,
          bot_sites (*)
        `)
        .eq('is_active', true);

      if (monitorsError) {
        throw new Error(`Failed to fetch monitors: ${monitorsError.message}`);
      }

      logStep("Active monitors loaded", { count: monitors?.length || 0 });

      const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (!firecrawlApiKey) {
        throw new Error('FIRECRAWL_API_KEY not configured');
      }

      const results = [];
      const alerts = [];

      for (const monitor of monitors || []) {
        try {
          logStep(`Checking monitor`, { id: monitor.id, product: monitor.product_name });

          // Crawl product page for updates
          const crawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: monitor.product_url,
              pageOptions: {
                onlyMainContent: true,
                waitFor: 1000
              },
              extractorOptions: {
                mode: 'llm-extraction',
                extractionPrompt: `Extract current product information:
                  - price: current price as number
                  - stock_status: in_stock, out_of_stock, limited
                  - available_sizes: array of available sizes
                  Return as JSON`
              }
            }),
          });

          if (crawlResponse.ok) {
            const crawlData = await crawlResponse.json();
            const currentData = crawlData.data?.llm_extraction || {};

            const previousPrice = monitor.current_price;
            const currentPrice = parseFloat(currentData.price) || previousPrice;
            const currentStock = currentData.stock_status || 'unknown';
            
            logStep(`Product data extracted`, { 
              previousPrice, 
              currentPrice, 
              currentStock,
              productName: monitor.product_name 
            });

            // Check for price drop
            if (monitor.target_price && currentPrice <= monitor.target_price && currentPrice < previousPrice) {
              alerts.push({
                user_id: monitor.user_id,
                monitor_id: monitor.id,
                alert_type: 'price_drop',
                message: `🔥 ${monitor.product_name} dropped to $${currentPrice} (target: $${monitor.target_price})`
              });
            }

            // Check for stock change
            if (currentStock === 'in_stock' && monitor.stock_status !== 'in_stock') {
              alerts.push({
                user_id: monitor.user_id,
                monitor_id: monitor.id,
                alert_type: 'back_in_stock',
                message: `📦 ${monitor.product_name} is back in stock!`
              });
            }

            // Check for size availability
            if (monitor.size_preference?.length > 0 && currentData.available_sizes) {
              const availablePrefSizes = monitor.size_preference.filter(size => 
                currentData.available_sizes.includes(size)
              );
              
              if (availablePrefSizes.length > 0) {
                alerts.push({
                  user_id: monitor.user_id,
                  monitor_id: monitor.id,
                  alert_type: 'size_available',
                  message: `👟 ${monitor.product_name} - Size ${availablePrefSizes.join(', ')} now available!`
                });
              }
            }

            // Update monitor with latest data
            await supabaseClient
              .from('bot_monitors')
              .update({
                current_price: currentPrice,
                stock_status: currentStock,
                last_checked: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', monitor.id);

            results.push({
              monitor_id: monitor.id,
              product_name: monitor.product_name,
              previous_price: previousPrice,
              current_price: currentPrice,
              stock_status: currentStock,
              alerts_generated: alerts.filter(a => a.monitor_id === monitor.id).length
            });

          } else {
            logStep(`Failed to crawl monitor ${monitor.id}`, await crawlResponse.text());
            results.push({
              monitor_id: monitor.id,
              product_name: monitor.product_name,
              error: 'Failed to crawl product page'
            });
          }

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, monitor.bot_sites.rate_limit_ms || 1000));

        } catch (error) {
          logStep(`Error checking monitor ${monitor.id}`, error.message);
          results.push({
            monitor_id: monitor.id,
            product_name: monitor.product_name,
            error: error.message
          });
        }
      }

      // Insert all alerts
      if (alerts.length > 0) {
        await supabaseClient.from('bot_alerts').insert(alerts);
        logStep("Alerts created", { count: alerts.length });
      }

      return new Response(JSON.stringify({
        success: true,
        monitors_checked: results.length,
        alerts_generated: alerts.length,
        results: results
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'toggle_monitor') {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) throw new Error("No authorization header provided");

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      const user = userData.user;

      const { monitorId, isActive } = await req.json();

      const { data: monitor, error: updateError } = await supabaseClient
        .from('bot_monitors')
        .update({ is_active: isActive })
        .eq('id', monitorId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update monitor: ${updateError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        monitor: monitor
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error("Invalid action specified");

  } catch (error) {
    logStep("Error in bot monitor", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});