import React, { useState } from 'react';
import { ArrowRight, Sparkles, Users, Shield, Zap, BarChart3, Trophy, Play, CheckCircle } from 'lucide-react';

export default function LandingPage({ onStartAuth, onJoinRoom, onStartDemo }) {
  const [roomCode, setRoomCode] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim().length === 6) {
      onJoinRoom(roomCode.trim());
    } else {
      alert('Please enter a valid 6-digit room code.');
    }
  };

  return (
    <div className="landing-container animate-fade" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-dark)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 40px', borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(255,255,255,0.01)', backdropFilter: 'blur(10px)',
        position: 'relative', zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: 800, cursor: 'pointer' }}>
            <div className="logo-icon" style={{ width: '32px', height: '32px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
              <Zap size={18} color="white" />
            </div>
            <span style={{ color: 'var(--text-primary)' }}>PulsePoll</span>
          </div>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '0.95rem', fontWeight: 600 }}>
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: activeDropdown === 'education' ? 'var(--primary)' : 'var(--text-primary)' }}
              onMouseEnter={() => setActiveDropdown('education')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span>Education</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>▼</span>

              {activeDropdown === 'education' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', zIndex: 1001 }}>
                  <div className="glass-card" style={{
                    width: '200px', padding: '16px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                    borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup', 'K-12 Education')}>K-12 Education</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup', 'Higher Education')}>Higher Education</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup', 'Student Activities')}>Student Activities</span>
                  </div>
                </div>
              )}
            </div>

            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: activeDropdown === 'enterprise' ? 'var(--primary)' : 'var(--text-primary)' }}
              onMouseEnter={() => setActiveDropdown('enterprise')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span>Enterprise</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>▼</span>

              {activeDropdown === 'enterprise' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', zIndex: 1001 }}>
                  <div className="glass-card" style={{
                    width: '200px', padding: '16px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                    borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                  }}>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup', 'Corporate Training')}>Corporate Training</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup', 'Staff Meetings')}>Staff Meetings</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup', 'Security & Compliance')}>Security & Compliance</span>
                  </div>
                </div>
              )}
            </div>

            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: activeDropdown === 'learn' ? 'var(--primary)' : 'var(--text-primary)' }}
              onMouseEnter={() => setActiveDropdown('learn')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span>Learn</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>▼</span>

              {/* Exact Layout matching User Uploaded Image */}
              {activeDropdown === 'learn' && (
                <div style={{ position: 'absolute', top: '100%', left: '-150px', paddingTop: '10px', zIndex: 1001 }}>
                  <div className="glass-card" style={{
                    width: '460px', padding: '24px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                    borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)', textAlign: 'left'
                  }}>
                    {/* Column 1 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '4px' }}>
                        Features overview
                      </div>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('AI presentation')}>AI presentation</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('AI quiz generator')}>AI quiz generator</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Live polling')}>Live polling</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Word cloud')}>Word cloud</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Quiz')}>Quiz</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Survey')}>Survey</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Presentations')}>Presentations</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Q&A')}>Q&A</span>
                    </div>

                    {/* Column 2 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '4px' }}>
                        Learning hub
                      </div>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('How to Guide')}>How to</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('PulseAcademy')}>PulseAcademy</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Templates')}>Templates</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Webinars')}>Webinars</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Blog')}>Blog</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Integrations')}>Integrations</span>
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('Help center')}>Help center</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <span style={{ cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => onStartAuth('signup')}>Pricing</span>
            
            <span style={{ cursor: 'pointer', color: 'var(--text-primary)' }} onClick={() => alert('Redirecting to sales team support... (sales@pulsepoll.com)')}>
              Talk to sales
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-secondary" onClick={() => onStartAuth('login')}>Log In</button>
          <button className="btn btn-primary" onClick={() => onStartAuth('signup')}>Sign Up Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, padding: '80px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: '16px' }}>
            ⚡ Next-Gen Interactive Presenting
          </div>
          <h1 style={{ fontSize: '3.6rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '24px' }}>
            Engage Your Audience <br />
            <span style={{ color: 'var(--primary)' }}>In Real-Time</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Create gorgeous interactive slides, run live quizzes, collect opinions, and enforce academic focus. Built for educators, event hosts, and corporate trainers.
          </p>

          {/* Interactive CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', alignItems: 'center', marginBottom: '50px' }}>
            <button className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.05rem', gap: '10px' }} onClick={() => onStartAuth('signup')}>
              Get Started for Free <ArrowRight size={18} />
            </button>

            <button className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.05rem', border: '1px solid var(--border-glass)' }} onClick={() => onStartDemo('General Poll')}>
              Try Live Demo (No Login)
            </button>

            {/* Inline Room Code Input */}
            <form onSubmit={handleJoinSubmit} style={{ display: 'flex', gap: '10px', background: 'var(--bg-card-dark)', padding: '6px', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-lg)' }}>
              <input
                type="text"
                placeholder="Enter 6-Digit Code"
                maxLength="6"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, ''))}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  padding: '8px 16px', fontSize: '1rem', fontWeight: 700, width: '170px',
                  color: 'var(--text-primary)', textAlign: 'center', letterSpacing: '1px'
                }}
              />
              <button type="submit" className="btn btn-accent" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                Join Live
              </button>
            </form>
          </div>
        </div>

        {/* Visual Preview Dashboard Panel Mockup */}
        <div style={{ position: 'relative', marginBottom: '100px' }}>
          <div className="glass-card" style={{
            padding: '30px', border: '1px solid var(--border-glass)',
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)', background: 'var(--bg-card-dark)',
            borderRadius: '24px', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.5, letterSpacing: '0.05em' }}>PREVIEW MODE // PRESENTATION HOST</div>
            </div>
            
            {/* Split layout inside mockup */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Who should win the 2026 Space Hackathon?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Live Poll responses (2,045 participants registered)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span>🚀 Team Nebula (AI Propulsion)</span>
                      <strong>64%</strong>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-glass)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '64%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span>🛰️ OrbitGuard (Satellite Defense)</span>
                      <strong>28%</strong>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-glass)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '28%', height: '100%', backgroundColor: 'var(--secondary)' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                      <span>☄️ StarDust (Mineral Mining)</span>
                      <strong>8%</strong>
                    </div>
                    <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-glass)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div style={{ width: '8%', height: '100%', backgroundColor: 'var(--text-muted)' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ width: '320px', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem' }}>
                  <span>⚠️ REAL-TIME FOCUS FLAG</span>
                </div>
                <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                  <strong>Participant "AlexR" switched tabs!</strong> Overlay warning locked. Attempt flagged inside final quiz slide.
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  🔒 Focus Mode actively logs browser exit violations.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Sub-Functions & Facilities Showcase */}
        <div style={{ marginTop: '80px', marginBottom: '100px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
              ⚡ COMPLETE PLATFORM CAPABILITIES
            </div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
              Sub-Functions & Facilities Showcase
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto', lineHeight: 1.6 }}>
              Everything you need to author interactive slide decks, run real-time audience competitions, visualize sentiment, and maintain strict academic focus.
            </p>
          </div>

          {/* Feature Grid & Alternate Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '70px' }}>

            {/* 1. Multiple Choice Polls */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '16px' }}>
                  📊 INTERACTIVE SLIDE TYPE
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
                  Multiple Choice Polls
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Live single-select and multi-select voting with instant percentage breakdown bar charts. Capture room sentiment in seconds with zero latency.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>⚡ Instant Bar Charts</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>🎯 Multi-Select Options</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>🔒 Anonymous Voting</span>
                </div>
              </div>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <img src="/assets/polls_showcase.jpg" alt="Multiple Choice Polls Showcase" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            {/* 2. Knowledge Quizzes */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <img src="/assets/quiz_showcase.jpg" alt="Knowledge Quizzes Showcase" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '16px' }}>
                  🏆 GAMIFIED EVALUATION
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
                  Knowledge Quizzes
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Timed competitive questions with correct answer designations, auto-scoring, speed streak multipliers, and instant countdown timers.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>⏱️ Speed Multipliers</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>🥇 Leaderboard Podium</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>✨ Auto-Scoring</span>
                </div>
              </div>
            </div>

            {/* 3. Word Clouds */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '16px' }}>
                  📣 VISUAL SENTIMENT CLUSTERS
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
                  Dynamic Word Clouds
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Real-time freeform text submission automatically clustered into dynamic animated word clouds. Repeated terms automatically scale in size to reveal group trends.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>💡 Brainstorming</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>🎨 Dynamic Animations</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>🔥 Keyword Density</span>
                </div>
              </div>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <img src="/assets/wordcloud_showcase.jpg" alt="Dynamic Word Clouds Showcase" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            {/* 4. Coordinate Matrix Grids */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <img src="/assets/grid_showcase.jpg" alt="Coordinate Matrix Grids Showcase" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '16px' }}>
                  🎯 2D SCATTER CLASSIFIER
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
                  Coordinate Matrix Grids
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  2D scatter matrix plotting audience responses across customizable X and Y axes. Evaluate product features on Impact vs Effort or Speed vs Quality.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>📈 Custom X/Y Labels</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>📍 Live Scatter Plots</span>
                </div>
              </div>
            </div>

            {/* 5, 6, 7 Grid Cards: Rating Scales, Q&A Boards, Timers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* 5. Rating Scales */}
              <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⭐</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>Rating Scales & Likert Audits</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  Multi-metric numerical rating sliders (1-5) for feedback and evaluation.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1' }}>
                    <span>Ease of Use:</span>
                    <strong style={{ color: '#38bdf8' }}>4.8 / 5.0</strong>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                    <div style={{ width: '96%', height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>

              {/* 6. Audience Q&A Boards */}
              <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎤</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>Audience Q&A Boards</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  Upvotable live question feeds allowing attendees to ask and prioritize questions.
                </p>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: '#e2e8f0' }}>Will the API support webhooks?</span>
                  <button style={{ background: '#2563eb', border: 'none', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>▲ 184</button>
                </div>
              </div>

              {/* 7. Stopwatch & Millisecond Timers */}
              <div className="glass-card" style={{ padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏱️</div>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>Stopwatch & Timers</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '16px' }}>
                  Countdown timers with auto-lock capabilities when time expires.
                </p>
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '10px', borderRadius: '10px', textAlign: 'center', color: '#fca5a5', fontWeight: 800, fontSize: '0.9rem' }}>
                  🔒 AUTO-LOCK AT 00:00 SECONDS
                </div>
              </div>

            </div>

            {/* 8. Gamified Brainstorming Boards */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '16px' }}>
                  🤝 COLLABORATIVE KANBAN
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
                  Gamified Brainstorming Boards
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  Categorized sticky-note boards with multi-column sorting. Enable teams to submit ideas into customizable categories in real time.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>📌 Multi-Column Sorting</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>🎨 Color-Coded Cards</span>
                </div>
              </div>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <img src="/assets/brainstorm_showcase.jpg" alt="Gamified Brainstorming Boards Showcase" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
              </div>
            </div>

            {/* 9. Visual Theme & Typography Engine */}
            <div className="glass-card" style={{ padding: '40px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                <img src="/assets/themes_showcase.jpg" alt="Visual Theme Engine Showcase" style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '16px' }}>
                  🎨 STUNNING VISUAL SYSTEM
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>
                  Visual Theme & Typography Engine
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px' }}>
                  10+ dynamic themes including <strong>Neon Dark</strong>, <strong>Corporate Slate</strong>, <strong>Cyber Mint</strong>, <strong>Forest Sage</strong>, <strong>Playroom</strong>, and <strong>Light Luxe</strong>.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>✨ Custom Typography</span>
                  <span style={{ background: 'rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' }}>🌈 Smooth Gradients</span>
                </div>
              </div>
            </div>

            {/* 10 & 11 Cards: Drag-and-Drop Reordering & Auto-Save & Versioning */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* 10. Drag-and-Drop Reordering */}
              <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🖐️</div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>Drag-and-Drop Reordering</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  Interactive slide thumbnail navigation bar supporting drag-and-drop slide sorting with instant ghost highlights.
                </p>
                <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px dashed #06b6d4', borderRadius: '10px', color: '#06b6d4', fontWeight: 700, fontSize: '0.85rem' }}>
                  ⇄ Drag slide thumbnail to reorder deck position
                </div>
              </div>

              {/* 11. Auto-Save & Versioning */}
              <div className="glass-card" style={{ padding: '32px', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>☁️</div>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>Auto-Save & Versioning</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '16px' }}>
                  Real-time local and remote database synchronization with instant backup restoring and loss prevention.
                </p>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '10px', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} /> All changes saved to cloud database automatically
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Closing CTA */}
        <div className="glass-card" style={{ padding: '50px 30px', textAlign: 'center', border: '1px dashed var(--primary)', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Ready to engage your room?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Create your free account today. Sign in instantly using your Google profile or email OTP verification codes.
          </p>
          <button className="btn btn-primary" style={{ padding: '14px 28px' }} onClick={() => onStartAuth('signup')}>
            Get Started Free
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '40px 20px', borderTop: '1px solid var(--border-glass)',
        fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)'
      }}>
        <p>&copy; 2026 PulsePoll. All rights reserved. Built using standard web security and React.</p>
      </footer>
    </div>
  );
}