import { supabase } from "../../../lib/supabase";
import ProductDetails from "./ProductDetails";

export default async function ProductPage({ params }) {
  const resolvedParams = await params;
  const rawId = resolvedParams.id;
  
  // Clean the ID (converts "Matcha%20Polo" to "Matcha Polo")
  const decodedId = decodeURIComponent(rawId);
  console.log(resolvedParams);
  
 let { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', decodedId) 
    .single();

  // finding by title for AI recommendated products
  if (!product) {
    const { data: productByTitle } = await supabase
      .from('products')
      .select('*')
      .eq('title', decodedId) 
      .single();
    product = productByTitle;
  }

  if (!product) {
    return (
      <div className="error-container">
        <h1>Product not found</h1>
        <p>We couldn't find "{decodedId}" in our database.</p>
      </div>
    );
  }

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('id, images, title') 
    .eq('category', product.category) 
    .neq('id', product.id) 
    .limit(3);

  return (
    <ProductDetails 
      product={product} 
      relatedProducts={relatedProducts || []} 
    />
  );
}