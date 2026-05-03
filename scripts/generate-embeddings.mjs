import { pipeline } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') }); 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function populateEmbeddings() {
  console.log("Loading AI Model (all-MiniLM-L6-v2)...");
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, description, category'); 
  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  console.log(`Found ${products.length} products. Starting vectorization...`);
  for (const product of products) {
    // COMBINE TITLE, CATEGORY, AND DESCRIPTION
    const textToEmbed = `Product: ${product.title}. Category: ${product.category || "General"}. Description: ${product.description || ""}`;
    
    console.log(`Vectorizing: ${product.title} [${product.category || 'No Category'}]`);

    const output = await extractor(textToEmbed, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    const { error: updateError } = await supabase
      .from('products')
      .update({ embedding: embedding })
      .eq('id', product.id);

    if (updateError) {
      console.error(` Failed to update ID ${product.id}:`, updateError.message);
    }
  }
  console.log("🎉 All done! Your embeddings are now enriched with categories.");
}

populateEmbeddings();