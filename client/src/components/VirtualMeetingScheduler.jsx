import React, { useState } from 'react';
import { 
  ArrowLeft, Calendar, Clock, Video, Share2, Copy, Check, Mail, MessageSquare, 
  Lock, Users, Play, Shield, Globe, Download, Plus, Trash2, Mic, MicOff, VideoOff, Hand 
} from 'lucide-react';

export default function VirtualMeetingScheduler({ presentation, onBack, user }) {
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, upcoming, live_room
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [title, setTitle] = useState('Interactive PulsePoll Webinar & Live Session');
  const [meetingDate, setMeetingDate] = useState('2026-07-25');
  const [meetingTime, setMeetingTime] = useState('14:00');
  const [duration, setDuration] = useState('60'); // minutes
  const [passcode, setPasscode] = useState('PULSE-2026');
  const [allowGuestVideo, setAllowGuestVideo] = useState(true);
  const [autoRecord, setAutoRecord] = useState(true);

  // Active meeting state
  const [activeMeetingId, setActiveMeetingId] = useState('MTG-80492');
  const [meetings, setMeetings] = useState([
    {
      id: 'MTG-80492',
      title: 'Interactive PulsePoll Webinar & Live Session',
      date: '2026-07-25',
      time: '14:00',
      duration: '60',
      passcode: 'PULSE-2026',
      link: `${window.location.origin}/meeting/MTG-80492`,
      host: user?.email || 'pradeepvarkala@gmail.com',
      status: 'UPCOMING',
      attendees: 28
    },
    {
      id: 'MTG-19304',
      title: 'Weekly Strategy Workshop & Q&A',
      date: '2026-07-28',
      time: '10:00',
      duration: '45',
      passcode: 'STRAT-99',
      link: `${window.location.origin}/meeting/MTG-19304`,
      host: user?.email || 'pradeepvarkala@gmail.com',
      status: 'UPCOMING',
      attendees: 14
    }
  ]);

  // Live Room controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeLayout, setActiveLayout] = useState('grid'); // grid, speaker, poll_overlay

  const handleScheduleMeeting = (e) => {
    e.preventDefault();
    const newId = `MTG-${Math.floor(10000 + Math.random() * 90000)}`;
    const newMeeting = {
      id: newId,
      title,
      date: meetingDate,
      time: meetingTime,
      duration,
      passcode,
      link: `${window.location.origin}/meeting/${newId}`,
      host: user?.email || 'pradeepvarkala@gmail.com',
      status: 'UPCOMING',
      attendees: 0
    };
    setMeetings([newMeeting, ...meetings]);
    setActiveMeetingId(newId);
    setActiveTab('upcoming');
    alert(`🎉 Zoom-style Meeting Scheduled Successfully!\nMeeting ID: ${newId}\nShareable Link Generated.`);
  };

  const handleCopyLink = (meetingLink) => {
    navigator.clipboard.writeText(meetingLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeleteMeeting = (id) => {
    setMeetings(meetings.filter(m => m.id !== id));
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn btn-secondary btn-icon" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              📹 Zoom Video Meeting & Webinar Scheduler
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Schedule live video meetings, set date/time, generate unique invite links & host Zoom-style sessions
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={() => setActiveTab('live_room')}
            style={{ fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center', background: 'linear-gradient(135deg, #2563eb, #06b6d4)' }}
          >
            <Video size={16} /> Enter Live Zoom Meeting Room 🚀
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '24px', gap: '20px' }}>
        <button 
          className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}
          onClick={() => setActiveTab('schedule')}
        >
          <Calendar size={14} /> Schedule New Meeting
        </button>
        <button 
          className={`btn ${activeTab === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}
          onClick={() => setActiveTab('upcoming')}
        >
          <Clock size={14} /> Upcoming Scheduled Meetings ({meetings.length})
        </button>
        <button 
          className={`btn ${activeTab === 'live_room' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}
          onClick={() => setActiveTab('live_room')}
        >
          <Video size={14} /> Live Zoom Virtual Interface
        </button>
      </div>

      {/* 1. SCHEDULE NEW MEETING FORM */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', color: 'var(--primary)' }}>
              📅 Meeting & Webinar Parameters
            </h2>

            <form onSubmit={handleScheduleMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="settings-group">
                <label>Meeting Title / Topic:</label>
                <input 
                  type="text" 
                  className="input-text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 All-Hands Interactive Poll Meeting"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="settings-group">
                  <label>Date:</label>
                  <input 
                    type="date" 
                    className="input-text"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="settings-group">
                  <label>Start Time (24h):</label>
                  <input 
                    type="time" 
                    className="input-text"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required
                  />
                </div>

                <div className="settings-group">
                  <label>Duration (Minutes):</label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{ padding: '10px', background: '#0f172a', color: '#ffffff', borderRadius: '8px', border: '1px solid var(--border-glass)' }}
                  >
                    <option value="15">15 mins</option>
                    <option value="30">30 mins</option>
                    <option value="45">45 mins</option>
                    <option value="60">60 mins (1 hour)</option>
                    <option value="90">90 mins</option>
                    <option value="120">120 mins (2 hours)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="settings-group">
                  <label>Meeting Passcode / PIN:</label>
                  <input 
                    type="text" 
                    className="input-text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                    placeholder="e.g. PULSE-2026"
                  />
                </div>

                <div className="settings-group">
                  <label>Host Email:</label>
                  <input 
                    type="email" 
                    className="input-text"
                    value={user?.email || 'pradeepvarkala@gmail.com'}
                    readOnly
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={allowGuestVideo} 
                    onChange={(e) => setAllowGuestVideo(e.target.checked)} 
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>Allow participant video cameras & audio mics upon joining</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={autoRecord} 
                    onChange={(e) => setAutoRecord(e.target.checked)} 
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <span>Automatically record meeting video & interactive poll analytics</span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '14px', fontWeight: 800, fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
              >
                <Calendar size={18} /> Schedule Meeting & Generate Invite Link 🚀
              </button>
            </form>
          </div>

          {/* Quick Preview Card */}
          <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '15px' }}>
              🔗 Invite Preview
            </h3>
            
            <div style={{ padding: '16px', background: '#090d16', border: '1px solid var(--border-glass)', borderRadius: '12px', fontSize: '0.85rem', marginBottom: '15px' }}>
              <div style={{ fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>{title}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>📅 Date: {meetingDate} at {meetingTime}</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>⏱️ Duration: {duration} minutes</div>
              <div style={{ fontFamily: 'monospace', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '6px 10px', borderRadius: '6px', wordBreak: 'break-all' }}>
                {window.location.origin}/meeting/MTG-PREVIEW
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Participants click the link to join directly from any browser without downloading Zoom software.
            </p>
          </div>
        </div>
      )}

      {/* 2. UPCOMING SCHEDULED MEETINGS LIST */}
      {activeTab === 'upcoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {meetings.map((m) => (
            <div key={m.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'rgba(6, 182, 212, 0.15)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '10px' }}>
                    {m.id}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{m.title}</h3>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '15px' }}>
                  <span>📅 {m.date} at {m.time}</span>
                  <span>⏱️ {m.duration} mins</span>
                  <span>🔑 PIN: <strong>{m.passcode}</strong></span>
                  <span>👥 {m.attendees} Registered</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleCopyLink(m.link)}
                  style={{ fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}
                >
                  {copiedLink ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copiedLink ? 'Copied!' : 'Copy Share Link'}
                </button>

                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveMeetingId(m.id);
                    setActiveTab('live_room');
                  }}
                  style={{ fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
                >
                  <Play size={14} /> Start Zoom Session 🚀
                </button>

                <button 
                  className="btn btn-secondary btn-icon"
                  onClick={() => handleDeleteMeeting(m.id)}
                  title="Delete Meeting"
                  style={{ color: 'var(--accent-red)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. LIVE ZOOM VIRTUAL INTERFACE */}
      {activeTab === 'live_room' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Zoom Meeting Status Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>🔴 LIVE ZOOM WEBINAR SESSION</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• Meeting ID: {activeMeetingId}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }} onClick={() => setActiveLayout(activeLayout === 'grid' ? 'speaker' : 'grid')}>
                View: {activeLayout.toUpperCase()}
              </button>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#ef4444' }} onClick={() => setActiveTab('upcoming')}>
                End Meeting for All ✕
              </button>
            </div>
          </div>

          {/* Main Video Grid & Interactive Side Panel */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', height: '480px' }}>
            {/* Simulated 4-Participant Video Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '12px', background: '#030712', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
              {[
                { name: `${user?.name || 'Host (You)'}`, isHost: true },
                { name: 'Dr. Sarah Connor', isHost: false },
                { name: 'Alex Rivera', isHost: false },
                { name: 'Team Room Bravo', isHost: false }
              ].map((p, idx) => (
                <div key={idx} style={{ background: '#0f172a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto', fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{p.name} {p.isHost && '(Host)'}</span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '8px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', color: 'white' }}>
                    {p.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Side Control Panel: Live Poll & Chat */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                💬 Live Meeting Polls & Chat
              </h3>
              
              <div style={{ flex: 1, background: '#090d16', borderRadius: '8px', padding: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', overflowY: 'auto' }}>
                <div style={{ marginBottom: '8px' }}><strong>System:</strong> Meeting room connected.</div>
                <div style={{ marginBottom: '8px' }}><strong>Sarah:</strong> Ready for the interactive live poll!</div>
                <div style={{ marginBottom: '8px' }}><strong>Alex:</strong> Sound and video are crisp 👍</div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="text" className="input-text" placeholder="Type chat message..." style={{ fontSize: '0.8rem', padding: '6px' }} />
                <button className="btn btn-primary" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>Send</button>
              </div>
            </div>
          </div>

          {/* Bottom Zoom Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', background: '#0b0f19', padding: '12px 24px', borderRadius: '30px', border: '1px solid var(--border-glass)', width: 'fit-content', margin: '0 auto' }}>
            <button 
              className={`btn ${isMicOn ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={() => setIsMicOn(!isMicOn)}
              style={{ fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              {isMicOn ? <Mic size={16} /> : <MicOff size={16} color="#ef4444" />}
              {isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            </button>

            <button 
              className={`btn ${isVideoOn ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={() => setIsVideoOn(!isVideoOn)}
              style={{ fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              {isVideoOn ? <Video size={16} /> : <VideoOff size={16} color="#ef4444" />}
              {isVideoOn ? 'Stop Video' : 'Start Video'}
            </button>

            <button 
              className={`btn ${isHandRaised ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setIsHandRaised(!isHandRaised)}
              style={{ fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Hand size={16} color={isHandRaised ? '#f59e0b' : 'inherit'} />
              {isHandRaised ? 'Hand Raised ✋' : 'Raise Hand'}
            </button>

            <button 
              className="btn btn-secondary" 
              onClick={() => alert(`Shareable Link: ${window.location.origin}/meeting/${activeMeetingId}`)}
              style={{ fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Share2 size={16} /> Share Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
