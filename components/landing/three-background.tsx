'use client';

import { Canvas } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

// Floating wireframe sphere component
function FloatingWireframeSphere({ position, scale, speed }: { 
  position: [number, number, number]; 
  scale: number; 
  speed: number; 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.5;
      meshRef.current.rotation.y += speed * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  const color = theme === 'dark' ? '#3B82F6' : '#1E40AF';

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.15}
      />
    </mesh>
  );
}

// Abstract floating geometry component
function FloatingGeometry({ position, geometry, scale, speed }: {
  position: [number, number, number];
  geometry: 'torus' | 'octahedron' | 'icosahedron';
  scale: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += speed * 0.4;
      meshRef.current.rotation.z += speed * 0.2;
      meshRef.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * speed * 0.5) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed * 0.7) * 0.4;
    }
  });

  const color = theme === 'dark' ? '#60A5FA' : '#2563EB';

  const renderGeometry = () => {
    switch (geometry) {
      case 'torus':
        return <torusGeometry args={[1, 0.3, 8, 16]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 0]} />;
      default:
        return <sphereGeometry args={[1, 8, 6]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {renderGeometry()}
      <meshBasicMaterial 
        color={color} 
        wireframe 
        transparent 
        opacity={0.1}
      />
    </mesh>
  );
}

// Perspective grid component
function PerspectiveGrid() {
  const gridRef = useRef<THREE.Group>(null);
  const { theme } = useTheme();

  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      gridRef.current.position.z = -5 + Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  const lines = useMemo(() => {
    const lineGeometries = [];
    const color = theme === 'dark' ? '#1E40AF' : '#3B82F6';
    
    // Horizontal lines
    for (let i = -10; i <= 10; i += 2) {
      const points = [
        new THREE.Vector3(-10, i, 0),
        new THREE.Vector3(10, i, 0)
      ];
      lineGeometries.push({ points, color });
    }
    
    // Vertical lines
    for (let i = -10; i <= 10; i += 2) {
      const points = [
        new THREE.Vector3(i, -10, 0),
        new THREE.Vector3(i, 10, 0)
      ];
      lineGeometries.push({ points, color });
    }
    
    return lineGeometries;
  }, [theme]);

  return (
    <group ref={gridRef} position={[0, 0, -8]} rotation={[Math.PI / 6, 0, 0]}>
      {lines.map((line, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={line.points.length}
              array={new Float32Array(line.points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={line.color} transparent opacity={0.08} />
        </line>
      ))}
    </group>
  );
}

// Main scene component
function Scene() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      
      {/* Floating wireframe spheres */}
      <FloatingWireframeSphere position={[-4, 2, -3]} scale={0.8} speed={0.3} />
      <FloatingWireframeSphere position={[5, -1, -4]} scale={1.2} speed={0.2} />
      <FloatingWireframeSphere position={[-2, -3, -2]} scale={0.6} speed={0.4} />
      
      {/* Abstract geometries */}
      <FloatingGeometry position={[3, 3, -5]} geometry="torus" scale={0.5} speed={0.25} />
      <FloatingGeometry position={[-5, -2, -6]} geometry="octahedron" scale={0.7} speed={0.35} />
      <FloatingGeometry position={[2, -4, -3]} geometry="icosahedron" scale={0.4} speed={0.3} />
      
      {/* Perspective grid */}
      <PerspectiveGrid />
    </>
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Canvas
        camera={{ 
          position: [0, 0, 5], 
          fov: 60,
          near: 0.1,
          far: 100
        }}
        style={{ 
          background: 'transparent',
          pointerEvents: 'none'
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}