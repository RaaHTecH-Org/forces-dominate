import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Search, Trash2, Package } from "lucide-react";

export function WishlistPage() {
  const wishlistItems = [
    {
      id: 1,
      name: "Travis Scott x Jordan 1 Low",
      price: "$1,200",
      originalPrice: "$1,500",
      image: "/placeholder.svg",
      inStock: false,
      brand: "Jordan",
      colorway: "Olive/Black/Sail",
      releaseDate: "2019"
    },
    {
      id: 2,
      name: "Off-White x Nike Air Force 1 Black",
      price: "$2,800",
      originalPrice: "$3,200", 
      image: "/placeholder.svg",
      inStock: true,
      brand: "Nike",
      colorway: "Black/White/Cone",
      releaseDate: "2018"
    },
    {
      id: 3,
      name: "Fragment x Travis Scott x Jordan 1 High",
      price: "$4,500",
      originalPrice: "$5,000",
      image: "/placeholder.svg",
      inStock: false,
      brand: "Jordan",
      colorway: "Military Blue/Black/White",
      releaseDate: "2021"
    },
    {
      id: 4,
      name: "Dior x Jordan 1 High",
      price: "$8,000",
      originalPrice: "$10,000",
      image: "/placeholder.svg",
      inStock: true,
      brand: "Jordan",
      colorway: "Grey/White",
      releaseDate: "2020"
    },
    {
      id: 5,
      name: "Fear of God x Nike Air Fear of God 1",
      price: "$800",
      originalPrice: "$1,000",
      image: "/placeholder.svg",
      inStock: true,
      brand: "Nike",
      colorway: "Triple Black",
      releaseDate: "2018"
    },
    {
      id: 6,
      name: "Sacai x Nike VaporWaffle Black",
      price: "$350",
      originalPrice: "$450",
      image: "/placeholder.svg",
      inStock: false,
      brand: "Nike",
      colorway: "Black/White",
      releaseDate: "2019"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wishlist</h1>
          <p className="text-muted-foreground">Your saved sneakers and grails</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search wishlist..." className="pl-10" />
          </div>
          <Button variant="outline">Clear All</Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="gap-1">
            <Heart className="w-3 h-3" />
            {wishlistItems.length} items
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Package className="w-3 h-3" />
            {wishlistItems.filter(item => item.inStock).length} in stock
          </Badge>
        </div>
        <Button>Move All to Cart</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="border-border/50 bg-card/50 backdrop-blur-sm group hover:shadow-lg transition-all duration-200">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  {!item.inStock && (
                    <Badge variant="secondary" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold line-clamp-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.brand} • {item.releaseDate}</p>
                <p className="text-xs text-muted-foreground">{item.colorway}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{item.price}</span>
                {item.originalPrice !== item.price && (
                  <span className="text-sm text-muted-foreground line-through">{item.originalPrice}</span>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                {item.inStock ? (
                  <Button className="flex-1 gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                ) : (
                  <Button variant="outline" className="flex-1" disabled>
                    Notify When Available
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {wishlistItems.length === 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-center mb-6">
              Start adding sneakers you love to keep track of them and get notified about price drops.
            </p>
            <Button>Browse Sneakers</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}