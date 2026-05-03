"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { WardrobeItem, CanvasItem, SavedOutfit } from "@/types";
import { supabase } from "@/lib/supabase";
import WardrobePanel from "@/components/WardrobePanel";
import OutfitCanvas from "@/components/OutfitCanvas";
import RecommendationsPanel from "@/components/RecommendationsPanel";
import { removeBackground, warmup } from "@/lib/bgRemoval";
import { v4 as uuid } from "uuid";

type Updater = (prev: WardrobeItem[]) => WardrobeItem[];

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
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [activeItemName, setActiveItemName] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const didInit = useRef(false);

  const updateItem = useCallback((id: string, processedSrc: string | null, isProcessing: boolean) => {
    setWardrobeItems(prev =>
      prev.map(i => i.id === id ? { ...i, processedSrc, isProcessing } : i)
    );
  }, []);

  // Load AI recommendations from /public
  useEffect(() => {
    fetch("/ai_recommendations.json")
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status + ": " + r.url);
        return r.json();
      })
      .then(setRecommendations)
      .catch(err => console.error("Recommendations load error:", err));
  }, []);

  // Fetch products from Supabase then kick off background removal
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const init = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const { data: products, error } = await supabase.from("products").select("*");
        if (error) throw error;

        const mappedItems: WardrobeItem[] = (products || []).map((p: Record<string, unknown>) => ({
          id: String(p.id),
          name: (p.title as string) || "Untitled Item",
          category: ((p.category as WardrobeItem["category"]) || "tops"),
          originalSrc: Array.isArray(p.images)
            ? (p.images as string[])[0]
            : ((p.image_url as string) ?? ""),
          processedSrc: null,
          isProcessing: true,
        }));

        setWardrobeItems(mappedItems);
        setIsLoading(false);
        await warmup();
        processQueue(mappedItems, updateItem, 3);
      } catch (err) {
        console.error("Error loading wardrobe:", err);
        setLoadError("Failed to load wardrobe. Please refresh and try again.");
        setIsLoading(false);
      }
    };

    init();
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

  const handleAddRecToCanvas = useCallback((wardrobeItem: WardrobeItem) => {
    const maxZ = canvasItems.reduce((max, i) => Math.max(max, i.zIndex), 0);
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

  if (isLoading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        height: "100vh", gap: 16,
        background: "var(--bg-primary)",
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          border: "2px solid var(--border)",
          borderTopColor: "var(--accent)",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading wardrobe…</p>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        height: "100vh", gap: 12,
        background: "var(--bg-primary)",
      }}>
        <p style={{ color: "#f87171", fontSize: 14 }}>{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 20px", borderRadius: 8,
            border: "1px solid var(--border)",
            background: "transparent", color: "var(--accent)",
            cursor: "pointer", fontSize: 13,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", borderBottom:"0.7px solid black" }}>
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
    </>
    
  );
}
