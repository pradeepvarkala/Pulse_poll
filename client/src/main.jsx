import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PulsePoll App Crash Error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0b0f19', color: '#f8fafc',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', fontFamily: 'sans-serif', textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
            padding: '40px', borderRadius: '24px', maxWidth: '450px', width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>⚡</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 10px 0' }}>PulsePoll App Recovery</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
              A temporary browser cache error occurred. Click below to clear state and reload cleanly.
            </p>
            <button 
              onClick={this.handleReset}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', color: 'white',
                fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 0 20px rgba(6,182,212,0.4)'
              }}
            >
              🔄 Clear Cache & Reload Site
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
