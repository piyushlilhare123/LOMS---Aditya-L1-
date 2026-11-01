'use client';

import { useEffect } from 'react';

interface MissionAlertProps {
  type: 'completed' | 'pending' | 'failed';
  missionName: string;
  onDismiss: () => void;
}

const config = {
  completed: { label: 'MISSION COMPLETE', color: '#4ade80', icon: '✅' },
  pending: { label: 'MISSION PENDING', color: '#facc15', icon: '⏳' },
  failed: { label: 'MISSION FAILED', color: '#ef4444', icon: '❌' },
};

export default function MissionAlert({ type, missionName, onDismiss }: MissionAlertProps) {
  const c = config[type] || config.completed;

  // Auto-dismiss after 6 seconds if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        cursor: 'pointer',
        textAlign: 'center',
        animation: 'alertPop 0.4s ease-out',
      }}
    >
      <div
        style={{
          background: 'rgba(5,7,10,0.92)',
          backdropFilter: 'blur(16px)',
          border: `2px solid ${c.color}`,
          borderRadius: 16,
          padding: '24px 52px',
          boxShadow: `0 0 50px ${c.color}66, 0 12px 40px rgba(0,0,0,0.8)`,
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>{c.icon}</div>
        <div
          className="font-telemetry"
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: c.color,
            letterSpacing: '0.08em',
            textShadow: `0 0 20px ${c.color}88`,
          }}
        >
          {c.label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 16,
            fontWeight: 500,
            color: '#f3f4f6',
            marginTop: 8,
            maxWidth: 450,
            wordBreak: 'break-word',
          }}
        >
          {missionName}
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#9ca3af',
            marginTop: 12,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Click to dismiss · Auto-closing
        </div>
      </div>

      <style jsx>{`
        @keyframes alertPop {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.85) translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
