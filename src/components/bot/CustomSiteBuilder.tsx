import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, TestTube, Save, Globe, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SiteConfig {
  id?: string;
  name: string;
  base_url: string;
  site_type: string;
  selectors: {
    title?: string;
    price?: string;
    stock?: string;
    sizes?: string;
    description?: string;
    images?: string;
    searchResults?: string;
    link?: string;
    image?: string;
  };
  rate_limit_ms: number;
  status: string;
}

interface CustomSiteBuilderProps {
  onSiteAdded: () => void;
}

export const CustomSiteBuilder: React.FC<CustomSiteBuilderProps> = ({ onSiteAdded }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBuilding, setIsBuilding] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  
  const [config, setConfig] = useState<SiteConfig>({
    name: '',
    base_url: '',
    site_type: 'ecommerce',
    selectors: {
      title: 'h1, [class*="title"], [class*="name"]',
      price: '[class*="price"], .price, [data-testid*="price"]',
      stock: '[class*="stock"], [class*="availability"], [class*="inventory"]',
      sizes: '[class*="size"], [class*="variant"]',
      description: '[class*="description"], [class*="detail"]',
      images: 'img[src*="product"], [class*="image"] img',
      searchResults: '[class*="product"], [class*="item"], [class*="result"]',
      link: 'a',
      image: 'img',
    },
    rate_limit_ms: 2000,
    status: 'active',
  });

  const handleConfigChange = (field: keyof SiteConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectorChange = (selector: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      selectors: { ...prev.selectors, [selector]: value }
    }));
  };

  const testSelectors = async () => {
    if (!testUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test URL",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('custom-crawler', {
        body: {
          action: 'test_selectors',
          url: testUrl,
          selectors: config.selectors,
        }
      });

      if (error) throw error;

      setTestResults(data);
      
      toast({
        title: "Test Complete",
        description: "Selector test results are ready",
      });

    } catch (error) {
      console.error('Error testing selectors:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test selectors. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveSiteConfig = async () => {
    if (!config.name.trim() || !config.base_url.trim()) {
      toast({
        title: "Error",
        description: "Please fill in name and base URL",
        variant: "destructive",
      });
      return;
    }

    setIsBuilding(true);

    try {
      const { data, error } = await supabase
        .from('bot_sites')
        .insert({
          name: config.name,
          base_url: config.base_url,
          site_type: config.site_type,
          selectors: config.selectors,
          rate_limit_ms: config.rate_limit_ms,
          status: config.status,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Site configuration saved: ${config.name}`,
      });

      // Reset form
      setConfig({
        name: '',
        base_url: '',
        site_type: 'ecommerce',
        selectors: {
          title: 'h1, [class*="title"], [class*="name"]',
          price: '[class*="price"], .price, [data-testid*="price"]',
          stock: '[class*="stock"], [class*="availability"], [class*="inventory"]',
          sizes: '[class*="size"], [class*="variant"]',
          description: '[class*="description"], [class*="detail"]',
          images: 'img[src*="product"], [class*="image"] img',
          searchResults: '[class*="product"], [class*="item"], [class*="result"]',
          link: 'a',
          image: 'img',
        },
        rate_limit_ms: 2000,
        status: 'active',
      });

      setTestUrl('');
      setTestResults(null);
      onSiteAdded();

    } catch (error) {
      console.error('Error saving site config:', error);
      toast({
        title: "Error",
        description: "Failed to save site configuration",
        variant: "destructive",
      });
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Custom Site
          </CardTitle>
          <CardDescription>
            Configure a new e-commerce site for monitoring. Define CSS selectors to extract product information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                placeholder="e.g., Nike Store"
                value={config.name}
                onChange={(e) => handleConfigChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseUrl">Base URL</Label>
              <Input
                id="baseUrl"
                placeholder="https://www.nike.com"
                value={config.base_url}
                onChange={(e) => handleConfigChange('base_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteType">Site Type</Label>
              <Select value={config.site_type} onValueChange={(value) => handleConfigChange('site_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="sneakers">Sneakers</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Rate Limit (ms)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={config.rate_limit_ms}
                onChange={(e) => handleConfigChange('rate_limit_ms', parseInt(e.target.value) || 2000)}
              />
            </div>
          </div>

          {/* CSS Selectors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">CSS Selectors</h3>
            <p className="text-sm text-muted-foreground">
              Define CSS selectors to extract product information. Use browser dev tools to find the right selectors.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(config.selectors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Input
                    id={key}
                    placeholder={`CSS selector for ${key}`}
                    value={value || ''}
                    onChange={(e) => handleSelectorChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Test Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Configuration</h3>
            <div className="flex gap-4">
              <Input
                placeholder="Enter a product URL to test selectors"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={testSelectors} disabled={isTesting} variant="outline">
                <TestTube className="h-4 w-4 mr-2" />
                {isTesting ? 'Testing...' : 'Test'}
              </Button>
            </div>

            {/* Test Results */}
            {testResults && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs overflow-auto max-h-60 whitespace-pre-wrap">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={saveSiteConfig} disabled={isBuilding} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isBuilding ? 'Saving...' : 'Save Site Configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};