'use client';

interface TopHUDProps {
  connected: boolean;
  totalRovers: number;
  activeRovers: number;
  activeMissions: number;
  onCreateClick: () => void;
  onResetRoversClick: () => void;
  onResetMissionsClick: () => void;
}

export default function TopHUD({
  connected,
  totalRovers,
  activeRovers,
  activeMissions,
  onCreateClick,
  onResetRoversClick,
  onResetMissionsClick,
}: TopHUDProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'linear-gradient(180deg, rgba(5,7,10,0.85) 0%, rgba(5,7,10,0) 100%)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* Left — Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: connected ? 'var(--status-active, #22c55e)' : 'var(--status-failed, #ef4444)',
            boxShadow: connected ? '0 0 8px var(--status-active, #22c55e)' : '0 0 8px var(--status-failed, #ef4444)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '0.06em',
            color: 'var(--foreground)',
          }}
        >
          LOMS
        </span>
        <span
          className="font-telemetry"
          style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.04em' }}
        >
          {connected ? 'LIVE' : 'RECONNECTING…'}
        </span>
      </div>

      {/* Right — Stats + Create/Reset buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, pointerEvents: 'auto' }}>
        <div className="font-telemetry" style={{ display: 'flex', gap: 20, fontSize: 12, marginRight: 8 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.08em' }}>ROVERS</div>
            <div style={{ color: 'var(--foreground)', fontSize: 14 }}>
              {activeRovers}<span style={{ color: 'var(--muted)' }}>/{totalRovers}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--muted)', fontSize: 10, letterSpacing: '0.08em' }}>MISSIONS</div>
            <div style={{ color: 'var(--accent, #FF8C42)', fontSize: 14 }}>{activeMissions}</div>
          </div>
        </div>

        <button
          onClick={onCreateClick}
          style={{
            padding: '7px 14px',
            borderRadius: 6,
            border: '1px solid var(--accent, #FF8C42)',
            background: 'var(--accent-dim, rgba(255,140,66,0.15))',
            color: 'var(--accent, #FF8C42)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          + NEW
        </button>

        <button
          onClick={onResetRoversClick}
          style={{
            padding: '7px 14px',
            borderRadius: 6,
            border: '1px solid rgba(239,68,68,0.5)',
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          RESET ROVERS
        </button>

        <button
          onClick={onResetMissionsClick}
          style={{
            padding: '7px 14px',
            borderRadius: 6,
            border: '1px solid rgba(239,68,68,0.5)',
            background: 'rgba(239,68,68,0.1)',
            color: '#ef4444',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          RESET MISSIONS
        </button>
      </div>
    </div>
  );
}