"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, animate, useInView } from "framer-motion";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
const Counter = ({ to, suffix = "", delay = 0 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      const c = animate(0, to, {
        duration: 1.8, ease: "easeOut",
        onUpdate: (v) => setVal(Math.round(v)),
      });
      return c.stop;
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [inView]);

  return <span ref={ref}>{val}{suffix}</span>;
};

/* ─────────────────────────────────────────────
   Orbiting accent shape
───────────────────────────────────────────── */
const OrbitShape = ({ size, color, duration, radius, startAngle, top, left, shape = "circle" }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = ((now - start) / (duration * 1000)) * Math.PI * 2 + startAngle;
      x.set(Math.cos(t) * radius);
      y.set(Math.sin(t) * radius * 0.5);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      style={{
        position: "absolute", top, left,
        width: size, height: size,
        x, y, zIndex: 0, pointerEvents: "none",
        borderRadius: shape === "circle" ? "50%" : shape === "square" ? "4px" : "50%",
        background: color,
        rotate: shape === "square" ? 45 : 0,
      }}
    />
  );
};

/* ─────────────────────────────────────────────
   Floating pill tag
───────────────────────────────────────────── */
const FloatingPill = ({ icon, label, style, delay = 0, floatY = 10 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7, y: 10 }}
    animate={{
      opacity: 1, scale: 1,
      y: [0, -floatY, 0],
    }}
    transition={{
      opacity: { delay, duration: 0.5 },
      scale:   { delay, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
      y:       { delay: delay + 0.5, duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" },
    }}
    style={{
      position: "absolute",
      display: "flex", alignItems: "center", gap: 8,
      background: "#fff",
      border: "1.5px solid #e8e8e8",
      borderRadius: 100,
      padding: "8px 14px 8px 10px",
      fontSize: "0.72rem", fontWeight: 500,
      letterSpacing: "0.04em",
      fontFamily: '"DM Sans", sans-serif',
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      whiteSpace: "nowrap",
      color: "#111",
      zIndex: 4,
      cursor: "default",
      ...style,
    }}
  >
    <span style={{ fontSize: "1rem" }}>{icon}</span>
    {label}
  </motion.div>
);

/* ─────────────────────────────────────────────
   Canvas mockup (draggable items)
───────────────────────────────────────────── */
const CanvasMockup = () => {
  const items = [
    { id: 1, icon: "👕", label: "Polo Tshirt",    x: 50,  y: 68,  bg: "#f0f0f0", fg: "#111" },
    { id: 2, icon: "👖", label: "Wide Leg Trousers", x: 46, y: 178, bg: "#1a1a1a", fg: "#fff" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: "relative",
        width: 320, height: 430,
        background: "#fafafa",
        border: "1.5px solid #e2e2e2",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 32px 64px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.04)",
        flexShrink: 0,
      }}
    >
      {/* dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, #d0d0d0 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        opacity: 0.6,
      }} />

      {/* top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 40,
        background: "#fff",
        borderBottom: "1px solid #ececec",
        display: "flex", alignItems: "center", padding: "0 14px", gap: 7,
        zIndex: 5,
      }}>
        {["#ff5f56","#ffbd2e","#27c93f"].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
        <span style={{
          marginLeft: 8, fontSize: "0.6rem", color: "#aaa",
          letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace",
        }}>
          outfit_canvas.fig
        </span>
      </div>

      {/* drop zone label */}
      <div style={{
        position: "absolute", top: 52, left: 14,
        fontSize: "0.58rem", color: "#bbb",
        letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "monospace",
      }}>
        Drop zone
      </div>

      {/* animated dashed border */}
      <motion.div
        style={{
          position: "absolute", inset: 10, borderRadius: 14,
          border: "1.5px dashed #e63030",
          pointerEvents: "none", zIndex: 2,
        }}
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* spinning cross accent */}
      <motion.div
        style={{ position: "absolute", right: 18, top: 56, color: "#e63030", fontSize: "0.8rem", zIndex: 3 }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >✚</motion.div>

      {/* draggable clothing items */}
      {items.map((item) => (
        <motion.div
          key={item.id}
          drag dragMomentum={false}
          whileDrag={{ scale: 1.08, zIndex: 20, boxShadow: "0 16px 40px rgba(0,0,0,0.18)" }}
          style={{
            position: "absolute", left: item.x, top: item.y,
            background: item.bg, color: item.fg,
            borderRadius: 12, padding: "10px 14px",
            fontSize: "0.72rem", fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500, letterSpacing: "0.03em",
            display: "flex", alignItems: "center", gap: 8,
            cursor: "grab", userSelect: "none",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            zIndex: 3,
          }}
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 + item.id * 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
          {item.label}
          <span style={{ marginLeft: 4, opacity: 0.3, fontSize: "0.6rem" }}>⠿</span>
        </motion.div>
      ))}

      {/* yellow count badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 1.4, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          position: "absolute", bottom: 16, right: 16,
          background: "#b5c4f7", color: "#000",
          borderRadius: 8, padding: "6px 10px",
          fontSize: "0.62rem", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase",
          fontFamily: '"DM Sans", sans-serif',
          zIndex: 5,
        }}
      >
        2 items ✓
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────
   Main WardrobeHero
───────────────────────────────────────────── */
export default function WardrobeHero() {
  const sectionRef = useRef();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=Instrument+Serif:ital@0;1&display=swap');

        .wb-hero {
          position: relative;
          background: #f7f6f3;
          overflow: hidden;
          padding: 80px 0 40px;
          font-family: "DM Sans", sans-serif;
        }

        /* subtle linen texture */
        .wb-hero::after {
          content: "";
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0;
        }

        .wb-inner {
          position: relative; z-index: 1;
          max-width: 1160px; margin: 0 auto;
          padding: 0 48px;
          display: flex; align-items: center;
          gap: 72px;
        }

        .wb-left { flex: 1; min-width: 0; padding-left: 7vw; }

        .wb-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          background: #fff;
          border: 1.5px solid #e5e5e5;
          border-radius: 100px; padding: 6px 16px 6px 10px;
          font-size: 0.68rem; letter-spacing: 0.14em;
          text-transform: uppercase; color: #777;
          margin-bottom: 28px; font-weight: 500;
        }
        .wb-eyebrow-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #e63030;
          animation: wbPulse 2s infinite;
        }
        @keyframes wbPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(230,48,48,0.4); }
          50%      { box-shadow: 0 0 0 6px rgba(230,48,48,0); }
        }

        .wb-h1 {
          font-family: "neue-haas-grotesk-display", sans-serif;
          font-weight: 600;
          font-style: normal;
          font-size: clamp(2.8rem, 4.8vw, 4.8rem);
          line-height: 1.05; letter-spacing: -0.02em;
          color: #111; margin-bottom: 20px;
        }
        .wb-h1 em {
          font-style: italic; color: #555;
        }

        .wb-sub {
          font-size: 1rem; line-height: 1.75;
          color: #777; max-width: 390px;
          margin-bottom: 40px; font-weight: 300;
          font-family: "neue-haas-grotesk-display", sans-serif;
          font-weight: 500;
          font-style: normal;
        }

        .wb-btn {
          display: inline-flex; align-items: center; gap: 10px;
          background: #111; color: #fff;
          padding: 14px 28px; border-radius: 100px;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; font-family: "DM Sans", sans-serif;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }
        .wb-btn:hover {
          background: #e63030;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(230,48,48,0.25);
        }
        .wb-btn svg { transition: transform 0.2s; }
        .wb-btn:hover svg { transform: translateX(3px); }

        .wb-stats {
          display: flex; gap: 32px;
          margin-top: 48px; padding-top: 32px;
          border-top: 1px solid #e5e5e5;
        }
        .wb-stat-val {
          font-family: "Instrument Serif", serif;
          font-size: 2rem; color: #111; line-height: 1; margin-bottom: 4px;
        }
        .wb-stat-label {
          font-size: 0.62rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: #aaa; font-weight: 500;
        }

        .wb-right {
          position: relative; flex-shrink: 0; padding-right: 2vw;
        }

        /* animated red rule line above card */
        .wb-rule {
          position: absolute; top: -14px; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, #e63030 0%, transparent 100%);
          border-radius: 2px; transform-origin: left;
        }

        /* yellow sticky tag */
        .wb-tag {
          position: absolute; top: -48px; right: 12px;
          background: #b5c4f7; color: #000;
          padding: 6px 13px; border-radius: 8px;
          font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          font-family: "DM Sans", sans-serif;
          box-shadow: 0 4px 16px rgba(245,196,0,0.35);
          rotate: -5deg; z-index: 10;
        }

        /* bouncing arrow */
        .wb-arrow {
          position: absolute;
          left: -99px;
          top: 42%;
          font-size: 2.3rem;
          color: #e63030;
          animation: wbArrow 2s ease-in-out infinite;
        }
        @keyframes wbArrow {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(8px); }
        }

        /* floating lines (decorative) */
        .wb-line {
          position: absolute; pointer-events: none;
          background: #e63030; border-radius: 2px; opacity: 0.18;
        }

        @media (max-width: 900px) {
          .wb-inner { flex-direction: column; padding: 0 24px; gap: 48px; }
          .wb-right { width: 100%; display: flex; justify-content: center; }
          .wb-arrow { display: none; }
        }
      `}</style>

      <section className="wb-hero" ref={sectionRef}>

        {/* ── Orbiting accent shapes ── */}
        <OrbitShape size={12} color="#e63030"  duration={6}  radius={60}  startAngle={0}      top="12%"  left="8%"  shape="circle" />
        <OrbitShape size={8}  color="#f5c400"  duration={9}  radius={40}  startAngle={2}      top="70%"  left="5%"  shape="circle" />
        <OrbitShape size={10} color="#e63030"  duration={7}  radius={55}  startAngle={1}      top="20%"  left="88%" shape="square" />
        <OrbitShape size={7}  color="#111"     duration={11} radius={35}  startAngle={3.5}    top="75%"  left="92%" shape="circle" />
        <OrbitShape size={14} color="#f5c400"  duration={8}  radius={70}  startAngle={0.8}    top="45%"  left="50%" shape="circle" />

        {/* ── Decorative floating lines ── */}
        <motion.div className="wb-line"
          style={{ width: 80, height: 1.5, top: "22%", left: "3%", rotate: 35 }}
          animate={{ x: [0, 12, 0], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div className="wb-line"
          style={{ width: 50, height: 1.5, top: "60%", right: "4%", rotate: -20 }}
          animate={{ x: [0, -10, 0], opacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div className="wb-line"
          style={{ width: 100, height: 1.5, bottom: "15%", left: "15%", rotate: 10 }}
          animate={{ x: [0, 16, 0], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* ── Floating mini crosses ── */}
        {[
          { top: "8%",  left: "18%", delay: 0,   size: "0.7rem", color: "#e63030" },
          { top: "88%", left: "22%", delay: 1.2, size: "0.55rem", color: "#aaa" },
          { top: "15%", left: "78%", delay: 0.7, size: "0.65rem", color: "#f5c400" },
          { top: "82%", left: "75%", delay: 1.8, size: "0.6rem",  color: "#e63030" },
        ].map((c, i) => (
          <motion.div key={i}
            style={{ position: "absolute", top: c.top, left: c.left, color: c.color, fontSize: c.size, zIndex: 0, pointerEvents: "none" }}
            animate={{ rotate: [0, 180, 360], scale: [1, 1.3, 1] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "linear", delay: c.delay }}
          >✚</motion.div>
        ))}

        {/* ── Floating pill tags (left bg) ── */}
        <FloatingPill icon="👕" label="Polo Tshirts"    style={{ top: "18%", left: "5%", transform: "rotate(-4deg)" }} delay={0.8} />
        <FloatingPill icon="👖" label="Sweatpants"       style={{ top: "50%", left: "3%", transform: "rotate(3deg)"  }} delay={1.1} floatY={8} />
        <FloatingPill icon="🧥" label="Cozy Hoodies"        style={{ bottom: "30%", left: "7%", transform: "rotate(-2deg)" }} delay={1.4} floatY={12} />

        <div className="wb-inner">

          {/* ── LEFT ── */}
          <div className="wb-left">
            <motion.div
              className="wb-eyebrow"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="wb-eyebrow-dot" />
              New Feature
            </motion.div>

            <motion.h1
              className="wb-h1"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              Build your<br />
              <em>perfect</em><br />
              wardrobe.
            </motion.h1>

            <motion.p
              className="wb-sub"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              Drag, drop, and layer pieces onto your personal canvas.
              Mix textures, test combinations — before you open your closet.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.34 }}
            >
              <Link href="/stylist" className="wb-btn">
                Start Styling
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </motion.div>

          </div>

          {/* ── RIGHT: canvas card ── */}
          <div className="wb-right">
            {/* animated red rule */}
            <motion.div
              className="wb-rule"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* yellow sticky tag */}
            <motion.div
              className="wb-tag"
              initial={{ opacity: 0, scale: 0.6, rotate: -5 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            >
              ✦ Try it live
            </motion.div>

            {/* bouncing arrow */}
            <div className="wb-arrow">→</div>

            <CanvasMockup />

            {/* red dot trail below card */}
            <motion.div
              style={{ display: "flex", gap: 6, marginTop: 16, justifyContent: "center" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.4 }}
            >
              {[0,1,2].map((i) => (
                <motion.div key={i}
                  style={{ width: i === 0 ? 20 : 6, height: 6, borderRadius: 3, background: i === 0 ? "#e63030" : "#ddd" }}
                  animate={i === 0 ? { width: [20, 8, 20] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
