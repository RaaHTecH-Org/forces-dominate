import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Package, Heart, DollarSign, Star, Trash2 } from "lucide-react";

export function NotificationsPage() {
  const notifications = [
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
      title: "Wishlist Item Back in Stock",
      message: "Travis Scott x Jordan 1 Low is now available in your size.",
      time: "4 hours ago", 
      type: "wishlist",
      read: false
    },
    {
      id: 3,
      title: "Price Drop Alert",
      message: "Off-White x Nike Air Force 1 Black price dropped by $400!",
      time: "1 day ago",
      type: "price",
      read: true
    },
    {
      id: 4,
      title: "New Review Request",
      message: "How was your experience with Air Force 1 Triple Black?",
      time: "2 days ago",
      type: "review",
      read: true
    },
    {
      id: 5,
      title: "Loyalty Reward Earned",
      message: "You've earned 120 points from your recent purchase!",
      time: "3 days ago",
      type: "loyalty",
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
                {notifications.filter(n => !n.read).length} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
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
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Order Updates</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Wishlist Alerts</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-muted-foreground">Price Drops</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">3</div>
              <div className="text-sm text-muted-foreground">Loyalty Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}