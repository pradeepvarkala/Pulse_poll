import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, ThumbsUp, Lock, Trophy, Award, CheckCircle, XCircle, ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';

export default function Audience({ defaultRoomCode = '', onBackToMenu }) {
  // Join states
  const [roomCode, setRoomCode] = useState(defaultRoomCode.replace(/\D/g, ''));
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [needNickname, setNeedNickname] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [theme, setTheme] = useState('neon');

  // Active slide state
  const [slide, setSlide] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [votingLocked, setVotingLocked] = useState(false);
  
  // Real-time submission trackers
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState(null);
  const [wordCloudInputs, setWordCloudInputs] = useState(['', '', '']);
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
      setWordCloudInputs(['', '', '']);
      setOpenEndedText('');
      setGuessValue('');
      
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
      setWordCloudInputs(['', '', '']);
      setOpenEndedText('');
      setGuessValue('');
      setLocalPin(null);
      initializeSlideInputs(slide);
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
    setSelectedOptionId(optionId);
    handleSubmitResponse({ optionId });
  };

  // 2. Word Cloud
  const handleWordCloudSubmit = (e) => {
    e.preventDefault();
    const validWords = wordCloudInputs.filter(w => w.trim().length > 0);
    if (validWords.length === 0) return;
    handleSubmitResponse({ words: validWords });
  };

  // 3. Open Ended
  const handleOpenEndedSubmit = (e) => {
    e.preventDefault();
    if (!openEndedText.trim()) return;
    handleSubmitResponse({ text: openEndedText.trim() });
  };

  // 4. Scales
  const handleScalesSubmit = (e) => {
    e.preventDefault();
    handleSubmitResponse({ ratings: scaleRatings });
  };

  // 5. Ranking (Up/Down sorting)
  const moveRankItem = (index, direction) => {
    const list = [...rankedItems];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    
    // Swap
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setRankedItems(list);
  };
  const handleRankingSubmit = () => {
    handleSubmitResponse({ ranking: rankedItems.map(item => item.id) });
  };

  // 6. Q&A
  const handleQaSubmit = (e) => {
    e.preventDefault();
    if (!qaText.trim()) return;
    socketRef.current.emit('submit_response', {
      roomCode: roomCode.trim(),
      response: { text: qaText }
    });
    setQaText('');
  };
  const handleUpvoteQa = (qId) => {
    socketRef.current.emit('upvote_question', { roomCode: roomCode.trim(), questionId: qId });
  };

  // 7. Guess the Number
  const handleGuessSubmit = (e) => {
    e.preventDefault();
    if (guessValue === '') return;
    handleSubmitResponse({ guess: Number(guessValue) });
  };

  // 8. 100 Points
  const getPointsSum = () => Object.values(pointsAllocations).reduce((a, b) => a + Number(b || 0), 0);
  const handlePointsSubmit = (e) => {
    e.preventDefault();
    if (getPointsSum() !== 100) return;
    handleSubmitResponse({ points: pointsAllocations });
  };

  // 9. 2x2 Grid
  const handleGridSubmit = (e) => {
    e.preventDefault();
    handleSubmitResponse({ grid: gridCoords });
  };

  // 10. Quick Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmitResponse({ form: formData });
  };

  // 11. Pin on Image (Click canvas)
  const handlePinClick = (e) => {
    if (hasVoted || votingLocked) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLocalPin({ x, y });
  };
  const handlePinSubmit = () => {
    if (!localPin) return;
    handleSubmitResponse(localPin);
  };

  // 12. Quiz Choice
  const handleQuizAnswer = (optIndex) => {
    if (hasVoted || votingLocked) return;
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
    <div className={`audience-mobile-container theme-${theme}`} style={{ padding: '16px 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 12px 8px', borderBottom: '1px solid var(--border-glass)', marginBottom: '16px', gap: '12px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Room: {roomCode}</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{nickname || 'Anonymous'}</span>
        <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={handleExit}>
          Leave
        </button>
      </div>

      <div className="glass-card audience-card animate-fade" style={{ flex: 1, justifyContent: 'flex-start', minHeight: '420px' }}>
        
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    {slide.options?.map((opt) => (
                      <button key={opt.id} className="audience-poll-choice-btn" onClick={() => handleVotePoll(opt.id)}>
                        {opt.text}
                      </button>
                    ))}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {slide.options?.map((opt, i) => (
                      <button key={opt.id} className="audience-poll-choice-btn" onClick={() => handleQuizAnswer(i)}>
                        {opt.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
