import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, User, Users, Upload, Download, Palette, Shield, Settings, HelpCircle, PhoneCall } from 'lucide-react';

export default function Pricing({ onBack }) {
  const [billingPeriod, setBillingPeriod] = useState('annual'); // annual, monthly

  const handleUpgrade = async (planName) => {
    if (planName === 'Free') {
      onBack();
      return;
    }
    if (planName === 'Enterprise') {
      alert('Contacting enterprise sales team at sales@pulsepoll.com...');
      return;
    }

    const user = JSON.parse(localStorage.getItem('pulse-poll-user') || '{}');
    if (!user || !user.email) {
      alert('Please log in first to upgrade your account.');
      return;
    }

    try {
      // In production, you will replace these strings with your actual Stripe Price IDs (from Stripe Dashboard)
      let priceId = '';
      if (planName === 'Basic') {
        priceId = billingPeriod === 'annual' ? 'price_basic_annual' : 'price_basic_monthly';
      } else if (planName === 'Pro') {
        priceId = billingPeriod === 'annual' ? 'price_pro_annual' : 'price_pro_monthly';
      }

      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, priceId })
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
      priceAnnual: 0,
      description: 'Explore the basics of interactive presenting.',
      features: [
        { icon: <Sparkles size={16} />, text: 'Menti AI slide builder suggestions' },
        { icon: <Users size={16} />, text: '50 participants per month limit' },
        { icon: <Palette size={16} />, text: 'Multiple interactive question types' },
        { icon: <Check size={16} />, text: 'Basic response analytics and insights' }
      ],
      buttonText: 'Get Started',
      buttonClass: 'btn-secondary',
      badge: 'Free Tier',
      highlighted: false
    },
    {
      name: 'Basic',
      priceMonthly: 12,
      priceAnnual: 9,
      description: 'For individuals presenting regularly.',
      features: [
        { icon: <Users size={16} />, text: 'Unlimited participants per session' },
        { icon: <Upload size={16} />, text: 'Import PDF, Keynote, and PowerPoint slides' },
        { icon: <Download size={16} />, text: 'Export responses to Excel or PDF reports' },
        { icon: <Check size={16} />, text: 'Everything in Free, plus features' }
      ],
      buttonText: 'Buy Basic',
      buttonClass: 'btn-secondary',
      badge: 'Popular',
      highlighted: false
    },
    {
      name: 'Pro',
      priceMonthly: 29,
      priceAnnual: 24,
      description: 'For professionals sharing templates and branding.',
      features: [
        { icon: <Palette size={16} />, text: 'More design and custom branding features' },
        { icon: <Users size={16} />, text: 'Workspace collaboration & shared templates' },
        { icon: <Settings size={16} />, text: 'Co-create slides with team members' },
        { icon: <Check size={16} />, text: 'Mobile presenter control & live moderation' }
      ],
      buttonText: 'Buy Pro',
      buttonClass: 'btn-primary',
      badge: 'Best Value',
      highlighted: true
    },
    {
      name: 'Enterprise',
      priceMonthly: 'Custom',
      priceAnnual: 'Custom',
      description: 'For organizations needing security and scale.',
      features: [
        { icon: <Shield size={16} />, text: 'Single Sign-On (SSO) login integration' },
        { icon: <Users size={16} />, text: 'Verify participant identities beforehand' },
        { icon: <Settings size={16} />, text: 'SCIM automated user provisioning' },
        { icon: <PhoneCall size={16} />, text: 'Dedicated customer onboarding & support' }
      ],
      buttonText: 'Contact Sales',
      buttonClass: 'btn-secondary',
      badge: 'Corporate',
      highlighted: false
    }
  ];

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

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <div className="eyebrow" style={{ color: 'var(--primary)' }}>Find your plan</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '10px 0 15px' }}>
          Interactive presenting <span>for everyone</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 30px', fontSize: '1.05rem' }}>
          Scale up participant counts, brand customizations, team collaborations, and security tools as you grow.
        </p>

        {/* Annual / Monthly Billing Switcher */}
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
              background: billingPeriod === 'annual' ? 'var(--primary)' : 'transparent',
              color: billingPeriod === 'annual' ? '#0b0e13' : 'var(--text-primary)',
              border: 'none',
              fontWeight: 600
            }}
            onClick={() => setBillingPeriod('annual')}
          >
            Yearly (Save 20%)
          </button>
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
        </div>
      </div>

      {/* Grid of 4 columns */}
      <div className="pricing-grid">
        {plans.map((plan) => {
          const isCustom = typeof plan.priceMonthly === 'string';
          const price = billingPeriod === 'annual' ? plan.priceAnnual : plan.priceMonthly;
          
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
                  {isCustom ? (
                    <span style={{ fontSize: '2.2rem', fontWeight: 800 }}>Custom</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>$</span>
                      <span style={{ fontSize: '2.8rem', fontWeight: 800 }}>{price}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ month</span>
                    </>
                  )}
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
    </div>
  );
}
