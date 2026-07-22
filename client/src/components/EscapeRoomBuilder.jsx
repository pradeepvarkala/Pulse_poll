import React, { useState } from 'react';
import { 
  ArrowLeft, Lock, Unlock, Users, Shield, Zap, Sparkles, Key, CheckCircle, AlertCircle, Play 
} from 'lucide-react';

export default function EscapeRoomBuilder({ presentation, onBack, user, onRequestUpgrade }) {
  const [activeTab, setActiveTab] = useState('rooms'); // rooms, monitor, settings
  const [maxRooms, setMaxRooms] = useState(4); // 2 to 7 rooms
  const [rooms, setRooms] = useState([
    { id: 'room-1', name: 'Room Alpha (Cyber Vault)', key: 'PUZZLE-904', status: 'LOCKED', progress: 0, participants: 8, currentChallenge: 'Decipher Binary Cipher' },
    { id: 'room-2', name: 'Room Beta (Matrix Maze)', key: 'ALPHA-772', status: 'SOLVING', progress: 45, participants: 7, currentChallenge: 'Solve Quadratic Equation' },
    { id: 'room-3', name: 'Room Gamma (Quantum Lab)', key: 'QUANTUM-10', status: 'UNLOCKED', progress: 100, participants: 9, currentChallenge: 'Escaped Successfully! 🏆' },
    { id: 'room-4', name: 'Room Delta (Code Chamber)', key: 'ESCAPE-2026', status: 'SOLVING', progress: 65, participants: 8, currentChallenge: 'Fix Syntax Bug' }
  ]);

  const isPremium = user?.tier === 'pro' || user?.tier === 'admin' || user?.tier === 'business';

  const handleAddRoom = () => {
    if (rooms.length >= 7) {
      alert('Maximum 7 breakout rooms allowed in the Escape Room Module.');
      return;
    }
    const newRoomNo = rooms.length + 1;
    const roomNames = ['Epsilon (Stealth Lock)', 'Zeta (Shadow Chamber)', 'Eta (Apex Vault)'];
    const newRoom = {
      id: `room-${newRoomNo}`,
      name: `Room ${roomNames[newRoomNo - 5] || newRoomNo}`,
      key: `KEY-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'LOCKED',
      progress: 0,
      participants: 6,
      currentChallenge: 'Riddle Challenge #1'
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (roomId) => {
    if (rooms.length <= 2) {
      alert('Escape Room requires at least 2 breakout rooms.');
      return;
    }
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn btn-secondary btn-icon" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              🗝️ Escape Room Builder (Virtual Breakouts)
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Group participants into up to 7 separate puzzle rooms • Live Host Command Station
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {!isPremium && (
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800, background: 'rgba(245, 158, 11, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              🔒 Pro Feature (Max 7 Rooms)
            </span>
          )}
          <button 
            className="btn btn-primary"
            onClick={() => alert('Launching Escape Room Multi-Room Live Session!')}
            style={{ fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
          >
            <Play size={14} /> Launch Escape Room Live 🚀
          </button>
        </div>
      </div>

      {/* Mode Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '24px', gap: '20px' }}>
        <button 
          className={`btn ${activeTab === 'rooms' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          onClick={() => setActiveTab('rooms')}
        >
          🧩 Breakout Rooms Setup ({rooms.length} / 7 Rooms)
        </button>
        <button 
          className={`btn ${activeTab === 'monitor' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          onClick={() => setActiveTab('monitor')}
        >
          📺 Live Host Command Monitor Grid
        </button>
      </div>

      {/* 1. ROOMS SETUP */}
      {activeTab === 'rooms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Configure puzzle keys, riddle prompts, and breakout parameters for each room:
            </p>
            <button 
              className="btn btn-secondary" 
              onClick={handleAddRoom}
              disabled={rooms.length >= 7}
              style={{ fontSize: '0.85rem' }}
            >
              + Add Breakout Room ({rooms.length}/7)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {rooms.map((room, idx) => (
              <div key={room.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{room.name}</h3>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px',
                    background: room.status === 'UNLOCKED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                    color: room.status === 'UNLOCKED' ? '#10b981' : '#06b6d4'
                  }}>
                    {room.status}
                  </span>
                </div>

                <div className="settings-group" style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '0.75rem' }}>Secret Unlock Key / Code:</label>
                  <input 
                    type="text" 
                    className="input-text" 
                    value={room.key}
                    onChange={(e) => {
                      const updated = rooms.map(r => r.id === room.id ? { ...r, key: e.target.value } : r);
                      setRooms(updated);
                    }}
                    style={{ fontSize: '0.85rem', padding: '6px 10px', fontFamily: 'monospace' }}
                  />
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  👥 Assigned Participants: <strong>{room.participants} members</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleDeleteRoom(room.id)}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}
                  >
                    Delete Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LIVE HOST COMMAND MONITOR */}
      {activeTab === 'monitor' && (
        <div>
          <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid var(--border-glass)', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>
            📡 <strong>Live Host Command Station:</strong> Real-time 7-room grid monitor. Watch breakout rooms solve puzzles live!
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {rooms.map((room) => (
              <div key={room.id} className="glass-card" style={{ padding: '20px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{room.name}</div>
                  {room.status === 'UNLOCKED' ? <CheckCircle size={18} color="#10b981" /> : <Lock size={18} color="#06b6d4" />}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Task: <strong>{room.currentChallenge}</strong>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${room.progress}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #10b981)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>Progress: {room.progress}%</span>
                  <span>Key: {room.key}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
