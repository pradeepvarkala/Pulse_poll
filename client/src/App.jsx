import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Creator from './components/Creator';
import Presenter from './components/Presenter';
import Audience from './components/Audience';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Pricing from './components/Pricing';
import LandingPage from './components/LandingPage';
import { Presentation as PresIcon, User as UserIcon, Settings } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('dashboard'); // dashboard, creator, presenter, audience, admin
  const [selectedPresentationId, setSelectedPresentationId] = useState(null);
  const [urlRoomCode, setUrlRoomCode] = useState('');
  const [authMode, setAuthMode] = useState(null); // null (shows landing page), 'login', 'signup'
  const [selectedFeature, setSelectedFeature] = useState('');
  
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
    
    if (selectedFeature) {
      // Create a contextual presentation template for the selected feature
      let targetSlideType = 'poll';
      let targetQuestion = 'Enter your question here';
      let targetOptions = [
        { id: 'opt-c1', text: 'Option A' },
        { id: 'opt-c2', text: 'Option B' }
      ];
      let targetTheme = 'corporate';

      const featLower = selectedFeature.toLowerCase();

      if (featLower.includes('education') || featLower.includes('activities')) {
        targetSlideType = 'quiz';
        targetQuestion = 'What is the capital of France? 🇫🇷';
        targetOptions = [
          { id: 'opt-ed1', text: 'Paris (Correct)' },
          { id: 'opt-ed2', text: 'Rome' },
          { id: 'opt-ed3', text: 'London' }
        ];
        targetTheme = 'playroom'; // Kids theme!
      } else if (featLower.includes('corporate') || featLower.includes('meetings') || featLower.includes('enterprise')) {
        targetSlideType = 'scales';
        targetQuestion = 'Rate the training session objectives (1-5):';
        targetOptions = [
          { id: 'opt-corp1', text: 'Clarity of Goals' },
          { id: 'opt-corp2', text: 'Engagement of Slides' }
        ];
        targetTheme = 'corporate';
      } else if (featLower.includes('cloud')) {
        targetSlideType = 'wordcloud';
        targetQuestion = 'What is your word of the day?';
        targetOptions = [];
        targetTheme = 'ocean';
      } else if (featLower.includes('qa') || featLower.includes('q&a')) {
        targetSlideType = 'qa';
        targetQuestion = 'Audience Q&A - Submit questions here!';
        targetOptions = [];
        targetTheme = 'classic-slate';
      } else if (featLower.includes('quiz')) {
        targetSlideType = 'quiz';
        targetQuestion = 'Which planet is closest to the Sun? ☀️';
        targetOptions = [
          { id: 'q-s1', text: 'Mercury' },
          { id: 'q-s2', text: 'Venus' },
          { id: 'q-s3', text: 'Mars' }
        ];
        targetTheme = 'sunset';
      }

      const contextualPres = {
        id: `context-pres-${Math.random().toString(36).substr(2, 5)}`,
        title: `${selectedFeature} Workspace`,
        updatedAt: new Date().toLocaleDateString(),
        theme: targetTheme,
        slides: [
          {
            id: 'context-slide-1',
            type: targetSlideType,
            question: targetQuestion,
            options: targetOptions
          }
        ]
      };

      // Save to local storage
      const saved = localStorage.getItem('pulse-poll-presentations');
      let presentations = saved ? JSON.parse(saved) : [];
      presentations = presentations.filter(p => p.id !== 'demo-learning-sandbox');
      presentations.unshift(contextualPres);
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));

      // Sync to remote database in background
      fetch('/api/presentations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': profile.email || 'guest@pulsepoll.com'
        },
        body: JSON.stringify(contextualPres)
      }).catch(err => console.error('Error auto-syncing contextual presentation:', err));

      // Open directly in creator view
      setSelectedPresentationId(contextualPres.id);
      setView('creator');
      setSelectedFeature(''); // clear context
    } else {
      setView('dashboard');
    }
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

  const handleStartDemo = (featureName = '') => {
    const guestUser = {
      name: 'Guest Explorer',
      email: `guest-${Math.random().toString(36).substr(2, 5)}@pulsepoll.com`,
      tier: 'free',
      isDemo: true
    };
    setUser(guestUser);
    localStorage.setItem('pulse-poll-user', JSON.stringify(guestUser));

    // Determine slide types based on which feature was clicked
    let targetSlideType = 'poll';
    let targetQuestion = 'How would you rate your learning experience today?';
    let targetOptions = [
      { id: 'opt-d1', text: 'Option A (Correct)' },
      { id: 'opt-d2', text: 'Option B' }
    ];

    if (featureName.toLowerCase().includes('cloud')) {
      targetSlideType = 'wordcloud';
      targetQuestion = 'Describe this slide features in one word:';
      targetOptions = [];
    } else if (featureName.toLowerCase().includes('quiz')) {
      targetSlideType = 'quiz';
      targetQuestion = 'What is the color of the sun?';
      targetOptions = [
        { id: 'q-d1', text: 'Yellow ☀️' },
        { id: 'q-d2', text: 'Blue 💙' }
      ];
    } else if (featureName.toLowerCase().includes('qa') || featureName.toLowerCase().includes('q&a')) {
      targetSlideType = 'qa';
      targetQuestion = 'Submit your questions to the host below:';
      targetOptions = [];
    }

    const demoPres = {
      id: 'demo-learning-sandbox',
      title: `${featureName || 'Interactive Demo'} Sandbox`,
      updatedAt: new Date().toLocaleDateString(),
      theme: 'playroom',
      slides: [
        {
          id: 'demo-slide-1',
          type: targetSlideType,
          question: targetQuestion,
          options: targetOptions
        }
      ]
    };

    // Save demo presentation to localStorage
    const saved = localStorage.getItem('pulse-poll-presentations');
    let presentations = saved ? JSON.parse(saved) : [];
    presentations = presentations.filter(p => p.id !== 'demo-learning-sandbox');
    presentations.unshift(demoPres);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));

    // Open Creator view immediately
    setSelectedPresentationId('demo-learning-sandbox');
    setView('creator');
  };

  // Audience view does not require presenter log-in
  if (!user && view === 'audience') {
    return (
      <Audience 
        defaultRoomCode={urlRoomCode}
        onBackToMenu={() => {
          setView('dashboard');
          setAuthMode(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Redirect to Auth or Landing page if not logged in
  if (!user) {
    if (authMode === 'login' || authMode === 'signup') {
      return (
        <Auth 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => {
            setAuthMode(null);
            setSelectedFeature('');
          }} 
          featureContext={selectedFeature}
        />
      );
    }
    return (
      <LandingPage 
        onStartAuth={(mode, feature = '') => {
          setAuthMode(mode);
          setSelectedFeature(feature);
        }} 
        onJoinRoom={(code) => {
          setUrlRoomCode(code);
          setView('audience');
        }}
        onStartDemo={handleStartDemo}
      />
    );
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
              user={user}
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
