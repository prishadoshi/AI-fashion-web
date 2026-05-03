// "use client"; // Critical: Three.js needs the browser window
// import { useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { vertexShader, fragmentShader } from './shaders';

// export default function GlassHero() {
//   const containerRef = useRef(null);
//   const imageRef = useRef(null);

//   useEffect(() => {
//     if (!containerRef.current || !imageRef.current) return;

//     // --- Scene Setup ---
//     const scene = new THREE.Scene();
//     const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//     containerRef.current.appendChild(renderer.domElement);

//     const mouse = new THREE.Vector2(0.5, 0.5);
//     const targetMouse = new THREE.Vector2(0.5, 0.5);

//     // --- Material & Mesh ---
//     const material = new THREE.ShaderMaterial({
//       uniforms: {
//         uTexture: { value: null },
//         uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
//         uTextureSize: { value: new THREE.Vector2(1, 1) },
//         uMouse: { value: mouse },
//         uParallaxStrength: { value: 0.1 },
//         uDistortionMultiplier: { value: 10.0 },
//         uGlassStrength: { value: 2.0 },
//         ustripesFrequency: { value: 35.0 },
//         uglassSmoothness: { value: 0.0001 },
//         uEdgePadding: { value: 0.1 },
//       },
//       vertexShader,
//       fragmentShader,
//     });

//     const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
//     scene.add(mesh);

//     // --- Load Texture ---
//     const loader = new THREE.TextureLoader();
//     loader.load('/hero_lemonlitt.webp', (texture) => {
//       material.uniforms.uTexture.value = texture;
//       material.uniforms.uTextureSize.value.set(
//         texture.image.naturalWidth,
//         texture.image.naturalHeight
//       );
//     });

//     // --- Events ---
//     const handleMouseMove = (e) => {
//       targetMouse.x = e.clientX / window.innerWidth;
//       targetMouse.y = 1.0 - e.clientY / window.innerHeight;
//     };

//     const handleResize = () => {
//       renderer.setSize(window.innerWidth, window.innerHeight);
//       material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
//     };

//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("resize", handleResize);

//     // --- Animation Loop ---
//     const animate = () => {
//       const lerpFactor = 0.035;
//       mouse.x += (targetMouse.x - mouse.x) * lerpFactor;
//       mouse.y += (targetMouse.y - mouse.y) * lerpFactor;
      
//       renderer.render(scene, camera);
//       requestAnimationFrame(animate);
//     };
//     animate();

//     // --- Cleanup ---
//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("resize", handleResize);
//       renderer.dispose();
//       containerRef.current?.removeChild(renderer.domElement);
//     };
//   }, []);

//   return (
//     <section className="hero" ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
//       {/* The original image is hidden, used only for reference if needed */}
//       <img 
//         ref={imageRef} 
//         src="/woman-coat.avif" 
//         alt="Texture Source" 
//         style={{ display: 'none' }} 
//       />
//       <div className="hero-content" style={{ position: 'absolute', zIndex: 10, bottom: '2rem', left: '2rem' }}>
//         <h1>Designed for the space between the silence and noise</h1>
//         <p>Developed by Codegrid</p>
//       </div>
//     </section>
//   );
// }