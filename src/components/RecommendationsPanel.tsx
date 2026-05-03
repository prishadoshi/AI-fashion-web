"use client";
import { useMemo, useState } from "react";
import { WardrobeItem, CanvasItem, SavedOutfit } from "@/types";

interface Props {
  // The name of the last item dropped on canvas (used to look up recs)
  activeItemName: string | null;
  recommendations: Record<string, string[]>;
  wardrobeItems: WardrobeItem[];
  canvasItems: CanvasItem[];
  // Called when user clicks "Add to canvas" on a rec
  onAddToCanvas: (item: WardrobeItem) => void;
  // Saved outfits section
  savedOutfits: SavedOutfit[];
  onLoadOutfit: (items: CanvasItem[]) => void;
  onDeleteOutfit: (id: string) => void;
}

export default function RecommendationsPanel({
  activeItemName,
  recommendations,
  wardrobeItems,
  canvasItems,
  onAddToCanvas,
  savedOutfits,
  onLoadOutfit,
  onDeleteOutfit,
}: Props) {
  const [savedOpen, setSavedOpen] = useState(false);

  // Names already on canvas
  const onCanvasNames = useMemo(
    () => new Set(canvasItems.map(i => i.name.toLowerCase())),
    [canvasItems]
  );

  // Look up recommended names → match to wardrobe items (fuzzy: lowercase trim)
  const recNames: string[] = useMemo(() => {
    if (!activeItemName) return [];
    // Try exact match first, then case-insensitive
    const key =
      Object.keys(recommendations).find(k => k === activeItemName) ||
      Object.keys(recommendations).find(k => k.toLowerCase() === activeItemName.toLowerCase()) ||
      null;
    return key ? recommendations[key] : [];
  }, [activeItemName, recommendations]);

  const recItems = useMemo(() =>
    recNames.map(name => ({
      name,
      wardrobeItem: wardrobeItems.find(
        w => w.name.toLowerCase() === name.toLowerCase()
      ) ?? null,
      alreadyOnCanvas: onCanvasNames.has(name.toLowerCase()),
    })),
    [recNames, wardrobeItems, onCanvasNames]
  );

  function handleDragStart(e: React.DragEvent, item: WardrobeItem) {
    e.dataTransfer.setData("wardrobeItemId", item.id);
    e.dataTransfer.effectAllowed = "copy";
  }

  const isEmpty = !activeItemName;
  const hasRecs = recItems.length > 0;

  return (
    <aside className="stylist-recommendation-panel" style={{
      width: 240,
      minWidth: 240,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      {/* ── Header ── */}
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: 17,
          fontWeight: 400,
          color: "var(--accent)",
          letterSpacing: "0.02em",
          marginBottom: 4,
        }}>
          Recommended
        </h2>
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
          {isEmpty
            ? "Drop an item on the canvas to see pairings"
            : hasRecs
              ? `Pairs well with "${activeItemName}"`
              : `No recommendations for "${activeItemName}"`}
        </p>
      </div>

      {/* ── Rec list ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        {isEmpty && (
          <EmptyState
            icon="✦"
            text="Your AI recommendations will appear here once you place an item on the canvas."
          />
        )}

        {!isEmpty && !hasRecs && (
          <EmptyState
            icon="∅"
            text="This item has no recommendations in your JSON. Check the product name matches exactly."
          />
        )}

        {hasRecs && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recItems.map(({ name, wardrobeItem, alreadyOnCanvas }) => (
              <RecCard
                key={name}
                name={name}
                wardrobeItem={wardrobeItem}
                alreadyOnCanvas={alreadyOnCanvas}
                onDragStart={handleDragStart}
                onAdd={onAddToCanvas}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Saved Outfits collapsible ── */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <button
          onClick={() => setSavedOpen(o => !o)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "transparent",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            Saved Outfits
            {savedOutfits.length > 0 && (
              <span style={{
                marginLeft: 7,
                background: "rgba(201,169,110,0.15)",
                color: "var(--accent)",
                fontSize: 10,
                padding: "1px 6px",
                borderRadius: 10,
              }}>
                {savedOutfits.length}
              </span>
            )}
          </span>
          <span style={{
            fontSize: 10,
            transform: savedOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            color: "var(--text-muted)",
          }}>▼</span>
        </button>

        {savedOpen && (
          <div style={{
            maxHeight: 300,
            overflowY: "auto",
            padding: "0 12px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {savedOutfits.length === 0 ? (
              <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                No saved outfits yet
              </p>
            ) : savedOutfits.map(outfit => (
              <div key={outfit.id} style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                overflow: "hidden",
              }}>
                <div style={{ position: "relative", paddingTop: "65%", background: "#141210" }}>
                  <img
                    src={outfit.thumbnail}
                    alt={outfit.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <div style={{ padding: "7px 10px" }}>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 5, fontWeight: 500 }}>
                    {outfit.name}
                  </p>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button
                      onClick={() => onLoadOutfit(outfit.items)}
                      style={{ ...smallBtn, color: "var(--accent)", borderColor: "rgba(201,169,110,0.3)", background: "rgba(201,169,110,0.08)" }}
                    >Load</button>
                    <button
                      onClick={() => onDeleteOutfit(outfit.id)}
                      style={{ ...smallBtn, color: "#f87171", borderColor: "rgba(248,113,113,0.25)" }}
                    >✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RecCard({ name, wardrobeItem, alreadyOnCanvas, onDragStart, onAdd }: {
  name: string;
  wardrobeItem: WardrobeItem | null;
  alreadyOnCanvas: boolean;
  onDragStart: (e: React.DragEvent, item: WardrobeItem) => void;
  onAdd: (item: WardrobeItem) => void;
}) {
  const hasItem = !!wardrobeItem;
  const src = wardrobeItem?.processedSrc || wardrobeItem?.originalSrc;
  const isReady = !!wardrobeItem?.processedSrc;

  return (
    <div
      draggable={hasItem && !alreadyOnCanvas && isReady}
      onDragStart={hasItem ? e => onDragStart(e, wardrobeItem!) : undefined}
      style={{
        background: "var(--bg-card)",
        border: "1px solid",
        borderColor: alreadyOnCanvas
          ? "rgba(74,222,128,0.25)"
          : hasItem ? "var(--border)" : "rgba(201,169,110,0.08)",
        borderRadius: 10,
        overflow: "hidden",
        opacity: !hasItem ? 0.55 : 1,
        cursor: hasItem && !alreadyOnCanvas && isReady ? "grab" : "default",
        transition: "border-color 0.15s, transform 0.12s",
      }}
      onMouseEnter={e => { if (hasItem && !alreadyOnCanvas) e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {/* Image thumbnail */}
        <div style={{
          width: 64, height: 72, flexShrink: 0,
          background: hasItem && isReady ? "transparent" : "#191611",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          {src ? (
            <img
              src={src}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "contain", padding: isReady ? 4 : 0 }}
            />
          ) : (
            <span style={{ fontSize: 20, opacity: 0.25 }}>?</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: "8px 10px 8px 8px", minWidth: 0 }}>
          <p style={{
            fontSize: 11, color: "var(--text-primary)", fontWeight: 500,
            lineHeight: 1.3, marginBottom: 4,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {name}
          </p>

          {alreadyOnCanvas ? (
            <span style={{ fontSize: 9, color: "#4ade80", display: "flex", alignItems: "center", gap: 3 }}>
              <span>✓</span> On canvas
            </span>
          ) : !hasItem ? (
            <span style={{ fontSize: 9, color: "var(--text-muted)" }}>Not in wardrobe</span>
          ) : wardrobeItem?.isProcessing ? (
            <span style={{ fontSize: 9, color: "var(--accent-muted)" }}>Processing…</span>
          ) : (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); onAdd(wardrobeItem!); }}
              style={{
                padding: "3px 8px",
                fontSize: 9,
                background: "rgba(201,169,110,0.12)",
                border: "1px solid rgba(201,169,110,0.3)",
                borderRadius: 4,
                color: "var(--accent)",
                cursor: "pointer",
                transition: "all 0.12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,169,110,0.22)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(201,169,110,0.12)"}
            >
              + Add to canvas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "32px 16px", gap: 12, textAlign: "center",
    }}>
      <span style={{ fontSize: 28, opacity: 0.2, color: "var(--accent)" }}>{icon}</span>
      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}

const smallBtn: React.CSSProperties = {
  flex: 1, padding: "4px 0",
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: 4, fontSize: 10,
  cursor: "pointer",
};
