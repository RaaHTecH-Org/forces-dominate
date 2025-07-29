import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOT-ATC] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Bot ATC function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { monitorId, size, quantity, autoCheckout } = await req.json();
    logStep("ATC request received", { monitorId, size, quantity, autoCheckout });

    // Get monitor details
    const { data: monitor, error: monitorError } = await supabaseClient
      .from('bot_monitors')
      .select(`
        *,
        bot_sites (*)
      `)
      .eq('id', monitorId)
      .eq('user_id', user.id)
      .single();

    if (monitorError || !monitor) {
      throw new Error("Monitor not found or unauthorized");
    }

    logStep("Monitor loaded", { productName: monitor.product_name, siteName: monitor.bot_sites.name });

    // Create bot task for ATC
    const { data: task, error: taskError } = await supabaseClient
      .from('bot_tasks')
      .insert({
        user_id: user.id,
        monitor_id: monitorId,
        task_type: 'atc',
        status: 'running',
        config: {
          product_url: monitor.product_url,
          size: size,
          quantity: quantity || 1,
          auto_checkout: autoCheckout || false,
          site_selectors: monitor.bot_sites.selectors
        },
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (taskError) {
      throw new Error(`Failed to create ATC task: ${taskError.message}`);
    }

    logStep("ATC task created", { taskId: task.id });

    // Simulate ATC process (in real implementation, this would use browser automation)
    try {
      // Use Firecrawl to check current product status
      const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
      if (!firecrawlApiKey) {
        throw new Error('FIRECRAWL_API_KEY not configured');
      }

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
            includeHtml: true,
            waitFor: 2000
          },
          extractorOptions: {
            mode: 'llm-extraction',
            extractionPrompt: `Check if this product is available for purchase:
              - stock_status: in_stock, out_of_stock, limited
              - available_sizes: array of available sizes
              - add_to_cart_available: true/false
              - price: current price
              Return as JSON`
          }
        }),
      });

      const crawlData = await crawlResponse.json();
      const productStatus = crawlData.data?.llm_extraction || {};

      logStep("Product status checked", productStatus);

      let taskResult = {
        success: false,
        message: '',
        product_status: productStatus,
        timestamp: new Date().toISOString()
      };

      if (productStatus.stock_status !== 'in_stock') {
        taskResult.message = 'Product is out of stock';
      } else if (!productStatus.add_to_cart_available) {
        taskResult.message = 'Add to cart not available';
      } else if (size && !productStatus.available_sizes?.includes(size)) {
        taskResult.message = `Size ${size} not available`;
      } else {
        // Simulate successful ATC
        taskResult.success = true;
        taskResult.message = `Successfully added ${monitor.product_name} (${size || 'default'}) to cart`;
        
        // Create alert for successful ATC
        await supabaseClient.from('bot_alerts').insert({
          user_id: user.id,
          monitor_id: monitorId,
          alert_type: 'atc_success',
          message: `✅ ${taskResult.message}`
        });

        // If auto-checkout is enabled, create checkout task
        if (autoCheckout) {
          await supabaseClient.from('bot_tasks').insert({
            user_id: user.id,
            monitor_id: monitorId,
            task_type: 'checkout',
            status: 'pending',
            config: {
              atc_task_id: task.id,
              auto_checkout: true
            },
            scheduled_at: new Date().toISOString()
          });
          
          taskResult.message += ' - Checkout task scheduled';
        }
      }

      // Update task with result
      await supabaseClient
        .from('bot_tasks')
        .update({
          status: taskResult.success ? 'completed' : 'failed',
          result: taskResult,
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      logStep("ATC task completed", { success: taskResult.success, message: taskResult.message });

      return new Response(JSON.stringify({
        success: true,
        task: {
          ...task,
          status: taskResult.success ? 'completed' : 'failed',
          result: taskResult
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      // Update task as failed
      await supabaseClient
        .from('bot_tasks')
        .update({
          status: 'failed',
          result: {
            success: false,
            message: error.message,
            timestamp: new Date().toISOString()
          },
          completed_at: new Date().toISOString()
        })
        .eq('id', task.id);

      throw error;
    }

  } catch (error) {
    logStep("Error in bot ATC", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});