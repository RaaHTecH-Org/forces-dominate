import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

export function OrdersPage() {
  const orders = [
    {
      id: "#BF001",
      item: "Air Force 1 Triple Black",
      image: "/placeholder.svg",
      status: "Delivered",
      date: "Jan 15, 2024",
      amount: "$120",
      tracking: "1Z999AA1234567890",
      size: "10.5",
      description: "Classic all-black Air Force 1 low-top sneakers"
    },
    {
      id: "#BF002", 
      item: "Jordan 4 Black Cat",
      image: "/placeholder.svg",
      status: "In Transit",
      date: "Jan 20, 2024",
      amount: "$200",
      tracking: "1Z999AA1234567891",
      size: "11",
      description: "Black Cat Jordan 4 retro basketball shoes"
    },
    {
      id: "#BF003",
      item: "Dunk Low Black/White",
      image: "/placeholder.svg", 
      status: "Processing",
      date: "Jan 22, 2024",
      amount: "$110",
      tracking: "Preparing shipment",
      size: "10",
      description: "Classic black and white Nike Dunk Low"
    },
    {
      id: "#BF004",
      item: "Air Max 90 Triple Black",
      image: "/placeholder.svg",
      status: "Cancelled",
      date: "Jan 18, 2024", 
      amount: "$130",
      tracking: "Order cancelled",
      size: "10.5",
      description: "Triple black Air Max 90 running shoes"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "In Transit": return <Truck className="w-4 h-4 text-blue-500" />;
      case "Processing": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Cancelled": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "default";
      case "In Transit": return "secondary"; 
      case "Processing": return "outline";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  const filterOrdersByStatus = (status: string) => {
    if (status === "all") return orders;
    return orders.filter(order => order.status.toLowerCase() === status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Track and manage your sneaker orders</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search orders..." className="pl-10" />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="in transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{order.item}</h3>
                        <Badge variant={getStatusColor(order.status) as any} className="gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Order {order.id}</span>
                        <span>Size {order.size}</span>
                        <span>{order.date}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between lg:justify-end gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{order.amount}</div>
                      <div className="text-xs text-muted-foreground">{order.tracking}</div>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "In Transit" && (
                        <Button variant="outline" size="sm">Track Package</Button>
                      )}
                      {order.status === "Delivered" && (
                        <Button variant="outline" size="sm">View Receipt</Button>
                      )}
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {["processing", "in transit", "delivered", "cancelled"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {filterOrdersByStatus(status).map((order) => (
              <Card key={order.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{order.item}</h3>
                          <Badge variant={getStatusColor(order.status) as any} className="gap-1">
                            {getStatusIcon(order.status)}
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Order {order.id}</span>
                          <span>Size {order.size}</span>
                          <span>{order.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between lg:justify-end gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{order.amount}</div>
                        <div className="text-xs text-muted-foreground">{order.tracking}</div>
                      </div>
                      <div className="flex gap-2">
                        {order.status === "In Transit" && (
                          <Button variant="outline" size="sm">Track Package</Button>
                        )}
                        {order.status === "Delivered" && (
                          <Button variant="outline" size="sm">View Receipt</Button>
                        )}
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}