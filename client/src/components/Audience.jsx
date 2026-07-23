import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, ThumbsUp, Lock, Trophy, Award, CheckCircle, XCircle, ArrowUp, ArrowDown, HelpCircle, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { playHoverSound, playClickSound, playCorrectSound, playWrongSound, playThemeToggleSound, toggleMuteAudio, getMuteState } from '../utils/soundEffects';

export default function Audience({ defaultRoomCode = '', onBackToMenu }) {
  // Join states
  const [roomCode, setRoomCode] = useState(defaultRoomCode.replace(/\D/g, ''));
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [needNickname, setNeedNickname] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [theme, setTheme] = useState('neon');
  const [isProTheme, setIsProTheme] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);

  const handleToggleThemeMode = () => {
    const nextPro = !isProTheme;
    setIsProTheme(nextPro);
    setTheme(nextPro ? 'light-pro' : 'neon');
    playThemeToggleSound(!nextPro);
  };

  const handleToggleMute = () => {
    const muted = toggleMuteAudio();
    setAudioMuted(muted);
  };

  // Active slide state
  const [slide, setSlide] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [votingLocked, setVotingLocked] = useState(false);
  
  // Real-time submission trackers
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState(null);
  const [wordCloudInputs, setWordCloudInputs] = useState(['', '', '', '']);
  const [qaText, setQaText] = useState('');
  const [leaderboard, setLeaderboard] = useState({});
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);

  // New slide type inputs
  const [openEndedText, setOpenEndedText] = useState('');
  const [scaleRatings, setScaleRatings] = useState({}); // { [optId]: rating (1-5) }
  const [rankedItems, setRankedItems] = useState([]); // [ { id, text } ] ordered
  const [guessValue, setGuessValue] = useState('');
  const [pointsAllocations, setPointsAllocations] = useState({}); // { [optId]: points }
  const [gridCoords, setGridCoords] = useState({}); // { [optId]: { x, y } }
  const [formData, setFormData] = useState({}); // { [fieldName]: value }
  const [localPin, setLocalPin] = useState(null); // { x, y } percentages

  // Stopwatch / Brainstorm states
  const [stopwatchTime, setStopwatchTime] = useState(15000);
  const [stopwatchActive, setStopwatchActive] = useState(false);
  const stopwatchIntervalRef = useRef(null);
  const [brainstormInputs, setBrainstormInputs] = useState(['', '']);

  // Focus Mode (Anti-Cheat) states
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [focusWarnings, setFocusWarnings] = useState(2);
  const [showFocusWarningModal, setShowFocusWarningModal] = useState(false);

  // Escape Room Breakout solving states
  const [escapeRoomKeyInput, setEscapeRoomKeyInput] = useState('');
  const [escapeRoomUnlocked, setEscapeRoomUnlocked] = useState(false);
  const [assignedBreakoutRoom, setAssignedBreakoutRoom] = useState('Room Alpha (Cyber Vault)');
  const [userEnteredGroupCode, setUserEnteredGroupCode] = useState('');
  const [isGroupJoined, setIsGroupJoined] = useState(false);
  const [participantMicMuted, setParticipantMicMuted] = useState(false);
  const [participantVideoOn, setParticipantVideoOn] = useState(true);
  const mobileVideoRef = useRef(null);

  // Admin <-> Participant Direct Chat State
  const [showHostChatDrawer, setShowHostChatDrawer] = useState(false);
  const [participantChatText, setParticipantChatText] = useState('');
  const [directChatMessages, setDirectChatMessages] = useState([
    { id: '1', sender: 'Admin (Host)', text: 'Welcome to the session! You can send direct questions to the host here.', timestamp: '11:20 AM' }
  ]);

  useEffect(() => {
    if (participantVideoOn && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: !participantMicMuted })
        .then((stream) => {
          if (mobileVideoRef.current) {
            mobileVideoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.log('Mobile media stream note:', err);
        });
    }
  }, [participantVideoOn, participantMicMuted]);

  // Quiz timer
  const [quizTimeRemaining, setQuizTimeRemaining] = useState(0);
  const [timerStarted, setTimerStarted] = useState(true);
  const quizTimerRef = useRef(null);
  const slideRef = useRef(null);

  const socketRef = useRef(null);

  useEffect(() => {
    slideRef.current = slide;
  }, [slide]);

  // Auto clean default code if passed by query param
  useEffect(() => {
    if (defaultRoomCode) {
      const cleaned = defaultRoomCode.replace(/\D/g, '');
      setRoomCode(cleaned);
    }
  }, [defaultRoomCode]);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
    };
  }, []);

  // Track window blur and visibility changes for Focus Mode (Anti-Cheat)
  useEffect(() => {
    if (!isJoined || !slide || !slide.focusMode || isLockedOut) return;

    const handleFocusLoss = () => {
      setFocusWarnings((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setIsLockedOut(true);
          if (socketRef.current) {
            socketRef.current.emit('audience_focus_lost', { roomCode, nickname: nickname.trim(), action: 'locked_out' });
          }
          return 0;
        } else {
          setShowFocusWarningModal(true);
          if (socketRef.current) {
            socketRef.current.emit('audience_focus_lost', { roomCode, nickname: nickname.trim(), action: 'warning', warningsLeft: next });
          }
          return next;
        }
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleFocusLoss();
      }
    };

    const handleBlur = () => {
      handleFocusLoss();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isJoined, slide, isLockedOut, roomCode, nickname]);

  const handleRoomCodeChange = (val) => {
    // Strip all spaces, dashes, or non-digits immediately
    const cleaned = val.replace(/\D/g, '');
    setRoomCode(cleaned);
  };

  const handleJoin = (e) => {
    if (e) e.preventDefault();
    if (!roomCode.trim() || roomCode.length < 6) {
      setErrorMsg('Please enter a valid 6-digit room code.');
      return;
    }

    setErrorMsg('');

    const socket = io();
    socketRef.current = socket;

    socket.emit('join_room', { roomCode: roomCode.trim(), nickname: nickname.trim() }, (response) => {
      if (response.success) {
        setSlide(response.slide);
        setSlideIndex(response.currentSlideIndex);
        setVotingLocked(response.votingLocked);
        
        if (response.slide && response.slide.timeLimit > 0 && response.slide.timerAutoStart === false) {
          setTimerStarted(!response.votingLocked);
        } else {
          setTimerStarted(true);
        }

        setLeaderboardVisible(response.leaderboardVisible);
        setLeaderboard(response.leaderboard);
        setTheme(response.theme || 'neon');
        setIsJoined(true);

        // Check if slide requires nickname (Quiz or Guess the Number)
        const needsName = response.slide?.type === 'quiz' || response.slide?.type === 'guess';
        if (needsName && !nickname.trim()) {
          setNeedNickname(true);
          socket.disconnect();
          setIsJoined(false);
        } else {
          // Initialize slide fields
          initializeSlideInputs(response.slide);
          setupSocketListeners(socket);
        }
      } else {
        setErrorMsg(response.message);
        socket.disconnect();
      }
    });
  };

  const handleJoinWithNickname = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setNeedNickname(false);
    handleJoin();
  };

  // Initialize input state hooks depending on slide configurations
  const initializeSlideInputs = (activeSlide) => {
    if (!activeSlide) return;

    if (activeSlide.type === 'scales') {
      const initial = {};
      activeSlide.options?.forEach(opt => { initial[opt.id] = 3; }); // default middle 3
      setScaleRatings(initial);
    } 
    else if (activeSlide.type === 'ranking') {
      setRankedItems(activeSlide.options || []);
    } 
    else if (activeSlide.type === 'points') {
      const initial = {};
      activeSlide.options?.forEach(opt => { initial[opt.id] = 0; });
      setPointsAllocations(initial);
    } 
    else if (activeSlide.type === 'grid') {
      const initial = {};
      activeSlide.options?.forEach(opt => { initial[opt.id] = { x: 5, y: 5 }; });
      setGridCoords(initial);
    } 
    else if (activeSlide.type === 'form') {
      const initial = {};
      activeSlide.options?.forEach(opt => { initial[opt.text] = ''; });
      setFormData(initial);
    }
    else if (activeSlide.type === 'brainstorm') {
      setBrainstormInputs(['', '']);
    }
    setLocalPin(null);
  };

  const setupSocketListeners = (socket) => {
    socket.on('slide_changed', ({ currentSlideIndex: idx, slide: newSlide, votingLocked: locked, leaderboardVisible: lbVis }) => {
      setSlide(newSlide);
      setSlideIndex(idx);
      setVotingLocked(locked);
      setLeaderboardVisible(lbVis);
      
      setHasVoted(false);
      setSelectedOptionId(null);
      setSelectedQuizIndex(null);
      setWordCloudInputs(['', '', '', '']);
      setOpenEndedText('');
      setGuessValue('');
      setIsLockedOut(false);
      setShowFocusWarningModal(false);
      setFocusWarnings(2);
      
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
      setStopwatchActive(false);
      setStopwatchTime((newSlide.timeLimit || 15) * 1000);
      setBrainstormInputs(['', '']);

      initializeSlideInputs(newSlide);

      if (newSlide.timeLimit > 0 && newSlide.timerAutoStart === false) {
        setTimerStarted(false);
      } else {
        setTimerStarted(true);
      }

      if (quizTimerRef.current) clearInterval(quizTimerRef.current);
      
      if (newSlide.type === 'quiz' && (newSlide.timerAutoStart === true || newSlide.timerAutoStart === undefined)) {
        setQuizTimeRemaining(newSlide.timeLimit || 15);
        let timeLeft = newSlide.timeLimit || 15;
        quizTimerRef.current = setInterval(() => {
          timeLeft -= 1;
          setQuizTimeRemaining(timeLeft);
          if (timeLeft <= 0) clearInterval(quizTimerRef.current);
        }, 1000);
      }
    });

    socket.on('lock_toggled', ({ locked }) => {
      setVotingLocked(locked);
      
      if (!locked) {
        setTimerStarted(true);
        const currentSlide = slideRef.current;
        if (currentSlide && currentSlide.type === 'quiz' && !quizTimerRef.current) {
          setQuizTimeRemaining(currentSlide.timeLimit || 15);
          let timeLeft = currentSlide.timeLimit || 15;
          quizTimerRef.current = setInterval(() => {
            timeLeft -= 1;
            setQuizTimeRemaining(timeLeft);
            if (timeLeft <= 0) clearInterval(quizTimerRef.current);
          }, 1000);
        }
      }
    });

    socket.on('leaderboard_toggled', ({ visible, leaderboard: curLeaderboard }) => {
      setLeaderboardVisible(visible);
      if (curLeaderboard) setLeaderboard(curLeaderboard);
    });

    socket.on('qa_updated', ({ responses }) => {
      setSlide(prev => prev && prev.type === 'qa' ? { ...prev, responses } : prev);
    });

    socket.on('theme_changed', ({ theme: nextTheme }) => {
      setTheme(nextTheme);
    });

    socket.on('responses_cleared', () => {
      setHasVoted(false);
      setSelectedOptionId(null);
      setSelectedQuizIndex(null);
      setWordCloudInputs(['', '', '', '']);
      setOpenEndedText('');
      setGuessValue('');
      setLocalPin(null);
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
      setStopwatchActive(false);
      setStopwatchTime((slide?.timeLimit || 15) * 1000);
      setBrainstormInputs(['', '']);
      initializeSlideInputs(slide);
    });

    socket.on('stopwatch_synced', ({ action, remainingTime }) => {
      setStopwatchTime(remainingTime);
      if (action === 'start') {
        setStopwatchActive(true);
        const startTime = Date.now();
        const startRemaining = remainingTime;
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        stopwatchIntervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, startRemaining - elapsed);
          setStopwatchTime(remaining);
          if (remaining <= 0) {
            setStopwatchActive(false);
            if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
          }
        }, 33);
      } else if (action === 'pause' || action === 'stop') {
        setStopwatchActive(false);
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
      } else if (action === 'reset') {
        setStopwatchActive(false);
        if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
        setStopwatchTime(remainingTime);
      }
    });

    socket.on('room_closed', () => {
      alert('The presenter closed this room.');
      handleExit();
    });
  };

  const handleExit = () => {
    if (socketRef.current) socketRef.current.disconnect();
    setIsJoined(false);
    setNeedNickname(false);
    setSlide(null);
    setHasVoted(false);
    setNickname('');
    if (onBackToMenu) onBackToMenu();
  };

  const handleSubmitResponse = (responsePayload) => {
    if (votingLocked) return;

    socketRef.current.emit('submit_response', {
      roomCode: roomCode.trim(),
      response: responsePayload
    }, (res) => {
      if (res.success) {
        setHasVoted(true);
      } else {
        alert(res.message || 'Submission failed.');
      }
    });
  };

  // --- ACTIONS FOR INDIVIDUAL SLIDE SUBMISSIONS ---

  // 1. Multiple Choice
  const handleVotePoll = (optionId) => {
    playClickSound(isProTheme);
    setSelectedOptionId(optionId);
    handleSubmitResponse({ optionId });
  };

  // 2. Word Cloud
  const handleWordCloudSubmit = (e) => {
    e.preventDefault();
    const validWords = wordCloudInputs.filter(w => w.trim().length > 0);
    if (validWords.length === 0) return;
    playClickSound(isProTheme);
    handleSubmitResponse({ words: validWords });
  };

  // Brainstorm
  const handleBrainstormSubmit = (e) => {
    e.preventDefault();
    const validWords = brainstormInputs.filter(w => w.trim().length > 0);
    if (validWords.length !== 2) {
      alert("Please enter exactly 2 words/opinions to submit!");
      return;
    }
    playClickSound(isProTheme);
    handleSubmitResponse({ words: validWords });
  };

  // 3. Open Ended
  const handleOpenEndedSubmit = (e) => {
    e.preventDefault();
    if (!openEndedText.trim()) return;
    playClickSound(isProTheme);
    handleSubmitResponse({ text: openEndedText.trim() });
  };

  // 4. Scales
  const handleScalesSubmit = (e) => {
    e.preventDefault();
    playClickSound(isProTheme);
    handleSubmitResponse({ ratings: scaleRatings });
  };

  // 5. Ranking (Up/Down sorting)
  const moveRankItem = (index, direction) => {
    const list = [...rankedItems];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    
    playHoverSound(isProTheme);
    // Swap
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setRankedItems(list);
  };
  const handleRankingSubmit = () => {
    playClickSound(isProTheme);
    handleSubmitResponse({ ranking: rankedItems.map(item => item.id) });
  };

  // 6. Q&A
  const handleQaSubmit = (e) => {
    e.preventDefault();
    if (!qaText.trim()) return;
    playClickSound(isProTheme);
    socketRef.current.emit('submit_response', {
      roomCode: roomCode.trim(),
      response: { text: qaText }
    });
    setQaText('');
  };
  const handleUpvoteQa = (qId) => {
    playClickSound(isProTheme);
    socketRef.current.emit('upvote_question', { roomCode: roomCode.trim(), questionId: qId });
  };

  // 7. Guess the Number
  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (guessValue === '') return;
    playClickSound(isProTheme);
    handleSubmitResponse({ guess: Number(guessValue) });
  };

  // 8. 100 Points
  const getPointsSum = () => Object.values(pointsAllocations).reduce((a, b) => a + Number(b || 0), 0);
  const handlePointsSubmit = (e) => {
    e.preventDefault();
    if (getPointsSum() !== 100) return;
    playClickSound(isProTheme);
    handleSubmitResponse({ points: pointsAllocations });
  };

  // 9. 2x2 Grid
  const handleGridSubmit = (e) => {
    e.preventDefault();
    playClickSound(isProTheme);
    handleSubmitResponse({ grid: gridCoords });
  };

  // 10. Quick Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    playClickSound(isProTheme);
    handleSubmitResponse({ form: formData });
  };

  // 11. Pin on Image (Click canvas)
  const handlePinClick = (e) => {
    if (hasVoted || votingLocked) return;
    playHoverSound(isProTheme);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLocalPin({ x, y });
  };
  const handlePinSubmit = () => {
    if (!localPin) return;
    playClickSound(isProTheme);
    handleSubmitResponse(localPin);
  };

  // 12. Quiz Choice
  const handleQuizAnswer = (optIndex) => {
    if (hasVoted || votingLocked) return;
    playClickSound(isProTheme);
    setSelectedQuizIndex(optIndex);
    handleSubmitResponse({
      answerIndex: optIndex,
      timeRemaining: Math.max(quizTimeRemaining, 0),
      totalTime: slide.timeLimit || 15
    });
  };

  const getMyPollOrQuizResult = () => {
    if (!slide) return false;
    
    if (slide.type === 'quiz' && selectedQuizIndex !== null) {
      const idxs = slide.correctAnswerIndices || (slide.correctAnswerIndex !== undefined ? [Number(slide.correctAnswerIndex)] : []);
      return idxs.includes(selectedQuizIndex);
    }
    
    if (slide.type === 'poll' && selectedOptionId) {
      const idx = slide.options?.findIndex(o => o.id === selectedOptionId);
      if (idx === -1) return false;
      const idxs = slide.correctAnswerIndices || (slide.correctAnswerIndex !== undefined ? [Number(slide.correctAnswerIndex)] : []);
      return idxs.includes(idx);
    }
    
    return false;
  };

  // Render Join Form
  if (!isJoined && !needNickname) {
    return (
      <div className={`audience-mobile-container theme-${theme}`}>
        <div className="glass-card audience-card animate-fade">
          <div>
            <h1 className="audience-title">PulsePoll</h1>
            <p className="audience-subtitle">Enter the 6-digit room code to join.</p>
          </div>

          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="settings-group">
              <input 
                type="text" 
                maxLength="6"
                className="input-text" 
                style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '0.2em', fontWeight: 800 }}
                placeholder="000000"
                value={roomCode}
                onChange={(e) => handleRoomCodeChange(e.target.value)}
                required
              />
            </div>

            {errorMsg && <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', textAlign: 'center' }}>{errorMsg}</div>}

            <button type="submit" className="btn btn-primary" style={{ padding: '14px' }}>
              Join Presentation
            </button>
            <button type="button" className="btn btn-secondary" onClick={onBackToMenu}>
              Back to Menu
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Nickname Form (For Timed Quizzes or Guess Number)
  if (!isJoined && needNickname) {
    return (
      <div className={`audience-mobile-container theme-${theme}`}>
        <div className="glass-card audience-card animate-fade">
          <div>
            <h1 className="audience-title">Your Nickname</h1>
            <p className="audience-subtitle">Enter your name to register for this activity.</p>
          </div>

          <form onSubmit={handleJoinWithNickname} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="settings-group">
              <input 
                type="text" 
                className="input-text" 
                maxLength="15"
                style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 600 }}
                placeholder="e.g. SpeedRacer"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '14px' }}>
              Register & Join
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setNeedNickname(false)}>
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Active Responder view
  if (slide && slide.timeLimit > 0 && !timerStarted) {
    return (
      <div className={`audience-mobile-container theme-${theme}`} style={{ padding: '16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '16px', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room: {roomCode}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{nickname || 'Anonymous'}</span>
          <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleExit}>
            Leave
          </button>
        </div>

        <div className="glass-card audience-card animate-fade" style={{ flex: 1, justifyContent: 'flex-start', minHeight: '420px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', marginBottom: '10px' }}>
            {slide?.question}
          </h2>
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', margin: 'auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px', animation: 'spin 4.5s linear infinite' }}>⏱️</div>
            <h3>Waiting for presenter to start...</h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '8px' }}>
              The options will appear here as soon as the timer begins!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`audience-mobile-container theme-${theme}`} 
      style={{ 
        padding: '16px 8px',
        backgroundImage: slide?.bgImage ? `linear-gradient(rgba(11, 15, 25, 0.8), rgba(11, 15, 25, 0.9)), url(${slide.bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>PIN: {roomCode}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>• {nickname || 'Anonymous'}</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Audio Mute Toggle Button */}
          <button 
            className="btn btn-secondary" 
            onClick={handleToggleMute} 
            title={audioMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            {audioMuted ? <VolumeX size={14} color="#ef4444" /> : <Volume2 size={14} color="#06b6d4" />}
          </button>

          {/* Theme Mode Switcher (Dark Arcade vs Light Professional) */}
          <button 
            className="btn btn-secondary" 
            onClick={handleToggleThemeMode} 
            title="Switch Theme Mode"
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.78rem', 
              fontWeight: 800, 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: isProTheme ? '#ffffff' : '#0f172a',
              color: isProTheme ? '#0f172a' : '#06b6d4',
              border: isProTheme ? '1px solid #2563eb' : '1px solid #06b6d4'
            }}
          >
            {isProTheme ? <Sun size={14} color="#2563eb" /> : <Moon size={14} color="#06b6d4" />}
            <span>{isProTheme ? '💼 Light Pro' : '🎮 Arcade Dark'}</span>
          </button>

          <button className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={handleExit}>
            Leave
          </button>
        </div>
      </div>

      <div className="glass-card audience-card animate-fade" style={{ flex: 1, justifyContent: 'flex-start', minHeight: '420px' }}>
        {slide?.focusMode && (
          <div style={{
            width: '100%', padding: '8px 12px', background: 'rgba(37, 99, 235, 0.1)',
            border: '1px dashed #2563eb', borderRadius: '8px', color: '#2563eb',
            fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '6px', marginBottom: '16px'
          }}>
            🔒 FOCUS MODE ACTIVE: Do not leave this tab
          </div>
        )}
        
        {leaderboardVisible ? (
          <div className="animate-fade" style={{ width: '100%' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Trophy color="var(--accent-amber)" /> Leaderboard
            </h2>
            <div className="leaderboard-list">
              {Object.entries(leaderboard)
                .sort((a,b) => b[1] - a[1])
                .slice(0, 5)
                .map(([name, score], idx) => (
                  <div key={name} className="leaderboard-row" style={{ padding: '8px 16px', background: name === nickname ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', borderColor: name === nickname ? 'var(--primary)' : 'var(--border-glass)' }}>
                    <div className="leaderboard-row-left">
                      <span className="leaderboard-rank" style={{ width: '24px', height: '24px', fontSize: '0.8rem' }}>{idx + 1}</span>
                      <span className="leaderboard-name" style={{ fontSize: '0.95rem' }}>{name} {name === nickname && '(You)'}</span>
                    </div>
                    <span className="leaderboard-score" style={{ fontSize: '1rem' }}>{score} pts</span>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', marginBottom: '10px' }}>
              {slide?.question}
            </h2>

            {/* Unified Correct/Incorrect Results Panel for Poll and Quiz (when voting is locked) */}
            {votingLocked && ['poll', 'quiz'].includes(slide?.type) && (slide.correctAnswerIndex !== undefined || (slide.correctAnswerIndices || []).length > 0) ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', margin: 'auto' }}>
                {((slide.type === 'quiz' && selectedQuizIndex === null) || (slide.type === 'poll' && !selectedOptionId)) ? (
                  <div style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>😢</div>
                    <h3>Time's Up!</h3>
                    <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>You didn't submit an answer in time.</p>
                  </div>
                ) : getMyPollOrQuizResult() ? (
                  <div style={{ color: 'var(--accent-green)' }}>
                    <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>😊</div>
                    <h3>Correct Answer!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                      {slide.type === 'quiz' ? 'Nice job! You earned points. Check the leaderboard!' : 'Great job! You picked the right option.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ color: 'var(--accent-red)' }}>
                    <div style={{ fontSize: '4.5rem', marginBottom: '12px' }}>😢</div>
                    <h3>Incorrect Answer!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                      The correct answer was: <strong style={{ color: 'var(--accent-green)' }}>
                        {slide.options[slide.correctAnswerIndex !== undefined ? slide.correctAnswerIndex : (slide.correctAnswerIndices || [])[0]]?.text}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {votingLocked && slide?.type !== 'qa' && (
                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-red)', borderRadius: '8px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '15px' }}>
                    <Lock size={14} /> Voting has been locked by presenter.
                  </div>
                )}

                {/* General Submitted Feedback Panel */}
                {hasVoted && !['qa', 'quiz'].includes(slide?.type) && (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--accent-green)', margin: 'auto' }}>
                    <CheckCircle size={48} style={{ margin: '0 auto 12px auto' }} />
                    <h3>Response Submitted!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                      Keep an eye on the presenter screen for live results consolidation.
                    </p>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      onClick={() => setHasVoted(false)} 
                      style={{ marginTop: '16px', padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Submit Another Response
                    </button>
                  </div>
                )}
              </>
            )}

            {!hasVoted && !votingLocked && (
              <>
                {/* 1. Multiple Choice */}
                {slide?.type === 'poll' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '12px',
                    width: '100%'
                  }}>
                    {slide.options?.map((opt, i) => {
                      const colors = [
                        { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))', border: 'rgba(239, 68, 68, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))', border: 'rgba(59, 130, 246, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', border: 'rgba(16, 185, 129, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))', border: 'rgba(245, 158, 11, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))', border: 'rgba(139, 92, 246, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))', border: 'rgba(6, 182, 212, 0.4)' }
                      ];
                      const current = colors[i % colors.length] || colors[0];
                      return (
                        <button 
                          key={opt.id} 
                          className={`audience-poll-choice-btn animate-fade ${isProTheme ? 'btn-game-pro' : 'btn-game-arcade'}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '16px 20px',
                            borderRadius: '14px',
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleVotePoll(opt.id)}
                          onMouseEnter={() => playHoverSound(isProTheme)}
                        >
                          <span className={isProTheme ? 'option-badge-pro' : 'option-badge-arcade'}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span style={{ flex: 1, textAlign: 'left' }}>
                            {theme === 'playroom' ? `${['🍎', '🍌', '🍇', '🍉', '🍓', '🍒'][i % 6] || '⭐'} ${opt.text}` : opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* 2. Word Cloud */}
                {slide?.type === 'wordcloud' && (
                  <form onSubmit={handleWordCloudSubmit} className="word-cloud-inputs" style={{ width: '100%' }}>
                    {wordCloudInputs.map((val, idx) => (
                      <input 
                        key={idx}
                        type="text" 
                        maxLength="15"
                        placeholder={`Word ${idx + 1}`}
                        className="input-text"
                        style={{ textAlign: 'center' }}
                        value={val}
                        onChange={(e) => {
                          const updated = [...wordCloudInputs];
                          updated[idx] = e.target.value;
                          setWordCloudInputs(updated);
                        }}
                      />
                    ))}
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }} disabled={wordCloudInputs.every(w => !w.trim())}>
                      Submit Words
                    </button>
                  </form>
                )}

                {/* 3. Open Ended */}
                {slide?.type === 'openended' && (
                  <form onSubmit={handleOpenEndedSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <textarea 
                      className="input-text"
                      style={{ minHeight: '120px', resize: 'vertical' }}
                      placeholder="Type your opinion or feedback..."
                      value={openEndedText}
                      onChange={(e) => setOpenEndedText(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary">
                      Submit Response
                    </button>
                  </form>
                )}

                {/* 4. Scales */}
                {slide?.type === 'scales' && (
                  <form onSubmit={handleScalesSubmit} style={{ width: '100%' }}>
                    {slide.options?.map(opt => (
                      <div key={opt.id} className="audience-scale-item">
                        <label>{opt.text}</label>
                        <div className="audience-scale-slider-row">
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Low</span>
                          <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            step="1"
                            value={scaleRatings[opt.id] || 3}
                            onChange={(e) => {
                              setScaleRatings({ ...scaleRatings, [opt.id]: Number(e.target.value) });
                            }}
                          />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>High</span>
                          <span className="audience-scale-val-badge">{scaleRatings[opt.id]}</span>
                        </div>
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                      Submit Ratings
                    </button>
                  </form>
                )}

                {/* 5. Ranking */}
                {slide?.type === 'ranking' && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      Order items from top (highest) to bottom (lowest):
                    </p>
                    <div className="audience-ranking-list">
                      {rankedItems.map((item, idx) => (
                        <div key={item.id} className="audience-ranking-row">
                          <span style={{ fontWeight: 600 }}>{idx + 1}. {item.text}</span>
                          <div className="audience-ranking-controls">
                            <button 
                              className="btn btn-secondary btn-icon" 
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => moveRankItem(idx, -1)}
                              disabled={idx === 0}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button 
                              className="btn btn-secondary btn-icon" 
                              style={{ width: '32px', height: '32px' }}
                              onClick={() => moveRankItem(idx, 1)}
                              disabled={idx === rankedItems.length - 1}
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-primary" onClick={handleRankingSubmit} style={{ marginTop: '10px' }}>
                      Submit Ranking
                    </button>
                  </div>
                )}

                {/* 7. Guess the Number */}
                {slide?.type === 'guess' && (
                  <form onSubmit={handleGuessSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="settings-group">
                      <label style={{ textAlign: 'center', display: 'block' }}>Enter your guess:</label>
                      <input 
                        type="number"
                        className="input-text"
                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
                        placeholder="e.g. 50"
                        value={guessValue}
                        onChange={(e) => setGuessValue(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Submit Guess
                    </button>
                  </form>
                )}

                {/* 8. 100 Points */}
                {slide?.type === 'points' && (
                  <form onSubmit={handlePointsSubmit} style={{ width: '100%' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '15px' }}>
                      Distribute exactly <strong>100 points</strong> among these options:
                    </p>
                    {slide.options?.map(opt => (
                      <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{opt.text}</span>
                        <input 
                          type="number" 
                          className="input-text" 
                          style={{ width: '80px', textAlign: 'center' }}
                          min="0"
                          max="100"
                          value={pointsAllocations[opt.id] || 0}
                          onChange={(e) => {
                            setPointsAllocations({ ...pointsAllocations, [opt.id]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) });
                          }}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-glass)', marginBottom: '15px', fontWeight: 700 }}>
                      <span>Total Allocated:</span>
                      <span style={{ color: getPointsSum() === 100 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {getPointsSum()} / 100
                      </span>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={getPointsSum() !== 100}>
                      Submit Points
                    </button>
                  </form>
                )}

                {/* 9. 2x2 Grid */}
                {slide?.type === 'grid' && (
                  <form onSubmit={handleGridSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {slide.options?.map(opt => (
                      <div key={opt.id} style={{ paddingBottom: '10px', borderBottom: '1px solid var(--border-glass)' }}>
                        <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--primary)' }}>{opt.text}</label>
                        <div className="audience-scale-item">
                          <label>{slide.xAxisLabel || 'X Axis'}</label>
                          <div className="audience-scale-slider-row">
                            <input 
                              type="range" min="1" max="10" step="1"
                              value={gridCoords[opt.id]?.x || 5}
                              onChange={(e) => {
                                const yVal = gridCoords[opt.id]?.y || 5;
                                setGridCoords({ ...gridCoords, [opt.id]: { x: Number(e.target.value), y: yVal } });
                              }}
                            />
                            <span className="audience-scale-val-badge">{gridCoords[opt.id]?.x || 5}</span>
                          </div>
                        </div>
                        <div className="audience-scale-item" style={{ marginTop: '5px' }}>
                          <label>{slide.yAxisLabel || 'Y Axis'}</label>
                          <div className="audience-scale-slider-row">
                            <input 
                              type="range" min="1" max="10" step="1"
                              value={gridCoords[opt.id]?.y || 5}
                              onChange={(e) => {
                                const xVal = gridCoords[opt.id]?.x || 5;
                                setGridCoords({ ...gridCoords, [opt.id]: { x: xVal, y: Number(e.target.value) } });
                              }}
                            />
                            <span className="audience-scale-val-badge">{gridCoords[opt.id]?.y || 5}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary">
                      Submit Coordinates
                    </button>
                  </form>
                )}

                {/* 10. Quick Form */}
                {slide?.type === 'form' && (
                  <form onSubmit={handleFormSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {slide.options?.map(opt => (
                      <div key={opt.id} className="settings-group">
                        <label>{opt.text}</label>
                        <input 
                          type="text" 
                          className="input-text"
                          required
                          value={formData[opt.text] || ''}
                          onChange={(e) => {
                            setFormData({ ...formData, [opt.text]: e.target.value });
                          }}
                        />
                      </div>
                    ))}
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                      Submit Form
                    </button>
                  </form>
                )}

                {/* 11. Pin on Image */}
                {slide?.type === 'pin' && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      Tap/Click on the canvas box below to place your pin:
                    </p>
                    
                    <div className="pin-image-wrapper" onClick={handlePinClick} style={{ cursor: 'crosshair', width: '300px', height: '300px' }}>
                      {slide.pinImageType === 'quadrants' ? (
                        <svg className="pin-img" viewBox="0 0 500 500" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <line x1="250" y1="0" x2="250" y2="500" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                          <line x1="0" y1="250" x2="500" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                        </svg>
                      ) : (
                        <svg className="pin-img" viewBox="0 0 500 500" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                          <circle cx="250" cy="250" r="140" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                          <circle cx="250" cy="250" r="60" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
                        </svg>
                      )}
                      
                      {/* Local pin marker overlay before submission */}
                      {localPin && (
                        <div 
                          className="pin-marker"
                          style={{ 
                            left: `${localPin.x}%`, 
                            top: `${localPin.y}%`,
                            background: 'var(--primary)',
                            boxShadow: '0 0 10px var(--primary)'
                          }}
                        ></div>
                      )}
                    </div>

                    <button className="btn btn-primary" onClick={handlePinSubmit} style={{ width: '100%' }} disabled={!localPin}>
                      Submit Pin Location
                    </button>
                  </div>
                )}

                {/* 13. Stopwatch / Countdown */}
                {slide?.type === 'stopwatch' && (
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px' }}>
                    <div style={{
                      fontSize: '4.5rem', 
                      fontWeight: 900, 
                      fontFamily: 'monospace', 
                      color: 'var(--primary)', 
                      letterSpacing: '2px',
                      textShadow: '0 0 30px rgba(6, 182, 212, 0.3)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '15px 30px',
                      borderRadius: '16px',
                      border: '1px solid var(--border-glass)',
                      textAlign: 'center',
                      width: '100%',
                      maxWidth: '320px'
                    }}>
                      {Math.floor(stopwatchTime / 60000).toString().padStart(2, '0')}:
                      {Math.floor((stopwatchTime % 60000) / 1000).toString().padStart(2, '0')}.
                      {(stopwatchTime % 1000).toString().padStart(3, '0')}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'center' }}>
                      {stopwatchActive ? '⏱️ Timer Ticking...' : '⏸️ Timer Paused / Waiting'}
                    </span>
                  </div>
                )}

                {/* 14. Brainstorm Ideas (exactly 2 inputs) */}
                {slide?.type === 'brainstorm' && (
                  <form onSubmit={handleBrainstormSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '5px' }}>
                      Submit your top 2 ideas/opinions to the board:
                    </p>
                    {[0, 1].map((idx) => (
                      <input 
                        key={idx}
                        type="text"
                        maxLength="30"
                        className="input-text"
                        placeholder={`Idea #${idx + 1} (Max 30 characters)`}
                        value={brainstormInputs[idx] || ''}
                        onChange={(e) => {
                          const updated = [...brainstormInputs];
                          updated[idx] = e.target.value;
                          setBrainstormInputs(updated);
                        }}
                        required
                        style={{ textAlign: 'center' }}
                      />
                    ))}
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={brainstormInputs.some(w => !w.trim())}>
                      Submit Ideas 🚀
                    </button>
                  </form>
                )}
              </>
            )}

            {/* 6. Q&A (persistent form + updates) */}
            {slide?.type === 'qa' && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <form onSubmit={handleQaSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    className="input-text" 
                    placeholder="Ask a question..."
                    value={qaText}
                    onChange={(e) => setQaText(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-icon" style={{ borderRadius: 'var(--radius-sm)' }}>
                    <Send size={16} />
                  </button>
                </form>

                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Questions ({ (slide.responses || []).length })</span>
                  {(slide.responses || [])
                    .filter(q => !q.answered)
                    .sort((a,b) => b.upvotes - a.upvotes)
                    .map((q) => (
                      <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.9rem', wordBreak: 'break-word', paddingRight: '10px' }}>{q.text}</span>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '4px 8px', display: 'flex', gap: '4px', alignItems: 'center', fontSize: '0.8rem' }}
                          onClick={() => handleUpvoteQa(q.id)}
                        >
                          <ThumbsUp size={12} /> {q.upvotes}
                        </button>
                      </div>
                    ))}
                  {(slide.responses || []).length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '10px' }}>
                      Be the first to ask!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 12. Quiz (persistent timer + lock feedbacks) */}
            {slide?.type === 'quiz' && (
              <div style={{ width: '100%', marginTop: '10px' }}>
                {!votingLocked && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: quizTimeRemaining > 5 ? 'white' : 'var(--accent-red)' }}>
                      {Math.max(quizTimeRemaining, 0)}s
                    </div>
                    <div className="quiz-timer-bar">
                      <div className="quiz-timer-fill" style={{ width: `${Math.max(0, (quizTimeRemaining / (slide.timeLimit || 15)) * 100)}%` }}></div>
                    </div>
                  </div>
                )}

                {hasVoted && !votingLocked && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <Award size={48} className="logo-icon animate-pulse" style={{ margin: '0 auto 12px auto' }} />
                    <h3>Answer Submitted!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                      Waiting for the timer to end...
                    </p>
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      onClick={() => setHasVoted(false)} 
                      style={{ marginTop: '16px', padding: '8px 16px', fontSize: '0.85rem' }}
                    >
                      Submit Another Response
                    </button>
                  </div>
                )}

                 {!hasVoted && !votingLocked && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '12px',
                    width: '100%'
                  }}>
                    {slide.options?.map((opt, i) => {
                      const colors = [
                        { bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))', border: 'rgba(239, 68, 68, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))', border: 'rgba(59, 130, 246, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))', border: 'rgba(16, 185, 129, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))', border: 'rgba(245, 158, 11, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))', border: 'rgba(139, 92, 246, 0.4)' },
                        { bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.05))', border: 'rgba(6, 182, 212, 0.4)' }
                      ];
                      return (
                        <button 
                          key={opt.id} 
                          className={`audience-poll-choice-btn animate-fade ${isProTheme ? 'btn-game-pro' : 'btn-game-arcade'}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '16px 20px',
                            borderRadius: '14px',
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleQuizAnswer(i)}
                          onMouseEnter={() => playHoverSound(isProTheme)}
                        >
                          <span className={isProTheme ? 'option-badge-pro' : 'option-badge-arcade'}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span style={{ flex: 1, textAlign: 'left' }}>
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Escape Room Participant Breakout Solve Interface */}
            {slide?.type === 'escaperoom' && (
              <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '500px', padding: '24px', background: '#0b0f19', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '20px', textAlign: 'center' }}>
                {!isGroupJoined ? (
                  /* 🔐 Step 1: Pre-Assigned Group Room Code Entry */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.85rem', display: 'inline-block', margin: '0 auto' }}>
                      🔐 Pre-Assigned Breakout Entry
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                      Enter Your Group Room Access Code
                    </h2>
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      Please enter the specific group code assigned to you by your host (e.g. <strong>ALPHA-101</strong>, <strong>BETA-202</strong>, <strong>GAMMA-303</strong>).
                    </p>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const code = userEnteredGroupCode.trim().toUpperCase();
                      if (!code) return;

                      let roomName = 'Room Alpha (Cyber Vault)';
                      if (code.includes('BETA') || code.includes('202')) roomName = 'Room Beta (Quantum Core)';
                      else if (code.includes('GAMMA') || code.includes('303')) roomName = 'Room Gamma (Matrix Grid)';
                      else if (code.includes('DELTA') || code.includes('404')) roomName = 'Room Delta (AI Substation)';
                      else if (code.includes('EPSILON') || code.includes('505')) roomName = 'Room Epsilon (Nebula Lab)';
                      
                      setAssignedBreakoutRoom(roomName);
                      setIsGroupJoined(true);
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input 
                        type="text" 
                        className="input-text"
                        placeholder="Enter Group Code (e.g. ALPHA-101)"
                        value={userEnteredGroupCode}
                        onChange={(e) => setUserEnteredGroupCode(e.target.value)}
                        style={{ padding: '12px', textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}
                        required
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: 800, fontSize: '0.95rem' }}>
                        🔑 Join Assigned Group Room 🚀
                      </button>
                    </form>
                  </div>
                ) : (
                  /* 🧩 Step 2: Inside Joined Breakout Room */
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', padding: '6px 14px', borderRadius: '20px', fontWeight: 800, fontSize: '0.8rem' }}>
                        👥 {assignedBreakoutRoom}
                      </div>
                      <button 
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          if (confirm('🚪 Exit this breakout room and enter a different group access code?')) {
                            setIsGroupJoined(false);
                            setUserEnteredGroupCode('');
                          }
                        }}
                        style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)' }}
                      >
                        🚪 Exit & Switch Room
                      </button>
                    </div>

                    {/* Team Live Video Stream Box with Mobile Camera Feed */}
                    <div style={{ height: '130px', background: '#030712', borderRadius: '12px', border: '1px solid var(--border-glass)', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {participantVideoOn ? (
                        <video 
                          ref={mobileVideoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          📹 Camera Muted
                        </span>
                      )}
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '6px', zIndex: 10 }}>
                        <button 
                          className={`btn ${participantMicMuted ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => setParticipantMicMuted(!participantMicMuted)}
                          style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                          title="Toggle Microphone"
                        >
                          {participantMicMuted ? <MicOff size={12} color="#ef4444" /> : <Mic size={12} color="#10b981" />}
                          {participantMicMuted ? 'Muted' : 'Mic Active'}
                        </button>
                        <button 
                          className={`btn ${!participantVideoOn ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => setParticipantVideoOn(!participantVideoOn)}
                          style={{ padding: '4px 8px', fontSize: '0.7rem', display: 'flex', gap: '4px', alignItems: 'center' }}
                          title="Toggle Camera"
                        >
                          {!participantVideoOn ? <VideoOff size={12} color="#ef4444" /> : <Video size={12} color="#06b6d4" />}
                          {!participantVideoOn ? 'Cam Off' : 'Camera On'}
                        </button>
                      </div>
                    </div>

                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', marginBottom: '10px' }}>
                      🧩 Escape Room Cipher Puzzle
                    </h2>
                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '20px' }}>
                      {slide.question || 'Decipher the secret code with your team to unlock the breakout room!'}
                    </p>

                    {!escapeRoomUnlocked ? (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (escapeRoomKeyInput.trim().toUpperCase() === (slide.secretKey || 'PUZZLE-904')) {
                          setEscapeRoomUnlocked(true);
                        } else {
                          alert('❌ Incorrect key code! Discuss with your team and try again.');
                        }
                      }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input 
                          type="text" 
                          className="input-text"
                          placeholder="Enter Secret Key Code (e.g. PUZZLE-904)"
                          value={escapeRoomKeyInput}
                          onChange={(e) => setEscapeRoomKeyInput(e.target.value)}
                          style={{ padding: '12px', textAlign: 'center', fontSize: '1rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}
                          required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontWeight: 800, fontSize: '0.95rem' }}>
                          🔓 Submit Unlock Key
                        </button>
                      </form>
                    ) : (
                      <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '12px', color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>
                        🎉 Vault Unlocked! Your team escaped successfully! 🏆
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isLockedOut && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: '#0b0f19', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '24px',
          color: '#f8fafc', textAlign: 'center'
        }}>
          <div className="logo-icon" style={{ width: '64px', height: '64px', backgroundColor: 'var(--accent-red)', margin: '0 auto 24px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '12px' }}>Access Blocked</h2>
          <p style={{ color: '#94a3b8', maxWidth: '400px', fontSize: '1rem', lineHeight: 1.6, marginBottom: '24px' }}>
            You switched tabs or minimized the browser during a <strong>Focus Mode</strong> slide. This attempt has been blocked.
          </p>
          <div style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem' }}>
            The presenter has been notified of this violation.
          </div>
        </div>
      )}

      {showFocusWarningModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 19999, padding: '24px'
        }}>
          <div className="glass-card animate-fade" style={{ width: '90%', maxWidth: '400px', background: '#0b0f19', border: '1px solid var(--border-glass)', padding: '30px 24px', textAlign: 'center', color: '#f8fafc' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>Tab Switch Detected</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Do not switch tabs, minimize the window, or open other apps. You have <strong>{focusWarnings} warning(s) left</strong> before you are locked out.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => setShowFocusWarningModal(false)}
            >
              I Understand, Resume Test
            </button>
          </div>
        </div>
      )}

      {/* Floating Host Chat Button */}
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setShowHostChatDrawer(!showHostChatDrawer)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10000,
          borderRadius: '30px',
          padding: '10px 18px',
          boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
          fontWeight: 800,
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        💬 Message Host
      </button>

      {/* Admin <-> Participant Direct Chat Drawer Modal */}
      {showHostChatDrawer && (
        <div 
          className="glass-card animate-fade"
          style={{
            position: 'fixed',
            bottom: '75px',
            right: '20px',
            width: '340px',
            maxHeight: '450px',
            background: '#0b0f19',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            zIndex: 10001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ background: '#0f172a', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💬 Direct Chat with Host
            </div>
            <button 
              type="button"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}
              onClick={() => setShowHostChatDrawer(false)}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px' }}>
              🔒 Private Channel (Admin ↔ You Only)
            </div>
            {directChatMessages.map((msg) => (
              <div 
                key={msg.id}
                style={{
                  alignSelf: msg.sender.includes('Admin') ? 'flex-start' : 'flex-end',
                  maxWidth: '82%',
                  background: msg.sender.includes('Admin') ? 'rgba(6, 182, 212, 0.12)' : 'rgba(37, 99, 235, 0.25)',
                  border: `1px solid ${msg.sender.includes('Admin') ? 'rgba(6, 182, 212, 0.3)' : 'rgba(37, 99, 235, 0.4)'}`,
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
              if (!participantChatText.trim()) return;
              const newMsg = {
                id: Math.random().toString(36).substr(2, 9),
                sender: nickname || 'Participant',
                text: participantChatText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setDirectChatMessages([...directChatMessages, newMsg]);
              if (socketRef.current) {
                socketRef.current.emit('participant-direct-chat', { roomCode, message: newMsg });
              }
              setParticipantChatText('');
            }}
            style={{ padding: '10px', background: '#090d16', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '6px' }}
          >
            <input 
              type="text"
              className="input-text"
              placeholder="Type message to host..."
              value={participantChatText}
              onChange={(e) => setParticipantChatText(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '8px 10px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
