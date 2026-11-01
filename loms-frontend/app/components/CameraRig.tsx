'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FocusTarget {
  object: THREE.Object3D;
  size: number;
}

interface CameraRigProps {
  focusedRef: { current: FocusTarget | null };
  controlsRef: { current: any };
  defaultPosition: [number, number, number];
  defaultTarget: [number, number, number];
}

export default function CameraRig({ focusedRef, controlsRef, defaultPosition, defaultTarget }: CameraRigProps) {
  const { camera } = useThree();
  const worldPos = useRef(new THREE.Vector3());
  const desiredPos = useRef(new THREE.Vector3());
  const defaultPos = useRef(new THREE.Vector3(...defaultPosition));
  const defaultTgt = useRef(new THREE.Vector3(...defaultTarget));
  const returning = useRef(false);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (focusedRef.current) {
      returning.current = true;
      const { object, size } = focusedRef.current;
      object.getWorldPosition(worldPos.current);

      const focusDistance = Math.max(size * 6, 1.4);
      const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
      if (dir.lengthSq() < 0.0001) dir.set(0, 0.4, 1);
      dir.normalize().multiplyScalar(focusDistance);

      desiredPos.current.copy(worldPos.current).add(dir);
      camera.position.lerp(desiredPos.current, 0.06);
      controls.target.lerp(worldPos.current, 0.1);
      controls.update();
    } else if (returning.current) {
      camera.position.lerp(defaultPos.current, 0.05);
      controls.target.lerp(defaultTgt.current, 0.05);
      controls.update();
      if (camera.position.distanceTo(defaultPos.current) < 0.1) {
        returning.current = false;
      }
    }
  });

  return null;
}