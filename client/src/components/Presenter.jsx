import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { 
  ChevronLeft, ChevronRight, Lock, Unlock, Eye, EyeOff, RotateCcw, 
  Users, Trophy, Presentation as PresIcon, HelpCircle, ArrowLeft, CheckCircle2, QrCode, Edit3 
} from 'lucide-react';

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

export default function Presenter({ presentationId, onBack }) {
  const [presentation, setPresentation] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [participantsCount, setParticipantsCount] = useState(0);
  
  // Slide & theme state
  const [slides, setSlides] = useState([]);
  const [theme, setTheme] = useState('corporate');
  const [leaderboard, setLeaderboard] = useState({});
  const [pollVizMode, setPollVizMode] = useState('bar'); // bar, pie, doughnut, density
  
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
          setSlides(parsedFound.slides);
          setTheme(parsedFound.theme || 'corporate');
        } else {
          const saved = localStorage.getItem('pulse-poll-presentations');
          if (saved) {
            const presentations = JSON.parse(saved);
            const localFound = presentations.find(p => p.id === presentationId);
            if (localFound) {
              setPresentation(localFound);
              setSlides(localFound.slides);
              setTheme(localFound.theme || 'corporate');
            }
          }
        }
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
          }
        }
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

    socket.on('participant_joined', ({ count }) => {
      setParticipantsCount(count);
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

  return (
    <div className={`presenter-viewport theme-${theme}`}>
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
            style={{ padding: '6px 12px', fontSize: '0.85rem', width: '130px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)' }}
          >
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

        <div className="join-instruction-card">
          <img src={qrCodeUrl} alt="Join QR Code" className="qr-code-img" />
          <div>
            <span className="join-text">Scan or join at: <strong style={{ color: 'var(--text-primary)' }}>{window.location.host}/join</strong></span>
            <span className="join-code">CODE: {roomCode.slice(0,3)} {roomCode.slice(3)}</span>
          </div>
        </div>

        <div className="participant-count-badge">
          <Users size={16} />
          <span>{participantsCount}</span>
        </div>
      </div>

      {/* Main Slide Visualization Body */}
      <div className="presenter-body" style={{ display: 'flex', gap: '30px', padding: '20px 40px', height: 'calc(100vh - 75px)', overflow: 'hidden' }}>
        
        {/* Left Area: Slide Content Canvas */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingRight: '10px' }}>
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
        <h1 className="presenter-question">{activeSlide.question}</h1>

        {/* Universal Time Limit display */}
        {quizTimer > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '1.5rem', background: 'var(--bg-card-dark)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border-glass)', width: 'fit-content', margin: '0 auto 1.5rem auto' }}>
            <span 
              className={quizRunning && quizTimer <= 5 ? "timer-warning-pulse" : ""}
              style={{ fontWeight: 800, fontSize: '1.2rem', color: quizTimer > 5 ? 'var(--text-primary)' : 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.15s ease' }}
            >
              ⏱️ {quizTimer}s
            </span>
            {!quizRunning && quizTimer > 0 && (
              <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem', borderRadius: '12px' }} onClick={startQuizTimer}>
                Start Timer
              </button>
            )}
          </div>
        )}

        <div className="presenter-visualization">
          {!answersVisible ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <EyeOff size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h3>Results are hidden</h3>
              <p>Hover controls below to reveal results to the audience.</p>
            </div>
          ) : (
            <>
              {/* 1. Multiple Choice */}
              {activeSlide.type === 'poll' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  {/* Chart visualization mode toggle */}
                  <div className="viz-toggle-bar">
                    <button className={`viz-toggle-btn ${pollVizMode === 'bar' ? 'active' : ''}`} onClick={() => setPollVizMode('bar')}>Bar</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'pie' ? 'active' : ''}`} onClick={() => setPollVizMode('pie')}>Pie</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'doughnut' ? 'active' : ''}`} onClick={() => setPollVizMode('doughnut')}>Doughnut</button>
                    <button className={`viz-toggle-btn ${pollVizMode === 'density' ? 'active' : ''}`} onClick={() => setPollVizMode('density')}>Ball Density</button>
                  </div>

                  {/* Render based on mode */}
                  {pollVizMode === 'bar' && (
                    <div className="bar-chart-container animate-fade">
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
                              <span style={{ marginRight: '6px' }}>{opt.emoji || '🚀'}</span>
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

                          return (
                            <div key={opt.id} className={`legend-item ${isIncorrect ? 'incorrect-answer' : ''}`}>
                              <div className="legend-color-box" style={{ backgroundColor: color }}></div>
                              <span>
                                <span style={{ marginRight: '6px' }}>{opt.emoji || '🚀'}</span>
                                {opt.text} ({votes} / {percent}%) {isCorrect && correctRevealed && '✓'}
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
                </div>
              )}

              {/* 2. Word Cloud */}
              {activeSlide.type === 'wordcloud' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {(activeSlide.responses || []).length === 0 ? (
                    <div style={{ color: 'var(--text-muted)' }}>Waiting for submissions...</div>
                  ) : (
                    <svg className="word-cloud-svg">
                      {(() => {
                        const words = activeSlide.responses || [];
                        const freqMap = {};
                        words.forEach(w => { freqMap[w] = (freqMap[w] || 0) + 1; });
                        const entries = Object.entries(freqMap)
                          .map(([text, count]) => ({ text, weight: count }))
                          .sort((a,b) => b.weight - a.weight);
                        
                        return entries.map((word, i) => {
                          const angle = i * 2.4;
                          const radius = Math.min(80 + i * 25, 200);
                          const x = 500 + Math.cos(angle) * radius;
                          const y = 200 + Math.sin(angle) * radius * 0.7;
                          const fontSize = 16 + word.weight * 10;
                          const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#a5b4fc', '#f472b6'];
                          return (
                            <text
                              key={word.text}
                              x={x}
                              y={y}
                              className="cloud-word"
                              style={{ fontSize: `${fontSize}px`, fill: colors[i % colors.length], opacity: 0.9 }}
                            >
                              {word.text}
                            </text>
                          );
                        });
                      })()}
                    </svg>
                  )}
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
                    <div className="leaderboard-container">
                      <h2 style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Trophy color="var(--accent-amber)" /> Leaderboard
                      </h2>
                      <div className="leaderboard-list">
                        {Object.entries(leaderboard)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([nickname, score], idx) => (
                            <div key={nickname} className="leaderboard-row" style={{ animationDelay: `${idx * 0.1}s` }}>
                              <div className="leaderboard-row-left">
                                <span className={`leaderboard-rank rank-${idx + 1}`}>{idx + 1}</span>
                                <span className="leaderboard-name">{nickname}</span>
                              </div>
                              <span className="leaderboard-score">{score} pts</span>
                            </div>
                          ))}
                        {Object.keys(leaderboard).length === 0 && (
                          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No participants scored yet.</div>
                        )}
                      </div>
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

        {/* Right Area: Giant Scan to Join Sidebar */}
        <div className="glass-card" style={{
          width: '260px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          borderRadius: '20px',
          border: '1px solid var(--border-glass)',
          background: 'rgba(9, 13, 22, 0.45)',
          textAlign: 'center',
          flexShrink: 0,
          maxHeight: '100%',
          alignSelf: 'center',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scan to Join 📱
          </h3>
          <div style={{
            background: 'white',
            padding: '12px',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            marginBottom: '15px',
            display: 'inline-block'
          }}>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(joinUrl)}`} 
              alt="Giant Join QR Code" 
              style={{ width: '180px', height: '180px', display: 'block' }} 
            />
          </div>
          
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Go to: <strong style={{ color: 'var(--text-primary)' }}>{window.location.host}/join</strong>
          </span>
          <div style={{
            background: 'var(--primary-glow)',
            border: '1px solid var(--border-glass)',
            padding: '6px 12px',
            borderRadius: '10px',
            fontWeight: 900,
            fontSize: '1.15rem',
            color: 'var(--primary)',
            letterSpacing: '1px',
            marginTop: '6px',
            width: '100%'
          }}>
            {roomCode.slice(0,3)} {roomCode.slice(3)}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Users size={12} />
            <span>{participantsCount} joined</span>
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
            style={{ border: 'none' }}
            onClick={clearResponses}
            title="Clear Responses"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

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
    </div>
  );
}
