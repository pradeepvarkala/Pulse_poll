import React, { useState } from 'react';
import { 
  ArrowLeft, BarChart3, TrendingUp, Zap, Clock, AlertTriangle, 
  HelpCircle, Award, Target, MessageSquare, CheckCircle, Sparkles, Download, Layers 
} from 'lucide-react';

export default function AnalyticsReport({ presentation, onBack, user }) {
  const [activeTab, setActiveTab] = useState('summary'); // summary, slides, ai_suggestions

  // Mock robust analytics engine matching presentation slides
  const slides = presentation?.slides || [
    { id: 's1', type: 'quiz', question: 'What is the standard significance threshold (alpha level)?', options: [{ text: 'p < 0.05' }, { text: 'p < 0.50' }] },
    { id: 's2', type: 'poll', question: 'How do you currently capture team engagement?', options: [{ text: 'Software' }, { text: 'Email' }] },
    { id: 's3', type: 'wordcloud', question: 'What are your core values for teamwork?' },
    { id: 's4', type: 'qa', question: 'Host Q&A - Ask anything about modules!' }
  ];

  // Derived Analytics Data Calculation
  const totalParticipants = 45;
  const activeParticipants = 42;
  const completionRate = 93.3; // %
  const overallAvgTime = 24; // seconds

  const slideAnalytics = slides.map((s, index) => {
    const slideNo = index + 1;
    // Realistic seeded metrics
    const responsesCount = Math.max(12, Math.floor(activeParticipants * (1 - (index * 0.06))));
    const avgResponseTime = index === 0 ? 8 : index === 1 ? 14 : index === 2 ? 42 : 102; // seconds
    const skipCount = totalParticipants - responsesCount;
    const skipPercentage = Math.round((skipCount / totalParticipants) * 100);
    const accuracyPercentage = s.type === 'quiz' ? (index === 0 ? 84 : 32) : null;
    const confusionScore = (avgResponseTime > 35 && accuracyPercentage !== null && accuracyPercentage < 40) ? 'HIGH' : 'NORMAL';

    return {
      slideNo,
      slideId: s.id,
      type: s.type,
      question: s.question || `Slide ${slideNo}`,
      responsesCount,
      avgResponseTime,
      skipCount,
      skipPercentage,
      accuracyPercentage,
      confusionScore,
      engagementScore: Math.min(100, Math.round((responsesCount / totalParticipants * 60) + (100 - skipPercentage) * 0.4))
    };
  });

  // Key Highlights Computation
  const fastestSlide = [...slideAnalytics].sort((a, b) => a.avgResponseTime - b.avgResponseTime)[0];
  const slowestSlide = [...slideAnalytics].sort((a, b) => b.avgResponseTime - a.avgResponseTime)[0];
  const mostSkippedSlide = [...slideAnalytics].sort((a, b) => b.skipPercentage - a.skipPercentage)[0];
  const mostEngagedSlide = [...slideAnalytics].sort((a, b) => b.responsesCount - a.responsesCount)[0];
  const lowestEngagedSlide = [...slideAnalytics].sort((a, b) => a.responsesCount - b.responsesCount)[0];
  const dropOffSlide = slideAnalytics.find(s => s.skipPercentage > 20) || slideAnalytics[slideAnalytics.length - 1];
  const confusionSlide = slideAnalytics.find(s => s.confusionScore === 'HIGH') || slowestSlide;
  const bestQuizSlide = slideAnalytics.filter(s => s.accuracyPercentage !== null).sort((a, b) => b.accuracyPercentage - a.accuracyPercentage)[0];
  const hardestQuizSlide = slideAnalytics.filter(s => s.accuracyPercentage !== null).sort((a, b) => a.accuracyPercentage - b.accuracyPercentage)[0];

  const overallEngagementScore = Math.round(slideAnalytics.reduce((acc, curr) => acc + curr.engagementScore, 0) / slideAnalytics.length);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="btn btn-secondary btn-icon" onClick={onBack} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              📊 Deep Slide-by-Slide Analytics
            </h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Presentation: <strong>{presentation?.title || 'Interactive Session'}</strong> • {slides.length} Slides Analyzed
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => alert('Exporting complete PDF Analytics Report...')}
            style={{ fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}
          >
            <Download size={14} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Primary KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>OVERALL ENGAGEMENT</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#06b6d4', margin: '4px 0' }}>{overallEngagementScore}/100</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Composite Session Health</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>ACTIVE PARTICIPANTS</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>{activeParticipants} / {totalParticipants}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completionRate}% Completion Rate</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>AVG TIME PER SLIDE</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#3b82f6', margin: '4px 0' }}>{overallAvgTime}s</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pacing Velocity</div>
        </div>

        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>CONFUSION INDICATOR</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: confusionSlide ? '#ef4444' : '#10b981', margin: '4px 0' }}>
            Slide {confusionSlide?.slideNo}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Response Time + Low Accuracy</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-glass)', marginBottom: '24px', gap: '20px' }}>
        <button 
          className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          onClick={() => setActiveTab('summary')}
        >
          🌟 Executive Summary Highlights
        </button>
        <button 
          className={`btn ${activeTab === 'slides' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          onClick={() => setActiveTab('slides')}
        >
          📋 Slide-by-Slide Table & Graph
        </button>
        <button 
          className={`btn ${activeTab === 'ai_suggestions' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '10px 18px', fontSize: '0.85rem', display: 'flex', gap: '6px', alignItems: 'center' }}
          onClick={() => setActiveTab('ai_suggestions')}
        >
          <span>🤖 PulseAI Session Improvement Suggestions</span>
          <span style={{ fontSize: '0.75rem', background: '#06b6d4', color: 'white', padding: '2px 6px', borderRadius: '10px' }}>NEW</span>
        </button>
      </div>

      {/* 1. EXECUTIVE SUMMARY HIGHLIGHTS */}
      {activeTab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Fastest Slide */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
              <Zap size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>⚡ FASTEST RESPONSE SLIDE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>Slide {fastestSlide?.slideNo} – Avg: {fastestSlide?.avgResponseTime} seconds</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>"{fastestSlide?.question}"</p>
            </div>
          </div>

          {/* Slowest Slide */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
              <Clock size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>🐢 SLOWEST RESPONSE SLIDE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>Slide {slowestSlide?.slideNo} – Avg: {Math.floor(slowestSlide?.avgResponseTime / 60)}m {slowestSlide?.avgResponseTime % 60}s</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>"{slowestSlide?.question}"</p>
            </div>
          </div>

          {/* Most Skipped Slide */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>⚠️ MOST SKIPPED SLIDE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>Slide {mostSkippedSlide?.slideNo} – Skipped by {mostSkippedSlide?.skipPercentage}%</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>"{mostSkippedSlide?.question}"</p>
            </div>
          </div>

          {/* Most Attended / Engaged Slide */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', flexShrink: 0 }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>🔥 MOST ENGAGED SLIDE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>Slide {mostEngagedSlide?.slideNo} – {mostEngagedSlide?.responsesCount} Responses</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>"{mostEngagedSlide?.question}"</p>
            </div>
          </div>

          {/* Drop-off Slide */}
          <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', flexShrink: 0 }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>📉 PARTICIPANT DROP-OFF POINT</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>Slide {dropOffSlide?.slideNo} (Drop-off initiated)</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Responses decreased past this slide milestone.</p>
            </div>
          </div>

          {/* Quiz Performance */}
          {bestQuizSlide && (
            <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0 }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 800 }}>🏆 BEST PERFORMING QUIZ</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, margin: '4px 0' }}>Slide {bestQuizSlide.slideNo} – {bestQuizSlide.accuracyPercentage}% Accuracy</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>"{bestQuizSlide.question}"</p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 2. SLIDE-BY-SLIDE TABLE & GRAPH */}
      {activeTab === 'slides' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Visual Participation Timeline Graph Bar */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '15px', color: 'var(--primary)' }}>
              📈 Slide-by-Slide Participation Timeline Graph
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '140px', padding: '10px 0', borderBottom: '1px solid var(--border-glass)' }}>
              {slideAnalytics.map((s) => {
                const heightPct = Math.round((s.responsesCount / totalParticipants) * 100);
                return (
                  <div key={s.slideId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{s.responsesCount}</div>
                    <div style={{ width: '100%', maxWidth: '40px', height: `${heightPct}%`, background: 'linear-gradient(180deg, #06b6d4, #2563eb)', borderRadius: '6px 6px 0 0' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>S{s.slideNo}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Table Breakdown */}
          <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>Slide #</th>
                  <th style={{ padding: '12px' }}>Type</th>
                  <th style={{ padding: '12px' }}>Question / Prompt</th>
                  <th style={{ padding: '12px' }}>Responses</th>
                  <th style={{ padding: '12px' }}>Avg Time</th>
                  <th style={{ padding: '12px' }}>Skip Rate</th>
                  <th style={{ padding: '12px' }}>Accuracy / Score</th>
                </tr>
              </thead>
              <tbody>
                {slideAnalytics.map((s) => (
                  <tr key={s.slideId} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '12px', fontWeight: 800 }}>Slide {s.slideNo}</td>
                    <td style={{ padding: '12px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{s.type}</td>
                    <td style={{ padding: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.question}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>{s.responsesCount} / {totalParticipants}</td>
                    <td style={{ padding: '12px' }}>{s.avgResponseTime}s</td>
                    <td style={{ padding: '12px', color: s.skipPercentage > 20 ? '#ef4444' : 'inherit' }}>{s.skipPercentage}%</td>
                    <td style={{ padding: '12px', fontWeight: 800, color: s.engagementScore > 75 ? '#10b981' : '#f59e0b' }}>{s.engagementScore} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. AI SESSION IMPROVEMENT SUGGESTIONS */}
      {activeTab === 'ai_suggestions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(6, 182, 212, 0.4)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05), rgba(37, 99, 235, 0.08))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Sparkles size={24} color="#06b6d4" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                PulseAI Automated Course Optimization Recommendations
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
              Our AI engine analyzed response times, skip rates, and accuracy metrics for your presentation session. Here are 3 high-impact recommendations to improve future engagement:
            </p>
          </div>

          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem', marginBottom: '6px' }}>
              💡 Recommendation 1: Simplify Slide {slowestSlide?.slideNo} Question & Options
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Slide {slowestSlide?.slideNo} took an average of <strong>{slowestSlide?.avgResponseTime} seconds</strong> to respond. Consider shortening the question text or reducing option choices to maintain audience momentum.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.9rem', marginBottom: '6px' }}>
              💡 Recommendation 2: Add Word Cloud Icebreaker before Slide {dropOffSlide?.slideNo}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Participant responses dropped by {dropOffSlide?.skipPercentage}% starting at Slide {dropOffSlide?.slideNo}. Insert a quick 15-second interactive Word Cloud slide prior to this section to re-engage audience attention.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.9rem', marginBottom: '6px' }}>
              💡 Recommendation 3: Praise High Quiz Performance on Slide {bestQuizSlide?.slideNo}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Slide {bestQuizSlide?.slideNo} achieved a <strong>{bestQuizSlide?.accuracyPercentage}% accuracy rate</strong>! Use this topic as a baseline benchmark for creating future quiz questions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
