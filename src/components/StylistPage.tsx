"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

export default function StylistPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const hero = canvas.parentElement!;

    /* ── 1. Setup Renderer ── */
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" 
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(hero.clientWidth, hero.clientHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, hero.clientWidth / hero.clientHeight, 0.1, 1000);
    camera.position.z = 80;

    /* ── 2. Optimized Particles ── */
    const COUNT = 1800;
    const pos = new Float32Array(COUNT * 3);
    const sz = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
      sz[i] = Math.random() * 2.5 + 0.5;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(sz, 1));

    const particleMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xc9a96e) },
      },
      vertexShader: `
        attribute float size; uniform float uTime;
        void main() {
          vec3 p = position;
          p.y += sin(uTime*.3+p.x*.05)*.8;
          p.x += cos(uTime*.2+p.y*.04)*.5;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = size * (300.0 / -gl_Position.z);
        }`,
      fragmentShader: `
        uniform vec3 uColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if(d > 0.5) discard;
          gl_FragColor = vec4(uColor, (1.0 - d * 2.0) * 0.35);
        }`,
    });
    const points = new THREE.Points(particleGeo, particleMat);
    scene.add(points);

    /* ── 3. Optimized Grid (Single Geometry) ── */
    const gridPoints: THREE.Vector3[] = [];
    for (let i = -10; i <= 10; i++) {
      gridPoints.push(new THREE.Vector3(-120, i * 12, -20), new THREE.Vector3(120, i * 12, -20));
      gridPoints.push(new THREE.Vector3(i * 12, -120, -20), new THREE.Vector3(i * 12, 120, -20));
    }
    const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridMat = new THREE.LineBasicMaterial({ color: 0xc9a96e, transparent: true, opacity: 0.04 });
    const grid = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(grid);

    /* ── 4. Interaction ── */
    let mx = 0, my = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onResize = () => {
      camera.aspect = hero.clientWidth / hero.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(hero.clientWidth, hero.clientHeight);
    };

    window.addEventListener("mousemove", onMouse);
    window.addEventListener("resize", onResize);

    /* ── 5. Animation ── */
    let t = 0;
    const tick = () => {
      animIdRef.current = requestAnimationFrame(tick);
      t += 0.008;
      particleMat.uniforms.uTime.value = t;
      points.rotation.y = t * 0.04 + mx * 0.08;
      points.rotation.x = my * 0.04;
      camera.position.x += (mx * 6 - camera.position.x) * 0.04;
      camera.position.y += (-my * 4 - camera.position.y) * 0.04;
      renderer.render(scene, camera);
    };
    tick();

    /* ── 6. GSAP (Remains the same) ── */
    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(".hero-side-line", { height: 180, duration: 0.9, ease: "power2.out" }, 0.1)
      .to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.7 }, 0.3)
      .to(".hero-line-1, .hero-line-2, .hero-line-3", { y: "0%", duration: 0.9, stagger: 0.15, ease: "power3.out" }, 0.45)
      .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, 1.0)
      .to(".hero-cta", { opacity: 1, y: 0, duration: 0.7 }, 1.2)
      .to(".hero-stats", { opacity: 1, x: 0, duration: 0.8 }, 1.1)
      .to(".hero-scroll", { opacity: 1, duration: 0.6 }, 1.6)
      .to(".hero-tag", { opacity: 1, stagger: 0.08, duration: 0.6 }, 1.3);

    /* ── 7. STRICTOR CLEANUP ── */
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animIdRef.current);

      // Manual disposal
      particleGeo.dispose();
      particleMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      rendererRef.current = null;
      
      // Kill all GSAP animations for this component
      gsap.killTweensOf(".hero-tag, .hero-line-1, .hero-line-2, .hero-line-3, .hero-side-line");
    };
  }, []);

  const TAGS = ["Outerwear", "Accessories", "Tailoring", "Knitwear", "Denim", "Athleisure", "Suiting"];

  return (
    <section className="stylist-hero">
      <canvas ref={canvasRef} className="webgl-canvas" />
      <div className="vignette-overlay" />
      <div className="tags-container">
        {TAGS.map((t, i) => (
          <div key={t} className="hero-tag" style={{ left: `${8 + (i * 13) % 84}%`, top: `${10 + (i * 17) % 80}%` }}>{t}</div>
        ))}
      </div>
      <div className="hero-side-line" />
      <div className="hero-content">
        <p className="hero-eyebrow">AI-Powered Style Studio</p>
        <h1 className="hero-title">
          <span className="line-wrapper"><span className="hero-line-1">Dress the</span></span>
          <span className="line-wrapper"><span className="hero-line-2 italic-text">Future</span></span>
          <span className="line-wrapper"><span className="hero-line-3">of You.</span></span>
        </h1>
        <p className="hero-sub">Drag, layer, and style your wardrobe on an infinite canvas. AI removes backgrounds, recommends pairings, and saves your looks.</p>
        <div className="hero-cta">
          <button className="btn-primary">Start Styling</button>
          <button className="btn-secondary">View Lookbook</button>
        </div>
      </div>
      <div className="hero-stats">
        {[["cnt1", "Items Styled"], ["cnt2", "Outfits Saved"], ["cnt3", "AI Matches"]].map(([id, label]) => (
          <div key={id} className="stat-item">
            <div id={id} className="stat-number">0</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>
      <div className="hero-scroll"><div className="scroll-line" /></div>
      <style>{`
        .stylist-hero { position:relative; width:100%; height:100vh; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#0a0a0a; color:#f0ece4; }
        .webgl-canvas { position:absolute; inset:0; }
        .vignette-overlay { position:absolute; inset:0; z-index:2; background:radial-gradient(circle, transparent 20%, #0a0a0a 100%); pointer-events:none; }
        .tags-container { position:absolute; inset:0; z-index:3; pointer-events:none; }
        .hero-tag { position:absolute; font-size:10px; text-transform:uppercase; color:rgba(201,169,110,0.3); opacity:0; }
        .hero-side-line { position:absolute; left:48px; top:50%; transform:translateY(-50%); width:1px; height:0; background:rgba(201,169,110,0.3); }
        .hero-content { position:relative; z-index:10; text-align:center; }
        .hero-eyebrow { font-size:11px; letter-spacing:3px; color:#c9a96e; opacity:0; }
        .hero-title { font-size:clamp(50px, 8vw, 100px); line-height:1; }
        .line-wrapper { display:block; overflow:hidden; }
        .hero-line-1, .hero-line-2, .hero-line-3 { display:block; transform:translateY(100%); }
        .italic-text { color:#c9a96e; font-style:italic; }
        .hero-sub { opacity:0; max-width:500px; margin:20px auto; color:rgba(240,236,228,0.5); }
        .hero-cta { opacity:0; display:flex; gap:20px; justify-content:center; }
        .btn-primary { background:#c9a96e; padding:15px 30px; border:none; cursor:pointer; }
        .btn-secondary { border:1px solid #c9a96e; background:transparent; color:#c9a96e; padding:15px 30px; cursor:pointer; }
        .hero-stats { position:absolute; bottom:50px; right:50px; text-align:right; opacity:0; }
        .stat-number { font-size:30px; color:#c9a96e; }
        .stat-label { font-size:10px; opacity:0.5; }
        .hero-scroll { position:absolute; bottom:30px; opacity:0; }
        .scroll-line { width:1px; height:40px; background:#c9a96e; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
      `}</style>
    </section>
  );
}