export interface WardrobeItem {
  id: string;
  name: string;
  category: "tops" | "bottoms" | "shoes" | "accessories" | "outerwear";
  originalSrc: string;
  processedSrc: string | null;
  isProcessing: boolean;
}

export interface CanvasItem {
  id: string;
  wardrobeItemId: string;
  src: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export interface RecommendedItem {
  name: string;
  wardrobeItem: WardrobeItem | null; // null if not in wardrobe yet
}

export interface SavedOutfit {
  id: string;
  name: string;
  items: CanvasItem[];
  thumbnail: string;
  createdAt: number;
}
