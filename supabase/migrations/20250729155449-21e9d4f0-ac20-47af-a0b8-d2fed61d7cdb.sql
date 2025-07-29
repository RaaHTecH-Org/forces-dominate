-- Insert some default site configurations for popular sneaker/fashion sites
INSERT INTO public.bot_sites (name, base_url, site_type, selectors, rate_limit_ms, status) VALUES
(
  'StockX',
  'https://stockx.com',
  'marketplace',
  '{
    "title": ".product-details h1, [data-testid=\"product-name\"]",
    "price": ".sale-value, [data-testid=\"current-price\"]",
    "stock": ".product-status, [data-testid=\"stock-status\"]",
    "image": ".product-photo img, [data-testid=\"product-image\"]",
    "description": ".product-description, [data-testid=\"product-description\"]",
    "sizes": ".size-selector button, [data-testid=\"size-option\"]",
    "search_container": ".browse-results, [data-testid=\"search-results\"]",
    "search_item": ".tile, [data-testid=\"search-result-item\"]",
    "search_title": ".tile-name, [data-testid=\"item-name\"]",
    "search_price": ".tile-price, [data-testid=\"item-price\"]",
    "search_link": "a[href*=\"/buy/\"], [data-testid=\"item-link\"]",
    "search_image": ".tile-image img, [data-testid=\"item-image\"]"
  }',
  1000,
  'active'
),
(
  'GOAT',
  'https://goat.com',
  'marketplace',
  '{
    "title": ".product-name, h1[data-testid=\"product-name\"]",
    "price": ".product-price, [data-testid=\"product-price\"]",
    "stock": ".availability, [data-testid=\"availability\"]",
    "image": ".product-image img, [data-testid=\"product-image\"]",
    "description": ".product-details, [data-testid=\"product-details\"]",
    "sizes": ".size-button, [data-testid=\"size-option\"]",
    "search_container": ".product-grid, [data-testid=\"search-results\"]",
    "search_item": ".product-card, [data-testid=\"product-item\"]",
    "search_title": ".product-title, [data-testid=\"product-title\"]",
    "search_price": ".product-price, [data-testid=\"product-price\"]",
    "search_link": "a[href*=\"/sneakers/\"], [data-testid=\"product-link\"]",
    "search_image": ".product-image img, [data-testid=\"product-image\"]"
  }',
  1200,
  'active'
),
(
  'Nike',
  'https://nike.com',
  'retail',
  '{
    "title": ".product-title, h1[data-testid=\"product-title\"]",
    "price": ".product-price, [data-testid=\"product-price\"]",
    "stock": ".product-availability, [data-testid=\"availability\"]",
    "image": ".product-photo img, [data-testid=\"product-image\"]",
    "description": ".description, [data-testid=\"product-description\"]",
    "sizes": ".size-chart button, [data-testid=\"size-button\"]",
    "search_container": ".product-grid, [data-testid=\"search-results\"]",
    "search_item": ".product-card, [data-testid=\"product-card\"]",
    "search_title": ".product-card__title, [data-testid=\"product-name\"]",
    "search_price": ".product-price, [data-testid=\"price\"]",
    "search_link": "a[href*=\"/product/\"], [data-testid=\"product-link\"]",
    "search_image": ".product-card__hero-image img, [data-testid=\"product-image\"]"
  }',
  800,
  'active'
),
(
  'Adidas',
  'https://adidas.com',
  'retail',
  '{
    "title": ".name, h1[data-testid=\"product-name\"]",
    "price": ".price, [data-testid=\"product-price\"]",
    "stock": ".availability-msg, [data-testid=\"stock-message\"]",
    "image": ".view-item img, [data-testid=\"product-image\"]",
    "description": ".product-description, [data-testid=\"description\"]",
    "sizes": ".size-dropdown option, [data-testid=\"size-option\"]",
    "search_container": ".plp-products, [data-testid=\"product-list\"]",
    "search_item": ".plp-product, [data-testid=\"product-item\"]",
    "search_title": ".plp-product__name, [data-testid=\"product-name\"]",
    "search_price": ".plp-product__price, [data-testid=\"product-price\"]",
    "search_link": "a[href*=\"/product/\"], [data-testid=\"product-link\"]",
    "search_image": ".plp-product__image img, [data-testid=\"product-image\"]"
  }',
  800,
  'active'
);

-- Update bot_sites table to allow user creation of custom sites
ALTER TABLE public.bot_sites ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create policy to allow users to create custom sites
DROP POLICY IF EXISTS "Users can create custom sites" ON public.bot_sites;
CREATE POLICY "Users can create custom sites" 
ON public.bot_sites 
FOR INSERT 
WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- Allow users to view all sites (both default and custom)
DROP POLICY IF EXISTS "Public can view bot sites" ON public.bot_sites;
CREATE POLICY "Public can view bot sites" 
ON public.bot_sites 
FOR SELECT 
USING (true);

-- Allow users to update their own custom sites
CREATE POLICY "Users can update their custom sites" 
ON public.bot_sites 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Allow users to delete their own custom sites
CREATE POLICY "Users can delete their custom sites" 
ON public.bot_sites 
FOR DELETE 
USING (auth.uid() = created_by);