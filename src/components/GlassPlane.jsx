"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders";
function GlassPlane() {
  const meshRef = useRef();
  const { viewport, size } = useThree();
  const texture = useTexture("/dark.jpg");
    texture.matrixAutoUpdate = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

  // We use a ref for uniforms so we can update them directly without re-renders
  const uniforms = useMemo(() => ({
    uTexture: { value: texture },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uTextureSize: { value: new THREE.Vector2(1, 1) }, // Initialize with 1
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uParallaxStrength: { value: 0.1 },
    uDistortionMultiplier: { value: 10.0 },
    uGlassStrength: { value: 2.0 },
    ustripesFrequency: { value: 35.0 },
    uglassSmoothness: { value: 0.0001 },
    uEdgePadding: { value: 0.1 },
  }), [texture]);

  useFrame((state) => {
    const { x, y } = state.mouse;
    
    // Update resolution and texture size every frame to catch resize/load events
    uniforms.uResolution.value.set(state.size.width, state.size.height);
    
    if (texture.image) {
      uniforms.uTextureSize.value.set(
        texture.image.naturalWidth || texture.image.width,
        texture.image.naturalHeight || texture.image.height
      );
    }

    uniforms.uMouse.value.x = THREE.MathUtils.lerp(uniforms.uMouse.value.x, (x + 1) / 2, 0.035);
    uniforms.uMouse.value.y = THREE.MathUtils.lerp(uniforms.uMouse.value.y, (y + 1) / 2, 0.035);
  });

  return (
    // Scale must match the viewport to cover the screen
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="hero" style={{ width: "100%", height: "100vh", background: "#000" }}>
      <Canvas
        // This ensures the pixel ratio is consistent with the browser
        dpr={[1, 2]} 
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <GlassPlane />
      </Canvas>
      
      {/* UI Overlay */}
      {/* <div className="hero-content" style={{ position: "absolute", bottom: "2rem", left: "2rem", pointerEvents: "none", color: "white" }}>
        <h1>Designed for the space between the silence and noise</h1>
        <p>Developed by Codegrid</p>
      </div> */}
    </div>
  );
}