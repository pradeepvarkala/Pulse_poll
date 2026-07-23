import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Creator from './components/Creator';
import Presenter from './components/Presenter';
import Audience from './components/Audience';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Pricing from './components/Pricing';
import LandingPage from './components/LandingPage';
import InstructorRemote from './components/InstructorRemote';
import AnalyticsReport from './components/AnalyticsReport';
import EscapeRoomBuilder from './components/EscapeRoomBuilder';
import VirtualMeetingScheduler from './components/VirtualMeetingScheduler';
import SessionManager from './components/SessionManager';
import { Presentation as PresIcon, User as UserIcon, Settings, Menu, Volume2, VolumeX, Sun, Moon, Calendar, LogOut } from 'lucide-react';
import { playThemeToggleSound, toggleMuteAudio } from './utils/soundEffects';

const CATEGORY_TEMPLATES = [
  // 1. K-12 EDUCATION (STEM & Foundational Sciences) -> Playroom, Ocean, Sunset, Cyber-Mint
  {
    id: 'k12-tpl-1',
    title: '📊 STEM Science & Environmental Ecosystems',
    category: 'Education',
    subcategory: 'K-12 Education',
    theme: 'playroom',
    slides: [
      { type: 'quiz', question: 'Which biological process converts sunlight and carbon dioxide into oxygen? 🌿', options: [{ id: 'opt-1', text: 'Photosynthesis (Correct)' }, { id: 'opt-2', text: 'Cellular Respiration' }, { id: 'opt-3', text: 'Evaporation' }] },
      { type: 'wordcloud', question: 'In one word, what renewable energy source holds the most promise? ☀️' },
      { type: 'scales', question: 'Rate your interest level across key scientific fields (1-5):', options: [{ id: 'opt-4', text: 'Environmental Science' }, { id: 'opt-5', text: 'Robotics & Automation' }, { id: 'opt-6', text: 'Astronomy & Physics' }] }
    ]
  },
  {
    id: 'k12-tpl-2',
    title: '🪐 Solar System & Space Exploration Quest',
    category: 'Education',
    subcategory: 'K-12 Education',
    theme: 'ocean',
    slides: [
      { type: 'quiz', question: 'True or False: A single day on Venus is longer than one solar year on Venus! 🌌', options: [{ id: 'opt-1', text: 'True (Correct)' }, { id: 'opt-2', text: 'False' }] },
      { type: 'wordcloud', question: 'If you discovered a new exoplanet, what single word would describe it? ⭐' },
      { type: 'poll', question: 'Which destination in the solar system should deep space probes prioritize?', options: [{ id: 'opt-3', text: 'Mars Polar Ice Caps 🔴' }, { id: 'opt-4', text: 'Saturn\'s Moons 🪐' }, { id: 'opt-5', text: 'Jupiter\'s Atmosphere 🌕' }] }
    ]
  },
  {
    id: 'k12-tpl-3',
    title: '🌍 Global Geography & Biodiversity Exploration',
    category: 'Education',
    subcategory: 'K-12 Education',
    theme: 'sunset',
    slides: [
      { type: 'quiz', question: 'Which continent contains the world\'s largest tropical rainforest system? 🌍', options: [{ id: 'opt-1', text: 'South America (Correct)' }, { id: 'opt-2', text: 'Africa' }, { id: 'opt-3', text: 'Asia' }] },
      { type: 'wordcloud', question: 'What is the most critical conservation strategy for endangered habitats? 🌿' },
      { type: 'grid', question: 'Plot global ecosystems on Biodiversity Density vs Climate Vulnerability:', options: [{ id: 'opt-4', text: 'Coral Reefs' }, { id: 'opt-5', text: 'Boreal Forests' }], xAxisLabel: 'Biodiversity Density', yAxisLabel: 'Climate Vulnerability' }
    ]
  },
  {
    id: 'k12-tpl-4',
    title: '🧪 Fundamental Physical Sciences & Chemistry',
    category: 'Education',
    subcategory: 'K-12 Education',
    theme: 'cyber-mint',
    slides: [
      { type: 'quiz', question: 'What is the standard chemical formula for pure water molecules? 🧪', options: [{ id: 'opt-1', text: 'H2O (Correct)' }, { id: 'opt-2', text: 'CO2' }, { id: 'opt-3', text: 'NaCl' }] },
      { type: 'stopwatch', question: '⏱️ Science Challenge: Name as many elements on the periodic table as you can!', timeLimit: 30 },
      { type: 'poll', question: 'Which physics topic is most fascinating to demonstrate live?', options: [{ id: 'opt-4', text: 'Electromagnetic Induction ⚡' }, { id: 'opt-5', text: 'Fluid Dynamics & Hydraulics 🌊' }, { id: 'opt-6', text: 'Optics & Light Diffraction 🌈' }] }
    ]
  },

  // 2. HIGHER EDUCATION (University Students & Professors) -> Classic Slate, Corporate, Forest Sage, Light Luxe
  {
    id: 'highered-tpl-1',
    title: '🎓 University Thesis Defense & Peer Q&A Panel',
    category: 'Education',
    subcategory: 'Higher Education',
    theme: 'classic-slate',
    slides: [
      { type: 'quiz', question: 'What is the standard significance threshold (alpha level) in hypothesis testing? 📊', options: [{ id: 'opt-1', text: 'p < 0.05 (Correct)' }, { id: 'opt-2', text: 'p < 0.50' }, { id: 'opt-3', text: 'p < 0.01' }] },
      { type: 'wordcloud', question: 'What is the single biggest methodology challenge in your dissertation research? 🎓' },
      { type: 'scales', question: 'Rate peer confidence in the experimental sample size validity (1-5):', options: [{ id: 'opt-4', text: 'Sample Representativeness' }, { id: 'opt-5', text: 'Statistical Power' }] }
    ]
  },
  {
    id: 'highered-tpl-2',
    title: '🔬 Academic Research Methodology & Ethics Debate',
    category: 'Education',
    subcategory: 'Higher Education',
    theme: 'forest-sage',
    slides: [
      { type: 'brainstorm', question: 'Brainstorm ethical protocols for human subjects data collection! 🔬', category1: 'Informed Consent 📜', category2: 'Data Anonymity 🔒', category3: 'Risk Mitigation 🛡️', category4: 'IRB Audits 📋' },
      { type: 'quiz', question: 'Who formulated the principles of empirical falsifiability in philosophy of science?', options: [{ id: 'opt-1', text: 'Karl Popper (Correct)' }, { id: 'opt-2', text: 'Thomas Kuhn' }, { id: 'opt-3', text: 'Immanuel Kant' }] }
    ]
  },
  {
    id: 'highered-tpl-3',
    title: '📖 Higher Ed Pedagogy & Active Learning Survey',
    category: 'Education',
    subcategory: 'Higher Education',
    theme: 'corporate',
    slides: [
      { type: 'poll', question: 'Which teaching framework yields highest student retention in STEM seminars?', options: [{ id: 'opt-1', text: 'Flipped Classroom & Problem Solving' }, { id: 'opt-2', text: 'Traditional Lecture Delivery' }, { id: 'opt-3', text: 'Asynchronous Discussion Forums' }] },
      { type: 'scales', question: 'Rate syllabus objective clarity and grading rubric transparency (1-5):', options: [{ id: 'opt-4', text: 'Grading Criteria' }, { id: 'opt-5', text: 'Assignment Deadlines' }] }
    ]
  },
  {
    id: 'highered-tpl-4',
    title: '📊 Senior Capstone Project Evaluation Matrix',
    category: 'Education',
    subcategory: 'Higher Education',
    theme: 'light-luxe',
    slides: [
      { type: 'grid', question: 'Plot capstone proposals on Academic Rigor vs Real-World Impact:', xAxisLabel: 'Academic Rigor', yAxisLabel: 'Real-World Impact', options: [{ id: 'opt-1', text: 'AI Healthcare Diagnostic' }, { id: 'opt-2', text: 'Renewable Microgrid' }] },
      { type: 'wordcloud', question: 'In one word, what industry skill did your capstone project build best?' }
    ]
  },

  // 3. STUDENT ACTIVITIES (Campus Life, Clubs, Sports, Hackathons) -> Neon, Sunset, Playroom, Ocean
  {
    id: 'act-tpl-1',
    title: '🏆 Campus Hackathon Final Pitch & Live Vote',
    category: 'Education',
    subcategory: 'Student Activities',
    theme: 'neon',
    slides: [
      { type: 'poll', question: 'Which student hackathon team demonstrated the best technical execution? 🚀', options: [{ id: 'opt-1', text: 'Team AI-Vision' }, { id: 'opt-2', text: 'Team Smart-Campus' }, { id: 'opt-3', text: 'Team Eco-Track' }] },
      { type: 'wordcloud', question: 'Submit one word that describes the vibe of tonight\'s hackathon! ⚡' },
      { type: 'quiz', question: 'What does API stand for in software engineering?', options: [{ id: 'opt-4', text: 'Application Programming Interface (Correct)' }, { id: 'opt-5', text: 'Automated Protocol Integration' }] }
    ]
  },
  {
    id: 'act-tpl-2',
    title: '🍕 Student Club Welcome Icebreaker & Trivia',
    category: 'Education',
    subcategory: 'Student Activities',
    theme: 'sunset',
    slides: [
      { type: 'quiz', question: 'Which campus building was voted most popular for late-night study sessions? 🍕', options: [{ id: 'opt-1', text: 'The Student Union (Correct)' }, { id: 'opt-2', text: 'Science Quad' }, { id: 'opt-3', text: 'North Library' }] },
      { type: 'stopwatch', question: '⏱️ Speed Challenge: Name as many campus club events as you can!', timeLimit: 20 },
      { type: 'poll', question: 'What activity should our club host for next Friday\'s social night?', options: [{ id: 'opt-4', text: 'Board Game Tournament 🎲' }, { id: 'opt-5', text: 'Outdoor Movie Night 🍿' }, { id: 'opt-6', text: 'Karaoke Competition 🎤' }] }
    ]
  },
  {
    id: 'act-tpl-3',
    title: '⚽ Intramural Sports Championship Trivia',
    category: 'Education',
    subcategory: 'Student Activities',
    theme: 'ocean',
    slides: [
      { type: 'quiz', question: 'Which team sport holds the official record for highest average player cardio output? ⚽', options: [{ id: 'opt-1', text: 'Soccer / Football (Correct)' }, { id: 'opt-2', text: 'Basketball' }, { id: 'opt-3', text: 'Volleyball' }] },
      { type: 'scales', question: 'Rate your excitement for the upcoming varsity homecoming match (1-5):', options: [{ id: 'opt-4', text: 'Tailgate Party' }, { id: 'opt-5', text: 'Championship Game' }] }
    ]
  },
  {
    id: 'act-tpl-4',
    title: '🎨 Campus Talent Show & Audience Rating',
    category: 'Education',
    subcategory: 'Student Activities',
    theme: 'playroom',
    slides: [
      { type: 'scales', question: 'Rate tonight\'s musical performance acts (1-5):', options: [{ id: 'opt-1', text: 'A Cappella Choir 🎵' }, { id: 'opt-2', text: 'Indie Rock Band 🎸' }, { id: 'opt-3', text: 'Solo Pianist 🎹' }] },
      { type: 'wordcloud', question: 'Give a shoutout or compliment to your favorite performer tonight! ❤️' }
    ]
  },

  // 4. CORPORATE TRAINING (HR Onboarding, Executive Upskilling, Leadership) -> Corporate, Light Luxe, Classic Slate, Forest Sage
  {
    id: 'corp-tpl-1',
    title: '💼 New Employee Onboarding & Company Culture',
    category: 'Enterprise',
    subcategory: 'Corporate Training',
    theme: 'corporate',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'What is our primary company core value statement? 💼', options: [{ id: 'opt-1', text: 'Customer Centricity & Innovation (Correct)' }, { id: 'opt-2', text: 'Maximum Speed At All Costs' }, { id: 'opt-3', text: 'Traditional Hierarchy' }] },
      { type: 'wordcloud', question: 'In one word, what are you most excited to learn during onboarding week? 🚀' },
      { type: 'scales', question: 'Rate your clarity on department reporting structures and escalation paths (1-5):', options: [{ id: 'opt-4', text: 'IT Setup' }, { id: 'opt-5', text: 'Benefits Overview' }] }
    ]
  },
  {
    id: 'corp-tpl-2',
    title: '🚀 Executive Leadership & 360 Feedback Workshop',
    category: 'Enterprise',
    subcategory: 'Corporate Training',
    theme: 'light-luxe',
    isPremium: true,
    slides: [
      { type: 'brainstorm', question: 'Brainstorm leadership capabilities needed for scaling distributed teams! 🚀', category1: 'Empathy & Trust ❤️', category2: 'Strategic Focus 🎯', category3: 'Clear Delegation 📋', category4: 'Tech Literacy 💻' },
      { type: 'poll', question: 'Which executive communication style is most effective during org change?', options: [{ id: 'opt-1', text: 'Transparent & Data-Backed' }, { id: 'opt-2', text: 'Top-Down Directives' }, { id: 'opt-3', text: 'Delegated Team Autonomy' }] }
    ]
  },
  {
    id: 'corp-tpl-3',
    title: '🎯 Enterprise Sales Pitch & Objection Handling Grid',
    category: 'Enterprise',
    subcategory: 'Corporate Training',
    theme: 'classic-slate',
    isPremium: true,
    slides: [
      { type: 'grid', question: 'Plot common client objections on Buyer Hesitation vs Financial Impact:', xAxisLabel: 'Buyer Hesitation', yAxisLabel: 'Financial Impact', options: [{ id: 'opt-1', text: 'Implementation Timeline' }, { id: 'opt-2', text: 'Budget Approval' }] },
      { type: 'quiz', question: 'What is the first step in the consultative B2B sales framework?', options: [{ id: 'opt-3', text: 'Discovery & Needs Analysis (Correct)' }, { id: 'opt-4', text: 'Sending Contract' }] }
    ]
  },
  {
    id: 'corp-tpl-4',
    title: '🛡️ Workplace Ethics & Standards Training',
    category: 'Enterprise',
    subcategory: 'Corporate Training',
    theme: 'forest-sage',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'What is the correct protocol when encountering a potential safety or ethics issue? 🛡️', options: [{ id: 'opt-1', text: 'Notify Ethics Officer or Hotline (Correct)' }, { id: 'opt-2', text: 'Post on social media' }, { id: 'opt-3', text: 'Wait 30 days' }] },
      { type: 'poll', question: 'How confident do you feel applying our new compliance guidelines?' }
    ]
  },

  // 5. STAFF MEETINGS (Agile Retros, All-Hands, OKR Planning) -> Forest Sage, Classic Slate, Corporate, Neon
  {
    id: 'staff-tpl-1',
    title: '🤝 Agile Sprint Retrospective & Brainstorm Board',
    category: 'Enterprise',
    subcategory: 'Staff Meetings',
    theme: 'forest-sage',
    slides: [
      { type: 'brainstorm', question: 'Categorize sprint feedback for our engineering team! 🤝', category1: 'What Went Well 🌟', category2: 'What Held Us Back 🛑', category3: 'New Ideas 💡', category4: 'Action Items 🚀' },
      { type: 'wordcloud', question: 'What was the single biggest bottleneck during the past sprint? 🛑' }
    ]
  },
  {
    id: 'staff-tpl-2',
    title: '🎯 Quarterly OKR Alignment & Priority Rating',
    category: 'Enterprise',
    subcategory: 'Staff Meetings',
    theme: 'corporate',
    slides: [
      { type: 'scales', question: 'Rate our team alignment on Q3 Key Performance Indicators (1-5):', options: [{ id: 'opt-1', text: 'Engineering Speed' }, { id: 'opt-2', text: 'Customer Satisfaction' }, { id: 'opt-3', text: 'Revenue Target' }] },
      { type: 'poll', question: 'Which objective requires the most cross-departmental collaboration this month?' }
    ]
  },
  {
    id: 'staff-tpl-3',
    title: '📣 Townhall All-Hands Word Cloud & Live Q&A',
    category: 'Enterprise',
    subcategory: 'Staff Meetings',
    theme: 'neon',
    slides: [
      { type: 'wordcloud', question: 'What word best summarizes our company milestone achievement this quarter? 📣' },
      { type: 'poll', question: 'Which department update was most inspiring today?', options: [{ id: 'opt-1', text: 'Product Roadmap 🗺️' }, { id: 'opt-2', text: 'Sales Growth 📈' }, { id: 'opt-3', text: 'Culture & Hiring 👥' }] }
    ]
  },
  {
    id: 'staff-tpl-4',
    title: '⏱️ Product Roadmap Standup & Priority Matrix',
    category: 'Enterprise',
    subcategory: 'Staff Meetings',
    theme: 'classic-slate',
    slides: [
      { type: 'stopwatch', question: '⏱️ 60-Second Standup Timer: Pitch your team\'s top deliverable for this week!', timeLimit: 60 },
      { type: 'grid', question: 'Plot feature requests on Customer Value vs Engineering Effort:', xAxisLabel: 'Customer Value', yAxisLabel: 'Engineering Effort', options: [{ id: 'opt-1', text: 'Dark Mode UI' }, { id: 'opt-2', text: 'API Webhooks' }] }
    ]
  },

  // 6. SECURITY & COMPLIANCE (IT, Data Privacy, Cyber Defense) -> Cyber Mint, Classic Slate, Neon, Corporate
  {
    id: 'sec-tpl-1',
    title: '🔒 Phishing Spotter & Cyber Threat Drill',
    category: 'Enterprise',
    subcategory: 'Security & Compliance',
    theme: 'cyber-mint',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'Which email detail is the strongest indicator of a spear-phishing attempt? 🔒', options: [{ id: 'opt-1', text: 'Mismatch between sender domain and display name (Correct)' }, { id: 'opt-2', text: 'Standard email signature' }, { id: 'opt-3', text: 'High resolution logo' }] },
      { type: 'poll', question: 'How quickly should a suspected security incident be reported to SecOps?', options: [{ id: 'opt-4', text: 'Immediately within 15 minutes (Correct)' }, { id: 'opt-5', text: 'At end of week' }] }
    ]
  },
  {
    id: 'sec-tpl-2',
    title: '📜 GDPR & HIPAA Data Compliance Audit',
    category: 'Enterprise',
    subcategory: 'Security & Compliance',
    theme: 'classic-slate',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'Under GDPR regulations, within how many hours must a data breach be reported to supervisory authorities?', options: [{ id: 'opt-1', text: '72 Hours (Correct)' }, { id: 'opt-2', text: '24 Hours' }, { id: 'opt-3', text: '30 Days' }] },
      { type: 'scales', question: 'Rate your team\'s compliance preparedness for data protection audits (1-5):', options: [{ id: 'opt-4', text: 'Encryption at Rest' }, { id: 'opt-5', text: 'Access Control Logs' }] }
    ]
  },
  {
    id: 'sec-tpl-3',
    title: '🛡️ Zero Trust Architecture & Access Audit',
    category: 'Enterprise',
    subcategory: 'Security & Compliance',
    theme: 'neon',
    isPremium: true,
    slides: [
      { type: 'brainstorm', question: 'Brainstorm security controls for multi-cloud environments! 🛡️', category1: 'MFA Enforce 🔑', category2: 'Least Privilege 🔒', category3: 'Data Encryption 🔐', category4: 'Log Audit 📊' },
      { type: 'quiz', question: 'What is the core principle of Zero Trust Security?', options: [{ id: 'opt-1', text: 'Never Trust, Always Verify (Correct)' }, { id: 'opt-2', text: 'Trust Internal Network' }] }
    ]
  },
  {
    id: 'sec-tpl-4',
    title: '🔑 Password Security & Endpoint Defense',
    category: 'Enterprise',
    subcategory: 'Security & Compliance',
    theme: 'corporate',
    isPremium: true,
    slides: [
      { type: 'poll', question: 'Which authentication factor is most resilient against SIM-swapping attacks?', options: [{ id: 'opt-1', text: 'Hardware Security Key / FIDO2 (Correct)' }, { id: 'opt-2', text: 'SMS OTP Code' }, { id: 'opt-3', text: 'Security Questions' }] },
      { type: 'wordcloud', question: 'What is the hardest part about managing complex passwords? 🔑' }
    ]
  },

  // 7. AI QUIZ GENERATOR (AI Prompts & Dynamic Quiz Suiting) -> Neon, Ocean, Cyber-Mint, Classic-Slate
  {
    id: 'ai-tpl-1',
    title: '🤖 AI Generated General Knowledge Suite',
    category: 'Learn',
    subcategory: 'AI quiz generator',
    theme: 'neon',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'Which astronomical body has the strongest gravitational pull in the solar system? 🪐', options: [{ id: 'opt-1', text: 'The Sun (Correct)' }, { id: 'opt-2', text: 'Jupiter' }, { id: 'opt-3', text: 'Black Hole Cygnus' }] },
      { type: 'wordcloud', question: 'In one word, what AI capability impresses you most? 🤖' }
    ]
  },
  {
    id: 'ai-tpl-2',
    title: '⚡ AI Speed Quiz & Millisecond Timer',
    category: 'Learn',
    subcategory: 'AI quiz generator',
    theme: 'ocean',
    isPremium: true,
    slides: [
      { type: 'stopwatch', question: '⚡ AI Countdown Challenge: Name 3 machine learning algorithms!', timeLimit: 20 },
      { type: 'quiz', question: 'What is the neural network structure commonly used for image recognition?', options: [{ id: 'opt-1', text: 'Convolutional Neural Networks / CNN (Correct)' }, { id: 'opt-2', text: 'Decision Trees' }] }
    ]
  },
  {
    id: 'ai-tpl-3',
    title: '🧬 AI Science & Biology Discovery',
    category: 'Learn',
    subcategory: 'AI quiz generator',
    theme: 'cyber-mint',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'What molecule carries genetic instructions in all living organisms?', options: [{ id: 'opt-1', text: 'DNA (Correct)' }, { id: 'opt-2', text: 'RNA' }, { id: 'opt-3', text: 'ATP' }] },
      { type: 'wordcloud', question: 'What is the most promising medical application of gene editing?' }
    ]
  },
  {
    id: 'ai-tpl-4',
    title: '🧠 AI Philosophy & Machine Intelligence Quiz',
    category: 'Learn',
    subcategory: 'AI quiz generator',
    theme: 'classic-slate',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'Who proposed the famous Imitation Game test for machine intelligence in 1950?', options: [{ id: 'opt-1', text: 'Alan Turing (Correct)' }, { id: 'opt-2', text: 'John von Neumann' }] },
      { type: 'poll', question: 'Do you believe artificial general intelligence (AGI) will be achieved this decade?' }
    ]
  },

  // 8. LIVE POLLING (Real-time Voting & Sentiment) -> Ocean, Sunset, Neon, Light Luxe
  {
    id: 'poll-tpl-1',
    title: '🌊 Real-Time Audience Sentiment & Voting',
    category: 'Learn',
    subcategory: 'Live polling',
    theme: 'ocean',
    slides: [
      { type: 'poll', question: 'How would you rate your overall experience with today\'s live session? 🌊', options: [{ id: 'opt-1', text: 'Exceeded Expectations 🚀' }, { id: 'opt-2', text: 'Great & Informative 👍' }, { id: 'opt-3', text: 'Needs Improvement 📈' }] },
      { type: 'wordcloud', question: 'What topic should we cover in our next live session?' }
    ]
  },
  {
    id: 'poll-tpl-2',
    title: '🔥 Live Product Feature Preference Poll',
    category: 'Learn',
    subcategory: 'Live polling',
    theme: 'sunset',
    slides: [
      { type: 'poll', question: 'Which new software feature would provide the most value for your workflow? 🔥', options: [{ id: 'opt-1', text: 'Real-time Analytics Dashboard' }, { id: 'opt-2', text: 'Mobile App Notifications' }, { id: 'opt-3', text: 'Custom Export Reports' }] },
      { type: 'scales', question: 'Rate your daily reliance on our software tools (1-5):' }
    ]
  },
  {
    id: 'poll-tpl-3',
    title: '⚡ Instant Event Pulse Check & Polling',
    category: 'Learn',
    subcategory: 'Live polling',
    theme: 'neon',
    slides: [
      { type: 'poll', question: 'Which keynote speaker session resonated most with you today? ⚡', options: [{ id: 'opt-1', text: 'Opening Tech Keynote' }, { id: 'opt-2', text: 'Panel Discussion' }, { id: 'opt-3', text: 'Workshop Labs' }] }
    ]
  },
  {
    id: 'poll-tpl-4',
    title: '💎 Executive Strategy Preference Poll',
    category: 'Learn',
    subcategory: 'Live polling',
    theme: 'light-luxe',
    slides: [
      { type: 'poll', question: 'Which market expansion strategy should receive budget allocation first? 💎', options: [{ id: 'opt-1', text: 'North American Enterprise' }, { id: 'opt-2', text: 'European SMB Expansion' }, { id: 'opt-3', text: 'APAC Digital Channels' }] }
    ]
  },

  // 9. WORD CLOUD (Brainstorming & Freeform Input) -> Playroom, Cyber Mint, Sunset, Forest Sage
  {
    id: 'wc-tpl-1',
    title: '🎨 Creative Idea Cloud & Brainstorming',
    category: 'Learn',
    subcategory: 'Word cloud',
    theme: 'playroom',
    slides: [
      { type: 'wordcloud', question: 'What one word best describes your vision for creative design? 🎨' },
      { type: 'poll', question: 'Which design format do you create most frequently?' }
    ]
  },
  {
    id: 'wc-tpl-2',
    title: '🌿 Team Wellness & Mindset Pulse Check Cloud',
    category: 'Learn',
    subcategory: 'Word cloud',
    theme: 'cyber-mint',
    slides: [
      { type: 'wordcloud', question: 'How are you feeling right now at the start of our team retreat in one word? 🌿' },
      { type: 'scales', question: 'Rate your current work-life balance satisfaction (1-5):' }
    ]
  },
  {
    id: 'wc-tpl-3',
    title: '🌅 Brand Tagline & Slogan Word Cloud',
    category: 'Learn',
    subcategory: 'Word cloud',
    theme: 'sunset',
    slides: [
      { type: 'wordcloud', question: 'Submit an adjective that should describe our brand identity! 🌅' }
    ]
  },
  {
    id: 'wc-tpl-4',
    title: '🌲 Product Vision & Feature Association Cloud',
    category: 'Learn',
    subcategory: 'Word cloud',
    theme: 'forest-sage',
    slides: [
      { type: 'wordcloud', question: 'What word springs to mind when you hear "Seamless User Experience"? 🌲' }
    ]
  },

  // 10. QUIZ (Trivia & Timed Competitions) -> Classic Slate, Neon, Playroom, Ocean
  {
    id: 'quiz-tpl-1',
    title: '🧠 Ultimate World History & Geography Quiz',
    category: 'Learn',
    subcategory: 'Quiz',
    theme: 'classic-slate',
    slides: [
      { type: 'quiz', question: 'What is the capital city of Australia? 🏛️', options: [{ id: 'opt-1', text: 'Canberra (Correct)' }, { id: 'opt-2', text: 'Sydney' }, { id: 'opt-3', text: 'Melbourne' }] },
      { type: 'quiz', question: 'Which ancient wonder was located in Alexandria, Egypt?', options: [{ id: 'opt-4', text: 'The Lighthouse of Alexandria (Correct)' }, { id: 'opt-5', text: 'Hanging Gardens' }] }
    ]
  },
  {
    id: 'quiz-tpl-2',
    title: '⚡ Tech & Innovation Speed Trivia',
    category: 'Learn',
    subcategory: 'Quiz',
    theme: 'neon',
    slides: [
      { type: 'stopwatch', question: '⚡ Speed Round: Name the co-founder of Apple alongside Steve Jobs!', timeLimit: 15 },
      { type: 'quiz', question: 'What year was the world wide web made publicly available?', options: [{ id: 'opt-1', text: '1991 (Correct)' }, { id: 'opt-2', text: '1985' }, { id: 'opt-3', text: '1998' }] }
    ]
  },
  {
    id: 'quiz-tpl-3',
    title: '🎈 Kids Animal & Nature Fun Quiz',
    category: 'Learn',
    subcategory: 'Quiz',
    theme: 'playroom',
    slides: [
      { type: 'quiz', question: 'What is the fastest land animal in the world? 🐆', options: [{ id: 'opt-1', text: 'Cheetah (Correct)' }, { id: 'opt-2', text: 'Lion' }, { id: 'opt-3', text: 'Horse' }] }
    ]
  },
  {
    id: 'quiz-tpl-4',
    title: '🌊 Deep Ocean Science & Mysteries Trivia',
    category: 'Learn',
    subcategory: 'Quiz',
    theme: 'ocean',
    slides: [
      { type: 'quiz', question: 'What percentage of the Earth\'s oceans remain unexplored? 🌊', options: [{ id: 'opt-1', text: 'Over 80% (Correct)' }, { id: 'opt-2', text: 'About 20%' }, { id: 'opt-3', text: '50%' }] }
    ]
  },

  // 11. SURVEY (Rating Scales & Multi-Metric Audits) -> Light Luxe, Corporate, Forest Sage, Classic Slate
  {
    id: 'surv-tpl-1',
    title: '📊 Customer Satisfaction & Net Promoter Survey',
    category: 'Learn',
    subcategory: 'Survey',
    theme: 'light-luxe',
    slides: [
      { type: 'scales', question: 'Rate your satisfaction across key product metrics (1-5):', options: [{ id: 'opt-1', text: 'Ease of Use' }, { id: 'opt-2', text: 'Customer Support' }, { id: 'opt-3', text: 'Value for Money' }] },
      { type: 'wordcloud', question: 'In one sentence, how can we improve our product service for you?' }
    ]
  },
  {
    id: 'surv-tpl-2',
    title: '🏢 Employee Workplace & Culture Survey',
    category: 'Learn',
    subcategory: 'Survey',
    theme: 'corporate',
    slides: [
      { type: 'scales', question: 'Rate your agreement with workplace statements (1-5):', options: [{ id: 'opt-1', text: 'I feel valued at work' }, { id: 'opt-2', text: 'Clear growth opportunities' }] }
    ]
  },
  {
    id: 'surv-tpl-3',
    title: '🌿 Sustainability & Environmental Impact Audit',
    category: 'Learn',
    subcategory: 'Survey',
    theme: 'forest-sage',
    slides: [
      { type: 'scales', question: 'Rate our office sustainability initiatives (1-5):', options: [{ id: 'opt-1', text: 'Paperless Workflows' }, { id: 'opt-2', text: 'Energy Conservation' }] }
    ]
  },
  {
    id: 'surv-tpl-4',
    title: '📝 Software UX & Interface Usability Survey',
    category: 'Learn',
    subcategory: 'Survey',
    theme: 'classic-slate',
    slides: [
      { type: 'scales', question: 'Rate interface navigation clarity and speed (1-5):', options: [{ id: 'opt-1', text: 'Menu Navigation' }, { id: 'opt-2', text: 'Page Load Speed' }] }
    ]
  },

  // 12. Q&A (Live Questions & Audience Upvoting) -> Corporate, Light Luxe, Classic Slate, Cyber Mint
  {
    id: 'qa-tpl-1',
    title: '🎤 Executive Townhall Open Q&A Panel',
    category: 'Learn',
    subcategory: 'Q&A',
    theme: 'corporate',
    slides: [
      { type: 'qa', question: 'Ask our executive team anything! Upvote questions you care about. 🎤' },
      { type: 'wordcloud', question: 'What key topic do you want leadership to address today?' }
    ]
  },
  {
    id: 'qa-tpl-2',
    title: '💡 Product Roadmap Ask Me Anything (AMA)',
    category: 'Learn',
    subcategory: 'Q&A',
    theme: 'light-luxe',
    slides: [
      { type: 'qa', question: 'Ask our Product Managers about upcoming features & timelines! 💡' }
    ]
  },
  {
    id: 'qa-tpl-3',
    title: '🎓 University Lecture Student Q&A Floor',
    category: 'Learn',
    subcategory: 'Q&A',
    theme: 'classic-slate',
    slides: [
      { type: 'qa', question: 'Submit questions regarding today\'s lecture material & exam topics! 🎓' }
    ]
  },
  {
    id: 'qa-tpl-4',
    title: '🧪 Engineering Architecture & Tech Q&A',
    category: 'Learn',
    subcategory: 'Q&A',
    theme: 'cyber-mint',
    slides: [
      { type: 'qa', question: 'Ask senior engineers about system design, databases, & code quality! 🧪' }
    ]
  },

  // 13. PULSEACADEMY (Masterclasses & Interactive Lessons) -> Forest Sage, Light Luxe, Ocean, Classic Slate
  {
    id: 'academy-tpl-1',
    title: '📚 Masterclass: Effective Remote Team Communication',
    category: 'Learn',
    subcategory: 'PulseAcademy',
    theme: 'forest-sage',
    slides: [
      { type: 'quiz', question: 'What is the primary benefit of asynchronous communication in remote teams? 📚', options: [{ id: 'opt-1', text: 'Allows deep focus & flexible time zones (Correct)' }, { id: 'opt-2', text: 'Eliminates all documentation' }] },
      { type: 'wordcloud', question: 'What is your favorite tool for async collaboration?' }
    ]
  },
  {
    id: 'academy-tpl-2',
    title: '🎓 Academy: Presentation Design & Visual Aesthetics',
    category: 'Learn',
    subcategory: 'PulseAcademy',
    theme: 'light-luxe',
    slides: [
      { type: 'quiz', question: 'Which color palette rule creates maximum contrast for accessibility?', options: [{ id: 'opt-1', text: 'High ratio dark text on light bg or vice versa (Correct)' }, { id: 'opt-2', text: 'Pastel on pastel' }] },
      { type: 'scales', question: 'Rate your slide design confidence before and after this lesson (1-5):' }
    ]
  },
  {
    id: 'academy-tpl-3',
    title: '🌊 Academy: Data-Driven Decision Making Masterclass',
    category: 'Learn',
    subcategory: 'PulseAcademy',
    theme: 'ocean',
    slides: [
      { type: 'quiz', question: 'What logical fallacy occurs when selecting data to support a pre-existing bias?', options: [{ id: 'opt-1', text: 'Confirmation Bias (Correct)' }, { id: 'opt-2', text: 'Sunk Cost Fallacy' }] }
    ]
  },
  {
    id: 'academy-tpl-4',
    title: '📖 Academy: Modern Agile Frameworks & Leadership',
    category: 'Learn',
    subcategory: 'PulseAcademy',
    theme: 'classic-slate',
    slides: [
      { type: 'brainstorm', question: 'Categorize core Agile principles taught in today\'s module! 📖', category1: 'Customer Focus 👥', category2: 'Iterative Delivery 🔄', category3: 'Team Autonomy 🤝', category4: 'Continuous Reflection 🪞' }
    ]
  },

  // 14. WEBINARS (Keynotes & Lead Generation) -> Sunset, Neon, Corporate, Light Luxe
  {
    id: 'webinar-tpl-1',
    title: '🚀 High-Converting Webinar Keynote Deck',
    category: 'Learn',
    subcategory: 'Webinars',
    theme: 'sunset',
    isPremium: true,
    slides: [
      { type: 'poll', question: 'What is your primary goal for attending today\'s keynote webinar? 🚀', options: [{ id: 'opt-1', text: 'Scaling Revenue Growth' }, { id: 'opt-2', text: 'Automating Operations' }, { id: 'opt-3', text: 'Learning Best Practices' }] },
      { type: 'wordcloud', question: 'What is the biggest challenge facing your business right now?' }
    ]
  },
  {
    id: 'webinar-tpl-2',
    title: '⚡ Future of AI in Enterprise Business Webinar',
    category: 'Learn',
    subcategory: 'Webinars',
    theme: 'neon',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'What percentage of Fortune 500 companies have deployed generative AI workflows in 2026?', options: [{ id: 'opt-1', text: 'Over 75% (Correct)' }, { id: 'opt-2', text: 'Less than 10%' }] }
    ]
  },
  {
    id: 'webinar-tpl-3',
    title: '📈 Growth Marketing & B2B Lead Gen Webinar',
    category: 'Learn',
    subcategory: 'Webinars',
    theme: 'corporate',
    isPremium: true,
    slides: [
      { type: 'scales', question: 'Rate your current customer acquisition cost efficiency (1-5):' }
    ]
  },
  {
    id: 'webinar-tpl-4',
    title: '💎 Product Showcase & Live Audience Demonstration',
    category: 'Learn',
    subcategory: 'Webinars',
    theme: 'light-luxe',
    isPremium: true,
    slides: [
      { type: 'poll', question: 'Would you like a personalized demo session with our product specialist team?' }
    ]
  },

  // 15. INTEGRATIONS (SaaS Tools & Workflows) -> Cyber Mint, Classic Slate, Corporate, Ocean
  {
    id: 'int-tpl-1',
    title: '🔌 Slack & Microsoft Teams Bot Integration Workshop',
    category: 'Learn',
    subcategory: 'Integrations',
    theme: 'cyber-mint',
    isPremium: true,
    slides: [
      { type: 'poll', question: 'Which messaging platform does your team use primary for daily chat?', options: [{ id: 'opt-1', text: 'Slack 💬' }, { id: 'opt-2', text: 'Microsoft Teams 🟦' }, { id: 'opt-3', text: 'Discord 🟣' }] },
      { type: 'wordcloud', question: 'What notification or trigger would you love to automate via bot?' }
    ]
  },
  {
    id: 'int-tpl-2',
    title: '⚙️ Developer API & Webhook Integration Drill',
    category: 'Learn',
    subcategory: 'Integrations',
    theme: 'classic-slate',
    isPremium: true,
    slides: [
      { type: 'quiz', question: 'Which HTTP status code signifies a successfully created webhook resource?', options: [{ id: 'opt-1', text: '201 Created (Correct)' }, { id: 'opt-2', text: '200 OK' }, { id: 'opt-3', text: '404 Not Found' }] }
    ]
  },
  {
    id: 'int-tpl-3',
    title: '🏢 Enterprise CRM & SalesForce Workflow Sync',
    category: 'Learn',
    subcategory: 'Integrations',
    theme: 'corporate',
    isPremium: true,
    slides: [
      { type: 'scales', question: 'Rate your team\'s CRM data sync accuracy (1-5):' }
    ]
  },
  {
    id: 'int-tpl-4',
    title: '☁️ Cloud Storage & Google Workspace Sync Workshop',
    category: 'Learn',
    subcategory: 'Integrations',
    theme: 'ocean',
    isPremium: true,
    slides: [
      { type: 'poll', question: 'How frequently do you back up presentation assets to cloud storage?', options: [{ id: 'opt-1', text: 'Real-time Auto-Sync' }, { id: 'opt-2', text: 'Daily' }, { id: 'opt-3', text: 'Manually' }] }
    ]
  }
];

export default function App() {
  const [viewState, setViewState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'dashboard';
  });

  // Custom setView wrapper that syncs browser history stack (pushState)
  const setView = (nextView, replace = false) => {
    if (nextView !== viewState) {
      setViewState(nextView);
      const hash = '#' + nextView;
      if (replace) {
        window.history.replaceState({ view: nextView }, '', hash);
      } else {
        window.history.pushState({ view: nextView }, '', hash);
      }
    }
  };

  const view = viewState;

  // Listen to browser Back & Forward button events (popstate)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setViewState(event.state.view);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
          setViewState(hash);
        } else {
          setViewState('dashboard');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [selectedPresentationId, setSelectedPresentationId] = useState(null);
  const [urlRoomCode, setUrlRoomCode] = useState('');
  const [authMode, setAuthMode] = useState(null); // null (shows landing page), 'login', 'signup'
  const [selectedFeature, setSelectedFeature] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null); // null, 'learn', 'education', 'enterprise'
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true); // Minimized on load by default
  const [isProTheme, setIsProTheme] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);

  useEffect(() => {
    if (isProTheme) {
      document.body.setAttribute('data-theme', 'light');
      document.body.classList.add('theme-light-pro');
      document.body.classList.remove('theme-neon');
    } else {
      document.body.setAttribute('data-theme', 'dark');
      document.body.classList.add('theme-neon');
      document.body.classList.remove('theme-light-pro');
    }
  }, [isProTheme]);

  const handleGlobalToggleTheme = () => {
    const nextPro = !isProTheme;
    setIsProTheme(nextPro);
    playThemeToggleSound(!nextPro);
  };

  const handleGlobalToggleMute = () => {
    const muted = toggleMuteAudio();
    setAudioMuted(muted);
  };
  const [activeSubmenuTemplateCategory, setActiveSubmenuTemplateCategory] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showAiGeneratorModal, setShowAiGeneratorModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiProgressText, setAiProgressText] = useState('');

  // Refresh user data from backend
  const refreshUserProfile = async (email) => {
    try {
      const res = await fetch('/api/user/profile', {
        headers: { 'x-user-email': email }
      });
      const data = await res.json();
      if (data && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('pulse-poll-user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Failed to sync profile:', err);
    }
  };

  // Check login session & route path on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('pulse-poll-user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object' && parsed.email) {
          setUser(parsed);
          refreshUserProfile(parsed.email);
        }
      } catch (e) {
        console.warn('Corrupted session cleared:', e);
        localStorage.removeItem('pulse-poll-user');
      }
    }

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || '';
    const refCode = params.get('ref') || '';

    if (refCode) {
      localStorage.setItem('pulse-poll-referral-referrer', refCode);
    }

    if (path === '/join' || path.startsWith('/join')) {
      setView('audience');
      if (code) {
        setUrlRoomCode(code);
      }
    }
  }, []);

  const generateSlidesForFeature = (featureName) => {
    const featLower = (featureName || '').toLowerCase();
    
    // Default fallback slide list
    let slides = [
      {
        id: 'slide-fall1',
        type: 'poll',
        question: `Welcome to the ${featureName} Workspace!`,
        options: [
          { id: 'opt-f1', text: 'Ready to start!' },
          { id: 'opt-f2', text: 'Show me features' }
        ]
      }
    ];

    if (featLower.includes('education') || featLower.includes('activities') || featLower.includes('pulseacademy')) {
      slides = [
        {
          id: 'slide-ed1',
          type: 'quiz',
          question: 'What is the capital of France? 🇫🇷',
          options: [
            { id: 'opt-ed1', text: 'Paris (Correct)' },
            { id: 'opt-ed2', text: 'Rome' },
            { id: 'opt-ed3', text: 'London' }
          ],
          timeLimit: 15
        },
        {
          id: 'slide-ed2',
          type: 'wordcloud',
          question: 'Describe your school week in one word! 🎒',
          options: []
        },
        {
          id: 'slide-ed3',
          type: 'poll',
          question: 'Which school subject is your absolute favorite?',
          options: [
            { id: 'opt-sub1', text: 'Science 🧪' },
            { id: 'opt-sub2', text: 'Maths 📐' },
            { id: 'opt-sub3', text: 'Art & Craft 🎨' }
          ]
        }
      ];
    } else if (featLower.includes('corporate') || featLower.includes('meetings') || featLower.includes('enterprise') || featLower.includes('compliance')) {
      slides = [
        {
          id: 'slide-corp1',
          type: 'scales',
          question: 'Rate the alignment and clarity of today\'s Q3 Objectives (1-5):',
          options: [
            { id: 'opt-corp1', text: 'Clarity of milestones' },
            { id: 'opt-corp2', text: 'Resource allocations' },
            { id: 'opt-corp3', text: 'Timeline feasibility' }
          ]
        },
        {
          id: 'slide-corp2',
          type: 'poll',
          question: 'Which initiative should we prioritize next quarter?',
          options: [
            { id: 'opt-pri1', text: 'Product Refinement' },
            { id: 'opt-pri2', text: 'Marketing Outreach' },
            { id: 'opt-pri3', text: 'Customer Success Hires' }
          ]
        },
        {
          id: 'slide-corp3',
          type: 'qa',
          question: 'Audience compliance & policy questions panel',
          options: []
        }
      ];
    } else if (featLower.includes('cloud')) {
      slides = [
        {
          id: 'slide-wc1',
          type: 'wordcloud',
          question: 'Describe your current workspace environment in one word:',
          options: []
        },
        {
          id: 'slide-wc2',
          type: 'wordcloud',
          question: 'What are your core values for teamwork?',
          options: []
        }
      ];
    } else if (featLower.includes('qa') || featLower.includes('q&a') || featLower.includes('help') || featLower.includes('webinars')) {
      slides = [
        {
          id: 'slide-qa1',
          type: 'qa',
          question: 'Host Q&A - Ask anything about features & modules!',
          options: []
        }
      ];
    } else if (featLower.includes('quiz') || featLower.includes('trivia')) {
      slides = [
        {
          id: 'slide-qz1',
          type: 'quiz',
          question: 'Which planet is known as the Red Planet? 🪐',
          options: [
            { id: 'qz-o1', text: 'Mars (Correct)' },
            { id: 'qz-o2', text: 'Venus' },
            { id: 'qz-o3', text: 'Jupiter' }
          ],
          timeLimit: 15
        },
        {
          id: 'slide-qz2',
          type: 'quiz',
          question: 'How many bones are there in an adult human body?',
          options: [
            { id: 'qz2-o1', text: '206 (Correct)' },
            { id: 'qz2-o2', text: '186' },
            { id: 'qz2-o3', text: '306' }
          ],
          timeLimit: 20
        }
      ];
    } else if (featLower.includes('poll') || featLower.includes('survey') || featLower.includes('presentations')) {
      slides = [
        {
          id: 'slide-pl1',
          type: 'poll',
          question: 'How do you currently capture team engagement?',
          options: [
            { id: 'pl-o1', text: 'Live Polling software' },
            { id: 'pl-o2', text: 'Email Surveys' },
            { id: 'pl-o3', text: 'We do not capture it' }
          ]
        },
        {
          id: 'slide-pl2',
          type: 'scales',
          question: 'Rate the importance of the following product aspects:',
          options: [
            { id: 'pl-s1', text: 'Interface speed' },
            { id: 'pl-s2', text: 'Custom templates' }
          ]
        }
      ];
    } else if (featLower.includes('templates') || featLower.includes('blog') || featLower.includes('integrations') || featLower.includes('how to')) {
      slides = [
        {
          id: 'slide-t1',
          type: 'poll',
          question: 'Which third-party tool integrations do you use most?',
          options: [
            { id: 'ti-1', text: 'Slack Messages' },
            { id: 'ti-2', text: 'Microsoft Teams' },
            { id: 'ti-3', text: 'Zoom Webinars' }
          ]
        },
        {
          id: 'slide-t2',
          type: 'scales',
          question: 'Rate your familiarity with PulsePoll functions:',
          options: [
            { id: 'ti-s1', text: 'Creating presentations' },
            { id: 'ti-s2', text: 'Configuring anti-cheat mode' }
          ]
        }
      ];
    }

    return slides;
  };

  const getThemeForFeature = (featureName) => {
    const featLower = (featureName || '').toLowerCase();
    if (featLower.includes('education') || featLower.includes('activities') || featLower.includes('pulseacademy')) return 'playroom';
    if (featLower.includes('corporate') || featLower.includes('meetings') || featLower.includes('enterprise') || featLower.includes('compliance')) return 'corporate';
    if (featLower.includes('cloud')) return 'ocean';
    if (featLower.includes('qa') || featLower.includes('q&a') || featLower.includes('help') || featLower.includes('webinars')) return 'classic-slate';
    if (featLower.includes('quiz') || featLower.includes('trivia')) return 'sunset';
    return 'light-luxe';
  };

  const handleLoginSuccess = (profile) => {
    setUser(profile);
    setAuthMode(null);
    try {
      localStorage.setItem('pulse-poll-user', JSON.stringify(profile));
    } catch (e) {}
    
    if (selectedFeature) {
      const targetTheme = getThemeForFeature(selectedFeature);
      const slides = generateSlidesForFeature(selectedFeature);

      const contextualPres = {
        id: `context-pres-${Math.random().toString(36).substr(2, 5)}`,
        title: `${selectedFeature} Workspace`,
        updatedAt: new Date().toLocaleDateString(),
        theme: targetTheme,
        slides: slides
      };

      // Save to local storage
      let presentations = [];
      try {
        const saved = localStorage.getItem('pulse-poll-presentations');
        if (saved && saved !== 'undefined') {
          presentations = JSON.parse(saved);
        }
      } catch (e) {
        console.warn('Corrupted local presentations cleared:', e);
        localStorage.removeItem('pulse-poll-presentations');
      }
      presentations = Array.isArray(presentations) ? presentations.filter(p => p.id !== 'demo-learning-sandbox') : [];
      presentations.unshift(contextualPres);
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));

      // Sync to remote database in background
      fetch('/api/presentations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': profile.email || 'guest@pulsepoll.com'
        },
        body: JSON.stringify(contextualPres)
      }).catch(err => console.error('Error auto-syncing contextual presentation:', err));

      // Open directly in creator view
      setSelectedPresentationId(contextualPres.id);
      setView('creator');
      setSelectedFeature(''); // clear context
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pulse-poll-user');
    setUser(null);
    setView('dashboard');
  };

  const handleNavigateToDashboard = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
    setView('dashboard');
    setSelectedPresentationId(null);
    setUrlRoomCode('');
  };

  const handleNavigateToCreator = (id) => {
    setSelectedPresentationId(id);
    setView('creator');
  };

  const handleNavigateToPresenter = (id) => {
    setSelectedPresentationId(id);
    setView('presenter');
  };

  const handleNavigateToAudience = () => {
    window.history.pushState({}, '', '/join');
    setView('audience');
  };

  const handleStartDemo = (featureName = '') => {
    const guestUser = {
      name: 'Guest Explorer',
      email: `guest-${Math.random().toString(36).substr(2, 5)}@pulsepoll.com`,
      tier: 'free',
      isDemo: true
    };
    setUser(guestUser);
    localStorage.setItem('pulse-poll-user', JSON.stringify(guestUser));

    const targetTheme = getThemeForFeature(featureName);
    const slides = generateSlidesForFeature(featureName);

    const demoPres = {
      id: 'demo-learning-sandbox',
      title: `${featureName || 'Interactive Demo'} Sandbox`,
      updatedAt: new Date().toLocaleDateString(),
      theme: targetTheme,
      slides: slides
    };

    // Save demo presentation to localStorage
    const saved = localStorage.getItem('pulse-poll-presentations');
    let presentations = saved ? JSON.parse(saved) : [];
    presentations = presentations.filter(p => p.id !== 'demo-learning-sandbox');
    presentations.unshift(demoPres);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));

    // Open Creator view immediately
    setSelectedPresentationId('demo-learning-sandbox');
    setView('creator');
  };

  const isFeatureUnlocked = (moduleName) => {
    if (user?.tier === 'admin' || user?.tier === 'pro' || user?.tier === 'premium') return true;
    let unlocks = [];
    try {
      unlocks = typeof user?.unlocked_modules === 'string' 
        ? JSON.parse(user.unlocked_modules || '[]') 
        : (user?.unlocked_modules || []);
    } catch(e) { unlocks = []; }
    const found = unlocks.find(item => item.module === moduleName);
    if (found) {
      const expires = new Date(found.expiresAt);
      if (expires > new Date()) return true;
    }
    return false;
  };

  const handleUseSubmenuTemplate = async (template) => {
    if (template.isPremium && user?.tier === 'free') {
      let unlocks = [];
      try {
        unlocks = typeof user.unlocked_modules === 'string' 
          ? JSON.parse(user.unlocked_modules || '[]') 
          : (user.unlocked_modules || []);
      } catch(e) { unlocks = []; }
      const isStopwatchUnlocked = unlocks.some(i => i.module === 'stopwatch' && new Date(i.expiresAt) > new Date());
      const isBrainstormUnlocked = unlocks.some(i => i.module === 'brainstorm' && new Date(i.expiresAt) > new Date());
      const hasCoinsUnlock = template.id.includes('template-5') ? isStopwatchUnlocked : isBrainstormUnlocked;
      if (!hasCoinsUnlock) {
        setShowUpgradeModal(true);
        setActiveSubmenuTemplateCategory(null);
        return;
      }
    }

    const clonedPres = {
      id: `clone-pres-${Math.random().toString(36).substr(2, 5)}`,
      title: `${template.title} (Cloned)`,
      updatedAt: new Date().toLocaleDateString(),
      theme: template.theme,
      slides: template.slides.map((s, idx) => ({
        ...s,
        id: `s-${template.id}-${idx}-${Math.random().toString(36).substr(2, 3)}`,
        options: s.options ? s.options.map((o, oIdx) => ({ ...o, id: `o-${oIdx}-${Math.random().toString(36).substr(2, 3)}` })) : []
      }))
    };

    const saved = localStorage.getItem('pulse-poll-presentations');
    let presentations = saved ? JSON.parse(saved) : [];
    presentations.unshift(clonedPres);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));

    fetch('/api/presentations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-email': user?.email || 'guest@pulsepoll.com'
      },
      body: JSON.stringify(clonedPres)
    }).catch(err => console.error(err));

    setSelectedPresentationId(clonedPres.id);
    setView('creator');
    setActiveSubmenuTemplateCategory(null);
  };

  const handleGenerateAiSlides = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsGeneratingAi(true);
    const steps = [
      "🤖 Initializing PulseAI Engine...",
      `🔍 Analyzing prompt details: "${aiPrompt.trim()}"...`,
      "✍&nbsp; Crafting interactive Quiz question, options, and solutions...",
      "📣 Structuring real-time Word Cloud feedback slide...",
      "📊 Designing coordinate grid classifiers...",
      "🎨 Harmonizing color palettes & Cyber-Cyan visual borders...",
      "✨ Auto-saving workspace schema and compiling live room controls..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setAiProgressText(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const promptClean = aiPrompt.trim();
    const newPres = {
      id: `ai-pres-${Math.random().toString(36).substr(2, 6)}`,
      title: `AI Workspace: ${promptClean.length > 25 ? promptClean.slice(0, 25) + '...' : promptClean}`,
      updatedAt: new Date().toLocaleDateString(),
      theme: 'cyber-neon',
      slides: [
        {
          id: `ai-s1-${Math.random().toString(36).substr(2, 3)}`,
          type: 'quiz',
          question: `Which concept best explains the primary core fundamentals of ${promptClean}? 🌟`,
          timeLimit: 20,
          correctAnswerIndex: 0,
          options: [
            { id: 'ai-opt-1', text: 'Empirical experimentation & analysis' },
            { id: 'ai-opt-2', text: 'Theoretical guesswork & assumptions' },
            { id: 'ai-opt-3', text: 'Standard default status quo definitions' }
          ]
        },
        {
          id: `ai-s2-${Math.random().toString(36).substr(2, 3)}`,
          type: 'wordcloud',
          question: `In one word, what is the most exciting breakthrough or benefit of ${promptClean}? 📣`
        },
        {
          id: `ai-s3-${Math.random().toString(36).substr(2, 3)}`,
          type: 'grid',
          question: `Plot the components of ${promptClean} on impact vs execution difficulty:`,
          xAxisLabel: 'Global Impact Level',
          yAxisLabel: 'Execution & Cost Difficulty',
          options: [
            { id: 'ai-opt-4', text: 'Research Phase' },
            { id: 'ai-opt-5', text: 'Market Release' }
          ]
        }
      ]
    };

    const saved = localStorage.getItem('pulse-poll-presentations');
    let presentations = saved ? JSON.parse(saved) : [];
    presentations.unshift(newPres);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(presentations));

    try {
      await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || 'guest@pulsepoll.com'
        },
        body: JSON.stringify(newPres)
      });
    } catch(err) {
      console.error(err);
    }

    setIsGeneratingAi(false);
    setShowAiGeneratorModal(false);
    setAiPrompt('');
    setSelectedPresentationId(newPres.id);
    setView('creator');
  };

  const handleTriggerContextualSlide = (featureName, isPremiumFeature = false) => {
    if (isPremiumFeature && user?.tier === 'free') {
      setShowUpgradeModal(true);
      return;
    }

    const featLower = (featureName || '').toLowerCase();
    if (featLower.includes('ai presentation') || featLower.includes('ai quiz') || featLower.includes('ai quiz generator')) {
      if (user?.tier === 'free') {
        setShowUpgradeModal(true);
        return;
      }
      setShowAiGeneratorModal(true);
    } else {
      setActiveSubmenuTemplateCategory(featureName);
    }
  };

  // Audience view does not require presenter log-in
  if (!user && view === 'audience') {
    return (
      <Audience 
        defaultRoomCode={urlRoomCode}
        onBackToMenu={() => {
          setView('dashboard');
          setAuthMode(null);
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Redirect to Auth or Landing page if not logged in
  if (!user) {
    if (authMode === 'login' || authMode === 'signup') {
      return (
        <Auth 
          onLoginSuccess={handleLoginSuccess} 
          onBackToLanding={() => {
            setAuthMode(null);
            setSelectedFeature('');
          }} 
          featureContext={selectedFeature}
        />
      );
    }
    return (
      <LandingPage 
        onStartAuth={(mode, feature = '') => {
          setAuthMode(mode);
          setSelectedFeature(feature);
        }} 
        onJoinRoom={(code) => {
          setUrlRoomCode(code);
          setView('audience');
        }}
        onStartDemo={handleStartDemo}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Header (hidden in presenter & audience fullscreen views) */}
      {view !== 'presenter' && view !== 'audience' && (
        <header className="app-header" style={{ position: 'relative', zIndex: 1000 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
              title={isSidebarCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
              style={{ width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Menu size={18} />
            </button>

            <div 
              className="logo" 
              onClick={() => setView('dashboard')} 
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}
              title="PulsePoll Interactive Platform"
            >
              <div className="logo-icon">
                <PresIcon size={18} color="white" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.01em' }}>PulsePoll</span>
            </div>

            {/* Direct 1-Click Workshops Button */}
            <button 
              className="btn btn-secondary"
              onClick={() => setView('sessions')}
              style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 600, display: 'flex', gap: '6px', alignItems: 'center', background: 'var(--surface-2)', border: '1px solid var(--border)', flexShrink: 0 }}
            >
              <span>📅 Workshops</span>
            </button>

            {/* Consolidated Explore Catalog Dropdown */}
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: activeDropdown === 'explore' ? 'var(--accent)' : 'var(--text-primary)' }}
              onMouseEnter={() => setActiveDropdown('explore')}
              onMouseLeave={() => setActiveDropdown(null)}
              onClick={() => setActiveDropdown(activeDropdown === 'explore' ? null : 'explore')}
            >
              <span>Explore Catalog</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>

              {activeDropdown === 'explore' && (
                <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '10px', zIndex: 1001 }}>
                  <div className="glass-card" style={{
                    width: '450px', padding: '20px', background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'left'
                  }}>
                    {/* Education */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', borderBottom: '1px solid var(--border-soft)', paddingBottom: '4px' }}>
                        🎓 Education
                      </div>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('K-12 Education', false); setActiveDropdown(null); }}>K-12 Education</span>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('Higher Education', false); setActiveDropdown(null); }}>Higher Ed</span>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('Student Activities', false); setActiveDropdown(null); }}>Student Activities</span>
                    </div>

                    {/* Enterprise */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent)', borderBottom: '1px solid var(--border-soft)', paddingBottom: '4px' }}>
                        💼 Enterprise
                      </div>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('Corporate Training', true); setActiveDropdown(null); }}>Corporate 🔒</span>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('Staff Meetings', false); setActiveDropdown(null); }}>Staff Meetings</span>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('Security & Compliance', true); setActiveDropdown(null); }}>Security 🔒</span>
                    </div>

                    {/* Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--gold)', borderBottom: '1px solid var(--border-soft)', paddingBottom: '4px' }}>
                        ⚡ Features
                      </div>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('AI quiz generator', true); setActiveDropdown(null); }}>PulseAI 🔒</span>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('PulseAcademy', false); setActiveDropdown(null); }}>PulseAcademy</span>
                      <span className="dropdown-link" style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} onClick={() => { handleTriggerContextualSlide('Templates', false); setActiveDropdown(null); }}>Templates Catalog</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Middle Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', flex: 1, padding: '0 8px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Audio Mute Toggle */}
            <button 
              className="btn btn-secondary" 
              onClick={handleGlobalToggleMute}
              title={audioMuted ? "Unmute Audio Themes" : "Mute Audio Themes"}
              style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
            >
              {audioMuted ? <VolumeX size={15} color="#ef4444" /> : <Volume2 size={15} color="#2563eb" />}
            </button>

            {/* User Design System Theme Toggle Knob */}
            <div 
              className="theme-toggle" 
              onClick={handleGlobalToggleTheme}
              role="button"
              title="Toggle Color Theme"
              style={{ flexShrink: 0 }}
            >
              <div 
                className="theme-toggle-knob" 
                style={{ transform: isProTheme ? 'translateX(26px)' : 'none' }}
              >
                {isProTheme ? <Sun size={13} color="#08211E" /> : <Moon size={13} color="#08211E" />}
              </div>
            </div>

            {/* Consolidated Apps & Workspace Dropdown Menu */}
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 500, flexShrink: 0 }}
              onMouseEnter={() => setActiveDropdown('apps')}
              onMouseLeave={() => setActiveDropdown(null)}
              onClick={() => setActiveDropdown(activeDropdown === 'apps' ? null : 'apps')}
            >
              <button 
                className="btn btn-secondary" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === 'apps' ? null : 'apps');
                }}
                style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 500, display: 'flex', gap: '6px', alignItems: 'center' }}
              >
                <span>Workspace Apps</span>
                <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
              </button>

              {activeDropdown === 'apps' && (
                <div style={{ position: 'absolute', top: '100%', right: 0, paddingTop: '8px', zIndex: 1002 }}>
                  <div className="glass-card" style={{
                    width: '240px', padding: '8px', background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '4px',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.3)', textAlign: 'left'
                  }}>
                    <div 
                      className="dropdown-link" 
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => { handleTriggerContextualSlide('AI quiz generator', true); setActiveDropdown(null); }}
                    >
                      <span>🤖 PulseAI Quiz Generator ⚡</span>
                    </div>
                    <div 
                      className="dropdown-link" 
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => { setView('sessions'); setActiveDropdown(null); }}
                    >
                      <span>📅 Multi-Day Workshops</span>
                    </div>
                    <div 
                      className="dropdown-link" 
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => { setView('remote'); setActiveDropdown(null); }}
                    >
                      <span>📱 Trainer Companion App</span>
                    </div>
                    <div 
                      className="dropdown-link" 
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => { handleNavigateToAudience(); setActiveDropdown(null); }}
                    >
                      <span>🧩 Join Audience Room</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border-soft)', margin: '4px 0' }} />
                    <div 
                      className="dropdown-link" 
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--accent)' }}
                      onClick={() => { setView('pricing'); setActiveDropdown(null); }}
                    >
                      <span>⚡ View Subscriptions & Plans</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {user?.email === 'pradeepvarkala@gmail.com' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '10px', border: '1px solid var(--border-soft)', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Plan:</span>
                <select 
                  value={user.tier}
                  onChange={async (e) => {
                    const targetTier = e.target.value;
                    try {
                      const res = await fetch('/api/admin/update-tier', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'x-user-email': user.email
                        },
                        body: JSON.stringify({ targetEmail: user.email, tier: targetTier })
                      });
                      const data = await res.json();
                      if (data.success) {
                        const updatedUser = { ...user, tier: targetTier, subscription_status: targetTier === 'free' ? 'inactive' : 'active' };
                        setUser(updatedUser);
                        localStorage.setItem('pulse-poll-user', JSON.stringify(updatedUser));
                        alert(`Switched active plan environment to: ${targetTier.toUpperCase()}`);
                      }
                    } catch(err) {
                      console.error(err);
                    }
                  }}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-primary)',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '2px 4px', outline: 'none'
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="pro">Pro</option>
                  <option value="free">Free</option>
                </select>
              </div>
            )}
          </div>

          {/* STICKY ALWAYS-VISIBLE RIGHT SECTION: Profile & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setView('admin')}
              title="View Profile Settings"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 12px',
                borderRadius: '20px', border: '1px solid var(--border-soft)',
                background: 'var(--surface-2)', flexShrink: 0
              }}
            >
              <div 
                style={{ 
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C6FF0, #4C7CF0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 600, color: 'white', fontSize: '0.75rem', overflow: 'hidden'
                }}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  (user?.name || user?.email || 'U').slice(0, 1).toUpperCase()
                )}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || user?.email?.split('@')[0] || 'Profile'}
              </span>
            </button>

            <button 
              className="btn"
              onClick={handleLogout}
              title="Logout of PulsePoll"
              style={{
                padding: '6px 14px', fontSize: '0.82rem', fontWeight: 500,
                color: 'var(--danger)', background: 'var(--danger-soft)',
                border: '1px solid transparent', borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0
              }}
            >
              <LogOut size={15} color="var(--danger)" />
              <span>Logout</span>
            </button>
          </div>
        </header>
      )}

      {/* Primary Routing Panel */}
      {view !== 'presenter' && view !== 'audience' ? (
        <main className="main-content">
          {view === 'dashboard' && (
            <Dashboard 
              user={user}
              onViewCreator={handleNavigateToCreator}
              onViewPresenter={handleNavigateToPresenter}
              onJoinAudience={handleNavigateToAudience}
              onOpenAiGenerator={() => handleTriggerContextualSlide('AI quiz generator', true)}
              onViewSessions={() => setView('sessions')}
              onViewAnalytics={(pres) => {
                if (pres) setSelectedPresentationId(pres.id);
                setView('analytics');
              }}
              onViewEscapeRoom={(pres) => {
                if (pres) setSelectedPresentationId(pres.id);
                setView('escaperoom');
              }}
              onViewMeetingScheduler={(pres) => {
                if (pres) setSelectedPresentationId(pres.id);
                setView('meeting');
              }}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              onLogout={handleLogout}
            />
          )}

          {view === 'creator' && (
            <Creator 
              presentationId={selectedPresentationId}
              onBack={handleNavigateToDashboard}
              onPresent={handleNavigateToPresenter}
              user={user}
              onRequestUpgrade={() => setShowUpgradeModal(true)}
            />
          )}

          {view === 'analytics' && (
            <AnalyticsReport 
              presentation={presentations.find(p => p.id === selectedPresentationId) || userPresentations[0] || presentations[0]}
              onBack={handleNavigateToDashboard}
              user={user}
            />
          )}

          {view === 'escaperoom' && (
            <EscapeRoomBuilder 
              presentation={CATEGORY_TEMPLATES[0]}
              onBack={handleNavigateToDashboard}
              user={user}
              onRequestUpgrade={() => setShowUpgradeModal(true)}
            />
          )}

          {view === 'meeting' && (
            <VirtualMeetingScheduler 
              presentation={CATEGORY_TEMPLATES[0]}
              onBack={handleNavigateToDashboard}
              user={user}
            />
          )}

          {view === 'sessions' && (
            <SessionManager 
              onLaunchPresenter={(presId) => {
                setSelectedPresentationId(presId);
                handleNavigateToPresenter();
              }}
              onViewCreator={(presId) => {
                if (presId) setSelectedPresentationId(presId);
                setView('creator');
              }}
              onBackToDashboard={handleNavigateToDashboard}
            />
          )}

          {view === 'admin' && (
            <AdminPanel 
              user={user}
              onLogout={handleLogout}
              onBackToDashboard={handleNavigateToDashboard}
            />
          )}

          {view === 'pricing' && (
            <Pricing 
              onBack={handleNavigateToDashboard}
            />
          )}

          {view === 'remote' && (
            <InstructorRemote 
              user={user}
              presentations={CATEGORY_TEMPLATES}
              onBack={handleNavigateToDashboard}
            />
          )}
        </main>
      ) : (
        /* Fullscreen Viewports */
        <>
          {view === 'presenter' && (
            <Presenter 
              presentationId={selectedPresentationId}
              onBack={handleNavigateToDashboard}
              user={user}
            />
          )}

          {view === 'audience' && (
            <Audience 
              defaultRoomCode={urlRoomCode}
              onBackToMenu={handleNavigateToDashboard}
            />
          )}
        </>
      )}

      {/* 1. Template Explorer Overlay Modal */}
      {activeSubmenuTemplateCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 7, 18, 0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          padding: '20px'
        }}>
          <div className="animate-fade" style={{
            width: '100%', maxWidth: '900px', background: '#090d16', border: '1.5px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '24px', padding: '32px', position: 'relative', overflowY: 'auto', maxHeight: '90vh',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.2)'
          }}>
            <button 
              onClick={() => setActiveSubmenuTemplateCategory(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', fontSize: '1.2rem', cursor: 'pointer',
                width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Close Explorer Modal"
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>📁</span>
              <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 900, color: '#ffffff' }}>
                Category: <span style={{ color: '#06b6d4' }}>{activeSubmenuTemplateCategory}</span>
              </h2>
            </div>
            
            <p style={{ color: '#cbd5e1', marginBottom: '28px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Explore high-quality templates and interactive configurations built for <strong style={{ color: '#ffffff' }}>{activeSubmenuTemplateCategory}</strong>. Launch or clone any setup instantly.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
              {CATEGORY_TEMPLATES.filter(tpl => {
                if (!activeSubmenuTemplateCategory) return false;
                const term = activeSubmenuTemplateCategory.trim().toLowerCase();
                if (term.includes('templates') || term === 'all') return true;
                const sub = (tpl.subcategory || tpl.category || '').toLowerCase();
                return sub === term || term.includes(sub) || sub.includes(term);
              }).map((tpl) => {
                const isPremiumLocked = tpl.isPremium && !isFeatureUnlocked(tpl.id.includes('template-5') ? 'stopwatch' : 'brainstorm');

                return (
                  <div key={tpl.id} style={{
                    padding: '24px', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.12)',
                    background: 'rgba(15, 23, 42, 0.95)', display: 'flex', flexDirection: 'column',
                    justify: 'space-between', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px' }}>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>{tpl.title}</h4>
                        {tpl.isPremium && (
                          <span style={{ 
                            fontSize: '0.7rem', fontWeight: 800, background: isPremiumLocked ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                            color: isPremiumLocked ? '#f87171' : '#34d399', padding: '4px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
                            border: isPremiumLocked ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(16,185,129,0.4)'
                          }}>
                            {isPremiumLocked ? '🔒 Premium' : '🔓 Active'}
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Visual Theme: <strong style={{ textTransform: 'capitalize', color: '#38bdf8' }}>{tpl.theme}</strong>
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SLIDES DECK:</span>
                        {tpl.slides.map((s, idx) => (
                          <div key={idx} style={{ fontSize: '0.82rem', display: 'flex', gap: '8px', alignItems: 'center', color: '#e2e8f0' }}>
                            <span style={{ color: '#38bdf8' }}>🔹</span>
                            <span style={{ textTransform: 'capitalize', fontWeight: 800, color: '#38bdf8' }}>{s.type}</span>
                            <span style={{ color: '#94a3b8' }}>:</span>
                            <span style={{ color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      className={`btn ${isPremiumLocked ? 'btn-secondary' : 'btn-primary'}`} 
                      style={{ width: '100%', fontWeight: 800, padding: '12px', fontSize: '0.9rem' }}
                      onClick={() => handleUseSubmenuTemplate(tpl)}
                    >
                      {isPremiumLocked ? 'Unlock Template ⚡' : 'Launch Workspace 🚀'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Upgrade / Purchase Modal Overlay */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{
            width: '100%', maxWidth: '600px', background: '#0b0f19', border: '1px solid var(--border-glass)',
            borderRadius: '24px', padding: '30px', position: 'relative', textAlign: 'center'
          }}>
            <button 
              onClick={() => setShowUpgradeModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', background: 'transparent',
                border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer'
              }}
            >
              ✕
            </button>

            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '15px' }}>🔒</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Unlock Premium Modules</h2>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: 1.5 }}>
              This template or feature requires premium clearance. You can upgrade to a paid subscription or redeem points/coins earned from referrals to unlock temporarily!
            </p>

            {/* Flash Sale Banner in Modal */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)', border: '1px dashed var(--primary)',
              padding: '12px 16px', borderRadius: '12px', marginBottom: '30px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>⚡ FLASH COUPON: REFER50 (50% OFF)</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-red)' }}>⏱️ LIMITED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', fontWeight: 800 }}
                onClick={() => {
                  setView('pricing');
                  setShowUpgradeModal(false);
                }}
              >
                Upgrade Plan (Stripe Checkout) ⚡
              </button>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '14px', fontWeight: 800 }}
                onClick={() => {
                  setView('dashboard');
                  setShowUpgradeModal(false);
                  alert('Open the "Refer & Earn" tab in your navigation menu to redeem coin rewards for premium modules!');
                }}
              >
                Redeem with Referral Coins 🪙
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. AI Quiz / Presentation Generator Modal Overlay */}
      {showAiGeneratorModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 16, 0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{
            width: '100%', maxWidth: '540px', background: '#0b0f19', border: '1px solid var(--border-glass)',
            borderRadius: '24px', padding: '35px', position: 'relative', textAlign: 'center'
          }}>
            {!isGeneratingAi ? (
              <>
                <button 
                  onClick={() => {
                    setShowAiGeneratorModal(false);
                    setAiPrompt('');
                  }}
                  style={{
                    position: 'absolute', top: '20px', right: '20px', background: 'transparent',
                    border: 'none', color: 'var(--text-secondary)', fontSize: '1.5rem', cursor: 'pointer'
                  }}
                >
                  ✕
                </button>

                <span style={{ fontSize: '3.2rem', display: 'block', marginBottom: '15px' }}>🤖</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  PulseAI Interactive Quiz Generator
                </h2>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Enter any topic or prompt below. Our local presentation design model will dynamically customize a 3-slide interactive suite for you instantly.
                </p>

                <form onSubmit={handleGenerateAiSlides}>
                  <div className="settings-group" style={{ marginBottom: '25px', textAlign: 'left' }}>
                    <label style={{ fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '8px' }}>
                      Riddle, Class topic or Training Title:
                    </label>
                    <input 
                      type="text" 
                      className="input-text"
                      placeholder="e.g. Dinosaur facts for 3rd grade, Cybersecurity 101, Agile retrospective"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%', padding: '14px 18px', background: '#0f172a',
                        border: '2px solid var(--primary)', borderRadius: '12px',
                        color: '#ffffff', fontSize: '1rem', fontWeight: 600,
                        outline: 'none', boxShadow: '0 0 15px rgba(6,182,212,0.2)'
                      }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '14px', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    Generate Interactive Slides ⚡
                  </button>
                </form>
              </>
            ) : (
              <div style={{ padding: '20px 0' }}>
                <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '3px solid rgba(6,182,212,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '25px' }} />
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                  PulseAI Generating Workspace...
                </h3>
                <div style={{
                  background: 'rgba(6,182,212,0.05)', border: '1px solid var(--border-glass)',
                  padding: '16px 20px', borderRadius: '12px', color: 'var(--primary)',
                  fontWeight: 700, fontSize: '0.9rem', fontFamily: 'monospace', minHeight: '52px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {aiProgressText}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
