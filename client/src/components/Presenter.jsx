import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  ChevronLeft, ChevronRight, Lock, Unlock, Eye, EyeOff, RotateCcw, 
  Users, Trophy, Presentation as PresIcon, HelpCircle, ArrowLeft, CheckCircle2, QrCode, Edit3, MessageSquare, Shuffle, RefreshCw, Award, Sparkles,
  BarChart3, PieChart, CircleDot, Activity, Flame
} from 'lucide-react';
import { solveGroupAllocation, GROUP_NAMING_THEMES, calculateInteractionCoverage } from '../utils/groupingAlgorithm';
import { playClickSound, playHoverSound, playCorrectSound, playMultiplierSound, playSciFiBeep } from '../utils/soundEffects';

const OPTION_COLORS = ['#4ecdc4', '#cbe86b', '#9adefa', '#ff6b6b', '#6b7c85', '#1e90ff', '#1dd1a1', '#ffb936', '#ffb8b8', '#8e44ad'];

const playSynthSound = (type, audioTheme = 'classic') => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (audioTheme === 'synth') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      } else if (audioTheme === 'gameshow') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1050, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      } else if (audioTheme === 'chill') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      } else if (audioTheme === 'arcade') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(980, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      } else {
        // Classic Ticking Clock
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      }
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } 
    else if (type === 'warning') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } 
    else if (type === 'success') {
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.45);
        
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.45);
      });
    }
  } catch (err) {
    console.error('Failed to play audio:', err);
  }
};

function BeakerCanvas({ votes, color }) {
  const canvasRef = useRef(null);
  const ballsRef = useRef([]);
  const prevVotesRef = useRef(0);

  const ballRadius = 11;
  const gravity = 0.35;
  const restitution = 0.45;

  useEffect(() => {
    if (votes < prevVotesRef.current) {
      ballsRef.current = [];
    }
    if (votes > prevVotesRef.current) {
      const diff = votes - prevVotesRef.current;
      const W = canvasRef.current ? canvasRef.current.width : 160;
      
      for (let i = 0; i < diff; i++) {
        setTimeout(() => {
          const r = ballRadius * (0.9 + Math.random() * 0.18);
          const nozzleX = W / 2;
          ballsRef.current.push({
            x: nozzleX + (Math.random() - 0.5) * 10,
            y: 10,
            vx: (Math.random() - 0.5) * 1.2,
            vy: 1.0 + Math.random() * 1.5,
            r: r
          });
        }, i * 150);
      }
    }
    prevVotesRef.current = votes;
  }, [votes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const W = canvas.width;
    const H = canvas.height;
    
    const beaker = {
      top: 40,
      bottom: H - 8,
      left: 10,
      right: W - 10,
      wall: 4
    };
    const innerLeft = beaker.left + beaker.wall;
    const innerRight = beaker.right - beaker.wall;
    const innerBottom = beaker.bottom - beaker.wall;

    const clampToWalls = (b) => {
      if (b.x - b.r < innerLeft) {
        b.x = innerLeft + b.r;
        if (b.vx < 0) b.vx *= -restitution;
      }
      if (b.x + b.r > innerRight) {
        b.x = innerRight - b.r;
        if (b.vx > 0) b.vx *= -restitution;
      }
      if (b.y + b.r > innerBottom) {
        b.y = innerBottom - b.r;
        if (b.vy > 0) b.vy *= -restitution;
        b.vx *= 0.85; // friction
        if (Math.abs(b.vy) < 0.3) b.vy = 0;
      }
    };

    const shade = (hex, percent) => {
      const num = parseInt(hex.replace('#', ''), 16);
      let r = (num >> 16) + Math.round(255 * (percent / 100));
      let g = ((num >> 8) & 0xff) + Math.round(255 * (percent / 100));
      let b = (num & 0xff) + Math.round(255 * (percent / 100));
      r = Math.max(0, Math.min(255, r));
      g = Math.max(0, Math.min(255, g));
      b = Math.max(0, Math.min(255, b));
      return `rgb(${r},${g},${b})`;
    };

    const step = () => {
      const balls = ballsRef.current;
      const sub = 2;
      for (let s = 0; s < sub; s++) {
        for (const b of balls) {
          b.vy += gravity;
          b.x += b.vx;
          b.y += b.vy;
        }
        for (const b of balls) clampToWalls(b);

        const iterations = 4;
        for (let iter = 0; iter < iterations; iter++) {
          for (let i = 0; i < balls.length; i++) {
            const a = balls[i];
            for (let j = i + 1; j < balls.length; j++) {
              const b = balls[j];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distSq = dx * dx + dy * dy;
              const minDist = a.r + b.r;
              if (distSq < minDist * minDist && distSq > 0.0001) {
                const dist = Math.sqrt(distSq);
                const overlap = minDist - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                const totalMass = a.r + b.r;
                const pushA = overlap * (b.r / totalMass);
                const pushB = overlap * (a.r / totalMass);
                a.x -= nx * pushA;
                a.y -= ny * pushA;
                b.x += nx * pushB;
                b.y += ny * pushB;

                const rvx = b.vx - a.vx;
                const rvy = b.vy - a.vy;
                const velAlongNormal = rvx * nx + rvy * ny;
                if (velAlongNormal < 0) {
                  const e = restitution * 0.9;
                  const jImpulse = -(1 + e) * velAlongNormal / 2;
                  const ix = jImpulse * nx;
                  const iy = jImpulse * ny;
                  a.vx -= ix;
                  a.vy -= iy;
                  b.vx += ix;
                  b.vy += iy;
                }
              }
            }
          }
          for (const b of balls) clampToWalls(b);
        }

        for (const b of balls) {
          if (Math.abs(b.vx) < 0.03) b.vx = 0;
          else b.vx *= 0.995;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const balls = ballsRef.current;
      for (const b of balls) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.15,
          b.x, b.y, b.r * 1.05
        );
        grad.addColorStop(0, shade(color, 35));
        grad.addColorStop(0.55, color);
        grad.addColorStop(1, shade(color, -25));
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = shade(color, -35);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.38, b.r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fill();
        ctx.restore();
      }
    };

    const loop = () => {
      step();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [color]);

  return (
    <canvas 
      ref={canvasRef} 
      width={160} 
      height={240} 
      style={{ display: 'block', background: 'transparent', width: '100%', height: '100%' }}
    />
  );
}

function PenCanvasOverlay({ isActive, penTool, penColor, penSize, onSaveStroke, penStrokes }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    penStrokes.forEach(stroke => {
      if (!stroke.points || stroke.points.length < 2) return;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = stroke.tool === 'highlighter' ? 0.45 : 1.0;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    });
  }, [penStrokes, isActive]);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (!isActive) return;
    isDrawingRef.current = true;
    const pos = getPos(e);
    currentPathRef.current = [pos];
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !isActive) return;
    const pos = getPos(e);
    currentPathRef.current.push(pos);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const points = currentPathRef.current;
    if (points.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penTool === 'highlighter' ? penSize * 3.5 : penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = penTool === 'highlighter' ? 0.45 : 1.0;

    const p1 = points[points.length - 2];
    const p2 = points[points.length - 1];
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentPathRef.current.length > 1) {
      onSaveStroke({
        tool: penTool,
        color: penColor,
        size: penTool === 'highlighter' ? penSize * 3.5 : penSize,
        points: [...currentPathRef.current]
      });
    }
    currentPathRef.current = [];
  };

  if (!isActive && penStrokes.length === 0) return null;

  return (
    <canvas 
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        pointerEvents: isActive ? 'auto' : 'none',
        touchAction: 'none'
      }}
    />
  );
}

const PREMIUM_SLIDE_TYPES = ['wordcloud', 'brainstorm', 'grid', 'scales', 'stopwatch', 'focus_mode', 'ranking', 'points', 'guess'];

const isSlideAllowedForUser = (slide, user) => {
  if (!slide) return true;
  
  // Non-premium slides (standard Multiple Choice polls, basic quizzes) are ALWAYS allowed!
  if (!PREMIUM_SLIDE_TYPES.includes(slide.type)) {
    return true;
  }

  // Retrieve user object from localStorage if not passed in props
  const currentUser = user || JSON.parse(localStorage.getItem('pulse-poll-user') || '{}');
  const tier = (currentUser?.tier || 'free').toLowerCase();
  const isSubscriptionActive = currentUser?.subscription_status === 'active' || tier === 'admin';

  if (tier === 'admin') return true;
  if ((tier === 'pro' || tier === 'business') && isSubscriptionActive) return true;

  // Check active referral coin unlocks
  let unlocks = [];
  try {
    unlocks = typeof currentUser?.unlocked_modules === 'string'
      ? JSON.parse(currentUser.unlocked_modules || '[]')
      : (currentUser?.unlocked_modules || []);
  } catch(e) { unlocks = []; }

  const moduleKeyMap = {
    'wordcloud': 'wordcloud',
    'brainstorm': 'brainstorm',
    'stopwatch': 'stopwatch',
    'focus_mode': 'focus_mode'
  };

  const requiredModule = moduleKeyMap[slide.type] || 'pro_slides';
  const hasActiveUnlock = unlocks.some(u => u.module === requiredModule && new Date(u.expiresAt) > new Date());

  return hasActiveUnlock;
};

export default function Presenter({ presentationId, onBack, user: userProp }) {
  const [presentation, setPresentation] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [participantsCount, setParticipantsCount] = useState(0);
  
  // Slide & theme state
  const [slides, setSlides] = useState([]);
  const [theme, setTheme] = useState('corporate');
  const [leaderboard, setLeaderboard] = useState({});
  const [pollVizMode, setPollVizMode] = useState('bar'); // bar, pie, doughnut, density
  const [isEsportsArenaMode, setIsEsportsArenaMode] = useState(false);
  
  // Controls state
  const [votingLocked, setVotingLocked] = useState(false);
  const [answersVisible, setAnswersVisible] = useState(true);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [showLobbyOverlay, setShowLobbyOverlay] = useState(false);
  const [focusViolations, setFocusViolations] = useState([]);

  // Interactive Live Pen / Touchpen Stencil Annotation State
  const [isPenActive, setIsPenActive] = useState(false);
  const [penTool, setPenTool] = useState('pen'); // 'pen' or 'highlighter'
  const [penColor, setPenColor] = useState('#06b6d4');
  const [penSize, setPenSize] = useState(4);
  const [penStrokes, setPenStrokes] = useState([]);

  // Admin <-> Participant Direct Chat State
  const [showAdminChatDrawer, setShowAdminChatDrawer] = useState(false);
  const [adminChatText, setAdminChatText] = useState('');
  const [adminChatMessages, setAdminChatMessages] = useState([
    { id: '1', sender: 'Participant (Alex)', text: 'Hello host, I submitted my answer!', timestamp: '11:22 AM' }
  ]);

  // Intelligent Team & Group Manager State
  const [showGroupManagerModal, setShowGroupManagerModal] = useState(false);
  const [groupCount, setGroupCount] = useState(4);
  const [groupThemeKey, setGroupThemeKey] = useState('indian_rivers');
  const [groupAllocations, setGroupAllocations] = useState([]);
  const [pairHistoryMatrix, setPairHistoryMatrix] = useState({});
  const [interactionCoverage, setInteractionCoverage] = useState(0);
  const [repeatPairCount, setRepeatPairCount] = useState(0);
  const [participantRoster, setParticipantRoster] = useState([]);

  // Sports Leaderboard Podium & Grand Finale States
  const [leaderboardViewMode, setLeaderboardViewMode] = useState('individual'); // 'individual' or 'team'
  const [showFinaleModal, setShowFinaleModal] = useState(false);

  const getTeamStandings = () => {
    if (!groupAllocations || groupAllocations.length === 0) return [];
    
    return groupAllocations.map(g => {
      let totalPts = 0;
      (g.members || []).forEach(m => {
        totalPts += (leaderboard[m.name] || 0);
      });
      return {
        name: g.name,
        code: g.code,
        score: totalPts,
        memberCount: (g.members || []).length
      };
    }).sort((a, b) => b.score - a.score);
  };

  const handleSolveAndAssignGroups = () => {
    const activeRoster = participantRoster.length >= 2 ? participantRoster : [
      { id: 'p-1', name: 'Alex Rivers', gender: 'M' },
      { id: 'p-2', name: 'Rahul Sharma', gender: 'M' },
      { id: 'p-3', name: 'Ananya Verma', gender: 'F' },
      { id: 'p-4', name: 'Priya Patel', gender: 'F' },
      { id: 'p-5', name: 'David Miller', gender: 'M' },
      { id: 'p-6', name: 'Sara Khan', gender: 'F' },
      { id: 'p-7', name: 'Vikram Singh', gender: 'M' },
      { id: 'p-8', name: 'Deepa Nair', gender: 'F' }
    ];

    const result = solveGroupAllocation(
      activeRoster,
      groupCount,
      pairHistoryMatrix,
      groupThemeKey
    );

    setGroupAllocations(result.groups);
    setPairHistoryMatrix(result.pairHistory);
    setInteractionCoverage(result.coveragePercentage);
    setRepeatPairCount(result.repeatCount);

    if (socketRef.current) {
      socketRef.current.emit('groups_updated', {
        roomCode,
        groups: result.groups,
        coverage: result.coveragePercentage
      });
    }
  };

  // New Reveal/Results States
  const [correctRevealed, setCorrectRevealed] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(true);
  const [confettiActive, setConfettiActive] = useState(false);

  useEffect(() => {
    setCorrectRevealed(false);
    setResultsVisible(true);
    setConfettiActive(false);
    if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    setStopwatchActive(false);
    if (slides && slides[currentSlideIndex]) {
      const activeSlide = slides[currentSlideIndex];
      setStopwatchTime((activeSlide.timeLimit || 15) * 1000);
    }
  }, [currentSlideIndex, slides]);

  const handleRevealCorrect = () => {
    if (correctRevealed) {
      setCorrectRevealed(false);
    } else {
      setCorrectRevealed(true);
      const activeSlide = slides[currentSlideIndex];
      const hasCorrect = activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0;
      if (activeSlide && hasCorrect) {
        setConfettiActive(true);
        setTimeout(() => setConfettiActive(false), 5000);
      }
    }
  };

  // Quiz timer
  const [quizTimer, setQuizTimer] = useState(0);
  const [quizRunning, setQuizRunning] = useState(false);
  const [showWinnerCelebration, setShowWinnerCelebration] = useState(false);
  const timerIntervalRef = useRef(null);
  const musicOscillatorsRef = useRef([]);
  const musicIntervalRef = useRef(null);

  // Stopwatch / Timer slide states
  const [stopwatchTime, setStopwatchTime] = useState(15000);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const stopwatchIntervalRef = useRef(null);

  const socketRef = useRef(null);

  const currentUser = userProp || JSON.parse(localStorage.getItem('pulse-poll-user') || '{}');
  const user = currentUser;
  const userEmail = currentUser.email || 'guest@pulsepoll.com';

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
          setSlides(parsedFound.slides);
          setTheme(parsedFound.theme || 'corporate');
          return;
        }

        const saved = localStorage.getItem('pulse-poll-presentations');
        if (saved) {
          const presentations = JSON.parse(saved);
          const localFound = presentations.find(p => p.id === presentationId);
          if (localFound) {
            setPresentation(localFound);
            setSlides(localFound.slides);
            setTheme(localFound.theme || 'corporate');
            return;
          }
        }

        // Fallback sample presentation
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
            },
            {
              type: 'quiz',
              question: 'Which biological process converts sunlight and carbon dioxide into oxygen? 🌿',
              timeLimit: 15,
              correctAnswerIndex: 0,
              options: [
                { id: 'opt-1', text: 'Photosynthesis (Correct)', emoji: '🌿' },
                { id: 'opt-2', text: 'Cellular Respiration', emoji: '💨' },
                { id: 'opt-3', text: 'Evaporation', emoji: '💧' }
              ]
            }
          ]
        };
        setPresentation(sampleDeck);
        setSlides(sampleDeck.slides);
        setTheme(sampleDeck.theme);
      } catch (err) {
        console.error('Error fetching presentation in presenter:', err);
        const saved = localStorage.getItem('pulse-poll-presentations');
        if (saved) {
          const presentations = JSON.parse(saved);
          const localFound = presentations.find(p => p.id === presentationId);
          if (localFound) {
            setPresentation(localFound);
            setSlides(localFound.slides);
            setTheme(localFound.theme || 'corporate');
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
              question: 'Which concept best explains the primary core fundamentals of interactive polling?', 
              options: [
                { id: 'opt-1', text: 'Real-Time Audience Engagement', emoji: '🚀' },
                { id: 'opt-2', text: 'Visual Analytics & Charts', emoji: '📊' },
                { id: 'opt-3', text: 'Gamified Competitive Quizzes', emoji: '🏆' },
                { id: 'opt-4', text: 'Instant Feedback Loops', emoji: '⚡' }
              ] 
            }
          ]
        };
        setPresentation(sampleDeck);
        setSlides(sampleDeck.slides);
        setTheme(sampleDeck.theme);
      }
    };

    fetchPresentation();
  }, [presentationId]);

  useEffect(() => {
    if (!quizRunning && !stopwatchActive) {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
        musicIntervalRef.current = null;
      }
      musicOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      musicOscillatorsRef.current = [];
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const relaxMelody = [261.63, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63];
    const tenseMelody = [440.00, 466.16, 493.88, 523.25, 554.37, 587.33, 622.25, 659.25];
    let noteIdx = 0;

    let nextNoteTime = ctx.currentTime;
    musicIntervalRef.current = setInterval(() => {
      const currentTimer = quizRunning ? quizTimer : (stopwatchTime / 1000);
      const isTense = currentTimer <= 5;
      const beatDuration = isTense ? 0.22 : 0.45;

      while (nextNoteTime < ctx.currentTime + 0.15) {
        try {
          const currentTimerNow = quizRunning ? quizTimer : (stopwatchTime / 1000);
          const isTenseNow = currentTimerNow <= 5;
          const melody = isTenseNow ? tenseMelody : relaxMelody;
          const noteFreq = melody[noteIdx % melody.length];
          noteIdx++;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = isTenseNow ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(noteFreq, nextNoteTime);

          const volume = isTenseNow ? 0.08 : 0.05;
          const dur = isTenseNow ? 0.18 : 0.4;

          gain.gain.setValueAtTime(volume, nextNoteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + dur);

          osc.start(nextNoteTime);
          osc.stop(nextNoteTime + dur);
          musicOscillatorsRef.current.push(osc);

          // Add retro arpeggiator harmony!
          const harmonFreq = noteFreq * 1.5; // Perfect Fifth harmony!
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(harmonFreq, nextNoteTime + 0.05); // delay slightly for rhythmic bounce!
          gain2.gain.setValueAtTime(volume * 0.3, nextNoteTime + 0.05);
          gain2.gain.exponentialRampToValueAtTime(0.001, nextNoteTime + 0.05 + dur * 0.5);
          osc2.start(nextNoteTime + 0.05);
          osc2.stop(nextNoteTime + 0.05 + dur * 0.5);
          musicOscillatorsRef.current.push(osc2);
        } catch(e) {}

        nextNoteTime += beatDuration;
      }

      if (musicOscillatorsRef.current.length > 80) {
        musicOscillatorsRef.current = musicOscillatorsRef.current.slice(-30);
      }
    }, 100);

    return () => {
      if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
      musicOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      try { ctx.close(); } catch(e) {}
    };
  }, [quizRunning, stopwatchActive, quizTimer, stopwatchTime]);

  useEffect(() => {
    if (!presentation) return;

    const socket = io();
    socketRef.current = socket;

    socket.emit('host_presentation', {
      presentationId: presentation.id,
      slides: presentation.slides,
      theme: presentation.theme || 'corporate',
      userEmail: user.email
    });

    socket.on('presentation_hosted', ({ roomCode, currentSlideIndex: idx, slides: hostedSlides, theme: hostTheme }) => {
      setRoomCode(roomCode);
      setCurrentSlideIndex(idx);
      setSlides(hostedSlides);
      setTheme(hostTheme);
      const initialSlide = hostedSlides[idx];
      setQuizTimer(initialSlide && initialSlide.timeLimit ? initialSlide.timeLimit : 15);
      
      if (initialSlide && initialSlide.timeLimit > 0 && initialSlide.timerAutoStart === false) {
        setVotingLocked(true);
      } else {
        setVotingLocked(false);
        if (initialSlide && initialSlide.timeLimit > 0 && (initialSlide.timerAutoStart === true || initialSlide.timerAutoStart === undefined)) {
          setTimeout(() => {
            startQuizTimer();
          }, 600);
        }
      }
    });

    socket.on('participant_joined', ({ count, nickname, gender, socketId }) => {
      setParticipantsCount(count);
      if (nickname) {
        setParticipantRoster(prev => {
          if (prev.some(p => p.name === nickname || p.id === socketId)) return prev;
          return [...prev, { id: socketId || `p-${Math.random().toString(36).substr(2, 6)}`, name: nickname, gender: gender || 'M' }];
        });
      }
    });

    socket.on('participant_left', ({ count }) => {
      setParticipantsCount(count);
    });

    socket.on('responses_updated', ({ slideIndex, responses, leaderboard: currentLeaderboard }) => {
      setSlides(prev => prev.map((s, i) => i === slideIndex ? { ...s, responses } : s));
      if (currentLeaderboard) setLeaderboard(currentLeaderboard);
    });

    socket.on('qa_updated', ({ responses }) => {
      setSlides(prev => prev.map((s, i) => s.type === 'qa' ? { ...s, responses } : s));
    });

    socket.on('theme_changed', ({ theme: nextTheme }) => {
      setTheme(nextTheme);
    });

    socket.on('presenter_focus_warning', ({ nickname, action, warningsLeft }) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newViolation = { id, nickname, action, warningsLeft, time: new Date().toLocaleTimeString() };
      setFocusViolations(prev => [newViolation, ...prev]);
      
      // Auto-clear violation notification after 8 seconds
      setTimeout(() => {
        setFocusViolations(prev => prev.filter(v => v.id !== id));
      }, 8000);
    });

    return () => {
      socket.disconnect();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [presentation]);

  // Sync theme selection to server on local edit
  const handleThemeChange = async (nextTheme) => {
    if (nextTheme !== 'corporate' && (!user || (user.tier !== 'pro' && user.tier !== 'admin'))) {
      alert('Custom themes (Ocean, Sunset, Slate) are a premium feature! Please upgrade to a paid plan on your Dashboard.');
      return;
    }

    setTheme(nextTheme);
    socketRef.current.emit('change_theme', { roomCode, theme: nextTheme });
    
    // Save theme to localStorage
    const saved = localStorage.getItem('pulse-poll-presentations');
    let updatedPres = null;
    if (saved) {
      const list = JSON.parse(saved);
      const updated = list.map(p => {
        if (p.id === presentationId) {
          updatedPres = { ...p, theme: nextTheme };
          return updatedPres;
        }
        return p;
      });
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(updated));
    }

    if (!updatedPres && presentation) {
      updatedPres = { ...presentation, theme: nextTheme };
    }

    if (updatedPres) {
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
        console.error('Error saving updated presentation theme:', err);
      }
    }
  };

  const handleSlideChange = (newIndex) => {
    if (newIndex >= 0 && newIndex < slides.length) {
      setCurrentSlideIndex(newIndex);
      setLeaderboardVisible(false);
      setAnswersVisible(true);
      setPollVizMode('bar');
      
      setQuizRunning(false);
      setQuizTimer(0);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      socketRef.current.emit('change_slide', { roomCode, index: newIndex });

      const targetSlide = slides[newIndex];
      const timerVal = targetSlide && targetSlide.timeLimit ? targetSlide.timeLimit : 15;
      setQuizTimer(timerVal);

      if (targetSlide && targetSlide.timeLimit > 0 && targetSlide.timerAutoStart === false) {
        setVotingLocked(true);
      } else {
        setVotingLocked(false);
        if (targetSlide && targetSlide.timeLimit > 0 && (targetSlide.timerAutoStart === true || targetSlide.timerAutoStart === undefined)) {
          setTimeout(() => {
            startQuizTimer();
          }, 400);
        }
      }
    }
  };

  const toggleVotingLock = () => {
    const nextState = !votingLocked;
    setVotingLocked(nextState);
    socketRef.current.emit('toggle_lock', { roomCode, locked: nextState });
  };

  const toggleAnswersVisibility = () => {
    const nextState = !answersVisible;
    setAnswersVisible(nextState);
    socketRef.current.emit('toggle_answers', { roomCode, visible: nextState });
  };

  const toggleLeaderboard = () => {
    const nextState = !leaderboardVisible;
    setLeaderboardVisible(nextState);
    socketRef.current.emit('toggle_leaderboard', { roomCode, visible: nextState });
  };

  const handleCategorizeCard = (cardId, category) => {
    socketRef.current.emit('update_brainstorm_category', { roomCode, cardId, category });
    setSlides(prev => prev.map((s, idx) => {
      if (idx === currentSlideIndex) {
        const updatedResponses = (s.responses || []).map(r => r.id === cardId ? { ...r, category } : r);
        return { ...s, responses: updatedResponses };
      }
      return s;
    }));
  };

  const handleStartStopwatch = () => {
    if (stopwatchActive) {
      setStopwatchActive(false);
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
      socketRef.current.emit('stopwatch_control', { roomCode, action: 'pause', remainingTime: stopwatchTime });
    } else {
      setStopwatchActive(true);
      const startTime = Date.now();
      const startRemaining = stopwatchTime;
      stopwatchIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, startRemaining - elapsed);
        setStopwatchTime(remaining);
        if (remaining <= 0) {
          setStopwatchActive(false);
          if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
          socketRef.current.emit('stopwatch_control', { roomCode, action: 'pause', remainingTime: 0 });
        }
      }, 33);
      socketRef.current.emit('stopwatch_control', { roomCode, action: 'start', remainingTime: startRemaining });
    }
  };

  const handleResetStopwatch = () => {
    setStopwatchActive(false);
    if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    const initialMs = (activeSlide.timeLimit || 15) * 1000;
    setStopwatchTime(initialMs);
    socketRef.current.emit('stopwatch_control', { roomCode, action: 'reset', remainingTime: initialMs });
  };

  const clearResponses = () => {
    if (confirm('Clear all responses for this slide?')) {
      socketRef.current.emit('clear_responses', { roomCode });
      setVotingLocked(false);
      setQuizRunning(false);
      setQuizTimer(activeSlide.type === 'quiz' ? (activeSlide.timeLimit || 15) : 0);
    }
  };

  const startQuizTimer = () => {
    if (quizRunning) return;
    setCorrectRevealed(false);
    setQuizRunning(true);
    setVotingLocked(false);
    socketRef.current.emit('toggle_lock', { roomCode, locked: false });

    timerIntervalRef.current = setInterval(() => {
      setQuizTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          setQuizRunning(false);
          setVotingLocked(true);
          socketRef.current.emit('toggle_lock', { roomCode, locked: true });
          setCorrectRevealed(true);
          playSynthSound('success');

          // Trigger Winner Trophy Celebration Modal
          const activeSlide = slides[currentSlideIndex];
          const hasCorrect = activeSlide && (activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0);
          if (hasCorrect && (activeSlide.type === 'poll' || activeSlide.type === 'quiz')) {
            setShowWinnerCelebration(true);
            setConfettiActive(true);
            setTimeout(() => setConfettiActive(false), 5000);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAnswerQuestion = (qId) => {
    socketRef.current.emit('answer_question', { roomCode, questionId: qId });
  };

  if (!presentation || !roomCode) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <PresIcon size={48} className="logo-icon" style={{ animation: 'spin 2s linear infinite' }} />
        <h2>Launching Presentation Room...</h2>
      </div>
    );
  }

  const activeSlide = slides[currentSlideIndex];
  const joinUrl = `${window.location.protocol}//${window.location.host}/join?code=${roomCode}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`;

  // --- STATS COMPILERS FOR VISUALIZATIONS ---

  // 1. Scales Calculator
  const getScalesAverages = () => {
    const responses = activeSlide.responses || [];
    const averages = {};
    activeSlide.options?.forEach(opt => {
      averages[opt.id] = 0;
    });

    if (responses.length === 0) return averages;

    responses.forEach(r => {
      if (r.ratings) {
        Object.entries(r.ratings).forEach(([optId, val]) => {
          averages[optId] = (averages[optId] || 0) + Number(val);
        });
      }
    });

    Object.keys(averages).forEach(optId => {
      averages[optId] = (averages[optId] / responses.length).toFixed(1);
    });
    return averages;
  };

  // 2. Ranking Calculator (Weighted Borda Count)
  const getRankingResults = () => {
    const responses = activeSlide.responses || [];
    const itemScores = {};
    const optionMap = {};
    activeSlide.options?.forEach(opt => {
      itemScores[opt.id] = 0;
      optionMap[opt.id] = opt.text;
    });

    if (responses.length === 0) {
      return activeSlide.options?.map(o => ({ id: o.id, text: o.text, score: 0 })) || [];
    }

    const n = activeSlide.options?.length || 0;
    responses.forEach(r => {
      if (Array.isArray(r.ranking)) {
        r.ranking.forEach((itemId, idx) => {
          // 1st gets n points, 2nd gets n-1 points, etc.
          const pts = n - idx;
          itemScores[itemId] = (itemScores[itemId] || 0) + pts;
        });
      }
    });

    // Compile & Sort
    const compiled = Object.entries(itemScores).map(([id, score]) => ({
      id,
      text: optionMap[id],
      score: (score / responses.length).toFixed(1)
    }));

    return compiled.sort((a, b) => b.score - a.score);
  };

  // 3. Guess Number Calculator
  const getGuessStats = () => {
    const responses = activeSlide.responses || [];
    if (responses.length === 0) return { avg: 0, min: 0, max: 0, closest: null };

    const guesses = responses.map(r => Number(r.guess)).filter(g => !isNaN(g));
    const avg = guesses.reduce((a,b) => a+b, 0) / guesses.length;
    const min = Math.min(...guesses);
    const max = Math.max(...guesses);

    let closest = null;
    if (activeSlide.correctNumber !== undefined) {
      let minDiff = Infinity;
      responses.forEach(r => {
        const diff = Math.abs(Number(r.guess) - Number(activeSlide.correctNumber));
        if (diff < minDiff) {
          minDiff = diff;
          closest = { nickname: r.nickname, guess: r.guess };
        }
      });
    }

    return { avg: avg.toFixed(1), min, max, closest };
  };

  // 4. 100 Points Calculator
  const getPointsAverages = () => {
    const responses = activeSlide.responses || [];
    const averages = {};
    activeSlide.options?.forEach(opt => {
      averages[opt.id] = 0;
    });

    if (responses.length === 0) return averages;

    responses.forEach(r => {
      if (r.points) {
        Object.entries(r.points).forEach(([optId, val]) => {
          averages[optId] = (averages[optId] || 0) + Number(val);
        });
      }
    });

    Object.keys(averages).forEach(optId => {
      averages[optId] = (averages[optId] / responses.length).toFixed(1);
    });
    return averages;
  };

  // 5. 2x2 Grid Calculator
  const getGridAverages = () => {
    const responses = activeSlide.responses || [];
    const averages = {};
    activeSlide.options?.forEach(opt => {
      averages[opt.id] = { x: 5, y: 5 }; // default center
    });

    if (responses.length === 0) return averages;

    activeSlide.options?.forEach(opt => {
      let totalX = 0, totalY = 0;
      let count = 0;
      responses.forEach(r => {
        if (r.grid && r.grid[opt.id]) {
          totalX += Number(r.grid[opt.id].x);
          totalY += Number(r.grid[opt.id].y);
          count++;
        }
      });

      if (count > 0) {
        averages[opt.id] = {
          x: (totalX / count).toFixed(1),
          y: (totalY / count).toFixed(1)
        };
      }
    });

    return averages;
  };

  const getConicGradient = (options, responses) => {
    const total = Object.values(responses).reduce((a, b) => a + Number(b || 0), 0);
    if (total === 0) return 'rgba(255,255,255,0.05)';
    const colors = OPTION_COLORS;
    let currentPct = 0;
    const parts = [];
    options.forEach((opt, idx) => {
      const votes = responses[opt.id] || 0;
      const pct = (votes / total) * 100;
      if (pct > 0) {
        const start = currentPct.toFixed(1);
        const end = (currentPct + pct).toFixed(1);
        currentPct += pct;
        parts.push(`${colors[idx % colors.length]} ${start}% ${end}%`);
      }
    });
    return parts.length > 0 ? `conic-gradient(${parts.join(', ')})` : 'rgba(255,255,255,0.05)';
  };

  const getConicGradientForDataList = (dataList) => {
    const total = dataList.reduce((a, b) => a + Number(b.score || 0), 0);
    if (total === 0) return 'rgba(255,255,255,0.05)';
    const colors = OPTION_COLORS;
    let currentPct = 0;
    const parts = [];
    dataList.forEach((item, idx) => {
      const val = Number(item.score);
      const pct = (val / total) * 100;
      if (pct > 0) {
        const start = currentPct.toFixed(1);
        const end = (currentPct + pct).toFixed(1);
        currentPct += pct;
        parts.push(`${colors[idx % colors.length]} ${start}% ${end}%`);
      }
    });
    return parts.length > 0 ? `conic-gradient(${parts.join(', ')})` : 'rgba(255,255,255,0.05)';
  };

  const renderSliceLabels = (options, responses) => {
    const total = Object.values(responses).reduce((a, b) => a + Number(b || 0), 0);
    if (total === 0) return null;
    
    let currentPct = 0;
    const labels = [];
    
    options.forEach((opt, idx) => {
      const votes = responses[opt.id] || 0;
      const pct = (votes / total) * 100;
      if (pct > 0) {
        const startPct = currentPct;
        const endPct = currentPct + pct;
        currentPct += pct;
        
        // Calculate middle percentage and angle (0% conic is at top, so offset -90 deg)
        const midPct = (startPct + endPct) / 2;
        const angleRad = (midPct * 3.6 - 90) * Math.PI / 180;
        
        // Radius: pie gets 28% and doughnut gets 36%
        const r = pollVizMode === 'doughnut' ? 36 : 28; 
        
        const x = 50 + r * Math.cos(angleRad);
        const y = 50 + r * Math.sin(angleRad);
        
        labels.push(
          <div
            key={opt.id}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '0.85rem',
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '2px 6px',
              borderRadius: '10px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            {votes}
          </div>
        );
      }
    });
    
    return labels;
  };

  // Compile calculations
  const scalesAverages = activeSlide.type === 'scales' ? getScalesAverages() : {};
  const rankingResults = activeSlide.type === 'ranking' ? getRankingResults() : [];
  const guessStats = activeSlide.type === 'guess' ? getGuessStats() : {};
  const pointsAverages = activeSlide.type === 'points' ? getPointsAverages() : {};
  const gridAverages = activeSlide.type === 'grid' ? getGridAverages() : {};

  const getAnsweredCount = () => {
    if (!activeSlide || !activeSlide.responses) return 0;
    if (Array.isArray(activeSlide.responses)) return activeSlide.responses.length;
    if (typeof activeSlide.responses === 'object') {
      return Object.values(activeSlide.responses).reduce((sum, val) => {
        if (typeof val === 'number') return sum + val;
        if (Array.isArray(val)) return sum + val.length;
        return sum + 1;
      }, 0);
    }
    return 0;
  };
  const answeredCount = getAnsweredCount();

  return (
    <div 
      className={`presenter-viewport theme-${theme}`}
      style={{
        backgroundImage: activeSlide?.bgImage ? `linear-gradient(rgba(11, 15, 25, 0.65), rgba(11, 15, 25, 0.85)), url(${activeSlide.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* 🚀 FUTURE MINDS ESPORTS CYBER ARENA LIVE HUD VIEW */}
      {(theme === 'future-minds' || isEsportsArenaMode) && (
        <div className="theme-future-minds animate-fade" style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: '#030712',
          backgroundImage: `radial-gradient(at 50% 0%, rgba(0, 240, 255, 0.18) 0px, transparent 65%), radial-gradient(at 100% 100%, rgba(255, 183, 0, 0.15) 0px, transparent 65%), linear-gradient(rgba(3, 7, 18, 0.88), rgba(3, 7, 18, 0.96)), url(${activeSlide.bgImage || '/assets/theme_cyber_neon.jpg'})`,
          backgroundSize: 'cover', backgroundPosition: 'center', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto'
        }}>
          {/* TOP HEADER HUD BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid rgba(0, 240, 255, 0.3)', paddingBottom: '16px', flexWrap: 'wrap', gap: '15px' }}>
            
            {/* Left Title & Round info */}
            <div>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', letterSpacing: '1.5px', background: 'linear-gradient(135deg, #00f0ff, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '10px' }}>
                FUTURE MINDS CHALLENGE <span style={{ color: '#ffb700', WebkitTextFillColor: '#ffb700', fontSize: '1.1rem', padding: '2px 10px', background: 'rgba(255,183,0,0.15)', border: '1px solid #ffb700', borderRadius: '6px' }}>LIVE</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 800, marginTop: '4px', letterSpacing: '1px' }}>
                SEASON 3 | ROUND 4 • <span style={{ color: '#00f0ff' }}>SPECTATORS: 15,482</span> • <span style={{ color: '#34d399' }}>{participantsCount} SCANNED</span>
              </div>
            </div>

            {/* Center Circular Concentric Neon SVG Timer Gauge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <div className="cyber-timer-ring" style={{
                width: '115px', height: '115px', borderRadius: '50%', border: '4px solid #00f0ff',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.6), inset 0 0 20px rgba(0, 240, 255, 0.4)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 15, 30, 0.9)'
              }}>
                <span style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '1px' }}>TIME REMAINING:</span>
                <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff', fontFamily: 'monospace', textShadow: '0 0 10px #00f0ff' }}>
                  00:{quizTimer > 0 ? quizTimer.toString().padStart(2, '0') : '15'}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }}></span> LIVE
                </span>
              </div>
            </div>

            {/* Right Multiplier & User Gold Profile Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                padding: '10px 20px', background: 'linear-gradient(135deg, rgba(255, 183, 0, 0.22), rgba(255, 140, 0, 0.12))',
                border: '1.5px solid #ffb700', borderRadius: '14px', textAlign: 'center', boxShadow: '0 0 25px rgba(255, 183, 0, 0.35)'
              }}>
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#ffb700', lineHeight: 1 }}>4x</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px' }}>POINTS MULTIPLIER</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>STREAK: +200%</div>
              </div>

              <div style={{
                padding: '10px 16px', background: 'rgba(10, 25, 48, 0.9)', border: '1px solid rgba(0, 240, 255, 0.4)',
                borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f0ff, #9d4edf)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 12px rgba(0,240,255,0.5)' }}>
                  🧙‍♂️
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff' }}>CYBER_RAVEN</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffb700' }}>💰 1,250 G</div>
                </div>
                <button 
                  onClick={() => setIsEsportsArenaMode(false)} 
                  title="Toggle Standard Mode" 
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', cursor: 'pointer', marginLeft: '6px', borderRadius: '8px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 800 }}
                >
                  Exit HUD ✕
                </button>
              </div>
            </div>
          </div>

          {/* MAIN ARENA SPLIT (2 COLUMNS) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '28px', flex: 1, alignItems: 'stretch' }}>
            
            {/* Left Column: Slanted Question Card & Choice Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', justifyContent: 'space-between' }}>
              
              {/* Question Banner */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(10, 25, 50, 0.92), rgba(5, 12, 25, 0.96))',
                border: '1.5px solid #00f0ff', borderRadius: '18px', padding: '28px 34px', textAlign: 'center',
                boxShadow: '0 0 40px rgba(0, 240, 255, 0.28)', clipPath: 'polygon(22px 0%, calc(100% - 22px) 0%, 100% 50%, calc(100% - 22px) 100%, 22px 100%, 0% 50%)'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.5px', margin: 0, textTransform: 'uppercase', lineHeight: 1.4 }}>
                  {activeSlide.question || 'WHICH EXOPLANET HAS A THIN ATMOSPHERE OF METHANE AND ARGON?'}
                </h2>
              </div>

              {/* Slanted Hexagonal Choice Buttons (2x2 Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                {(activeSlide.options || [
                  { id: 'opt-a', text: 'PROXIMA B' },
                  { id: 'opt-b', text: 'KEPLER-1649c' },
                  { id: 'opt-c', text: 'TRAPPIST-1d' },
                  { id: 'opt-d', text: 'LTT 1445Ab' }
                ]).map((opt, oIdx) => {
                  const label = String.fromCharCode(65 + oIdx);
                  const responses = activeSlide.responses || {};
                  const votes = typeof responses === 'object' && !Array.isArray(responses) ? (responses[opt.id] || 0) : 0;
                  
                  return (
                    <button 
                      key={opt.id || oIdx}
                      className="cyber-option-btn"
                      onClick={() => {
                        playClickSound();
                        playMultiplierSound();
                        handleVote(opt.id);
                      }}
                      onMouseEnter={() => playHoverSound()}
                    >
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#00f0ff' }}>{label}.</span>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{opt.text}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffb700', padding: '3px 10px', background: 'rgba(255,183,0,0.15)', borderRadius: '6px' }}>{votes} votes</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom XP Score & Live Chat Ticker */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(10,25,48,0.85)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(0, 240, 255, 0.4)', boxShadow: '0 0 20px rgba(0,240,255,0.15)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #00f0ff', background: 'rgba(0,240,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    🧙‍♂️
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff' }}>
                      YOUR SCORE: <span style={{ color: '#ffb700', fontSize: '1.15rem' }}>24,900</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#00f0ff' }}>LEVEL 20</div>
                  </div>
                </div>

                <div style={{ flex: 1, background: 'rgba(5, 12, 25, 0.9)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '14px', padding: '10px 16px', fontSize: '0.82rem', color: '#94a3b8' }}>
                  <span style={{ fontWeight: 900, color: '#00f0ff' }}>Chat: </span>
                  <span style={{ color: '#ffb700', fontWeight: 800 }}>NEON_WITCH:</span> "Close race!" • <span style={{ color: '#ffb700', fontWeight: 800 }}>VOID_WALKER:</span> "Wow, only 15s!"
                </div>
              </div>
            </div>

            {/* Right Column: 3D Holographic Live Rankings Podium & Top 8 Standings */}
            <div style={{ padding: '24px', borderRadius: '22px', background: 'rgba(7, 14, 28, 0.88)', border: '1.5px solid rgba(0, 240, 255, 0.4)', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 0 40px rgba(0, 240, 255, 0.15)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, textAlign: 'center', color: '#00f0ff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                LIVE RANKINGS
              </div>

              {/* 3D Gold/Silver/Bronze Cylinder Podium */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px', height: '185px', paddingBottom: '10px', borderBottom: '1px solid rgba(0, 240, 255, 0.2)' }}>
                {/* 2nd Silver Left */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #cbd5e1', background: 'rgba(203, 213, 225, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', fontSize: '1.2rem' }}>👤</div>
                  <div style={{ height: '95px', width: '100%', background: 'linear-gradient(180deg, rgba(203,213,225,0.4), rgba(148,163,184,0.1))', border: '1px solid #cbd5e1', borderRadius: '10px 10px 0 0', textAlign: 'center', padding: '6px 2px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#cbd5e1' }}>#2</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>STAR_GAZER</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>42,100 pts</div>
                  </div>
                </div>

                {/* 1st Gold Center */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '36%' }}>
                  <div style={{ fontSize: '1.2rem', color: '#ffb700', marginBottom: '2px' }}>👑</div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2.5px solid #ffb700', background: 'rgba(255, 183, 0, 0.25)', boxShadow: '0 0 20px rgba(255, 183, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', fontSize: '1.4rem' }}>🧙‍♂️</div>
                  <div style={{ height: '125px', width: '100%', background: 'linear-gradient(180deg, rgba(255,183,0,0.5), rgba(217,119,6,0.15))', border: '1.5px solid #ffb700', borderRadius: '12px 12px 0 0', textAlign: 'center', padding: '8px 2px', boxShadow: '0 0 25px rgba(255, 183, 0, 0.35)' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffb700' }}>#1</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>CYBER_RAVEN</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffb700' }}>48,750 pts</div>
                  </div>
                </div>

                {/* 3rd Bronze Right */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #b45309', background: 'rgba(180, 83, 9, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px', fontSize: '1.2rem' }}>👩</div>
                  <div style={{ height: '80px', width: '100%', background: 'linear-gradient(180deg, rgba(180,83,9,0.4), rgba(120,53,15,0.1))', border: '1px solid #b45309', borderRadius: '10px 10px 0 0', textAlign: 'center', padding: '6px 2px' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#f59e0b' }}>#3</div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>NEON_WITCH</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>39,400 pts</div>
                  </div>
                </div>
              </div>

              {/* Top 8 Standings List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { rank: 4, name: 'VOID_WALKER', score: 36250, delta: '+15', avatar: '👾' },
                  { rank: 5, name: 'QUANTUM_LEAP', score: 33800, delta: '+20', avatar: '🔬' },
                  { rank: 6, name: 'PIXEL_DUST', score: 31500, delta: '+40', avatar: '⚡' },
                  { rank: 7, name: 'ORBIT_SCOUT', score: 29100, delta: '+25', avatar: '🛸' },
                  { rank: 8, name: 'DATA_STREAK', score: 27650, delta: '+50', avatar: '💻' }
                ].map(r => (
                  <div key={r.rank} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0, 240, 255, 0.18)', borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#00f0ff', width: '22px' }}>#{r.rank}</span>
                      <span style={{ fontSize: '0.95rem' }}>{r.avatar}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>{r.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#ffb700' }}>{r.score.toLocaleString()}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399' }}>{r.delta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="ambient-bg">
        <div className="ambient-circle circle-1"></div>
        <div className="ambient-circle circle-2"></div>
      </div>

      {/* Header controls & instructions */}
      <div className="presenter-header animate-fade">
        <div className="presenter-branding">
          <button className="btn btn-secondary" onClick={onBack} style={{ gap: '6px' }}>
            <ArrowLeft size={16} /> Exit
          </button>
          <select 
            value={theme} 
            onChange={(e) => handleThemeChange(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '0.85rem', width: '150px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }}
          >
            <option value="future-minds">🚀 Future Minds Cyber Arena</option>
            <option value="cyber-neon">🌌 Cyber Neon Art</option>
            <option value="midnight-gold">👑 Midnight Gold Art</option>
            <option value="cosmic-nebula">✨ Cosmic Nebula Art</option>
            <option value="playroom-magic">🎨 Playroom Magic Art</option>
            <option value="neon">Neon Eclipse</option>
            <option value="ocean">Ocean Breeze</option>
            <option value="sunset">Sunset Glow</option>
            <option value="light-luxe">Light Luxe</option>
            <option value="cyber-mint">Cyber Mint</option>
            <option value="classic-slate">Classic Slate</option>
            <option value="forest-sage">Forest Sage</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>

        <div className="join-instruction-card" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 14px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
          <img src={qrCodeUrl} alt="Join QR Code" className="qr-code-img" style={{ width: '32px', height: '32px', borderRadius: '6px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
            <span className="join-text" style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              SCAN OR JOIN AT: <strong style={{ color: '#ffffff', letterSpacing: '0.02em' }}>{window.location.host.toUpperCase()}/JOIN</strong>
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', letterSpacing: '0.05em' }}>
              CODE: {roomCode.slice(0,3)} {roomCode.slice(3)}
            </span>
          </div>
        </div>

        {/* Live Real-time Metrics & Timer Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Universal Time Limit display moved to Top Header Bar */}
          {quizTimer > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(15, 23, 42, 0.85)', padding: '5px 14px', borderRadius: '30px', border: '1px solid var(--border-glass)' }}>
              <span 
                className={quizRunning && quizTimer <= 5 ? "timer-warning-pulse" : ""}
                style={{ fontWeight: 800, fontSize: '0.9rem', color: quizTimer > 5 ? 'var(--text-primary)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ⏱️ {quizTimer}s
              </span>
              {!quizRunning && (
                <button className="btn btn-primary" style={{ padding: '3px 10px', fontSize: '0.78rem', borderRadius: '12px', background: 'var(--accent)', color: '#08211E', fontWeight: 700, border: 'none' }} onClick={startQuizTimer}>
                  Start Timer
                </button>
              )}
            </div>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(15, 23, 42, 0.85)',
            padding: '6px 16px', borderRadius: '30px', border: '1px solid var(--border-glass)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }} title="Scanned & Connected Participants">
              <Users size={16} color="#38bdf8" />
              <span>{participantsCount} Scanned</span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>|</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: '#34d399' }} title="Participants Who Submitted Answers">
              <CheckCircle2 size={16} color="#34d399" />
              <span>{answeredCount} Answered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Slide Visualization Body */}
      <div className="presenter-body" style={{ display: 'flex', gap: '20px', padding: '12px 30px', height: 'calc(100vh - 75px)', overflow: 'hidden' }}>
        
        {/* Left Area: Slide Content Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'hidden', paddingRight: '6px' }}>
          {confettiActive && (
          <div className="confetti-overlay">
            {Array.from({ length: 60 }).map((_, i) => {
              const left = Math.random() * 100;
              const size = 5 + Math.random() * 8;
              const delay = Math.random() * 1.5;
              const duration = 2 + Math.random() * 2;
              const color = OPTION_COLORS[Math.floor(Math.random() * OPTION_COLORS.length)];
              return (
                <div 
                  key={i} 
                  className="confetti-piece" 
                  style={{
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: color,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`
                  }}
                />
              );
            })}
          </div>
        )}
        <h1 className="presenter-question" style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.8rem)', marginBottom: '10px', lineHeight: 1.3, color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.95)', maxWidth: '900px', margin: '0 auto 10px auto' }}>{activeSlide.question}</h1>

        <div className="presenter-visualization">
          {!answersVisible ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <EyeOff size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h3>Results are hidden</h3>
              <p>Hover controls below to reveal results to the audience.</p>
            </div>
          ) : !isSlideAllowedForUser(activeSlide, user) ? (
            <div className="animate-fade" style={{
              padding: '36px 24px', background: 'var(--surface)', border: '2px solid var(--danger)',
              borderRadius: '20px', textAlign: 'center', maxWidth: '600px', margin: '30px auto',
              boxShadow: '0 10px 30px rgba(240, 101, 61, 0.2)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔒</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '8px' }}>
                Premium Feature Slide Locked
              </h2>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
                Slide Type: "{activeSlide.type?.toUpperCase()}"
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '20px' }}>
                Your active subscription plan has expired or does not include premium feature access for <strong>{activeSlide.type}</strong> slides. Standard multiple choice polls and basic quizzes in this deck remain playable. Upgrade your plan or redeem referral coins to present this slide!
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  className="btn btn-primary"
                  onClick={onBack}
                  style={{ background: 'var(--accent)', color: '#08211E', fontWeight: 600, border: 'none', padding: '10px 20px' }}
                >
                  Upgrade Subscription / Unlock
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Multiple Choice */}
              {activeSlide.type === 'poll' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', position: 'relative', height: '100%', justifyContent: 'center' }}>
                  {/* Vertical Icon-Only Sidebar Dock (📊 🥧 🍩 ⚽) */}
                  <div style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10,
                    background: 'rgba(15, 23, 42, 0.85)', padding: '6px', borderRadius: '14px',
                    border: '1px solid var(--border-glass)', boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
                  }}>
                    <button 
                      className={`btn ${pollVizMode === 'bar' ? 'active' : ''}`} 
                      onClick={() => setPollVizMode('bar')}
                      title="Bar Chart"
                      style={{ padding: '6px', borderRadius: '10px', minWidth: 'unset', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: pollVizMode === 'bar' ? 'var(--accent)' : 'transparent', color: pollVizMode === 'bar' ? '#08211E' : 'var(--text-primary)', border: 'none' }}
                    >
                      <BarChart3 size={18} />
                    </button>
                    <button 
                      className={`btn ${pollVizMode === 'pie' ? 'active' : ''}`} 
                      onClick={() => setPollVizMode('pie')}
                      title="Pie Chart"
                      style={{ padding: '6px', borderRadius: '10px', minWidth: 'unset', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: pollVizMode === 'pie' ? 'var(--accent)' : 'transparent', color: pollVizMode === 'pie' ? '#08211E' : 'var(--text-primary)', border: 'none' }}
                    >
                      <PieChart size={18} />
                    </button>
                    <button 
                      className={`btn ${pollVizMode === 'doughnut' ? 'active' : ''}`} 
                      onClick={() => setPollVizMode('doughnut')}
                      title="Doughnut Chart"
                      style={{ padding: '6px', borderRadius: '10px', minWidth: 'unset', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: pollVizMode === 'doughnut' ? 'var(--accent)' : 'transparent', color: pollVizMode === 'doughnut' ? '#08211E' : 'var(--text-primary)', border: 'none' }}
                    >
                      <CircleDot size={18} />
                    </button>
                    <button 
                      className={`btn ${pollVizMode === 'density' ? 'active' : ''}`} 
                      onClick={() => setPollVizMode('density')}
                      title="Ball Density Mode"
                      style={{ padding: '6px', borderRadius: '10px', minWidth: 'unset', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: pollVizMode === 'density' ? 'var(--accent)' : 'transparent', color: pollVizMode === 'density' ? '#08211E' : 'var(--text-primary)', border: 'none' }}
                    >
                      <Activity size={18} />
                    </button>
                    <button 
                      className={`btn ${pollVizMode === 'runner' ? 'active' : ''}`} 
                      onClick={() => setPollVizMode('runner')}
                      title="Horizontal Runner Race Mode"
                      style={{ padding: '6px', borderRadius: '10px', minWidth: 'unset', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: pollVizMode === 'runner' ? 'var(--accent)' : 'transparent', color: pollVizMode === 'runner' ? '#08211E' : 'var(--text-primary)', border: 'none' }}
                    >
                      <Flame size={18} />
                    </button>
                  </div>

                  {/* Render based on mode */}
                  {pollVizMode === 'bar' && (
                    <div className="bar-chart-container animate-fade" style={{ height: 'calc(100vh - 220px)', minHeight: '320px', width: '100%', maxWidth: '920px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '24px', paddingBottom: '20px' }}>
                      {activeSlide.options?.map((opt, idx) => {
                        const responses = activeSlide.responses || {};
                        const votes = responses[opt.id] || 0;
                        const totalVotes = Object.values(responses).reduce((a, b) => a + b, 0);
                        const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                        
                        const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                        const isCorrect = (activeSlide.correctAnswerIndices || []).includes(idx) || idx === activeSlide.correctAnswerIndex;
                        const hasCorrect = activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0;
                        const isIncorrect = correctRevealed && hasCorrect && !isCorrect;

                        return (
                          <div 
                            key={opt.id} 
                            className={`chart-bar-wrapper ${isCorrect && correctRevealed ? 'correct-answer' : ''} ${isIncorrect ? 'incorrect-answer' : ''}`}
                            style={{ position: 'relative' }}
                          >
                            {isCorrect && correctRevealed && (
                              <div className="correct-indicator-checkmark">😊</div>
                            )}
                            <div 
                              className="chart-bar" 
                              style={{ 
                                height: `${Math.max(percent, 2)}%`,
                                backgroundColor: color
                              }}
                            >
                              <span className="chart-bar-value">{votes}</span>
                            </div>
                            <span className="chart-bar-label">
                              {!/^\p{Emoji}/u.test(opt.text || '') && opt.emoji && <span style={{ marginRight: '6px' }}>{opt.emoji}</span>}
                              {opt.text}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(pollVizMode === 'pie' || pollVizMode === 'doughnut') && (
                    <div className="conic-chart-wrapper animate-fade">
                      <div 
                        className="conic-chart" 
                        style={{ background: getConicGradient(activeSlide.options || [], activeSlide.responses || {}) }}
                      >
                        {renderSliceLabels(activeSlide.options || [], activeSlide.responses || {})}
                        {pollVizMode === 'doughnut' && (
                          <div className="doughnut-mask">
                            {Object.values(activeSlide.responses || {}).reduce((a,b) => a+b, 0)} votes
                          </div>
                        )}
                      </div>
                      
                      {/* Legend */}
                      <div className="chart-legend">
                        {activeSlide.options?.map((opt, idx) => {
                          const votes = (activeSlide.responses || {})[opt.id] || 0;
                          const total = Object.values(activeSlide.responses || {}).reduce((a,b) => a+b, 0);
                          const percent = total > 0 ? ((votes / total) * 100).toFixed(0) : 0;
                          const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                          
                          const isCorrect = (activeSlide.correctAnswerIndices || []).includes(idx) || idx === activeSlide.correctAnswerIndex;
                          const hasCorrect = activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0;
                          const isIncorrect = correctRevealed && hasCorrect && !isCorrect;

                          const textStr = opt.text || '';
                          const hasLeadingEmoji = /^\p{Emoji}/u.test(textStr);
                          return (
                            <div key={opt.id} className={`legend-item ${isIncorrect ? 'incorrect-answer' : ''}`}>
                              <div className="legend-color-box" style={{ backgroundColor: color }}></div>
                              <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {!hasLeadingEmoji && opt.emoji && <span style={{ marginRight: '6px' }}>{opt.emoji}</span>}
                                {textStr} ({votes} / {percent}%) {isCorrect && correctRevealed && '✓'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {pollVizMode === 'density' && (
                    <div className="density-grid animate-fade">
                      {activeSlide.options?.map((opt, optIdx) => {
                        const responses = activeSlide.responses || {};
                        const votes = responses[opt.id] || 0;
                        
                        const isCorrect = (activeSlide.correctAnswerIndices || []).includes(optIdx) || optIdx === activeSlide.correctAnswerIndex;
                        const hasCorrect = activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0;
                        const isIncorrect = correctRevealed && hasCorrect && !isCorrect;
                        
                        return (
                          <div 
                            key={opt.id} 
                            className={`density-column ${isIncorrect ? 'incorrect-answer' : ''}`}
                            style={{ position: 'relative' }}
                          >
                            {isCorrect && correctRevealed && (
                              <div className="correct-indicator-checkmark" style={{ top: '-40px' }}>😊</div>
                            )}
                            <div className="density-count-badge">{votes}</div>
                            <div className="density-jar-neck"></div>
                            <div className="density-pit">
                              <BeakerCanvas 
                                votes={votes} 
                                color={OPTION_COLORS[optIdx % OPTION_COLORS.length]} 
                              />
                            </div>
                            <div className="density-label">
                              <span style={{ marginRight: '4px' }}>{opt.emoji || '🚀'}</span>
                              {opt.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {pollVizMode === 'runner' && (
                    <div className="animate-fade" style={{ width: '100%', maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', padding: '10px 0' }}>
                      {activeSlide.options?.map((opt, idx) => {
                        const responses = activeSlide.responses || {};
                        const votes = responses[opt.id] || 0;
                        const totalVotes = Object.values(responses).reduce((a, b) => a + b, 0);
                        const percent = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                        const color = OPTION_COLORS[idx % OPTION_COLORS.length];

                        const isCorrect = (activeSlide.correctAnswerIndices || []).includes(idx) || idx === activeSlide.correctAnswerIndex;
                        const hasCorrect = activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0;
                        const isIncorrect = correctRevealed && hasCorrect && !isCorrect;

                        const textStr = opt.text || '';
                        const hasLeadingEmoji = /^\p{Emoji}/u.test(textStr);

                        return (
                          <div key={opt.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', background: 'rgba(15, 23, 42, 0.6)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--border-soft)' }}>
                            {/* Track Header (Option Name + Vote Stats) */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {!hasLeadingEmoji && opt.emoji && <span>{opt.emoji}</span>}
                                <span>{textStr}</span>
                                {isCorrect && correctRevealed && <span style={{ color: '#10b981', marginLeft: '6px' }}>✓ Correct</span>}
                              </span>
                              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: color }}>
                                {votes} votes ({percent.toFixed(0)}%)
                              </span>
                            </div>

                            {/* Race Track Container */}
                            <div style={{ position: 'relative', height: '26px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '14px', overflow: 'visible', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', padding: '0 4px' }}>
                              {/* Animated Progress Bar Fill */}
                              <div style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                width: `${Math.max(percent, 0)}%`,
                                background: `linear-gradient(90deg, ${color}cc, ${color})`,
                                borderRadius: '14px',
                                transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: `0 0 12px ${color}88`
                              }} />

                              {/* Finish Line Flag Marker on Far Right */}
                              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', zIndex: 2, opacity: 0.8 }} title="Finish Line">
                                🏁
                              </div>

                              {/* Animated Runner Avatar Clip */}
                              <div 
                                style={{
                                  position: 'absolute',
                                  left: `calc(${Math.max(percent, 0)}% - 16px)`,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  zIndex: 5,
                                  transition: 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <div 
                                  className={percent > 0 ? "runner-sprint-animation" : ""}
                                  style={{
                                    fontSize: '1.4rem',
                                    filter: `drop-shadow(0 2px 8px ${color})`,
                                    transform: 'scaleX(1)'
                                  }}
                                >
                                  🏃‍♂️
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Word Cloud */}
              {activeSlide.type === 'wordcloud' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '30px' }}>
                  {(() => {
                    const raw = activeSlide.responses;
                    let entries = [];
                    if (Array.isArray(raw)) {
                      const freq = {};
                      raw.forEach(item => {
                        let word = typeof item === 'string' ? item : item?.text || item?.word || '';
                        word = word.trim();
                        if (word) freq[word] = (freq[word] || 0) + 1;
                      });
                      entries = Object.entries(freq).map(([text, count]) => ({ text, weight: count }));
                    } else if (raw && typeof raw === 'object') {
                      entries = Object.entries(raw).map(([text, count]) => ({ text, weight: Number(count) || 1 }));
                    } else if (typeof raw === 'string' && raw.trim()) {
                      entries = [{ text: raw.trim(), weight: 1 }];
                    }

                    if (entries.length === 0) {
                      return (
                        <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, fontStyle: 'italic', textAlign: 'center' }}>
                          ☁️ Waiting for live audience word submissions...
                        </div>
                      );
                    }

                    const colors = [
                      '#38bdf8', '#f43f5e', '#10b981', '#fbbf24', 
                      '#a855f7', '#ec4899', '#06b6d4', '#f97316', 
                      '#34d399', '#c084fc', '#e11d48', '#0284c7'
                    ];

                    return entries.map((word, i) => {
                      const fontSize = Math.min(3.8, Math.max(1.5, 1.4 + word.weight * 0.5));
                      const color = colors[i % colors.length];
                      return (
                        <span
                          key={word.text}
                          className="cloud-word animate-pulse"
                          style={{
                            fontSize: `${fontSize}rem`,
                            color: color,
                            fontWeight: 700,
                            padding: '6px 14px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: `1px solid ${color}33`,
                            boxShadow: `0 4px 20px ${color}22`,
                            textShadow: `0 0 12px ${color}66`,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            userSelect: 'none',
                            display: 'inline-block'
                          }}
                        >
                          {word.text}
                        </span>
                      );
                    });
                  })()}
                </div>
              )}

              {/* 3. Open Ended */}
              {activeSlide.type === 'openended' && (
                <div className="open-ended-grid">
                  {(activeSlide.responses || []).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', margin: 'auto' }}>Waiting for submissions...</div>
                  ) : (
                    activeSlide.responses.map((text, idx) => (
                      <div key={idx} className="open-ended-card">
                        {text}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 4. Scales */}
              {activeSlide.type === 'scales' && (
                <div className="scales-container animate-fade">
                  {activeSlide.options?.map((opt) => {
                    const avg = scalesAverages[opt.id] || 1;
                    const percent = ((avg - 1) / 4) * 100; // Map 1-5 scale to 0-100%
                    return (
                      <div key={opt.id} className="scale-result-row">
                        <div className="scale-label-container">
                          <span>{opt.text}</span>
                          <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{avg} / 5</span>
                        </div>
                        <div className="scale-track">
                          <div className="scale-average-bubble" style={{ left: `${percent}%` }}>
                            {avg}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(activeSlide.responses || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No responses yet</div>
                  )}
                </div>
              )}

              {/* 5. Ranking */}
              {activeSlide.type === 'ranking' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                  <div className="viz-toggle-bar" style={{ alignSelf: 'flex-start' }}>
                    <button className={`viz-toggle-btn ${pollVizMode === 'bar' ? 'active' : ''}`} onClick={() => setPollVizMode('bar')}>Bar</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'pie' ? 'active' : ''}`} onClick={() => setPollVizMode('pie')}>Pie</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'doughnut' ? 'active' : ''}`} onClick={() => setPollVizMode('doughnut')}>Doughnut</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'density' ? 'active' : ''}`} onClick={() => setPollVizMode('density')}>Ball Density</button>
                  </div>

                  {pollVizMode === 'bar' && (
                    <div className="horizontal-bars-container animate-fade">
                      {rankingResults.map((item, idx) => {
                        const maxPossibleScore = activeSlide.options?.length || 0;
                        const percent = (item.score / maxPossibleScore) * 100;
                        return (
                          <div key={item.id} className="horizontal-bar-row">
                            <div className="horizontal-bar-label">{idx + 1}. {item.text}</div>
                            <div className="horizontal-bar-track">
                              <div className="horizontal-bar-fill" style={{ width: `${percent}%` }}></div>
                            </div>
                            <div className="horizontal-bar-value">{item.score}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(pollVizMode === 'pie' || pollVizMode === 'doughnut') && (
                    <div className="conic-chart-wrapper animate-fade">
                      <div 
                        className="conic-chart" 
                        style={{ background: getConicGradientForDataList(rankingResults) }}
                      >
                        {pollVizMode === 'doughnut' && (
                          <div className="doughnut-mask">
                            {rankingResults.reduce((a,b) => a + Number(b.score || 0), 0)} pts
                          </div>
                        )}
                      </div>
                      
                      <div className="chart-legend">
                        {rankingResults.map((item, idx) => {
                          const total = rankingResults.reduce((a,b) => a + Number(b.score || 0), 0);
                          const percent = total > 0 ? ((item.score / total) * 100).toFixed(0) : 0;
                          const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#38bdf8', '#fb7185'];
                          return (
                            <div key={item.id} className="legend-item">
                              <div className="legend-color-box" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                              <span>{item.text} ({item.score} / {percent}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {pollVizMode === 'density' && (
                    <div className="density-grid animate-fade">
                      {rankingResults.map((item, optIdx) => {
                        const balls = [];
                        const ballsToRender = Math.min(Math.round(item.score * 3), 25);
                        for (let i = 0; i < ballsToRender; i++) {
                          const hashSize = Math.sin((optIdx + 1) * (i + 1) * 31.4) * 0.5 + 0.5;
                          const hashX = Math.cos((optIdx + 2) * (i + 2) * 45.8) * 0.5 + 0.5;
                          const hashY = Math.sin((optIdx + 3) * (i + 3) * 62.1) * 0.5 + 0.5;
                          const hashSpeed = Math.cos((optIdx + 4) * (i + 4) * 19.3) * 0.5 + 0.5;
                          const hashDelay = Math.sin((optIdx + 5) * (i + 5) * 87.2) * 0.5 + 0.5;
                          
                          const ballSize = Math.round(16 + hashSize * 10);
                          const leftPos = Math.round(10 + hashX * 65);
                          const bottomPos = Math.round(10 + hashY * 65);
                          const duration = (6 + hashSpeed * 4).toFixed(1);
                          const delay = (hashDelay * -8).toFixed(1);
                          
                          const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#38bdf8', '#fb7185'];
                          const color = colors[optIdx % colors.length];
                          
                          balls.push(
                            <div 
                              key={i} 
                              className="density-ball"
                              style={{ 
                                width: `${ballSize}px`,
                                height: `${ballSize}px`,
                                '--ball-base-bottom': `${bottomPos}%`,
                                '--ball-base-left': `${leftPos}%`,
                                '--ball-anim-duration': `${duration}s`,
                                '--ball-anim-delay': `${delay}s`,
                                '--ball-color': color
                              }}
                            />
                          );
                        }
                        return (
                          <div key={item.id} className="density-column">
                            <div className="density-count-badge">{item.score}</div>
                            <div className="density-pit">
                              {balls}
                            </div>
                            <div className="density-label">{item.text}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Q&A */}
              {activeSlide.type === 'qa' && (
                <div style={{ width: '100%' }}>
                  {(activeSlide.responses || []).length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No questions submitted yet.</div>
                  ) : (
                    <div className="qa-presenter-list">
                      {activeSlide.responses
                        .filter(q => !q.answered)
                        .sort((a, b) => b.upvotes - a.upvotes)
                        .map((q) => (
                          <div key={q.id} className="glass-card qa-presenter-card animate-fade">
                            <div className="qa-card-header">
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Anonymous</span>
                              <span className="qa-upvotes-pill">▲ {q.upvotes}</span>
                            </div>
                            <p className="qa-card-text">{q.text}</p>
                            <div className="qa-card-actions">
                              <button className="btn btn-secondary btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => handleAnswerQuestion(q.id)}>
                                <CheckCircle2 size={16} color="var(--accent-green)" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* 7. Guess the Number */}
              {activeSlide.type === 'guess' && (
                <div className="guess-stats-container animate-fade">
                  <div style={{ display: 'flex', gap: '30px' }}>
                    <div className="glass-card guess-metric-card">
                      <div className="guess-metric-value">{guessStats.avg || 0}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Average Guess</div>
                    </div>
                    {activeSlide.correctNumber !== undefined && (
                      <div className="glass-card guess-metric-card" style={{ borderColor: 'var(--accent-green)' }}>
                        <div className="guess-metric-value" style={{ color: 'var(--accent-green)' }}>{activeSlide.correctNumber}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Target Value</div>
                      </div>
                    )}
                  </div>
                  
                  {guessStats.closest && (
                    <div style={{ padding: '10px 20px', border: '1px solid var(--accent-amber)', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', fontWeight: 600 }}>
                      🎉 Closest guess: {guessStats.closest.guess} by "{guessStats.closest.nickname}"!
                    </div>
                  )}
                  
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Total Guesses: {(activeSlide.responses || []).length} (Range: {guessStats.min || 0} to {guessStats.max || 0})
                  </div>
                </div>
              )}

              {/* 8. 100 Points */}
              {activeSlide.type === 'points' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                  <div className="viz-toggle-bar" style={{ alignSelf: 'flex-start' }}>
                    <button className={`viz-toggle-btn ${pollVizMode === 'bar' ? 'active' : ''}`} onClick={() => setPollVizMode('bar')}>Bar</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'pie' ? 'active' : ''}`} onClick={() => setPollVizMode('pie')}>Pie</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'doughnut' ? 'active' : ''}`} onClick={() => setPollVizMode('doughnut')}>Doughnut</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'density' ? 'active' : ''}`} onClick={() => setPollVizMode('density')}>Ball Density</button>
                  </div>

                  {pollVizMode === 'bar' && (
                    <div className="horizontal-bars-container animate-fade">
                      {activeSlide.options?.map((opt) => {
                        const avg = pointsAverages[opt.id] || 0;
                        return (
                          <div key={opt.id} className="horizontal-bar-row">
                            <div className="horizontal-bar-label">
                              <span style={{ marginRight: '6px' }}>{opt.emoji || '🚀'}</span>
                              {opt.text}
                            </div>
                            <div className="horizontal-bar-track">
                              <div className="horizontal-bar-fill" style={{ width: `${avg}%` }}></div>
                            </div>
                            <div className="horizontal-bar-value">{avg} pts</div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(pollVizMode === 'pie' || pollVizMode === 'doughnut') && (
                    <div className="conic-chart-wrapper animate-fade">
                      <div 
                        className="conic-chart" 
                        style={{ 
                          background: getConicGradientForDataList(
                            activeSlide.options?.map(opt => ({
                              id: opt.id,
                              text: opt.text,
                              score: pointsAverages[opt.id] || 0
                            })) || []
                          ) 
                        }}
                      >
                        {pollVizMode === 'doughnut' && (
                          <div className="doughnut-mask">
                            {activeSlide.options?.reduce((sum, opt) => sum + (pointsAverages[opt.id] || 0), 0).toFixed(0)} pts
                          </div>
                        )}
                      </div>
                      
                      <div className="chart-legend">
                        {activeSlide.options?.map((opt, idx) => {
                          const avg = pointsAverages[opt.id] || 0;
                          const total = activeSlide.options?.reduce((sum, o) => sum + (pointsAverages[o.id] || 0), 0) || 1;
                          const percent = total > 0 ? ((avg / total) * 100).toFixed(0) : 0;
                          const colors = OPTION_COLORS;
                          return (
                            <div key={opt.id} className="legend-item">
                              <div className="legend-color-box" style={{ backgroundColor: colors[idx % colors.length] }}></div>
                              <span>
                                <span style={{ marginRight: '6px' }}>{opt.emoji || '🚀'}</span>
                                {opt.text} ({avg} pts / {percent}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {pollVizMode === 'density' && (
                    <div className="density-grid animate-fade">
                      {activeSlide.options?.map((opt, optIdx) => {
                        const avg = pointsAverages[opt.id] || 0;
                        const balls = [];
                        const ballsToRender = Math.min(Math.round(avg / 4), 25);
                        for (let i = 0; i < ballsToRender; i++) {
                          const hashSize = Math.sin((optIdx + 1) * (i + 1) * 31.4) * 0.5 + 0.5;
                          const hashX = Math.cos((optIdx + 2) * (i + 2) * 45.8) * 0.5 + 0.5;
                          const hashY = Math.sin((optIdx + 3) * (i + 3) * 62.1) * 0.5 + 0.5;
                          const hashSpeed = Math.cos((optIdx + 4) * (i + 4) * 19.3) * 0.5 + 0.5;
                          const hashDelay = Math.sin((optIdx + 5) * (i + 5) * 87.2) * 0.5 + 0.5;
                          
                          const ballSize = Math.round(16 + hashSize * 10);
                          const leftPos = Math.round(10 + hashX * 65);
                          const bottomPos = Math.round(10 + hashY * 65);
                          const duration = (6 + hashSpeed * 4).toFixed(1);
                          const delay = (hashDelay * -8).toFixed(1);
                          
                          const colors = OPTION_COLORS;
                          const color = colors[optIdx % colors.length];
                          
                          balls.push(
                            <div 
                              key={i} 
                              className="density-ball"
                              style={{ 
                                width: `${ballSize}px`,
                                height: `${ballSize}px`,
                                '--ball-base-bottom': `${bottomPos}%`,
                                '--ball-base-left': `${leftPos}%`,
                                '--ball-anim-duration': `${duration}s`,
                                '--ball-anim-delay': `${delay}s`,
                                '--ball-color': color
                              }}
                            />
                          );
                        }
                        return (
                          <div key={opt.id} className="density-column">
                            <div className="density-count-badge">{avg.toFixed(0)} pts</div>
                            <div className="density-pit">
                              {balls}
                            </div>
                            <div className="density-label">
                              <span style={{ marginRight: '4px' }}>{opt.emoji || '🚀'}</span>
                              {opt.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(activeSlide.responses || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No responses yet</div>
                  )}
                </div>
              )}

              {/* 9. 2x2 Grid Plot */}
              {activeSlide.type === 'grid' && (
                <div className="grid-2x2-wrapper animate-fade">
                  <div className="grid-axis-x"></div>
                  <div className="grid-axis-y"></div>
                  <div className="grid-axis-label-left">{activeSlide.yAxisLabel || 'Y Axis'}</div>
                  <div className="grid-axis-label-bottom">{activeSlide.xAxisLabel || 'X Axis'}</div>
                  
                  {activeSlide.options?.map((opt) => {
                    const coord = gridAverages[opt.id] || { x: 5, y: 5 };
                    // Map 1-10 values to percentages (0 to 100%)
                    const pctX = ((coord.x - 1) / 9) * 100;
                    const pctY = ((coord.y - 1) / 9) * 100;
                    
                    return (
                      <div 
                        key={opt.id}
                        className="grid-plot-dot"
                        style={{ 
                          left: `${pctX}%`, 
                          bottom: `${pctY}%`, 
                          backgroundColor: 'var(--primary)' 
                        }}
                      >
                        <div className="grid-dot-label">
                          {opt.text} ({coord.x}, {coord.y})
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 10. Quick Form */}
              {activeSlide.type === 'form' && (
                <div className="form-table-container animate-fade">
                  <table className="form-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        {activeSlide.options?.map(opt => (
                          <th key={opt.id}>{opt.text}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(activeSlide.responses || []).map((resp, rIdx) => (
                        <tr key={rIdx}>
                          <td>{rIdx + 1}</td>
                          {activeSlide.options?.map(opt => (
                            <td key={opt.id}>{resp.form?.[opt.text] || '-'}</td>
                          ))}
                        </tr>
                      ))}
                      {(activeSlide.responses || []).length === 0 && (
                        <tr>
                          <td colSpan={(activeSlide.options?.length || 0) + 1} style={{ textAlign: 'center', padding: '20px' }}>
                            Waiting for forms...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 11. Pin on Image */}
              {activeSlide.type === 'pin' && (
                <div className="pin-image-wrapper animate-fade">
                  {/* Default interactive background grid representing a target/bullseye or matrix quadrants */}
                  {activeSlide.pinImageType === 'quadrants' ? (
                    <svg className="pin-img" viewBox="0 0 500 500" style={{ width: '400px', height: '400px', background: 'rgba(255,255,255,0.02)' }}>
                      <line x1="250" y1="0" x2="250" y2="500" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <line x1="0" y1="250" x2="500" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <text x="70" y="70" fill="var(--text-secondary)" fontWeight="bold" opacity="0.6">High Value / Low Cost</text>
                      <text x="280" y="70" fill="var(--text-secondary)" fontWeight="bold" opacity="0.6">High Value / High Cost</text>
                      <text x="70" y="440" fill="var(--text-secondary)" fontWeight="bold" opacity="0.6">Low Value / Low Cost</text>
                      <text x="280" y="440" fill="var(--text-secondary)" fontWeight="bold" opacity="0.6">Low Value / High Cost</text>
                    </svg>
                  ) : (
                    <svg className="pin-img" viewBox="0 0 500 500" style={{ width: '400px', height: '400px', background: 'rgba(255,255,255,0.02)' }}>
                      <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                      <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                      <circle cx="250" cy="250" r="100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                      <circle cx="250" cy="250" r="40" fill="rgba(99, 102, 241, 0.2)" stroke="white" strokeWidth="4" />
                      <line x1="250" y1="0" x2="250" y2="500" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="5" />
                      <line x1="0" y1="250" x2="500" y2="250" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="5" />
                    </svg>
                  )}
                  
                  {/* Absolute overlay of pins */}
                  {(activeSlide.responses || []).map((pin, pIdx) => (
                    <div 
                      key={pIdx}
                      className="pin-marker"
                      style={{ 
                        left: `${pin.x}%`, 
                        top: `${pin.y}%` 
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {/* 12. Quiz (Alternative Quiz View) */}
              {activeSlide.type === 'quiz' && (
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  {leaderboardVisible ? (
                    <div className="leaderboard-container animate-fade" style={{ width: '100%', maxWidth: '850px', background: 'rgba(11, 15, 25, 0.85)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
                      <h2 style={{ textAlign: 'center', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.8rem', color: '#ffffff' }}>
                        <Trophy size={32} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.6))' }} /> 
                        Sports Championship Leaderboard
                      </h2>

                      {/* Mode Selector: Individual vs Team */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '25px' }}>
                        <button 
                          className={`btn ${leaderboardViewMode === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setLeaderboardViewMode('individual')}
                          style={{ padding: '10px 22px', fontSize: '0.9rem', fontWeight: 800 }}
                        >
                          👤 Individual Standings
                        </button>
                        <button 
                          className={`btn ${leaderboardViewMode === 'team' ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setLeaderboardViewMode('team')}
                          style={{ padding: '10px 22px', fontSize: '0.9rem', fontWeight: 800 }}
                        >
                          👥 Team / Group Standings
                        </button>
                      </div>

                      {leaderboardViewMode === 'individual' ? (
                        <>
                          {/* Top 3 Sports Victory Podium */}
                          {(() => {
                            const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);
                            const first = sorted[0];
                            const second = sorted[1];
                            const third = sorted[2];

                            if (sorted.length === 0) {
                              return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No participants scored yet.</div>;
                            }

                            return (
                              <div>
                                {/* 3D Sports Podium Display */}
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '15px', height: '220px', marginBottom: '30px' }}>
                                  
                                  {/* 2nd Place Silver */}
                                  {second && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '140px' }}>
                                      <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🥈</div>
                                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#cbd5e1', textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>{second[0]}</div>
                                      <div style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 800, marginBottom: '6px' }}>{second[1]} pts</div>
                                      <div style={{
                                        width: '100%', height: '110px', background: 'linear-gradient(180deg, #94a3b8, #475569)',
                                        borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 900, fontSize: '1.8rem', color: '#ffffff', boxShadow: '0 4px 20px rgba(148, 163, 184, 0.4)'
                                      }}>
                                        2
                                      </div>
                                    </div>
                                  )}

                                  {/* 1st Place Gold */}
                                  {first && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '170px' }}>
                                      <div style={{ fontSize: '2.5rem', marginBottom: '2px', animation: 'trophyBounce 1.5s ease-in-out infinite' }}>👑 🥇</div>
                                      <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#fbbf24', textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>{first[0]}</div>
                                      <div style={{ fontSize: '0.95rem', color: '#fbbf24', fontWeight: 900, marginBottom: '6px' }}>{first[1]} pts</div>
                                      <div style={{
                                        width: '100%', height: '150px', background: 'linear-gradient(180deg, #f59e0b, #d97706)',
                                        borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 900, fontSize: '2.2rem', color: '#ffffff', boxShadow: '0 0 30px rgba(245, 158, 11, 0.6)',
                                        border: '2px solid #fef08a'
                                      }}>
                                        1
                                      </div>
                                    </div>
                                  )}

                                  {/* 3rd Place Bronze */}
                                  {third && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '140px' }}>
                                      <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>🥉</div>
                                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#d97706', textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>{third[0]}</div>
                                      <div style={{ fontSize: '0.85rem', color: '#06b6d4', fontWeight: 800, marginBottom: '6px' }}>{third[1]} pts</div>
                                      <div style={{
                                        width: '100%', height: '85px', background: 'linear-gradient(180deg, #d97706, #78350f)',
                                        borderRadius: '16px 16px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 900, fontSize: '1.8rem', color: '#ffffff', boxShadow: '0 4px 20px rgba(217, 119, 6, 0.4)'
                                      }}>
                                        3
                                      </div>
                                    </div>
                                  )}

                                </div>

                                {/* Standings List 4+ */}
                                <div className="leaderboard-list">
                                  {sorted.slice(3, 10).map(([nickname, score], idx) => (
                                    <div key={nickname} className="leaderboard-row" style={{ padding: '12px 18px' }}>
                                      <div className="leaderboard-row-left">
                                        <span className="leaderboard-rank" style={{ width: '32px', height: '32px', fontWeight: 800 }}>{idx + 4}</span>
                                        <span className="leaderboard-name">{nickname}</span>
                                      </div>
                                      <span className="leaderboard-score" style={{ fontWeight: 800 }}>{score} pts</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        /* Team Standings View */
                        <div className="leaderboard-list">
                          {getTeamStandings().map((team, idx) => (
                            <div key={team.name} className="leaderboard-row" style={{ padding: '14px 20px', background: idx === 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.03)', borderColor: idx === 0 ? '#06b6d4' : 'var(--border-glass)' }}>
                              <div className="leaderboard-row-left">
                                <span className={`leaderboard-rank rank-${idx + 1}`} style={{ width: '38px', height: '38px', fontSize: '1.1rem', fontWeight: 900 }}>
                                  {idx === 0 ? '🏆' : idx + 1}
                                </span>
                                <div>
                                  <div className="leaderboard-name" style={{ fontSize: '1.1rem', fontWeight: 800, color: idx === 0 ? '#06b6d4' : 'var(--text-primary)' }}>
                                    {team.name}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    CODE: {team.code} • {team.memberCount} members
                                  </div>
                                </div>
                              </div>
                              <span className="leaderboard-score" style={{ fontSize: '1.2rem', fontWeight: 900, color: idx === 0 ? '#06b6d4' : '#ffffff' }}>
                                {team.score} pts
                              </span>
                            </div>
                          ))}
                          {getTeamStandings().length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                              No team allocations active yet. Open 👥 Group Manager to assign teams!
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                      <div className="bar-chart-container" style={{ opacity: votingLocked ? 1 : 0.6 }}>
                        {activeSlide.options?.map((opt, idx) => {
                          const answers = activeSlide.responses || [];
                          const votes = answers.filter(a => Number(a.answerIndex) === idx).length;
                          const percent = answers.length > 0 ? (votes / answers.length) * 100 : 0;
                          
                          const color = OPTION_COLORS[idx % OPTION_COLORS.length];
                          const isCorrect = (activeSlide.correctAnswerIndices || []).includes(idx) || idx === activeSlide.correctAnswerIndex;
                          const hasCorrect = activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0;
                          const isIncorrect = (correctRevealed || votingLocked) && hasCorrect && !isCorrect;
                          const isRevealed = correctRevealed || votingLocked;

                          return (
                            <div 
                              key={opt.id} 
                              className={`chart-bar-wrapper ${isCorrect && isRevealed ? 'correct-answer' : ''} ${isIncorrect ? 'incorrect-answer' : ''}`}
                              style={{ position: 'relative' }}
                            >
                              {isCorrect && isRevealed && (
                                <div className="correct-indicator-checkmark">😊</div>
                              )}
                              <div 
                                className="chart-bar animate-grow-height" 
                                style={{ 
                                  height: `${Math.max(percent, 2)}%`,
                                  backgroundColor: color
                                }}
                              >
                                <span className="chart-bar-value">{votes}</span>
                              </div>
                              <span className="chart-bar-label">
                                <span style={{ marginRight: '6px' }}>{opt.emoji || '🚀'}</span>
                                {opt.text}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {votingLocked && (
                        <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Correct Answer Revealed!</span>
                          <button className="btn btn-secondary" onClick={toggleLeaderboard} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                            <Trophy size={14} /> View Leaderboard
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 13. Stopwatch / Timer */}
              {activeSlide.type === 'stopwatch' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '20px' }}>
                  <div style={{
                    fontSize: '6rem', 
                    fontWeight: 900, 
                    fontFamily: 'monospace', 
                    color: 'var(--primary)', 
                    letterSpacing: '4px',
                    textShadow: '0 0 40px rgba(6, 182, 212, 0.4)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '20px 50px',
                    borderRadius: '24px',
                    border: '1px solid var(--border-glass)',
                    minWidth: '450px',
                    textAlign: 'center'
                  }}>
                    {Math.floor(stopwatchTime / 60000).toString().padStart(2, '0')}:
                    {Math.floor((stopwatchTime % 60000) / 1000).toString().padStart(2, '0')}.
                    {(stopwatchTime % 1000).toString().padStart(3, '0')}
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      className={`btn ${stopwatchActive ? 'btn-secondary' : 'btn-primary'}`} 
                      style={{ padding: '12px 30px', fontWeight: 800, minWidth: '150px' }}
                      onClick={handleStartStopwatch}
                    >
                      {stopwatchActive ? 'Pause' : 'Start Timer'}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '12px 30px', fontWeight: 800 }}
                      onClick={handleResetStopwatch}
                    >
                      Reset
                    </button>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'center' }}>
                    This countdown stopwatch runs down to millisecond precision. The timer state synchronizes automatically to all participant screens!
                  </p>
                </div>
              )}

              {/* 14. Brainstorm Category Grouping */}
              {activeSlide.type === 'brainstorm' && (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', padding: '10px' }}>
                  {/* Category Grids (4 Columns) */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {['Category 1', 'Category 2', 'Category 3', 'Category 4'].map((defaultLabel, idx) => {
                      const colId = `category${idx + 1}`;
                      const colLabel = activeSlide[colId] || defaultLabel;
                      const cards = (activeSlide.responses || []).filter(r => r.category === colId);
                      
                      return (
                        <div 
                          key={colId} 
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            const cardId = e.dataTransfer.getData('text/plain');
                            handleCategorizeCard(cardId, colId);
                          }}
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            border: '2px dashed var(--border-glass)', 
                            borderRadius: '16px', 
                            padding: '16px', 
                            minHeight: '280px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            transition: 'var(--transition-smooth)' 
                          }}
                        >
                          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '6px', marginBottom: '12px', textAlign: 'center' }}>
                            📁 {colLabel}
                          </h3>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                            {cards.map(card => (
                              <div 
                                key={card.id}
                                draggable
                                onDragStart={(e) => e.dataTransfer.setData('text/plain', card.id)}
                                style={{ 
                                  background: 'linear-gradient(135deg, #fef08a, #fef9c3)', 
                                  color: '#854d0e',
                                  padding: '12px', 
                                  borderRadius: '8px', 
                                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  cursor: 'grab',
                                  transform: 'rotate(-1deg)',
                                  position: 'relative'
                                }}
                              >
                                {card.text}
                                <span style={{ display: 'block', fontSize: '0.65rem', color: '#a16207', marginTop: '4px', opacity: 0.8 }}>
                                  👤 {card.nickname}
                                </span>
                                
                                {/* Quick Mobile Categorize Tags */}
                                <div style={{ display: 'flex', gap: '3px', marginTop: '8px', borderTop: '1px dashed rgba(161, 98, 7, 0.2)', paddingTop: '6px' }}>
                                  {[1, 2, 3, 4].map(cNum => (
                                    <button
                                      key={cNum}
                                      style={{
                                        background: 'rgba(161, 98, 7, 0.1)',
                                        border: 'none',
                                        borderRadius: '3px',
                                        fontSize: '0.6rem',
                                        padding: '2px 4px',
                                        color: '#854d0e',
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => handleCategorizeCard(card.id, `category${cNum}`)}
                                    >
                                      C{cNum}
                                    </button>
                                  ))}
                                  <button
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      border: 'none',
                                      borderRadius: '3px',
                                      fontSize: '0.6rem',
                                      padding: '2px 4px',
                                      color: '#b91c1c',
                                      cursor: 'pointer',
                                      marginLeft: 'auto'
                                    }}
                                    onClick={() => handleCategorizeCard(card.id, null)}
                                    title="Move to Pool"
                                  >
                                    ↩ Pool
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Incoming Unsorted Pool */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '16px' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      📥 Incoming Responses Pool (Drag to categories above or use C1-C4 shortcuts)
                    </h4>
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const cardId = e.dataTransfer.getData('text/plain');
                        handleCategorizeCard(cardId, null);
                      }}
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '80px', padding: '8px', borderRadius: '8px' }}
                    >
                      {(activeSlide.responses || []).filter(r => r.category === null || r.category === undefined).map(card => (
                        <div 
                          key={card.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', card.id)}
                          style={{ 
                            background: 'linear-gradient(135deg, #a7f3d0, #ecfdf5)', 
                            color: '#065f46',
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'grab',
                            transform: 'rotate(1.5deg)',
                            position: 'relative'
                          }}
                        >
                          {card.text}
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#047857', marginTop: '4px', opacity: 0.8 }}>
                            👤 {card.nickname}
                          </span>

                          <div style={{ display: 'flex', gap: '3px', marginTop: '6px', borderTop: '1px dashed rgba(4, 120, 87, 0.2)', paddingTop: '6px' }}>
                            {[1, 2, 3, 4].map(cNum => (
                              <button
                                key={cNum}
                                style={{
                                  background: 'rgba(4, 120, 87, 0.1)',
                                  border: 'none',
                                  borderRadius: '3px',
                                  fontSize: '0.6rem',
                                  padding: '2px 4px',
                                  color: '#065f46',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleCategorizeCard(card.id, `category${cNum}`)}
                              >
                                C{cNum}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(activeSlide.responses || []).filter(r => r.category === null || r.category === undefined).length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 'auto' }}>
                          Waiting for participants to submit ideas...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>

      {/* Hover Floating Controls Toolbar */}
      <div className="presenter-controls-wrapper">
        <div className="presenter-controls">
          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none' }}
            onClick={() => handleSlideChange(currentSlideIndex - 1)}
            disabled={currentSlideIndex === 0}
            title="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {currentSlideIndex + 1} / {slides.length}
          </span>
          
          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none' }}
            onClick={() => handleSlideChange(currentSlideIndex + 1)}
            disabled={currentSlideIndex === slides.length - 1}
            title="Next Slide"
          >
            <ChevronRight size={20} />
          </button>

          <div className="control-divider"></div>

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none', color: answersVisible ? 'white' : 'var(--text-muted)' }}
            onClick={toggleAnswersVisibility}
            title={answersVisible ? "Hide Results" : "Show Results"}
          >
            {answersVisible ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none', color: votingLocked ? 'var(--accent-red)' : 'white' }}
            onClick={toggleVotingLock}
            title={votingLocked ? "Unlock Voting" : "Lock Voting"}
          >
            {votingLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none', color: showGroupManagerModal ? '#06b6d4' : 'white' }}
            onClick={() => {
              if (groupAllocations.length === 0) {
                handleSolveAndAssignGroups();
              }
              setShowGroupManagerModal(true);
            }}
            title="Intelligent Team & Group Manager"
          >
            <Users size={20} />
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none', color: showFinaleModal ? '#fbbf24' : 'white' }}
            onClick={() => {
              setConfettiActive(true);
              setShowFinaleModal(true);
            }}
            title="Launch Grand Finale Sports Trophy Celebration"
          >
            <Trophy size={20} color="#fbbf24" />
          </button>

          {['quiz', 'poll'].includes(activeSlide.type) && (activeSlide.correctAnswerIndex !== undefined || (activeSlide.correctAnswerIndices || []).length > 0) && (
            <button 
              className="btn btn-secondary btn-icon" 
              style={{ border: 'none', color: correctRevealed ? 'var(--accent-green)' : 'white' }}
              onClick={handleRevealCorrect}
              title="Reveal Correct Answer"
            >
              <CheckCircle2 size={20} />
            </button>
          )}

          {activeSlide.type === 'quiz' && (
            <button 
              className="btn btn-secondary btn-icon" 
              style={{ border: 'none', color: leaderboardVisible ? 'var(--accent-amber)' : 'white' }}
              onClick={toggleLeaderboard}
              title="Show Leaderboard"
            >
              <Trophy size={20} />
            </button>
          )}

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none', color: showLobbyOverlay ? 'var(--primary)' : 'white' }}
            onClick={() => setShowLobbyOverlay(!showLobbyOverlay)}
            title="Show Fullscreen Join Instructions"
          >
            <QrCode size={20} />
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none', color: isPenActive ? '#06b6d4' : 'white', background: isPenActive ? 'rgba(6,182,212,0.2)' : 'transparent' }}
            onClick={() => setIsPenActive(!isPenActive)}
            title="Interactive Pen / Touchpen Stencil Annotation"
          >
            <Edit3 size={20} />
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none', color: showAdminChatDrawer ? '#06b6d4' : 'white', background: showAdminChatDrawer ? 'rgba(6,182,212,0.2)' : 'transparent' }}
            onClick={() => setShowAdminChatDrawer(!showAdminChatDrawer)}
            title="Direct Chat with Participants"
          >
            <MessageSquare size={20} />
          </button>

          <button 
            className="btn btn-secondary btn-icon" 
            style={{ border: 'none' }}
            onClick={clearResponses}
            title="Clear Responses"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Admin <-> Participant Direct Chat Modal Drawer */}
      {showAdminChatDrawer && (
        <div 
          className="glass-card animate-fade"
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '25px',
            width: '360px',
            maxHeight: '480px',
            background: '#0b0f19',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 100001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ background: '#0f172a', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💬 Direct Messages & Broadcast
            </div>
            <button 
              type="button"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}
              onClick={() => setShowAdminChatDrawer(false)}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' }}>
              🔒 Restricted Channel (Admin ↔ Participant Only)
            </div>
            {adminChatMessages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  alignSelf: msg.sender.includes('Admin') ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  background: msg.sender.includes('Admin') ? 'rgba(6, 182, 212, 0.2)' : 'rgba(37, 99, 235, 0.15)',
                  border: `1px solid ${msg.sender.includes('Admin') ? 'rgba(6, 182, 212, 0.4)' : 'rgba(37, 99, 235, 0.3)'}`,
                  borderRadius: '12px',
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  color: '#f8fafc'
                }}
              >
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: msg.sender.includes('Admin') ? '#06b6d4' : '#60a5fa', marginBottom: '2px' }}>
                  {msg.sender}
                </div>
                <div>{msg.text}</div>
                <div style={{ fontSize: '0.6rem', color: '#94a3b8', textAlign: 'right', marginTop: '3px' }}>
                  {msg.timestamp}
                </div>
              </div>
            ))}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!adminChatText.trim()) return;
              const newMsg = {
                id: Math.random().toString(36).substr(2, 9),
                sender: 'Admin (Host Broadcast)',
                text: adminChatText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setAdminChatMessages([...adminChatMessages, newMsg]);
              if (socketRef.current) {
                socketRef.current.emit('admin-broadcast-chat', { roomCode, message: newMsg });
              }
              setAdminChatText('');
            }}
            style={{ padding: '10px', background: '#090d16', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '6px' }}
          >
            <input 
              type="text"
              className="input-text"
              placeholder="Type broadcast message..."
              value={adminChatText}
              onChange={(e) => setAdminChatText(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '8px 10px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              Send
            </button>
          </form>
        </div>
      )}

      {/* Live Touchpen / Stencil Canvas Overlay */}
      <PenCanvasOverlay 
        isActive={isPenActive}
        penTool={penTool}
        penColor={penColor}
        penSize={penSize}
        penStrokes={penStrokes}
        onSaveStroke={(stroke) => setPenStrokes([...penStrokes, stroke])}
      />

      {/* Floating Pen Controls Toolbar */}
      {isPenActive && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100000,
          background: '#0b0f19',
          border: '1px solid rgba(6, 182, 212, 0.5)',
          borderRadius: '30px',
          padding: '8px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#06b6d4' }}>✏️ Pen Mode:</span>

          <button 
            type="button"
            style={{ padding: '4px 12px', borderRadius: '15px', border: 'none', background: penTool === 'pen' ? '#06b6d4' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setPenTool('pen')}
          >
            Pen
          </button>
          <button 
            type="button"
            style={{ padding: '4px 12px', borderRadius: '15px', border: 'none', background: penTool === 'highlighter' ? '#f59e0b' : 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setPenTool('highlighter')}
          >
            Highlighter
          </button>

          {/* Color Palette */}
          {['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ffffff'].map(c => (
            <div 
              key={c}
              onClick={() => setPenColor(c)}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: c,
                cursor: 'pointer',
                border: penColor === c ? '2px solid white' : '1px solid rgba(255,255,255,0.2)',
                transform: penColor === c ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.15s ease'
              }}
              title={`Select Color ${c}`}
            />
          ))}

          <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />

          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setPenStrokes(penStrokes.slice(0, -1))}
          >
            ↩ Undo
          </button>
          <button 
            type="button"
            style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
            onClick={() => setPenStrokes([])}
          >
            🧹 Clear
          </button>
          <button 
            type="button"
            style={{ background: '#334155', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: 'white', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsPenActive(false)}
            title="Close Pen Interface"
          >
            ✕
          </button>
        </div>
      )}

      {showLobbyOverlay && (
        <div 
          className="lobby-overlay animate-fade"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--bg-dark)',
            backgroundImage: 'var(--bg-gradient)',
            zIndex: 10000,
            display: 'flex'
          }}
        >
          {/* Left panel - 25% width */}
          <div 
            style={{
              width: '25%',
              background: 'rgba(0,0,0,0.15)',
              borderRight: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
          >
            <div 
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                marginBottom: '20px'
              }}
            >
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`} 
                alt="Join QR Code" 
                style={{ width: '220px', height: '220px', display: 'block' }}
              />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Scan to Join</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Point your phone camera at this QR code to join immediately.
            </p>
          </div>

          {/* Right panel - 75% width */}
          <div 
            style={{
              width: '75%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '4rem',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowLobbyOverlay(false)}
              style={{
                position: 'absolute',
                top: '30px',
                right: '30px',
                padding: '8px 20px',
                fontSize: '0.9rem',
                border: 'none',
                background: 'var(--bg-card-dark)'
              }}
            >
              Close Instructions
            </button>

            <h1 
              style={{ 
                fontSize: '3rem', 
                fontWeight: 800, 
                marginBottom: '3rem',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Join the Presentation
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  border: '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--primary)'
                }}>1</div>
                <div style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                  Go to: <strong style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{window.location.host}/join</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'var(--primary-glow)',
                  border: '2px solid var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--primary)'
                }}>2</div>
                <div style={{ fontSize: '1.8rem', color: 'var(--text-primary)' }}>
                  Enter Room Code: <strong style={{ 
                    fontSize: '2.5rem', 
                    letterSpacing: '0.05em', 
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginLeft: '10px'
                  }}>{roomCode.slice(0,3)} {roomCode.slice(3)}</strong>
                </div>
              </div>
            </div>

            <div 
              style={{ 
                marginTop: '4rem', 
                borderTop: '1px solid var(--border-glass)', 
                paddingTop: '2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
              }}
            >
              <Users size={28} color="var(--primary)" />
              <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {participantsCount} participant{participantsCount !== 1 ? 's' : ''} joined
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 13. Winner Trophy Celebration Modal */}
      {showWinnerCelebration && (
        <div 
          className="winner-celebration-overlay animate-fade"
          style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(11, 14, 19, 0.95)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Animated Glowing Ring & Trophy */}
          <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="celebration-ring"></div>
            <span style={{ fontSize: '7rem', zIndex: 2, filter: 'drop-shadow(0 0 20px rgba(245, 158, 11, 0.6))', animation: 'trophyBounce 1.5s ease-in-out infinite' }}>
              🏆
            </span>
          </div>
          
          <h1 style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Answers Revealed!
          </h1>
          
          <div style={{ maxWidth: '600px', textAlign: 'center', padding: '0 20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 10px' }}>The correct option is:</p>
            {activeSlide.options?.map((opt, idx) => {
              const isCorrect = (activeSlide.correctAnswerIndices || []).includes(idx) || idx === activeSlide.correctAnswerIndex;
              if (isCorrect) {
                return (
                  <h2 key={opt.id} style={{ color: 'var(--accent-green)', fontSize: '2.2rem', fontWeight: 800, margin: '15px 0' }}>
                    😊 {opt.emoji || '🚀'} {opt.text}
                  </h2>
                );
              }
              return null;
            })}
          </div>
          
          <button 
            className="btn btn-primary"
            style={{ padding: '12px 30px', fontSize: '1rem', borderRadius: '30px', marginTop: '20px', fontWeight: 800 }}
            onClick={() => setShowWinnerCelebration(false)}
          >
            Show Results Chart
          </button>
        </div>
      )}

      {/* Real-time Focus Violations Alerts (Bottom-Right) */}
      <div style={{
        position: 'fixed', bottom: '100px', right: '24px', zIndex: 10000,
        display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', width: '100%'
      }}>
        {focusViolations.map((v) => (
          <div 
            key={v.id} 
            className="glass-card animate-fade" 
            style={{
              background: '#0b0f19', border: `1px solid ${v.action === 'locked_out' ? '#ef4444' : '#f59e0b'}`,
              padding: '12px 16px', borderRadius: '8px', color: '#f8fafc',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', color: v.action === 'locked_out' ? '#f87171' : '#fbbf24' }}>
              <span>⚠️ FOCUS VIOLATION</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: 'auto' }}>{v.time}</span>
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '6px', fontWeight: 600 }}>
              {v.nickname} {v.action === 'locked_out' ? 'was LOCKED OUT!' : `switched tabs (${v.warningsLeft} warnings left)`}
            </div>
          </div>
        ))}
      </div>

      {/* Intelligent Dynamic Group & Team Manager Modal */}
      {showGroupManagerModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{
            width: '100%', maxWidth: '900px', background: '#0b0f19', border: '1px solid var(--border-glass)',
            borderRadius: '24px', padding: '30px', position: 'relative', overflowY: 'auto', maxHeight: '90vh'
          }}>
            <button 
              onClick={() => setShowGroupManagerModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'transparent',
                border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '12px', color: '#06b6d4' }}>
                <Users size={28} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                  👥 Intelligent Team & Group Manager
                </h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Gender-balanced allocation, non-repeating pair shuffling (CSP algorithm), and thematic team naming.
                </p>
              </div>
            </div>

            {/* Config Toolbar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px',
              background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)',
              marginBottom: '24px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Number of Groups (Y)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="range" min="1" max="10" 
                    value={groupCount}
                    onChange={(e) => setGroupCount(Number(e.target.value))}
                    style={{ flex: 1, accentColor: '#06b6d4' }}
                  />
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#06b6d4', minWidth: '30px' }}>{groupCount}</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Naming Theme
                </label>
                <select 
                  value={groupThemeKey}
                  onChange={(e) => setGroupThemeKey(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', background: '#0f172a', border: '1px solid var(--border-glass)',
                    borderRadius: '8px', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, outline: 'none'
                  }}
                >
                  <option value="indian_rivers">🌊 Indian Rivers (Ganga, Yamuna...)</option>
                  <option value="greek">🏛️ Greek Alphabets (Alpha, Beta...)</option>
                  <option value="cosmic">✨ Cosmic Constellations (Orion, Phoenix...)</option>
                  <option value="numeric">🔢 Team Numbers (Team 1, Team 2...)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <button 
                  className="btn btn-primary"
                  onClick={handleSolveAndAssignGroups}
                  style={{ width: '100%', background: 'linear-gradient(135deg, #06b6d4, #2563eb)', fontWeight: 800, gap: '6px' }}
                >
                  <Shuffle size={16} /> Reshuffle Groups (CSP)
                </button>
              </div>
            </div>

            {/* Interaction Matrix & Coverage Indicator */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px',
              padding: '12px 16px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '12px', marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#06b6d4" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                  Class Interaction Coverage: <span style={{ color: '#06b6d4' }}>{interactionCoverage}%</span>
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {repeatPairCount === 0 
                  ? '✨ 0 Repeat Pairings (100% Unique Interaction)' 
                  : `⚠️ ${repeatPairCount} Repeat Pairings (Exhaustion Limit Minimal Overlap)`}
              </div>
            </div>

            {/* Group Cards Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px'
            }}>
              {groupAllocations.map(g => (
                <div key={g.id} className="glass-card" style={{
                  padding: '18px', borderRadius: '16px', border: '1.5px solid rgba(6, 182, 212, 0.3)',
                  background: 'rgba(15, 23, 42, 0.65)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>{g.name}</h3>
                    <span style={{ fontSize: '0.75rem', background: '#06b6d4', color: '#ffffff', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                      {g.code}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {g.members.map(m => (
                      <div key={m.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)',
                        borderRadius: '8px', fontSize: '0.85rem'
                      }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {(m.gender || 'M').toUpperCase() === 'F' ? '👩' : '👨'} {m.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {(m.gender || 'M').toUpperCase() === 'F' ? 'Female' : 'Male'}
                        </span>
                      </div>
                    ))}
                    {g.members.length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '12px' }}>
                        No members assigned yet
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Grand Finale Championship Victory Modal */}
      {showFinaleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 16, 0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{
            width: '100%', maxWidth: '950px', background: 'linear-gradient(135deg, #0b0f19, #1e1b4b)',
            border: '2px solid #f59e0b', borderRadius: '32px', padding: '40px', position: 'relative',
            boxShadow: '0 0 50px rgba(245, 158, 11, 0.4)', textAlign: 'center', overflowY: 'auto', maxHeight: '90vh'
          }}>
            <button 
              onClick={() => setShowFinaleModal(false)}
              style={{
                position: 'absolute', top: '24px', right: '24px', background: 'transparent',
                border: 'none', color: '#ffffff', fontSize: '1.8rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: '4rem', animation: 'trophyBounce 1.2s ease-in-out infinite', marginBottom: '10px' }}>
              🏆 👑 🎆
            </div>

            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Grand Finale Championship
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '30px' }}>
              Final Tournament Standings & Overall Victory Ceremony
            </p>

            {/* Toggle Individual / Team */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
              <button 
                className={`btn ${leaderboardViewMode === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLeaderboardViewMode('individual')}
                style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 900 }}
              >
                👤 Individual Champion
              </button>
              <button 
                className={`btn ${leaderboardViewMode === 'team' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setLeaderboardViewMode('team')}
                style={{ padding: '12px 28px', fontSize: '1rem', fontWeight: 900 }}
              >
                👥 Winning Team Cup
              </button>
            </div>

            {leaderboardViewMode === 'individual' ? (
              <div>
                {/* 3D Grand Podium */}
                {(() => {
                  const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]);
                  const winner = sorted[0];

                  return (
                    <div>
                      {winner && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.1))',
                          border: '2px solid #fbbf24', borderRadius: '24px', padding: '24px', marginBottom: '30px',
                          display: 'inline-block', minWidth: '300px', boxShadow: '0 0 35px rgba(251, 191, 36, 0.3)'
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase' }}>
                            🥇 GRAND CHAMPION 🥇
                          </div>
                          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '8px 0' }}>
                            {winner[0]}
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#06b6d4' }}>
                            {winner[1]} TOTAL POINTS
                          </div>
                        </div>
                      )}

                      <div className="leaderboard-list">
                        {sorted.slice(1, 10).map(([name, pts], i) => (
                          <div key={name} className="leaderboard-row" style={{ padding: '14px 24px' }}>
                            <div className="leaderboard-row-left">
                              <span className={`leaderboard-rank rank-${i + 2}`}>{i + 2}</span>
                              <span className="leaderboard-name" style={{ fontSize: '1.1rem', fontWeight: 800 }}>{name}</span>
                            </div>
                            <span className="leaderboard-score" style={{ fontSize: '1.2rem', fontWeight: 900 }}>{pts} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div>
                {/* Winning Team Podium */}
                {(() => {
                  const teams = getTeamStandings();
                  const winningTeam = teams[0];

                  return (
                    <div>
                      {winningTeam && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(37, 99, 235, 0.2))',
                          border: '2px solid #06b6d4', borderRadius: '24px', padding: '24px', marginBottom: '30px',
                          display: 'inline-block', minWidth: '320px', boxShadow: '0 0 35px rgba(6, 182, 212, 0.4)'
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#06b6d4', textTransform: 'uppercase' }}>
                            🏆 WINNING TEAM CUP 🏆
                          </div>
                          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '8px 0' }}>
                            {winningTeam.name}
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fbbf24' }}>
                            {winningTeam.score} TOTAL TEAM POINTS
                          </div>
                        </div>
                      )}

                      <div className="leaderboard-list">
                        {teams.map((t, idx) => (
                          <div key={t.name} className="leaderboard-row" style={{ padding: '16px 24px' }}>
                            <div className="leaderboard-row-left">
                              <span className="leaderboard-rank" style={{ width: '40px', height: '40px', fontSize: '1.2rem', fontWeight: 900 }}>
                                {idx === 0 ? '🏆' : idx + 1}
                              </span>
                              <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{t.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.code} • {t.memberCount} Members</div>
                              </div>
                            </div>
                            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#06b6d4' }}>{t.score} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
