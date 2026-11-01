'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export default function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(11, 15, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(74,222,128,0.5)',
        borderLeft: '4px solid #4ade80',
        borderRadius: 10,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        cursor: 'pointer',
        zIndex: 9998,
        animation: 'toastIn 0.25s ease-out',
      }}
    >
      <span style={{ fontSize: 16 }}>🎯</span>
      <span
        className="font-telemetry"
        style={{ fontSize: 13, color: '#f3f4f6', fontWeight: 500 }}
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
