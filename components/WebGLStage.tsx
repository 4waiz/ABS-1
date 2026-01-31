"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function WobbleMesh({
  color,
  position,
  scale,
  speed,
  shape = "knot",
}: {
  color: string;
  position: [number, number, number];
  scale: number;
  speed: number;
  shape?: "knot" | "sphere" | "torus";
}) {
  const ref = React.useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = t * 0.6;
    ref.current.rotation.y = t * 0.8;
    ref.current.position.y = position[1] + Math.sin(t) * 0.2;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      {shape === "knot" && <torusKnotGeometry args={[1, 0.35, 120, 16]} />}
      {shape === "sphere" && <icosahedronGeometry args={[1.1, 0]} />}
      {shape === "torus" && <torusGeometry args={[1, 0.35, 16, 60]} />}
      <meshToonMaterial color={color} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} />
      <directionalLight position={[-4, -2, 4]} intensity={0.4} />
      <WobbleMesh color="#38bdf8" position={[-1.4, 0.2, 0]} scale={0.6} speed={0.8} shape="torus" />
      <WobbleMesh color="#f97316" position={[1.4, -0.1, 0]} scale={0.55} speed={1.1} shape="sphere" />
      <WobbleMesh color="#f472b6" position={[0, 0.1, -0.6]} scale={0.5} speed={0.9} shape="knot" />
    </>
  );
}

export function WebGLStage({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
