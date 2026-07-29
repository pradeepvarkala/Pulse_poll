import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Trash2, Play, Users, Lock, Unlock, Shuffle, QrCode,
  ChevronRight, Award, Sparkles, CheckCircle2, Copy, Eye, ArrowLeft, Layers, 
  Clock, Edit3, Link as LinkIcon, FileText, Check, X, ExternalLink, HelpCircle, FileUp, Settings, Printer, Download, Gamepad2, MessageSquare, AlertTriangle
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
          { id: 'sec-101', title: 'Opening Diagnostic Polls & Alignment Quiz', startTime: '09:00 AM', endTime: '10:30 AM', durationMinutes: 90, duration: '1h 30m', activityType: '📝 Orientation & Keynote', presenterName: 'Prof. Pradeep S Varkala', remarks: 'Ensure all participants connect via QR code before slide 3', presentationId: 'sample-pres-1', customUrl: '' },
          { id: 'sec-102', title: 'Escape Room Vault Team Challenge', startTime: '11:00 AM', endTime: '12:30 PM', durationMinutes: 90, duration: '1h 30m', activityType: '🔐 Escape Room Challenge', presenterName: 'Lead Facilitator', remarks: 'Divide teams into rivers groups', presentationId: 'sample-pres-2', customUrl: '' }
        ]
      },
      {
        dayNumber: 2,
        title: 'Day 2: Strategic Prioritization & Brainstorming',
        sections: [
          { id: 'sec-201', title: 'Strategic Impact 2x2 Grid & Word Cloud', startTime: '09:00 AM', endTime: '11:00 AM', durationMinutes: 120, duration: '2h', activityType: '💡 Team Brainstorm Grid', presenterName: 'Strategy Team', remarks: 'Collect 5 sticky notes per participant', presentationId: 'sample-pres-3', customUrl: '' }
        ]
      },
      {
        dayNumber: 3,
        title: 'Day 3: Innovation Pitching & Final Championship',
        sections: [
          { id: 'sec-301', title: 'Live Team Pitch & Leaderboard Awards', startTime: '02:00 PM', endTime: '04:00 PM', durationMinutes: 120, duration: '2h', activityType: '⭐ Reflection & Peer Review', presenterName: 'Executive Panel', remarks: 'Present live trophies', presentationId: 'sample-pres-1', customUrl: '' }
        ]
      }
    ],
    roster: [],
    groups: []
  }
];

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 540;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 540;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;
  if (period) {
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }
  return hours * 60 + minutes;
};

const minutesToTime = (totalMins) => {
  let normalizedMins = Math.max(0, totalMins) % (24 * 60);
  let hours = Math.floor(normalizedMins / 60);
  const mins = normalizedMins % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const padH = String(hours).padStart(2, '0');
  const padM = String(mins).padStart(2, '0');
  return `${padH}:${padM} ${period}`;
};

const formatDurationHoursMins = (mins) => {
  const m = parseInt(mins, 10) || 0;
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

const recalculateCascadingScheduleTimes = (sectionsList) => {
  if (!sectionsList || sectionsList.length === 0) return [];
  let currentStartMins = timeToMinutes(sectionsList[0]?.startTime || '09:00 AM');
  return sectionsList.map((sec, idx) => {
    const durationMins = parseInt(sec.durationMinutes || 60, 10) || 60;
    const rowStartMins = idx === 0 ? currentStartMins : currentStartMins + 1;
    const rowEndMins = rowStartMins + durationMins;
    currentStartMins = rowEndMins;
    return {
      ...sec,
      startTime: minutesToTime(rowStartMins),
      endTime: minutesToTime(rowEndMins),
      durationMinutes: durationMins,
      duration: formatDurationHoursMins(durationMins)
    };
  });
};

const detectTimeConflicts = (days) => {
  const conflicts = [];
  (days || []).forEach((day, dayIdx) => {
    const sections = day.sections || [];
    for (let i = 0; i < sections.length - 1; i++) {
      const currentSec = sections[i];
      const nextSec = sections[i + 1];
      const currentEnd = timeToMinutes(currentSec.endTime);
      const nextStart = timeToMinutes(nextSec.startTime);
      if (nextStart < currentEnd) {
        conflicts.push({
          dayNumber: day.dayNumber || dayIdx + 1,
          sec1Title: currentSec.title || `Section ${i + 1}`,
          sec1Time: `${currentSec.startTime} - ${currentSec.endTime}`,
          sec2Title: nextSec.title || `Section ${i + 2}`,
          sec2Time: `${nextSec.startTime} - ${nextSec.endTime}`
        });
      }
    }
  });
  return conflicts;
};

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

  const [activeSessionId, setActiveSessionId] = useState(() => {
    const savedContext = localStorage.getItem('pulse-poll-active-workshop-context');
    if (savedContext && sessions.some(s => s.id === savedContext)) {
      return savedContext;
    }
    return sessions[0]?.id || null;
  });

  const [activeTab, setActiveTab] = useState('workshops');
  const [editTab, setEditTab] = useState('details');

  const handleOpenWorkshopEdit = (sessionId, tab = 'details') => {
    setActiveSessionId(sessionId);
    localStorage.setItem('pulse-poll-active-workshop-context', sessionId);
    setEditTab(tab);
    setActiveTab('schedule');
  };

  const handleHeaderBack = () => {
    if (activeTab === 'schedule') {
      setActiveTab('workshops');
      localStorage.removeItem('pulse-poll-active-workshop-context');
    } else {
      onBackToDashboard();
    }
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM - 04:00 PM');
  const [newNumDays, setNewNumDays] = useState(3);
  const [newDesc, setNewDesc] = useState('');

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    localStorage.setItem('pulse-poll-training-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const updateActiveSession = (updater) => {
    setSessions(prev => prev.map(s => {
      if (s.id === activeSession?.id) {
        return typeof updater === 'function' ? updater(s) : { ...s, ...updater };
      }
      return s;
    }));
  };

  const handleInlineTitleChange = (sessionId, newTitleVal) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return { ...s, title: newTitleVal };
      }
      return s;
    }));
  };

  const handleUpdateSectionRowField = (dayIdx, secIdx, field, val) => {
    updateActiveSession(prev => {
      const daysCopy = [...(prev.days || [])];
      if (!daysCopy[dayIdx]) return prev;
      const sectionsCopy = [...(daysCopy[dayIdx].sections || [])];
      if (!sectionsCopy[secIdx]) return prev;
      sectionsCopy[secIdx] = { ...sectionsCopy[secIdx], [field]: val };
      daysCopy[dayIdx] = { ...daysCopy[dayIdx], sections: recalculateCascadingScheduleTimes(sectionsCopy) };
      return { ...prev, days: daysCopy };
    });
  };

  const handleAddQuickScheduleRow = (dayIdx) => {
    updateActiveSession(prev => {
      const daysCopy = [...(prev.days || [])];
      if (!daysCopy[dayIdx]) return prev;
      const existingSections = daysCopy[dayIdx].sections || [];
      const lastSec = existingSections[existingSections.length - 1];
      let defaultStartMins = 540;
      if (lastSec && lastSec.endTime) defaultStartMins = timeToMinutes(lastSec.endTime) + 1;
      const newRow = {
        id: `sec-${Math.random().toString(36).substr(2, 6)}`,
        title: `Topic Section ${existingSections.length + 1}`,
        startTime: minutesToTime(defaultStartMins),
        durationMinutes: 60,
        duration: '1h',
        endTime: minutesToTime(defaultStartMins + 60),
        activityType: '📚 Training Class',
        presenterName: 'Primary Trainer',
        presentationId: '',
        customUrl: ''
      };
      const updatedSections = [...existingSections, newRow];
      daysCopy[dayIdx] = { ...daysCopy[dayIdx], sections: recalculateCascadingScheduleTimes(updatedSections) };
      return { ...prev, days: daysCopy };
    });
  };

  const handleDeleteSection = (dayIdx, secIdx) => {
    updateActiveSession(prev => {
      const daysCopy = [...(prev.days || [])];
      if (!daysCopy[dayIdx]) return prev;
      const updatedSections = (daysCopy[dayIdx].sections || []).filter((_, i) => i !== secIdx);
      daysCopy[dayIdx] = { ...daysCopy[dayIdx], sections: recalculateCascadingScheduleTimes(updatedSections) };
      return { ...prev, days: daysCopy };
    });
  };

  const handlePrintSchedulePDF = (sess) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${sess.title} - Official Program Schedule</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 40px; color: #0f172a; background: #ffffff; line-height: 1.5; }
          .header { border-bottom: 3px solid #0f968c; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
          .subtitle { font-size: 14px; color: #475569; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; text-align: left; }
          th { background: #f1f5f9; color: #0f172a; font-weight: 700; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
          td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
          .badge { background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700; display: inline-block; }
          .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${sess.title}</div>
            <div class="subtitle">Subject: <strong>${sess.subject || 'General Training'}</strong> • Scheduled: <strong>${sess.scheduledDate || 'Flexible Date'}</strong> (${sess.numDays || 1} Days)</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #0f968c; font-weight: 700;">
            PulsePoll Workshops & Trainings
          </div>
        </div>
        ${(sess.days || []).map(day => `
          <h3 style="font-size: 16px; margin-top: 28px; margin-bottom: 8px; color: #0f968c;">📅 ${day.title}</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th style="width: 140px;">Time Slot</th>
                <th>Activity / Topic Title</th>
                <th style="width: 150px;">Activity Type</th>
                <th style="width: 140px;">Presenter / Trainer</th>
                <th style="width: 80px;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${(day.sections || []).map((sec, idx) => `
                <tr>
                  <td><strong>${idx + 1}</strong></td>
                  <td><strong>${sec.startTime || ''} - ${sec.endTime || ''}</strong></td>
                  <td><strong>${sec.title}</strong></td>
                  <td><span class="badge">${sec.activityType || '📚 Training Class'}</span></td>
                  <td>${sec.presenterName || 'Primary Instructor'}</td>
                  <td>${sec.duration || formatDurationHoursMins(sec.durationMinutes || 60)}</td>
                </tr>
              `).join('')}
              ${(day.sections || []).length === 0 ? `<tr><td colspan="6" style="text-align:center; color:#94a3b8;">No program sections scheduled for this day yet.</td></tr>` : ''}
            </tbody>
          </table>
        `).join('')}
        <div class="footer">
          Generated via PulsePoll Interactive Platform • https://harithahavana.in
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleUpdateSectionDeck = (dayIdx, secIdx, selectedVal) => {
    if (selectedVal === '__CREATE_NEW__') {
      const sec = activeSession.days?.[dayIdx]?.sections?.[secIdx];
      const newPres = {
        id: `pres-${Math.random().toString(36).substr(2, 7)}`,
        title: `${sec?.title || 'Workshop Section'} Deck`,
        updatedAt: new Date().toLocaleDateString(),
        theme: 'corporate',
        slides: [{ id: Math.random().toString(36).substr(2, 9), type: 'poll', question: `Question for ${sec?.title || 'section'}:`, options: [{ id: 'opt-1', text: 'Option A' }] }]
      };
      let presentations = [];
      try { const saved = localStorage.getItem('pulse-poll-presentations'); if (saved) presentations = JSON.parse(saved); } catch(e) {}
      presentations.unshift(newPres);
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));
      setUserPresentations(presentations);
      localStorage.setItem('pulse-poll-active-workshop-context', activeSession.id);
      const updatedDays = [...activeSession.days];
      const updatedSections = [...(updatedDays[dayIdx].sections || [])];
      updatedSections[secIdx] = { ...updatedSections[secIdx], presentationId: newPres.id };
      updatedDays[dayIdx] = { ...updatedDays[dayIdx], sections: updatedSections };
      updateActiveSession({ days: updatedDays });
      onViewCreator(newPres.id, 'sessions');
    } else {
      handleUpdateSectionRowField(dayIdx, secIdx, 'presentationId', selectedVal);
    }
  };

  const handleCreateWorkshopSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const daysArray = [];
    const numDaysInt = parseInt(newNumDays, 10) || 1;
    for (let i = 1; i <= numDaysInt; i++) {
      daysArray.push({
        dayNumber: i,
        title: `Day ${i}: Training Module & Orientation`,
        sections: [{
          id: `sec-${Math.random().toString(36).substr(2, 6)}`,
          title: `Section 1: Morning Keynote & Quiz Deck`,
          startTime: '09:00 AM',
          endTime: '10:30 AM',
          durationMinutes: 90,
          duration: '1h 30m',
          activityType: '📝 Orientation & Keynote',
          remarks: 'Opening orientation and diagnostic pulse',
          presentationId: 'sample-pres-1',
          customUrl: ''
        }]
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
      theme: 'cyber-neon',
      groupThemeKey: 'indian_rivers',
      groupCount: 4,
      days: daysArray,
      roster: [],
      groups: []
    };
    setSessions([newSess, ...sessions]);
    setActiveSessionId(newSess.id);
    localStorage.setItem('pulse-poll-active-workshop-context', newSess.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewSubject('');
    setNewDate('');
    setNewDesc('');
    setActiveTab('schedule');
  };

  const handleDeleteWorkshop = (sessionId, e) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this workshop?')) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (remaining.length > 0) setActiveSessionId(remaining[0].id);
    }
  };

  const conflicts = detectTimeConflicts(activeSession?.days);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--text-primary)' }} className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-icon" onClick={handleHeaderBack} title="Back">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar color="var(--accent)" size={24} /> Workshops and Trainings
            </h1>
          </div>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 700, gap: '6px', padding: '9px 18px', border: 'none', fontSize: '0.88rem' }}
        >
          <Plus size={16} /> + Schedule Workshop
        </button>
      </div>

      {activeTab === 'workshops' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
            All Scheduled Workshops & Teacher Programs ({sessions.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sessions.map((sess) => (
              <div 
                key={sess.id} 
                className="glass-card card-lift" 
                onClick={() => handleOpenWorkshopEdit(sess.id, 'schedule')}
                style={{ 
                  padding: '16px 20px', borderRadius: '14px', background: 'var(--surface)', 
                  border: activeSessionId === sess.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Calendar size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text"
                        value={sess.title}
                        onChange={(e) => handleInlineTitleChange(sess.id, e.target.value)}
                        style={{
                          fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)',
                          background: 'transparent', border: '1px solid transparent', padding: '2px 6px',
                          borderRadius: '6px', width: '340px', outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.border = '1px solid var(--accent)'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                        title="Click to inline edit title (auto-saves)"
                      />
                      <span style={{ fontSize: '0.74rem', background: 'var(--surface-2)', padding: '2px 10px', borderRadius: '12px', color: 'var(--text-muted)', fontWeight: 600, border: '1px solid var(--border)' }}>
                        {sess.subject || 'Enterprise Training'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span>📅 Date: <strong>{sess.scheduledDate || 'Flexible'}</strong></span>
                      <span>🕒 Time: <strong>{sess.scheduledTime || '09:00 AM - 05:00 PM'}</strong></span>
                      <span>🗓️ Duration: <strong>{sess.numDays || sess.days?.length || 1} Days</strong></span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '600px' }}>
                      {sess.description || 'Facilitation program and schedule cards.'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleOpenWorkshopEdit(sess.id, 'schedule')}
                    style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 700, fontSize: '0.82rem', border: 'none', padding: '7px 14px', display: 'flex', gap: '6px', alignItems: 'center' }}
                    title="Edit Workshop Details & Schedule Cards"
                  >
                    <Edit3 size={15} /> ✏️ Edit Workshop
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-icon"
                    onClick={(e) => handleDeleteWorkshop(sess.id, e)}
                    title="Delete Workshop"
                    style={{ padding: '7px' }}
                  >
                    <Trash2 size={15} color="var(--danger)" />
                  </button>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                No workshops created yet. Click "+ Schedule Workshop" above to create your first multi-day event!
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: WORKSHOP EDITOR WITH TWO TABS ONLY */}
      {activeTab === 'schedule' && activeSession && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Editor Header: Title Inline Editable */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: 'var(--surface)', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="text"
                  value={activeSession.title}
                  onChange={(e) => handleInlineTitleChange(activeSession.id, e.target.value)}
                  style={{
                    fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)',
                    background: 'transparent', border: '1px solid transparent', padding: '2px 8px',
                    borderRadius: '6px', width: '420px', outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid var(--accent)'}
                  onBlur={(e) => e.target.style.border = '1px solid transparent'}
                  title="Click to edit workshop title"
                />
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Subject: <strong>{activeSession.subject}</strong> • Scheduled: <strong>{activeSession.scheduledDate}</strong> ({activeSession.numDays || activeSession.days?.length} Days)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => handlePrintSchedulePDF(activeSession)}
                style={{ fontSize: '0.82rem', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center' }}
                title="Export schedule as printable PDF"
              >
                <Printer size={15} color="var(--accent)" /> Export PDF Schedule
              </button>

              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setActiveTab('workshops')}
                style={{ fontSize: '0.82rem', fontWeight: 700 }}
              >
                ← Back to Workshops List
              </button>
            </div>
          </div>

          {/* TWO TABS ONLY: DETAILS & SETTINGS | SCHEDULE & DAY CARDS */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
            <button 
              type="button"
              className={`nav-pill ${editTab === 'details' ? 'active' : ''}`}
              onClick={() => setEditTab('details')}
              style={{ padding: '8px 18px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Settings size={16} /> ⚙️ 1. Workshop Details & Settings
            </button>

            <button 
              type="button"
              className={`nav-pill ${editTab === 'schedule' ? 'active' : ''}`}
              onClick={() => setEditTab('schedule')}
              style={{ padding: '8px 18px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center' }}
            >
              <Calendar size={16} /> 🗓️ 2. Schedule & Day Cards Grid
            </button>
          </div>

          {/* TIME OVERLAP / CONTRACTION CONFLICT WARNING BANNER */}
          {conflicts.length > 0 && (
            <div className="animate-fade" style={{ padding: '14px 18px', background: 'rgba(239, 68, 68, 0.12)', border: '1.5px solid #ef4444', borderRadius: '14px', color: '#fca5a5', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#ef4444', marginBottom: '4px' }}>
                <AlertTriangle size={18} /> ⚠️ Time Contraction Conflict Detected in Schedule:
              </div>
              {conflicts.map((c, idx) => (
                <div key={idx} style={{ marginLeft: '26px', marginTop: '3px' }}>
                  • <strong>Day {c.dayNumber}:</strong> "{c.sec1Title}" ({c.sec1Time}) overlaps with "{c.sec2Title}" ({c.sec2Time}). Please adjust start time or duration.
                </div>
              ))}
            </div>
          )}

          {/* TAB 1: WORKSHOP DETAILS & SETTINGS */}
          {editTab === 'details' && (
            <div className="glass-card animate-fade" style={{ padding: '24px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>⚙️ Workshop Metadata & Configuration</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Workshop Title</label>
                  <input 
                    type="text" 
                    value={activeSession.title} 
                    onChange={(e) => updateActiveSession({ title: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Subject / Program Category</label>
                  <input 
                    type="text" 
                    value={activeSession.subject || ''} 
                    onChange={(e) => updateActiveSession({ subject: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Start Date</label>
                  <input 
                    type="date" 
                    value={activeSession.scheduledDate || ''} 
                    onChange={(e) => updateActiveSession({ scheduledDate: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Total Program Days</label>
                  <input 
                    type="number" 
                    min="1" max="14"
                    value={activeSession.numDays || activeSession.days?.length || 1} 
                    onChange={(e) => {
                      const num = parseInt(e.target.value, 10) || 1;
                      let daysCopy = [...(activeSession.days || [])];
                      if (num > daysCopy.length) {
                        for (let i = daysCopy.length + 1; i <= num; i++) {
                          daysCopy.push({ dayNumber: i, title: `Day ${i}: Training Module & Orientation`, sections: [] });
                        }
                      } else if (num < daysCopy.length) {
                        daysCopy = daysCopy.slice(0, num);
                      }
                      updateActiveSession({ numDays: num, days: daysCopy });
                    }}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Program Objectives & Summary</label>
                  <textarea 
                    rows={3}
                    value={activeSession.description || ''} 
                    onChange={(e) => updateActiveSession({ description: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.88rem' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SCHEDULE & DAY CARDS GRID */}
          {editTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {(activeSession.days || []).map((day, dayIdx) => (
                <div key={dayIdx} className="glass-card" style={{ padding: '22px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>📅</span>
                      <input 
                        type="text" 
                        value={day.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateActiveSession(prev => {
                            const daysCopy = [...prev.days];
                            daysCopy[dayIdx] = { ...daysCopy[dayIdx], title: val };
                            return { ...prev, days: daysCopy };
                          });
                        }}
                        style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', background: 'transparent', border: '1px solid transparent', borderRadius: '6px', padding: '2px 6px', width: '320px', outline: 'none' }}
                        onFocus={(e) => e.target.style.border = '1px solid var(--accent)'}
                        onBlur={(e) => e.target.style.border = '1px solid transparent'}
                      />
                    </div>

                    <button 
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleAddQuickScheduleRow(dayIdx)}
                      style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center' }}
                    >
                      <Plus size={14} color="var(--accent)" /> + Add Schedule Row
                    </button>
                  </div>

                  {/* TABULAR SCHEDULE ROW EDITOR */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1.5px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '8px 10px', width: '35px' }}>#</th>
                          <th style={{ padding: '8px 10px', width: '110px' }}>START TIME</th>
                          <th style={{ padding: '8px 10px', width: '130px' }}>DURATION</th>
                          <th style={{ padding: '8px 10px', width: '100px' }}>END TIME</th>
                          <th style={{ padding: '8px 10px' }}>TOPIC / ACTIVITY TITLE</th>
                          <th style={{ padding: '8px 10px', width: '180px' }}>TYPE OF ACTIVITY</th>
                          <th style={{ padding: '8px 10px', width: '140px' }}>PRESENTER</th>
                          <th style={{ padding: '8px 10px', width: '180px' }}>LINKED DECK</th>
                          <th style={{ padding: '8px 10px', width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(day.sections || []).map((sec, secIdx) => {
                          const durationMins = sec.durationMinutes || 60;

                          return (
                            <tr key={sec.id || secIdx} style={{ borderBottom: '1px solid var(--border-soft)' }}>
                              <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{secIdx + 1}</td>
                              
                              {/* Start Time */}
                              <td style={{ padding: '10px' }}>
                                <input 
                                  type="text" 
                                  value={sec.startTime || ''}
                                  onChange={(e) => handleUpdateSectionRowField(dayIdx, secIdx, 'startTime', e.target.value)}
                                  style={{ width: '95px', padding: '5px 8px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700 }}
                                />
                              </td>

                              {/* Duration (Hours & Minutes) */}
                              <td style={{ padding: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <input 
                                    type="number" 
                                    min="5" max="480" step="5"
                                    value={durationMins}
                                    onChange={(e) => handleUpdateSectionRowField(dayIdx, secIdx, 'durationMinutes', parseInt(e.target.value, 10) || 30)}
                                    style={{ width: '60px', padding: '5px 6px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700 }}
                                  />
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700 }}>
                                    {formatDurationHoursMins(durationMins)}
                                  </span>
                                </div>
                              </td>

                              {/* End Time (Auto Cascaded) */}
                              <td style={{ padding: '10px', fontWeight: 800, color: 'var(--accent)' }}>
                                {sec.endTime || '10:00 AM'}
                              </td>

                              {/* Topic Title */}
                              <td style={{ padding: '10px' }}>
                                <input 
                                  type="text" 
                                  value={sec.title || ''}
                                  onChange={(e) => handleUpdateSectionRowField(dayIdx, secIdx, 'title', e.target.value)}
                                  style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600 }}
                                />
                              </td>

                              {/* Activity Type Dropdown */}
                              <td style={{ padding: '10px' }}>
                                <select 
                                  value={sec.activityType || '📚 Training Class'}
                                  onChange={(e) => handleUpdateSectionRowField(dayIdx, secIdx, 'activityType', e.target.value)}
                                  style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 700 }}
                                >
                                  <option value="📚 Training Class">📚 Training Class</option>
                                  <option value="📝 Orientation & Keynote">📝 Orientation & Keynote</option>
                                  <option value="💬 Participant Feedback & Survey">💬 Participant Feedback & Survey</option>
                                  <option value="⭐ Reflection & Peer Review">⭐ Reflection & Peer Review</option>
                                  <option value="☕ Tea & Coffee Break">☕ Tea & Coffee Break</option>
                                  <option value="🤝 Networking & Team Building">🤝 Networking & Team Building</option>
                                  <option value="🎯 Interactive Diagnostic Poll">🎯 Interactive Diagnostic Poll</option>
                                  <option value="💡 Team Brainstorm Grid">💡 Team Brainstorm Grid</option>
                                  <option value="🔐 Escape Room Challenge">🔐 Escape Room Challenge</option>
                                </select>
                              </td>

                              {/* Presenter Name */}
                              <td style={{ padding: '10px' }}>
                                <input 
                                  type="text" 
                                  value={sec.presenterName || ''}
                                  placeholder="Presenter Name"
                                  onChange={(e) => handleUpdateSectionRowField(dayIdx, secIdx, 'presenterName', e.target.value)}
                                  style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.78rem' }}
                                />
                              </td>

                              {/* Linked Presentation Deck */}
                              <td style={{ padding: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <select 
                                    value={sec.presentationId || ''}
                                    onChange={(e) => handleUpdateSectionDeck(dayIdx, secIdx, e.target.value)}
                                    style={{ width: '110px', padding: '5px 6px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.75rem' }}
                                  >
                                    <option value="">🚫 None</option>
                                    {userPresentations.map(p => (
                                      <option key={p.id} value={p.id}>📊 {p.title}</option>
                                    ))}
                                    <option value="__CREATE_NEW__">➕ Create New Deck...</option>
                                  </select>

                                  {sec.presentationId && (
                                    <button 
                                      type="button"
                                      className="btn btn-secondary btn-icon"
                                      style={{ padding: '4px', width: '26px', height: '26px' }}
                                      onClick={() => {
                                        localStorage.setItem('pulse-poll-active-workshop-context', activeSession.id);
                                        onViewCreator(sec.presentationId, 'sessions');
                                      }}
                                      title="Edit Linked Deck"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>

                              {/* Delete Row */}
                              <td style={{ padding: '10px' }}>
                                <button 
                                  type="button"
                                  className="btn btn-secondary btn-icon"
                                  onClick={() => handleDeleteSection(dayIdx, secIdx)}
                                  title="Delete Row"
                                  style={{ padding: '4px', width: '26px', height: '26px', color: 'var(--danger)' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE WORKSHOP WIZARD MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div className="glass-card animate-fade" style={{ padding: '24px', width: '90%', maxWidth: '480px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar color="var(--accent)" size={20} /> Schedule New Workshop & Training
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Configure event details and multi-day program schedule:</p>
            
            <form onSubmit={handleCreateWorkshopSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Workshop Title</label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="e.g. 5-Day Executive Leadership & Innovation" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Subject / Category</label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="e.g. Enterprise Leadership & Strategy" 
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Start Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Total Program Days</label>
                  <input 
                    type="number" 
                    min="1" max="14"
                    value={newNumDays}
                    onChange={(e) => setNewNumDays(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Program Summary</label>
                <textarea 
                  rows={2}
                  placeholder="Brief summary of facilitation goals..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 700, border: 'none', padding: '8px 20px' }}>
                  Create Workshop
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
                    Scheduled Start Date <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(🔒 Managed via Schedule)</span>
                  </label>
                  <input 
                    type="text"
                    className="input-text"
                    value={editDate || 'Flexible Start Date'}
                    readOnly={true}
                    disabled={true}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'not-allowed', fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Scheduled Time Slots <span style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>(🔒 Auto-Calculated)</span>
                  </label>
                  <input 
                    type="text"
                    className="input-text"
                    value={editTime || 'Auto-generated from Schedule Matrix'}
                    readOnly={true}
                    disabled={true}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', cursor: 'not-allowed', fontWeight: 600 }}
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
