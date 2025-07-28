import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Plus, Download, Calendar, DollarSign, Receipt } from "lucide-react";

export function BillingPage() {
  const paymentMethods = [
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiry: "12/26",
      isDefault: true
    },
    {
      id: 2,
      type: "Mastercard", 
      last4: "8888",
      expiry: "08/25",
      isDefault: false
    }
  ];

  const invoices = [
    {
      id: "INV-001",
      amount: "$120.00",
      date: "Jan 15, 2024",
      status: "Paid",
      description: "Air Force 1 Triple Black"
    },
    {
      id: "INV-002",
      amount: "$200.00", 
      date: "Jan 20, 2024",
      status: "Paid",
      description: "Jordan 4 Black Cat"
    },
    {
      id: "INV-003",
      amount: "$110.00",
      date: "Jan 22, 2024", 
      status: "Pending",
      description: "Dunk Low Black/White"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your payment methods and billing history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 bg-muted rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{method.type} •••• {method.last4}</span>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Billing Info */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Update your billing address and details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billingName">Full Name</Label>
              <Input id="billingName" defaultValue="Black Force" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Email</Label>
              <Input id="billingEmail" type="email" defaultValue="blackforce@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Address</Label>
              <Input id="billingAddress" defaultValue="123 Force Street" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingCity">City</Label>
                <Input id="billingCity" defaultValue="Black City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingZip">ZIP Code</Label>
                <Input id="billingZip" defaultValue="12345" />
              </div>
            </div>

            <Button className="w-full">Update Billing Info</Button>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Billing History
              </CardTitle>
              <CardDescription>Download invoices and view payment history</CardDescription>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-background/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{invoice.id}</span>
                      <Badge 
                        variant={invoice.status === "Paid" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {invoice.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    <p className="text-xs text-muted-foreground">{invoice.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{invoice.amount}</span>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending Summary */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Spending Summary
          </CardTitle>
          <CardDescription>Your purchase analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">$1,240</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">$206</div>
              <div className="text-sm text-muted-foreground">Average Order</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-primary">6</div>
              <div className="text-sm text-muted-foreground">Orders This Month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}