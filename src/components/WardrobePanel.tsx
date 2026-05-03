"use client";
import { useState, useRef } from "react";
import { WardrobeItem } from "@/types";
import { v4 as uuid } from "uuid";

const CATEGORIES = ["all", "tops", "bottoms"] as const;

type Updater = (prev: WardrobeItem[]) => WardrobeItem[];

interface Props {
  items: WardrobeItem[];
  onItemsChange: (updaterOrItems: WardrobeItem[] | Updater) => void;
  onNewItemsUploaded: (newItems: WardrobeItem[]) => void;
  onDragToCanvas: (item: WardrobeItem) => void;
}

export default function WardrobePanel({ items, onItemsChange, onNewItemsUploaded }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter(i => activeCategory === "all" || i.category === activeCategory);
  const totalProcessing = items.filter(i => i.isProcessing).length;
  const totalDone = items.filter(i => i.processedSrc).length;

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems: WardrobeItem[] = files.map(file => ({
      id: uuid(),
      name: file.name.replace(/\.[^.]+$/, ""),
      category: "tops" as const,
      originalSrc: URL.createObjectURL(file),
      processedSrc: null,
      isProcessing: true,
    }));
    onNewItemsUploaded(newItems);
    // reset so same file can be re-uploaded
    e.target.value = "";
  }

  function handleDragStart(e: React.DragEvent, item: WardrobeItem) {
    setDraggingId(item.id);
    e.dataTransfer.setData("wardrobeItemId", item.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <aside className="wardrobe-panel" style={{
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      height: "100vh", overflow: "hidden",
    }}>
      {/* Header */}
      <div className="wardrobe-panel-header" style={{ padding: "20px 20px 12px", borderBottom: "1px solid var(--border)" }}>
        <h1 className="wardrobe-heading" style={{
          fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400,
          color: "var(--accent)", letterSpacing: "0.02em", marginBottom: 4,
        }}>
          Wardrobe
        </h1>
        {totalProcessing > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              border: "1.5px solid var(--border)", borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite", flexShrink: 0,
            }} />
            <p style={{ color: "var(--accent-muted)", fontSize: 11 }}>
              Removing backgrounds… ({totalDone}/{items.length})
            </p>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
            {totalDone > 0 ? `${totalDone} items ready · drag to canvas` : "Drag items to canvas"}
          </p>
        )}
      </div>

      {/* Progress bar */}
      {totalProcessing > 0 && (
        <div style={{ height: 2, background: "var(--border)" }}>
          <div style={{
            height: "100%",
            width: `${(totalDone / items.length) * 100}%`,
            background: "var(--accent)",
            transition: "width 0.4s ease",
          }} />
        </div>
      )}

      {/* Category filter */}
      <div style={{
        padding: "10px 16px", borderBottom: "1px solid var(--border)",
        display: "flex", gap: 6, flexWrap: "wrap",
      }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: "3px 10px", borderRadius: 20, border: "1px solid",
            borderColor: activeCategory === cat ? "var(--accent)" : "var(--border)",
            background: activeCategory === cat ? "rgba(201,169,110,0.12)" : "transparent",
            color: activeCategory === cat ? "var(--accent)" : "var(--text-muted)",
            fontSize: 11, textTransform: "capitalize", cursor: "pointer", transition: "all 0.15s",
          }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div className="wardrobe-items_grid" style={{
        flex: 1, overflowY: "auto", padding: 12,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
      }}>
        {filtered.map(item => {
          const src = item.processedSrc || item.originalSrc;
          const ready = !!item.processedSrc;
          return (
            <div
              key={item.id}
              draggable={ready}
              onDragStart={e => handleDragStart(e, item)}
              onDragEnd={() => setDraggingId(null)}
              title={ready ? `Drag to canvas: ${item.name}` : "Removing background…"}
              className="wardrobe-item"
              style={{
                background: "var(--bg-card)",
                border: "1px solid",
                borderColor: draggingId === item.id ? "var(--accent)" : ready ? "var(--border)" : "rgba(201,169,110,0.08)",
                borderRadius: 10, overflow: "hidden",
                cursor: ready ? "grab" : "wait",
                opacity: draggingId === item.id ? 0.45 : item.isProcessing ? 0.6 : 1,
                transition: "all 0.2s",
              }}
            >
              {/* Image area */}
              <div className="wardrobe-item-img" style={{
                position: "relative",
                background: ready ? "transparent" : "#191611",
              }}>
                {item.isProcessing ? (
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    {/* faded original behind spinner */}
                    <img
                      src={item.originalSrc}
                      alt=""
                      style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", opacity: 0.18, filter: "blur(2px)",
                      }}
                    />
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: "2px solid rgba(201,169,110,0.2)",
                      borderTopColor: "var(--accent)",
                      animation: "spin 0.75s linear infinite",
                      position: "relative", zIndex: 1,
                    }} />
                    <span style={{ fontSize: 9, color: "var(--accent-muted)", position: "relative", zIndex: 1 }}>
                      removing bg
                    </span>
                  </div>
                ) : (
                  <img
                    src={src}
                    alt={item.name}
                    crossOrigin="anonymous"
                    style={{
                      position: "absolute", inset: 0, width: "100%", height: "100%",
                      objectFit: "contain", padding: ready ? 6 : 0,
                      transition: "opacity 0.3s",
                    }}
                  />
                )}
              </div>

              {/* Label */}
              <div className="wardrobe-item-label" style={{ padding: "6px 8px 8px" }}>
                <p style={{
                  fontSize: 10, color: ready ? "var(--text-secondary)" : "var(--text-muted)",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {item.name}
                </p>
                <div style={{ marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                  {ready ? (
                    <span style={{ fontSize: 9, color: "#4ade80" }}>✓ ready</span>
                  ) : (
                    <span style={{ fontSize: 9, color: "var(--text-muted)" }}>processing…</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload */}
      <div className="upload-image" style={{ padding: 16, borderTop: "1px solid var(--border)" }}>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileUpload} style={{ display: "none" }} />
        <button className="upload-image-btn"
          onClick={() => fileRef.current?.click()}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--accent-muted)";
          }}
        >
          + Upload clothing items
        </button>
        <p style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 6 }}>
          Backgrounds are removed automatically
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </aside>
  );
}
