'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SunProps {
  distance?: number;
  speed?: number;
  onFocus?: (object: THREE.Object3D, size: number, name: string) => void;
}

export default function Sun({ distance = 12, speed = 0.05, onFocus }: SunProps) {
  const sunRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Procedurally generated sun surface — warm gradient + random "granulation" spots.
  // No network fetch, so it never fails to load.
  const sunTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const base = ctx.createRadialGradient(256, 256, 0, 256, 256, 300);
    base.addColorStop(0, '#fff6d8');
    base.addColorStop(0.4, '#ffd580');
    base.addColorStop(0.75, '#ff9d3f');
    base.addColorStop(1, '#e8641a');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 900; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = Math.random() * 3 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,230,160,0.25)' : 'rgba(200,70,10,0.2)';
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, 'rgba(255,220,150,0.95)');
    gradient.addColorStop(0.35, 'rgba(255,180,80,0.5)');
    gradient.addColorStop(1, 'rgba(255,140,50,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    if (sunRef.current) {
      sunRef.current.position.set(
        Math.cos(t) * distance,
        Math.sin(t * 0.3) * 2,
        Math.sin(t) * distance
      );
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.0015;
    }
  });

  return (
    <group ref={sunRef}>
      <mesh
        ref={coreRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setHovered(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'default';
          setHovered(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (sunRef.current) onFocus?.(sunRef.current, 0.8, 'Sun');
        }}
      >
        <sphereGeometry args={[0.8, 48, 48]} />
        <meshBasicMaterial map={sunTexture} />
      </mesh>

      <sprite scale={[3.2, 3.2, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <pointLight color="#FFF4E0" intensity={3} distance={40} decay={1.5} />

      {hovered && (
        <Html distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              background: 'rgba(5,7,10,0.9)',
              border: '1px solid rgba(255,213,128,0.4)',
              borderLeft: '2px solid #FFD580',
              borderRadius: 6,
              padding: '6px 10px',
              whiteSpace: 'nowrap',
              transform: 'translate(12px, -12px)',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <div style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>Sun</div>
            <div style={{ color: 'var(--muted, #8b949e)', fontSize: 10, marginTop: 2 }}>
              G-type star · Center of the solar system
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}