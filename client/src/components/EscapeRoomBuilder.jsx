import React, { useState } from 'react';
import { 
  ArrowLeft, Lock, Unlock, Users, Shield, Zap, Sparkles, Key, CheckCircle, AlertCircle, Play, Mic, MicOff, Video, VideoOff, Volume2 
} from 'lucide-react';

export default function EscapeRoomBuilder({ presentation, onBack, user, onRequestUpgrade }) {
  const [activeTab, setActiveTab] = useState('rooms'); // rooms, monitor, audio_grid
  const [activeAudioRoomId, setActiveAudioRoomId] = useState(null);

  const userTier = user?.tier || 'free';
  const maxAllowedRooms = userTier === 'admin' || userTier === 'enterprise' || userTier === 'business' ? 10 : userTier === 'pro' ? 5 : 2;

  const ROOM_NAMES = [
    'Room Alpha (Cyber Vault)',
    'Room Beta (Matrix Maze)',
    'Room Gamma (Quantum Lab)',
    'Room Delta (Code Chamber)',
    'Room Epsilon (Stealth Lock)',
    'Room Zeta (Shadow Chamber)',
    'Room Eta (Apex Vault)',
    'Room Theta (Solar Core)',
    'Room Iota (Hyper Net)',
    'Room Kappa (Infinity Citadel)'
  ];

  const [rooms, setRooms] = useState([
    { id: 'room-1', name: ROOM_NAMES[0], key: 'PUZZLE-904', status: 'LOCKED', progress: 0, participants: 8, currentChallenge: 'Decipher Binary Cipher', micMuted: false, videoOn: true },
    { id: 'room-2', name: ROOM_NAMES[1], key: 'ALPHA-772', status: 'SOLVING', progress: 45, participants: 7, currentChallenge: 'Solve Quadratic Equation', micMuted: true, videoOn: false }
  ]);

  const handleAddRoom = () => {
    if (rooms.length >= maxAllowedRooms) {
      if (userTier === 'free') {
        if (onRequestUpgrade) onRequestUpgrade('pro');
        alert(`Free Tier allows max 2 breakout rooms. Upgrade to Pro for 5 rooms, or Enterprise for up to 10 rooms!`);
      } else if (userTier === 'pro') {
        if (onRequestUpgrade) onRequestUpgrade('enterprise');
        alert(`Pro Tier allows max 5 breakout rooms. Upgrade to Enterprise for up to 10 rooms!`);
      } else {
        alert(`Maximum limit of 10 breakout rooms reached.`);
      }
      return;
    }
    const newRoomNo = rooms.length + 1;
    const newRoom = {
      id: `room-${newRoomNo}`,
      name: ROOM_NAMES[newRoomNo - 1] || `Room ${newRoomNo}`,
      key: `KEY-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'LOCKED',
      progress: 0,
      participants: 6,
      currentChallenge: 'Riddle Challenge #1',
      micMuted: false,
      videoOn: true
    };
    setRooms([...rooms, newRoom]);
  };

  const handleDeleteRoom = (roomId) => {
    if (rooms.length <= 1) {
      alert('Escape Room requires at least 1 breakout room.');
      return;
    }
    setRooms(rooms.filter(r => r.id !== roomId));
  };

  const toggleRoomMic = (roomId) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, micMuted: !r.micMuted } : r));
  };

  const toggleRoomVideo = (roomId) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, videoOn: !r.videoOn } : r));
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
              🗝️ Escape Room & Video/Audio Breakouts
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Tier Limit: <strong>{userTier.toUpperCase()}</strong> ({rooms.length}/{maxAllowedRooms} Rooms Active) • Integrated Live Video & Audio Calls
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 800, background: 'rgba(6, 182, 212, 0.1)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            Plan Limits: Free (2) | Pro (5) | Enterprise (10)
          </span>
          <button 
            className="btn btn-primary"
            onClick={() => alert('Launching Escape Room Session with Live Video & Audio Discussion Rooms!')}
            style={{ fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
          >
            <Play size={14} /> Launch Live Breakouts 🚀
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
          🧩 Breakout Rooms Setup ({rooms.length} / {maxAllowedRooms} Rooms)
        </button>
        <button 
          className={`btn ${activeTab === 'monitor' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          onClick={() => setActiveTab('monitor')}
        >
          📺 Live Host 10-Room Grid Monitor
        </button>
      </div>

      {/* 1. ROOMS SETUP */}
      {activeTab === 'rooms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Configure puzzle keys, video call settings, and audio discussion parameters for each room:
            </p>
            <button 
              className="btn btn-secondary" 
              onClick={handleAddRoom}
              style={{ fontSize: '0.85rem' }}
            >
              + Add Breakout Room ({rooms.length}/{maxAllowedRooms})
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {rooms.map((room) => (
              <div key={room.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{room.name}</h3>
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

                {/* Audio & Video Controls for Room */}
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Live Media Controls:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className={`btn ${room.micMuted ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleRoomMic(room.id)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                      title="Toggle Room Mic"
                    >
                      {room.micMuted ? <MicOff size={12} /> : <Mic size={12} />}
                      {room.micMuted ? 'Muted' : 'Mic Active'}
                    </button>
                    <button 
                      className={`btn ${!room.videoOn ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => toggleRoomVideo(room.id)}
                      style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                      title="Toggle Room Video"
                    >
                      {!room.videoOn ? <VideoOff size={12} /> : <Video size={12} />}
                      {!room.videoOn ? 'Video Off' : 'Camera On'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    👥 <strong>{room.participants} members</strong>
                  </span>
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

      {/* 2. LIVE HOST COMMAND MONITOR GRID */}
      {activeTab === 'monitor' && (
        <div>
          <div style={{ padding: '16px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid var(--border-glass)', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem' }}>
            📡 <strong>Live Host Command Station:</strong> Real-time up to 10-room grid monitor with video streams & audio drop-in channels!
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {rooms.map((room) => (
              <div key={room.id} className="glass-card" style={{ padding: '20px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{room.name}</div>
                  {room.status === 'UNLOCKED' ? <CheckCircle size={18} color="#10b981" /> : <Lock size={18} color="#06b6d4" />}
                </div>

                {/* Simulated Video & Audio Stream Window */}
                <div style={{ height: '100px', background: '#090d16', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px', position: 'relative' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    📹 {room.videoOn ? 'Live Video Room Active' : 'Video Stream Off'}
                  </span>
                  <div style={{ position: 'absolute', bottom: '6px', right: '6px', display: 'flex', gap: '4px' }}>
                    {room.micMuted ? <MicOff size={14} color="#ef4444" /> : <Mic size={14} color="#10b981" />}
                    {room.videoOn ? <Video size={14} color="#06b6d4" /> : <VideoOff size={14} color="#ef4444" />}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Task: <strong>{room.currentChallenge}</strong>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                  <div style={{ width: `${room.progress}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #10b981)' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Progress: {room.progress}%</span>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setActiveAudioRoomId(room.id);
                      alert(`🎧 Host audio dropped into: ${room.name}`);
                    }}
                    style={{ fontSize: '0.75rem', padding: '4px 8px', display: 'flex', gap: '4px', alignItems: 'center', color: activeAudioRoomId === room.id ? '#10b981' : 'inherit' }}
                  >
                    <Volume2 size={12} /> {activeAudioRoomId === room.id ? 'Listening Live 🎧' : 'Listen In'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
