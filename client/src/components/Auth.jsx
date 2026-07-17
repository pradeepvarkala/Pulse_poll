import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, KeyRound, AlertCircle } from 'lucide-react';

// Premium custom colored SVGs for Google & Microsoft brand logos
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: '6px' }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 23 23" width="18" height="18" style={{ marginRight: '6px' }}>
    <path fill="#F25022" d="M0 0h11v11H0z" />
    <path fill="#7FBA00" d="M12 0h11v11H12z" />
    <path fill="#00A4EF" d="M0 12h11v11H0z" />
    <path fill="#FFB900" d="M12 12h11v11H12z" />
  </svg>
);

export default function Auth({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  
  // Simulated Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // OAuth Simulation Popups
  const [oauthProvider, setOauthProvider] = useState(null); // 'google' or 'microsoft'
  const [oauthStep, setOauthStep] = useState(1);

  // Auto clean toast after 12 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 12000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setIsSendingCode(true);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code })
      });
      const data = await response.json();
      
      setIsSendingCode(false);
      setIsVerifying(true);

      if (data.simulated) {
        setToastMessage({
          title: 'Simulated Email Received (noreply@pulsepoll.com)',
          body: `RESEND_API_KEY not configured. Simulated OTP is: ${code}`
        });
      } else if (response.ok) {
        setToastMessage({
          title: 'Verification Email Sent!',
          body: `An actual verification code has been sent to ${email}. Please check your inbox (and spam folder).`
        });
      } else {
        setErrorMsg(data.error || 'Failed to send verification email. Falling back.');
        setToastMessage({
          title: 'Simulated Email Received (noreply@pulsepoll.com)',
          body: `Verification failed to send. Simulated OTP is: ${code}`
        });
      }
    } catch (err) {
      console.error(err);
      setIsSendingCode(false);
      setIsVerifying(true);
      setToastMessage({
        title: 'Simulated Email Received (noreply@pulsepoll.com)',
        body: `Network error sending email. Simulated OTP is: ${code}`
      });
    }
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (verificationCode.trim() === generatedCode) {
      // Success! Save mock profile to localStorage
      const userProfile = {
        name: email.split('@')[0],
        email: email.trim(),
        avatar: null,
        provider: 'email',
        createdAt: new Date().toLocaleDateString()
      };
      localStorage.setItem('pulse-poll-user', JSON.stringify(userProfile));
      onLoginSuccess(userProfile);
    } else {
      setErrorMsg('Invalid verification code. Please check your simulated inbox!');
    }
  };

  const handleOAuthLogin = (provider) => {
    setOauthProvider(provider);
    setOauthStep(1);
  };

  const selectOAuthProfile = (name, email, avatar) => {
    setOauthStep(2); // Show loading/authorizing state
    setTimeout(() => {
      const userProfile = {
        name,
        email,
        avatar,
        provider: oauthProvider,
        createdAt: new Date().toLocaleDateString()
      };
      localStorage.setItem('pulse-poll-user', JSON.stringify(userProfile));
      setOauthProvider(null);
      onLoginSuccess(userProfile);
    }, 1500); // mock OAuth redirect lag
  };

  return (
    <div className="auth-wrapper animate-fade">
      {/* Sleek simulated incoming email toast */}
      {toastMessage && (
        <div className="simulated-email-toast">
          <div className="toast-title">✉️ {toastMessage.title}</div>
          <div className="toast-body">{toastMessage.body}</div>
        </div>
      )}

      <div className="glass-card auth-card">
        <div style={{ textAlign: 'center' }}>
          <div className="logo-icon" style={{ width: '48px', height: '48px', margin: '0 auto 16px auto' }}>
            <KeyRound size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome to PulsePoll</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Choose a login provider or use verified email registration.</p>
        </div>

        {/* OAuth Buttons */}
        <div className="social-buttons">
          <button className="social-btn social-btn-google" onClick={() => handleOAuthLogin('google')}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
          <button className="social-btn social-btn-microsoft" onClick={() => handleOAuthLogin('microsoft')}>
            <MicrosoftIcon />
            <span>Continue with Microsoft</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-glass)' }} />
          <span>OR EMAIL REGISTRATION</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-glass)' }} />
        </div>

        {/* Email Signup Form / Verification Form */}
        {!isVerifying ? (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="settings-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  className="input-text" 
                  style={{ paddingLeft: '40px' }}
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> {errorMsg}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }} disabled={isSendingCode}>
              {isSendingCode ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="settings-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label>Verification Code</label>
                <button 
                  type="button" 
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                  onClick={() => setIsVerifying(false)}
                >
                  Change Email
                </button>
              </div>
              <input 
                type="text" 
                maxLength="6"
                className="input-text" 
                style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.2em' }}
                placeholder="000000" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', marginTop: '4px', display: 'block' }}>
                💡 Simulated verification code sent!
              </span>
              <div style={{ 
                marginTop: '10px', padding: '10px', borderRadius: '6px', 
                background: 'var(--primary-glow)', border: '1px dashed var(--primary)',
                textAlign: 'center', fontWeight: '800', color: 'var(--primary)', fontSize: '1.05rem' 
              }}>
                TESTING OTP: {generatedCode}
              </div>
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> {errorMsg}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
              <ShieldCheck size={18} /> Verify & Log In
            </button>
          </form>
        )}
      </div>

      {/* Simulated Social OAuth Login Windows */}
      {oauthProvider && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div className="glass-card animate-fade" style={{ width: '90%', maxWidth: '480px', background: '#0b0f19', border: '1px solid #1f2937', padding: '0', overflow: 'hidden', color: '#f8fafc' }}>
            
            {/* Header styled like a browser address bar */}
            <div style={{ background: '#111827', padding: '10px 15px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-red)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-amber)' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
              </div>
              <div style={{ 
                flex: 1, background: '#1f2937', padding: '4px 10px', borderRadius: '4px',
                fontSize: '0.75rem', color: '#9ca3af', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'
              }}>
                {oauthProvider === 'google' 
                  ? 'https://accounts.google.com/o/oauth2/v2/auth?client_id=pulsepoll...' 
                  : 'https://login.live.com/oauth20_authorize.srf?client_id=pulsepoll...'}
              </div>
            </div>

            {/* Simulated oauth screens */}
            {oauthStep === 1 ? (
              <div style={{ padding: '30px 24px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', textAlign: 'center' }}>
                  Sign in with {oauthProvider === 'google' ? 'Google' : 'Microsoft'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '20px', textAlign: 'center' }}>
                  Choose a mock account to authorize **PulsePoll**:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div 
                    onClick={() => selectOAuthProfile(
                      'Sarah Jenkins', 
                      'sarah.jenkins@company.com', 
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80'
                    )}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                      borderRadius: '8px', border: '1px solid #1f2937', cursor: 'pointer', background: '#111827'
                    }}
                  >
                    <div className="admin-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>SJ</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sarah Jenkins</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>sarah.jenkins@company.com</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => selectOAuthProfile(
                      'Alex River', 
                      'alex.river@domain.org', 
                      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=150&h=150&q=80'
                    )}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                      borderRadius: '8px', border: '1px solid #1f2937', cursor: 'pointer', background: '#111827'
                    }}
                  >
                    <div className="admin-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>AR</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Alex River</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>alex.river@domain.org</div>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', marginTop: '20px', color: '#f8fafc', borderColor: '#1f2937', background: '#111827' }}
                  onClick={() => setOauthProvider(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div className="logo-icon" style={{ width: '48px', height: '48px', margin: '0 auto 20px auto', animation: 'spin 2s linear infinite' }}>
                  <KeyRound size={24} color="white" />
                </div>
                <h3>Authorizing Account...</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '5px' }}>
                  Simulating OAuth callback token exchange.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
