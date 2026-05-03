"use client";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";


export default function Hero() {
  const [isWinter, setIsWinter] = useState(false);
  const { scrollY } = useScroll();
  
  // ── SMOOTH SCROLL SPRING ──
  const smoothY = useSpring(scrollY, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  // ── CINEMATIC TRANSFORMATIONS ──
  // Summer scales UP slightly as it fades
  const summerOpacity = useTransform(smoothY, [0, 500, 900], [1, 1, 0]);
  const summerScale = useTransform(smoothY, [0, 900], [1, 1.05]);

  // Winter scales DOWN to normal as it appears
  const winterOpacity = useTransform(smoothY, [500, 1000, 1500], [0, 1, 1]);
  const winterScale = useTransform(smoothY, [500, 1500], [1.1, 1]);

  // Dynamic Overlay for text legibility
  const overlayOpacity = useTransform(smoothY, [0, 900], [0.3, 0.5]);

  // ── SCROLL LISTENER ──
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 700 && !isWinter) setIsWinter(true);
    if (latest <= 700 && isWinter) setIsWinter(false);
  });

  const letterVariants = {
    initial: { opacity: 0, y: 25, rotateX: 95 },
    animate: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
    exit: {
      opacity: 0,
      y: -25,
      rotateX: -95,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <section
      style={{
        height: "350vh",
        position: "relative",
        backgroundColor: "#1a1a1a",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Winter Layer (Bottom) */}
        <motion.div
          style={{
            opacity: winterOpacity,
            scale: winterScale,
            zIndex: 1,
            position: "absolute",
            inset: 0,
          }}
        >
          <img
            src="/hero-lemonlilt/hero-lemonlilt.png"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt="Winter"
          />
        </motion.div>

        {/* Summer Layer (Top) */}
        <motion.div
          style={{
            opacity: summerOpacity,
            scale: summerScale,
            zIndex: 2,
            position: "absolute",
            inset: 0,
          }}
        >
          <img
            src="/hero-lemonlilt/hero_lemonlitt.webp"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            alt="Summer"
          />
        </motion.div>

        {/* Dynamic Overlay */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "black",
            opacity: overlayOpacity,
            zIndex: 3,
          }}
        />

        {/* Content Layer */}
        <div
          style={{
            position: "absolute",
            top: "33%",
            zIndex: 10,
            textAlign: "center",
            color: "white",
            perspective: "1200px",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(3rem, 10vw, 5.5rem)",
              fontWeight: "900",
              textTransform: "uppercase",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              fontFamily: '"neue-haas-grotesk-display", sans-serif',
              fontWeight: "500",
              fontStyle: "normal",
            }}
          >
            Fresh Fits For <br />
            <div
              style={{
                position: "relative",
                display: "inline-block",
                height: "1.1em",
                verticalAlign: "bottom",
              }}
            >
              <span style={{ opacity: 0, visibility: "hidden" }}>Summer</span>
              <motion.div
                key={isWinter ? "winter" : "summer"}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {(isWinter ? "Winter" : "Summer").split("").map((char, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    transition={{ delay: i * 0.03 }}
                    style={{
                      display: "inline-block",
                      transformOrigin: "bottom",
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{
              maxWidth: "480px",
              margin: "1rem auto",
              marginTop: "0.5rem",
              fontSize: "1rem",
              fontWeight: "300",
              lineHeight: "1.7",
              fontFamily: '"neue-haas-grotesk-display", sans-serif',
              fontWeight: "500",
              fontStyle: "normal",
            }}
          >
            Meticulously crafted fabrics and tailored fits designed to stay in
            your wardrobe forever.
          </motion.p>

          <Link
            className="shopall-btn"
            href="/shopAll"
            style={{
              backgroundColor: "white",
              color: "black",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              fontWeight: "800",
              letterSpacing: "0.1em",
              textDecoration: "none",
              borderRadius: "5px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              fontFamily: '"neue-haas-grotesk-display", sans-serif',
              fontWeight: "500",
              fontStyle: "normal",
            }}
          >
            Shop All
          </Link>
        </div>
      </div>
    </section>
  );
}
