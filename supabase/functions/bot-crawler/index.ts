import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOT-CRAWLER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Bot crawler function started");

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

    const { action, siteId, url, keywords, targetPrice, sizePref } = await req.json();
    logStep("Request received", { action, siteId, url, keywords });

    if (action === 'crawl_product') {
      // Get site configuration
      const { data: site, error: siteError } = await supabaseClient
        .from('bot_sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (siteError || !site) {
        throw new Error("Site not found or not supported");
      }

      logStep("Site configuration loaded", { siteName: site.name, baseUrl: site.base_url });

      // Use Firecrawl to scrape the product page
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
          url: url,
          pageOptions: {
            onlyMainContent: true,
            includeHtml: true,
            waitFor: 2000
          },
          extractorOptions: {
            mode: 'llm-extraction',
            extractionPrompt: `Extract the following product information:
              - Product title/name
              - Current price (convert to number, remove currency symbols)
              - Stock status (in stock, out of stock, limited)
              - Available sizes (if applicable)
              - Product description
              - Product images URLs
              Return as JSON with keys: title, price, stock_status, sizes, description, images`
          }
        }),
      });

      if (!crawlResponse.ok) {
        throw new Error(`Firecrawl API error: ${await crawlResponse.text()}`);
      }

      const crawlData = await crawlResponse.json();
      logStep("Product crawled successfully", { success: crawlData.success });

      if (!crawlData.success) {
        throw new Error("Failed to crawl product page");
      }

      const extractedData = crawlData.data?.llm_extraction || {};
      const productData = {
        title: extractedData.title || 'Unknown Product',
        price: parseFloat(extractedData.price) || 0,
        stock_status: extractedData.stock_status || 'unknown',
        sizes: extractedData.sizes || [],
        description: extractedData.description || '',
        images: extractedData.images || []
      };

      logStep("Product data extracted", productData);

      // Create or update monitor
      const { data: monitor, error: monitorError } = await supabaseClient
        .from('bot_monitors')
        .upsert({
          user_id: user.id,
          site_id: siteId,
          product_name: productData.title,
          product_url: url,
          target_price: targetPrice || null,
          current_price: productData.price,
          stock_status: productData.stock_status,
          size_preference: sizePref || [],
          keywords: keywords || [],
          last_checked: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (monitorError) {
        logStep("Error creating monitor", monitorError);
        throw new Error(`Failed to create monitor: ${monitorError.message}`);
      }

      logStep("Monitor created/updated", { monitorId: monitor.id });

      // Check if alert conditions are met
      const alerts = [];
      
      if (targetPrice && productData.price <= targetPrice) {
        alerts.push({
          user_id: user.id,
          monitor_id: monitor.id,
          alert_type: 'price_drop',
          message: `${productData.title} is now $${productData.price} (target: $${targetPrice})`
        });
      }

      if (productData.stock_status === 'in_stock') {
        alerts.push({
          user_id: user.id,
          monitor_id: monitor.id,
          alert_type: 'back_in_stock',
          message: `${productData.title} is back in stock!`
        });
      }

      if (alerts.length > 0) {
        await supabaseClient.from('bot_alerts').insert(alerts);
        logStep("Alerts created", { alertCount: alerts.length });
      }

      return new Response(JSON.stringify({
        success: true,
        monitor: monitor,
        product: productData,
        alerts: alerts.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'search_products') {
      // Search across multiple sites
      const { data: sites } = await supabaseClient
        .from('bot_sites')
        .select('*')
        .eq('status', 'active');

      const searchResults = [];
      const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');

      for (const site of sites || []) {
        try {
          const searchUrl = `${site.base_url}/search?q=${encodeURIComponent(keywords.join(' '))}`;
          
          const crawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: searchUrl,
              pageOptions: {
                onlyMainContent: true,
                waitFor: 2000
              },
              extractorOptions: {
                mode: 'llm-extraction',
                extractionPrompt: `Extract product search results as an array of products with:
                  - title: product name
                  - price: price as number
                  - url: product URL
                  - image: product image URL
                  - stock: availability status
                  Return as JSON array`
              }
            }),
          });

          if (crawlResponse.ok) {
            const crawlData = await crawlResponse.json();
            if (crawlData.success && crawlData.data?.llm_extraction) {
              const products = Array.isArray(crawlData.data.llm_extraction) 
                ? crawlData.data.llm_extraction 
                : [crawlData.data.llm_extraction];
              
              searchResults.push({
                site: site.name,
                site_id: site.id,
                products: products.slice(0, 10) // Limit to 10 results per site
              });
            }
          }
        } catch (error) {
          logStep(`Error searching ${site.name}`, error.message);
        }
      }

      // Store search results
      await supabaseClient.from('bot_search_results').insert({
        user_id: user.id,
        site_id: null, // Multi-site search
        search_query: keywords.join(' '),
        results: searchResults,
        total_found: searchResults.reduce((sum, site) => sum + site.products.length, 0)
      });

      return new Response(JSON.stringify({
        success: true,
        results: searchResults,
        total_sites: searchResults.length,
        total_products: searchResults.reduce((sum, site) => sum + site.products.length, 0)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error("Invalid action specified");

  } catch (error) {
    logStep("Error in bot crawler", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});