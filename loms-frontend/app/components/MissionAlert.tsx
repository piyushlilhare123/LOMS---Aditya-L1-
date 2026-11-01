'use client';

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
  const c = config[type];

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'absolute',
        top: '18%',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        cursor: 'pointer',
        textAlign: 'center',
        animation: 'alertPop 0.4s ease-out',
      }}
    >
      <div
        style={{
          background: 'rgba(5,7,10,0.85)',
          backdropFilter: 'blur(10px)',
          border: `2px solid ${c.color}`,
          borderRadius: 14,
          padding: '20px 48px',
          boxShadow: `0 0 40px ${c.color}55`,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 6 }}>{c.icon}</div>
        <div
          className="font-telemetry"
          style={{
            fontSize: 28,
            fontWeight: 700,
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
            fontSize: 15,
            color: 'var(--foreground)',
            marginTop: 6,
          }}
        >
          {missionName}
        </div>
      </div>

      <style jsx>{`
        @keyframes alertPop {
          from {
            opacity: 0;
            transform: translateX(-50%) scale(0.85) translateY(-10px);
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