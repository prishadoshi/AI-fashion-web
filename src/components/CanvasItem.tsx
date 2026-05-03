"use client";
import { useRef } from "react";
import { CanvasItem as CanvasItemType } from "@/types";

interface Props {
  item: CanvasItemType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasItemType>) => void;
  onRemove: (id: string) => void;
  onBringToFront: (id: string) => void;
}

const MIN_SIZE = 60;

export default function CanvasItemComponent({
  item, isSelected, onSelect, onUpdate, onRemove, onBringToFront,
}: Props) {
  const dragging = useRef(false);
  const resizing = useRef<string | null>(null); // which corner
  const startPointer = useRef({ x: 0, y: 0 });
  const startRect = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // ── Drag ──────────────────────────────────────────────────────────
  function startDrag(e: React.PointerEvent) {
    // Don't drag when clicking a button or resize handle
    if ((e.target as HTMLElement).closest("[data-action]")) return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startRect.current = { x: item.x, y: item.y, w: item.width, h: item.height };

    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    function onMove(me: PointerEvent) {
      if (!dragging.current) return;
      const dx = me.clientX - startPointer.current.x;
      const dy = me.clientY - startPointer.current.y;
      onUpdate(item.id, {
        x: Math.max(0, startRect.current.x + dx),
        y: Math.max(0, startRect.current.y + dy),
      });
    }

    function onUp() {
      dragging.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // ── Resize ────────────────────────────────────────────────────────
  function startResize(e: React.PointerEvent, corner: string) {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = corner;
    startPointer.current = { x: e.clientX, y: e.clientY };
    startRect.current = { x: item.x, y: item.y, w: item.width, h: item.height };

    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);

    function onMove(me: PointerEvent) {
      const dx = me.clientX - startPointer.current.x;
      const dy = me.clientY - startPointer.current.y;
      const { x, y, w, h } = startRect.current;
      let nx = x, ny = y, nw = w, nh = h;

      if (corner.includes("e")) nw = Math.max(MIN_SIZE, w + dx);
      if (corner.includes("s")) nh = Math.max(MIN_SIZE, h + dy);
      if (corner.includes("w")) { nw = Math.max(MIN_SIZE, w - dx); if (nw > MIN_SIZE) nx = x + dx; }
      if (corner.includes("n")) { nh = Math.max(MIN_SIZE, h - dy); if (nh > MIN_SIZE) ny = y + dy; }

      onUpdate(item.id, { x: nx, y: ny, width: nw, height: nh });
    }

    function onUp() {
      resizing.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  // ── Click to select ───────────────────────────────────────────────
  function handlePointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("[data-action]")) return;
    onSelect(item.id);
    onBringToFront(item.id);
    startDrag(e);
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      className="canvas-item-selected"
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* Selection border */}
      {isSelected && (
        <div style={{
          position: "absolute", inset: -1.5,
          border: "1.5px solid rgba(201,169,110,0.8)",
          borderRadius: 4,
          pointerEvents: "none",
          zIndex: 1,
        }} />
      )}

      {/* Clothing image */}
      <img
        src={item.src}
        alt={item.name}
        draggable={false}
        style={{
          width: "100%", height: "100%",
          objectFit: "contain",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* ── Controls (only when selected) ── */}
      {isSelected && <>

        {/* Action buttons — top right, inside boundary */}
        <div
          data-action="toolbar"
          style={{
            position: "absolute", top: 6, right: 6,
            display: "flex", flexDirection: "column", gap: 4,
            zIndex: 20,
          }}
        >
          <Btn
            label="✕"
            title="Remove"
            color="#f87171"
            bg="rgba(15,14,12,0.88)"
            borderColor="rgba(248,113,113,0.4)"
            onClick={() => onRemove(item.id)}
          />
        </div>

        {/* Name pill — bottom centre */}
        <div style={{
          position: "absolute", bottom: 6, left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(119, 119, 118, 0.82)",
          border: "1px solid rgba(201,169,110,0.2)",
          borderRadius: 4, padding: "2px 8px",
          fontSize: 10, color: "var(--text-secondary)",
          whiteSpace: "nowrap", pointerEvents: "none", zIndex: 20,
        }}>
          {item.name}
        </div>

        {/* Corner resize handles */}
        {(["nw","ne","sw","se"] as const).map(corner => (
          <div
            key={corner}
            data-action="resize"
            onPointerDown={e => startResize(e, corner)}
            style={{
              position: "absolute",
              ...cornerPos(corner),
              width: 14, height: 14,
              background: "var(--accent)",
              border: "2px solid var(--bg-primary)",
              borderRadius: "50%",
              zIndex: 21,
              cursor: cursorForCorner(corner),
              touchAction: "none",
            }}
          />
        ))}

        {/* Edge resize handles */}
        {(["n","s","e","w"] as const).map(edge => (
          <div
            key={edge}
            data-action="resize"
            onPointerDown={e => startResize(e, edge)}
            style={{
              position: "absolute",
              ...edgePos(edge),
              background: "rgba(201,169,110,0.55)",
              borderRadius: 3,
              zIndex: 21,
              cursor: cursorForEdge(edge),
              touchAction: "none",
            }}
          />
        ))}
      </>}
    </div>
  );
}

// ── helpers ─────────────────────────────────────────────────────────

function Btn({ label, title, color, bg, borderColor, onClick }: {
  label: string; title: string; color: string;
  bg: string; borderColor: string; onClick: () => void;
}) {
  return (
    <button
      data-action="button"
      title={title}
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        width: 28, height: 28, borderRadius: 7,
        border: `1px solid ${borderColor}`,
        background: bg, color, fontSize: 13,
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(6px)",
        transition: "transform 0.1s, background 0.1s",
        lineHeight: 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {label}
    </button>
  );
}

function cornerPos(c: "nw"|"ne"|"sw"|"se") {
  return {
    nw: { top: -6, left: -6 },
    ne: { top: -6, right: -6 },
    sw: { bottom: -6, left: -6 },
    se: { bottom: -6, right: -6 },
  }[c];
}

function edgePos(e: "n"|"s"|"w"|"e") {
  return {
    n:  { top: -4, left: "calc(50% - 16px)", width: 32, height: 8 },
    s:  { bottom: -4, left: "calc(50% - 16px)", width: 32, height: 8 },
    w:  { left: -4, top: "calc(50% - 16px)", width: 8, height: 32 },
    e:  { right: -4, top: "calc(50% - 16px)", width: 8, height: 32 },
  }[e];
}

function cursorForCorner(c: string) {
  return { nw: "nw-resize", ne: "ne-resize", sw: "sw-resize", se: "se-resize" }[c] ?? "pointer";
}
function cursorForEdge(e: string) {
  return { n: "n-resize", s: "s-resize", w: "w-resize", e: "e-resize" }[e] ?? "pointer";
}
