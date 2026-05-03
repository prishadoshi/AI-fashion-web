"use client";

// ═══════════════════════════════════════════════════════════════════
//  Background Removal — Cloud-first, local WASM fallback
//
//  Priority:
//    1. Remove.bg   — https://www.remove.bg/api  (50 free/month)
//    2. ClipDrop    — https://clipdrop.co/apis   (100 free/day ✓)
//    3. Local WASM  — slow, no key needed
//
//  Add to .env.local (pick at least one):
//    NEXT_PUBLIC_REMOVEBG_API_KEY=your_key
//    NEXT_PUBLIC_CLIPDROP_API_KEY=your_key
// ═══════════════════════════════════════════════════════════════════

// ─── 1. Remove.bg ────────────────────────────────────────────────
async function removeBgDotCo(imageSrc: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_REMOVEBG_API_KEY!;
  const res = await fetch(imageSrc);
  const blob = await res.blob();

  const body = new FormData();
  body.append("image_file", blob, "img.png");
  body.append("size", "auto");

  const r = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": apiKey },
    body,
  });
  if (!r.ok) throw new Error(`remove.bg ${r.status}`);
  return URL.createObjectURL(await r.blob());
}

// ─── 2. ClipDrop (Stability AI) ──────────────────────────────────
async function removeViaClipDrop(imageSrc: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_CLIPDROP_API_KEY!;
  const res = await fetch(imageSrc);
  const blob = await res.blob();

  const body = new FormData();
  body.append("image_file", blob, "img.png");

  const r = await fetch("https://clipdrop-api.co/remove-background/v1", {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body,
  });
  if (!r.ok) throw new Error(`clipdrop ${r.status}`);
  return URL.createObjectURL(await r.blob());
}

// ─── 3. Local WASM (fallback) ────────────────────────────────────
type RemoveBgFn = (blob: Blob, cfg: Record<string, unknown>) => Promise<Blob>;
let _fn: RemoveBgFn | null = null;
let _loadPromise: Promise<void> | null = null;
let _warmed = false;
let _device: "gpu" | "cpu" = "cpu";

async function loadLocal() {
  if (_fn) return;
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    const mod = await import("@imgly/background-removal");
    _fn = mod.removeBackground as RemoveBgFn;
    _device = typeof navigator !== "undefined" && "gpu" in navigator ? "gpu" : "cpu";
  })();
  return _loadPromise;
}

async function resizeBlob(src: string, maxPx = 800): Promise<Blob> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const s = Math.min(1, maxPx / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => b ? res(b) : rej(new Error("toBlob")), "image/png");
    };
    img.onerror = rej;
    img.src = src;
  });
}

async function removeLocal(imageSrc: string): Promise<string> {
  await loadLocal();
  const blob = await resizeBlob(imageSrc, 800);
  const out = await _fn!(blob, { model: "small", output: { format: "image/png", quality: 0.85 }, device: _device, resolution: 512 });
  return URL.createObjectURL(out);
}

// ─── Warmup (only for local fallback) ────────────────────────────
export async function warmup() {
  const hasCloud =
    process.env.NEXT_PUBLIC_REMOVEBG_API_KEY ||
    process.env.NEXT_PUBLIC_CLIPDROP_API_KEY;
  if (hasCloud || _warmed) return;

  await loadLocal();
  try {
    const c = document.createElement("canvas");
    c.width = 4; c.height = 4;
    c.getContext("2d")!.fillRect(0, 0, 4, 4);
    await new Promise<void>(r => c.toBlob(async b => {
      try { await _fn!(b!, { model: "small", output: { format: "image/png" }, device: _device, resolution: 256 }); } catch {}
      r();
    }, "image/png"));
    _warmed = true;
  } catch {}
}

// ─── Main export ─────────────────────────────────────────────────
export async function removeBackground(imageSrc: string): Promise<string> {
  if (process.env.NEXT_PUBLIC_REMOVEBG_API_KEY) return removeBgDotCo(imageSrc);
  if (process.env.NEXT_PUBLIC_CLIPDROP_API_KEY)  return removeViaClipDrop(imageSrc);
  return removeLocal(imageSrc);
}