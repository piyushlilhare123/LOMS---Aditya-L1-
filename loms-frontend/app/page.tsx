'use client';

import { useState, useRef, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import RoverMarker, { RoverData } from './components/RoverMarker';
import RoverTrail from './components/RoverTrail';
import MissionMarker, { MissionData } from './components/MissionMarker';
import { useRoverSocket } from './hooks/useRoverSocket';
import TopHUD from './components/TopHUD';
import RoverDetailPanel from './components/RoverDetailPanel';
import CreateModal from './components/CreateModal';
import Toast from './components/Toast';
import Sun from './components/Sun';
import SolarSystem from './components/SolarSystem';
import Satellites from './components/Satellites';
import MissionAlert from './components/MissionAlert';
import CameraRig from './components/CameraRig';
// --- NAYE AI COMPONENTS ---
import UnifiedSolarDashboard from "./components/UnifiedSolarDashboard";
import RoverReplanningDashboard from "./components/RoverReplanningDashboard";
import SolarEventDetails from "./components/SolarEventDetails";
function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const [colorMap, normalMap, cloudsMap, oceanMask] = useTexture([
    'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_normal_2048.jpg',
    'https://threejs.org/examples/textures/planets/earth_clouds_1024.png',
    'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg',
  ]);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0015;
    if (cloudsRef.current) cloudsRef.current.rotation.y += 0.002;
  });

  return (
    <group rotation={[0.4, 0.2, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.6, 0.6)}
          roughness={0.7}
          metalness={0}
        />
        <mesh scale={1.002}>
          <sphereGeometry args={[2, 128, 128]} />
          <meshBasicMaterial color="#0A3B75" alphaMap={oceanMask} transparent opacity={0.55} alphaTest={0.4} depthWrite={false} />
        </mesh>
      </mesh>
      <mesh ref={cloudsRef} scale={1.008}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial map={cloudsMap} transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Home() {
  const [autoRotate, setAutoRotate] = useState(true);
  const [rovers, setRovers] = useState<RoverData[]>([]);
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [selectedRover, setSelectedRover] = useState<RoverData | null>(null);
  const [trails, setTrails] = useState<Record<string, { lat: number; lng: number }[]>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [missionAlert, setMissionAlert] = useState<{ type: 'completed' | 'pending' | 'failed'; name: string } | null>(null);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusedRef = useRef<{ object: any; size: number } | null>(null);
  const controlsRef = useRef<any>(null);
  const [focusedName, setFocusedName] = useState<string | null>(null);

  const handleFocus = (object: any, size: number, name: string) => {
    focusedRef.current = { object, size };
    setFocusedName(name);
  };

  const clearFocus = () => {
    focusedRef.current = null;
    setFocusedName(null);
  };

  const fetchData = async () => {
    try {
      const [roverRes, missionRes] = await Promise.all([
        fetch('http://localhost:5000/api/rovers'),
        fetch('http://localhost:5000/api/missions'),
      ]);
      const roverData: RoverData[] = await roverRes.json();
      const missionData: MissionData[] = await missionRes.json();

      setRovers(roverData);
      setMissions(missionData);

      setTrails((prev) => {
        const updated = { ...prev };
        roverData.forEach((r) => {
          const existing = updated[r.roverId] || [];
          const last = existing[existing.length - 1];
          if (!last || last.lat !== r.position.lat || last.lng !== r.position.lng) {
            updated[r.roverId] = [...existing, r.position].slice(-50);
          }
        });
        return updated;
      });
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const handleResetRovers = async () => {
    if (!confirm('Delete all rovers?')) return;
    try {
      await fetch('http://localhost:5000/api/rovers', { method: 'DELETE' });
      setRovers([]);
      setTrails({});
      setSelectedRover(null);
    } catch (err) { console.error(err); }
  };

  const handleResetMissions = async () => {
    if (!confirm('Delete all missions?')) return;
    try {
      await fetch('http://localhost:5000/api/missions', { method: 'DELETE' });
      setMissions([]);
    } catch (err) { console.error(err); }
  };

  const handleRecharge = async (roverId: string) => {
    const rover = rovers.find((r) => r.roverId === roverId);
    if (!rover) return;
    try {
      await fetch(`http://localhost:5000/api/rovers/${rover._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ battery: 100, status: rover.status === 'failed' ? 'idle' : rover.status }),
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const { rovers: socketRovers, connected, lastCompletion, lastPending, lastFailed } = useRoverSocket();

  useEffect(() => {
    const updates = Object.values(socketRovers);
    if (updates.length === 0) return;

    setRovers((prev) =>
      prev.map((r) => {
        const update = updates.find((u: any) => u.roverId === r.roverId);
        return update ? ({ ...r, ...update } as RoverData) : r;
      })
    );
  }, [socketRovers]);

  const handleInteractionStart = () => { setAutoRotate(false); if (resumeTimeout.current) clearTimeout(resumeTimeout.current); };
  const handleInteractionEnd = () => { resumeTimeout.current = setTimeout(() => setAutoRotate(true), 1000); };

  const statusColors: Record<string, string> = {
    idle: '#facc15', active: '#22c55e', returning: '#3b82f6', warning: '#f97316', failed: '#ef4444',
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000', position: 'relative' }}>
      <TopHUD
        connected={connected}
        totalRovers={rovers.length}
        activeRovers={rovers.filter((r) => r.status === 'active' || r.status === 'returning').length}
        activeMissions={missions.filter((m) => m.status === 'active').length}
        onCreateClick={() => setShowCreateModal(true)}
        onResetRoversClick={handleResetRovers}
        onResetMissionsClick={handleResetMissions}
      />

      <Canvas camera={{ position: [0, 4, 7], fov: 50 }} onPointerMissed={() => { setSelectedRover(null); clearFocus(); }}>
        <Sun distance={12} speed={0.05} onFocus={handleFocus} />
        <SolarSystem onFocus={handleFocus} />
        <Satellites />
        <CameraRig focusedRef={focusedRef} controlsRef={controlsRef} defaultPosition={[0, 4, 7]} defaultTarget={[0, 0, 0]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 3, 5]} intensity={0.3} color="#ffffff" />
        <directionalLight position={[-5, -3, -5]} intensity={0.8} color="#ffffff" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Suspense fallback={null}><Earth /></Suspense>

        {rovers.map((rover) => (
          <RoverMarker key={rover.roverId} rover={rover} onSelect={setSelectedRover} />
        ))}
        {rovers.map((rover) => (
          <RoverTrail key={`trail-${rover.roverId}`} positions={trails[rover.roverId] || []} color={statusColors[rover.status] || '#ffffff'} />
        ))}
        {missions.map((mission) => (
          <MissionMarker key={mission._id} mission={mission} />
        ))}

        <OrbitControls
          ref={controlsRef}
          enableZoom={true} enablePan={false}
          autoRotate={autoRotate && !focusedName} autoRotateSpeed={2.0}
          minDistance={0.8} maxDistance={60}
          onStart={handleInteractionStart} onEnd={handleInteractionEnd}
        />
      </Canvas>




      {/* L1 AI UNIFIED DASHBOARDS OVERLAY */}
      <div className="pointer-events-none absolute inset-0 z-40">

        {/* Left Side: Autonomous Rover Replanning */}
        <div className="pointer-events-auto absolute left-6 top-24 w-[350px] flex flex-col gap-4 max-h-[85vh] overflow-y-auto pr-1">
          <RoverReplanningDashboard />
        </div>

        {/* Right Side: HEL1OS & SOLEXS Combined Forecast */}
        <div className="pointer-events-auto absolute right-6 top-24 w-[420px] flex flex-col gap-4">
          <UnifiedSolarDashboard />
        </div>
      </div>



















      {selectedRover && <RoverDetailPanel rover={selectedRover} onClose={() => setSelectedRover(null)} onRecharge={handleRecharge} />}
      {showCreateModal && <CreateModal onClose={() => setShowCreateModal(false)} onCreated={() => { fetchData(); setShowCreateModal(false); }} />}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
      {missionAlert && <MissionAlert type={missionAlert.type} missionName={missionAlert.name} onDismiss={() => setMissionAlert(null)} />}
    </div>
  );
}