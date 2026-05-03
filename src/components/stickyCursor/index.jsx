// "use client";
// import { useEffect, useRef } from "react";

// const PIXEL_SIZE = 25;
// const COLORS = [
//   "#818181", // Dark Gray
//   "#929292", // Muted Gray
//   "#adacac", // Grayish Silver
//   "#bbbbbb", // Soft Gray
//   "#dddddd", // Very Light Gray (fades out)
// ];
// const FADE_SPEED = 0.03;

// export default function Cursor() {
//   const canvasRef = useRef(null);
//   const pixelsRef = useRef([]);
//   const lastPosRef = useRef({ x: -999, y: -999 });
//   const frameRef = useRef(0);
//   const rafRef = useRef(null);
//   const visibleRef = useRef(false);
//   const mouseRef = useRef({ x: -100, y: -100 });
//   const smoothMouseRef = useRef({ x: -100, y: -100 });
//   const magneticTargetRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");

//     const resize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);

//     const BUFFER = 15; // Extra space in pixels

//     const onMouseMove = (e) => {
//       const navElement = document.querySelector(".navbar");
//       const dropDown = document.querySelector(".down-bar");
//       const navSearch = document.querySelector(".search-bar.active");
//       const allButtons = document.querySelectorAll(".no-cursor");

//       const BUFFER = 15;

//       for (let btn of allButtons) {
//         const rect = btn.getBoundingClientRect();
//         const insideBtn =
//           e.clientX >= rect.left - BUFFER &&
//           e.clientX <= rect.right + BUFFER &&
//           e.clientY >= rect.top - BUFFER &&
//           e.clientY <= rect.bottom + BUFFER;

//         if (insideBtn) {
//           visibleRef.current = false;
//           return; // stop further checks
//         }
//       }

//       const magnetEls = document.querySelectorAll(".magnetic");

//       let foundMagnet = null;

//       magnetEls.forEach((el) => {
//         const rect = el.getBoundingClientRect();

//         const centerX = rect.left + rect.width / 2;
//         const centerY = rect.top + rect.height / 2;

//         const dx = e.clientX - centerX;
//         const dy = e.clientY - centerY;

//         const dist = Math.sqrt(dx * dx + dy * dy);

//         if (dist < 120) {
//           foundMagnet = { x: centerX, y: centerY };
//         }
//       });

//       magneticTargetRef.current = foundMagnet;

//       if (!navElement) {
//         mouseRef.current = { x: e.clientX, y: e.clientY };
//         return;
//       }

//       const navRect = navElement.getBoundingClientRect();

//       // Initialize block with navbar dimensions + buffers
//       let blockLeft = navRect.left - BUFFER; // Add left buffer
//       let blockRight = navRect.right + BUFFER + 15; // Add right buffer
//       let blockBottom = navRect.bottom + BUFFER;

//       // Expand the block if the dropdown is open
//       if (dropDown) {
//         const r = dropDown.getBoundingClientRect();
//         blockLeft = Math.min(blockLeft, r.left - BUFFER);
//         blockRight = Math.max(blockRight, r.right + BUFFER + 15);
//         blockBottom = Math.max(blockBottom, r.bottom + BUFFER);
//       }

//       // Expand the block if the search bar is active
//       if (navSearch) {
//         const r = navSearch.getBoundingClientRect();
//         blockLeft = Math.min(blockLeft, r.left - BUFFER);
//         blockRight = Math.max(blockRight, r.right + BUFFER + 15);
//         blockBottom = Math.max(blockBottom, r.bottom + BUFFER);
//       }

//       const insideHorizontally =
//         e.clientX >= blockLeft && e.clientX <= blockRight;
//       const insideVertically = e.clientY < blockBottom;

//       if (insideHorizontally && insideVertically) {
//         visibleRef.current = false;
//       } else {
//         visibleRef.current = true;
//         mouseRef.current = { x: e.clientX, y: e.clientY };
//       }
//     };
//     window.addEventListener("mousemove", onMouseMove);

//     const spawnPixel = (x, y) => {
//       const gx = Math.round(x / PIXEL_SIZE) * PIXEL_SIZE;
//       const gy = Math.round(y / PIXEL_SIZE) * PIXEL_SIZE;

//       pixelsRef.current.push({
//         x: gx,
//         y: gy,
//         alpha: 0.85 + Math.random() * 0.15,
//         color: COLORS[Math.floor(Math.random() * COLORS.length)],
//         fadeDelay: Math.random() * 0.4,
//         age: 0,
//       });
//     };

//     const loop = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       let targetX = mouseRef.current.x;
//       let targetY = mouseRef.current.y;

//       if (magneticTargetRef.current) {
//         targetX += (magneticTargetRef.current.x - targetX) * 0.12;

//         targetY += (magneticTargetRef.current.y - targetY) * 0.12;
//       }
//       const LERP = 0.18; // lower = smoother/lazier, higher = snappier
//       if (visibleRef.current) {
//   smoothMouseRef.current.x +=
//     (targetX - smoothMouseRef.current.x) * LERP;

//   smoothMouseRef.current.y +=
//     (targetY - smoothMouseRef.current.y) * LERP;
// }

//       const { x, y } = smoothMouseRef.current; // use this everywhere instead

//       const last = lastPosRef.current;

//       frameRef.current++;
//       if (
//         frameRef.current % 2 === 0 &&
//         (Math.abs(x - last.x) > 2 || Math.abs(y - last.y) > 2)
//       ) {
//         spawnPixel(x, y);
//         lastPosRef.current = { x, y };
//       }

//       pixelsRef.current = pixelsRef.current.filter((p) => p.alpha > 0);
//       // Inside the loop() function, where you draw the pixels:
//       // Inside your loop() function
//       pixelsRef.current.forEach((p) => {
//         p.age += 0.016;
//         if (p.age > p.fadeDelay) p.alpha -= FADE_SPEED;

//         const navElement = document.querySelector(".navbar");
//         const dropDown = document.querySelector(".down-bar");
//         const navSearch = document.querySelector(".search-bar.active");
//         const BUFFER = 20;

//         if (navElement) {
//           const navRect = navElement.getBoundingClientRect();

//           // Determine the total boundary for existing pixels
//           let bLeft = navRect.left - BUFFER;
//           let bRight = navRect.right + BUFFER + 15;
//           let bBottom = navRect.bottom + BUFFER;

//           if (dropDown) {
//             const r = dropDown.getBoundingClientRect();
//             bLeft = Math.min(bLeft, r.left - BUFFER);
//             bRight = Math.max(bRight, r.right + BUFFER + 15);
//             bBottom = Math.max(bBottom, r.bottom + BUFFER);
//           }

//           if (navSearch) {
//             const r = navSearch.getBoundingClientRect();
//             bLeft = Math.min(bLeft, r.left - BUFFER);
//             bRight = Math.max(bRight, r.right + BUFFER + 10);
//             bBottom = Math.max(bBottom, r.bottom + BUFFER);
//           }

//           // Kill pixel if it's anywhere inside the expanded boundary
//           const inX = p.x >= bLeft && p.x <= bRight;
//           const inY = p.y < bBottom;

//           if (inX && inY) {
//             p.alpha = 0;
//           }
//         }

//         ctx.globalAlpha = Math.max(0, p.alpha);
//         ctx.fillStyle = p.color;

//         ctx.fillRect(
//           p.x - PIXEL_SIZE / 2,
//           p.y - PIXEL_SIZE / 2,
//           PIXEL_SIZE,
//           PIXEL_SIZE,
//         );
//       });
//       // Draw cursor pixel
//       const gx = Math.round(x / PIXEL_SIZE) * PIXEL_SIZE;
//       const gy = Math.round(y / PIXEL_SIZE) * PIXEL_SIZE;

//       if (visibleRef.current) {
//         // ✅ only draw when visible
//         ctx.globalAlpha = 0.18;
//         ctx.fillStyle = "#888";
//         ctx.fillRect(
//           gx - PIXEL_SIZE / 2 - 3,
//           gy - PIXEL_SIZE / 2 - 3,
//           PIXEL_SIZE + 6,
//           PIXEL_SIZE + 6,
//         );

//         ctx.globalAlpha = 1;
//         ctx.fillStyle = "#838282";
//         ctx.fillRect(
//           gx - PIXEL_SIZE / 2,
//           gy - PIXEL_SIZE / 2,
//           PIXEL_SIZE,
//           PIXEL_SIZE,
//         );

//         ctx.globalAlpha = 0.55;
//         ctx.fillStyle = "#fff";
//         ctx.fillRect(gx - PIXEL_SIZE / 2 + 3, gy - PIXEL_SIZE / 2 + 3, 4, 4);

//         ctx.globalAlpha = 1;
//       }
//       rafRef.current = requestAnimationFrame(loop);
//     };

//     loop();

//     return () => {
//       cancelAnimationFrame(rafRef.current);
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         pointerEvents: "none",
//         zIndex: 1,
//       }}
//     />
//   );
// }
