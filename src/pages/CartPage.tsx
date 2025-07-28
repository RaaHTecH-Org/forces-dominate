import { useCart } from "@/contexts/CartContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, item) => sum + Number(item.price.replace(/[^\d.]/g, "")) * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty.</p>
              <Button asChild>
                <Link to="/">Browse Sneakers</Link>
              </Button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-border mb-6">
                {cart.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded bg-muted object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.brand} • {item.colorway}</div>
                      <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                    </div>
                    <div className="font-bold">{item.price}</div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mb-4">
                <div className="font-semibold">Total</div>
                <div className="font-bold text-lg">${total.toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Checkout</Button>
                <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
