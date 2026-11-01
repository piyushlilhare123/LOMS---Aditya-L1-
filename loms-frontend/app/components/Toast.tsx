'use client';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--panel, #0B0F14)',
        border: '1px solid rgba(74,222,128,0.4)',
        borderLeft: '3px solid #4ade80',
        borderRadius: 8,
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        cursor: 'pointer',
        zIndex: 50,
        animation: 'toastIn 0.25s ease-out',
      }}
    >
      <span style={{ fontSize: 14 }}>🎯</span>
      <span
        className="font-telemetry"
        style={{ fontSize: 12, color: 'var(--foreground)' }}
      >
        {message}
      </span>
      <style jsx>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}