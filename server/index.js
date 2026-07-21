import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { Resend } from 'resend';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const JWT_SECRET = process.env.JWT_SECRET || 'pulsepoll-super-secret-jwt-key-2026';

// Store active OTPs in memory for verification
const activeOtps = {};

// Initialize TiDB Cloud Connection Pool
const pool = process.env.DATABASE_URL ? mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true
  }
}) : null;

// Initialize Database Tables
async function initDb() {
  if (!pool) {
    console.log('[Database] DATABASE_URL is not set. Running in-memory fallbacks.');
    return;
  }
  
  try {
    const connection = await pool.getConnection();
    console.log('[Database] Connected to TiDB Cloud MySQL cluster successfully!');
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        email VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        avatar VARCHAR(255),
        tier VARCHAR(20) DEFAULT 'free',
        stripe_customer_id VARCHAR(100) DEFAULT NULL,
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Create presentations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS presentations (
        id VARCHAR(36) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        theme VARCHAR(50) DEFAULT 'corporate',
        slides JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_email (user_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    
    console.log('[Database] Database schema initialized.');
    connection.release();
  } catch (err) {
    console.error('[Database Error] Failed to initialize database tables:', err);
  }
}

initDb();

const app = express();
app.use(cors());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Serve static React files
app.use(express.static(path.resolve(__dirname, '..', 'client', 'dist')));

app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running!', socketio: true });
});

app.post('/api/send-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  const emailKey = email.trim().toLowerCase();
  activeOtps[emailKey] = code;
  console.log(`[OTP Request] Sending code ${code} to ${emailKey}`);

  if (!resend) {
    console.log(`[OTP Request] RESEND_API_KEY is not configured. Falling back to simulated login.`);
    return res.json({ 
      success: true, 
      simulated: true,
      message: 'RESEND_API_KEY not configured. OTP printed to server logs.' 
    });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'PulsePoll <onboarding@resend.dev>',
      to: emailKey,
      subject: 'Your PulsePoll Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #6366f1; text-align: center; margin-bottom: 24px;">PulsePoll Authentication</h2>
          <p>Hello,</p>
          <p>You requested a verification code to access PulsePoll. Use the 6-digit code below to complete your registration:</p>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 2rem; font-weight: 800; letter-spacing: 6px; text-align: center; color: #0f172a; margin: 24px 0;">
            ${code}
          </div>
          <p style="color: #64748b; font-size: 0.85rem;">This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="text-align: center; font-size: 0.8rem; color: #94a3b8;">&copy; 2026 PulsePoll. All rights reserved.</p>
        </div>
      `
    });

    if (error) {
      console.error('[OTP Error] Resend failed:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[OTP Success] Email sent successfully via Resend:', data.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('[OTP Error] Exception thrown:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required.' });
  }

  const emailKey = email.trim().toLowerCase();
  const expectedCode = activeOtps[emailKey];
  if (!expectedCode || expectedCode !== code) {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  delete activeOtps[emailKey];

  const isAdmin = emailKey === 'pradeepvarkala@gmail.com';
  let user = {
    email: emailKey,
    name: email.split('@')[0],
    avatar: null,
    tier: isAdmin ? 'admin' : 'free',
    subscription_status: isAdmin ? 'active' : 'inactive'
  };

  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailKey]);
      if (rows.length > 0) {
        user = rows[0];
        if (isAdmin && user.tier !== 'admin') {
          user.tier = 'admin';
          user.subscription_status = 'active';
          await pool.query('UPDATE users SET tier = "admin", subscription_status = "active" WHERE email = ?', [emailKey]);
        }
      } else {
        await pool.query(
          'INSERT INTO users (email, name, avatar, tier, subscription_status) VALUES (?, ?, ?, ?, ?)',
          [user.email, user.name, user.avatar, user.tier, user.subscription_status]
        );
      }
    } catch (err) {
      console.error('[Verify OTP DB Error]:', err);
    }
  }

  const token = jwt.sign({ email: user.email, tier: user.tier }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user });
});

app.post('/api/auth/google', async (req, res) => {
  const { name, email, avatar } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const emailKey = email.trim().toLowerCase();
  const isAdmin = emailKey === 'pradeepvarkala@gmail.com';
  let user = {
    email: emailKey,
    name: name || email.split('@')[0],
    avatar: avatar || null,
    tier: isAdmin ? 'admin' : 'free',
    subscription_status: isAdmin ? 'active' : 'inactive'
  };

  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailKey]);
      if (rows.length > 0) {
        user = rows[0];
        const targetTier = isAdmin ? 'admin' : user.tier;
        const targetStatus = isAdmin ? 'active' : user.subscription_status;
        await pool.query('UPDATE users SET name = ?, avatar = ?, tier = ?, subscription_status = ? WHERE email = ?', [name, avatar, targetTier, targetStatus, emailKey]);
        user.name = name;
        user.avatar = avatar;
        user.tier = targetTier;
        user.subscription_status = targetStatus;
      } else {
        await pool.query(
          'INSERT INTO users (email, name, avatar, tier, subscription_status) VALUES (?, ?, ?, ?, ?)',
          [user.email, user.name, user.avatar, user.tier, user.subscription_status]
        );
      }
    } catch (err) {
      console.error('[Google Auth DB Error]:', err);
    }
  }

  const token = jwt.sign({ email: user.email, tier: user.tier }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user });
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { email, priceId } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured on this server.' });
  }

  try {
    let stripeCustomerId = null;
    if (pool) {
      const [rows] = await pool.query('SELECT stripe_customer_id FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        stripeCustomerId = rows[0].stripe_customer_id;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({ email });
      stripeCustomerId = customer.id;
      
      if (pool) {
        await pool.query('UPDATE users SET stripe_customer_id = ? WHERE email = ?', [stripeCustomerId, email]);
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || 'price_placeholder_id',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment=success`,
      cancel_url: `${req.headers.origin}/pricing?payment=cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('[Stripe Session Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    return res.status(500).send('Stripe not configured');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
    const session = event.data.object;
    const customerId = session.customer;
    const status = session.status || session.subscription_status || 'active';
    
    const tier = 'pro'; 

    if (pool) {
      try {
        await pool.query(
          'UPDATE users SET tier = ?, subscription_status = ? WHERE stripe_customer_id = ?',
          [tier, status, customerId]
        );
        console.log(`[Stripe Webhook] Successfully updated customer ${customerId} to pro tier.`);
      } catch (dbErr) {
        console.error('[Stripe Webhook DB Error]:', dbErr);
      }
    }
  }

  res.json({ received: true });
});

// Database REST APIs for Presentations
app.get('/api/presentations', async (req, res) => {
  const email = req.headers['x-user-email'];
  if (!email) {
    return res.status(400).json({ error: 'User email is required in x-user-email header.' });
  }
  
  if (!pool) {
    return res.json([]);
  }
  
  try {
    const [rows] = await pool.query(
      'SELECT id, title, theme, slides, created_at, updated_at FROM presentations WHERE user_email = ? ORDER BY updated_at DESC',
      [email]
    );
    res.json(rows);
  } catch (err) {
    console.error('[API Error] GET /api/presentations:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/presentations', async (req, res) => {
  const email = req.headers['x-user-email'];
  const { id, title, theme, slides } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'User email is required in x-user-email header.' });
  }
  if (!id || !title) {
    return res.status(400).json({ error: 'Presentation id and title are required.' });
  }
  
  if (!pool) {
    return res.json({ success: true, message: 'Local mock save success.' });
  }
  
  try {
    const slidesJson = JSON.stringify(slides || []);
    await pool.query(`
      INSERT INTO presentations (id, user_email, title, theme, slides) 
      VALUES (?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE title = ?, theme = ?, slides = ?
    `, [id, email, title, theme || 'corporate', slidesJson, title, theme || 'corporate', slidesJson]);
    
    res.json({ success: true });
  } catch (err) {
    console.error('[API Error] POST /api/presentations:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/presentations/:id', async (req, res) => {
  const email = req.headers['x-user-email'];
  const { id } = req.params;
  
  if (!email) {
    return res.status(400).json({ error: 'User email is required in x-user-email header.' });
  }
  
  if (!pool) {
    return res.json({ success: true });
  }
  
  try {
    await pool.query(
      'DELETE FROM presentations WHERE id = ? AND user_email = ?',
      [id, email]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[API Error] DELETE /api/presentations:', err);
    res.status(500).json({ error: err.message });
  }
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
  socket.on('host_presentation', async ({ slides, presentationId, theme, userEmail }) => {
    const roomCode = generateRoomCode();
    
    let hostTier = 'free';
    if (pool && userEmail) {
      try {
        const [rows] = await pool.query('SELECT tier FROM users WHERE email = ?', [userEmail]);
        if (rows.length > 0) {
          hostTier = rows[0].tier;
        }
      } catch (err) {
        console.error('Error fetching host tier on host_room:', err);
      }
    }

    rooms[roomCode] = {
      roomCode,
      presentationId,
      presenterSocketId: socket.id,
      currentSlideIndex: 0,
      votingLocked: slides[0] && slides[0].timeLimit > 0 && slides[0].timerAutoStart === false,
      answersVisible: true,
      leaderboardVisible: false,
      theme: theme || 'neon',
      hostTier,
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

    console.log(`Presentation hosted. Code: ${roomCode}, Theme: ${rooms[roomCode].theme}, Tier: ${hostTier}`);
  });

  // 2. Join Room
  socket.on('join_room', ({ roomCode, nickname }, callback) => {
    const room = rooms[roomCode];
    if (!room) {
      return callback({ success: false, message: 'Room not found. Please check the code.' });
    }

    const currentParticipantCount = Object.keys(room.participants).length;
    let maxCapacity = 60;
    if (room.hostTier === 'basic') maxCapacity = 150;
    else if (room.hostTier === 'pro') maxCapacity = 500;
    else if (room.hostTier === 'admin' || room.hostTier === 'enterprise') maxCapacity = 999999;

    if (currentParticipantCount >= maxCapacity) {
      return callback({ 
        success: false, 
        message: `This presentation room is at maximum capacity (${maxCapacity} participants) for the host's tier. Please ask the presenter to upgrade their plan!` 
      });
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

  // Focus Mode (Anti-Cheat) notification
  socket.on('audience_focus_lost', ({ roomCode, nickname, action, warningsLeft }) => {
    const room = rooms[roomCode];
    if (room && room.presenterSocketId) {
      io.to(room.presenterSocketId).emit('presenter_focus_warning', {
        nickname,
        action,
        warningsLeft
      });
      console.log(`[Focus Violation] Room ${roomCode}: ${nickname} - ${action} (${warningsLeft} warnings remaining)`);
    }
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
