import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CartButton() {
  const { cart } = useCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <Button variant="outline" size="icon" asChild>
      <Link to="/cart" aria-label="View cart">
        <div className="relative">
          <ShoppingCart className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-xs text-primary-foreground rounded-full px-1.5 py-0.5 min-w-[1.5rem] text-center">
              {count}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}
