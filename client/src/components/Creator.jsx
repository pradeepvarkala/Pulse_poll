import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Play, BarChart3, Cloud, HelpCircle, 
  Trophy, Sliders, ArrowDownUp, Hash, Grid3X3, FileSpreadsheet, MapPin, AlignLeft 
} from 'lucide-react';

const AVAILABLE_THEMES = [
  { id: 'light-luxe', name: 'Light Luxe', bg: '#f8fafc', colors: ['#6366f1', '#ec4899', '#8b5cf6'], type: 'light' },
  { id: 'cyber-mint', name: 'Cyber Mint', bg: '#f0fdf4', colors: ['#10b981', '#06b6d4', '#059669'], type: 'light' },
  { id: 'forest-sage', name: 'Forest Sage', bg: '#f4f8f6', colors: ['#166534', '#9a3412', '#0f766e'], type: 'light' },
  { id: 'corporate', name: 'Corporate', bg: '#ffffff', colors: ['#1e3a8a', '#475569', '#2563eb'], type: 'light' },
  { id: 'neon', name: 'Neon Eclipse', bg: '#031220', colors: ['#0ea5e9', '#10b981', '#06b6d4'], type: 'dark' },
  { id: 'ocean', name: 'Ocean Breeze', bg: '#0a1128', colors: ['#00f2fe', '#4facfe', '#00f2fe'], type: 'dark' },
  { id: 'sunset', name: 'Sunset Glow', bg: '#151110', colors: ['#f97316', '#e11d48', '#f59e0b'], type: 'dark' },
  { id: 'classic-slate', name: 'Classic Slate', bg: '#0f172a', colors: ['#38bdf8', '#94a3b8', '#818cf8'], type: 'dark' }
];

export default function Creator({ presentationId, onBack, onPresent }) {
  const [presentation, setPresentation] = useState(null);
  const [activeSlideId, setActiveSlideId] = useState(null);
  const [activeEmojiPickerId, setActiveEmojiPickerId] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState('content'); // type, content, design
  const [emojiPickerCoords, setEmojiPickerCoords] = useState(null);

  const handleToggleEmojiPicker = (e, optId) => {
    if (activeEmojiPickerId === optId) {
      setActiveEmojiPickerId(null);
      setEmojiPickerCoords(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setEmojiPickerCoords({
        top: rect.top - 82, // 82px above the button
        left: rect.left
      });
      setActiveEmojiPickerId(optId);
    }
  };

  const handleUpdateOptionEmoji = (optId, emoji) => {
    const updatedOpts = activeSlide.options.map(o => o.id === optId ? { ...o, emoji } : o);
    handleUpdateActiveSlide({ options: updatedOpts });
    setActiveEmojiPickerId(null);
    setEmojiPickerCoords(null);
  };

  const user = JSON.parse(localStorage.getItem('pulse-poll-user') || '{}');
  const userEmail = user.email || 'guest@pulsepoll.com';

  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const res = await fetch('/api/presentations', {
          headers: { 'x-user-email': userEmail }
        });
        const data = await res.json();
        const found = data.find(p => p.id === presentationId);
        if (found) {
          const parsedFound = {
            ...found,
            slides: typeof found.slides === 'string' ? JSON.parse(found.slides) : found.slides
          };
          setPresentation(parsedFound);
          if (parsedFound.slides.length > 0) {
            setActiveSlideId(parsedFound.slides[0].id);
          }
        } else {
          const saved = localStorage.getItem('pulse-poll-presentations');
          if (saved) {
            const presentations = JSON.parse(saved);
            const localFound = presentations.find(p => p.id === presentationId);
            if (localFound) {
              setPresentation(localFound);
              if (localFound.slides.length > 0) {
                setActiveSlideId(localFound.slides[0].id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching presentation in creator:', err);
        const saved = localStorage.getItem('pulse-poll-presentations');
        if (saved) {
          const presentations = JSON.parse(saved);
          const localFound = presentations.find(p => p.id === presentationId);
          if (localFound) {
            setPresentation(localFound);
            if (localFound.slides.length > 0) {
              setActiveSlideId(localFound.slides[0].id);
            }
          }
        }
      }
    };

    fetchPresentation();
  }, [presentationId]);

  useEffect(() => {
    if (!activeEmojiPickerId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.emoji-picker-btn') && !e.target.closest('.emoji-dropdown-panel') && !e.target.closest('.emoji-select-option') && !e.target.closest('span')) {
        setActiveEmojiPickerId(null);
        setEmojiPickerCoords(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [activeEmojiPickerId]);

  const savePresentation = async (updatedPres) => {
    setPresentation(updatedPres);
    const saved = localStorage.getItem('pulse-poll-presentations');
    if (saved) {
      const presentations = JSON.parse(saved);
      const updatedList = presentations.map(p => p.id === presentationId ? updatedPres : p);
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(updatedList));
    }

    try {
      await fetch('/api/presentations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify(updatedPres)
      });
    } catch (err) {
      console.error('Error saving presentation in creator:', err);
    }
  };

  if (!presentation) {
    return <div style={{ padding: '2rem' }}>Loading Presentation...</div>;
  }

  const slides = presentation.slides;
  const activeSlide = slides.find(s => s.id === activeSlideId) || slides[0];

  const handleUpdateActiveSlide = (updatedFields) => {
    const updatedSlides = slides.map(s => s.id === activeSlideId ? { ...s, ...updatedFields } : s);
    savePresentation({
      ...presentation,
      slides: updatedSlides,
      updatedAt: new Date().toLocaleDateString()
    });
  };

  const handleUpdateTheme = (theme) => {
    savePresentation({
      ...presentation,
      theme,
      updatedAt: new Date().toLocaleDateString()
    });
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'poll',
      question: 'New Question',
      timeLimit: 15,
      timerAutoStart: false, // Default to manual start!
      options: [
        { id: Math.random().toString(36).substr(2, 9), text: 'Option 1' },
        { id: Math.random().toString(36).substr(2, 9), text: 'Option 2' }
      ]
    };
    const updatedPres = {
      ...presentation,
      slides: [...slides, newSlide],
      updatedAt: new Date().toLocaleDateString()
    };
    savePresentation(updatedPres);
    setActiveSlideId(newSlide.id);
  };

  const handleDeleteSlide = (slideId, e) => {
    e.stopPropagation();
    if (slides.length <= 1) {
      alert('Your presentation must have at least one slide.');
      return;
    }
    const filteredSlides = slides.filter(s => s.id !== slideId);
    const updatedPres = {
      ...presentation,
      slides: filteredSlides,
      updatedAt: new Date().toLocaleDateString()
    };
    savePresentation(updatedPres);
    if (activeSlideId === slideId) {
      setActiveSlideId(filteredSlides[0].id);
    }
  };

  const handleChangeSlideType = (type) => {
    const updated = { type };
    
    // Seed fields appropriate for the slide type
    updated.timeLimit = activeSlide.timeLimit !== undefined ? activeSlide.timeLimit : 15;
    
    if (['poll', 'quiz', 'scales', 'ranking', 'points', 'grid', 'form'].includes(type)) {
      updated.options = activeSlide.options || [
        { id: Math.random().toString(36).substr(2, 9), text: 'Item 1' },
        { id: Math.random().toString(36).substr(2, 9), text: 'Item 2' }
      ];
      
      if (type === 'quiz') {
        updated.correctAnswerIndex = activeSlide.correctAnswerIndex !== undefined ? activeSlide.correctAnswerIndex : 0;
      }
      if (type === 'grid') {
        updated.xAxisLabel = activeSlide.xAxisLabel || 'X Axis';
        updated.yAxisLabel = activeSlide.yAxisLabel || 'Y Axis';
      }
    } else if (type === 'guess') {
      updated.correctNumber = activeSlide.correctNumber !== undefined ? activeSlide.correctNumber : 50;
    } else if (type === 'pin') {
      updated.pinImageType = activeSlide.pinImageType || 'target'; // target or quadrants
    } else {
      // wordcloud, openended, QA - clean extra options
      delete updated.options;
    }
    
    handleUpdateActiveSlide(updated);
  };

  const handleOptionChange = (optId, text) => {
    const updatedOpts = activeSlide.options.map(o => o.id === optId ? { ...o, text } : o);
    handleUpdateActiveSlide({ options: updatedOpts });
  };

  const handleAddOption = () => {
    const newOpt = {
      id: Math.random().toString(36).substr(2, 9),
      text: `Item ${activeSlide.options.length + 1}`
    };
    handleUpdateActiveSlide({
      options: [...activeSlide.options, newOpt]
    });
  };

  const handleDeleteOption = (optId) => {
    if (activeSlide.options.length <= 2) {
      alert('This slide type requires at least 2 items/options.');
      return;
    }
    const filteredOpts = activeSlide.options.filter(o => o.id !== optId);
    let correctIdx = activeSlide.correctAnswerIndex;
    if (correctIdx >= filteredOpts.length) {
      correctIdx = filteredOpts.length - 1;
    }
    handleUpdateActiveSlide({
      options: filteredOpts,
      correctAnswerIndex: correctIdx
    });
  };

  const handleToggleCorrectAnswer = (index) => {
    const currentCorrect = activeSlide.correctAnswerIndices || 
      (activeSlide.correctAnswerIndex !== undefined ? [activeSlide.correctAnswerIndex] : []);
    let nextCorrect;
    if (currentCorrect.includes(index)) {
      nextCorrect = currentCorrect.filter(i => i !== index);
    } else {
      nextCorrect = [...currentCorrect, index];
    }
    handleUpdateActiveSlide({
      correctAnswerIndices: nextCorrect,
      correctAnswerIndex: nextCorrect[0] !== undefined ? nextCorrect[0] : null
    });
  };

  const handleInsertOptionAfter = (index) => {
    const newOpt = {
      id: Math.random().toString(36).substr(2, 9),
      text: `Item ${activeSlide.options.length + 1}`
    };
    const updatedOpts = [...activeSlide.options];
    updatedOpts.splice(index + 1, 0, newOpt);
    handleUpdateActiveSlide({ options: updatedOpts });
  };

  const renderEditableOption = (opt, index) => {
    const isOptCorrect = ['quiz', 'poll'].includes(activeSlide.type) && 
      ((activeSlide.correctAnswerIndices || []).includes(index) || activeSlide.correctAnswerIndex === index);

    return (
      <div 
        key={opt.id} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          width: '100%', 
          padding: '6px 10px', 
          borderRadius: '8px', 
          background: isOptCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.03)', 
          border: isOptCorrect ? '1px solid var(--accent-green)' : '1px solid var(--border-glass)',
          transition: 'all 0.15s ease'
        }}
      >
        {['quiz', 'poll'].includes(activeSlide.type) && (
          <input 
            type="checkbox" 
            checked={isOptCorrect}
            onChange={() => handleToggleCorrectAnswer(index)}
            style={{ cursor: 'pointer', accentColor: 'var(--accent-green)', width: '16px', height: '16px', flexShrink: 0 }}
            title="Mark correct"
          />
        )}
        
        {/* Emoji Selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <span 
            style={{ fontSize: '1.2rem', cursor: 'pointer', userSelect: 'none' }} 
            onClick={(e) => handleToggleEmojiPicker(e, opt.id)}
          >
            {opt.emoji || '🚀'}
          </span>
        </div>

        <input 
          type="text" 
          className="input-text"
          value={opt.text}
          onChange={(e) => handleOptionChange(opt.id, e.target.value)}
          placeholder={`Item ${index + 1}`}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px dashed transparent',
            color: 'var(--text-primary)',
            width: '100%',
            outline: 'none',
            fontSize: '0.9rem',
            padding: '2px',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
          onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
        />

        <button 
          type="button"
          className="btn btn-secondary btn-icon" 
          style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', flexShrink: 0 }}
          onClick={() => handleInsertOptionAfter(index)}
          title="Add Option Below"
        >
          <Plus size={12} color="var(--primary)" />
        </button>
        <button 
          type="button"
          className="btn btn-secondary btn-icon" 
          style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', flexShrink: 0 }}
          onClick={() => handleDeleteOption(opt.id)}
          title="Delete Option"
        >
          <Trash2 size={12} color="var(--accent-red)" />
        </button>
      </div>
    );
  };

  // Helper mapping for labels in Creator
  const getOptionsLabel = () => {
    switch (activeSlide.type) {
      case 'scales': return 'Dimensions to Rate';
      case 'ranking': return 'Items to Rank';
      case 'points': return 'Items to Distribute Points To';
      case 'grid': return 'Items to Plot';
      case 'form': return 'Form Field Labels';
      default: return 'Options';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Editor Header */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 24px', borderBottom: '1px solid var(--border-glass)',
        backgroundColor: 'var(--bg-dark)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn btn-secondary btn-icon" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{presentation.title}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saved locally</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => onPresent(presentation.id)}>
          <Play size={16} /> Present Live
        </button>
      </div>

      {/* Editor Workspace Panels */}
      <div className="creator-container">
        {/* Left Side: Slide List (Thumbnails) */}
        <div className="sidebar-left">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Slides</h3>
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`slide-thumbnail ${slide.id === activeSlideId ? 'active' : ''}`}
              onClick={() => setActiveSlideId(slide.id)}
            >
              <span className="thumbnail-number">{index + 1}</span>
              <div className="thumbnail-type">{slide.type}</div>
              <div className="thumbnail-title">{slide.question || '(No Question)'}</div>
              
              <button 
                className="btn btn-secondary btn-icon" 
                style={{ 
                  position: 'absolute', bottom: '6px', right: '6px', 
                  width: '24px', height: '24px', opacity: 0.7,
                  border: 'none', background: 'transparent'
                }}
                onClick={(e) => handleDeleteSlide(slide.id, e)}
                title="Delete Slide"
              >
                <Trash2 size={12} color="var(--accent-red)" />
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={handleAddSlide} style={{ marginTop: '10px' }}>
            <Plus size={16} /> Add Slide
          </button>
        </div>

        {/* Center: Slide Preview Mockup */}
        <div className="editor-center">
          <div className="glass-card slide-preview-container">
            <input 
              type="text"
              className="preview-question-input"
              value={activeSlide.question}
              onChange={(e) => handleUpdateActiveSlide({ question: e.target.value })}
              placeholder="Edit slide question text..."
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed transparent',
                color: 'var(--text-primary)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.8rem',
                fontWeight: 800,
                textAlign: 'center',
                width: '100%',
                outline: 'none',
                padding: '6px',
                marginBottom: '1rem',
                transition: 'var(--transition-smooth)'
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'transparent'}
            />

            {/* Inline Timer Pill directly on the slide preview */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px', 
              marginBottom: '1.5rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-glass)',
              borderRadius: '20px',
              padding: '4px 14px',
              width: 'fit-content',
              margin: '0 auto 1.5rem auto',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              backdropFilter: 'blur(4px)'
            }}>
              <span>⏱️ Timer:</span>
              <input 
                type="number" 
                min="0" 
                max="120"
                value={activeSlide.timeLimit !== undefined ? activeSlide.timeLimit : 15}
                onChange={(e) => handleUpdateActiveSlide({ timeLimit: parseInt(e.target.value) || 0 })}
                style={{ 
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px dashed var(--border-glass)',
                  color: 'var(--primary)',
                  width: '32px',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  outline: 'none',
                  padding: 0
                }}
              />
              <span>seconds</span>
              <span style={{ margin: '0 4px', opacity: 0.3 }}>|</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                <input 
                  type="checkbox"
                  checked={activeSlide.timerAutoStart === true}
                  onChange={(e) => handleUpdateActiveSlide({ timerAutoStart: e.target.checked })}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '12px', height: '12px' }}
                />
                Auto-Start
              </label>
            </div>
            
            <div className="preview-content">
              {activeSlide.type === 'poll' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px', maxHeight: '185px', overflowY: 'auto', paddingRight: '4px' }}>
                  {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <Plus size={12} /> Add Option
                  </button>
                </div>
              )}

              {activeSlide.type === 'wordcloud' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
                  <span style={{ fontSize: '1.8rem', color: 'var(--primary)', fontWeight: 800 }}>Culture</span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--secondary)', opacity: 0.8 }}>Teamwork</span>
                  <span style={{ fontSize: '1.5rem', color: 'var(--accent-green)', fontWeight: 700 }}>Fun</span>
                </div>
              )}

              {activeSlide.type === 'openended' && (
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', width: '150px', fontSize: '0.8rem' }}>Response Card A</div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', width: '150px', fontSize: '0.8rem' }}>Response Card B</div>
                </div>
              )}

              {activeSlide.type === 'scales' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '400px', maxHeight: '185px', overflowY: 'auto', paddingRight: '4px' }}>
                  {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <Plus size={12} /> Add Dimension
                  </button>
                </div>
              )}

              {activeSlide.type === 'ranking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '400px', maxHeight: '185px', overflowY: 'auto', paddingRight: '4px' }}>
                  {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <Plus size={12} /> Add Item to Rank
                  </button>
                </div>
              )}

              {activeSlide.type === 'qa' && (
                <div style={{ border: '1px dashed var(--border-glass)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <HelpCircle size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ fontSize: '0.85rem' }}>Questions from audience will display in real-time.</p>
                </div>
              )}

              {activeSlide.type === 'guess' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>Guess: [Average]</div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target correct number: {activeSlide.correctNumber}</p>
                </div>
              )}

              {activeSlide.type === 'points' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '400px', maxHeight: '185px', overflowY: 'auto', paddingRight: '4px' }}>
                  {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <Plus size={12} /> Add Distribution Item
                  </button>
                </div>
              )}

              {activeSlide.type === 'grid' && (
                <div style={{ width: '180px', height: '180px', border: '1px solid var(--border-glass)', position: 'relative', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ position: 'absolute', bottom: '50%', left: 0, width: '100%', height: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                  <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', background: 'rgba(255,255,255,0.2)' }}></div>
                  <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{activeSlide.xAxisLabel}</div>
                  <div style={{ position: 'absolute', left: '-50px', top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{activeSlide.yAxisLabel}</div>
                </div>
              )}

              {activeSlide.type === 'form' && (
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '185px', overflowY: 'auto', paddingRight: '4px' }}>
                  {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <Plus size={12} /> Add Form Field
                  </button>
                </div>
              )}

              {activeSlide.type === 'pin' && (
                <div style={{ width: '180px', height: '180px', border: '1px solid var(--border-glass)', borderRadius: activeSlide.pinImageType === 'target' ? '50%' : '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {activeSlide.pinImageType === 'target' ? 'Target Circle Grid' : '4-Quadrant Matrix'}
                  </span>
                </div>
              )}

              {activeSlide.type === 'quiz' && (
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '185px', overflowY: 'auto', paddingRight: '4px' }}>
                  {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    <Plus size={12} /> Add Quiz Option
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Settings & Options */}
        <div className="sidebar-right">
          {/* Sidebar Tab Header */}
          <div className="sidebar-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '15px' }}>
            <button 
              type="button"
              className={`sidebar-tab-btn ${activeSidebarTab === 'type' ? 'active' : ''}`}
              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: activeSidebarTab === 'type' ? '2px solid var(--primary)' : '2px solid transparent', padding: '10px 4px', color: activeSidebarTab === 'type' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onClick={() => setActiveSidebarTab('type')}
            >
              Type
            </button>
            <button 
              type="button"
              className={`sidebar-tab-btn ${activeSidebarTab === 'content' ? 'active' : ''}`}
              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: activeSidebarTab === 'content' ? '2px solid var(--primary)' : '2px solid transparent', padding: '10px 4px', color: activeSidebarTab === 'content' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onClick={() => setActiveSidebarTab('content')}
            >
              Content
            </button>
            <button 
              type="button"
              className={`sidebar-tab-btn ${activeSidebarTab === 'design' ? 'active' : ''}`}
              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: activeSidebarTab === 'design' ? '2px solid var(--primary)' : '2px solid transparent', padding: '10px 4px', color: activeSidebarTab === 'design' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
              onClick={() => setActiveSidebarTab('design')}
            >
              Customize
            </button>
          </div>

          {/* 1. TYPE TAB */}
          {activeSidebarTab === 'type' && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="settings-group">
                <label>Question Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'poll' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('poll')}
                  >
                    <BarChart3 size={12} /> Multiple Choice
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'wordcloud' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('wordcloud')}
                  >
                    <Cloud size={12} /> Word Cloud
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'openended' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('openended')}
                  >
                    <AlignLeft size={12} /> Open Ended
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'scales' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('scales')}
                  >
                    <Sliders size={12} /> Scales
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'ranking' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('ranking')}
                  >
                    <ArrowDownUp size={12} /> Ranking
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'qa' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('qa')}
                  >
                    <HelpCircle size={12} /> Q&A
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'guess' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('guess')}
                  >
                    <Hash size={12} /> Guess Number
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'points' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('points')}
                  >
                    <Sliders size={12} /> 100 Points
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'grid' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('grid')}
                  >
                    <Grid3X3 size={12} /> 2x2 Grid
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'form' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('form')}
                  >
                    <FileSpreadsheet size={12} /> Quick Form
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'pin' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('pin')}
                  >
                    <MapPin size={12} /> Pin on Image
                  </button>
                  <button 
                    className={`btn btn-secondary ${activeSlide.type === 'quiz' ? 'btn-primary' : ''}`}
                    style={{ padding: '6px 8px', fontSize: '0.75rem', gap: '4px' }}
                    onClick={() => handleChangeSlideType('quiz')}
                  >
                    <Trophy size={12} /> Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. CONTENT TAB */}
          {activeSidebarTab === 'content' && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Question Text */}
              <div className="settings-group">
                <label>Question Text</label>
                <textarea 
                  className="input-text" 
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  value={activeSlide.question}
                  onChange={(e) => handleUpdateActiveSlide({ question: e.target.value })}
                  placeholder="e.g. Rate your understanding:"
                />
              </div>

              {/* Dynamic Option Editors */}
              {['poll', 'quiz', 'scales', 'ranking', 'points', 'grid', 'form'].includes(activeSlide.type) && (
                <div className="settings-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label>{getOptionsLabel()}</label>
                    {activeSlide.type === 'quiz' && <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)' }}>Select Correct</span>}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                    {activeSlide.options?.map((opt, index) => (
                      <div key={opt.id} className="option-edit-item" style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {['quiz', 'poll'].includes(activeSlide.type) && (
                          <input 
                            type="checkbox" 
                            checked={(activeSlide.correctAnswerIndices || []).includes(index) || activeSlide.correctAnswerIndex === index}
                            onChange={() => handleToggleCorrectAnswer(index)}
                            style={{ cursor: 'pointer', accentColor: 'var(--accent-green)', width: '16px', height: '16px', flexShrink: 0 }}
                            title="Mark option as correct"
                          />
                        )}
                        
                        {/* Option Emoji Box */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <button 
                            type="button"
                            className="emoji-picker-btn"
                            onClick={(e) => handleToggleEmojiPicker(e, opt.id)}
                          >
                            {opt.emoji || '🚀'}
                          </button>
                        </div>

                        <input 
                          type="text" 
                          className="input-text" 
                          value={opt.text}
                          onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                          placeholder={`Item ${index + 1}`}
                        />
                        <button 
                          type="button"
                          className="btn btn-secondary btn-icon" 
                          style={{ width: '38px', height: '38px', border: 'none', background: 'transparent', flexShrink: 0 }}
                          onClick={() => handleInsertOptionAfter(index)}
                          title="Add Option Below"
                        >
                          <Plus size={12} color="var(--primary)" />
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon" 
                          style={{ width: '38px', height: '38px', border: 'none', background: 'transparent', flexShrink: 0 }}
                          onClick={() => handleDeleteOption(opt.id)}
                          title="Delete Option"
                        >
                          <Trash2 size={12} color="var(--accent-red)" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ width: '100%', marginTop: '10px' }}>
                    <Plus size={12} /> Add Item
                  </button>
                </div>
              )}

              {/* Axis labels for 2x2 Grid */}
              {activeSlide.type === 'grid' && (
                <>
                  <div className="settings-group">
                    <label>X-Axis Label (Horizontal)</label>
                    <input 
                      type="text" 
                      className="input-text"
                      value={activeSlide.xAxisLabel || ''}
                      onChange={(e) => handleUpdateActiveSlide({ xAxisLabel: e.target.value })}
                    />
                  </div>
                  <div className="settings-group">
                    <label>Y-Axis Label (Vertical)</label>
                    <input 
                      type="text" 
                      className="input-text"
                      value={activeSlide.yAxisLabel || ''}
                      onChange={(e) => handleUpdateActiveSlide({ yAxisLabel: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Guess Correct Number setting */}
              {activeSlide.type === 'guess' && (
                <div className="settings-group">
                  <label>Correct Number Value</label>
                  <input 
                    type="number" 
                    className="input-text"
                    value={activeSlide.correctNumber}
                    onChange={(e) => handleUpdateActiveSlide({ correctNumber: Number(e.target.value) || 0 })}
                  />
                </div>
              )}
            </div>
          )}

          {/* 3. DESIGN / CUSTOMIZE TAB */}
          {activeSidebarTab === 'design' && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Customizable Time Limit */}
              <div className="settings-group">
                <label>Question Time Limit (0 to disable)</label>
                <input 
                  type="number" 
                  className="input-text" 
                  min="0" 
                  max="120"
                  value={activeSlide.timeLimit !== undefined ? activeSlide.timeLimit : 15}
                  onChange={(e) => handleUpdateActiveSlide({ timeLimit: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Auto Start Timer Toggle */}
              <div className="settings-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '-10px' }}>
                <input 
                  type="checkbox"
                  id="sidebar-timer-autostart"
                  checked={activeSlide.timerAutoStart === true}
                  onChange={(e) => handleUpdateActiveSlide({ timerAutoStart: e.target.checked })}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="sidebar-timer-autostart" style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}>
                  Auto-start timer on slide load
                </label>
              </div>

              {/* Pin Image Background selection */}
              {activeSlide.type === 'pin' && (
                <div className="settings-group">
                  <label>Pin Background Layout</label>
                  <select 
                    value={activeSlide.pinImageType || 'target'}
                    onChange={(e) => handleUpdateActiveSlide({ pinImageType: e.target.value })}
                  >
                    <option value="target">Target / Bullseye Circles</option>
                    <option value="quadrants">4-Quadrant Strategy Matrix</option>
                  </select>
                </div>
              )}

              {/* Theme Settings (Global for presentation) */}
              <div className="settings-group">
                <label>Presentation Theme</label>
                <div className="theme-picker-section">
                  <div className="theme-picker-category-title">Light Themes</div>
                  <div className="theme-picker-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {AVAILABLE_THEMES.filter(t => t.type === 'light').map(t => (
                      <div 
                        key={t.id} 
                        className={`theme-picker-item ${(presentation.theme || 'corporate') === t.id ? 'active' : ''}`}
                        onClick={() => handleUpdateTheme(t.id)}
                      >
                        <div className="theme-palette-preview" style={{ backgroundColor: t.bg }}>
                          {t.colors.map((c, i) => (
                            <div key={i} className="theme-color-dot" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="theme-picker-name">{t.name}</div>
                      </div>
                    ))}
                  </div>

                  <div className="theme-picker-category-title">Dark Themes</div>
                  <div className="theme-picker-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {AVAILABLE_THEMES.filter(t => t.type === 'dark').map(t => (
                      <div 
                        key={t.id} 
                        className={`theme-picker-item ${(presentation.theme || 'corporate') === t.id ? 'active' : ''}`}
                        onClick={() => handleUpdateTheme(t.id)}
                      >
                        <div className="theme-palette-preview" style={{ backgroundColor: t.bg }}>
                          {t.colors.map((c, i) => (
                            <div key={i} className="theme-color-dot" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="theme-picker-name">{t.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Global Emoji Picker Panel */}
      {activeEmojiPickerId && emojiPickerCoords && (
        <div 
          className="emoji-dropdown-panel glass-card animate-fade" 
          style={{ 
            position: 'fixed', 
            top: `${emojiPickerCoords.top}px`, 
            left: `${emojiPickerCoords.left}px`, 
            zIndex: 100000,
            background: 'var(--bg-card-dark)',
            border: '1px solid var(--border-glass)',
            boxShadow: 'var(--shadow-premium)'
          }}
        >
          {['🚀', '🔥', '🎉', '👍', '💡', '❤️', '⭐', '✅', '📊', '❓'].map(emoji => (
            <div 
              key={emoji} 
              className="emoji-select-option"
              onClick={() => handleUpdateOptionEmoji(activeEmojiPickerId, emoji)}
            >
              {emoji}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
