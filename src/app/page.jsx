// import Home from "@/components/Home";
import HomePage from "@/components/HomePage";
// import Cursor from "@/components/stickyCursor";
// import HomePage from "@/components/HomePage";
// import PixelCursor from "@/components/pixelCursor/PixelCursor";
import { supabase } from "../lib/supabase"; 

export default async function Page() {
  const { data: products } = await supabase.from('products').select('*');
  return (
    <div >
      <HomePage initialProducts={products || []} />
      {/* <Cursor/> */}
    </div>
  );
}