import { supabase } from "../../../lib/supabase";
import ProductCard from "@/components/ProductCard";

// app/category/[slug]/page.jsx

export default async function CategoryPage({ params }) {
  // 1. UNWRAP the params Promise
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 2. Fetch from Supabase using the unwrapped slug
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .ilike("category", slug);

  console.log(products);

  if (error) return <div>Error loading products.</div>;

  return (
    <div className="category-container">
      <div className="category-title-section">
        <h1 className="category-title">{slug}</h1>
      </div>

      <div className="products-row">
        <div className="contain8">
          <ul className="product-cards">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <p>No products found in this category.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
