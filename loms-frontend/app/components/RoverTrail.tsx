'use client';

import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { latLngToVector3 } from '../utils/coordinates';

interface RoverTrailProps {
  positions: { lat: number; lng: number }[];
  color: string;
  radius?: number;
}

export default function RoverTrail({ positions, color, radius = 2.015 }: RoverTrailProps) {
  if (positions.length < 2) return null;

  const points = positions.map((p) => latLngToVector3(p.lat, p.lng, radius));

  // Fade from tail (old, dim) to head (recent, bright) — vertex colors carry alpha via a
  // second interleaved array since drei's Line vertexColors don't support alpha directly,
  // so we scale the base color's brightness instead.
  const baseColor = new THREE.Color(color);
  const vertexColors: [number, number, number][] = points.map((_, i) => {
    const t = i / (points.length - 1); // 0 = oldest, 1 = newest (near rover)
    const fade = 0.15 + t * 0.85; // never fully invisible, ramps up toward the rover
    return [baseColor.r * fade, baseColor.g * fade, baseColor.b * fade];
  });

  return (
    <group>
      {/* Glow layer — wider, dimmer, sits behind the sharp line */}
      <Line
        points={points}
        vertexColors={vertexColors}
        lineWidth={4}
        transparent
        opacity={0.18}
        depthWrite={false}
      />

      {/* Sharp core line */}
      <Line
        points={points}
        vertexColors={vertexColors}
        lineWidth={1.5}
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </group>
  );
}