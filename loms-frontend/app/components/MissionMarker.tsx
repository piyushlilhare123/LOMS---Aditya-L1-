'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from '../utils/coordinates';

export interface MissionData {
  _id: string;
  name: string;
  type: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'reassigned';
  priority: number;
  targetLocation: { lat: number; lng: number };
}

const missionColors: Record<string, string> = {
  pending: '#a1a1aa',
  active: '#38bdf8',
  completed: '#4ade80',
  failed: '#f87171',
  reassigned: '#c084fc',
};

// Type → icon mapping. Falls back to a generic pin if the type isn't recognized.
const typeIcons: Record<string, string> = {
  exploration: '🔭',
  mining: '⛏️',
  'rock sample': '🪨',
  'sample-collection': '🪨',
  sample: '🪨',
  ice: '❄️',
  'ice exploration': '❄️',
  mapping: '🗺️',
  repair: '🔧',
  maintenance: '🔧',
  rescue: '🚁',
  communication: '📡',
  survey: '📡',
  research: '🔬',
  scan: '📡',
};

function getIcon(type: string) {
  const key = type.toLowerCase().trim();
  if (typeIcons[key]) return typeIcons[key];
  // Partial match — e.g. "Rock Sample Survey" contains "sample"
  const match = Object.keys(typeIcons).find((k) => key.includes(k));
  return match ? typeIcons[match] : '📍';
}

export default function MissionMarker({ mission, radius = 2.02 }: { mission: MissionData; radius?: number }) {
  const outerRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const reticleRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();
  const pos = latLngToVector3(mission.targetLocation.lat, mission.targetLocation.lng, radius);
  const color = missionColors[mission.status] || '#ffffff';
  const icon = getIcon(mission.type || mission.name);

  useFrame(({ clock }) => {
    if (outerRef.current) {
      const dist = camera.position.distanceTo(outerRef.current.position);
      const scale = THREE.MathUtils.clamp(dist * 0.16, 2.8, 9);
      outerRef.current.scale.setScalar(scale);
    }

    const t = clock.getElapsedTime();
    const breathe = (Math.sin(t * 2) + 1) / 2;

    if (pulseRef.current) {
      const s = 1 + breathe * 1.1;
      pulseRef.current.scale.set(s, s, s);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + breathe * 0.45;
    }
    if (glowRef.current) {
      const s = 1 + breathe * 0.35;
      glowRef.current.scale.set(s, s, s);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 + breathe * 0.3;
    }
    if (reticleRef.current && mission.status === 'active') {
      reticleRef.current.rotation.z = t * 0.4;
    }
  });

  return (
    <group
      ref={outerRef}
      position={pos}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh visible={false}>
  <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Additive glow disc */}
      <mesh ref={glowRef}>
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Breathing pulse ring */}
      <mesh ref={pulseRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.05, 0.06, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Crosshair reticle */}
      <group ref={reticleRef} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[0.056, 0.064, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <ringGeometry args={[0.072, 0.078, 4]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} depthWrite={false} />
        </mesh>
      </group>

      {/* Type icon badge — always visible, billboarded toward camera */}
      <Html distanceFactor={8} style={{ pointerEvents: 'none' }} center>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(5,7,10,0.75)',
            border: `1.5px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            lineHeight: 1,
          }}
        >
          {icon}
        </div>
      </Html>

      {hovered && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              color: color,
              fontSize: '9px',
              fontFamily: 'var(--font-mono, monospace)',
              background: 'rgba(5,7,10,0.85)',
              padding: '2px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              transform: 'translate(14px, 20px)',
              border: `1px solid ${color}44`,
            }}
          >
            {icon} {mission.name} <span style={{ opacity: 0.6 }}>· {mission.type}</span>
          </div>
        </Html>
      )}
    </group>
  );
}