import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOT-ATC] ${step}${detailsStr}`);
};

// Enhanced ATC automation with Puppeteer
async function performATCAutomation(monitor: any, size: string, quantity: number, autoCheckout: boolean, taskId: string, supabaseClient: any, userId: string, monitorId: string) {
  const maxRetries = 3;
  const retryDelay = 2000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    logStep(`ATC attempt ${attempt}/${maxRetries}`, { monitorId, size, quantity });
    
    let browser;
    try {
      // Launch browser with optimized settings
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ]
      });
      
      const page = await browser.newPage();
      
      // Set realistic user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Load any saved session cookies for this site
      const sessionData = await loadSessionCookies(supabaseClient, userId, monitor.bot_sites.base_url);
      if (sessionData) {
        await page.setCookie(...sessionData);
        logStep("Session cookies loaded", { cookieCount: sessionData.length });
      }
      
      // Navigate to product page with retry logic
      await page.goto(monitor.product_url, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });
      
      logStep("Product page loaded", { url: monitor.product_url });
      
      // Check stock status using site-specific selectors
      const stockStatus = await checkStockStatus(page, monitor.bot_sites.selectors);
      if (!stockStatus.inStock) {
        logStep("Product out of stock", stockStatus);
        return {
          success: false,
          message: `Product is out of stock: ${stockStatus.message}`,
          stockStatus,
          timestamp: new Date().toISOString(),
          attempt
        };
      }
      
      // Select size if required
      if (size && monitor.bot_sites.selectors?.size_selector) {
        const sizeSelected = await selectSize(page, monitor.bot_sites.selectors.size_selector, size);
        if (!sizeSelected) {
          logStep("Size selection failed", { size, selector: monitor.bot_sites.selectors.size_selector });
          return {
            success: false,
            message: `Size ${size} not available or selection failed`,
            timestamp: new Date().toISOString(),
            attempt
          };
        }
        logStep("Size selected", { size });
      }
      
      // Set quantity if different from default
      if (quantity > 1 && monitor.bot_sites.selectors?.quantity_selector) {
        await setQuantity(page, monitor.bot_sites.selectors.quantity_selector, quantity);
        logStep("Quantity set", { quantity });
      }
      
      // Add to cart
      const atcResult = await addToCart(page, monitor.bot_sites.selectors);
      if (!atcResult.success) {
        logStep("Add to cart failed", atcResult);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        return {
          success: false,
          message: `Failed to add to cart: ${atcResult.message}`,
          timestamp: new Date().toISOString(),
          attempt
        };
      }
      
      logStep("Successfully added to cart", atcResult);
      
      // Save session cookies for future use
      const cookies = await page.cookies();
      await saveSessionCookies(supabaseClient, userId, monitor.bot_sites.base_url, cookies);
      
      // Create success alert
      await supabaseClient.from('bot_alerts').insert({
        user_id: userId,
        monitor_id: monitorId,
        alert_type: 'atc_success',
        message: `✅ Successfully added ${monitor.product_name} ${size ? `(${size})` : ''} x${quantity} to cart`
      });
      
      let successMessage = `Successfully added ${monitor.product_name} ${size ? `(${size})` : ''} x${quantity} to cart`;
      
      // If auto-checkout is enabled, create checkout task
      if (autoCheckout) {
        await supabaseClient.from('bot_tasks').insert({
          user_id: userId,
          monitor_id: monitorId,
          task_type: 'checkout',
          status: 'pending',
          config: {
            atc_task_id: taskId,
            auto_checkout: true,
            cart_data: atcResult.cartData
          },
          scheduled_at: new Date().toISOString()
        });
        
        successMessage += ' - Checkout task scheduled';
        logStep("Checkout task scheduled", { taskId });
      }
      
      return {
        success: true,
        message: successMessage,
        cartData: atcResult.cartData,
        stockStatus,
        timestamp: new Date().toISOString(),
        attempt
      };
      
    } catch (error) {
      logStep(`ATC attempt ${attempt} failed`, { error: error.message });
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }
      
      return {
        success: false,
        message: `ATC failed after ${maxRetries} attempts: ${error.message}`,
        timestamp: new Date().toISOString(),
        attempt
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

// Check stock status using site-specific selectors
async function checkStockStatus(page: any, selectors: any) {
  try {
    const stockSelector = selectors?.stock_status || selectors?.stock_indicator;
    if (!stockSelector) {
      return { inStock: true, message: 'No stock selector configured, assuming in stock' };
    }
    
    // Wait for stock element to be present
    await page.waitForSelector(stockSelector, { timeout: 10000 });
    
    const stockText = await page.$eval(stockSelector, (el: any) => el.textContent?.toLowerCase() || '');
    
    // Common out of stock indicators
    const outOfStockKeywords = ['out of stock', 'sold out', 'unavailable', 'not available', 'coming soon'];
    const isOutOfStock = outOfStockKeywords.some(keyword => stockText.includes(keyword));
    
    return {
      inStock: !isOutOfStock,
      message: stockText,
      selector: stockSelector
    };
  } catch (error) {
    logStep("Stock check error", { error: error.message });
    return { inStock: true, message: 'Could not determine stock status, proceeding' };
  }
}

// Select product size
async function selectSize(page: any, sizeSelector: string, targetSize: string): Promise<boolean> {
  try {
    await page.waitForSelector(sizeSelector, { timeout: 10000 });
    
    // Try different size selection methods
    const sizeSelected = await page.evaluate((selector: string, size: string) => {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        const text = element.textContent?.trim().toLowerCase();
        const value = element.getAttribute('value')?.toLowerCase();
        const dataSize = element.getAttribute('data-size')?.toLowerCase();
        
        if (text === size.toLowerCase() || value === size.toLowerCase() || dataSize === size.toLowerCase()) {
          if (element.tagName === 'OPTION') {
            (element as HTMLOptionElement).selected = true;
            element.parentElement?.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            (element as HTMLElement).click();
          }
          return true;
        }
      }
      return false;
    }, sizeSelector, targetSize);
    
    if (sizeSelected) {
      await page.waitForTimeout(1000); // Wait for any dynamic updates
    }
    
    return sizeSelected;
  } catch (error) {
    logStep("Size selection error", { error: error.message });
    return false;
  }
}

// Set product quantity
async function setQuantity(page: any, quantitySelector: string, quantity: number) {
  try {
    await page.waitForSelector(quantitySelector, { timeout: 10000 });
    
    await page.evaluate((selector: string, qty: number) => {
      const element = document.querySelector(selector) as HTMLInputElement;
      if (element) {
        element.value = qty.toString();
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, quantitySelector, quantity);
    
    await page.waitForTimeout(500);
  } catch (error) {
    logStep("Quantity setting error", { error: error.message });
  }
}

// Add product to cart
async function addToCart(page: any, selectors: any) {
  try {
    const atcSelector = selectors?.add_to_cart || selectors?.atc_button || '[data-test="add-to-cart"]';
    
    await page.waitForSelector(atcSelector, { timeout: 10000 });
    
    // Check if button is enabled
    const isEnabled = await page.$eval(atcSelector, (el: any) => {
      return !el.disabled && !el.classList.contains('disabled');
    });
    
    if (!isEnabled) {
      return { success: false, message: 'Add to cart button is disabled' };
    }
    
    // Click add to cart button
    await page.click(atcSelector);
    
    // Wait for cart update indicators
    await page.waitForTimeout(2000);
    
    // Try to detect successful cart addition
    const cartSuccessSelectors = [
      selectors?.cart_success_indicator,
      '[data-test="cart-success"]',
      '.cart-success',
      '.added-to-cart'
    ].filter(Boolean);
    
    let cartData = null;
    for (const successSelector of cartSuccessSelectors) {
      try {
        await page.waitForSelector(successSelector, { timeout: 3000 });
        cartData = await page.$eval(successSelector, (el: any) => el.textContent);
        break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // Check cart count or cart icon for changes
    const cartCount = await page.evaluate(() => {
      const cartCounters = document.querySelectorAll('[data-test="cart-count"], .cart-count, .basket-count');
      for (const counter of cartCounters) {
        const count = parseInt(counter.textContent || '0');
        if (count > 0) return count;
      }
      return null;
    });
    
    return {
      success: true,
      message: 'Product added to cart successfully',
      cartData: cartData || `Cart count: ${cartCount}`,
      cartCount
    };
    
  } catch (error) {
    logStep("Add to cart error", { error: error.message });
    return { success: false, message: `Add to cart failed: ${error.message}` };
  }
}

// Load saved session cookies
async function loadSessionCookies(supabaseClient: any, userId: string, domain: string) {
  try {
    const { data: session } = await supabaseClient
      .from('bot_sessions')
      .select('cookies')
      .eq('user_id', userId)
      .eq('domain', domain)
      .single();
    
    return session?.cookies ? JSON.parse(session.cookies) : null;
  } catch (error) {
    logStep("Session load error", { error: error.message });
    return null;
  }
}

// Save session cookies
async function saveSessionCookies(supabaseClient: any, userId: string, domain: string, cookies: any[]) {
  try {
    const relevantCookies = cookies.filter(cookie => 
      cookie.name.includes('session') || 
      cookie.name.includes('cart') || 
      cookie.name.includes('user') ||
      cookie.name.includes('auth')
    );
    
    await supabaseClient
      .from('bot_sessions')
      .upsert({
        user_id: userId,
        domain,
        cookies: JSON.stringify(relevantCookies),
        updated_at: new Date().toISOString()
      });
      
    logStep("Session cookies saved", { domain, cookieCount: relevantCookies.length });
  } catch (error) {
    logStep("Session save error", { error: error.message });
  }
}

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

    // Real ATC process using Puppeteer automation
    const taskResult = await performATCAutomation(monitor, size, quantity, autoCheckout, task.id, supabaseClient, user.id, monitorId);

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