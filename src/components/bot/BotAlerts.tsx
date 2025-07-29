import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Bell, BellOff, Trash2, CheckCheck, TrendingDown, Package, ShoppingCart, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BotAlert {
  id: string;
  alert_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  bot_monitors: {
    product_name: string;
    product_url: string;
  };
}

interface BotAlertsProps {
  onStatsUpdate: () => void;
}

const getAlertIcon = (alertType: string) => {
  switch (alertType) {
    case 'price_drop':
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    case 'back_in_stock':
      return <Package className="h-4 w-4 text-blue-600" />;
    case 'size_available':
      return <Package className="h-4 w-4 text-purple-600" />;
    case 'atc_success':
      return <ShoppingCart className="h-4 w-4 text-orange-600" />;
    case 'checkout_initiated':
      return <CreditCard className="h-4 w-4 text-indigo-600" />;
    default:
      return <Bell className="h-4 w-4 text-gray-600" />;
  }
};

const getAlertVariant = (alertType: string) => {
  switch (alertType) {
    case 'price_drop':
      return 'default';
    case 'back_in_stock':
      return 'secondary';
    case 'atc_success':
      return 'default';
    case 'checkout_initiated':
      return 'outline';
    default:
      return 'outline';
  }
};

export const BotAlerts: React.FC<BotAlertsProps> = ({ onStatsUpdate }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<BotAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user, filter]);

  const loadAlerts = async () => {
    try {
      let query = supabase
        .from('bot_alerts')
        .select(`
          *,
          bot_monitors (
            product_name,
            product_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('bot_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));

      onStatsUpdate();
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('bot_alerts')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
      
      toast({
        title: "All Alerts Read",
        description: "Marked all alerts as read",
      });

      onStatsUpdate();
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark alerts as read",
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('bot_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      onStatsUpdate();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  if (isLoading) {
    return <div className="text-center py-4">Loading alerts...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Filter and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Alerts ({alerts.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            <Bell className="h-3 w-3 mr-1" />
            Unread ({unreadCount})
          </Button>
        </div>
        
        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {filter === 'unread' ? 'No unread alerts' : 'No alerts yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Alerts will appear here when monitors detect changes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`border-l-4 ${
                alert.is_read 
                  ? 'border-l-gray-300 bg-muted/30' 
                  : 'border-l-primary bg-background'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getAlertVariant(alert.alert_type)}>
                          {alert.alert_type.replace('_', ' ')}
                        </Badge>
                        {!alert.is_read && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${alert.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{alert.bot_monitors?.product_name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(alert.created_at))} ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    {!alert.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(alert.id)}
                      >
                        <CheckCheck className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAlert(alert.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};