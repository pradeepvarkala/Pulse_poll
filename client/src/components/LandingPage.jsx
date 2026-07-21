import React, { useState } from 'react';
import { ArrowRight, Sparkles, Users, Shield, Zap, BarChart3, Trophy, Play, CheckCircle } from 'lucide-react';

export default function LandingPage({ onStartAuth, onJoinRoom }) {
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
                <div className="glass-card" style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '10px',
                  width: '200px', padding: '16px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                  borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1001,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                  <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>K-12 Education</span>
                  <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Higher Education</span>
                  <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Student Activities</span>
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
                <div className="glass-card" style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: '10px',
                  width: '200px', padding: '16px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                  borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1001,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                  <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Corporate Training</span>
                  <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Staff Meetings</span>
                  <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Security & Compliance</span>
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
                <div className="glass-card" style={{
                  position: 'absolute', top: '100%', left: '-150px', marginTop: '10px',
                  width: '460px', padding: '24px', background: '#0b0f19', border: '1px solid var(--border-glass)',
                  borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', zIndex: 1001,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)', textAlign: 'left'
                }}>
                  {/* Column 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Features overview
                    </div>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>AI presentation</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>AI quiz generator</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Live polling</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Word cloud</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Quiz</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Survey</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Presentations</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Q&A</span>
                  </div>

                  {/* Column 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f8fafc', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '4px' }}>
                      Learning hub
                    </div>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>How to</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>MentiAcademy</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Templates</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Webinars</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Blog</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Integrations</span>
                    <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartAuth('signup')}>Help center</span>
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

        {/* Feature Grid */}
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '40px' }}>Features Crafted for Enterprise Performance</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}>
          
          <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border-glass)' }}>
            <div className="logo-icon" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>🔒 Focus Mode (Anti-Cheat)</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Actively lock out browser tab switches and window minimizations. Keeps participants focused during exams, training tests, and assessments.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border-glass)' }}>
            <div className="logo-icon" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>⚡ 60-Attendee Free Plan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Host up to 60 concurrent participants completely free. Buy incremental participant packages as your audience capacity scales.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px', border: '1px solid var(--border-glass)' }}>
            <div className="logo-icon" style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>📊 Interactive Slide Types</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Deliver Title slides, Image canvases, Timed Multiple Choices, Word Clouds, Pin-on-Image coordinates, Likert Scales, and Q&A boards.
            </p>
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