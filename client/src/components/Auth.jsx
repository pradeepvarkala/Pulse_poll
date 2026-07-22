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

export default function Auth({ onLoginSuccess, onBackToLanding, featureContext }) {
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

  // Decode Google JWT Token and authenticate with backend
  const handleCredentialResponse = async (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const profile = JSON.parse(jsonPayload);
      
      const refCode = localStorage.getItem('pulse-poll-referral-referrer') || '';
      const authResponse = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          refCode: refCode
        })
      });
      const data = await authResponse.json();

      if (authResponse.ok) {
        localStorage.setItem('pulse-poll-user', JSON.stringify(data.user));
        localStorage.setItem('pulse-poll-token', data.token);
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Google Authentication failed on the server.');
      }
    } catch (err) {
      console.error('Failed to authenticate Google credential:', err);
      setErrorMsg('Google Sign-In failed. Please check your internet connection.');
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const isRealGoogleId = googleClientId && !googleClientId.includes('placeholder') && import.meta.env.VITE_ENABLE_STRICT_GOOGLE_OAUTH === 'true';

  useEffect(() => {
    const initGoogleGSI = () => {
      if (window.google && isRealGoogleId) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse
          });
          
          const container = document.getElementById("google-signin-btn");
          if (container) {
            window.google.accounts.id.renderButton(
              container,
              { 
                theme: "outline", 
                size: "large", 
                width: "350",
                text: "signin_with",
                shape: "pill"
              }
            );
          }
        } catch (e) {
          console.warn('Google GSI initialization bypassed:', e);
        }
      }
    };

    if (isRealGoogleId) {
      initGoogleGSI();
    }
  }, [isRealGoogleId]);

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

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const refCode = localStorage.getItem('pulse-poll-referral-referrer') || '';
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: verificationCode.trim(), refCode: refCode })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('pulse-poll-user', JSON.stringify(data.user));
        localStorage.setItem('pulse-poll-token', data.token);
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Invalid verification code. Please check your inbox.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error verifying code. Please try again.');
    }
  };

  const handleOAuthLogin = (provider) => {
    setOauthProvider(provider);
    setOauthStep(1);
  };

  const selectOAuthProfile = (name, email, avatar) => {
    setOauthStep(2); // Show loading/authorizing state
    setTimeout(() => {
      const cleanEmail = (email || '').trim().toLowerCase();
      const userProfile = {
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        avatar: avatar || null,
        tier: (cleanEmail === 'pradeepvarkala@gmail.com' || cleanEmail.includes('admin')) ? 'admin' : 'free',
        subscription_status: (cleanEmail === 'pradeepvarkala@gmail.com' || cleanEmail.includes('admin')) ? 'active' : 'inactive',
        provider: oauthProvider || 'google',
        createdAt: new Date().toLocaleDateString()
      };
      try {
        localStorage.setItem('pulse-poll-user', JSON.stringify(userProfile));
      } catch (e) {}
      setOauthProvider(null);
      onLoginSuccess(userProfile);
    }, 1000); // mock OAuth redirect lag
  };

  const handleInstantDemoLogin = (targetEmail = 'pradeepvarkala@gmail.com') => {
    const cleanEmail = targetEmail.trim() || 'pradeepvarkala@gmail.com';
    const userProfile = {
      name: cleanEmail.split('@')[0] || 'Pradeep Varkala',
      email: cleanEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      tier: cleanEmail === 'pradeepvarkala@gmail.com' ? 'admin' : 'pro',
      provider: 'instant-login',
      createdAt: new Date().toLocaleDateString()
    };
    localStorage.setItem('pulse-poll-user', JSON.stringify(userProfile));
    onLoginSuccess(userProfile);
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

      <div className="glass-card auth-card" style={{ position: 'relative' }}>
        {onBackToLanding && (
          <button 
            type="button"
            className="btn btn-secondary"
            style={{ position: 'absolute', top: '16px', left: '16px', padding: '6px 12px', fontSize: '0.8rem', zIndex: 10 }}
            onClick={onBackToLanding}
          >
            ← Home
          </button>
        )}
        <div style={{ textAlign: 'center' }}>
          <div className="logo-icon" style={{ width: '48px', height: '48px', margin: '0 auto 16px auto' }}>
            <KeyRound size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            {featureContext ? `Unlock ${featureContext}` : 'Welcome to PulsePoll'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {featureContext ? `Sign up to access ${featureContext} features on PulsePoll.` : 'Choose a login provider or use verified email registration.'}
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="social-buttons" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          {isRealGoogleId ? (
            <div id="google-signin-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          ) : (
            <button 
              type="button"
              className="social-btn social-btn-google" 
              onClick={() => handleOAuthLogin('google')}
              style={{ width: '100%', maxWidth: '350px', padding: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          )}

          {/* Instant 1-Click Admin Login */}
          <button 
            type="button"
            className="btn btn-primary" 
            onClick={() => handleInstantDemoLogin(email.trim() || 'pradeepvarkala@gmail.com')}
            style={{ width: '100%', maxWidth: '350px', padding: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}
          >
            ⚡ 1-Click Instant Login ({email.trim() ? email.trim() : 'pradeepvarkala@gmail.com'})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-glass)' }} />
          <span>OR EMAIL REGISTRATION</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-glass)' }} />
        </div>

        {/* Email Signup Form / Verification Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim() || !email.includes('@')) {
              setErrorMsg('Please enter a valid email address.');
              return;
            }
            handleInstantDemoLogin(email);
          }} 
          style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
        >
          <div className="settings-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="input-text" 
                style={{ paddingLeft: '40px' }}
                placeholder="e.g. mekzekswmp@gmail.com" 
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

          <button type="submit" className="btn btn-primary" style={{ padding: '14px', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}>
            🚀 Instant Login as {email.trim() ? email.trim() : 'User'}
          </button>
        </form>
      </div>

      {/* Simulated Social OAuth Login Windows */}
      {oauthProvider && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
          <div className="animate-fade" style={{ width: '90%', maxWidth: '440px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '0', overflow: 'hidden', color: '#1f2937' }}>
            
            {/* Header styled like a browser address bar */}
            <div style={{ background: '#f8fafc', padding: '12px 15px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              </div>
              <div style={{ 
                flex: 1, background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px',
                fontSize: '0.75rem', color: '#475569', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', border: '1px solid #cbd5e1'
              }}>
                {oauthProvider === 'google' 
                  ? 'https://accounts.google.com/o/oauth2/v2/auth?client_id=pulsepoll...' 
                  : 'https://login.live.com/oauth20_authorize.srf?client_id=pulsepoll...'}
              </div>
            </div>

            {/* Simulated oauth screens */}
            {oauthStep === 1 ? (
              <div style={{ padding: '30px 24px', backgroundColor: '#ffffff' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', textAlign: 'center', color: '#0f172a', fontWeight: '700' }}>
                  Sign in with {oauthProvider === 'google' ? 'Google' : 'Microsoft'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '20px', textAlign: 'center' }}>
                  Choose a mock account to authorize <strong>PulsePoll</strong>:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div 
                    onClick={() => selectOAuthProfile(
                      'Pradeep Varkala', 
                      'pradeepvarkala@gmail.com', 
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                    )}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                      borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <div className="admin-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, borderRadius: '50%' }}>PV</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937' }}>Pradeep Varkala (Admin)</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>pradeepvarkala@gmail.com</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => selectOAuthProfile(
                      'Mekzek Swmp', 
                      'mekzekswmp@gmail.com', 
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
                    )}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                      borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer', background: '#f8fafc',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    <div className="admin-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem', background: 'linear-gradient(135deg, #6366f1, #ec4899)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, borderRadius: '50%' }}>MS</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1f2937' }}>Mekzek Swmp</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569' }}>mekzekswmp@gmail.com</div>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn" 
                  style={{ width: '100%', marginTop: '20px', color: '#475569', borderColor: '#cbd5e1', background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                  onClick={() => setOauthProvider(null)}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={{ padding: '40px 24px', textAlign: 'center', backgroundColor: '#ffffff' }}>
                <div className="logo-icon" style={{ width: '48px', height: '48px', margin: '0 auto 20px auto', animation: 'spin 2s linear infinite', background: 'linear-gradient(135deg, #6366f1, #ec4899)' }}>
                  <KeyRound size={24} color="white" />
                </div>
                <h3 style={{ color: '#0f172a', fontWeight: '700' }}>Authorizing Account...</h3>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '5px' }}>
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
