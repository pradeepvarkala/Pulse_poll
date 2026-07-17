import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Creator from './components/Creator';
import Presenter from './components/Presenter';
import Audience from './components/Audience';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Pricing from './components/Pricing';
import { Presentation as PresIcon, User as UserIcon, Settings } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('dashboard'); // dashboard, creator, presenter, audience, admin
  const [selectedPresentationId, setSelectedPresentationId] = useState(null);
  const [urlRoomCode, setUrlRoomCode] = useState('');
  
  // Authentication state
  const [user, setUser] = useState(null);

  // Check login session & route path on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pulse-poll-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || '';

    if (path === '/join' || path.startsWith('/join')) {
      setView('audience');
      if (code) {
        setUrlRoomCode(code);
      }
    }
  }, []);

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('pulse-poll-user');
    setUser(null);
    setView('dashboard');
  };

  const handleNavigateToDashboard = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setView('dashboard');
    setSelectedPresentationId(null);
    setUrlRoomCode('');
  };

  const handleNavigateToCreator = (id) => {
    setSelectedPresentationId(id);
    setView('creator');
  };

  const handleNavigateToPresenter = (id) => {
    setSelectedPresentationId(id);
    setView('presenter');
  };

  const handleNavigateToAudience = () => {
    window.history.pushState({}, '', '/join');
    setView('audience');
  };

  // Audience view does not require presenter log-in
  if (!user && view === 'audience') {
    return (
      <Audience 
        defaultRoomCode={urlRoomCode}
        onBackToMenu={() => {
          window.location.href = '/'; // redirect to root to trigger login if they leave
        }}
      />
    );
  }

  // Redirect to Auth if not logged in
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Header (hidden in presenter & audience fullscreen views) */}
      {view !== 'presenter' && view !== 'audience' && (
        <header className="app-header">
          <div className="logo" onClick={handleNavigateToDashboard}>
            <div className="logo-icon">
              <PresIcon size={18} color="white" />
            </div>
            <span>PulsePoll</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="btn btn-secondary" onClick={() => setView('pricing')}>
              ⚡ Plans
            </button>
            <button className="btn btn-secondary" onClick={handleNavigateToAudience}>
              Join a Room
            </button>
            <button 
              className={`btn ${view === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
              onClick={() => setView('admin')}
              title="Admin Panel Settings"
            >
              <Settings size={16} />
              <span>Admin settings</span>
            </button>
            <div 
              style={{ 
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: 'white', overflow: 'hidden', cursor: 'pointer'
              }}
              onClick={() => setView('admin')}
              title="View Profile Settings"
            >
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name.slice(0, 2).toUpperCase()
              )}
            </div>
          </div>
        </header>
      )}

      {/* Primary Routing Panel */}
      {view !== 'presenter' && view !== 'audience' ? (
        <main className="main-content">
          {view === 'dashboard' && (
            <Dashboard 
              onViewCreator={handleNavigateToCreator}
              onViewPresenter={handleNavigateToPresenter}
              onJoinAudience={handleNavigateToAudience}
            />
          )}

          {view === 'creator' && (
            <Creator 
              presentationId={selectedPresentationId}
              onBack={handleNavigateToDashboard}
              onPresent={handleNavigateToPresenter}
            />
          )}

          {view === 'admin' && (
            <AdminPanel 
              user={user}
              onLogout={handleLogout}
              onBackToDashboard={handleNavigateToDashboard}
            />
          )}

          {view === 'pricing' && (
            <Pricing 
              onBack={handleNavigateToDashboard}
            />
          )}
        </main>
      ) : (
        /* Fullscreen Viewports */
        <>
          {view === 'presenter' && (
            <Presenter 
              presentationId={selectedPresentationId}
              onBack={handleNavigateToDashboard}
            />
          )}

          {view === 'audience' && (
            <Audience 
              defaultRoomCode={urlRoomCode}
              onBackToMenu={handleNavigateToDashboard}
            />
          )}
        </>
      )}
    </div>
  );
}
