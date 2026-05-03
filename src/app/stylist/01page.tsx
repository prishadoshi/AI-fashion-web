"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { WardrobeItem, CanvasItem, SavedOutfit } from "@/types";
import { SAMPLE_ITEMS } from "@/lib/sampleItems";
import WardrobePanel from "@/components/WardrobePanel";
import OutfitCanvas from "@/components/OutfitCanvas";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import { removeBackground, warmup } from "@/lib/bgRemoval";
import { v4 as uuid } from "uuid";

type Updater = (prev: WardrobeItem[]) => WardrobeItem[];

const initialItems: WardrobeItem[] = SAMPLE_ITEMS.map(i => ({
  ...i,
  processedSrc: null,
  isProcessing: true,
}));

async function processQueue(
  items: WardrobeItem[],
  onUpdate: (id: string, processedSrc: string | null, isProcessing: boolean) => void,
  concurrency = 3
) {
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
}

export default function Page() {
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>(initialItems);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [activeItemName, setActiveItemName] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string[]>>({});
  const didInit = useRef(false);

  // Load recommendations JSON
  useEffect(() => {
  fetch("/ai_recommendations.json")
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.url}`);
      return r.json();
    })
    .then(setRecommendations)
    .catch(err => console.error("Full error:", err)); // change warn to error
}, []);

  const updateItem = useCallback((id: string, processedSrc: string | null, isProcessing: boolean) => {
    setWardrobeItems(prev =>
      prev.map(i => i.id === id ? { ...i, processedSrc, isProcessing } : i)
    );
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    warmup().then(() => processQueue(initialItems, updateItem, 3));
  }, [updateItem]);

  const handleItemsChange = useCallback((updaterOrItems: WardrobeItem[] | Updater) => {
    setWardrobeItems(typeof updaterOrItems === "function"
      ? prev => (updaterOrItems as Updater)(prev)
      : updaterOrItems
    );
  }, []);

  const handleNewItemsUploaded = useCallback((newItems: WardrobeItem[]) => {
    setWardrobeItems(prev => [...prev, ...newItems]);
    processQueue(newItems, updateItem, 3);
  }, [updateItem]);

  const handleSave = useCallback((name: string, thumbnail: string) => {
    setSavedOutfits(prev => [{
      id: uuid(), name, items: canvasItems, thumbnail, createdAt: Date.now(),
    }, ...prev]);
  }, [canvasItems]);

  // "Add to canvas" from recommendations panel — place item at a smart default position
  const handleAddRecToCanvas = useCallback((wardrobeItem: WardrobeItem) => {
    const maxZ = canvasItems.reduce((max, i) => Math.max(max, i.zIndex), 0);
    // Offset each added item slightly so they don't stack perfectly
    const offset = (canvasItems.length % 4) * 30;
    const newItem: CanvasItem = {
      id: uuid(),
      wardrobeItemId: wardrobeItem.id,
      src: wardrobeItem.processedSrc || wardrobeItem.originalSrc,
      name: wardrobeItem.name,
      x: 160 + offset,
      y: 80 + offset,
      width: 160,
      height: 200,
      zIndex: maxZ + 1,
    };
    setCanvasItems(prev => [...prev, newItem]);
    setActiveItemName(wardrobeItem.name);
  }, [canvasItems]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
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
         onActiveItemChange={setActiveItemName}
      />
      <RecommendationsPanel
        activeItemName={activeItemName}
        recommendations={recommendations}
        wardrobeItems={wardrobeItems}
        canvasItems={canvasItems}
        onAddToCanvas={handleAddRecToCanvas}
        savedOutfits={savedOutfits}
        onLoadOutfit={setCanvasItems}
        onDeleteOutfit={id => setSavedOutfits(prev => prev.filter(o => o.id !== id))}
      />
    </div>
  );
}
