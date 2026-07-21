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
                      <span className="dropdown-link" style={{ fontSize: '0.85rem' }} onClick={() => onStartDemo('MentiAcademy')}>MentiAcademy</span>
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

        {/* Alternate Detailed Modules Showcase */}
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '60px', letterSpacing: '-0.02em' }}>
          Explore Our Core Interactive Modules
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', marginBottom: '100px' }}>
          
          {/* Module 1: Live Polling */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '10px' }}>01 / LIVE POLLING & SURVEYS</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Collect opinions instantly. Make decisions together.</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Break the barrier between the stage and the audience. Run real-time multiple-choice polls, scales, and surveys that populate instantly as attendees submit votes from their smartphones.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                <li>🚀 <strong>Icebreaker questions:</strong> Warm up your audience at the beginning of meetings.</li>
                <li>🎯 <strong>Check alignment:</strong> Vote on priorities or designs during workshops.</li>
                <li>🔒 <strong>Anonymous feedback:</strong> Encourage honest, unfiltered audience insights.</li>
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '30px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>POLL PREVIEW</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(37,99,235,0.1)', border: '1px solid var(--primary)', borderRadius: '8px' }}>
                  <span>Option A: Deploy to Production (72 votes)</span>
                  <div style={{ width: '100%', height: '6px', background: 'var(--border-glass)', borderRadius: '3px', marginTop: '8px' }}>
                    <div style={{ width: '72%', height: '100%', background: 'var(--primary)' }}></div>
                  </div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                  <span>Option B: More QA Testing (28 votes)</span>
                  <div style={{ width: '100%', height: '6px', background: 'var(--border-glass)', borderRadius: '3px', marginTop: '8px' }}>
                    <div style={{ width: '28%', height: '100%', background: 'var(--text-muted)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Module 2: Timed Quizzes */}
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ background: '#fbbf24-glow', color: '#fbbf24', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>LEADERBOARD</span>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px', border: '1px solid #fbbf24' }}>
                  <span>🥇 1. Sarah Connor</span>
                  <strong>9,450 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span>🥈 2. John Doe</span>
                  <strong>8,210 pts</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span>🥉 3. Alex Mercer</span>
                  <strong>7,980 pts</strong>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ color: 'var(--secondary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '10px' }}>02 / TIMED QUIZZES & LEADERBOARDS</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Turn learning into a game. Fuel healthy competition.</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Inject energy into your presentation slides! Host interactive trivia or reviews with points, fast-answer multipliers, countdown sound effects, and a dynamic ranking leaderboard.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                <li>🎓 <strong>Classroom reviews:</strong> Test knowledge retention prior to grading.</li>
                <li>🏢 <strong>Employee onboarding:</strong> Make company compliance policies memorable.</li>
                <li>🎉 <strong>Team social events:</strong> Host customized trivia during happy hours.</li>
              </ul>
            </div>
          </div>

          {/* Module 3: Word Clouds */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '10px' }}>03 / DYNAMIC WORD CLOUDS</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Visualize audience ideas in beautiful growing clusters.</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Ask open questions and watch the input morph into a live word cloud. Words submitted multiple times automatically scale larger, establishing a clear visual weight of thoughts.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                <li>💡 <strong>Brainstorming:</strong> Quickly discover trending keywords or ideas.</li>
                <li>😊 <strong>Sentiment checks:</strong> Ask "How are you feeling today?" for immediate mood checks.</li>
                <li>🎯 <strong>Keyword association:</strong> Align teams on core brand values.</li>
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '40px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Innovative</span>
              <span style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>fast</span>
              <span style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fbbf24' }}>Interactive</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>clean</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--secondary)' }}>Sleek</span>
              <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>fun</span>
            </div>
          </div>

          {/* Module 4: Focus Mode */}
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '30px' }}>
              <div style={{ background: '#ef4444-glow', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '16px', display: 'inline-block' }}>SECURITY GUARD ACTIVE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: '10px', color: 'var(--text-secondary)' }}>
                  ⚠️ User <strong>"Student_9"</strong> warning: Blurred window (switched tab)
                </div>
                <div style={{ borderLeft: '3px solid #ef4444', paddingLeft: '10px', color: 'var(--text-secondary)' }}>
                  🚫 User <strong>"Student_9"</strong> lock-out: 2nd violation detected.
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '10px' }}>04 / FOCUS MODE (ANTI-CHEAT)</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Enforce window concentration. Prevent browser search cheats.</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                The ultimate proctor tool for educators. Enabling Focus Mode tracks active browser window state. If participants switch tabs, load search engines, or minimize the app, they receive instant socket-fed lockout warnings.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                <li>🔒 <strong>Formal examinations:</strong> Eliminate web search cheating during graded tests.</li>
                <li>📝 <strong>Compliance tests:</strong> Ensure employees read onboarding sliders thoroughly.</li>
                <li>🎓 <strong>Course validation:</strong> Increase student focus during online learning.</li>
              </ul>
            </div>
          </div>

          {/* Module 5: Audience Q&A */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '10px' }}>05 / AUDIENCE Q&A BOARDS</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Give everyone a voice. Upvote critical questions.</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Collect and moderate questions from the room. Attendees can submit queries anonymously and upvote other participants' submissions, organizing the list so you answer key questions first.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                <li>📢 <strong>All-hands meetings:</strong> Solve corporate concerns with clear, upvoted lists.</li>
                <li>🎓 <strong>Lecture Q&A:</strong> Let shy students ask clarifying points without raising hands.</li>
                <li>🎙️ <strong>Webinars & panels:</strong> Curate high-quality discussion pointers efficiently.</li>
              </ul>
            </div>
            <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '30px' }}>
              <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '16px', display: 'inline-block' }}>Q&A QUEUE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Will the Stripe subscriptions support corporate invoice billing?</span>
                  <button style={{ padding: '4px 8px', background: 'var(--primary)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.8rem' }}>▲ 124</button>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Can I add multiple workspaces for school departments?</span>
                  <button style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>▲ 48</button>
                </div>
              </div>
            </div>
          </div>

          {/* Module 6: Excel Import */}
          <div style={{ display: 'flex', flexWrap: 'wrap-reverse', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1, minWidth: '300px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-glass)', borderRadius: '24px', padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
              <h4 style={{ fontWeight: 800, marginBottom: '8px' }}>question_bank.xlsx</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Successfully imported 142 Multiple Choice slides</p>
              <div style={{ marginTop: '16px', height: '6px', background: 'var(--border-glass)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: '#22c55e' }}></div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ color: '#22c55e', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', marginBottom: '10px' }}>06 / EXCEL QUESTION IMPORT</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '16px' }}>Upload question sheets. Skip manual slide creation.</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Massive time saver. If you already have question banks in spreadsheets, upload them directly! The platform will parse the Excel file and auto-generate fully configured slides with options, timing parameters, and correct keys in seconds.
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)' }}>
                <li>⚡ <strong>Zero manual typing:</strong> Setup huge quizzes in a single click.</li>
                <li>📝 <strong>Question banks:</strong> Repurpose existing school assessments.</li>
                <li>📥 <strong>Pre-designed templates:</strong> Download our sample template, fill, and load.</li>
              </ul>
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