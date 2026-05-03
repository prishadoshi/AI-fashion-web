"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useRef } from "react";

function BrainParticles() {
  const ref = useRef();

  const positions = new Float32Array(5000 * 3);

  for (let i = 0; i < 5000; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.05;
  });

  return (
    <Points ref={ref} positions={positions}>
      <PointMaterial
        transparent
        size={0.02}
        color="#ffffff"
        depthWrite={false}
      />
    </Points>
  );
}

export default function BrainBackground() {
  return (
    <Canvas className="canvas">
      <BrainParticles />
    </Canvas>
  );
}