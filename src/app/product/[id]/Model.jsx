"use client";

import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export default function Model({ modelPath, textureUrl }) {
  const { scene } = useGLTF(modelPath);

  // load product image
  const texture = useTexture(textureUrl || null);

  useEffect(() => {
    if (!texture) return;

    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;

    scene.traverse((child) => {
      if (child.isMesh && child.name === "Object_116") {
        child.material.map = texture;
        child.material.needsUpdate = true;
        child.material.side = THREE.FrontSide;
      }
    });
  }, [scene, texture]);
  useEffect(() => {
  scene.traverse((child) => {
    if (child.isMesh) {
      console.log("Mesh name:", child.name);
    }
  });
}, [scene]);

  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} />;
}