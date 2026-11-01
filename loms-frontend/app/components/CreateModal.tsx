'use client';

import { useState } from 'react';

interface CreateModalProps {
  onClose: () => void;
  onCreated: (msg?: string) => void; // trigger a refetch after success
}

type Tab = 'rover' | 'mission';

export default function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const [tab, setTab] = useState<Tab>('rover');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Rover form state
  const [roverId, setRoverId] = useState('');
  const [roverName, setRoverName] = useState('');
  const [roverLat, setRoverLat] = useState('0');
  const [roverLng, setRoverLng] = useState('0');
  const [roverBattery, setRoverBattery] = useState('100');

  // Mission form state
  const [missionName, setMissionName] = useState('');
  const [missionType, setMissionType] = useState('exploration');
  const [missionPriority, setMissionPriority] = useState('5');
  const [missionScientificValue, setMissionScientificValue] = useState('5');
const [missionLat, setMissionLat] = useState('15');
const [missionLng, setMissionLng] = useState('50');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: '8px 10px',
    color: 'var(--foreground)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--muted)',
    letterSpacing: '0.05em',
  };
  const handleCreateRover = async () => {
    if (!roverId.trim() || !roverName.trim()) {
      setMessage('Rover ID and Name are required');
      return;
    }
    const lat = parseFloat(roverLat);
    const lng = parseFloat(roverLng);
    if (lat < -90 || lat > 90) {
      setMessage('Latitude must be between -90 and 90');
      return;
    }
    if (lng < -180 || lng > 180) {
      setMessage('Longitude must be between -180 and 180');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_LOMS_API_URL || 'http://localhost:5000'}/api/rovers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roverId: roverId.trim(),
          name: roverName.trim(),
          position: { lat: parseFloat(roverLat), lng: parseFloat(roverLng) },
          battery: parseFloat(roverBattery),
          status: 'idle',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create rover');
      setMessage(`✅ Rover "${roverName}" created`);
      onCreated();
      setRoverId('');
      setRoverName('');
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMission = async () => {
    if (!missionName.trim()) {
      setMessage('Mission name is required');
      return;
    }
    const lat = parseFloat(missionLat);
    const lng = parseFloat(missionLng);
    if (lat < -90 || lat > 90) {
      setMessage('Latitude must be between -90 and 90');
      return;
    }
    if (lng < -180 || lng > 180) {
      setMessage('Longitude must be between -180 and 180');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_LOMS_API_URL || 'http://localhost:5000'}/api/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: missionName.trim(),
          type: missionType,
          priority: parseFloat(missionPriority),
          scientificValue: parseFloat(missionScientificValue),
          targetLocation: { lat: parseFloat(missionLat), lng: parseFloat(missionLng) },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create mission');
      setMessage(`✅ ${data.message}`);
      onCreated();
      setMissionName('');
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : 'Something went wrong'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 340,
          background: 'var(--panel, #0B0F14)',
          border: '1px solid var(--panel-border, rgba(255,255,255,0.08))',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, color: 'var(--foreground)' }}>
            Create New
          </span>
          <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>
            ✕
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {(['rover', 'mission'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setMessage(null);
              }}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.08)',
                background: tab === t ? 'var(--accent-dim, rgba(255,140,66,0.15))' : 'transparent',
                color: tab === t ? 'var(--accent, #FF8C42)' : 'var(--muted)',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t === 'rover' ? 'New Rover' : 'New Mission'}
            </button>
          ))}
        </div>

        {/* Rover form */}
        {tab === 'rover' && (
          <div>
            <label style={labelStyle}>ROVER ID (unique)</label>
            <input style={inputStyle} value={roverId} onChange={(e) => setRoverId(e.target.value)} placeholder="ROVER-C" />

            <label style={labelStyle}>NAME</label>
            <input style={inputStyle} value={roverName} onChange={(e) => setRoverName(e.target.value)} placeholder="Voyager" />

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>START LAT</label>
                <input style={inputStyle} value={roverLat} onChange={(e) => setRoverLat(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>START LNG</label>
                <input style={inputStyle} value={roverLng} onChange={(e) => setRoverLng(e.target.value)} />
              </div>
            </div>

            <label style={labelStyle}>BATTERY %</label>
            <input style={inputStyle} value={roverBattery} onChange={(e) => setRoverBattery(e.target.value)} />

            <button
              onClick={handleCreateRover}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 6,
                border: 'none',
                background: 'var(--accent, #FF8C42)',
                color: '#0B0F14',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Creating…' : 'Create Rover'}
            </button>
          </div>
        )}

        {/* Mission form */}
        {tab === 'mission' && (
          <div>
            <label style={labelStyle}>MISSION NAME</label>
            <input style={inputStyle} value={missionName} onChange={(e) => setMissionName(e.target.value)} placeholder="Crater Survey" />

            <label style={labelStyle}>TYPE</label>
            <input style={inputStyle} value={missionType} onChange={(e) => setMissionType(e.target.value)} placeholder="exploration" />

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>PRIORITY (1-10)</label>
                <input style={inputStyle} value={missionPriority} onChange={(e) => setMissionPriority(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>SCI. VALUE (1-10)</label>
                <input style={inputStyle} value={missionScientificValue} onChange={(e) => setMissionScientificValue(e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>TARGET LAT</label>
                <input style={inputStyle} value={missionLat} onChange={(e) => setMissionLat(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>TARGET LNG</label>
                <input style={inputStyle} value={missionLng} onChange={(e) => setMissionLng(e.target.value)} />
              </div>
            </div>

            <button
              onClick={handleCreateMission}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 0',
                borderRadius: 6,
                border: 'none',
                background: 'var(--accent, #FF8C42)',
                color: '#0B0F14',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Creating…' : 'Create Mission (auto-assigns rover)'}
            </button>
          </div>
        )}

        {message && (
          <div
            style={{
              marginTop: 12,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: message.startsWith('✅') ? 'var(--status-active, #22c55e)' : 'var(--status-failed, #ef4444)',
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}