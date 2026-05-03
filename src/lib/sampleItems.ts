import { WardrobeItem } from "@/types";

// Sample wardrobe items using picsum with clothing-like colored rectangles
// In a real app these would be actual clothing photos
export const SAMPLE_ITEMS: Omit<WardrobeItem, "processedSrc" | "isProcessing">[] = [
  {
    id: "w1",
    name: "White Oxford Shirt",
    category: "tops",
    originalSrc: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80",
  },
  {
    id: "w2",
    name: "Black Turtleneck",
    category: "tops",
    originalSrc: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80",
  },
  {
    id: "w3",
    name: "Denim Jacket",
    category: "outerwear",
    originalSrc: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80",
  },
  {
    id: "w4",
    name: "Slim Chinos",
    category: "bottoms",
    originalSrc: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80",
  },
  {
    id: "w5",
    name: "Black Trousers",
    category: "bottoms",
    originalSrc: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80",
  },
  {
    id: "w6",
    name: "White Sneakers",
    category: "shoes",
    originalSrc: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  },
  {
    id: "w7",
    name: "Leather Loafers",
    category: "shoes",
    originalSrc: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80",
  },
  {
    id: "w8",
    name: "Silk Scarf",
    category: "accessories",
    originalSrc: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80",
  },
  {
    id: "w9",
    name: "Leather Belt",
    category: "accessories",
    originalSrc: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
  },
  {
    id: "w10",
    name: "Wool Coat",
    category: "outerwear",
    originalSrc: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80",
  },
  {
    id: "w11",
    name: "Striped Tee",
    category: "tops",
    originalSrc: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80",
  },
  {
    id: "w12",
    name: "Floral Dress",
    category: "tops",
    originalSrc: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
  },
];
