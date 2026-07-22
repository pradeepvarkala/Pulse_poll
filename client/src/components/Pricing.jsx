import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, User, Users, Upload, Download, Palette, Shield, Settings, HelpCircle, PhoneCall, Plus } from 'lucide-react';

export default function Pricing({ onBack }) {
  const [billingPeriod, setBillingPeriod] = useState('monthly'); // monthly, three_month, six_month
  const [extraParticipants, setExtraParticipants] = useState(0); // in multiples of 50

  const [timeRemaining, setTimeRemaining] = useState(() => {
    const saved = localStorage.getItem('pulse-poll-promo-timer');
    return saved ? parseInt(saved, 10) : 599; // 10 minutes
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev <= 0 ? 599 : prev - 1;
        localStorage.setItem('pulse-poll-promo-timer', next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}m ${s}s`;
  };

  const handleUpgrade = async (planName) => {
    if (planName === 'Free') {
      onBack();
      return;
    }

    const user = JSON.parse(localStorage.getItem('pulse-poll-user') || '{}');
    if (!user || !user.email) {
      alert('Please log in first to upgrade your account.');
      return;
    }

    try {
      let priceId = '';
      if (planName === 'Basic') {
        if (billingPeriod === 'monthly') priceId = 'price_basic_monthly';
        else if (billingPeriod === 'three_month') priceId = 'price_basic_three_month';
        else priceId = 'price_basic_six_month';
      } else if (planName === 'Pro') {
        if (billingPeriod === 'monthly') priceId = 'price_pro_monthly';
        else if (billingPeriod === 'three_month') priceId = 'price_pro_three_month';
        else priceId = 'price_pro_six_month';
      } else if (planName === 'Business') {
        if (billingPeriod === 'monthly') priceId = 'price_business_monthly';
        else if (billingPeriod === 'three_month') priceId = 'price_business_three_month';
        else priceId = 'price_business_six_month';
      }

      // Add extra participant add-on calculation info
      const addonCost = (extraParticipants / 50) * 5;

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: user.email, 
          priceId,
          addonParticipants: extraParticipants,
          addonCost: addonCost
        })
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initialize Stripe Billing. Make sure STRIPE_SECRET_KEY is configured.');
      }
    } catch (err) {
      console.error('Stripe Redirect Error:', err);
      alert('Could not open billing portal. Please try again.');
    }
  };

  const plans = [
    {
      name: 'Free',
      priceMonthly: 0,
      priceThreeMonth: 0,
      priceSixMonth: 0,
      description: 'Explore the basics of interactive presenting.',
      features: [
        { icon: <Users size={16} />, text: 'Up to 60 participants per session' },
        { icon: <Sparkles size={16} />, text: 'Standard interactive slides & Q&A' },
        { icon: <Palette size={16} />, text: 'Default corporate visual theme' },
        { icon: <Check size={16} />, text: 'Add-on: $5/month per extra 50 slots' }
      ],
      buttonText: 'Current Plan',
      buttonClass: 'btn-secondary',
      badge: 'Free Tier',
      highlighted: false
    },
    {
      name: 'Basic',
      priceMonthly: 5,
      priceThreeMonth: 4.5,
      priceSixMonth: 4,
      description: 'For individuals presenting regularly.',
      features: [
        { icon: <Users size={16} />, text: 'Up to 150 participants per session' },
        { icon: <Palette size={16} />, text: 'Access custom themes (Ocean, Sunset, Slate)' },
        { icon: <Upload size={16} />, text: 'Import PDF & Excel questions list' },
        { icon: <Check size={16} />, text: 'Everything in Free, plus premium themes' }
      ],
      buttonText: 'Get Basic',
      buttonClass: 'btn-secondary',
      badge: 'Starter',
      highlighted: false
    },
    {
      name: 'Pro',
      priceMonthly: 15,
      priceThreeMonth: 13,
      priceSixMonth: 11,
      description: 'For professional quiz and exam moderation.',
      features: [
        { icon: <Users size={16} />, text: 'Up to 500 participants per session' },
        { icon: <Shield size={16} />, text: '🔒 Focus Mode (Anti-Cheat tab lockout)' },
        { icon: <Palette size={16} />, text: 'Add custom brand logos & colors' },
        { icon: <Check size={16} />, text: 'Detailed CSV & Excel analytics reports' }
      ],
      buttonText: 'Upgrade to Pro',
      buttonClass: 'btn-primary',
      badge: 'Highly Popular',
      highlighted: true
    },
    {
      name: 'Business',
      priceMonthly: 35,
      priceThreeMonth: 30,
      priceSixMonth: 25,
      description: 'For large teams and enterprise scale.',
      features: [
        { icon: <Users size={16} />, text: 'Unlimited participants per session' },
        { icon: <Settings size={16} />, text: 'Shared team workspaces & templates' },
        { icon: <Shield size={16} />, text: 'SSO login integration & verified IDs' },
        { icon: <PhoneCall size={16} />, text: '24/7 dedicated telephone support' }
      ],
      buttonText: 'Get Business',
      buttonClass: 'btn-secondary',
      badge: 'Corporate Scale',
      highlighted: false
    }
  ];

  const getPrice = (plan) => {
    if (billingPeriod === 'monthly') return plan.priceMonthly;
    if (billingPeriod === 'three_month') return plan.priceThreeMonth;
    return plan.priceSixMonth;
  };

  return (
    <div className="pricing-viewport animate-fade" style={{ padding: '40px 20px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <button className="btn btn-secondary" onClick={onBack} style={{ gap: '6px' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ fontSize: '0.85rem', fontFamily: 'var(--mono)', color: 'var(--text-secondary)' }}>
          UPGRADE PLATFORM // PLANS
        </div>
      </div>

      {/* FLASH SALE COUNTDOWN BANNER */}
      <div className="glass-card animate-fade" style={{
        background: 'linear-gradient(90deg, rgba(6,182,212,0.15), rgba(37,99,235,0.15))',
        border: '1px solid var(--primary)',
        padding: '16px 20px',
        borderRadius: '16px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        boxShadow: '0 8px 32px 0 rgba(6, 182, 212, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <div>
            <span style={{ fontWeight: 800, color: 'var(--primary)', marginRight: '6px' }}>LIMITED TIME OFFER:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Get 50% off any premium subscription tier! Use coupon code <code style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '6px', color: 'var(--accent-green)', fontWeight: 800 }}>REFER50</code>.</span>
          </div>
        </div>
        <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          border: '1px solid #ef4444', 
          color: '#f87171', 
          padding: '8px 16px', 
          borderRadius: '10px', 
          fontWeight: 900, 
          fontFamily: 'monospace', 
          fontSize: '1rem',
          boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)'
        }}>
          ⏱️ EXPIRES IN: {formatTime(timeRemaining)}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '45px' }}>
        <div className="eyebrow" style={{ color: 'var(--primary)' }}>Find your plan</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '10px 0 15px' }}>
          Interactive presenting <span>for everyone</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 30px', fontSize: '1.05rem' }}>
          Scale up participant counts, brand customizations, team collaborations, and security tools as you grow.
        </p>

        {/* Subscription Billing Switcher */}
        <div style={{ 
          display: 'inline-flex', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid var(--border-glass)', 
          padding: '4px', 
          borderRadius: '30px',
          alignItems: 'center',
          gap: '4px'
        }}>
          <button 
            type="button"
            className="btn" 
            style={{ 
              borderRadius: '20px', 
              padding: '6px 16px', 
              fontSize: '0.8rem',
              background: billingPeriod === 'monthly' ? 'var(--primary)' : 'transparent',
              color: billingPeriod === 'monthly' ? '#0b0e13' : 'var(--text-primary)',
              border: 'none',
              fontWeight: 600
            }}
            onClick={() => setBillingPeriod('monthly')}
          >
            Monthly
          </button>
          <button 
            type="button"
            className="btn" 
            style={{ 
              borderRadius: '20px', 
              padding: '6px 16px', 
              fontSize: '0.8rem',
              background: billingPeriod === 'three_month' ? 'var(--primary)' : 'transparent',
              color: billingPeriod === 'three_month' ? '#0b0e13' : 'var(--text-primary)',
              border: 'none',
              fontWeight: 600
            }}
            onClick={() => setBillingPeriod('three_month')}
          >
            3-Month (Save 15%)
          </button>
          <button 
            type="button"
            className="btn" 
            style={{ 
              borderRadius: '20px', 
              padding: '6px 16px', 
              fontSize: '0.8rem',
              background: billingPeriod === 'six_month' ? 'var(--primary)' : 'transparent',
              color: billingPeriod === 'six_month' ? '#0b0e13' : 'var(--text-primary)',
              border: 'none',
              fontWeight: 600
            }}
            onClick={() => setBillingPeriod('six_month')}
          >
            6-Month (Save 30%)
          </button>
        </div>
      </div>

      {/* Real-time Participant Add-On Calculator widget */}
      <div className="glass-card animate-fade" style={{ maxWidth: '600px', margin: '0 auto 40px auto', padding: '24px', border: '1px dashed var(--primary)' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ➕ Participant Add-on Calculator
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
          Need to host more participants? Drag the slider below to calculate your custom add-on plan (**+$5 for every 50 additional participants**).
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <input 
            type="range" 
            min="0" 
            max="500" 
            step="50" 
            value={extraParticipants} 
            onChange={(e) => setExtraParticipants(parseInt(e.target.value))} 
            style={{ flex: 1, accentColor: 'var(--primary)', height: '6px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, minWidth: '95px', textAlign: 'right' }}>
            +{extraParticipants} Slots
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, borderTop: '1px solid var(--border-glass)', paddingTop: '12px', marginTop: '12px' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Custom Add-On Cost:</span>
          <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>+${(extraParticipants / 50) * 5}/month</span>
        </div>
      </div>

      {/* Grid of 4 columns */}
      <div className="pricing-grid">
        {plans.map((plan) => {
          const price = getPrice(plan);
          
          return (
            <div 
              key={plan.name} 
              className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
            >
              {plan.highlighted && (
                <div className="pricing-card-badge">{plan.badge}</div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: plan.highlighted ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 700 }}>
                  {plan.name}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '15px 0 10px' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>$</span>
                  <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>{price}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ month</span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minHeight: '38px', margin: 0 }}>
                  {plan.description}
                </p>
              </div>

              {/* Action Button */}
              <button 
                className={`btn ${plan.buttonClass}`} 
                style={{ width: '100%', padding: '12px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '12px', marginBottom: '25px' }}
                onClick={() => handleUpgrade(plan.name)}
              >
                {plan.buttonText}
              </button>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border-glass)', marginBottom: '25px' }}></div>

              {/* Features List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {plan.name === 'Free' ? 'Includes:' : `Everything in ${plans[plans.indexOf(plan)-1].name}, plus:`}
                </span>
                
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: plan.highlighted ? 'var(--primary)' : 'var(--text-secondary)', marginTop: '2px', flexShrink: 0 }}>
                      {feat.icon}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {feat.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Comparison Matrix Table */}
      <div className="glass-card animate-fade" style={{ marginTop: '60px', padding: '32px', border: '1px solid var(--border-glass)', borderRadius: '24px', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>Compare Tiers & Features</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', textAlign: 'center', marginBottom: '30px' }}>
          Detailed matrix comparison of capacities, integrations, custom options, and support.
        </p>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
              <th style={{ padding: '16px 12px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Core Features</th>
              <th style={{ padding: '16px 12px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>Free</th>
              <th style={{ padding: '16px 12px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>Basic</th>
              <th style={{ padding: '16px 12px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)', textAlign: 'center' }}>⭐ Pro</th>
              <th style={{ padding: '16px 12px', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center' }}>Business</th>
            </tr>
          </thead>
          <tbody>
            {[
              { category: 'Capacity & Limits', items: [
                { name: 'Live Participants / Session', free: '60', basic: '150', pro: '500', business: 'Unlimited' },
                { name: 'Extra Attendee Add-ons', free: '✔️ ($5/50 slots)', basic: '✔️ ($5/50 slots)', pro: '✔️ ($5/50 slots)', business: 'Included' },
                { name: 'Presentation Slide Decks', free: 'Unlimited', basic: 'Unlimited', pro: 'Unlimited', business: 'Unlimited' }
              ]},
              { category: 'Presentation Controls', items: [
                { name: 'Standard Interactive Slides', free: '✔️', basic: '✔️', pro: '✔️', business: '✔️' },
                { name: 'Premium Themes (Ocean, Sunset, Slate)', free: '❌ (Corporate only)', basic: '✔️', pro: '✔️', business: '✔️' },
                { name: '🔒 Focus Mode (Anti-Cheat Tab Lock)', free: '❌', basic: '❌', pro: '✔️', business: '✔️' },
                { name: 'Custom Brand Colors & Logo', free: '❌', basic: '❌', pro: '✔️', business: '✔️' }
              ]},
              { category: 'Data & Integration', items: [
                { name: 'Excel Questions Bulk Import', free: '❌', basic: '✔️', pro: '✔️', business: '✔️' },
                { name: 'PDF Performance Reports', free: '✔️', basic: '✔️', pro: '✔️', business: '✔️' },
                { name: 'CSV & Excel Data Export', free: '❌', basic: '❌', pro: '✔️', business: '✔️' },
                { name: 'SSO Login & SCIM Provisioning', free: '❌', basic: '❌', pro: '❌', business: '✔️' }
              ]},
              { category: 'Collaboration & Support', items: [
                { name: 'Shared Team Workspaces', free: '❌', basic: '❌', pro: '❌', business: '✔️' },
                { name: 'Co-create Presentation Templates', free: '❌', basic: '❌', pro: '❌', business: '✔️' },
                { name: 'Support Channels', free: 'Community', basic: 'Email support', pro: 'Priority Email', business: '24/7 Phone & Slack' }
              ]}
            ].map((cat, cIdx) => (
              <React.Fragment key={cIdx}>
                {/* Category Header Row */}
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <td colSpan="5" style={{ padding: '12px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
                    {cat.category}
                  </td>
                </tr>
                {cat.items.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-glass)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{row.name}</td>
                    <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{row.free}</td>
                    <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{row.basic}</td>
                    <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'center', background: 'rgba(37, 99, 235, 0.02)' }}>{row.pro}</td>
                    <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{row.business}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
