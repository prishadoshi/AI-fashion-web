// app/api/search/route.js
import { pipeline } from '@xenova/transformers';
import { supabase } from "@/lib/supabase";

export async function POST(req) {
  try {
    const { query } = await req.json();

    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const output = await extractor(query, { pooling: 'mean', normalize: true });
    
    const embedding = Array.from(output.data);

    //Call your Supabase RPC
    const { data: products, error } = await supabase.rpc('match_products', {
      query_embedding: embedding, //exactly 384 numbers
      match_threshold: 0.18, 
      match_count: 20,
    });

    if (error) throw error;

    return Response.json(products);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}