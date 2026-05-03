"use client";
import { SavedOutfit, CanvasItem } from "@/types";

interface Props {
  outfits: SavedOutfit[];
  onLoad: (items: CanvasItem[]) => void;
  onDelete: (id: string) => void;
}

export default function SavedOutfitsPanel({ outfits, onLoad, onDelete }: Props) {
  if (outfits.length === 0) return null;

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      background: "var(--bg-secondary)",
      borderLeft: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <h2 style={{
          fontFamily: "var(--font-display)",
          fontSize: 16,
          fontWeight: 400,
          color: "var(--accent)",
          letterSpacing: "0.02em",
        }}>
          Saved
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 11, marginTop: 2 }}>
          {outfits.length} outfit{outfits.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        {outfits.map(outfit => (
          <div key={outfit.id} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
          }}>
            <div style={{ position: "relative", paddingTop: "80%", background: "#141210" }}>
              <img
                src={outfit.thumbnail}
                alt={outfit.name}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
            <div style={{ padding: "8px 10px" }}>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6, fontWeight: 500 }}>
                {outfit.name}
              </p>
              <p style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>
                {new Date(outfit.createdAt).toLocaleDateString()}
              </p>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => onLoad(outfit.items)}
                  style={{
                    flex: 1, padding: "5px 0",
                    background: "rgba(201,169,110,0.1)",
                    border: "1px solid rgba(201,169,110,0.25)",
                    borderRadius: 5,
                    color: "var(--accent)",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => onDelete(outfit.id)}
                  style={{
                    padding: "5px 8px",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: 5,
                    color: "var(--text-muted)",
                    fontSize: 10,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
