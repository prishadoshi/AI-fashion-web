"use client";

import React, { useState, useEffect, useRef } from "react";
import ProductCard from "./ProductCard";
import Link from "next/link";
import Hero from "./HeroSection1";
import WardrobeHero from "./WardrobeHero";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   Magnetic button hook
───────────────────────────────────────────── */
function useMagnetic(ref, strength = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: x * strength, y: y * strength, duration: 0.4, ease: "power2.out" });
    };
    const reset = () =>
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);
}

/* ─────────────────────────────────────────────
   Cursor follower
───────────────────────────────────────────── */
const Cursor = () => {
  const dot = useRef();
  const ring = useRef();
  useEffect(() => {
    const onMove = (e) => {
      gsap.to(dot.current,  { x: e.clientX, y: e.clientY, duration: 0.1 });
      gsap.to(ring.current, { x: e.clientX, y: e.clientY, duration: 0.35, ease: "power2.out" });
    };
    const onEnter = (e) => {
      if (e.target.closest("a, button"))
        gsap.to(ring.current, { scale: 2.2, opacity: 0.5, duration: 0.3 });
    };
    const onLeave = (e) => {
      if (e.target.closest("a, button"))
        gsap.to(ring.current, { scale: 1, opacity: 1, duration: 0.3 });
    };
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover",  onEnter);
    document.addEventListener("mouseout",   onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover",  onEnter);
      document.removeEventListener("mouseout",   onLeave);
    };
  }, []);
  return (
    <>
      <div ref={dot}  className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  );
};

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
const HomePage = ({ initialProducts }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  /* refs */
  const newInHeadRef   = useRef();
  const cardsRef       = useRef();
  const bannerRef      = useRef();
  const bannerTextRef  = useRef();
  const wardrobeRef    = useRef();   // ← WardrobeHero wrapper for GSAP
  const bestHeadRef    = useRef();
  const bestCardsRef   = useRef();
  const videoRef       = useRef();
  const playRef        = useRef();
  const reelRef        = useRef();
  const discoverBtn    = useRef();
  const createBtn      = useRef();

  useMagnetic(discoverBtn, 0.4);
  useMagnetic(createBtn, 0.4);

  const newInProducts      = [...initialProducts].slice(-8).reverse();
  const bestSellerProducts = initialProducts.slice(0, 8);

  useEffect(() => {
    const ctx = gsap.context(() => {

      /* ── 1. "New-in" heading char reveal ── */
      if (newInHeadRef.current) {
        const chars = newInHeadRef.current.querySelectorAll("span");
        gsap.from(chars, {
          scrollTrigger: { trigger: newInHeadRef.current, start: "top 85%" },
          y: 60, opacity: 0, rotateX: -90,
          stagger: 0.04, duration: 0.7, ease: "back.out(1.7)",
        });
      }

      /* ── 2. New-in product cards ── */
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll("li");
        gsap.from(cards, {
          scrollTrigger: { trigger: cardsRef.current, start: "top 85%" },
          y: 80, opacity: 0, rotate: 3,
          stagger: { amount: 0.6, from: "start" },
          duration: 0.8, ease: "power3.out",
        });
        cards.forEach((card) => {
          card.addEventListener("mouseenter", () => gsap.to(card, { y: -8, scale: 1.03, duration: 0.3 }));
          card.addEventListener("mouseleave", () => gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" }));
        });
      }

      /* ── 3. Banner parallax + text slide ── */
      if (bannerRef.current) {
        const img = bannerRef.current.querySelector("img");
        gsap.to(img, {
          scrollTrigger: { trigger: bannerRef.current, start: "top bottom", end: "bottom top", scrub: 1.5 },
          y: -80, scale: 1.12, ease: "none",
        });
        gsap.from(bannerTextRef.current, {
          scrollTrigger: { trigger: bannerRef.current, start: "top 70%" },
          x: -60, opacity: 0, duration: 1, ease: "power3.out",
        });
      }

      /* ── 4. WardrobeHero section – scroll reveal ──
              Framer Motion handles the internal animations (whileInView).
              GSAP adds a section-level entrance: clip + lift, so it
              feels distinct from the rest of the page's scroll rhythm. ── */
      if (wardrobeRef.current) {
        gsap.from(wardrobeRef.current, {
          scrollTrigger: {
            trigger: wardrobeRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
          clipPath: "inset(6% 3% 6% 3% round 24px)",
          opacity: 0,
          y: 40,
          duration: 1.1,
          ease: "power3.out",
        });

        /* subtle background color shift on the section as it enters */
        gsap.fromTo(
          wardrobeRef.current,
          { "--wb-bg": "#f0ede8" },
          {
            scrollTrigger: {
              trigger: wardrobeRef.current,
              start: "top 70%",
              end: "top 20%",
              scrub: 1,
            },
            "--wb-bg": "#f7f6f3",
            ease: "none",
          }
        );
      }

      /* ── 5. Best Seller heading wipe ── */
      if (bestHeadRef.current) {
        gsap.from(bestHeadRef.current, {
          scrollTrigger: { trigger: bestHeadRef.current, start: "top 80%" },
          clipPath: "inset(0 100% 0 0)", opacity: 1,
          duration: 1, ease: "power4.inOut",
        });
      }

      /* ── 6. Best seller cards alternating slide ── */
      if (bestCardsRef.current) {
        const cards = bestCardsRef.current.querySelectorAll("li");
        cards.forEach((card, i) => {
          gsap.from(card, {
            scrollTrigger: { trigger: card, start: "top 95%", toggleActions: "play none none reverse" },
            x: i % 2 === 0 ? -50 : 50, opacity: 0, duration: 0.7, ease: "power3.out",
          });
          card.addEventListener("mouseenter", () => gsap.to(card, { y: -8, scale: 1.03, duration: 0.3 }));
          card.addEventListener("mouseleave", () => gsap.to(card, { y: 0, scale: 1, duration: 0.4, ease: "power2.out" }));
        });
      }

      /* ── 7. Video Play/Reel fly-in ── */
      if (videoRef.current) {
        gsap.from(playRef.current, {
          scrollTrigger: { trigger: videoRef.current, start: "top 75%" },
          x: -100, opacity: 0, duration: 1, ease: "expo.out",
        });
        gsap.from(reelRef.current, {
          scrollTrigger: { trigger: videoRef.current, start: "top 75%" },
          x: 100, opacity: 0, duration: 1, ease: "expo.out",
        });
        gsap.from(videoRef.current.querySelector(".video-box"), {
          scrollTrigger: { trigger: videoRef.current, start: "top 80%" },
          scale: 0.75, opacity: 0, duration: 1.2, ease: "power4.out",
        });

        const videoBox = videoRef.current.querySelector(".video-box");
        const hoverIn  = () => gsap.to([playRef.current, reelRef.current], { opacity: 1,   duration: 0.4 });
        const hoverOut = () => gsap.to([playRef.current, reelRef.current], { opacity: 0.3, duration: 0.4 });
        videoBox.addEventListener("mouseenter", hoverIn);
        videoBox.addEventListener("mouseleave", hoverOut);
        return () => {
          videoBox.removeEventListener("mouseenter", hoverIn);
          videoBox.removeEventListener("mouseleave", hoverOut);
        };
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="main-wrapper">
      <Cursor />
      <Hero />

      {/* ── New In ── */}
      <div className="new-in-products no-cursor">
        <div className="contain">
          <div className="new-in-heading Medium">
            <p ref={newInHeadRef}>
              {"New-in".split("").map((char, i) => (
                <span key={i} style={{ display: "inline-block" }}>
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </p>
            <button className="discover" ref={discoverBtn}>
              <Link href="/shopAll">Discover Now</Link>
            </button>
          </div>
          <ul className="new-in-box" ref={cardsRef}>
            {newInProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </ul>
        </div>
      </div>

      {/* ── Banner ── */}
      <div className="container3 overflow-hidden" ref={bannerRef}>
        <img src="/bg2/cdb320206200575.66c83e19eb199.png" />
        <div className="text2" ref={bannerTextRef}>
          <h1 className="Roman">Build outfits effortlessly</h1>
          <p className="thin">Create your own Wardrobe.</p>
        </div>
        <Link id="shop2" href="/stylist" className="no-cursor">
          <button className="shopall-btn" ref={createBtn}>CREATE</button>
        </Link>
      </div>

      {/* ── Wardrobe Hero (after banner) ── */}
      {/* GSAP wraps this div for the section-level clip entrance */}
      <div ref={wardrobeRef} style={{ willChange: "clip-path, opacity, transform" }}>
        <WardrobeHero />
      </div>

      {/* ── Best Seller ── */}
      <div className="best-seller-products no-cursor">
        <div className="contain">
          <div className="new-in-heading Medium" ref={bestHeadRef}>Best Seller</div>
          <ul className="best-seller-box" ref={bestCardsRef}>
            {bestSellerProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </ul>
        </div>
      </div>

      {/* ── Video ── */}
      <div className="video-container" ref={videoRef}>
        <div className="video-content" onClick={() => setIsPopupOpen(true)}>
          <h1 className="Roman" id="Play" ref={playRef}>Play</h1>
          <div className="box6-img">
            <img src="/Path52.svg" alt="play-path" />
            <div className="video-box no-cursor">
              <video src="/fashion.mp4" loop autoPlay muted width="100%" />
            </div>
          </div>
          <h1 className="Roman" id="Reel" ref={reelRef}>Reel</h1>
        </div>

        {isPopupOpen && (
          <div
            className={`popup ${isPopupOpen ? "active" : ""} no-cursor`}
            style={{ display: "flex", width: "100%" }}
          >
            <div className="popup-video">
              <div className="cross-div">
                <button className="cross" onClick={() => setIsPopupOpen(false)}>X</button>
              </div>
              <div className="popup-video-box">
                <video controls src="/music.mp4" width="100%" autoPlay />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
