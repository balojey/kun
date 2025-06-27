'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

// Floating wireframe sphere
function FloatingWireframeSphere({ position, scale, speed }: { 
  position: [number, number, number]; 
  scale: number; 
  speed: number; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Use logo colors for the wireframes
  const color = '#00d4ff'; // Logo blue

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += speed * 0.2;
    meshRef.current.rotation.y += speed * 0.12;
    meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed * 0.5) * 0.4;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
    </mesh>
  );
}

// Abstract floating geometry
function FloatingGeometry({ position, geometry, scale, speed }: {
  position: [number, number, number];
  geometry: 'torus' | 'octahedron' | 'icosahedron';
  scale: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = '#0099cc'; // Logo gradient color

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += speed * 0.15;
    meshRef.current.rotation.z += speed * 0.08;
    meshRef.current.position.x = position[0] + Math.cos(clock.elapsedTime * speed * 0.2) * 0.2;
    meshRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed * 0.3) * 0.25;
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'torus': return <torusGeometry args={[1, 0.3, 8, 16]} />;
      case 'octahedron': return <octahedronGeometry args={[1, 0]} />;
      case 'icosahedron': return <icosahedronGeometry args={[1, 0]} />;
      default: return <sphereGeometry args={[1, 8, 6]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {renderGeometry()}
      <meshBasicMaterial color={color} wireframe transparent opacity={0.15} />
    </mesh>
  );
}

// Perspective grid with logo colors
function PerspectiveGrid() {
  const gridRef = useRef<THREE.Group>(null);
  const color = '#00d4ff'; // Logo blue

  const lines = useMemo(() => {
    const geometries = [];
    for (let i = -10; i <= 10; i += 2) {
      geometries.push([[ -10, i, 0 ], [ 10, i, 0 ]]); // Horizontal lines
      geometries.push([[ i, -10, 0 ], [ i, 10, 0 ]]); // Vertical lines
    }
    return geometries;
  }, []);

  useFrame(({ clock }) => {
    if (!gridRef.current) return;
    gridRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.05) * 0.08;
    gridRef.current.position.z = -5 + Math.sin(clock.elapsedTime * 0.1) * 0.3;
  });

  return (
    <group ref={gridRef} position={[0, 0, -8]} rotation={[Math.PI / 6, 0, 0]}>
      {lines.map((pts, i) => (
        <line key={i}>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array(pts.flat())}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.1} />
        </line>
      ))}
    </group>
  );
}

// Main scene setup
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <FloatingWireframeSphere position={[-4, 2, -3]} scale={0.8} speed={0.3} />
      <FloatingWireframeSphere position={[5, -1, -4]} scale={1.2} speed={0.2} />
      <FloatingWireframeSphere position={[-2, -3, -2]} scale={0.6} speed={0.4} />
      <FloatingGeometry position={[3, 3, -5]} geometry="torus" scale={0.5} speed={0.25} />
      <FloatingGeometry position={[-5, -2, -6]} geometry="octahedron" scale={0.7} speed={0.35} />
      <FloatingGeometry position={[2, -4, -3]} geometry="icosahedron" scale={0.4} speed={0.3} />
      <PerspectiveGrid />
    </>
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        style={{ background: 'transparent', pointerEvents: 'none' }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}