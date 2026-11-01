'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from '../utils/coordinates';

export interface RoverData {
    _id: string;
  roverId: string;
  name: string;
  status: 'idle' | 'active' | 'returning' | 'warning' | 'failed';
  position: { lat: number; lng: number };
  battery?: number;
  speed?: number;
  communication?: string;
  distanceFromBase?: number;
  currentTask?: { name: string; type: string; status: string } | null;
}

interface RoverMarkerProps {
  rover: RoverData;
  onSelect: (rover: RoverData) => void;
  radius?: number;
}

const statusColors: Record<string, string> = {
  idle: '#facc15',
  active: '#22c55e',
  returning: '#3b82f6',
  warning: '#f97316',
  failed: '#ef4444',
};

export default function RoverMarker({ rover, onSelect, radius = 2.02 }: RoverMarkerProps) {
  const outerRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();
  const { name, status, position } = rover;
  const pos = latLngToVector3(position.lat, position.lng, radius);
  const color = statusColors[status] || '#ffffff';

  useFrame(({ clock }) => {
    if (outerRef.current) {
      const dist = camera.position.distanceTo(outerRef.current.position);
      const scale = THREE.MathUtils.clamp(dist * 0.16, 2.8, 9);
      outerRef.current.scale.setScalar(scale);
    }

    const t = clock.getElapsedTime();
    const breathe = (Math.sin(t * 2) + 1) / 2; // 0 → 1 → 0

    if (pulseRef.current) {
      const s = 1 + breathe * 1.1;
      pulseRef.current.scale.set(s, s, s);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + breathe * 0.5;
    }
    if (glowRef.current) {
      const s = 1 + breathe * 0.35;
      glowRef.current.scale.set(s, s, s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.35 + breathe * 0.35;
    }
  });

  return (
    <group
      ref={outerRef}
      position={pos}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(rover);
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
        setHovered(false);
      }}
    >
      {/* Invisible larger hit-area for easy clicking */}
      <mesh visible={false}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Additive glow disc behind everything — soft bloom look */}
      <mesh ref={glowRef}>
        <circleGeometry args={[0.05, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Breathing pulse ring */}
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.045, 0.055, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Static outer ring — "target" look, brighter on hover */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.058, 0.068, 32]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 1 : 0.7} depthWrite={false} />
      </mesh>

      {/* Core dot */}
      <mesh>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Bright center highlight */}
      <mesh>
        <sphereGeometry args={[0.013, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {hovered && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: 'white',
              fontSize: '10px',
              fontFamily: 'var(--font-mono, monospace)',
              background: 'rgba(5,7,10,0.9)',
              padding: '3px 7px',
              borderRadius: '5px',
              whiteSpace: 'nowrap',
              transform: 'translate(10px, -22px)',
              border: `1px solid ${color}66`,
              borderLeft: `2px solid ${color}`,
            }}
          >
            {name} <span style={{ opacity: 0.6 }}>· {status}</span>
          </div>
        </Html>
      )}
    </group>
  );
}