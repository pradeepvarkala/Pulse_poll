import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Trash2, Play, Users, Lock, Unlock, Shuffle, QrCode, 
  ChevronRight, Award, Sparkles, CheckCircle2, Copy, Eye, ArrowLeft, Layers, Sliders
} from 'lucide-react';
import { solveGroupAllocation, getGroupNames, GROUP_NAMING_THEMES } from '../utils/groupingAlgorithm';

const SAMPLE_SESSIONS = [
  {
    id: 'session-sample-1',
    title: '5-Day Executive Leadership & Innovation Workshop 🏆',
    description: 'Multi-day intensive facilitation program covering diagnostic polls, team escape vaults, strategy prioritisations, and final championship.',
    status: 'active',
    registrationLocked: false,
    theme: 'cyber-neon',
    groupThemeKey: 'indian_rivers',
    groupCount: 4,
    days: [
      {
        dayNumber: 1,
        title: 'Day 1: Team Alignment & Diagnostic Pulse',
        programs: [
          { id: 'prog-101', title: 'Program 1: Icebreaker Diagnostic Polls & Quiz', presentationId: 'sample-pres-1' },
          { id: 'prog-102', title: 'Program 2: Escape Room Vault Team Challenge', presentationId: 'sample-pres-2' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Day 2: Strategic Prioritization & Brainstorming',
        programs: [
          { id: 'prog-201', title: 'Program 1: Strategic Impact 2x2 Grid & Word Cloud', presentationId: 'sample-pres-3' }
        ]
      }
    ],
    roster: [
      { id: 'p-1', name: 'Alex Rivers', gender: 'M', avatar: '🚀', indCode: 'IND-101' },
      { id: 'p-2', name: 'Rahul Sharma', gender: 'M', avatar: '⚡', indCode: 'IND-102' },
      { id: 'p-3', name: 'Ananya Verma', gender: 'F', avatar: '👑', indCode: 'IND-103' },
      { id: 'p-4', name: 'Priya Patel', gender: 'F', avatar: '🦁', indCode: 'IND-104' },
      { id: 'p-5', name: 'David Miller', gender: 'M', avatar: '🎮', indCode: 'IND-105' },
      { id: 'p-6', name: 'Sara Khan', gender: 'F', avatar: '🎨', indCode: 'IND-106' },
      { id: 'p-7', name: 'Vikram Singh', gender: 'M', avatar: '🔥', indCode: 'IND-107' },
      { id: 'p-8', name: 'Deepa Nair', gender: 'F', avatar: '⭐', indCode: 'IND-108' }
    ],
    groups: [
      {
        id: 'group-1',
        name: 'Ganga 🌊',
        code: 'GANGA-101',
        members: [
          { id: 'p-1', name: 'Alex Rivers', gender: 'M', avatar: '🚀' },
          { id: 'p-3', name: 'Ananya Verma', gender: 'F', avatar: '👑' }
        ]
      },
      {
        id: 'group-2',
        name: 'Yamuna 💧',
        code: 'YAMUNA-102',
        members: [
          { id: 'p-2', name: 'Rahul Sharma', gender: 'M', avatar: '⚡' },
          { id: 'p-4', name: 'Priya Patel', gender: 'F', avatar: '🦁' }
        ]
      },
      {
        id: 'group-3',
        name: 'Cauvery 🏞️',
        code: 'CAUVERY-103',
        members: [
          { id: 'p-5', name: 'David Miller', gender: 'M', avatar: '🎮' },
          { id: 'p-6', name: 'Sara Khan', gender: 'F', avatar: '🎨' }
        ]
      },
      {
        id: 'group-4',
        name: 'Narmada 🌊',
        code: 'NARMADA-104',
        members: [
          { id: 'p-7', name: 'Vikram Singh', gender: 'M', avatar: '🔥' },
          { id: 'p-8', name: 'Deepa Nair', gender: 'F', avatar: '⭐' }
        ]
      }
    ]
  }
];

export default function SessionManager({ onLaunchPresenter, onBackToDashboard }) {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('pulse-poll-training-sessions');
    return saved ? JSON.parse(saved) : SAMPLE_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || null);
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule', 'lobby', 'teamgrid'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    localStorage.setItem('pulse-poll-training-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const updateActiveSession = (updater) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return typeof updater === 'function' ? updater(s) : { ...s, ...updater };
      }
      return s;
    }));
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newSess = {
      id: `session-${Math.random().toString(36).substr(2, 6)}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Multi-day training workshop facilitation program.',
      status: 'active',
      registrationLocked: false,
      theme: 'cyber-neon',
      groupThemeKey: 'indian_rivers',
      groupCount: 4,
      days: [
        {
          dayNumber: 1,
          title: 'Day 1: Alignment & Orientation',
          programs: [
            { id: `prog-${Math.random().toString(36).substr(2, 4)}`, title: 'Program 1: Opening Polls & Trivia Quiz', presentationId: 'sample-pres-1' }
          ]
        }
      ],
      roster: [],
      groups: []
    };

    setSessions([newSess, ...sessions]);
    setActiveSessionId(newSess.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleAddDay = () => {
    if (!activeSession) return;
    const nextDayNum = (activeSession.days || []).length + 1;
    const newDay = {
      dayNumber: nextDayNum,
      title: `Day ${nextDayNum}: Training Module`,
      programs: [
        { id: `prog-${Math.random().toString(36).substr(2, 4)}`, title: `Program 1: Module ${nextDayNum} Presentation`, presentationId: 'sample-pres-1' }
      ]
    };
    updateActiveSession(s => ({ ...s, days: [...(s.days || []), newDay] }));
  };

  const handleAddProgram = (dayIdx) => {
    if (!activeSession) return;
    const day = activeSession.days[dayIdx];
    const nextProgNum = (day.programs || []).length + 1;
    const newProg = {
      id: `prog-${Math.random().toString(36).substr(2, 4)}`,
      title: `Program ${nextProgNum}: Activity & Quiz Deck`,
      presentationId: 'sample-pres-1'
    };

    const updatedDays = [...activeSession.days];
    updatedDays[dayIdx] = {
      ...day,
      programs: [...(day.programs || []), newProg]
    };

    updateActiveSession({ days: updatedDays });
  };

  const handleToggleRegistrationLock = () => {
    updateActiveSession(s => ({ ...s, registrationLocked: !s.registrationLocked }));
  };

  const handleReshuffleTeams = () => {
    if (!activeSession) return;
    const roster = activeSession.roster || [];
    const count = activeSession.groupCount || 4;
    const themeKey = activeSession.groupThemeKey || 'indian_rivers';

    const result = solveGroupAllocation(roster, count, {}, themeKey);

    updateActiveSession({
      groups: result.groups
    });
  };

  const joinUrl = `${window.location.origin}/join?session=${activeSession?.id || ''}`;

  return (
    <div className="dashboard-container animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-icon" onClick={onBackToDashboard} title="Back to Dashboard">
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar color="#06b6d4" /> Multi-Day Training Workshops
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '6px 0 0 38px' }}>
            Pre-configure multi-day schedules, lock participant registrations, and auto-persist team codes across activities.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)', fontWeight: 800, gap: '8px', padding: '12px 20px' }}
        >
          <Plus size={18} /> New Training Workshop
        </button>
      </div>

      {/* Active Workshop Picker Drawer */}
      <div style={{
        display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-glass)'
      }}>
        {sessions.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSessionId(s.id)}
            style={{
              padding: '12px 20px', borderRadius: '16px', background: activeSessionId === s.id ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(37, 99, 235, 0.25))' : 'rgba(255,255,255,0.02)',
              border: activeSessionId === s.id ? '1.5px solid #06b6d4' : '1px solid var(--border-glass)',
              color: activeSessionId === s.id ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Award size={16} color={activeSessionId === s.id ? '#06b6d4' : 'var(--text-muted)'} />
            {s.title}
          </button>
        ))}
      </div>

      {activeSession && (
        <>
          {/* Workshop Control Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('schedule')}
                style={{ fontWeight: 800, padding: '10px 18px', fontSize: '0.85rem' }}
              >
                📅 Multi-Day Schedule
              </button>
              <button 
                className={`btn ${activeTab === 'lobby' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('lobby')}
                style={{ fontWeight: 800, padding: '10px 18px', fontSize: '0.85rem' }}
              >
                👥 Registration & Group Solver ({(activeSession.roster || []).length})
              </button>
              <button 
                className={`btn ${activeTab === 'teamgrid' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('teamgrid')}
                style={{ fontWeight: 800, padding: '10px 18px', fontSize: '0.85rem' }}
              >
                📱 Projector Team QR Grid
              </button>
            </div>

            {/* Quick Lock Registration Toggle */}
            <button 
              className={`btn ${activeSession.registrationLocked ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleToggleRegistrationLock}
              style={{
                background: activeSession.registrationLocked ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #10b981, #059669)',
                border: activeSession.registrationLocked ? '1px solid #ef4444' : 'none',
                color: activeSession.registrationLocked ? '#f87171' : '#ffffff',
                fontWeight: 800, gap: '6px', fontSize: '0.85rem'
              }}
            >
              {activeSession.registrationLocked ? <Lock size={16} /> : <Unlock size={16} />}
              {activeSession.registrationLocked ? 'Registration Locked' : 'Lock Registration'}
            </button>
          </div>

          {/* TAB 1: Multi-Day Schedule */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(activeSession.days || []).map((day, dIdx) => (
                <div key={day.dayNumber} className="glass-card" style={{ padding: '24px', borderRadius: '20px', background: 'rgba(11, 15, 25, 0.65)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#06b6d4', margin: 0 }}>
                      📅 {day.title}
                    </h3>
                    <button className="btn btn-secondary" onClick={() => handleAddProgram(dIdx)} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                      <Plus size={14} /> Add Program
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(day.programs || []).map((prog) => (
                      <div key={prog.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
                        padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)',
                        borderRadius: '14px'
                      }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{prog.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Linked Deck: {prog.presentationId} • 2-Code Access Persistent
                          </div>
                        </div>

                        <button 
                          className="btn btn-primary"
                          onClick={() => onLaunchPresenter(prog.presentationId)}
                          style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #059669)', gap: '6px' }}
                        >
                          <Play size={14} /> Launch Program Presentation
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button 
                className="btn btn-secondary"
                onClick={handleAddDay}
                style={{ padding: '16px', borderRadius: '16px', fontWeight: 800, borderStyle: 'dashed', justifyContent: 'center', gap: '8px' }}
              >
                <Plus size={18} /> Add Workshop Day Schedule
              </button>
            </div>
          )}

          {/* TAB 2: Registration Lobby & Group Solver */}
          {activeTab === 'lobby' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Left Column: QR Registration Portal */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#06b6d4', marginBottom: '12px' }}>
                  📱 One-Time Session QR Registration
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Participants scan ONCE to enter Name, Gender, and Photo Avatar. Credentials auto-persist for all workshop programs!
                </p>

                <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px' }}>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`} 
                    alt="Session Join QR"
                    style={{ width: '180px', height: '180px', display: 'block' }}
                  />
                </div>

                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
                  Registration Status: {activeSession.registrationLocked ? <span style={{ color: '#f87171' }}>🔒 LOCKED</span> : <span style={{ color: '#34d399' }}>🟢 OPEN FOR SCANNING</span>}
                </div>

                {/* Group Config Controls */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-glass)', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Group Naming Theme
                  </label>
                  <select 
                    value={activeSession.groupThemeKey || 'indian_rivers'}
                    onChange={(e) => updateActiveSession({ groupThemeKey: e.target.value })}
                    style={{ width: '100%', padding: '8px', background: '#0f172a', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}
                  >
                    <option value="indian_rivers">🌊 Indian Rivers (Ganga, Yamuna...)</option>
                    <option value="greek">🏛️ Greek Alphabets (Alpha, Beta...)</option>
                    <option value="cosmic">✨ Cosmic Constellations (Orion, Phoenix...)</option>
                    <option value="numeric">🔢 Team Numbers (Team 1, Team 2...)</option>
                  </select>

                  <button 
                    className="btn btn-primary"
                    onClick={handleReshuffleTeams}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #2563eb)', fontWeight: 800, gap: '6px' }}
                  >
                    <Shuffle size={16} /> Reshuffle & Solve Teams (CSP)
                  </button>
                </div>
              </div>

              {/* Right Column: Participant Roster */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>📋 Registered Roster ({(activeSession.roster || []).length})</span>
                  <span style={{ fontSize: '0.8rem', color: '#06b6d4', fontWeight: 700 }}>
                    {activeSession.roster?.filter(r => (r.gender || 'M').toUpperCase() === 'M').length || 0} Male / {activeSession.roster?.filter(r => (r.gender || 'M').toUpperCase() === 'F').length || 0} Female
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                  {(activeSession.roster || []).map((p) => (
                    <div key={p.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{p.avatar || '🚀'}</span>
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>{p.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Code: {p.indCode || 'IND-101'}</div>
                        </div>
                      </div>

                      <span style={{ fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '3px 8px', borderRadius: '8px', fontWeight: 800 }}>
                        {(p.gender || 'M').toUpperCase() === 'F' ? '👩 Female' : '👨 Male'}
                      </span>
                    </div>
                  ))}
                  {(activeSession.roster || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      No participants registered yet. Ask participants to scan QR code above!
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Projector Team QR Grid */}
          {activeTab === 'teamgrid' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff' }}>
                  📱 Projector Team Access Code & QR Grid
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Project this grid during breakout group activities! Participants type 1 Team Code or scan Team QR.
                </p>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px'
              }}>
                {(activeSession.groups || []).map(g => (
                  <div key={g.id} className="glass-card" style={{
                    padding: '20px', borderRadius: '20px', border: '1.5px solid #06b6d4',
                    background: 'rgba(15, 23, 42, 0.75)', textAlign: 'center'
                  }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginBottom: '6px' }}>{g.name}</h3>
                    <div style={{ fontSize: '0.85rem', background: '#06b6d4', color: '#ffffff', padding: '4px 12px', borderRadius: '12px', fontWeight: 900, display: 'inline-block', marginBottom: '12px' }}>
                      CODE: {g.code}
                    </div>

                    <div style={{ background: 'white', padding: '10px', borderRadius: '12px', display: 'inline-block', marginBottom: '12px' }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${joinUrl}&team=${g.code}`)}`} 
                        alt="Team QR"
                        style={{ width: '130px', height: '130px', display: 'block' }}
                      />
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Teammates: {(g.members || []).map(m => `${(m.gender || 'M').toUpperCase() === 'F' ? '👩' : '👨'} ${m.name}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal: Create New Workshop Session */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '540px', padding: '30px', borderRadius: '24px', background: '#0b0f19' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginBottom: '16px' }}>
              🏆 Create Multi-Day Training Workshop
            </h2>

            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Workshop Title
                </label>
                <input 
                  type="text"
                  className="input-text"
                  placeholder="e.g. 5-Day Executive Leadership & Team Workshop"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Description / Objectives
                </label>
                <textarea 
                  className="input-text"
                  rows="3"
                  placeholder="Enter workshop goals, topics, or program schedule overview..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #06b6d4, #2563eb)', fontWeight: 800 }}>
                  Create Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
