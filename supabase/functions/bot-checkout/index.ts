import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BOT-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Bot checkout function started");

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
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { monitorId, amount, currency = 'usd' } = await req.json();
    logStep("Checkout request received", { monitorId, amount, currency });

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

    logStep("Monitor loaded", { productName: monitor.product_name, currentPrice: monitor.current_price });

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const checkoutAmount = amount || (monitor.current_price * 100); // Convert to cents

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: { 
              name: monitor.product_name,
              description: `Bot purchase from ${monitor.bot_sites.name}`,
              images: monitor.product_url ? [monitor.product_url] : undefined
            },
            unit_amount: checkoutAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/bot-success?session_id={CHECKOUT_SESSION_ID}&monitor_id=${monitorId}`,
      cancel_url: `${req.headers.get("origin")}/bot-dashboard?cancelled=true`,
      metadata: {
        monitor_id: monitorId,
        user_id: user.id,
        bot_purchase: 'true'
      }
    });

    logStep("Stripe checkout session created", { sessionId: session.id, url: session.url });

    // Create checkout task
    const { data: task, error: taskError } = await supabaseClient
      .from('bot_tasks')
      .insert({
        user_id: user.id,
        monitor_id: monitorId,
        task_type: 'checkout',
        status: 'pending',
        config: {
          stripe_session_id: session.id,
          amount: checkoutAmount,
          currency: currency,
          product_name: monitor.product_name
        },
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (taskError) {
      logStep("Error creating checkout task", taskError);
    }

    // Create alert for checkout initiated
    await supabaseClient.from('bot_alerts').insert({
      user_id: user.id,
      monitor_id: monitorId,
      alert_type: 'checkout_initiated',
      message: `💳 Checkout initiated for ${monitor.product_name} - $${(checkoutAmount/100).toFixed(2)}`
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      task_id: task?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    logStep("Error in bot checkout", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});