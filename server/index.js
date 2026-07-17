import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static React files
app.use(express.static(path.resolve(__dirname, '..', 'client', 'dist')));

app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running!', socketio: true });
});

// Serve index.html for all other requests to allow client-side routing
app.get('*', (req, res) => {
  const indexPath = path.resolve(__dirname, '..', 'client', 'dist', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Server Error: Client files not found or inaccessible.');
    }
  });
});

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = {};

function generateRoomCode() {
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms[code]);
  return code;
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Host Room
  socket.on('host_presentation', ({ slides, presentationId, theme }) => {
    const roomCode = generateRoomCode();
    
    rooms[roomCode] = {
      roomCode,
      presentationId,
      presenterSocketId: socket.id,
      currentSlideIndex: 0,
      votingLocked: slides[0] && slides[0].timeLimit > 0 && slides[0].timerAutoStart === false,
      answersVisible: true,
      leaderboardVisible: false,
      theme: theme || 'neon',
      slides: slides.map((slide) => ({
        ...slide,
        responses: slide.type === 'poll' ? {} : []
      })),
      leaderboard: {},
      participants: {}
    };

    socket.join(roomCode);
    socket.emit('presentation_hosted', {
      roomCode,
      currentSlideIndex: 0,
      slides: rooms[roomCode].slides,
      theme: rooms[roomCode].theme
    });

    console.log(`Presentation hosted. Code: ${roomCode}, Theme: ${rooms[roomCode].theme}`);
  });

  // 2. Join Room
  socket.on('join_room', ({ roomCode, nickname }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      return callback({ success: false, message: 'Room not found. Please check the code.' });
    }

    socket.join(roomCode);
    room.participants[socket.id] = nickname || 'Anonymous';

    const currentSlide = room.slides[room.currentSlideIndex];
    callback({
      success: true,
      currentSlideIndex: room.currentSlideIndex,
      slide: currentSlide,
      votingLocked: room.votingLocked,
      answersVisible: room.answersVisible,
      leaderboardVisible: room.leaderboardVisible,
      leaderboard: room.leaderboard,
      theme: room.theme
    });

    io.to(room.presenterSocketId).emit('participant_joined', {
      count: Object.keys(room.participants).length,
      nickname: nickname
    });

    console.log(`Participant Joined: ${nickname || 'Anonymous'} in ${roomCode}`);
  });

  // 3. Change Slide
  socket.on('change_slide', ({ roomCode, index }) => {
    const room = rooms[roomCode];
    if (!room || room.presenterSocketId !== socket.id) return;

    if (index >= 0 && index < room.slides.length) {
      room.currentSlideIndex = index;
      const newSlide = room.slides[index];
      room.votingLocked = newSlide.timeLimit > 0 && newSlide.timerAutoStart === false;
      room.leaderboardVisible = false;

      socket.to(roomCode).emit('slide_changed', {
        currentSlideIndex: index,
        slide: newSlide,
        votingLocked: room.votingLocked,
        answersVisible: room.answersVisible,
        leaderboardVisible: room.leaderboardVisible
      });
      console.log(`Slide index in room ${roomCode} changed to ${index}`);
    }
  });

  // 4. Submit Answer
  socket.on('submit_response', ({ roomCode, response }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      return callback && callback({ success: false, message: 'Room not found.' });
    }

    if (room.votingLocked) {
      return callback && callback({ success: false, message: 'Voting is locked for this slide.' });
    }

    const currentSlide = room.slides[room.currentSlideIndex];
    const nickname = room.participants[socket.id] || 'Anonymous';

    if (currentSlide.type === 'poll') {
      const { optionId } = response;
      if (optionId !== undefined) {
        currentSlide.responses[optionId] = (currentSlide.responses[optionId] || 0) + 1;
      }
    } else if (currentSlide.type === 'wordcloud') {
      const { words } = response;
      if (Array.isArray(words)) {
        words.forEach(word => {
          if (word && word.trim()) {
            currentSlide.responses.push(word.trim().toLowerCase());
          }
        });
      }
    } else if (currentSlide.type === 'qa') {
      const { text } = response;
      if (text && text.trim()) {
        const questionObj = {
          id: Math.random().toString(36).substr(2, 9),
          text: text.trim(),
          upvotes: 0,
          timestamp: Date.now(),
          answered: false,
          userSocketId: socket.id
        };
        currentSlide.responses.push(questionObj);
        io.to(roomCode).emit('qa_updated', { responses: currentSlide.responses });
      }
    } else if (currentSlide.type === 'quiz') {
      const { answerIndex, timeRemaining, totalTime } = response;
      const alreadyVoted = currentSlide.responses.some(r => r.socketId === socket.id);
      if (alreadyVoted) {
        return callback && callback({ success: false, message: 'You have already submitted an answer!' });
      }

      const isCorrect = Number(answerIndex) === Number(currentSlide.correctAnswerIndex);
      let points = 0;
      if (isCorrect) {
        const timeRatio = totalTime > 0 ? (timeRemaining / totalTime) : 0;
        points = Math.round(500 + 500 * timeRatio);
      }

      currentSlide.responses.push({
        socketId: socket.id,
        nickname,
        answerIndex,
        isCorrect,
        points
      });

      room.leaderboard[nickname] = (room.leaderboard[nickname] || 0) + points;
    } else if (currentSlide.type === 'openended') {
      const { text } = response;
      if (text && text.trim()) {
        currentSlide.responses.push(text.trim());
      }
    } else if (currentSlide.type === 'scales') {
      const { ratings } = response; // { [optId]: ratingValue }
      if (ratings) {
        currentSlide.responses.push({ ratings });
      }
    } else if (currentSlide.type === 'ranking') {
      const { ranking } = response; // [itemId1, itemId2, ...]
      if (Array.isArray(ranking)) {
        currentSlide.responses.push({ ranking });
      }
    } else if (currentSlide.type === 'guess') {
      const { guess } = response;
      if (guess !== undefined) {
        currentSlide.responses.push({ nickname, guess: Number(guess) });
      }
    } else if (currentSlide.type === 'points') {
      const { points } = response; // { [itemId]: points }
      if (points) {
        currentSlide.responses.push({ points });
      }
    } else if (currentSlide.type === 'grid') {
      const { grid } = response; // { [itemId]: { x, y } }
      if (grid) {
        currentSlide.responses.push({ grid });
      }
    } else if (currentSlide.type === 'form') {
      const { form } = response; // { [field]: value }
      if (form) {
        currentSlide.responses.push({ form });
      }
    } else if (currentSlide.type === 'pin') {
      const { x, y } = response; // { x, y } percentages
      if (x !== undefined && y !== undefined) {
        currentSlide.responses.push({ x, y });
      }
    }

    io.to(room.presenterSocketId).emit('responses_updated', {
      slideIndex: room.currentSlideIndex,
      responses: currentSlide.responses,
      leaderboard: room.leaderboard
    });

    if (callback) callback({ success: true });
  });

  // 5. Upvote Question
  socket.on('upvote_question', ({ roomCode, questionId }) => {
    const room = rooms[roomCode];
    if (!room) return;

    const currentSlide = room.slides[room.currentSlideIndex];
    if (currentSlide.type === 'qa') {
      const question = currentSlide.responses.find(q => q.id === questionId);
      if (question) {
        question.upvotes += 1;
        io.to(roomCode).emit('qa_updated', { responses: currentSlide.responses });
      }
    }
  });

  // 6. Answer Question
  socket.on('answer_question', ({ roomCode, questionId }) => {
    const room = rooms[roomCode];
    if (!room || room.presenterSocketId !== socket.id) return;

    const currentSlide = room.slides[room.currentSlideIndex];
    if (currentSlide.type === 'qa') {
      const question = currentSlide.responses.find(q => q.id === questionId);
      if (question) {
        question.answered = true;
        io.to(roomCode).emit('qa_updated', { responses: currentSlide.responses });
      }
    }
  });

  // 7. Toggle answers visibility
  socket.on('toggle_answers', ({ roomCode, visible }) => {
    const room = rooms[roomCode];
    if (!room || room.presenterSocketId !== socket.id) return;

    room.answersVisible = visible;
    socket.to(roomCode).emit('answers_toggled', { visible });
  });

  // 8. Toggle lock
  socket.on('toggle_lock', ({ roomCode, locked }) => {
    const room = rooms[roomCode];
    if (!room || room.presenterSocketId !== socket.id) return;

    room.votingLocked = locked;
    socket.to(roomCode).emit('lock_toggled', { locked });
  });

  // 9. Toggle leaderboard
  socket.on('toggle_leaderboard', ({ roomCode, visible }) => {
    const room = rooms[roomCode];
    if (!room || room.presenterSocketId !== socket.id) return;

    room.leaderboardVisible = visible;
    socket.to(roomCode).emit('leaderboard_toggled', { visible, leaderboard: room.leaderboard });
  });

  // 10. Change presentation theme on the fly
  socket.on('change_theme', ({ roomCode, theme }) => {
    const room = rooms[roomCode];
    if (!room || room.presenterSocketId !== socket.id) return;

    room.theme = theme;
    io.to(roomCode).emit('theme_changed', { theme });
    console.log(`Theme in room ${roomCode} changed to ${theme}`);
  });

  // 11. Clear slide responses
  socket.on('clear_responses', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.presenterSocketId !== socket.id) return;

    const currentSlide = room.slides[room.currentSlideIndex];
    currentSlide.responses = currentSlide.type === 'poll' ? {} : [];

    if (currentSlide.type === 'quiz') {
      room.leaderboard = {};
    }

    io.to(roomCode).emit('responses_cleared', {
      slideIndex: room.currentSlideIndex,
      type: currentSlide.type
    });

    socket.emit('responses_updated', {
      slideIndex: room.currentSlideIndex,
      responses: currentSlide.responses,
      leaderboard: room.leaderboard
    });
  });

  socket.on('disconnect', () => {
    for (const code in rooms) {
      if (rooms[code].presenterSocketId === socket.id) {
        socket.to(code).emit('room_closed', { message: 'Presenter disconnected.' });
        delete rooms[code];
      } else if (rooms[code].participants[socket.id]) {
        const nickname = rooms[code].participants[socket.id];
        delete rooms[code].participants[socket.id];
        io.to(rooms[code].presenterSocketId).emit('participant_left', {
          count: Object.keys(rooms[code].participants).length,
          nickname
        });
      }
    }
  });
});

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`PulsePoll Server running on port ${PORT}`);
});
