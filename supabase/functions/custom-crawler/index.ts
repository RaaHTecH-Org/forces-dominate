import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Logging utility
const logStep = (step: string, details?: any) => {
  console.log(`[CUSTOM-CRAWLER] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  logStep('Custom crawler function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    logStep('Request received', requestData);

    const { action, siteId, url, keywords, targetPrice, sizePref } = requestData;

    // Try to get user authentication for personalization, but allow guest access
    let user = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user: userData }, error: userError } = await supabase.auth.getUser(token);
        
        if (!userError && userData) {
          user = userData;
          logStep('User authenticated', { userId: user.id });
        } else {
          logStep('Authentication failed, continuing as guest', userError);
        }
      } catch (error) {
        logStep('Auth error, continuing as guest', error);
      }
    } else {
      logStep('No auth header, continuing as guest');
    }

    if (action === 'crawl_product') {
      return await crawlProduct(supabase, user?.id, siteId, url, targetPrice, sizePref);
    } else if (action === 'search_products') {
      return await searchProducts(supabase, user?.id, keywords);
    } else if (action === 'test_selectors') {
      return await testSelectors(requestData.url, requestData.selectors);
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    logStep('Error in main function', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function crawlProduct(supabase: any, userId: string | undefined, siteId: string, url: string, targetPrice?: number, sizePref?: string[]) {
  logStep('Starting product crawl', { siteId, url });

  try {
    // Get site configuration
    const { data: site, error: siteError } = await supabase
      .from('bot_sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (siteError || !site) {
      logStep('Site not found', siteError);
      return new Response(
        JSON.stringify({ error: 'Site configuration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    try {
      const page = await browser.newPage();
      
      // Set user agent to avoid detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      logStep('Navigating to URL', url);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait a bit for dynamic content to load
      await page.waitForTimeout(3000);

      // Extract product data using selectors from site config
      const selectors = site.selectors || {};
      
      const productData = await page.evaluate((selectors) => {
        const getTextContent = (selector: string) => {
          try {
            const element = document.querySelector(selector);
            return element?.textContent?.trim() || '';
          } catch {
            return '';
          }
        };

        const getImageSrc = (selector: string) => {
          try {
            const element = document.querySelector(selector) as HTMLImageElement;
            return element?.src || '';
          } catch {
            return '';
          }
        };

        const extractPrice = (text: string) => {
          const priceMatch = text.match(/[\d,]+\.?\d*/);
          return priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
        };

        return {
          title: getTextContent(selectors.title || 'h1'),
          price: extractPrice(getTextContent(selectors.price || '[class*="price"]')),
          stock: getTextContent(selectors.stock || '[class*="stock"]'),
          sizes: Array.from(document.querySelectorAll(selectors.sizes || '[class*="size"]')).map(el => el.textContent?.trim()).filter(Boolean),
          description: getTextContent(selectors.description || '[class*="description"]'),
          images: Array.from(document.querySelectorAll(selectors.images || 'img')).map(img => (img as HTMLImageElement).src).filter(Boolean).slice(0, 5),
        };
      }, selectors);

      await browser.close();

      logStep('Product data extracted', productData);

      // Only create monitor if user is provided (for user-initiated crawls)
      let monitor = null;
      let alert = null;
      
      if (userId && targetPrice) {
        const { data: monitorData, error: monitorError } = await supabase
          .from('bot_monitors')
          .upsert({
            user_id: userId,
            site_id: siteId,
            product_url: url,
            product_name: productData.title || 'Unknown Product',
            current_price: productData.price || 0,
            target_price: targetPrice,
            stock_status: productData.stock || 'unknown',
            size_preference: sizePref || [],
            last_checked: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (monitorError) {
          logStep('Error creating monitor', monitorError);
        } else {
          monitor = monitorData;
          
          // Check for alerts
          const shouldAlert = (targetPrice && productData.price && productData.price <= targetPrice) ||
                             (productData.stock && !productData.stock.toLowerCase().includes('out'));

          if (shouldAlert) {
            const alertMessage = targetPrice && productData.price && productData.price <= targetPrice
              ? `Price drop alert: ${productData.title} is now $${productData.price}`
              : `Stock alert: ${productData.title} is back in stock`;

            const { data: alertData } = await supabase
              .from('bot_alerts')
              .insert({
                user_id: userId,
                monitor_id: monitor.id,
                alert_type: targetPrice && productData.price && productData.price <= targetPrice ? 'price_drop' : 'stock_available',
                message: alertMessage,
              })
              .select()
              .single();

            alert = alertData;
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          monitor,
          product: productData,
          alert,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } finally {
      await browser.close();
    }

  } catch (error) {
    logStep('Error in crawlProduct', error);
    return new Response(
      JSON.stringify({ error: 'Failed to crawl product' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function searchProducts(supabase: any, userId: string | undefined, keywords: string[]) {
  logStep('Starting product search', { keywords });

  try {
    // Get active sites
    const { data: sites, error: sitesError } = await supabase
      .from('bot_sites')
      .select('*')
      .eq('status', 'active');

    if (sitesError || !sites) {
      logStep('No active sites found', sitesError);
      return new Response(
        JSON.stringify({ error: 'No active sites found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    const searchResults: any[] = [];

    try {
      for (const site of sites) {
        try {
          logStep(`Searching on ${site.name}`, site.base_url);
          
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
          await page.setViewport({ width: 1920, height: 1080 });

          // Construct search URL
          const searchQuery = keywords.join(' ');
          const searchUrl = `${site.base_url}/search?q=${encodeURIComponent(searchQuery)}`;
          
          await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          await page.waitForTimeout(3000);

          // Extract search results
          const selectors = site.selectors || {};
          const products = await page.evaluate((selectors, siteName) => {
            const productElements = document.querySelectorAll(selectors.searchResults || '[class*="product"]');
            const products: any[] = [];

            productElements.forEach((element, index) => {
              if (index >= 10) return; // Limit to 10 results per site

              const getTextContent = (selector: string) => {
                try {
                  const el = element.querySelector(selector);
                  return el?.textContent?.trim() || '';
                } catch {
                  return '';
                }
              };

              const getImageSrc = (selector: string) => {
                try {
                  const el = element.querySelector(selector) as HTMLImageElement;
                  return el?.src || '';
                } catch {
                  return '';
                }
              };

              const getHref = (selector: string) => {
                try {
                  const el = element.querySelector(selector) as HTMLAnchorElement;
                  return el?.href || '';
                } catch {
                  return '';
                }
              };

              const extractPrice = (text: string) => {
                const priceMatch = text.match(/[\d,]+\.?\d*/);
                return priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
              };

              const title = getTextContent(selectors.title || 'h2, h3, [class*="title"]');
              const price = extractPrice(getTextContent(selectors.price || '[class*="price"]'));
              const image = getImageSrc(selectors.image || 'img');
              const url = getHref(selectors.link || 'a');

              if (title && price) {
                products.push({
                  title,
                  price,
                  url: url.startsWith('http') ? url : `${siteName}${url}`,
                  image,
                  site: siteName,
                  stock: getTextContent(selectors.stock || '[class*="stock"]') || 'unknown',
                });
              }
            });

            return products;
          }, selectors, site.base_url);

          searchResults.push(...products);
          await page.close();

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, site.rate_limit_ms || 1000));

        } catch (error) {
          logStep(`Error searching ${site.name}`, error);
          // Continue with other sites
        }
      }

    } finally {
      await browser.close();
    }

    // Store search results only if user is authenticated
    if (userId) {
      const { data: savedResults, error: saveError } = await supabase
        .from('bot_search_results')
        .insert({
          user_id: userId,
          search_query: keywords.join(' '),
          results: searchResults,
          total_found: searchResults.length,
        })
        .select()
        .single();

      if (saveError) {
        logStep('Error saving search results', saveError);
      }
    } else {
      logStep('Guest user - not saving search results');
    }

    logStep(`Search completed. Found ${searchResults.length} products`);

    return new Response(
      JSON.stringify({
        success: true,
        results: searchResults,
        total_found: searchResults.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    logStep('Error in searchProducts', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search products' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function testSelectors(url: string, selectors: any) {
  logStep('Testing selectors', { url, selectors });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.waitForTimeout(3000);

      // Test each selector
      const testResults = await page.evaluate((selectors) => {
        const results: any = {};

        Object.entries(selectors).forEach(([key, selector]: [string, any]) => {
          try {
            const elements = document.querySelectorAll(selector);
            results[key] = {
              selector,
              found: elements.length,
              samples: Array.from(elements).slice(0, 3).map(el => ({
                text: el.textContent?.trim().substring(0, 100) || '',
                html: el.outerHTML.substring(0, 200) || '',
                attributes: el.getAttributeNames().reduce((acc: any, name) => {
                  acc[name] = el.getAttribute(name);
                  return acc;
                }, {})
              }))
            };
          } catch (error) {
            results[key] = {
              selector,
              found: 0,
              error: (error as Error).message,
              samples: []
            };
          }
        });

        return results;
      }, selectors);

      await browser.close();

      return new Response(
        JSON.stringify({
          success: true,
          url,
          testResults,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } finally {
      await browser.close();
    }

  } catch (error) {
    logStep('Error in testSelectors', error);
    return new Response(
      JSON.stringify({ error: 'Failed to test selectors' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}