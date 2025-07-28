import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

/**
 * Inserts a new checkout row into the "checkouts" table.
 * @param product string - The product name
 * @param store string - The store name
 * @param user_id string | undefined - The user id (optional, will use Supabase auth if not provided)
 */
export async function addCheckout({ product, store, user_id }: { product: string; store: string; user_id?: string }) {
  let uid = user_id;
  if (!uid) {
    const { data: { user }, error: userError } = await (supabase as any).auth.getUser();
    if (userError) {
      toast({
        title: "Auth Error",
        description: "Could not get user information.",
        variant: "destructive",
      });
      return;
    }
    uid = user?.id;
  }

  const { error } = await (supabase as any)
    .from("checkouts")
    .insert([{ product, store, user_id: uid }]);

  if (error) {
    toast({
      title: "Checkout Failed",
      description: error.message || "Could not add checkout.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Checkout Added",
      description: `Checkout for ${product} at ${store} was added successfully!`,
      variant: "default",
    });
  }
}
