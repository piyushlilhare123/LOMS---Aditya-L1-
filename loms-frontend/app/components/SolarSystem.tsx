'use client';

import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetConfig {
  name: string;
  baseColor: string;
  accentColor: string;
  darkColor?: string;

  size: number;
  distance: number;
  speed: number;
  rotationSpeed: number;
  tilt?: number;

  roughness: number;

  hasRing?: boolean;
  ringColor?: string;
  ringInner?: number;
  ringOuter?: number;

  type: 'rocky' | 'venus' | 'gas' | 'ice';

  info: string;
}

const PLANETS: PlanetConfig[] = [
  {
    name: 'Mercury',
    baseColor: '#8f8b82',
    accentColor: '#55514b',
    darkColor: '#25231f',
    size: 0.12,
    distance: 6,
    speed: 0.35,
    rotationSpeed: 0.01,
    roughness: 1,
    type: 'rocky',
    info: 'Closest to the Sun · No moons',
  },

  {
    name: 'Venus',
    baseColor: '#d9a96e',
    accentColor: '#f0d39a',
    darkColor: '#8f6339',
    size: 0.18,
    distance: 8,
    speed: 0.28,
    rotationSpeed: 0.005,
    roughness: 0.95,
    type: 'venus',
    info: 'Hottest planet · Thick CO₂ atmosphere',
  },

  {
    name: 'Mars',
    baseColor: '#b64b28',
    accentColor: '#e0804b',
    darkColor: '#68271b',
    size: 0.15,
    distance: 16,
    speed: 0.15,
    rotationSpeed: 0.028,
    tilt: 0.44,
    roughness: 1,
    type: 'rocky',
    info: 'The Red Planet · 2 moons',
  },

  {
    name: 'Jupiter',
    baseColor: '#c89061',
    accentColor: '#e6c39a',
    darkColor: '#805338',
    size: 0.55,
    distance: 26,
    speed: 0.06,
    rotationSpeed: 0.06,
    tilt: 0.05,
    roughness: 1,
    type: 'gas',
    info: 'Largest planet · 95 known moons',
  },

  {
    name: 'Saturn',
    baseColor: '#c8a86b',
    accentColor: '#e7d09b',
    darkColor: '#796040',
    size: 0.48,
    distance: 34,
    speed: 0.045,
    rotationSpeed: 0.05,
    tilt: 0.47,
    roughness: 1,
    hasRing: true,
    ringColor: '#d8c18c',
    ringInner: 1.4,
    ringOuter: 2.35,
    type: 'gas',
    info: 'Ringed giant · Least dense planet',
  },

  {
    name: 'Uranus',
    baseColor: '#82cfd2',
    accentColor: '#b7eeee',
    darkColor: '#3f8e9b',
    size: 0.3,
    distance: 42,
    speed: 0.03,
    rotationSpeed: 0.03,
    tilt: 1.71,
    roughness: 0.9,
    type: 'ice',
    info: 'Tilted on its side · Ice giant',
  },

  {
    name: 'Neptune',
    baseColor: '#315fc2',
    accentColor: '#6f9ce9',
    darkColor: '#173579',
    size: 0.29,
    distance: 49,
    speed: 0.02,
    rotationSpeed: 0.032,
    tilt: 0.49,
    roughness: 0.9,
    type: 'ice',
    info: 'Farthest planet · Strongest winds',
  },
];

/* =========================================================
   HELPERS
========================================================= */

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');

  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function lerpColor(
  a: string,
  b: string,
  amount: number
) {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);

  const r = Math.round(
    c1.r + (c2.r - c1.r) * amount
  );

  const g = Math.round(
    c1.g + (c2.g - c1.g) * amount
  );

  const bl = Math.round(
    c1.b + (c2.b - c1.b) * amount
  );

  return `rgb(${r}, ${g}, ${bl})`;
}

/* =========================================================
   ROCKY PLANET TEXTURE
   Mercury + Mars
========================================================= */

function makeRockyTexture(
  config: PlanetConfig
) {
  const canvas =
    document.createElement('canvas');

  canvas.width = 1024;
  canvas.height = 512;

  const ctx =
    canvas.getContext('2d')!;

  const base = hexToRgb(
    config.baseColor
  );

  ctx.fillStyle =
    config.baseColor;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Large geological regions
   */
  for (let i = 0; i < 90; i++) {
    const x =
      Math.random() *
      canvas.width;

    const y =
      Math.random() *
      canvas.height;

    const rx =
      15 +
      Math.random() * 80;

    const ry =
      8 +
      Math.random() * 45;

    const rotation =
      Math.random() *
      Math.PI;

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(rotation);

    ctx.beginPath();

    ctx.ellipse(
      0,
      0,
      rx,
      ry,
      0,
      0,
      Math.PI * 2
    );

    const color =
      Math.random() > 0.5
        ? config.accentColor
        : config.darkColor ||
          config.accentColor;

    ctx.fillStyle = color;

    ctx.globalAlpha =
      0.18 +
      Math.random() * 0.25;

    ctx.fill();

    ctx.restore();
  }

  ctx.globalAlpha = 1;

  /*
   * Craters
   */
  const craterCount =
    config.name === 'Mercury'
      ? 250
      : 120;

  for (
    let i = 0;
    i < craterCount;
    i++
  ) {
    const x =
      Math.random() *
      canvas.width;

    const y =
      Math.random() *
      canvas.height;

    const radius =
      1.5 +
      Math.random() * 12;

    /*
     * Outer crater
     */
    ctx.beginPath();

    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      'rgba(20,15,10,0.20)';

    ctx.fill();

    /*
     * Crater rim
     */
    ctx.beginPath();

    ctx.arc(
      x - radius * 0.15,
      y - radius * 0.15,
      radius * 0.75,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      'rgba(255,255,255,0.12)';

    ctx.lineWidth =
      Math.max(
        0.5,
        radius * 0.12
      );

    ctx.stroke();

    /*
     * Crater center
     */
    ctx.beginPath();

    ctx.arc(
      x + radius * 0.15,
      y + radius * 0.15,
      radius * 0.45,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      'rgba(0,0,0,0.12)';

    ctx.fill();
  }

  /*
   * Fine surface noise
   */
  for (let i = 0; i < 8000; i++) {
    const x =
      Math.random() *
      canvas.width;

    const y =
      Math.random() *
      canvas.height;

    const brightness =
      Math.random() > 0.5
        ? 255
        : 0;

    const alpha =
      0.02 +
      Math.random() * 0.07;

    ctx.fillStyle =
      `rgba(${brightness},${brightness},${brightness},${alpha})`;

    ctx.fillRect(
      x,
      y,
      1,
      1
    );
  }

  /*
   * Mars polar caps
   */
  if (config.name === 'Mars') {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        90
      );

    gradient.addColorStop(
      0,
      'rgba(245,235,210,0.8)'
    );

    gradient.addColorStop(
      1,
      'rgba(245,235,210,0)'
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      90
    );

    const bottom =
      ctx.createLinearGradient(
        0,
        canvas.height - 90,
        0,
        canvas.height
      );

    bottom.addColorStop(
      0,
      'rgba(245,235,210,0)'
    );

    bottom.addColorStop(
      1,
      'rgba(245,235,210,0.8)'
    );

    ctx.fillStyle =
      bottom;

    ctx.fillRect(
      0,
      canvas.height - 90,
      canvas.width,
      90
    );
  }

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 8;

  return texture;
}

/* =========================================================
   VENUS TEXTURE
========================================================= */

function makeVenusTexture(
  config: PlanetConfig
) {
  const canvas =
    document.createElement('canvas');

  canvas.width = 1024;
  canvas.height = 512;

  const ctx =
    canvas.getContext('2d')!;

  ctx.fillStyle =
    config.baseColor;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Venus cloud bands
   */
  for (let i = 0; i < 150; i++) {
    const y =
      Math.random() *
      canvas.height;

    const amplitude =
      5 +
      Math.random() * 15;

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    for (
      let x = 0;
      x <= canvas.width;
      x += 10
    ) {
      const wave =
        Math.sin(
          x * 0.018 +
          i
        ) *
        amplitude;

      ctx.lineTo(
        x,
        y + wave
      );
    }

    ctx.strokeStyle =
      Math.random() > 0.5
        ? config.accentColor
        : config.darkColor!;

    ctx.globalAlpha =
      0.06 +
      Math.random() * 0.1;

    ctx.lineWidth =
      3 +
      Math.random() * 10;

    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  /*
   * Swirling cloud details
   */
  for (let i = 0; i < 350; i++) {
    const x =
      Math.random() *
      canvas.width;

    const y =
      Math.random() *
      canvas.height;

    const r =
      5 +
      Math.random() * 25;

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      r * 2,
      r * 0.4,
      Math.random() * Math.PI,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      i % 2 === 0
        ? config.accentColor
        : '#fff0c8';

    ctx.globalAlpha =
      0.08 +
      Math.random() * 0.12;

    ctx.fill();
  }

  ctx.globalAlpha = 1;

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 8;

  return texture;
}

/* =========================================================
   GAS GIANT TEXTURE
   Jupiter + Saturn
========================================================= */

function makeGasTexture(
  config: PlanetConfig
) {
  const canvas =
    document.createElement('canvas');

  canvas.width = 1024;
  canvas.height = 512;

  const ctx =
    canvas.getContext('2d')!;

  /*
   * Base
   */
  ctx.fillStyle =
    config.baseColor;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Horizontal atmospheric bands
   */
  const bandCount =
    config.name === 'Jupiter'
      ? 26
      : 20;

  for (
    let i = 0;
    i < bandCount;
    i++
  ) {
    const y =
      (i / bandCount) *
      canvas.height;

    const height =
      canvas.height /
      bandCount;

    const colors = [
      config.baseColor,
      config.accentColor,
      config.darkColor ||
        config.baseColor,
    ];

    const color =
      colors[
        i % colors.length
      ];

    ctx.fillStyle =
      color;

    ctx.globalAlpha =
      0.35 +
      Math.random() * 0.35;

    ctx.fillRect(
      0,
      y,
      canvas.width,
      height
    );
  }

  ctx.globalAlpha = 1;

  /*
   * Turbulent horizontal strokes
   */
  for (let i = 0; i < 1000; i++) {
    const y =
      Math.random() *
      canvas.height;

    const x =
      Math.random() *
      canvas.width;

    const width =
      20 +
      Math.random() * 180;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y
    );

    ctx.bezierCurveTo(
      x + width * 0.3,
      y - 5,
      x + width * 0.7,
      y + 5,
      x + width,
      y
    );

    ctx.strokeStyle =
      Math.random() > 0.5
        ? config.accentColor
        : config.darkColor!;

    ctx.globalAlpha =
      0.12 +
      Math.random() * 0.18;

    ctx.lineWidth =
      2 +
      Math.random() * 7;

    ctx.stroke();
  }

  /*
   * Jupiter Great Red Spot
   */
  if (config.name === 'Jupiter') {
    const x = 760;
    const y = 335;

    const gradient =
      ctx.createRadialGradient(
        x,
        y,
        5,
        x,
        y,
        55
      );

    gradient.addColorStop(
      0,
      '#d96c45'
    );

    gradient.addColorStop(
      0.5,
      '#b94d35'
    );

    gradient.addColorStop(
      1,
      'rgba(130,55,40,0)'
    );

    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      75,
      38,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  /*
   * Saturn subtle brightness
   */
  if (config.name === 'Saturn') {
    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        0,
        canvas.height
      );

    gradient.addColorStop(
      0,
      'rgba(255,255,220,0.15)'
    );

    gradient.addColorStop(
      0.5,
      'rgba(255,255,255,0)'
    );

    gradient.addColorStop(
      1,
      'rgba(80,50,20,0.15)'
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  ctx.globalAlpha = 1;

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 8;

  return texture;
}

/* =========================================================
   ICE GIANT TEXTURE
========================================================= */

function makeIceTexture(
  config: PlanetConfig
) {
  const canvas =
    document.createElement('canvas');

  canvas.width = 1024;
  canvas.height = 512;

  const ctx =
    canvas.getContext('2d')!;

  ctx.fillStyle =
    config.baseColor;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Soft atmospheric gradients
   */
  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      0,
      canvas.height
    );

  gradient.addColorStop(
    0,
    config.accentColor
  );

  gradient.addColorStop(
    0.3,
    config.baseColor
  );

  gradient.addColorStop(
    0.7,
    config.baseColor
  );

  gradient.addColorStop(
    1,
    config.darkColor!
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Blue atmospheric bands
   */
  for (let i = 0; i < 500; i++) {
    const y =
      Math.random() *
      canvas.height;

    const x =
      Math.random() *
      canvas.width;

    const width =
      30 +
      Math.random() * 200;

    ctx.beginPath();

    ctx.moveTo(
      x,
      y
    );

    ctx.quadraticCurveTo(
      x + width * 0.5,
      y + Math.random() * 8 - 4,
      x + width,
      y
    );

    ctx.strokeStyle =
      config.darkColor!;

    ctx.globalAlpha =
      0.08 +
      Math.random() * 0.12;

    ctx.lineWidth =
      2 +
      Math.random() * 5;

    ctx.stroke();
  }

  /*
   * Thin bright clouds
   */
  for (let i = 0; i < 150; i++) {
    const x =
      Math.random() *
      canvas.width;

    const y =
      Math.random() *
      canvas.height;

    ctx.beginPath();

    ctx.ellipse(
      x,
      y,
      15 +
        Math.random() * 50,
      2 +
        Math.random() * 5,
      0,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      '#d9ffff';

    ctx.globalAlpha =
      0.08 +
      Math.random() * 0.12;

    ctx.fill();
  }

  ctx.globalAlpha = 1;

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.anisotropy = 8;

  return texture;
}

/* =========================================================
   CREATE PLANET TEXTURE
========================================================= */

function createPlanetTexture(
  config: PlanetConfig
) {
  switch (config.type) {
    case 'rocky':
      return makeRockyTexture(config);

    case 'venus':
      return makeVenusTexture(config);

    case 'gas':
      return makeGasTexture(config);

    case 'ice':
      return makeIceTexture(config);

    default:
      return makeRockyTexture(config);
  }
}

/* =========================================================
   SATURN RINGS
========================================================= */

function createRingGeometry(
  innerRadius: number,
  outerRadius: number
) {
  const geometry =
    new THREE.RingGeometry(
      innerRadius,
      outerRadius,
      128,
      4
    );

  const pos =
    geometry.attributes.position;

  const uv =
    geometry.attributes.uv;

  const v3 =
    new THREE.Vector3();

  for (
    let i = 0;
    i < pos.count;
    i++
  ) {
    v3.fromBufferAttribute(
      pos,
      i
    );

    const radius =
      v3.length();

    const u =
      (radius - innerRadius) /
      (outerRadius - innerRadius);

    uv.setXY(
      i,
      u,
      1
    );
  }

  return geometry;
}

function makeRingTexture(
  color: string
) {
  const canvas =
    document.createElement('canvas');

  canvas.width = 1024;
  canvas.height = 16;

  const ctx =
    canvas.getContext('2d')!;

  /*
   * Base transparency
   */
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Multiple Saturn ring divisions
   */
  const gradient =
    ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      0
    );

  gradient.addColorStop(
    0,
    'rgba(0,0,0,0)'
  );

  gradient.addColorStop(
    0.05,
    color
  );

  gradient.addColorStop(
    0.12,
    'rgba(70,60,45,0.25)'
  );

  gradient.addColorStop(
    0.18,
    color
  );

  gradient.addColorStop(
    0.28,
    'rgba(255,255,255,0.45)'
  );

  gradient.addColorStop(
    0.34,
    color
  );

  gradient.addColorStop(
    0.43,
    'rgba(60,50,40,0.35)'
  );

  gradient.addColorStop(
    0.52,
    color
  );

  gradient.addColorStop(
    0.62,
    'rgba(255,255,255,0.35)'
  );

  gradient.addColorStop(
    0.70,
    color
  );

  gradient.addColorStop(
    0.78,
    'rgba(60,50,40,0.25)'
  );

  gradient.addColorStop(
    0.87,
    color
  );

  gradient.addColorStop(
    0.96,
    'rgba(255,255,255,0.2)'
  );

  gradient.addColorStop(
    1,
    'rgba(0,0,0,0)'
  );

  ctx.fillStyle =
    gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  return texture;
}

/* =========================================================
   PLANET COMPONENT
========================================================= */

function Planet({
  config,
  onFocus,
}: {
  config: PlanetConfig;

  onFocus?: (
    object: THREE.Object3D,
    size: number,
    name: string
  ) => void;
}) {
  const orbitRef =
    useRef<THREE.Group>(null);

  const spinRef =
    useRef<THREE.Mesh>(null);

  const [hovered, setHovered] =
    useState(false);

  /*
   * Generate texture once.
   */
  const texture = useMemo(
    () =>
      createPlanetTexture(config),
    [config]
  );

  /*
   * Saturn rings
   */
  const ringTexture =
    useMemo(
      () =>
        config.hasRing
          ? makeRingTexture(
              config.ringColor ||
                '#d8c18c'
            )
          : null,
      [config]
    );

  const ringGeometry =
    useMemo(() => {
      if (!config.hasRing) {
        return null;
      }

      return createRingGeometry(
        config.ringInner! *
          config.size,

        config.ringOuter! *
          config.size
      );
    }, [config]);

  /* =====================================================
     ANIMATION
  ===================================================== */

  useFrame(({ clock }) => {
    /*
     * Orbit around Sun
     */
    if (orbitRef.current) {
      const t =
        clock.getElapsedTime() *
        config.speed;

      orbitRef.current.position.set(
        Math.cos(t) *
          config.distance,

        0,

        Math.sin(t) *
          config.distance
      );
    }

    /*
     * Self rotation
     */
    if (spinRef.current) {
      spinRef.current.rotation.y +=
        config.rotationSpeed;
    }
  });

  return (
    <group ref={orbitRef}>

      {/* Planet tilt */}

      <group
        rotation={[
          0,
          0,
          config.tilt || 0,
        ]}
      >








        {/* =============================================
            PLANET
        ============================================= */}

        <mesh
          ref={spinRef}

          onPointerOver={(e) => {
            e.stopPropagation();

            document.body.style.cursor =
              'pointer';

            setHovered(true);
          }}

          onPointerOut={() => {
            document.body.style.cursor =
              'default';

            setHovered(false);
          }}

          onClick={(e) => {
            e.stopPropagation();

            if (orbitRef.current) {
              onFocus?.(
                orbitRef.current,
                config.size,
                config.name
              );
            }
          }}
        >

          <sphereGeometry
            args={[
              config.size,
              64,
              64,
            ]}
          />

          <meshStandardMaterial
            map={texture}
            roughness={
              config.roughness
            }
            metalness={0}
          />

        </mesh>

        {/* =============================================
            SATURN RINGS
        ============================================= */}

        {config.hasRing &&
          ringGeometry &&
          ringTexture && (
            <mesh
              rotation={[
                Math.PI / 2,
                0,
                0,
              ]}
            >

              <primitive
                object={ringGeometry}
                attach="geometry"
              />

              <meshBasicMaterial
                map={ringTexture}
                transparent
                side={
                  THREE.DoubleSide
                }
                depthWrite={false}
                opacity={0.92}
              />

            </mesh>
          )}

      </group>

      {/* ===============================================
          HOVER INFORMATION
      =============================================== */}

      {hovered && (
        <Html
          distanceFactor={10}
          style={{
            pointerEvents: 'none',
          }}
        >

          <div
            style={{
              background:
                'rgba(5,7,10,0.92)',

              border:
                '1px solid rgba(255,255,255,0.2)',

              borderLeft:
                '2px solid #fbbf24',

              borderRadius: 6,

              padding:
                '6px 10px',

              whiteSpace:
                'nowrap',

              transform:
                'translate(12px, -12px)',

              fontFamily:
                'var(--font-mono, monospace)',

              boxShadow:
                '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >

            <div
              style={{
                color: 'white',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {config.name}
            </div>

            <div
              style={{
                color:
                  'var(--muted, #8b949e)',

                fontSize: 10,

                marginTop: 2,
              }}
            >
              {config.info}
            </div>

          </div>

        </Html>
      )}

    </group>
  );
}

/* =========================================================
   ORBIT RING
========================================================= */

function OrbitRing({
  radius,
}: {
  radius: number;
}) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];

    for (
      let i = 0;
      i <= 128;
      i++
    ) {
      const angle =
        (i / 128) *
        Math.PI *
        2;

      pts.push(
        new THREE.Vector3(
          Math.cos(angle) *
            radius,

          0,

          Math.sin(angle) *
            radius
        )
      );
    }

    return pts;
  }, [radius]);

  const geometry = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints(
        points
      ),
    [points]
  );

  return (
    <line>
      <primitive
        object={geometry}
        attach="geometry"
      />

      <lineBasicMaterial
        color="#aba7a7"
        transparent
        opacity={0.15}
      />
    </line>
  );
}

/* =========================================================
   ASTEROID BELT
========================================================= */

function AsteroidBelt() {
  const count = 400;

  const positions = useMemo(() => {
    const arr =
      new Float32Array(
        count * 3
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      const radius =
        20 +
        Math.random() *
          2.5;

      const y =
        (Math.random() - 0.5) *
        0.6;

      arr[i * 3] =
        Math.cos(angle) *
        radius;

      arr[i * 3 + 1] =
        y;

      arr[i * 3 + 2] =
        Math.sin(angle) *
        radius;
    }

    return arr;
  }, []);

  const geometry = useMemo(() => {
    const geo =
      new THREE.BufferGeometry();

    geo.setAttribute(
      'position',
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    return geo;
  }, [positions]);

  const beltRef =
    useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (beltRef.current) {
      beltRef.current.rotation.y =
        clock.getElapsedTime() *
        0.02;
    }
  });

  return (
    <points ref={beltRef}>

      <primitive
        object={geometry}
        attach="geometry"
      />

      <pointsMaterial
        color="#8B8378"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.7}
      />

    </points>
  );
}

/* =========================================================
   PROPS
========================================================= */

interface SolarSystemProps {
  onFocus?: (
    object: THREE.Object3D,
    size: number,
    name: string
  ) => void;
}

/* =========================================================
   SOLAR SYSTEM
========================================================= */

export default function SolarSystem({
  onFocus,
}: SolarSystemProps) {
  return (
    <group>

      {/* Orbit lines */}

      {PLANETS.map((planet) => (
        <OrbitRing
          key={`orbit-${planet.name}`}
          radius={planet.distance}
        />
      ))}

      {/* Planets */}

      {PLANETS.map((planet) => (
        <Planet
          key={planet.name}
          config={planet}
          onFocus={onFocus}
        />
      ))}

      {/* Asteroid belt */}

      <AsteroidBelt />

    </group>
  );
}