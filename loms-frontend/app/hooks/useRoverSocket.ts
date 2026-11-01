'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface Rover {
  _id: string;
  roverId: string;
  position: { lat: number; lng: number };
  status: 'idle' | 'active' | 'returning' | 'warning' | 'failed';
  speed: number;
  battery: number;
  distanceFromBase: number;
  communication: 'stable' | 'degraded' | 'critical';
  path: { lat: number; lng: number }[];
  currentWaypointIndex: number;
  currentTask: string | null;
}

export interface MissionReassignedEvent {
  missionId: string;
  missionName: string;
  newRover: string;
}

export interface MissionCompletedEvent {
  missionId: string;
  missionName: string;
  roverId: string;
}

export interface MissionPendingEvent {
  missionId: string;
  missionName: string;
  reason: string;
}

export interface MissionFailedEvent {
  missionId: string;
  missionName: string;
  reason: string;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_LOMS_API_URL || 'http://localhost:5000';

export function useRoverSocket() {
  const [rovers, setRovers] = useState<Record<string, Rover>>({});
  const [lastReassignment, setLastReassignment] = useState<MissionReassignedEvent | null>(null);
  const [lastCompletion, setLastCompletion] = useState<MissionCompletedEvent | null>(null);
  const [lastPending, setLastPending] = useState<MissionPendingEvent | null>(null);
  const [lastFailed, setLastFailed] = useState<MissionFailedEvent | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
    });

    socket.on('rover:update', (updatedRover: Rover) => {
      setRovers((prev) => ({
        ...prev,
        [updatedRover.roverId]: updatedRover,
      }));
    });

    socket.on('mission:completed', (data: MissionCompletedEvent) => {
      console.log('🎯 Mission completed:', data);
      setLastCompletion(data);
    });

    socket.on('mission:reassigned', (data: MissionReassignedEvent) => {
      console.log('🔁 Mission reassigned:', data);
      setLastReassignment(data);
    });

    socket.on('mission:pending', (data: MissionPendingEvent) => {
      console.log('⏳ Mission pending:', data);
      setLastPending(data);
    });

    socket.on('mission:failed', (data: MissionFailedEvent) => {
      console.log('❌ Mission failed:', data);
      setLastFailed(data);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { rovers, lastReassignment, lastCompletion, lastPending, lastFailed, connected };
}