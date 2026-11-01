'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SatelliteConfig {
  name: string;
  info: string;
  color: string;
  radius: number;
  speed: number;
  inclination: number;
  phase: number;
}
const SATELLITES: SatelliteConfig[] = [
  { name: 'COMSAT-1', info: 'Communication satellite · Geostationary relay', color: '#7DD3FC', radius: 2.2, speed: 0.6, inclination: 0.15, phase: 0 },
  { name: 'WX-2', info: 'Weather satellite · Atmospheric imaging', color: '#FDE68A', radius: 1.9, speed: 0.8, inclination: 0.55, phase: 2.1 },
  { name: 'NAV-3', info: 'Navigation satellite · Positioning network', color: '#C4B5FD', radius: 2.6, speed: 0.45, inclination: 1.0, phase: 4.3 },
  { name: 'ISS-ALPHA', info: 'Research station · Low orbit', color: '#FCA5A5', radius: 1.7, speed: 1.1, inclination: 0.3, phase: 1.4 },
  { name: 'COMSAT-2', info: 'Communication satellite · Regional relay', color: '#7DD3FC', radius: 2.4, speed: 0.5, inclination: 0.8, phase: 3.2 },
  { name: 'SPY-SAT-4', info: 'Reconnaissance satellite · Optical imaging', color: '#A3E635', radius: 2.0, speed: 0.9, inclination: 1.3, phase: 5.5 },
  { name: 'GPS-7', info: 'Navigation satellite · Positioning network', color: '#C4B5FD', radius: 2.8, speed: 0.35, inclination: 0.45, phase: 1.9 },
 
]

function Satellite({ config }: { config: SatelliteConfig }) {
  const orbitRef = useRef<THREE.Group>(null);
  const blinkRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orbitRef.current) {
      const orbitT = t * config.speed + config.phase;
      const x = Math.cos(orbitT) * config.radius;
      const zBase = Math.sin(orbitT) * config.radius;
      const y = zBase * Math.sin(config.inclination);
      const z = zBase * Math.cos(config.inclination);
      orbitRef.current.position.set(x, y, z);
      orbitRef.current.lookAt(0, 0, 0);
    }
    // Blinking navigation light
    if (blinkRef.current) {
      const blink = Math.sin(t * 4) > 0.7 ? 1.5 : 0.1;
      (blinkRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = blink;
    }
  });

  return (
    <group ref={orbitRef}>
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setHovered(false);
        }}
      >
        {/* Main body (bus) */}
        <mesh>
          <boxGeometry args={[0.05, 0.05, 0.14]} />
          <meshStandardMaterial
            color="#d4d4d8"
            metalness={0.8}
            roughness={0.3}
            emissive={config.color}
            emissiveIntensity={hovered ? 0.5 : 0.1}
          />
        </mesh>

        {/* Gold foil insulation blanket look */}
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[0.045, 0.045, 0.05]} />
          <meshStandardMaterial color="#d4a017" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Parabolic communication dish */}
        <mesh position={[0, 0, -0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.035, 0.03, 16, 1, true]} />
          <meshStandardMaterial color="#e5e7eb" metalness={0.5} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>

        {/* Solar panel arrays — segmented for realism */}
        {[1, -1].map((side) => (
          <group key={side} position={[side * 0.09, 0, 0]}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[side * i * 0.065, 0, 0]}>
                <boxGeometry args={[0.06, 0.16, 0.006]} />
                <meshStandardMaterial
                  color="#0f2847"
                  metalness={0.4}
                  roughness={0.6}
                  emissive="#1d4ed8"
                  emissiveIntensity={0.12}
                />
              </mesh>
            ))}
            {/* Connecting arm */}
            <mesh position={[side * 0.02, 0, 0]}>
              <boxGeometry args={[0.02, 0.01, 0.01]} />
              <meshStandardMaterial color="#71717a" metalness={0.7} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Blinking nav light */}
        <mesh ref={blinkRef} position={[0, 0.035, 0]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.5} />
        </mesh>
      </group>

      {hovered && (
        <Html distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(5,7,10,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderLeft: `2px solid ${config.color}`,
              borderRadius: 6,
              padding: '6px 10px',
              whiteSpace: 'nowrap',
              transform: 'translate(12px, -12px)',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <div style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{config.name}</div>
            <div style={{ color: 'var(--muted, #8b949e)', fontSize: 10, marginTop: 2 }}>{config.info}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

interface DebrisPiece {
  angle: number;
  radius: number;
  tilt: number;
  spinSpeed: number;
  orbitSpeed: number;
  scale: number;
  shape: number; // 0 = box, 1 = icosahedron, 2 = tetrahedron
  rotOffset: [number, number, number];
}

function DebrisField() {
  const count = 90;
  const groupRef = useRef<THREE.Group>(null);

  const pieces = useMemo<DebrisPiece[]>(() => {
    return Array.from({ length: count }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 1.7 + Math.random() * 0.9,
      tilt: (Math.random() - 0.5) * 0.6,
      spinSpeed: 0.3 + Math.random() * 1.2,
      orbitSpeed: 0.05 + Math.random() * 0.1,
      scale: 0.008 + Math.random() * 0.02,
      shape: Math.floor(Math.random() * 3),
      rotOffset: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const p = pieces[i];
      const orbitT = t * p.orbitSpeed + p.angle;
      const x = Math.cos(orbitT) * p.radius;
      const zBase = Math.sin(orbitT) * p.radius;
      const y = zBase * p.tilt;
      const z = zBase * Math.cos(p.tilt * 2);
      child.position.set(x, y, z);
      child.rotation.x = p.rotOffset[0] + t * p.spinSpeed;
      child.rotation.y = p.rotOffset[1] + t * p.spinSpeed * 0.7;
    });
  });

  return (
    <group ref={groupRef}>
      {pieces.map((p, i) => (
        <mesh key={i} scale={p.scale}>
          {p.shape === 0 && <boxGeometry args={[1, 0.6, 0.8]} />}
          {p.shape === 1 && <icosahedronGeometry args={[1, 0]} />}
          {p.shape === 2 && <tetrahedronGeometry args={[1, 0]} />}
          <meshStandardMaterial
            color="#8b8d93"
            metalness={0.6}
            roughness={0.5}
            emissive="#3f3f46"
            emissiveIntensity={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function Satellites() {
  return (
    <group>
      {SATELLITES.map((s) => (
        <Satellite key={s.name} config={s} />
      ))}
      <DebrisField />
    </group>
  );
}