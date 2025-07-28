import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  ShoppingBag,
  Heart,
  Star,
  Crown,
  Zap,
  Calendar,
  DollarSign
} from "lucide-react";

export function DashboardContent() {
  const stats = [
    {
      title: "Total Orders",
      value: "12",
      description: "3 pending delivery",
      icon: ShoppingBag,
      color: "text-blue-400"
    },
    {
      title: "Wishlist Items",
      value: "8",
      description: "2 back in stock",
      icon: Heart,
      color: "text-red-400"
    },
    {
      title: "Loyalty Points",
      value: "2,340",
      description: "Next reward at 3,000",
      icon: Star,
      color: "text-yellow-400"
    },
    {
      title: "Member Since",
      value: "2024",
      description: "Premium member",
      icon: Crown,
      color: "text-purple-400"
    }
  ];

  const recentOrders = [
    {
      id: "#BF001",
      item: "Air Force 1 Triple Black",
      status: "Delivered",
      date: "Jan 15, 2024",
      amount: "$120"
    },
    {
      id: "#BF002",
      item: "Jordan 4 Black Cat",
      status: "In Transit",
      date: "Jan 20, 2024",
      amount: "$200"
    },
    {
      id: "#BF003",
      item: "Dunk Low Black/White",
      status: "Processing",
      date: "Jan 22, 2024",
      amount: "$110"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Welcome back, Force!</h1>
        </div>
        <p className="text-muted-foreground">
          Ready to unleash that Black Air Force energy? Check out your latest activity below.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Recent Orders
            </CardTitle>
            <CardDescription>Your latest sneaker purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{order.item}</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={order.status === "Delivered" ? "default" : order.status === "In Transit" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {order.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{order.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{order.amount}</p>
                  <p className="text-xs text-muted-foreground">{order.id}</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Loyalty Progress */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              Loyalty Progress
            </CardTitle>
            <CardDescription>Earn rewards with every purchase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Points</span>
                <span className="font-semibold">2,340 / 3,000</span>
              </div>
              <Progress value={78} className="h-2" />
              <p className="text-xs text-muted-foreground">
                660 points until your next reward
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Available Rewards</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                  <div>
                    <p className="font-medium text-sm">10% Off Next Purchase</p>
                    <p className="text-xs text-muted-foreground">3,000 points</p>
                  </div>
                  <Badge variant="outline">Soon</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                  <div>
                    <p className="font-medium text-sm">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">1,500 points</p>
                  </div>
                  <Button size="sm" variant="outline">Claim</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your account and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Heart className="w-5 h-5" />
              <span>View Wishlist</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Calendar className="w-5 h-5" />
              <span>Track Orders</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <DollarSign className="w-5 h-5" />
              <span>Billing & Payments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}