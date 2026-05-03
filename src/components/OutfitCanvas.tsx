"use client";
import { useState, useRef, useCallback } from "react";
import { CanvasItem, WardrobeItem } from "@/types";
import CanvasItemComponent from "./CanvasItem";
import { v4 as uuid } from "uuid";

interface Props {
  canvasItems: CanvasItem[];
  onCanvasItemsChange: (items: CanvasItem[]) => void;
  wardrobeItems: WardrobeItem[];
  onSave: (name: string, thumbnail: string) => void;
  onActiveItemChange: (name: string | null) => void;
}

export default function OutfitCanvas({ canvasItems, onCanvasItemsChange, wardrobeItems, onSave, onActiveItemChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [outfitName, setOutfitName] = useState("My Outfit");
  const canvasRef = useRef<HTMLDivElement>(null);

  // Central select — always syncs recommendations panel
  const selectItem = useCallback((id: string | null) => {
    setSelectedId(id);
    if (!id) {
      onActiveItemChange(null);
    } else {
      const found = canvasItems.find(i => i.id === id);
      if (found) onActiveItemChange(found.name);
    }
  }, [canvasItems, onActiveItemChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const wardrobeItemId = e.dataTransfer.getData("wardrobeItemId");
    if (!wardrobeItemId) return;

    const wardrobeItem = wardrobeItems.find(w => w.id === wardrobeItemId);
    if (!wardrobeItem) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - 80;
    const y = e.clientY - rect.top - 100;
    const maxZ = canvasItems.reduce((max, i) => Math.max(max, i.zIndex), 0);

    const newItem: CanvasItem = {
      id: uuid(),
      wardrobeItemId,
      src: wardrobeItem.processedSrc || wardrobeItem.originalSrc,
      name: wardrobeItem.name,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: 160,
      height: 200,
      zIndex: maxZ + 1,
    };
    onCanvasItemsChange([...canvasItems, newItem]);
    setSelectedId(newItem.id);
    onActiveItemChange(wardrobeItem.name);
  }, [canvasItems, wardrobeItems, onCanvasItemsChange, onActiveItemChange]);

  const updateItem = useCallback((id: string, updates: Partial<CanvasItem>) => {
    onCanvasItemsChange(canvasItems.map(i => i.id === id ? { ...i, ...updates } : i));
  }, [canvasItems, onCanvasItemsChange]);

  const removeItem = useCallback((id: string) => {
    onCanvasItemsChange(canvasItems.filter(i => i.id !== id));
    if (selectedId === id) selectItem(null);
  }, [canvasItems, selectedId, onCanvasItemsChange, selectItem]);

  const bringToFront = useCallback((id: string) => {
    const maxZ = canvasItems.reduce((max, i) => Math.max(max, i.zIndex), 0);
    onCanvasItemsChange(canvasItems.map(i => i.id === id ? { ...i, zIndex: maxZ + 1 } : i));
  }, [canvasItems, onCanvasItemsChange]);

  function clearCanvas() {
    onCanvasItemsChange([]);
    selectItem(null);
  }

  async function handleSave() {
    if (!canvasRef.current || canvasItems.length === 0) return;
    const canvas = document.createElement("canvas");
    const rect = canvasRef.current.getBoundingClientRect();
    canvas.width = 400;
    canvas.height = 500;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#141210";
    ctx.fillRect(0, 0, 400, 500);

    const sorted = [...canvasItems].sort((a, b) => a.zIndex - b.zIndex);
    const scaleX = 400 / rect.width;
    const scaleY = 500 / rect.height;

    for (const item of sorted) {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((res) => {
          img.onload = () => res();
          img.onerror = () => res();
          img.src = item.src;
        });
        ctx.drawImage(img, item.x * scaleX, item.y * scaleY, item.width * scaleX, item.height * scaleY);
      } catch {}
    }

    const thumbnail = canvas.toDataURL("image/png", 0.7);
    onSave(outfitName, thumbnail);
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onPointerDown={e => { if (e.target === canvasRef.current) selectItem(null); }}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{
          flex: 1, position: "relative",
          background: "var(--bg-canvas)", overflow: "hidden",
          outline: isDragOver ? "2px dashed rgba(201,169,110,0.4)" : "none",
          outlineOffset: -8, transition: "outline 0.15s",
          backgroundImage: "radial-gradient(circle, rgba(201,169,110,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        {canvasItems.length === 0 && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12, pointerEvents: "none",
          }}>
            <div style={{
              width: 80, height: 80, border: "2px dashed var(--border)", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.3,
            }}>👗</div>
            <p style={{ color: "var(--text-muted)", fontSize: 14, opacity: 0.6 }}>
              Drag items from your wardrobe
            </p>
          </div>
        )}

        {canvasItems.map(item => (
          <CanvasItemComponent
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            onSelect={selectItem}
            onUpdate={updateItem}
            onRemove={removeItem}
            onBringToFront={bringToFront}
          />
        ))}
      </div>

        {/* Toolbar */}
      <div className="stylist-header" style={{
        height: 52, background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 20px", gap: 12,
      }}>
        <input
          value={outfitName}
          onChange={e => setOutfitName(e.target.value)}
          style={{
            background: "transparent", border: "1px solid var(--border)",
            borderRadius: 6, padding: "5px 10px", color: "var(--text-primary)",
            fontSize: 13, width: 180, outline: "none",
          }}
          placeholder="Outfit name..."
        />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {canvasItems.length} item{canvasItems.length !== 1 ? "s" : ""}
        </span>
        <button onClick={clearCanvas} disabled={canvasItems.length === 0} style={{
          ...toolbarBtn, color: "var(--text-muted)",
          opacity: canvasItems.length === 0 ? 0.4 : 1,
        }}>
          Clear
        </button>
        <button onClick={handleSave} disabled={canvasItems.length === 0} style={{
          ...toolbarBtn, background: "var(--accent)", color: "#0f0e0c",
          border: "none", fontWeight: 500,
          opacity: canvasItems.length === 0 ? 0.4 : 1,
        }}>
          Save Outfit
        </button>
      </div>

      {/* Hints */}
      <div style={{
        height: 28, background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 16,
      }}>
        <Hint text="Drag to move" />
        <Hint text="Corner handles to resize" />
        <Hint text="Select → ✕ to remove" />
        <Hint text="↑ to bring forward" />
      </div>
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return <span style={{ fontSize: 10, color: "var(--text-muted)", opacity: 0.7 }}>{text}</span>;
}

const toolbarBtn: React.CSSProperties = {
  padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border)",
  background: "transparent", color: "var(--text-primary)", fontSize: 12,
  cursor: "pointer", transition: "all 0.15s",
};
