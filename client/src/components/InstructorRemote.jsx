import React, { useState, useEffect } from 'react';
import { Play, Pause, Lock, Unlock, Smartphone, QrCode, AlertTriangle, ChevronLeft, ChevronRight, Volume2, ShieldCheck, Download, RefreshCw, Send } from 'lucide-react';

export default function InstructorRemote({ user, presentations = [], onBack }) {
  const [selectedPresId, setSelectedPresId] = useState(presentations[0]?.id || '');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [announcementText, setAnnouncementText] = useState('');
  const [sentAnnouncements, setSentAnnouncements] = useState([]);
  const [showQrModal, setShowQrModal] = useState(false);

  // Admin Configurable Mobile Settings
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(true);
  const [requireSecurityPin, setRequireSecurityPin] = useState(false);
  const [securityPin, setSecurityPin] = useState('1234');
  const [enteredPin, setEnteredPin] = useState('');
  const [isPinUnlocked, setIsPinUnlocked] = useState(!requireSecurityPin);

  // Mock live audience & anti-cheat alerts for trainer
  const [participantCount, setParticipantCount] = useState(28);
  const [responseCount, setResponseCount] = useState(19);
  const [antiCheatAlerts, setAntiCheatAlerts] = useState([
    { id: 1, student: 'Alex Johnson', time: '10:14:02 AM', alert: 'Tab Switched (Left Exam View)' },
    { id: 2, student: 'Maria Garcia', time: '10:12:45 AM', alert: 'Minimized Browser Window' }
  ]);

  const currentPres = presentations.find(p => p.id === selectedPresId) || presentations[0] || {
    title: 'Sample Presentation',
    slides: [
      { type: 'quiz', question: 'Dinosaur Anatomy Quiz' },
      { type: 'poll', question: 'Course Feedback Poll' }
    ]
  };

  const currentSlide = currentPres.slides ? currentPres.slides[currentSlideIndex] || currentPres.slides[0] : { type: 'quiz', question: 'No slides available' };

  // Timer tick simulation
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const triggerHaptic = () => {
    if (hapticEnabled && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < (currentPres.slides?.length || 1) - 1) {
      setCurrentSlideIndex(prev => prev + 1);
      setTimerSeconds(30);
      triggerHaptic();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
      setTimerSeconds(30);
      triggerHaptic();
    }
  };

  const handleSendAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setSentAnnouncements(prev => [announcementText, ...prev]);
    setAnnouncementText('');
    triggerHaptic();
  };

  const handleDownloadPlaystoreManifest = () => {
    const manifest = {
      name: "PulsePoll Instructor Remote",
      short_name: "PulseRemote",
      start_url: "/?view=remote",
      display: "standalone",
      background_color: "#0b0f19",
      theme_color: "#06b6d4",
      icons: [
        {
          src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=192&auto=format&fit=crop&q=80",
          sizes: "192x192",
          type: "image/png"
        }
      ]
    };
    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
  };

  if (requireSecurityPin && !isPinUnlocked) {
    return (
      <div style={{ maxWidth: '420px', margin: '40px auto', padding: '24px' }} className="animate-fade">
        <div className="glass-card" style={{ padding: '30px', borderRadius: '20px', textAlign: 'center', border: '1px solid var(--primary)' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 8px 0' }}>Trainer Remote Lock</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Enter your 4-digit Security PIN set by System Admin ({user?.email || 'Instructor'}).
          </p>
          <input 
            type="password" 
            maxLength={4}
            value={enteredPin}
            onChange={(e) => setEnteredPin(e.target.value)}
            placeholder="****"
            style={{
              width: '100%', padding: '14px', fontSize: '1.8rem', textAlign: 'center', letterSpacing: '0.5em',
              background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '12px',
              color: 'white', marginBottom: '20px'
            }}
          />
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontWeight: 800 }}
            onClick={() => {
              if (enteredPin === securityPin || user?.tier === 'admin') {
                setIsPinUnlocked(true);
              } else {
                alert('Incorrect PIN. Default PIN is 1234.');
              }
            }}
          >
            Unlock Trainer App 🔓
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px' }} className="animate-fade">
      {/* App Header */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-secondary btn-icon" onClick={onBack} title="Back to Dashboard">
            <ChevronLeft size={18} />
          </button>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📱 Trainer Mobile Remote
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'white' }}>
              {user?.name || 'Instructor'}
            </h3>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', borderRadius: '20px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} className="animate-pulse"></span>
          <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 800 }}>LIVE CONNECTED</span>
        </div>
      </div>

      {/* Room & Presentation Deck Selector */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
          Active Presentation Deck:
        </label>
        <select 
          value={selectedPresId}
          onChange={(e) => {
            setSelectedPresId(e.target.value);
            setCurrentSlideIndex(0);
          }}
          style={{
            width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)',
            borderRadius: '10px', color: 'white', fontWeight: 700, fontSize: '0.9rem'
          }}
        >
          {presentations.map(p => (
            <option key={p.id} value={p.id} style={{ background: '#0b0f19' }}>
              {p.title} ({p.slides?.length || 0} slides)
            </option>
          ))}
        </select>
      </div>

      {/* Slide Status & Live Screen Preview Box */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', marginBottom: '16px', border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(37,99,235,0.08))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
            Slide {currentSlideIndex + 1} of {currentPres.slides?.length || 1} • <strong style={{ textTransform: 'uppercase' }}>{currentSlide.type}</strong>
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 900, color: timerSeconds <= 5 ? '#f87171' : 'var(--accent-green)' }}>
            ⏱️ {timerSeconds}s
          </span>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1.4 }}>
          {currentSlide.question || 'No question text provided'}
        </h3>

        {/* Live Audience Progress Bar */}
        <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span>Audience Response Rate:</span>
          <strong>{responseCount} / {participantCount} Students ({Math.round((responseCount / participantCount) * 100)}%)</strong>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${(responseCount / participantCount) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent-green))', transition: 'width 0.3s' }}></div>
        </div>
      </div>

      {/* Main Touch Controls (Large Ergonomic Buttons for Trainers) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <button 
          className="btn btn-secondary"
          onClick={handlePrevSlide}
          disabled={currentSlideIndex === 0}
          style={{ padding: '20px', fontSize: '1rem', fontWeight: 800, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: currentSlideIndex === 0 ? 0.5 : 1 }}
        >
          <ChevronLeft size={28} />
          <span>PREVIOUS SLIDE</span>
        </button>

        <button 
          className="btn btn-primary"
          onClick={handleNextSlide}
          disabled={currentSlideIndex >= (currentPres.slides?.length || 1) - 1}
          style={{ padding: '20px', fontSize: '1rem', fontWeight: 800, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
        >
          <ChevronRight size={28} />
          <span>NEXT SLIDE</span>
        </button>
      </div>

      {/* Room Utility Action Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
        <button 
          className={`btn ${isTimerRunning ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => {
            setIsTimerRunning(!isTimerRunning);
            triggerHaptic();
          }}
          style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
        >
          {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
          <span>{isTimerRunning ? 'PAUSE TIMER' : 'START TIMER'}</span>
        </button>

        <button 
          className={`btn ${isRoomLocked ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setIsRoomLocked(!isRoomLocked);
            triggerHaptic();
          }}
          style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: isRoomLocked ? 'rgba(239,68,68,0.2)' : undefined, color: isRoomLocked ? '#f87171' : undefined }}
        >
          {isRoomLocked ? <Lock size={18} /> : <Unlock size={18} />}
          <span>{isRoomLocked ? 'ROOM LOCKED' : 'LOCK VOTING'}</span>
        </button>

        <button 
          className="btn btn-secondary"
          onClick={() => setShowQrModal(true)}
          style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 800, borderRadius: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
        >
          <QrCode size={18} />
          <span>SHOW QR CODE</span>
        </button>
      </div>

      {/* Live Broadcast Announcement Input */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          📢 Broadcast Pop-Up Message to Students:
        </label>
        <form onSubmit={handleSendAnnouncement} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. 2 minutes remaining for question 1!"
            style={{
              flex: 1, padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)',
              borderRadius: '10px', color: 'white', fontSize: '0.85rem'
            }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 14px' }}>
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Anti-Cheat & Exam Monitoring Ticker for Instructors */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', marginBottom: '16px', border: '1px solid rgba(245,158,11,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} /> Anti-Cheat Live Alerts ({antiCheatAlerts.length})
          </span>
          <button className="btn btn-secondary btn-icon" style={{ width: '26px', height: '26px' }} onClick={() => setAntiCheatAlerts([])} title="Clear alerts">
            <RefreshCw size={12} />
          </button>
        </div>

        {antiCheatAlerts.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>All students actively focused on presentation screen. Zero focus violations detected.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {antiCheatAlerts.map(a => (
              <div key={a.id} style={{ fontSize: '0.75rem', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ color: '#f87171' }}>{a.student}</strong>
                <span style={{ color: 'var(--text-secondary)' }}>{a.alert} ({a.time})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Controllable Settings & Play Store PWA Generator */}
      {user?.tier === 'admin' && (
        <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--primary)', background: 'rgba(6,182,212,0.05)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--primary)' }}>
            ⚙️ Admin PlayStore App & Minimal System Configurator
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={hapticEnabled} onChange={(e) => setHapticEnabled(e.target.checked)} />
              <span>Enable Haptic Vibration Feedback on Slide Changes</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={lowBandwidthMode} onChange={(e) => setLowBandwidthMode(e.target.checked)} />
              <span>Minimal Requirements Mode (Low Latency 2G/3G Networks)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={requireSecurityPin} onChange={(e) => setRequireSecurityPin(e.target.checked)} />
              <span>Require Security PIN on Trainer Mobile Launch</span>
            </label>

            <button className="btn btn-secondary" onClick={handleDownloadPlaystoreManifest} style={{ marginTop: '6px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Download size={14} /> Download PlayStore PWA Package (`manifest.json`)
            </button>
          </div>
        </div>
      )}

      {/* QR Code Projection Overlay Modal */}
      {showQrModal && (
        <div className="modal-overlay animate-fade" onClick={() => setShowQrModal(false)}>
          <div className="glass-card" style={{ maxWidth: '360px', width: '100%', padding: '30px', borderRadius: '24px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0' }}>Scan to Join Live Session</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Students point phone cameras at screen to join instantly.
            </p>
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '20px' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '?room=' + selectedPresId)}`} alt="Room QR Code" style={{ width: '200px', height: '200px' }} />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px' }}>
              PIN: <strong>{selectedPresId.slice(0, 6).toUpperCase()}</strong>
            </div>
            <button className="btn btn-primary" onClick={() => setShowQrModal(false)} style={{ width: '100%' }}>
              Close QR Overlay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
