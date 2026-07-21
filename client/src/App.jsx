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
  const [activeDropdown, setActiveDropdown] = useState(null); // null, 'learn', 'education', 'enterprise'
  
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

  const generateSlidesForFeature = (featureName) => {
    const featLower = (featureName || '').toLowerCase();
    
    // Default fallback slide list
    let slides = [
      {
        id: 'slide-fall1',
        type: 'poll',
        question: `Welcome to the ${featureName} Workspace!`,
        options: [
          { id: 'opt-f1', text: 'Ready to start!' },
          { id: 'opt-f2', text: 'Show me features' }
        ]
      }
    ];

    if (featLower.includes('education') || featLower.includes('activities') || featLower.includes('pulseacademy')) {
      slides = [
        {
          id: 'slide-ed1',
          type: 'quiz',
          question: 'What is the capital of France? 🇫🇷',
          options: [
            { id: 'opt-ed1', text: 'Paris (Correct)' },
            { id: 'opt-ed2', text: 'Rome' },
            { id: 'opt-ed3', text: 'London' }
          ],
          timeLimit: 15
        },
        {
          id: 'slide-ed2',
          type: 'wordcloud',
          question: 'Describe your school week in one word! 🎒',
          options: []
        },
        {
          id: 'slide-ed3',
          type: 'poll',
          question: 'Which school subject is your absolute favorite?',
          options: [
            { id: 'opt-sub1', text: 'Science 🧪' },
            { id: 'opt-sub2', text: 'Maths 📐' },
            { id: 'opt-sub3', text: 'Art & Craft 🎨' }
          ]
        }
      ];
    } else if (featLower.includes('corporate') || featLower.includes('meetings') || featLower.includes('enterprise') || featLower.includes('compliance')) {
      slides = [
        {
          id: 'slide-corp1',
          type: 'scales',
          question: 'Rate the alignment and clarity of today\'s Q3 Objectives (1-5):',
          options: [
            { id: 'opt-corp1', text: 'Clarity of milestones' },
            { id: 'opt-corp2', text: 'Resource allocations' },
            { id: 'opt-corp3', text: 'Timeline feasibility' }
          ]
        },
        {
          id: 'slide-corp2',
          type: 'poll',
          question: 'Which initiative should we prioritize next quarter?',
          options: [
            { id: 'opt-pri1', text: 'Product Refinement' },
            { id: 'opt-pri2', text: 'Marketing Outreach' },
            { id: 'opt-pri3', text: 'Customer Success Hires' }
          ]
        },
        {
          id: 'slide-corp3',
          type: 'qa',
          question: 'Audience compliance & policy questions panel',
          options: []
        }
      ];
    } else if (featLower.includes('cloud')) {
      slides = [
        {
          id: 'slide-wc1',
          type: 'wordcloud',
          question: 'Describe your current workspace environment in one word:',
          options: []
        },
        {
          id: 'slide-wc2',
          type: 'wordcloud',
          question: 'What are your core values for teamwork?',
          options: []
        }
      ];
    } else if (featLower.includes('qa') || featLower.includes('q&a') || featLower.includes('help') || featLower.includes('webinars')) {
      slides = [
        {
          id: 'slide-qa1',
          type: 'qa',
          question: 'Host Q&A - Ask anything about features & modules!',
          options: []
        }
      ];
    } else if (featLower.includes('quiz') || featLower.includes('trivia')) {
      slides = [
        {
          id: 'slide-qz1',
          type: 'quiz',
          question: 'Which planet is known as the Red Planet? 🪐',
          options: [
            { id: 'qz-o1', text: 'Mars (Correct)' },
            { id: 'qz-o2', text: 'Venus' },
            { id: 'qz-o3', text: 'Jupiter' }
          ],
          timeLimit: 15
        },
        {
          id: 'slide-qz2',
          type: 'quiz',
          question: 'How many bones are there in an adult human body?',
          options: [
            { id: 'qz2-o1', text: '206 (Correct)' },
            { id: 'qz2-o2', text: '186' },
            { id: 'qz2-o3', text: '306' }
          ],
          timeLimit: 20
        }
      ];
    } else if (featLower.includes('poll') || featLower.includes('survey') || featLower.includes('presentations')) {
      slides = [
        {
          id: 'slide-pl1',
          type: 'poll',
          question: 'How do you currently capture team engagement?',
          options: [
            { id: 'pl-o1', text: 'Live Polling software' },
            { id: 'pl-o2', text: 'Email Surveys' },
            { id: 'pl-o3', text: 'We do not capture it' }
          ]
        },
        {
          id: 'slide-pl2',
          type: 'scales',
          question: 'Rate the importance of the following product aspects:',
          options: [
            { id: 'pl-s1', text: 'Interface speed' },
            { id: 'pl-s2', text: 'Custom templates' }
          ]
        }
      ];
    } else if (featLower.includes('templates') || featLower.includes('blog') || featLower.includes('integrations') || featLower.includes('how to')) {
      slides = [
        {
          id: 'slide-t1',
          type: 'poll',
          question: 'Which third-party tool integrations do you use most?',
          options: [
            { id: 'ti-1', text: 'Slack Messages' },
            { id: 'ti-2', text: 'Microsoft Teams' },
            { id: 'ti-3', text: 'Zoom Webinars' }
          ]
        },
        {
          id: 'slide-t2',
          type: 'scales',
          question: 'Rate your familiarity with PulsePoll functions:',
          options: [
            { id: 'ti-s1', text: 'Creating presentations' },
            { id: 'ti-s2', text: 'Configuring anti-cheat mode' }
          ]
        }
      ];
    }

    return slides;
  };

  const getThemeForFeature = (featureName) => {
    const featLower = (featureName || '').toLowerCase();
    if (featLower.includes('education') || featLower.includes('activities') || featLower.includes('pulseacademy')) return 'playroom';
    if (featLower.includes('corporate') || featLower.includes('meetings') || featLower.includes('enterprise') || featLower.includes('compliance')) return 'corporate';
    if (featLower.includes('cloud')) return 'ocean';
    if (featLower.includes('qa') || featLower.includes('q&a') || featLower.includes('help') || featLower.includes('webinars')) return 'classic-slate';
    if (featLower.includes('quiz') || featLower.includes('trivia')) return 'sunset';
    return 'light-luxe';
  };

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    
    if (selectedFeature) {
      const targetTheme = getThemeForFeature(selectedFeature);
      const slides = generateSlidesForFeature(selectedFeature);

      const contextualPres = {
        id: `context-pres-${Math.random().toString(36).substr(2, 5)}`,
        title: `${selectedFeature} Workspace`,
        updatedAt: new Date().toLocaleDateString(),
        theme: targetTheme,
        slides: slides
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

    const targetTheme = getThemeForFeature(featureName);
    const slides = generateSlidesForFeature(featureName);

    const demoPres = {
      id: 'demo-learning-sandbox',
      title: `${featureName || 'Interactive Demo'} Sandbox`,
      updatedAt: new Date().toLocaleDateString(),
      theme: targetTheme,
      slides: slides
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

  const handleTriggerContextualSlide = (featureName) => {
    const targetTheme = getThemeForFeature(featureName);
    const slides = generateSlidesForFeature(featureName);

    const contextualPres = {
      id: `context-pres-${Math.random().toString(36).substr(2, 5)}`,
      title: `${featureName} Workspace`,
      updatedAt: new Date().toLocaleDateString(),
      theme: targetTheme,
      slides: slides
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
        'x-user-email': user?.email || 'guest@pulsepoll.com'
      },
      body: JSON.stringify(contextualPres)
    }).catch(err => console.error('Error auto-syncing contextual presentation:', err));

    // Open directly in creator view
    setSelectedPresentationId(contextualPres.id);
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
        <header className="app-header" style={{ position: 'relative', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
            <div className="logo" onClick={handleNavigateToDashboard} style={{ marginRight: '10px' }}>
              <div className="logo-icon">
                <PresIcon size={18} color="white" />
              </div>
              <span>PulsePoll</span>
            </div>

            {/* Logged-In Submenu Nav Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
              
              {/* Education Dropdown */}
              <div 
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: activeDropdown === 'education' ? 'var(--primary)' : 'var(--text-primary)' }}
                onMouseEnter={() => setActiveDropdown('education')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <span>Education</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>

                {activeDropdown === 'education' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', zIndex: 1001 }}>
                    <div className="glass-card" style={{
                      width: '180px', padding: '12px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                      borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                      <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('K-12 Education'); setActiveDropdown(null); }}>K-12 Education</span>
                      <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Higher Education'); setActiveDropdown(null); }}>Higher Education</span>
                      <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Student Activities'); setActiveDropdown(null); }}>Student Activities</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Enterprise Dropdown */}
              <div 
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: activeDropdown === 'enterprise' ? 'var(--primary)' : 'var(--text-primary)' }}
                onMouseEnter={() => setActiveDropdown('enterprise')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <span>Enterprise</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>

                {activeDropdown === 'enterprise' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', zIndex: 1001 }}>
                    <div className="glass-card" style={{
                      width: '180px', padding: '12px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                      borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '10px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                      <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Corporate Training'); setActiveDropdown(null); }}>Corporate Training</span>
                      <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Staff Meetings'); setActiveDropdown(null); }}>Staff Meetings</span>
                      <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Security & Compliance'); setActiveDropdown(null); }}>Security & Compliance</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Learn Dropdown */}
              <div 
                style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: activeDropdown === 'learn' ? 'var(--primary)' : 'var(--text-primary)' }}
                onMouseEnter={() => setActiveDropdown('learn')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <span>Learn</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>

                {activeDropdown === 'learn' && (
                  <div style={{ position: 'absolute', top: '100%', left: '-100px', paddingTop: '10px', zIndex: 1001 }}>
                    <div className="glass-card" style={{
                      width: '420px', padding: '20px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                      borderRadius: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.6)', textAlign: 'left'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc', borderBottom: '1px solid var(--border-glass)', paddingBottom: '4px', marginBottom: '2px' }}>
                          Features
                        </div>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('AI presentation'); setActiveDropdown(null); }}>AI presentation</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('AI quiz generator'); setActiveDropdown(null); }}>AI quiz generator</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Live polling'); setActiveDropdown(null); }}>Live polling</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Word cloud'); setActiveDropdown(null); }}>Word cloud</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Quiz'); setActiveDropdown(null); }}>Quiz</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Survey'); setActiveDropdown(null); }}>Survey</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Presentations'); setActiveDropdown(null); }}>Presentations</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Q&A'); setActiveDropdown(null); }}>Q&A</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f8fafc', borderBottom: '1px solid var(--border-glass)', paddingBottom: '4px', marginBottom: '2px' }}>
                          Learning hub
                        </div>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('How to Guide'); setActiveDropdown(null); }}>How to</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('PulseAcademy'); setActiveDropdown(null); }}>PulseAcademy</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Templates'); setActiveDropdown(null); }}>Templates</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Webinars'); setActiveDropdown(null); }}>Webinars</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Blog'); setActiveDropdown(null); }}>Blog</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Integrations'); setActiveDropdown(null); }}>Integrations</span>
                        <span className="dropdown-link" style={{ fontSize: '0.8rem' }} onClick={() => { handleTriggerContextualSlide('Help center'); setActiveDropdown(null); }}>Help center</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
