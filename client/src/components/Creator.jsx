import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Plus, Trash2, Play, BarChart3, Cloud, HelpCircle, 
  Trophy, Sliders, ArrowDownUp, Hash, Grid3X3, FileSpreadsheet, MapPin, AlignLeft, Timer, FileUp
} from 'lucide-react';

const AVAILABLE_THEMES = [
  { id: 'cyber-neon', name: 'Cyber Neon (Generated Artwork)', bg: '/assets/theme_cyber_neon.jpg', colors: ['#06b6d4', '#8b5cf6', '#3b82f6'], type: 'art', imageBg: true },
  { id: 'midnight-gold', name: 'Midnight Gold (Executive Art)', bg: '/assets/theme_midnight_gold.jpg', colors: ['#f59e0b', '#d97706', '#eab308'], type: 'art', imageBg: true },
  { id: 'cosmic-nebula', name: 'Cosmic Nebula (Galaxy Art)', bg: '/assets/theme_cosmic_nebula.jpg', colors: ['#a855f7', '#3b82f6', '#ec4899'], type: 'art', imageBg: true },
  { id: 'playroom-magic', name: 'Playroom Magic (Kids Art)', bg: '/assets/theme_playroom_magic.jpg', colors: ['#ec4899', '#06b6d4', '#fbbf24'], type: 'art', imageBg: true },
  { id: 'playroom', name: 'Playroom (Pastel)', bg: '#fffdf0', colors: ['#ff477e', '#4ea8de', '#fbbf24'], type: 'light' },
  { id: 'light-luxe', name: 'Light Luxe', bg: '#f8fafc', colors: ['#6366f1', '#ec4899', '#8b5cf6'], type: 'light' },
  { id: 'cyber-mint', name: 'Cyber Mint', bg: '#f0fdf4', colors: ['#10b981', '#06b6d4', '#059669'], type: 'light' },
  { id: 'forest-sage', name: 'Forest Sage', bg: '#f4f8f6', colors: ['#166534', '#9a3412', '#0f766e'], type: 'light' },
  { id: 'corporate', name: 'Corporate', bg: '#ffffff', colors: ['#1e3a8a', '#475569', '#2563eb'], type: 'light' },
  { id: 'neon', name: 'Neon Eclipse', bg: '#031220', colors: ['#0ea5e9', '#10b981', '#06b6d4'], type: 'dark' },
  { id: 'ocean', name: 'Ocean Breeze', bg: '#0a1128', colors: ['#00f2fe', '#4facfe', '#00f2fe'], type: 'dark' },
  { id: 'sunset', name: 'Sunset Glow', bg: '#151110', colors: ['#f97316', '#e11d48', '#f59e0b'], type: 'dark' },
  { id: 'classic-slate', name: 'Classic Slate', bg: '#0f172a', colors: ['#38bdf8', '#94a3b8', '#818cf8'], type: 'dark' }
];

const INSTRUCTIONS = {
  quiz: {
    title: "🌟 Timed Quiz Mode",
    description: "Create competitive trivia games! Set timers, define options, and mark the correct answer. The fastest participant gets the most points!",
    icon: "🏆",
    checklist: [
      "Type your question in the text box",
      "Add answer options using the grid",
      "Check the box next to correct answer(s)",
      "Set your timer limit (default: 15s)",
      "Click 'Present' in the header to launch!"
    ],
    tips: "💡 Pro-Tip: Turn on 'Playroom (Kids)' theme in Design tab for cute emojis and rounded fonts!"
  },
  poll: {
    title: "📈 Live Polling Mode",
    description: "Gather votes and watch real-time bar charts animate as options are selected by the audience. Ideal for gathering feedback, voting, or icebreakers.",
    icon: "📊",
    checklist: [
      "Type your poll question",
      "Add vote options",
      "Mark correct answers (optional)",
      "Click 'Present' and join the audience code!"
    ],
    tips: "💡 Pro-Tip: You can hide/reveal results dynamically while presenting to avoid herd-bias!"
  },
  wordcloud: {
    title: "☁️ Live Word Cloud Mode",
    description: "Collect brainstorming ideas! As the audience submits words, they pop up and float on screen. If multiple people enter the same word, it grows bigger and more colorful!",
    icon: "💬",
    checklist: [
      "Type your brainstorming prompt",
      "Decide limit of entries per participant",
      "Start hosting by clicking 'Present'"
    ],
    tips: "💡 Pro-Tip: Use this for prompt check-ins (e.g. 'How are you feeling today in one word?')."
  },
  scales: {
    title: "📏 Scale Ratings Mode",
    description: "Let participants rate items or statements from 1 to 5 on interactive sliders. Perfect for surveys, feedback loops, and aligning goals.",
    icon: "📐",
    checklist: [
      "Type your main rating question",
      "Define rating statements (milestones/metrics)",
      "Check the live visual sliders after presenting!"
    ],
    tips: "💡 Pro-Tip: Use this for corporate meeting align-checks (e.g., 'Clarity of milestones')."
  },
  qa: {
    title: "💬 Interactive Q&A Mode",
    description: "Host open-floor question panels! Participants type anonymous questions. They can upvote other questions they care about, and the host displays selected questions on the projector screen.",
    icon: "🤝",
    checklist: [
      "Set up your Q&A panel instructions",
      "Present the slide live to open the floor",
      "Review the question list on your presenter deck!"
    ],
    tips: "💡 Pro-Tip: You can moderate questions on your presenter monitor before showing them publicly!"
  }
};

const SLIDE_TYPE_ITEMS = [
  { type: 'poll', label: 'Multiple Choice', icon: BarChart3, color: '#38bdf8' },
  { type: 'wordcloud', label: 'Word Cloud', icon: Cloud, color: '#f43f5e' },
  { type: 'openended', label: 'Open Ended', icon: AlignLeft, color: '#10b981' },
  { type: 'scales', label: 'Scales', icon: Sliders, color: '#fbbf24' },
  { type: 'ranking', label: 'Ranking', icon: ArrowDownUp, color: '#a855f7' },
  { type: 'qa', label: 'Q&A', icon: HelpCircle, color: '#ec4899' },
  { type: 'guess', label: 'Guess Number', icon: Hash, color: '#06b6d4' },
  { type: 'points', label: '100 Points', icon: Sliders, color: '#f97316' },
  { type: 'grid', label: '2x2 Grid', icon: Grid3X3, color: '#8b5cf6' },
  { type: 'form', label: 'Quick Form', icon: FileSpreadsheet, color: '#14b8a6' },
  { type: 'pin', label: 'Pin on Image', icon: MapPin, color: '#ef4444' },
  { type: 'quiz', label: 'Quiz Game', icon: Trophy, color: '#eab308' },
  { type: 'stopwatch', label: 'Stopwatch', icon: Timer, color: '#6366f1' },
  { type: 'brainstorm', label: 'Brainstorm', icon: Grid3X3, color: '#06b6d4' }
];

export default function Creator({ presentationId, onBack, onPresent, user, onRequestUpgrade, returnNavContext }) {
  const [presentation, setPresentation] = useState(null);
  const [activeSlideId, setActiveSlideId] = useState(null);
  const [activeEmojiPickerId, setActiveEmojiPickerId] = useState(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState('type'); // type, content, design, ai
  const [emojiPickerCoords, setEmojiPickerCoords] = useState(null);
  const [showInstructionPopup, setShowInstructionPopup] = useState(false);
  const [aiPromptText, setAiPromptText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [draggedSlideIndex, setDraggedSlideIndex] = useState(null);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [isRadialPickerOpen, setIsRadialPickerOpen] = useState(false);
  const [typePickerViewMode, setTypePickerViewMode] = useState('radial'); // 'radial' or 'grid'


  const handleImportPptFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.replace(/\.[^/.]+$/, "");
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target.result;
      const isImg = file.type.startsWith('image/') || file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg');
      
      const newPptSlide = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'ppt',
        question: `📄 PPTX / PDF Document: ${fileName}`,
        bgImage: isImg ? result : null,
        pptUrl: result,
        customUrl: result,
        content: `Imported static document slide file: ${file.name}`
      };

      const updatedSlides = [...(presentation?.slides || []), newPptSlide];
      const updatedPres = { ...presentation, slides: updatedSlides };
      savePresentation(updatedPres);
      setActiveSlideId(newPptSlide.id);
      alert(`🎉 Successfully imported document file "${file.name}"! The slide preview is now active and ready for live presentation!`);
    };

    reader.readAsDataURL(file);
  };

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

  const userEmail = user?.email || 'guest@pulsepoll.com';

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
          return;
        }

        const saved = localStorage.getItem('pulse-poll-presentations');
        if (saved) {
          const presentations = JSON.parse(saved);
          const localFound = presentations.find(p => p.id === presentationId);
          if (localFound) {
            setPresentation(localFound);
            if (localFound.slides.length > 0) {
              setActiveSlideId(localFound.slides[0].id);
            }
            return;
          }
        }

        // Fallback sample deck
        const sampleDeck = {
          id: presentationId || 'pres-sample-default',
          title: 'Interactive Presentation Deck',
          theme: 'cyber-neon',
          slides: [
            { 
              type: 'poll', 
              question: 'Which concept best explains the primary core fundamentals of interactive polling?', 
              options: [
                { id: 'opt-1', text: 'Real-Time Audience Engagement', emoji: '🚀' },
                { id: 'opt-2', text: 'Visual Analytics & Charts', emoji: '📊' },
                { id: 'opt-3', text: 'Gamified Competitive Quizzes', emoji: '🏆' },
                { id: 'opt-4', text: 'Instant Feedback Loops', emoji: '⚡' }
              ] 
            },
            {
              type: 'wordcloud',
              question: 'In one word, what makes live presentations memorable?'
            }
          ]
        };
        setPresentation(sampleDeck);
        if (sampleDeck.slides.length > 0) {
          setActiveSlideId(sampleDeck.slides[0].id);
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
            return;
          }
        }
        const sampleDeck = {
          id: presentationId || 'pres-sample-default',
          title: 'Interactive Presentation Deck',
          theme: 'cyber-neon',
          slides: [
            { 
              type: 'poll', 
              question: '', 
              options: [
                { id: 'opt-1', text: '' },
                { id: 'opt-2', text: '' }
              ] 
            }
          ]
        };
        setPresentation(sampleDeck);
        if (sampleDeck.slides.length > 0) {
          setActiveSlideId(sampleDeck.slides[0].id);
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
      question: '',
      timeLimit: 15,
      timerAutoStart: false, // Default to manual start!
      options: [
        { id: Math.random().toString(36).substr(2, 9), text: '' },
        { id: Math.random().toString(36).substr(2, 9), text: '' }
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

  const handleReorderSlides = (fromIndex, toIndex) => {
    if (fromIndex === null || toIndex === null || fromIndex === toIndex) return;
    const reordered = [...slides];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    savePresentation({
      ...presentation,
      slides: reordered,
      updatedAt: new Date().toLocaleDateString()
    });
  };

  const handleAiGenerate = async (e) => {
    e.preventDefault();
    if (!aiPromptText.trim()) return;

    if (user?.tier === 'free') {
      onRequestUpgrade('ai_generator');
      return;
    }

    setIsAiGenerating(true);
    const steps = [
      "🤖 Connecting PulseAI Engine...",
      `🔍 Scoping topic: "${aiPromptText.trim()}"...`,
      "✍️ Drafting Quiz, Word Cloud, and coordinate matrix slides...",
      "🎨 Injecting interactive options & options configuration...",
      "✨ Saving presentation slides..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setAiProgressText(steps[i]);
      await new Promise(res => setTimeout(res, 500));
    }

    const topic = aiPromptText.trim();
    const generatedSlides = [
      {
        id: `ai-s1-${Math.random().toString(36).substr(2, 5)}`,
        type: 'quiz',
        question: `Which of the following is the most fundamental concept of ${topic}? 🌟`,
        timeLimit: 20,
        correctAnswerIndex: 0,
        options: [
          { id: Math.random().toString(36).substr(2, 9), text: `Empirical practice of ${topic}` },
          { id: Math.random().toString(36).substr(2, 9), text: `Purely random assumptions` },
          { id: Math.random().toString(36).substr(2, 9), text: `Standard generic status quo` }
        ]
      },
      {
        id: `ai-s2-${Math.random().toString(36).substr(2, 5)}`,
        type: 'wordcloud',
        question: `In one word, what is the most exciting breakthrough or benefit of ${topic}? 📣`
      },
      {
        id: `ai-s3-${Math.random().toString(36).substr(2, 5)}`,
        type: 'grid',
        question: `Plot the components of ${topic} on speed of execution vs global value:`,
        xAxisLabel: 'Speed of Execution',
        yAxisLabel: 'Global Value / Impact',
        options: [
          { id: Math.random().toString(36).substr(2, 9), text: `Basic ${topic} Study` },
          { id: Math.random().toString(36).substr(2, 9), text: `Advanced ${topic} Implementation` }
        ]
      }
    ];

    const updatedPres = {
      ...presentation,
      title: `AI Workspace: ${topic.length > 25 ? topic.slice(0, 25) + '...' : topic}`,
      slides: generatedSlides,
      updatedAt: new Date().toLocaleDateString()
    };

    savePresentation(updatedPres);
    setActiveSlideId(generatedSlides[0].id);
    setIsAiGenerating(false);
    setAiPromptText('');
    setActiveSidebarTab('content');
    alert(`Successfully generated slides on topic: ${topic}!`);
  };

  const handleChangeSlideType = (type) => {
    if (['stopwatch', 'brainstorm'].includes(type) && user?.tier === 'free') {
      let unlocks = [];
      try {
        unlocks = typeof user.unlocked_modules === 'string' 
          ? JSON.parse(user.unlocked_modules || '[]') 
          : (user.unlocked_modules || []);
      } catch(err) { unlocks = []; }
      const isTypeUnlocked = unlocks.some(i => i.module === type && new Date(i.expiresAt) > new Date());
      if (!isTypeUnlocked) {
        onRequestUpgrade(type);
        return;
      }
    }

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

    // Beautiful premium vibrant colors
    const colors = [
      { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))', border: 'rgba(239, 68, 68, 0.35)' }, // Red/Coral
      { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04))', border: 'rgba(59, 130, 246, 0.35)' }, // Blue
      { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))', border: 'rgba(16, 185, 129, 0.35)' }, // Green
      { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04))', border: 'rgba(245, 158, 11, 0.35)' }, // Orange
      { bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04))', border: 'rgba(139, 92, 246, 0.35)' }, // Purple
      { bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(6, 182, 212, 0.04))', border: 'rgba(6, 182, 212, 0.35)' }  // Cyan
    ];

    const currentStyle = colors[index % colors.length] || colors[0];

    return (
      <div 
        key={opt.id} 
        className="animate-fade"
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          width: '100%', 
          padding: '10px 14px', 
          borderRadius: '12px', 
          background: isOptCorrect ? 'rgba(16, 185, 129, 0.15)' : currentStyle.bg, 
          border: isOptCorrect ? '2px solid var(--accent-green)' : `1px solid ${currentStyle.border}`,
          boxShadow: isOptCorrect ? '0 0 15px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          if (!isOptCorrect) e.currentTarget.style.boxShadow = `0 6px 20px ${currentStyle.border.replace('0.35', '0.2')}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = isOptCorrect ? '0 0 15px rgba(16, 185, 129, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.1)';
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
          onFocus={(e) => {
            if (e.target.value.startsWith('Item') || e.target.value.startsWith('Option')) {
              handleOptionChange(opt.id, '');
            } else {
              e.target.select();
            }
            e.target.style.borderBottomColor = 'var(--primary)';
          }}
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
          <button 
            className="btn btn-secondary" 
            onClick={onBack} 
            title={returnNavContext?.returnView === 'sessions' ? "Back to Workshop Schedule" : "Back to Dashboard"}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            <ArrowLeft size={16} />
            <span>{returnNavContext?.returnView === 'sessions' ? "Back to Workshop Schedule" : "Back to Dashboard"}</span>
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
      <div 
        className="creator-container"
        style={{
          display: 'grid',
          gridTemplateColumns: isRightSidebarCollapsed ? '82px 1fr 44px' : '82px 1fr 320px',
          flex: 1,
          overflow: 'hidden',
          transition: 'grid-template-columns 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Left Side: Icon-Only Slide List (Thumbnails) with Tooltips */}
        <div className="sidebar-left" style={{ padding: '1rem 0.4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Slides
          </span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)', padding: '4px' }}>
            {slides.map((slide, index) => {
              const IconComp = SLIDE_TYPE_ITEMS.find(t => t.type === slide.type)?.icon || BarChart3;
              const iconColor = SLIDE_TYPE_ITEMS.find(t => t.type === slide.type)?.color || '#38bdf8';
              const isPpt = slide.type === 'ppt';
              
              return (
                <div 
                  key={slide.id} 
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggedSlideIndex(index);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleReorderSlides(draggedSlideIndex, index);
                    setDraggedSlideIndex(null);
                  }}
                  className={`slide-thumbnail ${slide.id === activeSlideId ? 'active' : ''} ${draggedSlideIndex === index ? 'dragging' : ''}`}
                  onClick={() => setActiveSlideId(slide.id)}
                  title={`Slide ${index + 1}: ${slide.question || '(No Question)'} [${slide.type.toUpperCase()}]`}
                  style={{
                    width: '54px',
                    height: '54px',
                    minHeight: '54px',
                    borderRadius: '14px',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    background: slide.id === activeSlideId ? 'rgba(6, 182, 212, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: slide.id === activeSlideId ? '2px solid var(--accent)' : '1px solid var(--border-glass)',
                    boxShadow: slide.id === activeSlideId ? '0 0 14px rgba(6, 182, 212, 0.35)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Number Badge */}
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    left: '5px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: slide.id === activeSlideId ? 'var(--accent)' : 'var(--text-muted)'
                  }}>
                    {index + 1}
                  </span>

                  {/* Icon */}
                  {isPpt ? <FileUp size={20} color="#3b82f6" /> : <IconComp size={20} color={iconColor} />}

                  {/* Delete Button on Hover */}
                  <button 
                    className="btn-icon" 
                    style={{ 
                      position: 'absolute', top: '-4px', right: '-4px', 
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.85)', color: '#ffffff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: 'pointer', opacity: 0.85
                    }}
                    onClick={(e) => handleDeleteSlide(slide.id, e)}
                    title="Delete Slide"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto', alignItems: 'center' }}>
            {/* Add Slide Icon Button */}
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={handleAddSlide} 
              title="Add Interactive Slide (+)"
              style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Plus size={22} />
            </button>

            {/* Import PPTX / PDF Icon Button */}
            <label 
              className="btn btn-secondary btn-icon" 
              style={{ width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--accent)', color: 'var(--accent)', background: 'rgba(6, 182, 212, 0.08)' }}
              title="Import PowerPoint PPTX or PDF document (PRO)"
            >
              <FileUp size={20} />
              <input 
                type="file" 
                accept=".pptx,.ppt,.pdf,.png,.jpg,.jpeg" 
                style={{ display: 'none' }}
                onChange={handleImportPptFile}
              />
            </label>
          </div>
        </div>

        {/* Center: Slide Preview Mockup */}
        <div className="editor-center" style={{ position: 'relative', padding: '1rem', overflowY: 'auto' }}>
          <div 
            className={`glass-card slide-preview-container theme-${presentation?.theme || 'corporate'}`} 
            style={{ 
              position: 'relative',
              width: '100%',
              maxWidth: '920px',
              minHeight: '490px',
              aspectRatio: '16/9',
              padding: '1.8rem 2.2rem',
              backgroundImage: activeSlide?.bgImage ? `linear-gradient(rgba(11, 15, 25, 0.65), rgba(11, 15, 25, 0.85)), url(${activeSlide.bgImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
              borderRadius: '20px'
            }}
          >
            {/* Top Bar: Slide Counter Badge & Help Badge */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', right: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
              <span style={{ 
                background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)',
                color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800
              }}>
                Slide {slides.findIndex(s => s.id === activeSlideId) + 1} of {slides.length}
              </span>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-glass)' }}
                onClick={() => setShowInstructionPopup(true)}
              >
                ❓ How to Test
              </button>
            </div>

            {/* Floating Instruction Overlay Popup */}
            {showInstructionPopup && INSTRUCTIONS[activeSlide.type] && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                backgroundColor: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
                padding: '24px'
              }}>
                <div className="glass-card animate-fade" style={{
                  width: '100%', maxWidth: '520px', padding: '32px', textAlign: 'left',
                  border: '1px solid rgba(6, 182, 212, 0.4)', background: '#0b0f19',
                  boxShadow: '0 20px 40px rgba(6, 182, 212, 0.25)',
                  maxHeight: '90vh', overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '2.5rem' }}>{INSTRUCTIONS[activeSlide.type].icon}</span>
                    <div>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                        {INSTRUCTIONS[activeSlide.type].title}
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Module Guide</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '20px' }}>
                    {INSTRUCTIONS[activeSlide.type].description}
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '20px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '10px', letterSpacing: '0.05em' }}>
                      How to test:
                    </div>
                    <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                      {INSTRUCTIONS[activeSlide.type].checklist.map((item, idx) => (
                        <li key={idx} style={{ color: '#e2e8f0' }}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    {INSTRUCTIONS[activeSlide.type].tips}
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '12px', fontWeight: 800, fontSize: '0.95rem' }}
                    onClick={() => setShowInstructionPopup(false)}
                  >
                    Got it, Let's build! 🚀
                  </button>
                </div>
              </div>
            )}

            <input 
              type="text"
              className="preview-question-input"
              value={activeSlide.question}
              onChange={(e) => handleUpdateActiveSlide({ question: e.target.value })}
              onFocus={(e) => {
                if (e.target.value.startsWith('Edit your') || e.target.value.startsWith('New Question') || e.target.value.startsWith('First Slide:')) {
                  handleUpdateActiveSlide({ question: '' });
                } else {
                  e.target.select();
                }
                e.target.style.borderBottomColor = 'var(--primary)';
              }}
              placeholder="Type your slide question here..."
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px dashed transparent',
                color: 'var(--text-primary)',
                fontFamily: 'Outfit, sans-serif',
                fontSize: (activeSlide.question || '').length > 60 ? '1.25rem' : (activeSlide.question || '').length > 35 ? '1.5rem' : '1.85rem',
                fontWeight: 800,
                textAlign: 'center',
                width: '100%',
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                outline: 'none',
                padding: '6px',
                marginTop: '1.5rem',
                marginBottom: '1rem',
                transition: 'var(--transition-smooth)'
              }}
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
                <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                  }}>
                    {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '6px 20px', gap: '6px', background: 'rgba(255,255,255,0.06)' }}>
                    <Plus size={14} /> Add Option
                  </button>
                </div>
              )}

              {activeSlide.type === 'wordcloud' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                  {(activeSlide.responses && (Array.isArray(activeSlide.responses) ? activeSlide.responses.length > 0 : Object.keys(activeSlide.responses).length > 0)) ? (
                    (() => {
                      let entries = [];
                      if (Array.isArray(activeSlide.responses)) {
                        const freq = {};
                        activeSlide.responses.forEach(w => { if (typeof w === 'string' && w.trim()) freq[w.trim()] = (freq[w.trim()] || 0) + 1; });
                        entries = Object.entries(freq).map(([text, count]) => ({ text, weight: count }));
                      } else if (typeof activeSlide.responses === 'object') {
                        entries = Object.entries(activeSlide.responses).map(([text, count]) => ({ text, weight: Number(count) || 1 }));
                      }
                      const palette = ['#38bdf8', '#f43f5e', '#10b981', '#fbbf24', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];
                      return entries.map((item, idx) => (
                        <span key={idx} style={{
                          fontSize: `${Math.min(2.8, 1.2 + item.weight * 0.4)}rem`,
                          color: palette[idx % palette.length],
                          fontWeight: 700,
                          padding: '4px 10px',
                          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease'
                        }}>
                          {item.text}
                        </span>
                      ));
                    })()
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontStyle: 'italic' }}>
                      ☁️ Live Word Cloud — Audience submitted words will appear here in real-time in vibrant colors!
                    </div>
                  )}
                </div>
              )}

              {activeSlide.type === 'openended' && (
                <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', width: '150px', fontSize: '0.8rem' }}>Response Card A</div>
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', width: '150px', fontSize: '0.8rem' }}>Response Card B</div>
                </div>
              )}

              {activeSlide.type === 'scales' && (
                <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '6px 18px', gap: '6px', background: 'rgba(255,255,255,0.06)' }}>
                    <Plus size={14} /> Add Dimension
                  </button>
                </div>
              )}

              {activeSlide.type === 'ranking' && (
                <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '6px 18px', gap: '6px', background: 'rgba(255,255,255,0.06)' }}>
                    <Plus size={14} /> Add Item to Rank
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
                <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '6px 18px', gap: '6px', background: 'rgba(255,255,255,0.06)' }}>
                    <Plus size={14} /> Add Distribution Item
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
                <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                    {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '6px 18px', gap: '6px', background: 'rgba(255,255,255,0.06)' }}>
                    <Plus size={14} /> Add Form Field
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
                <div style={{ width: '100%', maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                  }}>
                    {activeSlide.options?.map((opt, i) => renderEditableOption(opt, i))}
                  </div>
                  <button className="btn btn-secondary" onClick={handleAddOption} style={{ alignSelf: 'center', fontSize: '0.85rem', padding: '6px 18px', gap: '6px', background: 'rgba(255,255,255,0.06)' }}>
                    <Plus size={14} /> Add Quiz Option
                  </button>
                </div>
              )}

              {activeSlide.type === 'stopwatch' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)', letterSpacing: '2px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 24px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    00:{activeSlide.timeLimit < 10 ? `0${activeSlide.timeLimit}` : activeSlide.timeLimit}.000
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    ⏳ Interactive Timer Mode. Set preset duration (10s, 15s, 20s, 30s, 60s) in sidebar.
                  </p>
                </div>
              )}

              {activeSlide.type === 'brainstorm' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {['Category A', 'Category B', 'Category C', 'Category D'].map((cat, idx) => {
                      const categoryLabel = activeSlide[`category${idx + 1}`] || cat;
                      return (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-glass)', borderRadius: '12px', padding: '12px', minHeight: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid var(--border-glass)', width: '100%', textAlign: 'center', paddingBottom: '4px', marginBottom: '8px' }}>
                            {categoryLabel}
                          </span>
                          <div className="animate-pulse" style={{ background: 'var(--primary-glow)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.7rem', border: '1px solid var(--border-glass)', color: '#f8fafc', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                            📝 Sticky Note
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeSlide.type === 'ppt' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '780px' }}>
                  <div style={{
                    width: '100%', height: '280px', background: 'rgba(15, 23, 42, 0.85)', border: '2px solid var(--accent)',
                    borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '12px', padding: '16px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}>
                    {(activeSlide.customUrl || activeSlide.pptUrl) && !activeSlide.bgImage ? (
                      <iframe 
                        src={activeSlide.customUrl || activeSlide.pptUrl}
                        title="Imported PPT / PDF Preview"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px', background: '#ffffff' }}
                      />
                    ) : activeSlide.bgImage ? (
                      <img 
                        src={activeSlide.bgImage} 
                        alt="PPT Slide" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} 
                      />
                    ) : (
                      <>
                        <FileUp size={48} color="var(--accent)" />
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                          {activeSlide.question || '📄 Imported PPTX / PDF Presentation Document'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {activeSlide.content || 'Non-interactive lecture deck slide'}
                        </div>
                      </>
                    )}
                    <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.72rem', background: 'var(--accent)', color: '#08211E', padding: '4px 10px', borderRadius: '12px', fontWeight: 800, zIndex: 10 }}>
                      PRO Slide View
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label 
                      className="btn btn-secondary btn-sm" 
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', fontWeight: 600 }}
                      title="Replace or upload a new PowerPoint PPTX or PDF document"
                    >
                      <FileUp size={14} /> Upload / Replace Document
                      <input 
                        type="file" 
                        accept=".pptx,.ppt,.pdf,.png,.jpg,.jpeg" 
                        style={{ display: 'none' }}
                        onChange={handleImportPptFile}
                      />
                    </label>

                    <button 
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onPresent(presentation.id)}
                      style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 700, fontSize: '0.8rem', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Play size={14} /> Present Document Live
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Slide Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '16px' }}>
            <button 
              className="btn btn-secondary" 
              disabled={slides.findIndex(s => s.id === activeSlideId) <= 0}
              onClick={() => {
                const idx = slides.findIndex(s => s.id === activeSlideId);
                if (idx > 0) setActiveSlideId(slides[idx - 1].id);
              }}
              style={{ fontSize: '0.85rem', fontWeight: 800, padding: '8px 16px', borderRadius: '10px', background: '#1e293b', color: '#ffffff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              ◄ Previous Slide
            </button>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Slide {slides.findIndex(s => s.id === activeSlideId) + 1} of {slides.length}
            </span>
            <button 
              className="btn btn-primary" 
              disabled={slides.findIndex(s => s.id === activeSlideId) >= slides.length - 1}
              onClick={() => {
                const idx = slides.findIndex(s => s.id === activeSlideId);
                if (idx < slides.length - 1) setActiveSlideId(slides[idx + 1].id);
              }}
              style={{ fontSize: '0.85rem', fontWeight: 800, padding: '8px 16px', borderRadius: '10px', background: 'linear-gradient(135deg, #0284c7, #2563eb)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Next Slide ►
            </button>
          </div>
        </div>

        {/* Right Side: Settings & Options (Collapsible) */}
        <div 
          className="sidebar-right"
          style={{
            padding: isRightSidebarCollapsed ? '12px 4px' : '1.25rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border-glass)',
            transition: 'padding 0.3s ease'
          }}
        >
          {isRightSidebarCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
              <button 
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsRightSidebarCollapsed(false)}
                title="Expand Slide Settings & Customization Panel"
                style={{ width: '36px', height: '36px', background: 'var(--accent-soft)', color: 'var(--accent)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                <Sliders size={18} />
              </button>
              <span style={{ writingMode: 'vertical-rl', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
                Slide Properties
              </span>
            </div>
          ) : (
            <>
              {/* Header with Minimize Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Slide Settings & Customize
                </span>
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsRightSidebarCollapsed(true)}
                  title="Minimize Right Panel to give slide preview maximum space"
                  style={{ fontSize: '0.72rem', padding: '3px 8px', gap: '4px', background: 'var(--surface-2)', border: 'none' }}
                >
                  <span>Minimize</span> ➔
                </button>
              </div>

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
            <button 
              type="button"
              className={`sidebar-tab-btn ${activeSidebarTab === 'ai' ? 'active' : ''}`}
              style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: activeSidebarTab === 'ai' ? '2px solid var(--primary)' : '2px solid transparent', padding: '10px 4px', color: activeSidebarTab === 'ai' ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              onClick={() => setActiveSidebarTab('ai')}
            >
              🤖 AI
            </button>
          </div>

          {/* 1. TYPE TAB */}
          {activeSidebarTab === 'type' && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
              <div className="settings-group" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '14px' }}>
                  <label style={{ margin: 0 }}>Question Type Selector</label>
                  <button 
                    type="button" 
                    onClick={() => setTypePickerViewMode(typePickerViewMode === 'radial' ? 'grid' : 'radial')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {typePickerViewMode === 'radial' ? '🔳 Switch to Grid View' : '⭕ Switch to Radial Wheel'}
                  </button>
                </div>

                {typePickerViewMode === 'radial' ? (
                  /* Clean One-Sided Popout Hub without Backdrop Darkening */
                  <div 
                    className={`one-side-popout-container ${isRadialPickerOpen ? 'open' : ''}`}
                    onMouseEnter={() => setIsRadialPickerOpen(true)}
                    onMouseLeave={() => setIsRadialPickerOpen(false)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', margin: '14px 0', position: 'relative', minHeight: '380px', justifyContent: 'center' }}
                  >
                    {/* Radial Center Hub Trigger */}
                    <div 
                      onClick={() => setIsRadialPickerOpen(!isRadialPickerOpen)}
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, var(--surface-2) 85%)',
                        border: '3px solid var(--accent)',
                        boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 20,
                        transition: 'all 0.3s ease'
                      }}
                      className="kinetic-hub-pulse hover-scale"
                    >
                      {(() => {
                        const IconComp = SLIDE_TYPE_ITEMS.find(t => t.type === activeSlide.type)?.icon || BarChart3;
                        const iconColor = SLIDE_TYPE_ITEMS.find(t => t.type === activeSlide.type)?.color || '#38bdf8';
                        return <IconComp size={32} color={iconColor} />;
                      })()}
                      <span style={{ fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px', textAlign: 'center', padding: '0 6px' }}>
                        {SLIDE_TYPE_ITEMS.find(t => t.type === activeSlide.type)?.label}
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', marginTop: '2px' }}>
                        {isRadialPickerOpen ? '✕ Close' : '✨ Hover to Select'}
                      </span>
                    </div>

                    {/* Popout Question Type Items (One-Sided Layout, Readable Text Pills, No Screen Darkening) */}
                    {SLIDE_TYPE_ITEMS.map((item, idx) => {
                      const IconComp = item.icon;
                      const isActive = activeSlide.type === item.type;
                      
                      // Compute 2-column or semi-circular offset around hub
                      const angleDeg = (idx / SLIDE_TYPE_ITEMS.length) * 360 - 90;
                      const angleRad = (angleDeg * Math.PI) / 180;
                      const radius = 120;
                      const x = Math.round(Math.cos(angleRad) * radius);
                      const y = Math.round(Math.sin(angleRad) * radius);

                      return (
                        <div
                          key={item.type}
                          className="one-side-item"
                          onClick={() => {
                            handleChangeSlideType(item.type);
                            setIsRadialPickerOpen(false);
                          }}
                          style={{
                            transform: isRadialPickerOpen ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0px, 0px) scale(0.3)',
                            transitionDelay: isRadialPickerOpen ? `${idx * 25}ms` : '0ms',
                            background: isActive ? 'var(--accent-soft)' : 'var(--surface-2)',
                            borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                            color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            boxShadow: isActive ? '0 0 16px var(--accent-soft)' : '0 6px 18px rgba(0,0,0,0.3)',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          <IconComp size={15} color={item.color} />
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Standard Grid View */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                    {SLIDE_TYPE_ITEMS.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button 
                          key={item.type}
                          className={`btn-type-option ${activeSlide.type === item.type ? 'active' : ''}`}
                          onClick={() => handleChangeSlideType(item.type)}
                        >
                          <IconComp size={14} color={item.color} /> {item.label}
                        </button>
                      );
                    })}
                  </div>
                )}
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

              {/* Stopwatch presets */}
              {activeSlide.type === 'stopwatch' && (
                <div className="settings-group">
                  <label>Timer Duration Presets</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '6px' }}>
                    {[10, 15, 20, 30, 60].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        className={`btn ${activeSlide.timeLimit === sec ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 2px', fontSize: '0.75rem', fontWeight: 800 }}
                        onClick={() => handleUpdateActiveSlide({ timeLimit: sec })}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brainstorm Categories */}
              {activeSlide.type === 'brainstorm' && (
                <>
                  <div className="settings-group">
                    <label>Grid Category 1</label>
                    <input 
                      type="text" 
                      className="input-text"
                      value={activeSlide.category1 || ''}
                      onChange={(e) => handleUpdateActiveSlide({ category1: e.target.value })}
                      placeholder="e.g. Category A"
                    />
                  </div>
                  <div className="settings-group">
                    <label>Grid Category 2</label>
                    <input 
                      type="text" 
                      className="input-text"
                      value={activeSlide.category2 || ''}
                      onChange={(e) => handleUpdateActiveSlide({ category2: e.target.value })}
                      placeholder="e.g. Category B"
                    />
                  </div>
                  <div className="settings-group">
                    <label>Grid Category 3</label>
                    <input 
                      type="text" 
                      className="input-text"
                      value={activeSlide.category3 || ''}
                      onChange={(e) => handleUpdateActiveSlide({ category3: e.target.value })}
                      placeholder="e.g. Category C"
                    />
                  </div>
                  <div className="settings-group">
                    <label>Grid Category 4</label>
                    <input 
                      type="text" 
                      className="input-text"
                      value={activeSlide.category4 || ''}
                      onChange={(e) => handleUpdateActiveSlide({ category4: e.target.value })}
                      placeholder="e.g. Category D"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 3. DESIGN / CUSTOMIZE TAB */}
          {activeSidebarTab === 'design' && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* 5 Countdown Audio Themes (Paid Feature) */}
              <div className="settings-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Countdown Audio Theme</span>
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 800 }}>🔒 Paid Feature</span>
                </label>
                <select 
                  value={activeSlide.audioTheme || presentation.audioTheme || 'classic'}
                  onChange={(e) => {
                    if (user?.tier === 'free') {
                      onRequestUpgrade('audio_theme');
                      return;
                    }
                    handleUpdateActiveSlide({ audioTheme: e.target.value });
                  }}
                  style={{
                    width: '100%', padding: '10px 12px', background: '#0f172a',
                    border: '1px solid var(--border-glass)', borderRadius: '8px',
                    color: '#ffffff', fontSize: '0.85rem', fontWeight: 600, outline: 'none'
                  }}
                >
                  <option value="classic">⏱️ Classic Ticking Clock</option>
                  <option value="synth">⚡ Synthesizer Energy Beat</option>
                  <option value="gameshow">🎺 Game Show Fanfare</option>
                  <option value="chill">🌊 Ambient Deep Chill</option>
                  <option value="arcade">🚀 Space Arcade Rush</option>
                </select>
              </div>
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

              {/* Focus Mode / Anti-Cheat Toggle */}
              <div className="settings-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '-10px' }}>
                <input 
                  type="checkbox"
                  id="sidebar-focus-mode"
                  checked={activeSlide.focusMode === true}
                  onChange={(e) => {
                    if (e.target.checked && user?.tier === 'free') {
                      let unlocks = [];
                      try {
                        unlocks = typeof user.unlocked_modules === 'string' 
                          ? JSON.parse(user.unlocked_modules || '[]') 
                          : (user.unlocked_modules || []);
                      } catch(err) { unlocks = []; }
                      const isFocusUnlocked = unlocks.some(i => i.module === 'focus_mode' && new Date(i.expiresAt) > new Date());
                      if (!isFocusUnlocked) {
                        onRequestUpgrade('focus_mode');
                        return;
                      }
                    }
                    handleUpdateActiveSlide({ focusMode: e.target.checked });
                  }}
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="sidebar-focus-mode" style={{ cursor: 'pointer', userSelect: 'none', margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🔒 Focus Mode (Anti-Cheat)
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

              {/* Slide Background Artwork Image Picker */}
              <div className="settings-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Slide Background Artwork</span>
                  <span style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 800 }}>🎨 AI Generated</span>
                </label>
                <select 
                  value={activeSlide.bgImage || ''}
                  onChange={(e) => handleUpdateActiveSlide({ bgImage: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 12px', background: '#0f172a',
                    border: '1px solid var(--border-glass)', borderRadius: '8px',
                    color: '#ffffff', fontSize: '0.85rem', fontWeight: 600, outline: 'none'
                  }}
                >
                  <option value="">Default Theme Wallpaper</option>
                  <option value="/assets/theme_cyber_neon.jpg">🌌 Cyber Neon Artwork</option>
                  <option value="/assets/theme_midnight_gold.jpg">👑 Midnight Gold Executive</option>
                  <option value="/assets/theme_cosmic_nebula.jpg">✨ Cosmic Nebula Stardust</option>
                  <option value="/assets/theme_playroom_magic.jpg">🎨 Playroom Magic Pastel</option>
                </select>
              </div>

              {/* Theme Settings (Global for presentation) */}
              <div className="settings-group">
                <label>Presentation Theme</label>
                <div className="theme-picker-section">
                  <div className="theme-picker-category-title" style={{ color: '#06b6d4', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🎨 Generated Artwork Themes
                  </div>
                  <div className="theme-picker-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '16px' }}>
                    {AVAILABLE_THEMES.filter(t => t.type === 'art').map(t => (
                      <div 
                        key={t.id} 
                        className={`theme-picker-item ${(presentation.theme || 'corporate') === t.id ? 'active' : ''}`}
                        onClick={() => handleUpdateTheme(t.id)}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="theme-palette-preview" style={{ backgroundImage: `url(${t.bg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                          {t.colors.map((c, i) => (
                            <div key={i} className="theme-color-dot" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <div className="theme-picker-name">{t.name}</div>
                      </div>
                    ))}
                  </div>

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

                  <div className="theme-picker-category-title" style={{ marginTop: '12px' }}>Dark Themes</div>
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

          {/* 4. AI TAB PANEL */}
          {activeSidebarTab === 'ai' && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {!isAiGenerating ? (
                <form onSubmit={handleAiGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(6,182,212,0.05)', border: '1px solid var(--border-glass)', borderRadius: '10px', fontSize: '0.8rem', color: 'var(--primary)', lineHeight: 1.4 }}>
                    🤖 <strong>PulseAI slide generator:</strong> Type any topic below and hit generate. We will dynamically rewrite this presentation with custom interactive slides.
                  </div>

                  <div className="settings-group">
                    <label>Generate Slides for Topic:</label>
                    <input 
                      type="text" 
                      className="input-text" 
                      placeholder="e.g. World War II history, Basic Algebra, Python syntax"
                      value={aiPromptText}
                      onChange={(e) => setAiPromptText(e.target.value)}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '12px', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    Generate with AI ⚡
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                  <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid rgba(6,182,212,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '15px' }} />
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Generating AI Slides...
                  </h4>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--primary)', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                    {aiProgressText}
                  </div>
                </div>
              )}
            </div>
          )}
          </>
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
