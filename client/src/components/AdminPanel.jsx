import React, { useState, useEffect } from 'react';
import { User, Settings, Presentation, FileText, LogOut, Save } from 'lucide-react';

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

export default function AdminPanel({ user, onLogout, onBackToDashboard }) {
  const [profileName, setProfileName] = useState(user?.name || '');
  const [defaultTheme, setDefaultTheme] = useState('corporate');
  const [analytics, setAnalytics] = useState({ presentations: 0, slides: 0 });
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  useEffect(() => {
    // Load default theme settings
    const savedTheme = localStorage.getItem('pulse-poll-default-theme');
    if (savedTheme) {
      setDefaultTheme(savedTheme);
    }

    // Compile analytics from local presentations
    const savedPres = localStorage.getItem('pulse-poll-presentations');
    if (savedPres) {
      const presentations = JSON.parse(savedPres);
      let slideCount = 0;
      presentations.forEach(p => {
        slideCount += p.slides.length;
      });
      setAnalytics({
        presentations: presentations.length,
        slides: slideCount
      });
    }
  }, []);

  const handleSaveSettings = (e) => {
    e.preventDefault();

    // 1. Update user profile name
    const updatedUser = { ...user, name: profileName };
    localStorage.setItem('pulse-poll-user', JSON.stringify(updatedUser));

    // 2. Update default theme settings
    localStorage.setItem('pulse-poll-default-theme', defaultTheme);

    setShowSaveConfirm(true);
    setTimeout(() => setShowSaveConfirm(false), 3000);
  };

  return (
    <div className="animate-fade">
      {/* Admin header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your account, view stats, and configure global workspace styles.</p>
        </div>
        <button className="btn btn-secondary" onClick={onBackToDashboard}>
          Back to Dashboard
        </button>
      </div>

      {/* Main Admin Grid layout */}
      <div className="admin-grid">
        
        {/* Left sidebar panel */}
        <div className="glass-card admin-menu-card">
          <div className="admin-profile-header">
            <div className="admin-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" />
              ) : (
                user?.name?.slice(0, 2).toUpperCase() || 'US'
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'capitalize' }}>
                Signed in via {user?.provider}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '8px 12px', borderRadius: '6px', background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
              <User size={16} /> Account & Profile
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', color: 'var(--accent-red)', border: 'none', background: 'rgba(239, 68, 68, 0.05)' }}
            onClick={onLogout}
          >
            <span>Log Out</span>
            <LogOut size={16} />
          </button>
        </div>

        {/* Right content panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Analytics Overview Cards */}
          <div className="admin-stats-grid">
            <div className="glass-card admin-stat-card">
              <div className="admin-stat-num">{analytics.presentations}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                <Presentation size={14} /> Total Presentations
              </div>
            </div>
            
            <div className="glass-card admin-stat-card">
              <div className="admin-stat-num">{analytics.slides}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
                <FileText size={14} /> Total Slides Configured
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Settings size={18} /> Global Configurations
            </h3>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="settings-group">
                <label>Profile Display Name</label>
                <input 
                  type="text" 
                  className="input-text" 
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="settings-group">
                <label>Default Presenter Color Theme</label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Newly created presentations will automatically inherit this visual layout.
                </p>
                <div className="theme-picker-section">
                  <div className="theme-picker-category-title">Light Themes</div>
                  <div className="theme-picker-grid">
                    {AVAILABLE_THEMES.filter(t => t.type === 'light').map(t => (
                      <div 
                        key={t.id} 
                        className={`theme-picker-item ${defaultTheme === t.id ? 'active' : ''}`}
                        onClick={() => setDefaultTheme(t.id)}
                        type="button"
                      >
                        <div className="theme-palette-preview" style={{ backgroundColor: t.bg }}>
                          {t.colors.map((c, i) => (
                            <div key={i} className="theme-color-dot" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="theme-picker-name">{t.name}</div>
                      </div>
                    ))}
                  </div>

                  <div className="theme-picker-category-title">Dark Themes</div>
                  <div className="theme-picker-grid">
                    {AVAILABLE_THEMES.filter(t => t.type === 'dark').map(t => (
                      <div 
                        key={t.id} 
                        className={`theme-picker-item ${defaultTheme === t.id ? 'active' : ''}`}
                        onClick={() => setDefaultTheme(t.id)}
                        type="button"
                      >
                        <div className="theme-palette-preview" style={{ backgroundColor: t.bg }}>
                          {t.colors.map((c, i) => (
                            <div key={i} className="theme-color-dot" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="theme-picker-name">{t.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {showSaveConfirm && (
                <div style={{ color: 'var(--accent-green)', fontSize: '0.9rem', fontWeight: 600 }}>
                  ✓ Settings saved successfully!
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: 'fit-content', gap: '8px' }}>
                <Save size={16} /> Save Settings
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
