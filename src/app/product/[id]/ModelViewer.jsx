"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Mannequin from "./Mannequin";

export default function ModelViewer({ texture }) {
  return (
    <Canvas camera={{ position: [0, 1.5, 3] }}>
      <ambientLight intensity={1} />
      <Mannequin texture={texture} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}