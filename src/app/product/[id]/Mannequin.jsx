import { useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";


export default function Mannequin({ texture }) {
  const { scene } = useGLTF("/models/mannequin.glb");
  const clothTexture = useTexture(texture);
    const ref = useRef();

    useFrame(({ mouse }) => {
    ref.current.rotation.y = mouse.x * 0.6;
    });
  scene.traverse((child) => {
    if (child.isMesh && child.name === "Shirt") {
      child.material.map = clothTexture;
    }
  });

  return <primitive object={scene} />;
}