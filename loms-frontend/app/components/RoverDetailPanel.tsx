'use client';

import { RoverData } from './RoverMarker';

interface RoverDetailPanelProps {
  rover: RoverData;
  onClose: () => void;
  onRecharge: (roverId: string) => void;
}

const statusColors: Record<string, string> = {
  idle: '#facc15',
  active: '#22c55e',
  returning: '#3b82f6',
  warning: '#f97316',
  failed: '#ef4444',
};

function BatteryBar({ battery }: { battery: number }) {
  const segments = 10;
  const filled = Math.round((battery / 100) * segments);
  const color = battery > 50 ? '#22c55e' : battery > 20 ? '#f97316' : '#ef4444';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 2 }}>
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 12,
              background: i < filled ? color : 'rgba(255,255,255,0.1)',
              borderRadius: 1,
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <span className="font-telemetry" style={{ fontSize: 13, color: 'var(--foreground)' }}>
        {battery.toFixed(1)}%
      </span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '7px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span
        className="font-telemetry"
        style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em' }}
      >
        {label}
      </span>
      <span className="font-telemetry" style={{ fontSize: 12, color: 'var(--foreground)' }}>
        {children}
      </span>
    </div>
  );
}

export default function RoverDetailPanel({ rover, onClose, onRecharge }: RoverDetailPanelProps) {
  const color = statusColors[rover.status] || '#ffffff';

  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        right: 20,
        width: 260,
        background: 'var(--panel, #0B0F14)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--panel-border, rgba(255,255,255,0.08))',
        borderTop: `2px solid ${color}`,
        borderRadius: 10,
        padding: '16px 18px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 16, color: 'var(--foreground)' }}>
            {rover.name}
          </div>
          <div className="font-telemetry" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.05em' }}>
            {rover.roverId}
          </div>
        </div>
        <span
          onClick={onClose}
          style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 14, padding: 2 }}
        >
          ✕
        </span>
      </div>

      {/* Status badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          margin: '8px 0 14px',
          padding: '3px 9px',
          borderRadius: 999,
          background: `${color}1A`,
          border: `1px solid ${color}55`,
        }}
      >
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
        <span
          className="font-telemetry"
          style={{ fontSize: 10, color, letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          {rover.status}
        </span>
      </div>

      {/* Battery */}
      {rover.battery !== undefined && (
        <div style={{ marginBottom: 10 }}>
          <div className="font-telemetry" style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', marginBottom: 5 }}>
            BATTERY
          </div>
          <BatteryBar battery={rover.battery} />
        </div>
      )}

      {/* Telemetry rows */}
      <div>
        {rover.speed !== undefined && <Row label="SPEED">{rover.speed} km/h</Row>}
        {rover.communication && <Row label="COMMS">{rover.communication}</Row>}
        {rover.distanceFromBase !== undefined && (
          <Row label="DIST. FROM BASE">{rover.distanceFromBase.toFixed(1)} km</Row>
        )}
        <Row label="TASK">{rover.currentTask ? rover.currentTask.name : '—'}</Row>
        <Row label="POSITION">
          {rover.position.lat.toFixed(2)}, {rover.position.lng.toFixed(2)}
        </Row>
      </div>

      {/* Recharge button */}
      {rover.battery !== undefined && rover.battery < 100 && (
        <button
          onClick={() => onRecharge(rover.roverId)}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '8px 0',
            borderRadius: 6,
            border: '1px solid rgba(34,197,94,0.4)',
            background: 'rgba(34,197,94,0.1)',
            color: '#22c55e',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          ⚡ RECHARGE BATTERY
        </button>
      )}
    </div>
  );
}