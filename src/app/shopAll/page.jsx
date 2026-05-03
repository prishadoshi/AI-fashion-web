// This is a Server Component by default
import { supabase } from "../../lib/supabase"; 
import ShopClient from "./ShopAllClient";

export default async function Page() {
  const { data: products } = await supabase.from('products').select('*');

  return <ShopClient initialProducts={products || []} />;
}