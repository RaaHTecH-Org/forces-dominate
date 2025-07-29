import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Monitor, ExternalLink, ShoppingCart, CreditCard, Trash2, Target, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BotMonitor {
  id: string;
  product_name: string;
  product_url: string;
  target_price: number;
  current_price: number;
  stock_status: string;
  size_preference: string[];
  is_active: boolean;
  last_checked: string;
  created_at: string;
  bot_sites: {
    name: string;
    site_type: string;
  };
}

interface BotMonitorListProps {
  onStatsUpdate: () => void;
}

export const BotMonitorList: React.FC<BotMonitorListProps> = ({ onStatsUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [monitors, setMonitors] = useState<BotMonitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMonitors();
    }
  }, [user]);

  const loadMonitors = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_monitors')
        .select(`
          *,
          bot_sites (
            name,
            site_type
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMonitors(data || []);
    } catch (error) {
      console.error('Error loading monitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMonitor = async (monitorId: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('bot-monitor', {
        body: {
          action: 'toggle_monitor',
          monitorId,
          isActive
        }
      });

      if (error) throw error;

      setMonitors(prev => prev.map(m => 
        m.id === monitorId ? { ...m, is_active: isActive } : m
      ));

      toast({
        title: isActive ? "Monitor Activated" : "Monitor Paused",
        description: `Monitor ${isActive ? 'activated' : 'paused'} successfully`,
      });

      onStatsUpdate();
    } catch (error) {
      console.error('Error toggling monitor:', error);
      toast({
        title: "Error",
        description: "Failed to update monitor",
        variant: "destructive",
      });
    }
  };

  const deleteMonitor = async (monitorId: string) => {
    try {
      const { error } = await supabase
        .from('bot_monitors')
        .delete()
        .eq('id', monitorId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setMonitors(prev => prev.filter(m => m.id !== monitorId));
      
      toast({
        title: "Monitor Deleted",
        description: "Monitor removed successfully",
      });

      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting monitor:', error);
      toast({
        title: "Error",
        description: "Failed to delete monitor",
        variant: "destructive",
      });
    }
  };

  const executeATC = async (monitor: BotMonitor) => {
    try {
      const size = monitor.size_preference?.[0] || null;
      
      const { data, error } = await supabase.functions.invoke('bot-atc', {
        body: {
          monitorId: monitor.id,
          size,
          quantity: 1,
          autoCheckout: false
        }
      });

      if (error) throw error;

      toast({
        title: "ATC Task Started",
        description: `Attempting to add ${monitor.product_name} to cart`,
      });

      onStatsUpdate();
    } catch (error) {
      console.error('Error executing ATC:', error);
      toast({
        title: "ATC Error",
        description: "Failed to start ATC task",
        variant: "destructive",
      });
    }
  };

  const executeCheckout = async (monitor: BotMonitor) => {
    try {
      const { data, error } = await supabase.functions.invoke('bot-checkout', {
        body: {
          monitorId: monitor.id,
          amount: monitor.current_price * 100 // Convert to cents
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }

      toast({
        title: "Checkout Started",
        description: `Opening checkout for ${monitor.product_name}`,
      });
    } catch (error) {
      console.error('Error executing checkout:', error);
      toast({
        title: "Checkout Error",
        description: "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading monitors...</div>;
  }

  if (monitors.length === 0) {
    return (
      <div className="text-center py-8">
        <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No monitors created yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Use the search tab to find products and create monitors.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {monitors.map((monitor) => (
        <Card key={monitor.id} className={`border-l-4 ${monitor.is_active ? 'border-l-green-500' : 'border-l-gray-300'}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold line-clamp-1">{monitor.product_name}</h3>
                  <Badge variant="outline">{monitor.bot_sites.name}</Badge>
                  <Badge variant={monitor.stock_status === 'in_stock' ? 'default' : 'secondary'}>
                    {monitor.stock_status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Target: ${monitor.target_price?.toFixed(2) || 'N/A'}
                  </div>
                  <div className="font-medium text-primary">
                    Current: ${monitor.current_price?.toFixed(2) || 'N/A'}
                  </div>
                  {monitor.size_preference?.length > 0 && (
                    <div>Size: {monitor.size_preference.join(', ')}</div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {monitor.last_checked 
                    ? `Last checked ${formatDistanceToNow(new Date(monitor.last_checked))} ago`
                    : 'Never checked'
                  }
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <div className="flex items-center gap-2">
                  <label htmlFor={`monitor-${monitor.id}`} className="text-sm">
                    {monitor.is_active ? 'Active' : 'Paused'}
                  </label>
                  <Switch
                    id={`monitor-${monitor.id}`}
                    checked={monitor.is_active}
                    onCheckedChange={(checked) => toggleMonitor(monitor.id, checked)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(monitor.product_url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Product
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => executeATC(monitor)}
                disabled={monitor.stock_status !== 'in_stock'}
              >
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </Button>

              <Button
                size="sm"
                onClick={() => executeCheckout(monitor)}
                disabled={monitor.stock_status !== 'in_stock'}
              >
                <CreditCard className="h-3 w-3 mr-1" />
                Quick Checkout
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Monitor</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this monitor? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMonitor(monitor.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};