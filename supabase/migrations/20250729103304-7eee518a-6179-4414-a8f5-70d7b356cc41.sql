-- Create bot_sites table for supported e-commerce sites
CREATE TABLE public.bot_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  site_type TEXT NOT NULL, -- 'sneaker', 'retail', 'marketplace', 'fashion'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'maintenance', 'disabled'
  selectors JSONB, -- CSS selectors for crawling
  rate_limit_ms INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_monitors table for tracking items across sites
CREATE TABLE public.bot_monitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.bot_sites(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_url TEXT,
  target_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  stock_status TEXT DEFAULT 'unknown', -- 'in_stock', 'out_of_stock', 'limited', 'unknown'
  size_preference TEXT[],
  keywords TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_alerts table for notifications
CREATE TABLE public.bot_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monitor_id UUID NOT NULL REFERENCES public.bot_monitors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'price_drop', 'back_in_stock', 'new_product', 'size_available'
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_tasks table for automated actions
CREATE TABLE public.bot_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monitor_id UUID NOT NULL REFERENCES public.bot_monitors(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- 'atc', 'checkout', 'monitor', 'search'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  config JSONB, -- Task-specific configuration
  result JSONB, -- Task results/logs
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bot_search_results table for search tracking
CREATE TABLE public.bot_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id UUID NOT NULL REFERENCES public.bot_sites(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  results JSONB, -- Search results data
  total_found INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bot_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_search_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bot_sites (public read)
CREATE POLICY "Public can view bot sites" ON public.bot_sites
FOR SELECT USING (true);

-- RLS Policies for bot_monitors
CREATE POLICY "Users can view their own monitors" ON public.bot_monitors
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own monitors" ON public.bot_monitors
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monitors" ON public.bot_monitors
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own monitors" ON public.bot_monitors
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for bot_alerts
CREATE POLICY "Users can view their own alerts" ON public.bot_alerts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" ON public.bot_alerts
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for bot_tasks
CREATE POLICY "Users can view their own tasks" ON public.bot_tasks
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" ON public.bot_tasks
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON public.bot_tasks
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for bot_search_results
CREATE POLICY "Users can view their own search results" ON public.bot_search_results
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search results" ON public.bot_search_results
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_bot_sites_updated_at
BEFORE UPDATE ON public.bot_sites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_monitors_updated_at
BEFORE UPDATE ON public.bot_monitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_tasks_updated_at
BEFORE UPDATE ON public.bot_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert popular e-commerce sites
INSERT INTO public.bot_sites (name, base_url, site_type, selectors) VALUES
('Nike', 'https://www.nike.com', 'sneaker', '{"title": ".pdp_product_title", "price": ".product-price", "stock": ".availability-status"}'),
('Adidas', 'https://www.adidas.com', 'sneaker', '{"title": ".name", "price": ".price", "stock": ".availability"}'),
('StockX', 'https://stockx.com', 'marketplace', '{"title": ".product-name", "price": ".bid-ask-price", "stock": ".inventory-status"}'),
('Supreme', 'https://www.supremenewyork.com', 'fashion', '{"title": ".product-title", "price": ".price", "stock": ".sold-out"}'),
('Best Buy', 'https://www.bestbuy.com', 'retail', '{"title": ".product-title", "price": ".current-price", "stock": ".fulfillment-add-to-cart-button"}'),
('Target', 'https://www.target.com', 'retail', '{"title": "[data-test=\"product-title\"]", "price": "[data-test=\"product-price\"]", "stock": "[data-test=\"shipItButton\"]"}'),
('Walmart', 'https://www.walmart.com', 'retail', '{"title": "[data-automation-id=\"product-title\"]", "price": "[data-automation-id=\"product-price\"]", "stock": "[data-automation-id=\"add-to-cart-button\"]"}'),
('Amazon', 'https://www.amazon.com', 'marketplace', '{"title": "#productTitle", "price": ".a-price-whole", "stock": "#add-to-cart-button"}'),
('Footlocker', 'https://www.footlocker.com', 'sneaker', '{"title": ".ProductName", "price": ".ProductPrice", "stock": ".ProductForm-addToCart"}'),
('Finish Line', 'https://www.finishline.com', 'sneaker', '{"title": ".product-name", "price": ".price", "stock": ".add-to-cart-btn"}'),
('JD Sports', 'https://www.jdsports.com', 'sneaker', '{"title": ".itemTitle", "price": ".pri", "stock": ".btn-addToBag"}'),
('GOAT', 'https://www.goat.com', 'marketplace', '{"title": ".product-name", "price": ".price", "stock": ".add-to-cart"}'),
('SSENSE', 'https://www.ssense.com', 'fashion', '{"title": ".product-name", "price": ".price", "stock": ".add-to-bag"}'),
('End Clothing', 'https://www.endclothing.com', 'fashion', '{"title": ".product_title", "price": ".price", "stock": ".add-to-bag"}'),
('Size?', 'https://www.size.co.uk', 'sneaker', '{"title": ".product-title", "price": ".product-price", "stock": ".product-form__cart-submit"}');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_monitors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_tasks;