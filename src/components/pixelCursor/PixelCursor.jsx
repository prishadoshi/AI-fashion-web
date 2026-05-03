// "use client";

// import { useRef } from "react";
// import gsap from "gsap";
// import { useGSAP } from "@gsap/react";
// import './style.css';

// const PixelCursor = () => {
//   const container = useRef(null);

//   useGSAP(() => {
//     const pixels = gsap.utils.toArray(".pixel");

//     let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

//     window.addEventListener("mousemove", (e) => {
//       mouse.x = e.clientX;
//       mouse.y = e.clientY;

//       pixels.forEach((pixel, i) => {
//         gsap.to(pixel, {
//           x: mouse.x,
//           y: mouse.y,
//           duration: 0.4 + i * 0.03,
//           ease: "power3.out",
//         });
//       });
//     });
//   }, { scope: container });

//   return (
//     <div ref={container} className="pixel-container">
//       {Array.from({ length: 15 }).map((_, i) => (
//         <div key={i} className="pixel" />
//       ))}
//     </div>
//   );
// };

// export default PixelCursor;