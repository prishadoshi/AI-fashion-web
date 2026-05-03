"use client";

import { useGLTF, Center, Html, OrbitControls } from "@react-three/drei";
import { useState, useMemo, useRef, useLayoutEffect, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";

function Model({ modelPath, productInfo }) {
  const gltf = useGLTF(modelPath);
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState(new THREE.Vector3());

  const SHIRT_MESH_NAME = "hoodie_zani_0_Default_FRONT_3061_0";
  const anchorPos = useRef(new THREE.Vector3());
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const shirtMesh = useMemo(() => {
  let found = null;
  scene.traverse((child) => {
    if (child.isMesh && child.name === SHIRT_MESH_NAME) {
      found = child;
    }
  });
  return found;
}, [scene]);
  
  useLayoutEffect(() => {
  if (!scene) return;
  scene.updateWorldMatrix(true, true);

  scene.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
      child.material.transparent = false;
      child.material.opacity = 1;
      if (child.material.map) child.material.map.flipY = false;
    }
  });

  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const height = size.y;

  scene.position.set(-center.x, -center.y, -center.z);

  const fov = THREE.MathUtils.degToRad(camera.fov);
  const distance = (height / (2 * Math.tan(fov / 2))) * 1.3;
  const lookY = height * 0.15;

  camera.position.set(0, lookY + height * 0.4, distance);
  camera.lookAt(0, lookY, 0);
  camera.updateProjectionMatrix();

  // ✅ Recompute AFTER scene.position is set — world matrix is now correct
  if (shirtMesh) {
    // Force world matrix update AFTER scene has been repositioned
    scene.updateWorldMatrix(true, true);
    shirtMesh.updateWorldMatrix(true, true);

    const shirtBox = new THREE.Box3().setFromObject(shirtMesh);
    const shirtCenter = shirtBox.getCenter(new THREE.Vector3());
    const shirtSize = shirtBox.getSize(new THREE.Vector3());

    anchorPos.current.set(
      shirtCenter.x + shirtSize.x * 0.35,
      shirtCenter.y + 0.05,
      shirtCenter.z
    );
  }
}, [scene, camera, shirtMesh]);
  return (
    <Center>
      <primitive
        object={scene}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          setHovered(false);
        }}
      />

      {hovered && (
        <Html
          position={anchorPos.current}
          center={false}
          distanceFactor={10}
          style={{ pointerEvents: "none", zIndex: 1000 }}
        >
          <div className="annotation-container">
            <div className="annotation-line" />
            <div className="annotation-card">
              <span className="name">{productInfo.title}</span>
              <span className="size">Size: L</span>
            </div>
          </div>
        </Html>
      )}
    </Center>
  );
}

export default function ProductVisualizer({
  modelPath,
  visible,
  onClose,
  productData,
}) {
  // Default data if none is passed
  const info = productData || { name: "Premium Hoodie", size: "L" };
  console.log(info);
  return (
    <div className={`viewer-overlay ${visible ? "open" : ""}`}>
      <button className="viewer-overlay-close" onClick={onClose}>
        ✕
      </button>

      <Canvas camera={{ fov: 40 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} />

        <Suspense fallback={null}>
          {modelPath && <Model modelPath={modelPath} productInfo={info} />}
        </Suspense>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          target={[0, 0.6, 0]}
        />
      </Canvas>
    </div>
  );
}
