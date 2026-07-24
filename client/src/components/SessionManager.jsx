import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Trash2, Play, Users, Lock, Unlock, Shuffle, 
  ChevronRight, Award, Sparkles, CheckCircle2, Copy, Eye, ArrowLeft, Layers, 
  Clock, Edit3, Link as LinkIcon, FileText, Check, X, ExternalLink, HelpCircle, FileUp, Settings
} from 'lucide-react';
import { solveGroupAllocation, getGroupNames, GROUP_NAMING_THEMES } from '../utils/groupingAlgorithm';

const SAMPLE_SESSIONS = [
  {
    id: 'session-sample-1',
    title: '5-Day Executive Leadership & Innovation Workshop',
    subject: 'Enterprise Leadership & Strategy',
    scheduledDate: '2026-07-28',
    scheduledTime: '09:00 AM - 05:00 PM',
    numDays: 5,
    description: 'Multi-day intensive facilitation program covering diagnostic polls, team escape vaults, strategy prioritisations, and final championship.',
    status: 'active',
    registrationLocked: false,
    theme: 'cyber-neon',
    groupThemeKey: 'indian_rivers',
    groupCount: 4,
    days: [
      {
        dayNumber: 1,
        title: 'Day 1: Team Alignment & Diagnostic Pulse',
        sections: [
          { id: 'sec-101', title: 'Opening Diagnostic Polls & Alignment Quiz', startTime: '09:00 AM', endTime: '10:30 AM', duration: '90 mins', remarks: 'Ensure all participants connect via QR code before slide 3', presentationId: 'sample-pres-1', customUrl: '' },
          { id: 'sec-102', title: 'Escape Room Vault Team Challenge', startTime: '11:00 AM', endTime: '12:30 PM', duration: '90 mins', remarks: 'Divide teams into rivers groups', presentationId: 'sample-pres-2', customUrl: '' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Day 2: Strategic Prioritization & Brainstorming',
        sections: [
          { id: 'sec-201', title: 'Strategic Impact 2x2 Grid & Word Cloud', startTime: '09:00 AM', endTime: '11:00 AM', duration: '120 mins', remarks: 'Collect 5 sticky notes per participant', presentationId: 'sample-pres-3', customUrl: '' }
        ]
      },
      {
        dayNumber: 3,
        title: 'Day 3: Innovation Pitching & Final Championship',
        sections: [
          { id: 'sec-301', title: 'Live Team Pitch & Leaderboard Awards', startTime: '02:00 PM', endTime: '04:00 PM', duration: '120 mins', remarks: 'Present live trophies', presentationId: 'sample-pres-1', customUrl: '' }
        ]
      }
    ],
    roster: [],
    groups: []
  }
];

export default function SessionManager({ onLaunchPresenter, onBackToDashboard, onViewCreator }) {
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('pulse-poll-training-sessions');
    return saved ? JSON.parse(saved) : SAMPLE_SESSIONS;
  });

  const [userPresentations, setUserPresentations] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('pulse-poll-presentations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) setUserPresentations(parsed);
      } catch (e) {}
    }
  }, []);

  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id || null);
  const [activeTab, setActiveTab] = useState('workshops'); // 'workshops', 'schedule', 'lobby'

  // Listen for browser back button popstate within workshops!
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        setActiveTab('workshops');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenWorkshopSchedule = (sessionId) => {
    setActiveSessionId(sessionId);
    setActiveTab('schedule');
    window.history.pushState({ view: 'sessions', tab: 'schedule' }, '', '#sessions-schedule');
  };

  const handleHeaderBack = () => {
    if (activeTab === 'schedule' || activeTab === 'lobby') {
      setActiveTab('workshops');
      window.history.pushState({ view: 'sessions', tab: 'workshops' }, '', '#sessions');
    } else {
      onBackToDashboard();
    }
  };
  
  // Wizard Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM - 04:00 PM');
  const [newNumDays, setNewNumDays] = useState(3);
  const [newDesc, setNewDesc] = useState('');

  // Selected Day Detail Modal States
  const [selectedDayIdx, setSelectedDayIdx] = useState(null);
  const [showSectionModal, setShowSectionModal] = useState(false);

  // New Section Input States
  const [secTitle, setSecTitle] = useState('');
  const [secStartTime, setSecStartTime] = useState('09:00 AM');
  const [secEndTime, setSecEndTime] = useState('10:00 AM');
  const [secDuration, setSecDuration] = useState('60 mins');
  const [secRemarks, setSecRemarks] = useState('');
  const [secPresentationId, setSecPresentationId] = useState('sample-pres-1');
  const [secCustomUrl, setSecCustomUrl] = useState('');

  // Edit Workshop Metadata Modal States
  const [showEditWorkshopModal, setShowEditWorkshopModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNumDays, setEditNumDays] = useState(1);
  const [editDesc, setEditDesc] = useState('');

  const handleOpenEditWorkshopModal = (sess) => {
    setEditingSessionId(sess.id);
    setEditTitle(sess.title || '');
    setEditSubject(sess.subject || '');
    setEditDate(sess.scheduledDate || '');
    setEditTime(sess.scheduledTime || '');
    setEditNumDays(sess.numDays || sess.days?.length || 1);
    setEditDesc(sess.description || '');
    setShowEditWorkshopModal(true);
  };

  const handleSaveWorkshopEdits = (e) => {
    e.preventDefault();
    if (!editingSessionId || !editTitle.trim()) return;

    setSessions(prev => prev.map(s => {
      if (s.id === editingSessionId) {
        const numDaysInt = parseInt(editNumDays, 10) || 1;
        let daysArray = [...(s.days || [])];
        
        if (numDaysInt > daysArray.length) {
          for (let i = daysArray.length + 1; i <= numDaysInt; i++) {
            daysArray.push({
              dayNumber: i,
              title: `Day ${i}: Training Module & Orientation`,
              sections: []
            });
          }
        } else if (numDaysInt < daysArray.length) {
          daysArray = daysArray.slice(0, numDaysInt);
        }

        return {
          ...s,
          title: editTitle.trim(),
          subject: editSubject.trim(),
          scheduledDate: editDate,
          scheduledTime: editTime,
          numDays: numDaysInt,
          description: editDesc.trim(),
          days: daysArray
        };
      }
      return s;
    }));

    setShowEditWorkshopModal(false);
    setEditingSessionId(null);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    localStorage.setItem('pulse-poll-training-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const updateActiveSession = (updater) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession.id) {
        return typeof updater === 'function' ? updater(s) : { ...s, ...updater };
      }
      return s;
    }));
  };

  const [showHelp, setShowHelp] = useState(false);

  const handleUpdateSectionDeck = (dayIdx, secIdx, selectedVal) => {
    if (selectedVal === '__CREATE_NEW__') {
      const sec = activeSession.days?.[dayIdx]?.sections?.[secIdx];
      const newPres = {
        id: `pres-${Math.random().toString(36).substr(2, 7)}`,
        title: `${sec?.title || 'Workshop Section'} Deck`,
        updatedAt: new Date().toLocaleDateString(),
        theme: 'corporate',
        slides: [
          {
            id: Math.random().toString(36).substr(2, 9),
            type: 'poll',
            question: `Key Concept Check for ${sec?.title || 'this section'}:`,
            options: [
              { id: 'opt-1', text: 'Option A' },
              { id: 'opt-2', text: 'Option B' }
            ]
          }
        ]
      };

      let presentations = [];
      try {
        const saved = localStorage.getItem('pulse-poll-presentations');
        if (saved) presentations = JSON.parse(saved);
      } catch(e) {}
      presentations.unshift(newPres);
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));
      setUserPresentations(presentations);

      const updatedDays = [...activeSession.days];
      const updatedSections = [...(updatedDays[dayIdx].sections || [])];
      updatedSections[secIdx] = { ...updatedSections[secIdx], presentationId: newPres.id };
      updatedDays[dayIdx] = { ...updatedDays[dayIdx], sections: updatedSections };
      updateActiveSession({ days: updatedDays });

      if (onViewCreator) {
        onViewCreator(newPres.id, { returnView: 'sessions', returnTab: 'schedule', returnSessionId: activeSession.id });
      }
    } else {
      const updatedDays = [...activeSession.days];
      const updatedSections = [...(updatedDays[dayIdx].sections || [])];
      updatedSections[secIdx] = { ...updatedSections[secIdx], presentationId: selectedVal };
      updatedDays[dayIdx] = { ...updatedDays[dayIdx], sections: updatedSections };
      updateActiveSession({ days: updatedDays });
    }
  };

  // Create Workshop Wizard Handler
  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const daysArray = [];
    const numDaysInt = parseInt(newNumDays, 10) || 1;
    
    for (let i = 1; i <= numDaysInt; i++) {
      daysArray.push({
        dayNumber: i,
        title: `Day ${i}: Training Module & Orientation`,
        sections: [
          {
            id: `sec-${Math.random().toString(36).substr(2, 6)}`,
            title: `Section 1: Morning Keynote & Quiz Deck`,
            startTime: '09:00 AM',
            endTime: '10:30 AM',
            duration: '90 mins',
            remarks: 'Opening orientation and diagnostic pulse',
            presentationId: 'sample-pres-1',
            customUrl: ''
          }
        ]
      });
    }

    const newSess = {
      id: `session-${Math.random().toString(36).substr(2, 6)}`,
      title: newTitle.trim(),
      subject: newSubject.trim() || 'General Training',
      scheduledDate: newDate || new Date().toISOString().split('T')[0],
      scheduledTime: newTime || '09:00 AM - 04:00 PM',
      numDays: numDaysInt,
      description: newDesc.trim() || 'Multi-day training workshop facilitation program.',
      status: 'active',
      registrationLocked: false,
      theme: 'cyber-neon',
      groupThemeKey: 'indian_rivers',
      groupCount: 4,
      days: daysArray,
      roster: [],
      groups: []
    };

    setSessions([newSess, ...sessions]);
    setActiveSessionId(newSess.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewSubject('');
    setNewDate('');
    setNewDesc('');
    setActiveTab('schedule');
  };

  // Add Section to Selected Day Handler
  const handleAddSectionToDay = (e) => {
    e.preventDefault();
    if (selectedDayIdx === null || !activeSession) return;

    const newSection = {
      id: `sec-${Math.random().toString(36).substr(2, 6)}`,
      title: secTitle.trim() || 'New Program Section',
      startTime: secStartTime,
      endTime: secEndTime,
      duration: secDuration,
      remarks: secRemarks.trim(),
      presentationId: secPresentationId,
      customUrl: secCustomUrl.trim()
    };

    const updatedDays = [...activeSession.days];
    const currentSections = updatedDays[selectedDayIdx].sections || [];
    updatedDays[selectedDayIdx] = {
      ...updatedDays[selectedDayIdx],
      sections: [...currentSections, newSection]
    };

    updateActiveSession({ days: updatedDays });

    // Reset Section Form
    setSecTitle('');
    setSecRemarks('');
    setSecCustomUrl('');
    setShowSectionModal(false);
  };

  const handleDeleteSection = (dayIdx, secIdx) => {
    const updatedDays = [...activeSession.days];
    const updatedSections = updatedDays[dayIdx].sections.filter((_, i) => i !== secIdx);
    updatedDays[dayIdx] = { ...updatedDays[dayIdx], sections: updatedSections };
    updateActiveSession({ days: updatedDays });
  };

  const handleDeleteWorkshop = (sessionId) => {
    if (confirm('Are you sure you want to delete this workshop?')) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (remaining.length > 0) setActiveSessionId(remaining[0].id);
    }
  };

  const joinUrl = `${window.location.origin}/join?session=${activeSession?.id || ''}`;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: "'Inter', sans-serif", color: 'var(--text-primary)' }}>
      
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-secondary btn-icon" onClick={handleHeaderBack} title="Back">
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar color="var(--accent)" /> Multi-Day Workshops & Teacher Programs
            </h1>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => setShowHelp(!showHelp)} 
              title="Toggle Help Guide"
              style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <HelpCircle size={16} color="var(--accent)" />
            </button>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 600, gap: '6px', padding: '8px 14px', border: 'none', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Schedule Workshop
        </button>
      </div>

      {/* Optional Help Banner - Shown ONLY when clicked on Help Symbol */}
      {showHelp && (
        <div className="animate-fade" style={{ padding: '12px 16px', background: 'var(--surface-2)', border: '1px solid var(--border-soft)', borderRadius: '12px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          💡 <strong>Help & Navigation Guide:</strong> Schedule multi-day event cards, link existing presentation decks or create new decks per section slot, and manage participant rosters. Click Back (`←`) to step through previous pages without jumping to default dashboard.
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-soft)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button 
          className={`nav-pill ${activeTab === 'workshops' ? 'active' : ''}`}
          onClick={() => setActiveTab('workshops')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500 }}
        >
          📋 Saved Workshops List ({sessions.length})
        </button>
        <button 
          className={`nav-pill ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500 }}
        >
          📅 Active Schedule & Day Cards
        </button>
        <button 
          className={`nav-pill ${activeTab === 'lobby' ? 'active' : ''}`}
          onClick={() => setActiveTab('lobby')}
          style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 500 }}
        >
          👥 QR Registration & Teams ({(activeSession?.roster || []).length})
        </button>
      </div>

      {/* TAB 1: SAVED WORKSHOPS LIST & ROW ENTRIES VIEW */}
      {activeTab === 'workshops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            All Scheduled Workshops & Teacher Programs
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((sess) => (
              <div 
                key={sess.id} 
                className="glass-card" 
                style={{ 
                  padding: '20px', borderRadius: '12px', background: 'var(--surface)', 
                  border: activeSessionId === sess.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sess.title}</span>
                      <span style={{ fontSize: '0.75rem', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '6px', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {sess.subject || 'General'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                      <span>📅 Date: <strong>{sess.scheduledDate || 'Flexible'}</strong></span>
                      <span>🕒 Time: <strong>{sess.scheduledTime || '09:00 AM'}</strong></span>
                      <span>🗓️ Duration: <strong>{sess.numDays || sess.days?.length || 1} Days</strong></span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleOpenEditWorkshopModal(sess)}
                    style={{ fontSize: '0.82rem', fontWeight: 500, display: 'flex', gap: '4px', alignItems: 'center' }}
                    title="Edit Title, Subject, Date, Time & Days"
                  >
                    <Settings size={14} /> Edit Details
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleOpenWorkshopSchedule(sess.id)}
                    style={{ fontSize: '0.82rem', fontWeight: 500 }}
                  >
                    <Edit3 size={14} /> Edit Schedule & Day Cards
                  </button>

                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setActiveSessionId(sess.id);
                      const firstDeckId = sess.days?.[0]?.sections?.[0]?.presentationId || 'sample-pres-1';
                      onLaunchPresenter(firstDeckId);
                    }}
                    style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 600, fontSize: '0.82rem', border: 'none' }}
                  >
                    <Play size={14} /> Present Live
                  </button>

                  <button 
                    className="btn btn-secondary btn-icon"
                    onClick={() => handleDeleteWorkshop(sess.id)}
                    title="Delete Workshop"
                    style={{ padding: '8px' }}
                  >
                    <Trash2 size={15} color="var(--danger)" />
                  </button>
                </div>
              </div>
            ))}

            {sessions.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                No workshops created yet. Click "+ Schedule New Workshop" above to create a blank multi-day event!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SCHEDULE & DAY CARDS VIEW */}
      {activeTab === 'schedule' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{activeSession.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Subject: {activeSession.subject} • Scheduled: {activeSession.scheduledDate} ({activeSession.numDays || activeSession.days?.length} Days)</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={() => handleOpenEditWorkshopModal(activeSession)}
                style={{ fontSize: '0.82rem', fontWeight: 500, display: 'flex', gap: '6px', alignItems: 'center' }}
                title="Edit Title, Subject, Date, Time & Days"
              >
                <Settings size={14} /> Edit Workshop Details
              </button>

              <button 
                className="btn btn-primary"
                onClick={() => {
                  const firstDeckId = activeSession.days?.[0]?.sections?.[0]?.presentationId || 'sample-pres-1';
                  onLaunchPresenter(firstDeckId);
                }}
                style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 600, fontSize: '0.85rem', border: 'none' }}
              >
                <Play size={16} /> Launch Presentation Live
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Click on any <strong>Day Card (Day 1, Day 2, Day 3...)</strong> below to add sections, link existing presentation decks, or create new decks:
          </div>

          {/* DAY CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
            {(activeSession.days || []).map((day, dIdx) => (
              <div 
                key={day.dayNumber || dIdx}
                className="glass-card"
                style={{
                  padding: '20px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', gap: '14px'
                }}
              >
                {/* Day Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-soft)', paddingBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>📅</span>
                    <span style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text-primary)' }}>{day.title}</span>
                  </div>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleOpenAddSectionModal(dIdx)}
                    style={{ fontSize: '0.78rem', padding: '4px 10px', gap: '4px' }}
                  >
                    <Plus size={13} /> Add Section
                  </button>
                </div>

                {/* Day Sections List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(day.sections || []).map((sec, sIdx) => (
                    <div 
                      key={sec.id || sIdx}
                      style={{
                        padding: '12px 14px', borderRadius: '8px', background: 'var(--surface-2)',
                        border: '1px solid var(--border-soft)', display: 'flex', flexDirection: 'column', gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sec.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                            <span>🕒 {sec.startTime} - {sec.endTime} ({sec.duration})</span>
                          </div>
                        </div>
                        <button 
                          className="btn btn-secondary btn-icon"
                          onClick={() => handleDeleteSection(dIdx, sIdx)}
                          title="Remove Section"
                          style={{ width: '26px', height: '26px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={13} color="var(--danger)" />
                        </button>
                      </div>

                      {/* Presentation Link Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                        <Layers size={14} color="var(--accent)" />
                        <select 
                          value={sec.presentationId || 'sample-pres-1'}
                          onChange={(e) => handleUpdateSectionDeck(dIdx, sIdx, e.target.value)}
                          style={{
                            background: 'transparent', border: 'none', color: 'var(--text-primary)',
                            fontSize: '0.78rem', fontWeight: 500, outline: 'none', flex: 1, cursor: 'pointer'
                          }}
                        >
                          <option value="sample-pres-1">Diagnostic Polls & Alignment Quiz</option>
                          <option value="sample-pres-2">Escape Room Vault Challenge</option>
                          <option value="sample-pres-3">Strategic Impact 2x2 Grid</option>
                          <option value="__CREATE_NEW__">✨ + Create New Presentation Deck...</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {(day.sections || []).length === 0 && (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px dashed var(--border-soft)' }}>
                      No sections added to this day yet. Click "+ Add Section" above.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QR REGISTRATION & TEAMS LOBBY */}
      {activeTab === 'teams' && activeSession && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              📲 Session Join QR Code
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Participants scan once to join workshop programs:
            </p>
            <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block', marginBottom: '16px' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(joinUrl)}`} 
                alt="Session Join QR"
                style={{ width: '160px', height: '160px', display: 'block' }}
              />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Registration: {activeSession.registrationLocked ? <span style={{ color: 'var(--danger)' }}>🔒 Locked</span> : <span style={{ color: '#10b981' }}>🟢 Open</span>}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
              📋 Roster ({(activeSession.roster || []).length} Joined)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
              {(activeSession.roster || []).length > 0 ? (
                (activeSession.roster || []).map((p) => (
                  <div key={p.id} style={{ padding: '8px 12px', background: 'var(--surface-2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{p.avatar || '🚀'} {p.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.indCode}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--surface-2)', borderRadius: '8px', border: '1px dashed var(--border-soft)' }}>
                  ✨ No participants registered yet.<br />
                  Scan the QR Code on the left to join live!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: NEW WORKSHOP / TEACHER PROGRAM BLANK WIZARD */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '520px', padding: '26px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                📅 Schedule New Workshop / Program
              </h2>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Workshop / Program Title
                </label>
                <input 
                  type="text"
                  className="input-text"
                  placeholder="e.g. 5-Day Executive Leadership & Innovation Program"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Subject Name / Category
                  </label>
                  <input 
                    type="text"
                    className="input-text"
                    placeholder="e.g. Physics / Enterprise Strategy"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Number of Days
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="14"
                    value={newNumDays}
                    onChange={(e) => setNewNumDays(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Start Date
                  </label>
                  <input 
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Daily Time Slot
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. 09:00 AM - 04:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Description & Remarks
                </label>
                <textarea 
                  className="input-text"
                  rows="2"
                  placeholder="Enter workshop goals, prerequisites, or notes..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'var(--accent)', color: '#08211E', fontWeight: 600, border: 'none' }}>
                  Create Workshop & Days
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PROGRAM SECTION & TIME TO DAY CARD */}
      {showSectionModal && selectedDayIdx !== null && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '500px', padding: '24px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                ➕ Add Section to Day {selectedDayIdx + 1}
              </h2>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowSectionModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSectionToDay} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Program Section Title
                </label>
                <input 
                  type="text"
                  className="input-text"
                  placeholder="e.g. Morning Keynote & Diagnostic Assessment"
                  value={secTitle}
                  onChange={(e) => setSecTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Start Time
                  </label>
                  <input 
                    type="text"
                    value={secStartTime}
                    onChange={(e) => setSecStartTime(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    End Time
                  </label>
                  <input 
                    type="text"
                    value={secEndTime}
                    onChange={(e) => setSecEndTime(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Duration
                  </label>
                  <input 
                    type="text"
                    value={secDuration}
                    onChange={(e) => setSecDuration(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Assign Presentation / Quiz Deck Variant
                </label>
                <select 
                  value={secPresentationId}
                  onChange={(e) => setSecPresentationId(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                >
                  <option value="sample-pres-1">Deck 1: Executive STEM & Diagnostic Quiz</option>
                  <option value="sample-pres-2">Deck 2: Escape Vault Cyber Challenge</option>
                  <option value="sample-pres-3">Deck 3: Innovation 2x2 Grid & Word Cloud</option>
                  {userPresentations.map(p => (
                    <option key={p.id} value={p.id}>📁 {p.title || 'Untitled Presentation'}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  OR Provide Custom Screen Web Link URL (Optional)
                </label>
                <input 
                  type="url"
                  placeholder="https://example.com/live-screen"
                  value={secCustomUrl}
                  onChange={(e) => setSecCustomUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Remarks & Facilitator Instructions
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Remind teams to scan QR code before slide 2"
                  value={secRemarks}
                  onChange={(e) => setSecRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSectionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'var(--accent)', color: '#08211E', fontWeight: 600, border: 'none' }}>
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT WORKSHOP METADATA (Title, Subject, Date, Time, NumDays, Description) */}
      {showEditWorkshopModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '540px', padding: '26px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚙️ Edit Workshop Details
              </h2>
              <button className="btn btn-secondary btn-icon" onClick={() => setShowEditWorkshopModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkshopEdits} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Workshop / Program Title
                </label>
                <input 
                  type="text"
                  className="input-text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Subject Name / Category
                  </label>
                  <input 
                    type="text"
                    className="input-text"
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Number of Days
                  </label>
                  <input 
                    type="number"
                    min="1"
                    max="14"
                    className="input-text"
                    value={editNumDays}
                    onChange={(e) => setEditNumDays(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Scheduled Start Date
                  </label>
                  <input 
                    type="date"
                    className="input-text"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Scheduled Time Slots
                  </label>
                  <input 
                    type="text"
                    className="input-text"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Workshop Description / Objectives
                </label>
                <textarea 
                  rows={3}
                  className="input-text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditWorkshopModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 600 }}>
                  Save Workshop Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
