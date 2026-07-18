import React, { useState, useEffect } from 'react';
import { Plus, Play, Edit3, Trash2, Users, Presentation as PresentationIcon } from 'lucide-react';

export default function Dashboard({ onViewCreator, onViewPresenter, onJoinAudience }) {
  const [presentations, setPresentations] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // 11 distinct slide types seeded across 2 templates
  const defaultPresentations = [
    {
      id: 'demo-1',
      title: 'Interactive Survey & Image Pinning',
      updatedAt: new Date().toLocaleDateString(),
      theme: 'corporate',
      slides: [
        {
          id: 'slide-1',
          type: 'scales',
          question: 'Rate our session on these dimensions (1-5):',
          options: [
            { id: 'sc-1', text: 'Content Quality' },
            { id: 'sc-2', text: 'Pace & Timing' },
            { id: 'sc-3', text: 'Presenter Delivery' }
          ]
        },
        {
          id: 'slide-2',
          type: 'ranking',
          question: 'Rank the following project constraints by priority:',
          options: [
            { id: 'rk-1', text: 'Budget / Cost' },
            { id: 'rk-2', text: 'Timeline / Speed' },
            { id: 'rk-3', text: 'Scope / Features' }
          ]
        },
        {
          id: 'slide-3',
          type: 'points',
          question: 'Distribute 100 points among these development areas:',
          options: [
            { id: 'pt-1', text: 'New Features' },
            { id: 'pt-2', text: 'Bug Fixing' },
            { id: 'pt-3', text: 'UI Refactoring' },
            { id: 'pt-4', text: 'Documentation' }
          ]
        },
        {
          id: 'slide-4',
          type: 'grid',
          question: 'Place these tools: Ease of Use vs Business Value',
          options: [
            { id: 'gd-1', text: 'Jira' },
            { id: 'gd-2', text: 'Excel' },
            { id: 'gd-3', text: 'Slack' }
          ],
          xAxisLabel: 'Ease of Use',
          yAxisLabel: 'Business Value'
        },
        {
          id: 'slide-5',
          type: 'pin',
          question: 'Pin where you feel we stand on this Target Matrix:',
          pinImageType: 'target' // 'target' or 'quadrants'
        },
        {
          id: 'slide-6',
          type: 'form',
          question: 'Quick Feedback Form:',
          options: [
            { id: 'fm-1', text: 'Full Name' },
            { id: 'fm-2', text: 'Department' },
            { id: 'fm-3', text: 'Key Takeaway' }
          ]
        }
      ]
    },
    {
      id: 'demo-2',
      title: 'Icebreakers & Group Guessing Game',
      updatedAt: new Date().toLocaleDateString(),
      theme: 'light-luxe',
      slides: [
        {
          id: 'slide-7',
          type: 'wordcloud',
          question: 'Describe your workplace culture in ONE word:'
        },
        {
          id: 'slide-8',
          type: 'guess',
          question: 'Guess the Number: How many lines of code are in this app?',
          correctNumber: 1540
        },
        {
          id: 'slide-9',
          type: 'openended',
          question: 'What is the biggest challenge in implementing agentic AI?'
        },
        {
          id: 'slide-10',
          type: 'poll',
          question: 'Which interactive element do you find most engaging?',
          options: [
            { id: 'pl-1', text: 'Real-time Word Clouds' },
            { id: 'pl-2', text: 'Pin on Targets' },
            { id: 'pl-3', text: '2x2 Matrix Plots' },
            { id: 'pl-4', text: 'Live Quizzes & Leaderboards' }
          ]
        },
        {
          id: 'slide-11',
          type: 'qa',
          question: 'Audience Q&A Session'
        }
      ]
    }
  ];

  const user = JSON.parse(localStorage.getItem('pulse-poll-user') || '{}');
  const userEmail = user.email || 'guest@pulsepoll.com';

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const res = await fetch('/api/presentations', {
          headers: { 'x-user-email': userEmail }
        });
        const data = await res.json();
        
        if (data && data.length > 0) {
          // MySQL returns slides as parsed JSON objects in mysql2
          const parsed = data.map(p => ({
            ...p,
            slides: typeof p.slides === 'string' ? JSON.parse(p.slides) : p.slides
          }));
          setPresentations(parsed);
        } else {
          setPresentations(defaultPresentations);
          for (const pres of defaultPresentations) {
            await fetch('/api/presentations', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-user-email': userEmail
              },
              body: JSON.stringify(pres)
            });
          }
        }
      } catch (err) {
        console.error('Error fetching presentations:', err);
        const saved = localStorage.getItem('pulse-poll-presentations');
        if (saved) {
          setPresentations(JSON.parse(saved));
        } else {
          localStorage.setItem('pulse-poll-presentations', JSON.stringify(defaultPresentations));
          setPresentations(defaultPresentations);
        }
      }
    };

    fetchPresentations();
  }, []);

  const handleCreatePresentation = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPres = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTitle.trim(),
      updatedAt: new Date().toLocaleDateString(),
      theme: localStorage.getItem('pulse-poll-default-theme') || 'corporate',
      slides: [
        {
          id: Math.random().toString(36).substr(2, 9),
          type: 'poll',
          question: 'First Slide: Edit your question here',
          options: [
            { id: 'opt-1', text: 'Option A' },
            { id: 'opt-2', text: 'Option B' }
          ]
        }
      ]
    };

    const updated = [newPres, ...presentations];
    setPresentations(updated);
    localStorage.setItem('pulse-poll-presentations', JSON.stringify(updated));
    setNewTitle('');
    setIsCreateModalOpen(false);

    try {
      await fetch('/api/presentations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail
        },
        body: JSON.stringify(newPres)
      });
    } catch (err) {
      console.error('Error saving presentation:', err);
    }

    onViewCreator(newPres.id);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this presentation?')) {
      const updated = presentations.filter(p => p.id !== id);
      setPresentations(updated);
      localStorage.setItem('pulse-poll-presentations', JSON.stringify(updated));

      try {
        await fetch(`/api/presentations/${id}`, {
          method: 'DELETE',
          headers: { 'x-user-email': userEmail }
        });
      } catch (err) {
        console.error('Error deleting presentation:', err);
      }
    }
  };

  return (
    <div className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Your Presentations</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Create interactive slides, collect votes, and run live polls.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={onJoinAudience}>
            <Users size={18} /> Join Room
          </button>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={18} /> New Presentation
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {presentations.map((pres) => (
          <div 
            key={pres.id} 
            className="glass-card presentation-card"
            onClick={() => onViewCreator(pres.id)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div className="logo-icon" style={{ width: '28px', height: '28px' }}>
                  <PresentationIcon size={14} color="white" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{pres.title}</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {pres.slides.length} {pres.slides.length === 1 ? 'slide' : 'slides'} • Theme: <span style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: '700' }}>{pres.theme || 'neon'}</span>
              </p>
            </div>

            <div className="card-meta">
              <span>Updated {pres.updatedAt}</span>
              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button 
                  className="btn btn-secondary btn-icon" 
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => onViewCreator(pres.id)}
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  className="btn btn-primary btn-icon" 
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => onViewPresenter(pres.id)}
                  title="Present Live"
                >
                  <Play size={14} />
                </button>
                <button 
                  className="btn btn-secondary btn-icon" 
                  style={{ width: '32px', height: '32px', color: 'var(--accent-red)' }}
                  onClick={(e) => handleDelete(pres.id, e)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {presentations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <PresentationIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No presentations yet</h3>
          <p>Click "New Presentation" above to build your first interactive deck.</p>
        </div>
      )}

      {isCreateModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card animate-fade" style={{ padding: '2rem', width: '90%', maxWidth: '450px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Create New Presentation</h3>
            <form onSubmit={handleCreatePresentation}>
              <div className="settings-group" style={{ marginBottom: '1.5rem' }}>
                <label>Presentation Title</label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="e.g., Q3 Planning Session" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewTitle('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
