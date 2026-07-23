import React, { useState, useEffect } from 'react';
import { User, Settings, Presentation, FileText, LogOut, Save, MoveRight, MoveLeft, Shield, Sparkles, Layers } from 'lucide-react';

const AVAILABLE_THEMES = [
  { id: 'playroom', name: 'Playroom (Kids)', bg: '#fffdf0', colors: ['#ff477e', '#4ea8de', '#fbbf24'], type: 'light' },
  { id: 'light-luxe', name: 'Light Luxe', bg: '#f8fafc', colors: ['#6366f1', '#ec4899', '#8b5cf6'], type: 'light' },
  { id: 'cyber-mint', name: 'Cyber Mint', bg: '#f0fdf4', colors: ['#10b981', '#06b6d4', '#059669'], type: 'light' },
  { id: 'forest-sage', name: 'Forest Sage', bg: '#f4f8f6', colors: ['#166534', '#9a3412', '#0f766e'], type: 'light' },
  { id: 'corporate', name: 'Corporate', bg: '#ffffff', colors: ['#1e3a8a', '#475569', '#2563eb'], type: 'light' },
  { id: 'neon', name: 'Neon Eclipse', bg: '#031220', colors: ['#0ea5e9', '#10b981', '#06b6d4'], type: 'dark' },
  { id: 'ocean', name: 'Ocean Breeze', bg: '#0a1128', colors: ['#00f2fe', '#4facfe', '#00f2fe'], type: 'dark' },
  { id: 'sunset', name: 'Sunset Glow', bg: '#151110', colors: ['#f97316', '#e11d48', '#f59e0b'], type: 'dark' },
  { id: 'classic-slate', name: 'Classic Slate', bg: '#0f172a', colors: ['#38bdf8', '#94a3b8', '#818cf8'], type: 'dark' }
];

const DEFAULT_TIER_FEATURES = {
  free: [
    { id: 'poll', name: '📊 Multiple Choice Polls', desc: 'Standard interactive audience voting' },
    { id: 'quiz', name: '🧠 Basic Speed Quiz', desc: 'Timed multiple choice quiz with leaderboard' }
  ],
  basic: [
    { id: 'qa', name: '❓ Live Audience Q&A', desc: 'Upvote & answer participant questions' },
    { id: 'pdf_export', name: '📄 Export PDF Reports', desc: 'Download printable session analytics' }
  ],
  pro: [
    { id: 'wordcloud', name: '☁️ Word Cloud Collection', desc: 'Real-time vibrant word submission cloud' },
    { id: 'brainstorm', name: '💡 Brainstorming Notes', desc: 'Sticky notes & prioritization grid' },
    { id: 'focus_mode', name: '🔒 Focus Mode (Anti-Cheat)', desc: 'Detect tab switches during live quizzes' },
    { id: 'stopwatch', name: '⏱️ Custom Stopwatch Timer', desc: 'Customizable countdown timers & sound' }
  ],
  enterprise: [
    { id: 'escaperoom', name: '🏆 Escape Vault Challenge', desc: 'Multi-stage team puzzle challenge' },
    { id: 'multi_day', name: '📅 Multi-Day Workshops', desc: 'Schedule 5-day event cards & day sections' }
  ]
};

export default function AdminPanel({ user, onLogout, onBackToDashboard }) {
  const [profileName, setProfileName] = useState(user?.name || '');
  const [defaultTheme, setDefaultTheme] = useState('corporate');
  const [analytics, setAnalytics] = useState({ presentations: 0, slides: 0 });
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [adminStats, setAdminStats] = useState({ users: [], referrals: [] });

  // Super Admin Drag & Drop Payment Tier Features State
  const [tierFeatures, setTierFeatures] = useState(() => {
    const saved = localStorage.getItem('pulse-poll-tier-features');
    return saved ? JSON.parse(saved) : DEFAULT_TIER_FEATURES;
  });

  const [draggedFeature, setDraggedFeature] = useState(null);
  const [sourceTier, setSourceTier] = useState(null);

  const fetchAdminStats = async () => {
    if (user?.email === 'pradeepvarkala@gmail.com') {
      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'x-user-email': user.email }
        });
        const data = await res.json();
        if (data.success) {
          setAdminStats(data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      }
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('pulse-poll-default-theme');
    if (savedTheme) setDefaultTheme(savedTheme);

    const savedPres = localStorage.getItem('pulse-poll-presentations');
    if (savedPres) {
      const presentations = JSON.parse(savedPres);
      let slideCount = 0;
      presentations.forEach(p => { slideCount += p.slides.length; });
      setAnalytics({ presentations: presentations.length, slides: slideCount });
    }

    fetchAdminStats();
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, name: profileName };
    localStorage.setItem('pulse-poll-user', JSON.stringify(updatedUser));
    localStorage.setItem('pulse-poll-default-theme', defaultTheme);
    localStorage.setItem('pulse-poll-tier-features', JSON.stringify(tierFeatures));
    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  // Drag and Drop Handlers
  const handleDragStart = (feature, tierKey) => {
    setDraggedFeature(feature);
    setSourceTier(tierKey);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnTier = (targetTierKey) => {
    if (!draggedFeature || !sourceTier || sourceTier === targetTierKey) return;

    const newSourceList = (tierFeatures[sourceTier] || []).filter(f => f.id !== draggedFeature.id);
    const newTargetList = [...(tierFeatures[targetTierKey] || []), draggedFeature];

    const updated = {
      ...tierFeatures,
      [sourceTier]: newSourceList,
      [targetTierKey]: newTargetList
    };

    setTierFeatures(updated);
    localStorage.setItem('pulse-poll-tier-features', JSON.stringify(updated));
    setDraggedFeature(null);
    setSourceTier(null);
  };

  const moveFeatureToTier = (feature, fromTier, targetTier) => {
    const newSourceList = (tierFeatures[fromTier] || []).filter(f => f.id !== feature.id);
    const newTargetList = [...(tierFeatures[targetTier] || []), feature];

    const updated = {
      ...tierFeatures,
      [fromTier]: newSourceList,
      [targetTier]: newTargetList
    };

    setTierFeatures(updated);
    localStorage.setItem('pulse-poll-tier-features', JSON.stringify(updated));
  };

  const tierMeta = {
    free: { name: 'Free Tier', color: 'var(--text-muted)', bg: 'var(--surface-2)' },
    basic: { name: 'Basic Plan', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)' },
    pro: { name: 'Pro / Premium Plan', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
    enterprise: { name: 'Enterprise Plan', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
  };

  return (
    <div className="animate-fade" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', color: 'var(--text-primary)' }}>
      {/* Admin header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 4px 0' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Manage user tiers, global styles, and Drag & Drop payment category features.</p>
        </div>
        <button className="btn btn-secondary" onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
      </div>

      {/* Main Admin Grid layout */}
      <div className="admin-grid">
        
        {/* Left sidebar panel */}
        <div className="glass-card admin-menu-card" style={{ padding: '20px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="admin-profile-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="admin-avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#08211E' }}>
              {user?.name?.slice(0, 2).toUpperCase() || 'US'}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0, textTransform: 'capitalize' }}>
                Signed in via {user?.provider || 'Email'}
              </p>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ marginTop: 'auto', width: '100%', justifyContent: 'space-between', color: 'var(--danger)', background: 'var(--danger-soft)', border: 'none' }}
            onClick={onLogout}
          >
            <span>Log Out</span>
            <LogOut size={16} />
          </button>
        </div>

        {/* Right content panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SUPER ADMIN DRAG AND DROP PAYMENT CATEGORIES FEATURE CONFIGURATOR */}
          {user?.email === 'pradeepvarkala@gmail.com' && (
            <div className="glass-card animate-fade" style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface)', border: '1.5px solid var(--accent)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={20} /> Super Admin: Drag & Drop Payment Tier Features
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Drag any feature card or click arrows to move functionalities between Free, Basic, Pro, and Enterprise payment tiers!
                  </p>
                </div>
                <button className="btn btn-primary" onClick={handleSaveSettings} style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 600, fontSize: '0.8rem', border: 'none' }}>
                  <Save size={14} /> Save Tier Mapping
                </button>
              </div>

              {/* 4 DRAG AND DROP COLUMNS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                {Object.keys(tierMeta).map((tierKey) => {
                  const meta = tierMeta[tierKey];
                  const features = tierFeatures[tierKey] || [];
                  const isHoveredTarget = sourceTier && sourceTier !== tierKey;

                  return (
                    <div 
                      key={tierKey}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnTier(tierKey)}
                      style={{
                        background: meta.bg, border: isHoveredTarget ? `2px dashed ${meta.color}` : `1px solid var(--border-soft)`,
                        borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px',
                        minHeight: '260px', transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${meta.color}44`, paddingBottom: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: meta.color }}>{meta.name}</span>
                        <span style={{ fontSize: '0.75rem', background: 'var(--surface)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {features.length} Features
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        {features.map((feat) => (
                          <div 
                            key={feat.id}
                            draggable
                            onDragStart={() => handleDragStart(feat, tierKey)}
                            className="glass-card slide-thumbnail"
                            style={{
                              padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)',
                              borderRadius: '8px', cursor: 'grab', display: 'flex', flexDirection: 'column', gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{feat.name}</span>
                              
                              {/* One-click move arrow controls */}
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {tierKey !== 'free' && (
                                  <button 
                                    type="button" 
                                    className="btn btn-secondary btn-icon"
                                    title="Move to Lower Tier"
                                    onClick={() => {
                                      const tiers = ['free', 'basic', 'pro', 'enterprise'];
                                      const prevTier = tiers[tiers.indexOf(tierKey) - 1];
                                      if (prevTier) moveFeatureToTier(feat, tierKey, prevTier);
                                    }}
                                    style={{ padding: '2px 4px', fontSize: '0.7rem' }}
                                  >
                                    <MoveLeft size={12} />
                                  </button>
                                )}
                                {tierKey !== 'enterprise' && (
                                  <button 
                                    type="button" 
                                    className="btn btn-secondary btn-icon"
                                    title="Move to Higher Tier"
                                    onClick={() => {
                                      const tiers = ['free', 'basic', 'pro', 'enterprise'];
                                      const nextTier = tiers[tiers.indexOf(tierKey) + 1];
                                      if (nextTier) moveFeatureToTier(feat, tierKey, nextTier);
                                    }}
                                    style={{ padding: '2px 4px', fontSize: '0.7rem' }}
                                  >
                                    <MoveRight size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{feat.desc}</span>
                          </div>
                        ))}

                        {features.length === 0 && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', padding: '30px 10px', fontStyle: 'italic', border: '1px dashed var(--border-soft)', borderRadius: '8px' }}>
                            Drag features here to assign to {meta.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Configuration Form */}
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} /> Global Presenter Settings
            </h3>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Profile Display Name
                </label>
                <input 
                  type="text" 
                  className="input-text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Default Presenter Color Theme
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '8px' }}>
                  {AVAILABLE_THEMES.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setDefaultTheme(t.id)}
                      style={{
                        padding: '10px', borderRadius: '10px', border: defaultTheme === t.id ? '2px solid var(--accent)' : '1px solid var(--border-soft)',
                        background: 'var(--surface-2)', cursor: 'pointer', textAlign: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '6px' }}>
                        {t.colors.map((c, i) => (
                          <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: c }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{t.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {showSaveConfirm && (
                <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ Settings & Drag and Drop Tier mappings saved successfully!
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', background: 'var(--accent)', color: '#08211E', fontWeight: 600, border: 'none', gap: '6px' }}>
                <Save size={16} /> Save Settings
              </button>
            </form>
          </div>

          {/* Admin registries for pradeepvarkala@gmail.com */}
          {user?.email === 'pradeepvarkala@gmail.com' && (
            <div className="glass-card animate-fade" style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '10px' }}>
                🛡️ Administrator User & Tier Registry
              </h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-soft)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 6px' }}>User Email</th>
                      <th style={{ padding: '10px 6px' }}>Display Name</th>
                      <th style={{ padding: '10px 6px' }}>Plan Tier</th>
                      <th style={{ padding: '10px 6px' }}>Sub Status</th>
                      <th style={{ padding: '10px 6px' }}>Coins</th>
                      <th style={{ padding: '10px 6px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminStats.users?.map((u, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                        <td style={{ padding: '10px 6px', fontWeight: 600 }}>{u.email}</td>
                        <td style={{ padding: '10px 6px', color: 'var(--text-secondary)' }}>{u.name}</td>
                        <td style={{ padding: '10px 6px' }}>
                          <span style={{
                            padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                            background: u.tier === 'admin' ? 'rgba(239,68,68,0.15)' : u.tier === 'free' ? 'var(--surface-2)' : 'rgba(16, 185, 129, 0.15)',
                            color: u.tier === 'admin' ? '#f87171' : u.tier === 'free' ? 'var(--text-muted)' : '#34d399'
                          }}>
                            {u.tier.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 6px', color: 'var(--text-muted)' }}>{u.subscription_status}</td>
                        <td style={{ padding: '10px 6px', color: 'var(--gold)', fontWeight: 600 }}>🪙 {u.coins}</td>
                        <td style={{ padding: '10px 6px' }}>
                          <select 
                            value={u.tier}
                            onChange={async (e) => {
                              const targetTier = e.target.value;
                              try {
                                const res = await fetch('/api/admin/update-tier', {
                                  method: 'POST',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'x-user-email': user.email
                                  },
                                  body: JSON.stringify({ targetEmail: u.email, tier: targetTier })
                                });
                                const resData = await res.json();
                                if (resData.success) {
                                  alert(`Successfully updated user ${u.email} to tier ${targetTier}`);
                                  fetchAdminStats();
                                }
                              } catch(err) {
                                console.error(err);
                              }
                            }}
                            style={{
                              background: 'var(--surface-2)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              color: 'var(--text-primary)',
                              fontSize: '0.75rem',
                              padding: '2px 4px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="admin">Admin</option>
                            <option value="pro">Pro</option>
                            <option value="free">Free</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
