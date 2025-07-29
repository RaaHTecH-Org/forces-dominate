import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, ExternalLink, Monitor } from 'lucide-react';

interface BotSite {
  id: string;
  name: string;
  base_url: string;
  site_type: string;
  status: string;
}

interface SearchResult {
  site: string;
  site_id: string;
  products: Array<{
    title: string;
    price: number;
    url: string;
    image?: string;
    stock: string;
  }>;
}

interface BotSiteSearchProps {
  onStatsUpdate: () => void;
}

export const BotSiteSearch: React.FC<BotSiteSearchProps> = ({ onStatsUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sites, setSites] = useState<BotSite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_sites')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setSites(data || []);
    } catch (error) {
      console.error('Error loading sites:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      const { data, error } = await supabase.functions.invoke('custom-crawler', {
        body: {
          action: 'search_products',
          keywords: searchQuery.split(' '),
          siteId: selectedSite === 'all' ? null : selectedSite
        }
      });

      if (error) throw error;

      // Transform results to match expected format
      const transformedResults = data.results ? [{
        site: 'All Sites',
        site_id: 'all',
        products: data.results
      }] : [];
      
      setSearchResults(transformedResults);
      
      toast({
        title: "Search Complete",
        description: `Found ${data.total_found || 0} products`,
      });

    } catch (error) {
      console.error('Error searching products:', error);
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const createMonitor = async (product: any, siteId: string) => {
    try {
      const targetPrice = prompt(`Enter target price for ${product.title} (current: $${product.price}):`);
      if (!targetPrice) return;

      const { data, error } = await supabase.functions.invoke('custom-crawler', {
        body: {
          action: 'crawl_product',
          siteId: siteId,
          url: product.url,
          targetPrice: parseFloat(targetPrice),
          keywords: searchQuery.split(' ')
        }
      });

      if (error) throw error;

      toast({
        title: "Monitor Created",
        description: `Now monitoring ${product.title}`,
      });

      onStatsUpdate();

    } catch (error) {
      console.error('Error creating monitor:', error);
      toast({
        title: "Error",
        description: "Failed to create monitor",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search for products (e.g., 'Jordan 1 High', 'MacBook Pro', 'Supreme Box Logo')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger>
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sites</SelectItem>
              {sites.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          <Search className="h-4 w-4 mr-2" />
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Supported Sites */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Supported Sites ({sites.length})</h3>
        <div className="flex flex-wrap gap-2">
          {sites.map((site) => (
            <Badge key={site.id} variant="secondary" className="flex items-center gap-1">
              {site.name}
              <span className="text-xs opacity-60">({site.site_type})</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">
            Search Results ({searchResults.reduce((sum, site) => sum + site.products.length, 0)} products)
          </h3>
          
          {searchResults.map((siteResult) => (
            <Card key={siteResult.site} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{siteResult.site}</span>
                  <Badge>{siteResult.products.length} results</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {siteResult.products.map((product, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium line-clamp-2 text-sm">{product.title}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-primary">
                              ${product.price?.toFixed(2) || 'N/A'}
                            </span>
                            <Badge variant={product.stock === 'in_stock' ? 'default' : 'secondary'}>
                              {product.stock || 'unknown'}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(product.url, '_blank')}
                              className="flex-1"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => createMonitor(product, siteResult.site_id)}
                              className="flex-1"
                            >
                              <Monitor className="h-3 w-3 mr-1" />
                              Monitor
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isSearching && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No results found. Try different keywords.</p>
        </div>
      )}
    </div>
  );
};