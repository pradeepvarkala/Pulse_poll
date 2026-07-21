import React, { useState, useEffect } from 'react';
import { Plus, Play, Edit3, Trash2, Users, Presentation as PresentationIcon } from 'lucide-react';

export default function Dashboard({ user, onViewCreator, onViewPresenter, onJoinAudience }) {
  const [presentations, setPresentations] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // 11 distinct slide types seeded across 2 templates
  const defaultPresentations = [
    {
      id: 'kids-template-1',
      title: '🦖 Dinosaur Riddle Adventure',
      updatedAt: new Date().toLocaleDateString(),
      theme: 'playroom',
      slides: [
        {
          id: 'k1-s1',
          type: 'quiz',
          question: 'I have a tiny brain, plates on my back, and a spiked tail. Who am I? 🦕',
          options: [
            { id: 'k1-o1', text: 'Stegosaurus (Correct)' },
            { id: 'k1-o2', text: 'T-Rex' },
            { id: 'k1-o3', text: 'Triceratops' }
          ],
          timeLimit: 15
        },
        {
          id: 'k1-s2',
          type: 'wordcloud',
          question: 'Describe a dinosaur roar sound in one funny word! 📣',
          options: []
        },
        {
          id: 'k1-s3',
          type: 'scales',
          question: 'Rate these prehistoric dinosaurs from cool to scary (1-5):',
          options: [
            { id: 'k1-sc1', text: 'Tyrannosaurus Rex' },
            { id: 'k1-sc2', text: 'Brachiosaurus' },
            { id: 'k1-sc3', text: 'Velociraptor' }
          ]
        }
      ]
    },
    {
      id: 'kids-template-2',
      title: '🪐 Space Explorer Quest',
      updatedAt: new Date().toLocaleDateString(),
      theme: 'ocean',
      slides: [
        {
          id: 'k2-s1',
          type: 'quiz',
          question: 'True or False: A day on Venus is longer than a year on Venus! 🌌',
          options: [
            { id: 'k2-o1', text: 'True (Correct)' },
            { id: 'k2-o2', text: 'False' }
          ],
          timeLimit: 15
        },
        {
          id: 'k2-s2',
          type: 'wordcloud',
          question: 'If you discovered a new star, what would you name it? ⭐',
          options: []
        },
        {
          id: 'k2-s3',
          type: 'poll',
          question: 'Which place in the solar system would you explore first?',
          options: [
            { id: 'k2-p1', text: 'The Crimson Mars 🔴' },
            { id: 'k2-p2', text: 'Saturn\'s Icy Rings 🪐' },
            { id: 'k2-p3', text: 'Dark Side of the Moon 🌕' }
          ]
        }
      ]
    },
    {
      id: 'kids-template-3',
      title: '🐙 Deep Ocean Secrets & Grid Classifiers',
      updatedAt: new Date().toLocaleDateString(),
      theme: 'cyber-mint',
      slides: [
        {
          id: 'k3-s1',
          type: 'quiz',
          question: 'Where is a shrimp\'s heart located? 🦐',
          options: [
            { id: 'k3-o1', text: 'In its head (Correct)' },
            { id: 'k3-o2', text: 'In its tail' },
            { id: 'k3-o3', text: 'In its stomach' }
          ],
          timeLimit: 15
        },
        {
          id: 'k3-s2',
          type: 'brainstorm',
          question: 'Brainstorm 2 deep ocean creatures that glow in the dark! 🌟',
          category1: 'Glowing Fish 🐟',
          category2: 'Lantern Squid 🦑',
          category3: 'Jellyfish 🪼',
          category4: 'Microbes / Plankton 🦠',
          options: []
        },
        {
          id: 'k3-s3',
          type: 'poll',
          question: 'Which ocean zone receives absolutely zero sunlight?',
          options: [
            { id: 'k3-p1', text: 'Sunlight Zone' },
            { id: 'k3-p2', text: 'Twilight Zone' },
            { id: 'k3-p3', text: 'Midnight Zone (Correct)' }
          ]
        }
      ]
    },
    {
      id: 'kids-template-4',
      title: '🦁 Wild Animal Safari & Puzzles',
      updatedAt: new Date().toLocaleDateString(),
      theme: 'sunset',
      slides: [
        {
          id: 'k4-s1',
          type: 'quiz',
          question: 'What animal produces pink sweat to stay cool? 🦛',
          options: [
            { id: 'k4-o1', text: 'Hippopotamus (Correct)' },
            { id: 'k4-o2', text: 'Zebra' },
            { id: 'k4-o3', text: 'Cheetah' }
          ],
          timeLimit: 20
        },
        {
          id: 'k4-s2',
          type: 'wordcloud',
          question: 'What sound does a sleeping koala make? 🐨',
          options: []
        },
        {
          id: 'k4-s3',
          type: 'grid',
          question: 'Plot these wild animals on a speed vs weight coordinate matrix:',
          options: [
            { id: 'k4-g1', text: 'Lion' },
            { id: 'k4-g2', text: 'Grizzly Bear' }
          ],
          xAxisLabel: 'Running Speed',
          yAxisLabel: 'Body Weight'
        }
      ]
    },
    {
      id: 'kids-template-5',
      title: '🧪 Science Riddles & Millisecond Countdown',
      updatedAt: new Date().toLocaleDateString(),
      theme: 'classic-slate',
      slides: [
        {
          id: 'k5-s1',
          type: 'quiz',
          question: 'What is the only rock that is light enough to float on water? 🪨',
          options: [
            { id: 'k5-o1', text: 'Pumice (Correct)' },
            { id: 'k5-o2', text: 'Granite' },
            { id: 'k5-o3', text: 'Basalt' }
          ],
          timeLimit: 15
        },
        {
          id: 'k5-s2',
          type: 'stopwatch',
          question: '🎹 Riddle Countdown: I have keys but no locks. What am I?',
          options: [],
          timeLimit: 30
        },
        {
          id: 'k5-s3',
          type: 'poll',
          question: 'Which science experiment is most fun to watch?',
          options: [
            { id: 'k5-p1', text: 'Mentos in Soda Volcanoes 🌋' },
            { id: 'k5-p2', text: 'Tesla Coil Lightning Bolts ⚡' },
            { id: 'k5-p3', text: 'Glow-in-the-dark Slime 🧪' }
          ]
        }
      ]
    }
  ];

  const userEmail = user?.email || 'guest@pulsepoll.com';

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

  const getBannerStyle = () => {
    const tier = user?.tier || 'free';
    if (tier === 'admin') {
      return {
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.15))',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.05)'
      };
    } else if (tier === 'business') {
      return {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.15))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.05)'
      };
    } else if (tier === 'pro') {
      return {
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.05)'
      };
    }
    return {
      background: 'rgba(255, 255, 255, 0.01)',
      border: '1px solid var(--border-glass)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '20px'
    };
  };

  const getBadgeStyle = () => {
    const tier = user?.tier || 'free';
    if (tier === 'admin') return { background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
    if (tier === 'business') return { background: '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
    if (tier === 'pro') return { background: 'var(--primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
    return { background: 'var(--text-muted)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 };
  };

  const getBadgeText = () => {
    const tier = user?.tier || 'free';
    if (tier === 'admin') return '🛡️ System Admin';
    if (tier === 'business') return '👑 Business User';
    if (tier === 'pro') return '✨ Pro Member';
    return '🌱 Free Account';
  };

  return (
    <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', minHeight: 'calc(100vh - 120px)', width: '100%' }} className="animate-fade">
      {/* 1. Left Sidebar Navigation Menu */}
      <div className="glass-card" style={{
        width: '260px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px',
        position: 'sticky', top: '90px', border: '1px solid var(--border-glass)', borderRadius: '16px'
      }}>
        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Navigation Menu
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className="btn" 
            style={{ 
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', justifyContent: 'flex-start', fontSize: '0.9rem',
              background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: 700
            }}
          >
            📂 My Presentations
          </button>
          
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', justifyContent: 'flex-start', fontSize: '0.9rem', background: 'transparent', border: 'none' }}
            onClick={onJoinAudience}
          >
            🧩 Join a Room
          </button>
          
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', justifyContent: 'flex-start', fontSize: '0.9rem', background: 'transparent', border: 'none' }}
            onClick={() => alert('Explore premium templates inside our learning & educational drop-downs in the header menu!')}
          >
            🎨 Templates Library
          </button>

          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', justifyContent: 'flex-start', fontSize: '0.9rem', background: 'transparent', border: 'none' }}
            onClick={() => alert('Check the user_manual.md inside your workspace directory for tips & tricks!')}
          >
            📚 Help & Guides
          </button>
        </div>
      </div>

      {/* 2. Main Content Dashboard */}
      <div style={{ flex: 1 }}>
        {/* Tier Custom Differentiated Dashboard Header */}
        <div style={getBannerStyle()}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '2.2rem', margin: 0 }}>Welcome back, {user?.name || 'Presenter'}</h1>
              <span style={getBadgeStyle()}>{getBadgeText()}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              {user?.tier === 'admin' 
                ? 'You have complete administrative root permissions. Manage presentations, system settings, and core databases.' 
                : 'Create interactive slides, collect live audience feedback, and run timed tests.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
      </div>

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
