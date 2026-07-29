import React, { useState, useEffect } from 'react';
import { Plus, Play, Edit3, Trash2, Users, Presentation as PresentationIcon, ChevronLeft, ChevronRight, Menu, Folder, FolderPlus, Tag, Layers, Calendar } from 'lucide-react';

const DEFAULT_FOLDERS = [
  { id: 'folder-leadership', name: 'Executive Leadership & Strategy', color: '#06b6d4' },
  { id: 'folder-stem', name: 'K-12 STEM Education', color: '#10b981' },
  { id: 'folder-highered', name: 'University Lectures', color: '#8b5cf6' }
];

const DEFAULT_INITIAL_DECKS = [
  {
    id: 'deck-sample-highered',
    title: '🎓 University Thesis Defense & Peer Q&A Panel',
    folderId: 'folder-highered',
    theme: 'classic-slate',
    updatedAt: new Date().toLocaleDateString(),
    slides: [
      { id: 's1', type: 'quiz', question: 'What is the standard significance threshold (p-value)? 📊', options: [{ id: 'opt-1', text: 'p < 0.05 (Correct)' }, { id: 'opt-2', text: 'p < 0.50' }] },
      { id: 's2', type: 'wordcloud', question: 'What is the single biggest methodology challenge in your research? 🎓' }
    ]
  },
  {
    id: 'deck-sample-leadership',
    title: '🚀 Executive Leadership & Strategy Alignment',
    folderId: 'folder-leadership',
    theme: 'corporate',
    updatedAt: new Date().toLocaleDateString(),
    slides: [
      { id: 's1', type: 'brainstorm', question: 'Brainstorm key leadership capabilities for 2026! 🚀', category1: 'Strategic Alignment 🎯', category2: 'Empathy ❤️' },
      { id: 's2', type: 'poll', question: 'Which executive initiative should take top priority this quarter?' }
    ]
  },
  {
    id: 'deck-sample-stem',
    title: '📊 STEM Science & Environmental Ecosystems',
    folderId: 'folder-stem',
    theme: 'playroom',
    updatedAt: new Date().toLocaleDateString(),
    slides: [
      { id: 's1', type: 'quiz', question: 'Which process converts sunlight and CO2 into oxygen? 🌿', options: [{ id: 'opt-1', text: 'Photosynthesis (Correct)' }, { id: 'opt-2', text: 'Respiration' }] }
    ]
  }
];

export default function Dashboard({ 
  user, onViewCreator, onViewPresenter, onJoinAudience, onOpenAiGenerator, 
  onViewAnalytics, onViewEscapeRoom, onViewMeetingScheduler, onViewSessions,
  isSidebarCollapsed: propIsCollapsed, onToggleSidebar, onLogout
}) {
  const [presentations, setPresentations] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetFolderId, setNewTargetFolderId] = useState('');
  const [newTheme, setNewTheme] = useState('corporate');
  const [dashboardTab, setDashboardTab] = useState('presentations');
  const [referralData, setReferralData] = useState({ coins: 0, referralCode: '', referredBy: null, unlockedModules: [], referrals: [] });
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true);

  // Folder System States
  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('pulse-poll-folders');
    return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
  });
  const [selectedFolderId, setSelectedFolderId] = useState('all'); // 'all', 'unorganized', or folder ID
  const [activeOpenedFolderId, setActiveOpenedFolderId] = useState(null); // null = Root directory, or folder ID when opened inside
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#06b6d4');

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
        
        const saved = localStorage.getItem('pulse-poll-presentations');
        let localDecks = [];
        if (saved && saved !== 'undefined') {
          try { localDecks = JSON.parse(saved); } catch(e){}
        }

        if (Array.isArray(data) && data.length > 0) {
          const parsed = data.map(p => ({
            ...p,
            folderId: p.folderId || p.folder_id || null,
            slides: typeof p.slides === 'string' ? JSON.parse(p.slides) : p.slides
          }));

          // Merge local decks to preserve folderId if server database doesn't store folderId column
          const merged = [...parsed];
          if (Array.isArray(localDecks) && localDecks.length > 0) {
            localDecks.forEach(ld => {
              const existingIdx = merged.findIndex(m => m.id === ld.id);
              if (existingIdx !== -1) {
                if (!merged[existingIdx].folderId && ld.folderId) {
                  merged[existingIdx].folderId = ld.folderId;
                }
              } else {
                merged.unshift(ld);
              }
            });
          }

          setPresentations(merged);
        } else if (Array.isArray(localDecks) && localDecks.length > 0) {
          setPresentations(localDecks.map(p => ({
            ...p,
            folderId: p.folderId || p.folder_id || null
          })));
        } else {
          setPresentations(DEFAULT_INITIAL_DECKS);
          localStorage.setItem('pulse-poll-presentations', JSON.stringify(DEFAULT_INITIAL_DECKS));
        }
      } catch (err) {
        console.error('Error fetching presentations:', err);
        try {
          const saved = localStorage.getItem('pulse-poll-presentations');
          if (saved && saved !== 'undefined') {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPresentations(parsed.map(p => ({
                ...p,
                folderId: p.folderId || p.folder_id || null
              })));
            } else {
              setPresentations(DEFAULT_INITIAL_DECKS);
              localStorage.setItem('pulse-poll-presentations', JSON.stringify(DEFAULT_INITIAL_DECKS));
            }
          } else {
            setPresentations(DEFAULT_INITIAL_DECKS);
            localStorage.setItem('pulse-poll-presentations', JSON.stringify(DEFAULT_INITIAL_DECKS));
          }
        } catch (e) {
          setPresentations(DEFAULT_INITIAL_DECKS);
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

  const handleCreateFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: `folder-${Math.random().toString(36).substr(2, 7)}`,
      name: newFolderName.trim(),
      color: newFolderColor
    };

    const updated = [newFolder, ...folders];
    setFolders(updated);
    localStorage.setItem('pulse-poll-folders', JSON.stringify(updated));
    setNewFolderName('');
    setIsFolderModalOpen(false);
  };

  const handleAssignPresentationFolder = (presId, folderId) => {
    const updated = presentations.map(p => {
      if (p.id === presId) {
        return { ...p, folderId: folderId || null };
      }
      return p;
    });

    setPresentations(updated);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(updated));

    const targetPres = updated.find(p => p.id === presId);
    if (targetPres) {
      fetch(`/api/presentations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify(targetPres)
      }).catch(err => console.error(err));
    }
  };

  const handleCreatePresentation = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const assignedFolder = newTargetFolderId || activeOpenedFolderId || null;

    const newPres = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle.trim(),
      folderId: assignedFolder,
      updatedAt: new Date().toLocaleDateString(),
      theme: newTheme || 'corporate',
      slides: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'poll',
          question: `Key Poll Question for ${newTitle.trim()}:`,
          options: [
            { id: 'opt-1', text: 'Option A' },
            { id: 'opt-2', text: 'Option B' }
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

  const handleCreateQuickPresentation = (suggestedTitle, slideType) => {
    setNewTitle(suggestedTitle || '');
    setNewTargetFolderId(activeOpenedFolderId || '');
    setIsCreateModalOpen(true);
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
    if (tier === 'admin') return { background: 'var(--accent)', color: '#08211E', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 };
    if (tier === 'business') return { background: 'var(--gold)', color: '#3A2600', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 };
    if (tier === 'pro') return { background: 'var(--accent)', color: '#08211E', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 };
    return { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 };
  };

  const getBadgeText = () => {
    const tier = user?.tier || 'free';
    if (tier === 'admin') return '🛡️ System Admin';
    if (tier === 'business') return '👑 Business User';
    if (tier === 'pro') return '✨ Pro Member';
    return '🌱 Free Account';
  };

  const filteredPresentations = presentations.filter(p => {
    if (selectedFolderId === 'all') return true;
    if (selectedFolderId === 'unorganized') return !p.folderId;
    return p.folderId === selectedFolderId;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minHeight: 'calc(100vh - 120px)', width: '100%' }} className="animate-fade">
      
      {/* 1. MENTIMETER UNBOXED HERO HEADING */}
      <div style={{ marginTop: '10px' }}>
        <h1 className="menti-hero-title">
          Welcome {user?.name || 'Pradeep S Varkala'}!
        </h1>

        {/* MENTIMETER QUICK ACTION PILLS ROW */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '32px' }}>
          <button 
            type="button" 
            className="menti-pill-btn menti-pill-btn-primary"
            onClick={() => {
              setNewTargetFolderId(activeOpenedFolderId || '');
              setIsCreateModalOpen(true);
            }}
          >
            <Plus size={16} /> New presentation
          </button>

          <button 
            type="button" 
            className="menti-pill-btn"
            onClick={onViewSessions}
          >
            <Calendar size={16} color="var(--accent)" /> Multi-Day Workshops
          </button>

          {onOpenAiGenerator && (
            <button 
              type="button" 
              className="menti-pill-btn"
              onClick={onOpenAiGenerator}
            >
              <span>⚡</span> Import / PulseAI Generator
            </button>
          )}

          <button 
            type="button" 
            className="menti-pill-btn"
            onClick={() => setIsFolderModalOpen(true)}
            style={{ marginLeft: 'auto' }}
          >
            <FolderPlus size={16} color="var(--accent)" /> + New Folder
          </button>
        </div>

        {/* 2. MENTIMETER "START WITH AI & INTERACTIVE ACTIVITIES" CARDS ROW */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Start with AI ✨
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
              Something else &gt;
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
            <div className="menti-activity-card" onClick={() => handleCreateQuickPresentation('Strategic Decision Voting', 'poll')}>
              <div style={{ fontSize: '1.8rem' }}>🎯</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Make decisions</div>
            </div>

            <div className="menti-activity-card" onClick={() => handleCreateQuickPresentation('Audience Pulse Check-in', 'poll')}>
              <div style={{ fontSize: '1.8rem' }}>📊</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Check-in</div>
            </div>

            <div className="menti-activity-card" onClick={() => handleCreateQuickPresentation('Team Brainstorm Session', 'brainstorm')}>
              <div style={{ fontSize: '1.8rem' }}>💡</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Brainstorm ideas</div>
            </div>

            <div className="menti-activity-card" onClick={() => handleCreateQuickPresentation('Live Room Arcade Quiz', 'quiz')}>
              <div style={{ fontSize: '1.8rem' }}>⚡</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Energize the room</div>
            </div>

            <div className="menti-activity-card" onClick={() => handleCreateQuickPresentation('Instant Feedback Wordcloud', 'wordcloud')}>
              <div style={{ fontSize: '1.8rem' }}>💬</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>Get live feedback</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Dashboard */}
      <div style={{ width: '100%' }}>
        {dashboardTab === 'presentations' && (
          <>
            {/* WINDOWS EXPLORER FOLDER SYSTEM: IF INSIDE OPENED FOLDER VIEW */}
            {activeOpenedFolderId !== null ? (
              (() => {
                const activeFolder = folders.find(f => f.id === activeOpenedFolderId);
                const activeFolderDecks = presentations.filter(p => p.folderId === activeOpenedFolderId);

                return (
                  <div>
                    {/* Folder Breadcrumb & Navigation Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'var(--surface)', padding: '14px 20px', borderRadius: '16px', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <button 
                          type="button"
                          className="btn btn-secondary" 
                          onClick={() => setActiveOpenedFolderId(null)}
                          style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, gap: '6px' }}
                        >
                          ← Back to All Folders
                        </button>
                        <span style={{ color: 'var(--text-muted)' }}>/</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 800, color: activeFolder?.color || 'var(--accent)' }}>
                          📁 {activeFolder?.name || 'Folder Directory'}
                        </div>
                        <span style={{ fontSize: '0.78rem', background: 'var(--accent-soft)', color: 'var(--accent)', padding: '3px 10px', borderRadius: '12px', fontWeight: 800 }}>
                          {activeFolderDecks.length} Saved {activeFolderDecks.length === 1 ? 'Deck' : 'Decks'}
                        </span>
                      </div>

                      <button 
                        type="button"
                        className="btn btn-primary" 
                        onClick={() => {
                          setNewTargetFolderId(activeOpenedFolderId);
                          setIsCreateModalOpen(true);
                        }}
                        style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 700, fontSize: '0.85rem', border: 'none', padding: '8px 16px', display: 'flex', gap: '6px', alignItems: 'center' }}
                      >
                        <Plus size={16} /> ➕ New Presentation in {activeFolder?.name}
                      </button>
                    </div>

                    {/* Presentation Cards inside this Opened Folder */}
                    {activeFolderDecks.length > 0 ? (
                      <div className="dashboard-grid">
                        {activeFolderDecks.map((pres) => {
                          const themeBg = 
                            pres.theme === 'corporate' ? '/assets/corporate_thumb.jpg' :
                            pres.theme === 'cyber-neon' || pres.theme === 'future-minds' ? '/assets/cyber_thumb.jpg' :
                            pres.theme === 'cosmic-nebula' ? '/assets/cosmic_thumb.jpg' :
                            pres.theme === 'playroom-magic' || pres.theme === 'playroom' ? '/assets/playroom_thumb.jpg' :
                            '/assets/corporate_thumb.jpg';

                          return (
                            <div 
                              key={pres.id} 
                              className="glass-card presentation-card card-lift"
                              onClick={() => onViewCreator(pres.id)}
                              style={{ overflow: 'hidden', padding: 0, borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}
                            >
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
                                  background: 'rgba(15, 23, 42, 0.85)',
                                  color: '#ffffff',
                                  padding: '3px 10px',
                                  borderRadius: '20px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                  backdropFilter: 'blur(4px)',
                                  border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                  🎨 {pres.theme || 'corporate'}
                                </span>

                                <div onClick={(e) => e.stopPropagation()}>
                                  <select 
                                    value={pres.folderId || ''}
                                    onChange={(e) => handleAssignPresentationFolder(pres.id, e.target.value)}
                                    style={{
                                      fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
                                      background: activeFolder ? activeFolder.color : 'rgba(15,23,42,0.85)',
                                      color: '#ffffff', border: 'none', cursor: 'pointer'
                                    }}
                                    title="Move presentation deck to another folder"
                                  >
                                    <option value={activeOpenedFolderId}>📁 Saved in {activeFolder?.name}</option>
                                    {folders.filter(f => f.id !== activeOpenedFolderId).map(f => (
                                      <option key={f.id} value={f.id}>📁 Move to {f.name}</option>
                                    ))}
                                    <option value="">🚫 Move to Unorganized</option>
                                  </select>
                                </div>
                              </div>

                              <div style={{ padding: '18px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                  <div className="logo-icon" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                                    <PresentationIcon size={14} color="white" />
                                  </div>
                                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{pres.title}</h3>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                    {(pres.slides || []).length} {(pres.slides || []).length === 1 ? 'slide' : 'slides'}
                                  </span>
                                  <span style={{ fontSize: '0.72rem', background: 'var(--surface-2)', color: activeFolder?.color, padding: '2px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid var(--border)' }}>
                                    📁 {activeFolder?.name}
                                  </span>
                                </div>

                                <div className="card-meta" style={{ padding: 0, marginTop: 0 }}>
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Updated {pres.updatedAt}</span>
                                  <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      className="btn btn-secondary btn-icon" 
                                      style={{ width: '32px', height: '32px' }}
                                      onClick={() => onViewCreator(pres.id)}
                                      title="Edit Deck"
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button 
                                      className="btn btn-primary btn-icon" 
                                      style={{ width: '32px', height: '32px', background: 'var(--accent)', border: 'none' }}
                                      onClick={() => onViewPresenter(pres.id)}
                                      title="Present Live"
                                    >
                                      <Play size={14} fill="#08211E" color="#08211E" />
                                    </button>
                                    <button 
                                      className="btn btn-secondary btn-icon" 
                                      style={{ width: '32px', height: '32px', color: 'var(--accent-red)' }}
                                      onClick={(e) => handleDelete(pres.id, e)}
                                      title="Delete Deck"
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
                    ) : (
                      <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-secondary)', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <Folder size={42} color={activeFolder?.color || 'var(--accent)'} style={{ marginBottom: '12px', opacity: 0.8 }} />
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                          Folder "{activeFolder?.name}" is currently empty
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                          Click the <b>"+ New Presentation"</b> button above to create a deck inside this folder!
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()
            ) : (
              /* ROOT DIRECTORY VIEW: SLEEK COMPACT MINI FOLDER CARDS */
              <>
                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    📁 Presentation Folders Directory
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      (Click any folder to open up and view presentations inside)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '12px' }}>
                    {folders.map(f => {
                      const count = presentations.filter(p => p.folderId === f.id).length;
                      return (
                        <div 
                          key={f.id}
                          className="glass-card card-lift"
                          onClick={() => setActiveOpenedFolderId(f.id)}
                          style={{
                            padding: '12px 14px', borderRadius: '14px', background: 'var(--surface)', border: `1px solid ${f.color}40`,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                            minHeight: '72px', boxShadow: `0 4px 14px -6px ${f.color}20`
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                              📁
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {f.name}
                              </div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                Open Folder →
                              </div>
                            </div>
                          </div>

                          <span style={{ fontSize: '0.72rem', background: `${f.color}20`, color: f.color, padding: '2px 8px', borderRadius: '10px', fontWeight: 800, flexShrink: 0 }}>
                            {count} {count === 1 ? 'Deck' : 'Decks'}
                          </span>
                        </div>
                      );
                    })}

                    {/* ➕ Create New Folder Compact Card */}
                    <div 
                      className="glass-card card-lift"
                      onClick={() => setIsFolderModalOpen(true)}
                      style={{
                        padding: '12px 14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1.5px dashed var(--border)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', minHeight: '72px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      <FolderPlus size={20} color="var(--accent)" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>➕ New Folder</div>
                        <div style={{ fontSize: '0.72rem' }}>Add directory</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* All & Unorganized Presentations Section */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📋 All Recent Decks
                    </div>

                    {/* Filter Pills */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button 
                        type="button"
                        className={`folder-chip-pill ${selectedFolderId === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedFolderId('all')}
                      >
                        📁 All Decks ({presentations.length})
                      </button>
                      {folders.map(f => {
                        const count = presentations.filter(p => p.folderId === f.id).length;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            className={`folder-chip-pill ${selectedFolderId === f.id ? 'active' : ''}`}
                            onClick={() => setSelectedFolderId(f.id)}
                            style={{ borderColor: selectedFolderId === f.id ? f.color : undefined }}
                          >
                            📁 {f.name} ({count})
                          </button>
                        );
                      })}
                      <button 
                        type="button"
                        className={`folder-chip-pill ${selectedFolderId === 'unorganized' ? 'active' : ''}`}
                        onClick={() => setSelectedFolderId('unorganized')}
                      >
                        Layers Unorganized ({presentations.filter(p => !p.folderId).length})
                      </button>
                    </div>
                  </div>

                  <div className="dashboard-grid">
                    {filteredPresentations.map((pres) => {
                      const themeBg = 
                        pres.theme === 'corporate' ? '/assets/corporate_thumb.jpg' :
                        pres.theme === 'cyber-neon' || pres.theme === 'future-minds' ? '/assets/cyber_thumb.jpg' :
                        pres.theme === 'cosmic-nebula' ? '/assets/cosmic_thumb.jpg' :
                        pres.theme === 'playroom-magic' || pres.theme === 'playroom' ? '/assets/playroom_thumb.jpg' :
                        '/assets/corporate_thumb.jpg';

                      const assignedFolder = folders.find(f => f.id === pres.folderId);

                      return (
                        <div 
                          key={pres.id} 
                          className="glass-card presentation-card card-lift"
                          onClick={() => onViewCreator(pres.id)}
                          style={{ overflow: 'hidden', padding: 0, borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}
                        >
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
                              background: 'rgba(15, 23, 42, 0.85)',
                              color: '#ffffff',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              🎨 {pres.theme || 'corporate'}
                            </span>

                            <div onClick={(e) => e.stopPropagation()}>
                              <select 
                                value={pres.folderId || ''}
                                onChange={(e) => handleAssignPresentationFolder(pres.id, e.target.value)}
                                style={{
                                  fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px',
                                  background: assignedFolder ? assignedFolder.color : 'rgba(15,23,42,0.85)',
                                  color: '#ffffff', border: 'none', cursor: 'pointer'
                                }}
                                title="Move presentation deck to folder"
                              >
                                <option value="">📁 Move to Folder...</option>
                                {folders.map(f => (
                                  <option key={f.id} value={f.id}>📁 {f.name}</option>
                                ))}
                                <option value="">🚫 Unorganized</option>
                              </select>
                            </div>
                          </div>

                          <div style={{ padding: '18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                              <div className="logo-icon" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                                <PresentationIcon size={14} color="white" />
                              </div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{pres.title}</h3>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {(pres.slides || []).length} {(pres.slides || []).length === 1 ? 'slide' : 'slides'}
                              </span>
                              {assignedFolder && (
                                <span style={{ fontSize: '0.72rem', background: 'var(--surface-2)', color: assignedFolder.color, padding: '2px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid var(--border)' }}>
                                  📁 {assignedFolder.name}
                                </span>
                              )}
                            </div>

                            <div className="card-meta" style={{ padding: 0, marginTop: 0 }}>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Updated {pres.updatedAt}</span>
                              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                <button 
                                  className="btn btn-secondary btn-icon" 
                                  style={{ width: '32px', height: '32px' }}
                                  onClick={() => onViewCreator(pres.id)}
                                  title="Edit Deck"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  className="btn btn-primary btn-icon" 
                                  style={{ width: '32px', height: '32px', background: 'var(--accent)', border: 'none' }}
                                  onClick={() => onViewPresenter(pres.id)}
                                  title="Present Live"
                                >
                                  <Play size={14} fill="#08211E" color="#08211E" />
                                </button>
                                <button 
                                  className="btn btn-secondary btn-icon" 
                                  style={{ width: '32px', height: '32px', color: 'var(--accent-red)' }}
                                  onClick={(e) => handleDelete(pres.id, e)}
                                  title="Delete Deck"
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
                </div>
              </>
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
        )}

        {dashboardTab === 'referrals' && (
          /* REFERRAL & COIN GAMIFICATION TAB MATCHING USER DESIGN TEMPLATE */
          <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            <section className="hero">
              <div className="hero-left">
                <div className="hero-eyebrow">🎁 Referral Program</div>
                <div className="hero-title font-display">Refer Friends, Earn Coin Rewards</div>
                <div className="hero-desc">
                  Share your referral link! When a friend registers, they receive a starter bonus of <b>20 coins</b>.
                  Once they upgrade to any paid tier, you receive <b>100 coins</b>! Use coins to temporarily unlock premium modules.
                </div>
              </div>
              <div className="balance-card">
                <div className="balance-label">Your Balance</div>
                <div className="balance-value">
                  <div className="coin-icon">¢</div>
                  <span className="balance-number font-display">{referralData.coins || 0}</span>
                </div>
                <div className="balance-sub">Referral Coins</div>
              </div>
            </section>

            <section className="card">
              <div className="card-label">YOUR UNIQUE REFERRAL LINK</div>
              <div className="link-row">
                <input 
                  className="link-input font-mono" 
                  id="refLink" 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}?ref=${referralData.referralCode || 'REF-CODE'}`}
                  onClick={(e) => e.target.select()}
                />
                <button 
                  className="copy-btn" 
                  id="copyBtn"
                  onClick={(e) => {
                    navigator.clipboard.writeText(`${window.location.origin}?ref=${referralData.referralCode || 'REF-CODE'}`);
                    const btn = e.currentTarget;
                    btn.classList.add('copied');
                    btn.innerText = 'Copied!';
                    setTimeout(() => {
                      btn.classList.remove('copied');
                      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy Link</span>`;
                    }, 1800);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>Copy Link</span>
                </button>
              </div>
            </section>

            <section className="feature-grid">
              {/* Feature 1: Focus Mode */}
              <div className="feature-card">
                <div className="feature-head">
                  <span className="feature-icon">🔒</span>
                  <span className="feature-title font-display">Focus Mode (Anti-Cheat)</span>
                </div>
                <div className="feature-desc">
                  Locks users into the active presenting tab. Lockouts are triggered if they open other tabs during a live session.
                </div>
                <div className="feature-status">
                  {referralData.unlockedModules?.some(m => m.module === 'focus_mode' && new Date(m.expiresAt) > new Date()) ? (
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>🔓 Unlocked</span>
                  ) : (
                    <span className="status-locked" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="status-dot"></span>Locked</span>
                  )}
                </div>
                <button className="unlock-btn" onClick={() => handleRedeemModule('focus_mode', 7)}>
                  7 Days <span className="coin-tag">(100 Coins)</span>
                </button>
                <button className="unlock-btn" onClick={() => handleRedeemModule('focus_mode', 30)}>
                  30 Days <span className="coin-tag">(200 Coins)</span>
                </button>
              </div>

              {/* Feature 2: Stopwatch / Timer Slide */}
              <div className="feature-card">
                <div className="feature-head">
                  <span className="feature-icon">⏱️</span>
                  <span className="feature-title font-display">Stopwatch / Timer Slide</span>
                </div>
                <div className="feature-desc">
                  Introduce interactive countdowns, countups, and timed activities with milli-second tick precision and arpeggios.
                </div>
                <div className="feature-status">
                  {referralData.unlockedModules?.some(m => m.module === 'stopwatch' && new Date(m.expiresAt) > new Date()) ? (
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>🔓 Unlocked</span>
                  ) : (
                    <span className="status-locked" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="status-dot"></span>Locked</span>
                  )}
                </div>
                <button className="unlock-btn" onClick={() => handleRedeemModule('stopwatch', 7)}>
                  7 Days <span className="coin-tag">(100 Coins)</span>
                </button>
                <button className="unlock-btn" onClick={() => handleRedeemModule('stopwatch', 30)}>
                  30 Days <span className="coin-tag">(200 Coins)</span>
                </button>
              </div>

              {/* Feature 3: Brainstorm Sticky Notes */}
              <div className="feature-card">
                <div className="feature-head">
                  <span className="feature-icon">📌</span>
                  <span className="feature-title font-display">Brainstorm Sticky Notes</span>
                </div>
                <div className="feature-desc">
                  Let users submit words/opinions to categorised grids. Presenter can sort and drag-drop columns dynamically.
                </div>
                <div className="feature-status">
                  {referralData.unlockedModules?.some(m => m.module === 'brainstorm' && new Date(m.expiresAt) > new Date()) ? (
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>🔓 Unlocked</span>
                  ) : (
                    <span className="status-locked" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span className="status-dot"></span>Locked</span>
                  )}
                </div>
                <button className="unlock-btn" onClick={() => handleRedeemModule('brainstorm', 7)}>
                  7 Days <span className="coin-tag">(100 Coins)</span>
                </button>
                <button className="unlock-btn" onClick={() => handleRedeemModule('brainstorm', 30)}>
                  30 Days <span className="coin-tag">(200 Coins)</span>
                </button>
              </div>
            </section>

            <section className="card">
              <div className="card-label">👥 REFERRED SIGNUPS REGISTRY</div>
              {referralData.referrals?.length === 0 ? (
                <div className="registry-empty">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M17 8l3 3-3 3"/><path d="M14 11h6"/></svg>
                  <p>No referrals recorded yet. <b>Share your unique code to invite users!</b></p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px' }}>Name</th>
                      <th style={{ padding: '10px' }}>Email</th>
                      <th style={{ padding: '10px' }}>Plan Status</th>
                      <th style={{ padding: '10px' }}>Signup Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referralData.referrals?.map((ref, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <td style={{ padding: '12px 10px', fontWeight: 600 }}>{ref.name}</td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>{ref.email}</td>
                        <td style={{ padding: '12px 10px' }}>
                          <span style={{
                            padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800,
                            background: ref.tier === 'free' ? 'var(--surface-2)' : 'var(--accent-soft)',
                            color: ref.tier === 'free' ? 'var(--text-muted)' : 'var(--accent)'
                          }}>
                            {ref.tier.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px 10px', color: 'var(--text-faint)' }}>{new Date(ref.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        )}
      </div>

      {/* MODAL 1: TOPIC-BASED NEW PRESENTATION CREATOR WIZARD */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div className="glass-card animate-fade" style={{ padding: '24px', width: '90%', maxWidth: '480px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>✨ Create New Presentation</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>Enter a topic title, assign to a folder, and choose a design theme:</p>
            
            <form onSubmit={handleCreatePresentation} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Presentation Topic / Title
                </label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="e.g., Executive Strategy & AI Innovation 2026" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--accent)', marginTop: '5px', display: 'block', fontWeight: 600 }}>
                  💡 Tip: Enter a recognizable title for your audience (e.g., 'Q3 Executive Strategy' or 'Physics 101 Quiz')
                </span>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Assign to Folder
                </label>
                <select 
                  value={newTargetFolderId}
                  onChange={(e) => setNewTargetFolderId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                >
                  <option value="">📁 Unorganized (No Folder)</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>📁 {f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Presentation Theme Style
                </label>
                <select 
                  value={newTheme}
                  onChange={(e) => setNewTheme(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                >
                  <option value="corporate">💼 Corporate Slate (Clean Professional)</option>
                  <option value="cyber-neon">⚡ Cyber Neon (High-Tech Arcade)</option>
                  <option value="classic-slate">🏛️ Classic Slate (Higher Ed)</option>
                  <option value="playroom">🎨 Playroom Magic (Vibrant K-12)</option>
                  <option value="forest-sage">🌿 Forest Sage (Academic Research)</option>
                  <option value="light-luxe">✨ Light Luxe (Clean White)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewTitle('');
                  }}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 700, border: 'none', padding: '8px 20px' }}>
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW FOLDER CREATOR MODAL */}
      {isFolderModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div className="glass-card animate-fade" style={{ padding: '24px', width: '90%', maxWidth: '440px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderPlus color="var(--accent)" size={20} /> Create New Folder
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Group your presentations into organized folders:</p>
            
            <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Folder Name
                </label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="e.g. Q3 Executive Strategy Decks" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  autoFocus
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Folder Accent Color
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6'].map(col => (
                    <button 
                      key={col}
                      type="button"
                      onClick={() => setNewFolderColor(col)}
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%', background: col,
                        border: newFolderColor === col ? '3px solid white' : 'none', cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setIsFolderModalOpen(false)}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 700, border: 'none', padding: '8px 20px' }}>
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
