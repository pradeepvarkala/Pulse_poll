import React, { useState, useEffect } from 'react';
import { Plus, Play, Edit3, Trash2, Users, Presentation as PresentationIcon, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export default function Dashboard({ 
  user, onViewCreator, onViewPresenter, onJoinAudience, onOpenAiGenerator, 
  onViewAnalytics, onViewEscapeRoom, onViewMeetingScheduler,
  isSidebarCollapsed: propIsCollapsed, onToggleSidebar, onLogout
}) {
  const [presentations, setPresentations] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [dashboardTab, setDashboardTab] = useState('presentations');
  const [referralData, setReferralData] = useState({ coins: 0, referralCode: '', referredBy: null, unlockedModules: [], referrals: [] });
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true);

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalIsCollapsed;
  const toggleSidebar = onToggleSidebar || (() => setInternalIsCollapsed(!internalIsCollapsed));

  const userEmail = user?.email || 'guest@pulsepoll.com';

  const fetchReferralDetails = async () => {
    try {
      const res = await fetch('/api/user/referrals', {
        headers: { 'x-user-email': userEmail }
      });
      const data = await res.json();
      if (data && data.success) {
        setReferralData(data);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchReferralDetails();
    }
  }, [userEmail]);



  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const res = await fetch('/api/presentations', {
          headers: { 'x-user-email': userEmail }
        });
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const parsed = data.map(p => ({
            ...p,
            slides: typeof p.slides === 'string' ? JSON.parse(p.slides) : p.slides
          }));
          setPresentations(parsed);
        } else {
          setPresentations([]);
        }
      } catch (err) {
        console.error('Error fetching presentations:', err);
        try {
          const saved = localStorage.getItem('pulse-poll-presentations');
          if (saved && saved !== 'undefined') {
            const parsed = JSON.parse(saved);
            setPresentations(Array.isArray(parsed) ? parsed : []);
          } else {
            setPresentations([]);
          }
        } catch (e) {
          setPresentations([]);
        }
      }
    };

    fetchPresentations();
  }, []);

  const handleRedeemModule = async (moduleName, days) => {
    try {
      const res = await fetch('/api/user/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, moduleName, days })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchReferralDetails();
      } else {
        alert(data.error || 'Failed to redeem module.');
      }
    } catch(err) {
      console.error(err);
      alert('Error connecting to redemption server.');
    }
  };

  const handleCreatePresentation = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPres = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle.trim(),
      updatedAt: new Date().toLocaleDateString(),
      theme: localStorage.getItem('pulse-poll-default-theme') || 'corporate',
      slides: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'poll',
          question: '',
          options: [
            { id: 'opt-1', text: '' },
            { id: 'opt-2', text: '' }
          ]
        }
      ]
    };

    const updated = [newPres, ...presentations];
    setPresentations(updated);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(updated));
    setNewTitle('');
    setIsCreateModalOpen(false);

    try {
      await fetch('/api/presentations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify(newPres)
      });
    } catch (err) {
      console.error('Error saving presentation:', err);
    }

    onViewCreator(newPres.id);
  };

  const handleCreateQuickPresentation = (title, slideType) => {
    const newPres = {
      id: `pres-${Math.random().toString(36).substr(2, 6)}`,
      title: title,
      updatedAt: new Date().toLocaleDateString(),
      theme: 'cyber-neon',
      slides: [
        {
          id: `s-${Math.random().toString(36).substr(2, 4)}`,
          type: slideType,
          question: '',
          options: slideType === 'quiz' || slideType === 'poll' ? [
            { id: 'opt-1', text: '' },
            { id: 'opt-2', text: '' }
          ] : []
        }
      ]
    };

    const updated = [newPres, ...presentations];
    setPresentations(updated);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(updated));

    fetch('/api/presentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': userEmail
      },
      body: JSON.stringify(newPres)
    }).catch(err => console.error(err));

    onViewCreator(newPres.id);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this presentation?')) {
      const updated = presentations.filter(p => p.id !== id);
      setPresentations(updated);
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(updated));

      try {
        await fetch(`/api/presentations/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-email': userEmail }
        });
      } catch (err) {
        console.error('Error deleting presentation:', err);
      }
    }
  };

  const getBannerStyle = () => {
    return {
      background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(2, 132, 199, 0.04))',
      border: '1.5px solid rgba(37, 99, 235, 0.25)',
      borderRadius: '20px',
      padding: '28px',
      marginBottom: '30px',
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px',
      boxShadow: '0 10px 30px rgba(37, 99, 235, 0.06)'
    };
  };

  const getBadgeStyle = () => {
    const tier = user?.tier || 'free';
    if (tier === 'admin') return { background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
    if (tier === 'business') return { background: '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
    if (tier === 'pro') return { background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
    return { background: 'var(--text-muted)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
  };

  const getBadgeText = () => {
    const tier = user?.tier || 'free';
    if (tier === 'admin') return '🛡️ System Admin';
    if (tier === 'business') return '👑 Business User';
    if (tier === 'pro') return '✨ Pro Member';
    return '🌱 Free Account';
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', minHeight: 'calc(100vh - 120px)', width: '100%' }} className="animate-fade">
      {/* 1. Left Sidebar Navigation Menu */}
      <div className="glass-card" style={{
        width: isCollapsed ? '76px' : '240px',
        padding: isCollapsed ? '16px 8px' : '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'sticky',
        top: '90px',
        border: '1px solid var(--border-glass)',
        borderRadius: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          alignItems: 'center',
          fontWeight: 800,
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {!isCollapsed && <span>Navigation</span>}
          <button 
            className="btn btn-secondary btn-icon btn-sm"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
            style={{ width: '30px', height: '30px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <button 
            className={`sidebar-menu-btn ${dashboardTab === 'presentations' ? 'active' : ''}`}
            title="Presentations"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 14px' }}
            onClick={() => setDashboardTab('presentations')}
          >
            <span style={{ fontSize: '1.1rem' }}>📂</span>
            {!isCollapsed && <span>Presentations</span>}
          </button>

          <button 
            className={`sidebar-menu-btn ${dashboardTab === 'referrals' ? 'active' : ''}`}
            title="Rewards"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 14px' }}
            onClick={() => {
              setDashboardTab('referrals');
              fetchReferralDetails();
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>🎁</span>
            {!isCollapsed && <span>Rewards</span>}
          </button>
          
          <button 
            className="sidebar-menu-btn" 
            title="Analytics"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 14px' }}
            onClick={() => onViewAnalytics && onViewAnalytics(presentations[0])}
          >
            <span style={{ fontSize: '1.1rem' }}>📊</span>
            {!isCollapsed && <span>Analytics</span>}
          </button>

          <button 
            className="sidebar-menu-btn" 
            title="Breakout Rooms"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 14px' }}
            onClick={() => onViewEscapeRoom && onViewEscapeRoom(presentations[0])}
          >
            <span style={{ fontSize: '1.1rem' }}>🗝️</span>
            {!isCollapsed && <span>Breakout Rooms</span>}
          </button>

          <button 
            className="sidebar-menu-btn" 
            title="Live Video"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 14px' }}
            onClick={() => onViewMeetingScheduler && onViewMeetingScheduler(presentations[0])}
          >
            <span style={{ fontSize: '1.1rem' }}>📹</span>
            {!isCollapsed && <span>Live Video</span>}
          </button>
          
          <button 
            className="sidebar-menu-btn" 
            title="Join Room"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 14px' }}
            onClick={onJoinAudience}
          >
            <span style={{ fontSize: '1.1rem' }}>🧩</span>
            {!isCollapsed && <span>Join Room</span>}
          </button>
          
          <button 
            className="sidebar-menu-btn" 
            title="Templates"
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '12px' : '10px 14px' }}
            onClick={() => alert('Explore premium templates inside our learning & educational drop-downs in the header menu!')}
          >
            <span style={{ fontSize: '1.1rem' }}>🎨</span>
            {!isCollapsed && <span>Templates</span>}
          </button>

          <button 
            className="sidebar-menu-btn" 
            title="Logout"
            style={{ 
              justifyContent: isCollapsed ? 'center' : 'flex-start', 
              padding: isCollapsed ? '12px' : '10px 14px',
              marginTop: '16px',
              borderTop: '1px solid var(--border-glass)',
              color: '#f87171'
            }}
            onClick={onLogout}
          >
            <span style={{ fontSize: '1.1rem' }}>🚪</span>
            {!isCollapsed && <span style={{ color: '#f87171', fontWeight: 800 }}>Logout</span>}
          </button>
        </div>
      </div>

      {/* 2. Main Content Dashboard */}
      <div style={{ flex: 1 }}>
        {dashboardTab === 'presentations' ? (
          <>
            {/* Tier Custom Differentiated Dashboard Header */}
            <div style={getBannerStyle()}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Welcome back, {user?.name || 'Presenter'}</h1>
                  <span style={getBadgeStyle()}>{getBadgeText()}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                  {user?.tier === 'admin' 
                    ? 'You have complete administrative root permissions. Manage presentations, system settings, and core databases.' 
                    : 'Create interactive slides, collect live audience feedback, and run timed tests.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                {onOpenAiGenerator && (
                  <button 
                    className="btn btn-primary animate-pulse" 
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 15px rgba(6,182,212,0.3)', border: '1px solid rgba(255,255,255,0.3)' }}
                    onClick={onOpenAiGenerator}
                  >
                    <span>🤖 PulseAI Quiz Generator</span>
                    <span>⚡</span>
                  </button>
                )}
                <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                  <Plus size={18} /> New Presentation
                </button>
              </div>
            </div>

            <div className="dashboard-grid">
              {presentations.map((pres) => {
                const themeBg = 
                  pres.theme === 'cyber-neon' ? '/assets/theme_cyber_neon.jpg' :
                  pres.theme === 'midnight-gold' ? '/assets/theme_midnight_gold.jpg' :
                  pres.theme === 'cosmic-nebula' ? '/assets/theme_cosmic_nebula.jpg' :
                  pres.theme === 'playroom-magic' ? '/assets/theme_playroom_magic.jpg' :
                  '/assets/theme_cyber_neon.jpg';

                return (
                  <div 
                    key={pres.id} 
                    className="glass-card presentation-card"
                    onClick={() => onViewCreator(pres.id)}
                    style={{ overflow: 'hidden', padding: 0 }}
                  >
                    {/* Generated Artwork Theme Banner */}
                    <div style={{
                      height: '110px',
                      backgroundImage: `linear-gradient(rgba(11, 15, 25, 0.25), rgba(11, 15, 25, 0.85)), url(${themeBg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        background: 'rgba(6, 182, 212, 0.85)',
                        color: '#ffffff',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                      }}>
                        🎨 {pres.theme || 'cyber-neon'} Theme
                      </span>
                    </div>

                    <div style={{ padding: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div className="logo-icon" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                          <PresentationIcon size={14} color="white" />
                        </div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{pres.title}</h3>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
                        {pres.slides.length} {pres.slides.length === 1 ? 'slide' : 'slides'} • {pres.category || 'Interactive Deck'}
                      </p>

                      <div className="card-meta" style={{ padding: 0, marginTop: 0 }}>
                        <span style={{ fontSize: '0.75rem' }}>Updated {pres.updatedAt}</span>
                        <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="btn btn-secondary btn-icon" 
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => onViewCreator(pres.id)}
                            title="Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="btn btn-primary btn-icon" 
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => onViewPresenter(pres.id)}
                            title="Present Live"
                          >
                            <Play size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary btn-icon" 
                            style={{ width: '32px', height: '32px', color: 'var(--accent-red)' }}
                            onClick={(e) => handleDelete(pres.id, e)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {presentations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px solid var(--border-glass)', marginBottom: '30px' }}>
                <PresentationIcon size={36} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>No custom presentations created yet</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>Build a deck from scratch above, explore 60+ prebuilt templates in the navigation submenus, or click any capability below to launch!</p>
              </div>
            )}

            {/* Site Capabilities & What You Can Do on PulsePoll */}
            <div style={{ marginTop: '30px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚡</span> Platform Capabilities & Site Functionalities
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                  Discover interactive modules, real-time audience engagement tools, anti-cheat security, and customized theme presets.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📊</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>Real-Time Live Polling</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '16px' }}>
                      Gather instant audience votes with dynamic bar charts and real-time sentiment tracking.
                    </p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => handleCreateQuickPresentation('Live Polling Session', 'poll')}>
                    Launch Poll Module 🚀
                  </button>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>☁️</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>Interactive Word Clouds</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '16px' }}>
                      Collect freeform text ideas! Popular audience words swell in size with vibrant color themes.
                    </p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => handleCreateQuickPresentation('Word Cloud Workshop', 'wordcloud')}>
                    Launch Word Cloud 🚀
                  </button>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>⏱️</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>Millisecond Trivia Stopwatch</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '16px' }}>
                      Host competitive trivia battles with millisecond precision timers & live scoreboards.
                    </p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => handleCreateQuickPresentation('Timed Trivia Quiz', 'stopwatch')}>
                    Launch Timer Quiz 🚀
                  </button>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🧠</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>Sticky Notes Brainstorming</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '16px' }}>
                      Collect 2-word sticky notes from participants & drag-and-drop sort into 4 category grids.
                    </p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => handleCreateQuickPresentation('Brainstorm Workshop', 'brainstorm')}>
                    Launch Sticky Board 🚀
                  </button>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>📏</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>Rating Scale Surveys</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '16px' }}>
                      Collect multi-metric ratings on 1 to 5 sliders for OKR alignment & course evaluations.
                    </p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => handleCreateQuickPresentation('Scale Rating Survey', 'scales')}>
                    Launch Rating Survey 🚀
                  </button>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🔒</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 6px 0' }}>Anti-Cheat Focus Mode</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '16px' }}>
                      Enforce strict focus monitoring during live exams with tab-switch detection & security alerts.
                    </p>
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', fontWeight: 700 }} onClick={() => handleCreateQuickPresentation('Secure Exam Session', 'quiz')}>
                    Launch Secure Deck 🚀
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* REFERRAL & COIN GAMIFICATION TAB */
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="glass-card" style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(37,99,235,0.15))',
              border: '1px solid var(--primary)', padding: '30px', borderRadius: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>🎁 Refer Friends, Earn Coin Rewards</h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '600px', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  Share your referral link! When a friend registers, they receive a starter bonus of <strong>20 coins</strong>. Once they upgrade to any paid tier, you receive <strong>100 coins</strong>! Use coins to temporarily unlock premium modules.
                </p>
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)',
                padding: '15px 25px', borderRadius: '15px', textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Balance</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--accent-green)', margin: '5px 0' }}>🪙 {referralData.coins}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Referral Coins</div>
              </div>
            </div>

            {/* Link Sharing Widget */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Your Unique Referral Link
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}?ref=${referralData.referralCode || 'REF-CODE'}`}
                  style={{
                    flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-glass)',
                    borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)',
                    fontFamily: 'monospace', fontSize: '0.9rem'
                  }}
                  onClick={(e) => e.target.select()}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}?ref=${referralData.referralCode || 'REF-CODE'}`);
                    alert('Copied referral link to clipboard! Share it with friends to earn coins.');
                  }}
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Unlocks shop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Card 1: Focus Mode */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔒 Focus Mode (Anti-Cheat)
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '10px', lineHeight: 1.4 }}>
                    Locks users into the active presenting tab. Lockouts are triggered if they open other tabs during a live session.
                  </p>
                  
                  {/* Status indicator */}
                  <div style={{ margin: '15px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Status: {referralData.unlockedModules?.some(m => m.module === 'focus_mode' && new Date(m.expiresAt) > new Date()) ? (
                      <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>🔓 Unlocked until {new Date(referralData.unlockedModules.find(m => m.module === 'focus_mode').expiresAt).toLocaleDateString()}</span>
                    ) : (
                      <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>🔒 Locked</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleRedeemModule('focus_mode', 7)}>7 Days (100 Coins)</button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleRedeemModule('focus_mode', 30)}>30 Days (200 Coins)</button>
                </div>
              </div>

              {/* Card 2: Stopwatch Slide */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⏱️ Stopwatch / Timer Slide
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '10px', lineHeight: 1.4 }}>
                    Introduce interactive countdowns, countups, and timed activities with milli-second tick precision and arpeggios.
                  </p>
                  
                  <div style={{ margin: '15px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Status: {referralData.unlockedModules?.some(m => m.module === 'stopwatch' && new Date(m.expiresAt) > new Date()) ? (
                      <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>🔓 Unlocked until {new Date(referralData.unlockedModules.find(m => m.module === 'stopwatch').expiresAt).toLocaleDateString()}</span>
                    ) : (
                      <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>🔒 Locked</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleRedeemModule('stopwatch', 7)}>7 Days (100 Coins)</button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleRedeemModule('stopwatch', 30)}>30 Days (200 Coins)</button>
                </div>
              </div>

              {/* Card 3: Brainstorm sticky notes */}
              <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📌 Brainstorm Sticky Notes
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '10px', lineHeight: 1.4 }}>
                    Let users submit words/opinions to categorised grids. Presenter can sort and drag-drop columns dynamically.
                  </p>
                  
                  <div style={{ margin: '15px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Status: {referralData.unlockedModules?.some(m => m.module === 'brainstorm' && new Date(m.expiresAt) > new Date()) ? (
                      <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>🔓 Unlocked until {new Date(referralData.unlockedModules.find(m => m.module === 'brainstorm').expiresAt).toLocaleDateString()}</span>
                    ) : (
                      <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>🔒 Locked</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleRedeemModule('brainstorm', 7)}>7 Days (100 Coins)</button>
                  <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleRedeemModule('brainstorm', 30)}>30 Days (200 Coins)</button>
                </div>
              </div>

            </div>

            {/* Referral Registry table */}
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '15px' }}>👥 Referred Signups Registry</h3>
              {referralData.referrals?.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                  No referrals recorded yet. Share your unique code to invite users!
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px' }}>Name</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Plan Status</th>
                      <th style={{ padding: '10px' }}>Signup Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralData.referrals?.map((ref, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600 }}>{ref.name}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>{ref.email}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800,
                            background: ref.tier === 'free' ? 'rgba(255,255,255,0.05)' : 'rgba(16, 185, 129, 0.15)',
                            color: ref.tier === 'free' ? 'var(--text-secondary)' : '#34d399'
                          }}>
                            {ref.tier.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{new Date(ref.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card animate-fade" style={{ padding: '2rem', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create New Presentation</h3>
            <form onSubmit={handleCreatePresentation}>
              <div className="settings-group" style={{ marginBottom: '1.5rem' }}>
                <label>Presentation Title</label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="e.g., Q3 Planning Session" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewTitle('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
