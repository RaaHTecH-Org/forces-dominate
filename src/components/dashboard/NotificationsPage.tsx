import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Package, Heart, DollarSign, Star, Trash2, TrendingDown, ShoppingCart, CreditCard } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BotAlert {
  id: string;
  alert_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  bot_monitors: {
    product_name: string;
    product_url: string;
  } | null;
}

export function NotificationsPage() {
  const { user } = useAuth();
  const [botAlerts, setBotAlerts] = useState<BotAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBotAlerts();
    }
  }, [user]);

  const loadBotAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_alerts')
        .select(`
          *,
          bot_monitors (
            product_name,
            product_url
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBotAlerts(data || []);
    } catch (error) {
      console.error('Error loading bot alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markBotAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('bot_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setBotAlerts(prev => prev.map(alert =>
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Error marking bot alert as read:', error);
    }
  };

  // Demo notifications for other features
  const demoNotifications = [
    {
      id: 1,
      title: "Order Shipped",
      message: "Your Jordan 4 Black Cat has been shipped and is on the way!",
      time: "2 hours ago",
      type: "order",
      read: false
    },
    {
      id: 2,
      title: "New Review Request",
      message: "How was your experience with Air Force 1 Triple Black?",
      time: "2 days ago",
      type: "review",
      read: true
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order": return <Package className="w-4 h-4 text-blue-500" />;
      case "wishlist": return <Heart className="w-4 h-4 text-red-500" />;
      case "price": return <DollarSign className="w-4 h-4 text-green-500" />;
      case "review": return <Star className="w-4 h-4 text-yellow-500" />;
      case "loyalty": return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getBotAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'price_drop':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'back_in_stock':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'size_available':
        return <Package className="w-4 h-4 text-purple-600" />;
      case 'atc_success':
        return <ShoppingCart className="w-4 h-4 text-orange-600" />;
      case 'checkout_initiated':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const totalUnread = botAlerts.filter(a => !a.is_read).length + demoNotifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage your notification preferences and history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Mark All Read</Button>
          <Button variant="outline">Clear All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notification Settings */}
        <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Choose what you want to be notified about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Notifications
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-orders" className="text-sm">Order Updates</Label>
                  <Switch id="email-orders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-wishlist" className="text-sm">Wishlist Alerts</Label>
                  <Switch id="email-wishlist" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-price" className="text-sm">Price Drops</Label>
                  <Switch id="email-price" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-marketing" className="text-sm">Marketing</Label>
                  <Switch id="email-marketing" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Push Notifications
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-orders" className="text-sm">Order Updates</Label>
                  <Switch id="push-orders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-wishlist" className="text-sm">Wishlist Alerts</Label>
                  <Switch id="push-wishlist" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-price" className="text-sm">Price Drops</Label>
                  <Switch id="push-price" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-loyalty" className="text-sm">Loyalty Updates</Label>
                  <Switch id="push-loyalty" defaultChecked />
                </div>
              </div>
            </div>

            <Button className="w-full">Save Preferences</Button>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Your latest updates and alerts</CardDescription>
              </div>
              <Badge variant="secondary">
                {totalUnread} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">Loading notifications...</div>
              ) : (
                <>
                  {/* Bot Alerts */}
                  {botAlerts.map((alert) => (
                    <div 
                      key={`bot-${alert.id}`} 
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
                        alert.is_read 
                          ? 'border-border/30 bg-background/30' 
                          : 'border-primary/30 bg-primary/5'
                      }`}
                    >
                      <div className="mt-1">
                        {getBotAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Target Bot: {alert.alert_type.replace('_', ' ')}</h4>
                          {!alert.is_read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <Badge variant="outline" className="text-xs">BOT</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{alert.bot_monitors?.product_name || 'Unknown Product'}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(alert.created_at))} ago</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!alert.is_read && (
                          <Button variant="ghost" size="sm" onClick={() => markBotAlertAsRead(alert.id)}>
                            Mark Read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Demo Notifications */}
                  {demoNotifications.map((notification) => (
                    <div 
                      key={`demo-${notification.id}`} 
                      className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
                        notification.read 
                          ? 'border-border/30 bg-background/30' 
                          : 'border-primary/30 bg-primary/5'
                      }`}
                    >
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <div className="flex gap-1">
                        {!notification.read && (
                          <Button variant="ghost" size="sm">Mark Read</Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {botAlerts.length === 0 && demoNotifications.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No notifications yet</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Summary */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Notification Summary</CardTitle>
          <CardDescription>Overview of your notification activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{botAlerts.filter(a => a.alert_type === 'price_drop').length}</div>
              <div className="text-sm text-muted-foreground">Price Drops</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{botAlerts.filter(a => a.alert_type === 'back_in_stock').length}</div>
              <div className="text-sm text-muted-foreground">Stock Alerts</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{botAlerts.filter(a => a.alert_type === 'atc_success').length}</div>
              <div className="text-sm text-muted-foreground">ATC Success</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">{botAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Total Bot Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}