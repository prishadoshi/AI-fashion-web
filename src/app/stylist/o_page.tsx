"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { WardrobeItem, CanvasItem, SavedOutfit } from "@/types";
import { supabase } from "@/lib/supabase"; // Ensure this path is correct for your main project
import WardrobePanel from "@/components/WardrobePanel";
import OutfitCanvas from "@/components/OutfitCanvas";
import SavedOutfitsPanel from "@/components/SavedOutfitsPanel";
import { removeBackground, warmup } from "../../lib/bgRemoval";
import { v4 as uuid } from "uuid";

type Updater = (prev: WardrobeItem[]) => WardrobeItem[];

export default function Page() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const didInit = useRef(false);

  // Helper to update state when background removal finishes
  const updateItem = useCallback((id: string, processedSrc: string | null, isProcessing: boolean) => {
    setWardrobeItems(prev =>
      prev.map(i => i.id === id ? { ...i, processedSrc, isProcessing } : i)
    );
  }, []);

  // Background removal logic
  const processQueue = useCallback(async (
    items: WardrobeItem[],
    onUpdate: (id: string, processedSrc: string | null, isProcessing: boolean) => void,
    concurrency = 2 // Reduced to 2 for better stability on lower-end devices
  ) => {
    const queue = [...items];
    async function worker() {
      while (queue.length > 0) {
        const item = queue.shift()!;
        try {
          const processed = await removeBackground(item.originalSrc);
          onUpdate(item.id, processed, false);
        } catch {
          onUpdate(item.id, null, false);
        }
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => worker()));
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const initData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch from Supabase
        const { data: products, error } = await supabase.from('products').select('*');
        
        if (error) throw error;

        // 2. Map Supabase products to WardrobeItem format
        const mappedItems: WardrobeItem[] = (products || []).map(p => ({
          id: p.id.toString(),
          name: p.title || "Untitled Item",
          category: p.category || "tops", // Default category if null
          originalSrc: Array.isArray(p.images) ? p.images[0] : p.image_url,
          processedSrc: null,
          isProcessing: true,
        }));

        setWardrobeItems(mappedItems);

        // 3. Warm up the AI model
        await warmup();

        // 4. Start background removal for the fetched items
        processQueue(mappedItems, updateItem);
      } catch (err) {
        console.error("Error initializing data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [updateItem, processQueue]);

  const handleItemsChange = useCallback((updaterOrItems: WardrobeItem[] | Updater) => {
    if (typeof updaterOrItems === "function") {
      setWardrobeItems(prev => (updaterOrItems as Updater)(prev));
    } else {
      setWardrobeItems(updaterOrItems);
    }
  }, []);

  const handleNewItemsUploaded = useCallback((newItems: WardrobeItem[]) => {
    setWardrobeItems(prev => [...prev, ...newItems]);
    processQueue(newItems, updateItem, 3);
  }, [updateItem, processQueue]);

  const handleSave = useCallback((name: string, thumbnail: string) => {
    setSavedOutfits(prev => [{
      id: uuid(), name, items: canvasItems, thumbnail, createdAt: Date.now(),
    }, ...prev]);
  }, [canvasItems]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading Wardrobe...</p>
      </div>
    );
  }

  return (
    <div className="outfit-builder-section" style={{ display: "flex", overflow: "hidden" }}>
      <WardrobePanel
        items={wardrobeItems}
        onItemsChange={handleItemsChange}
        onNewItemsUploaded={handleNewItemsUploaded}
        onDragToCanvas={() => {}}
      />
      <OutfitCanvas
        canvasItems={canvasItems}
        onCanvasItemsChange={setCanvasItems}
        wardrobeItems={wardrobeItems}
        onSave={handleSave}
      />
      <SavedOutfitsPanel
        outfits={savedOutfits}
        onLoad={setCanvasItems}
        onDelete={id => setSavedOutfits(prev => prev.filter(o => o.id !== id))}
      />
    </div>
  );
}