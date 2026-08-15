import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Cloud, Bell, Palette, School, Save, Check, Key, Lock, Image as ImageIcon } from 'lucide-react';
import Card from '../components/Card';
import { useTheme } from '../ThemeContext';

export default function Settings() {
  const { backgroundImage, setBackgroundImage, profileName, setProfileName, profileDesignation, setProfileDesignation } = useTheme();

  const [schoolName, setSchoolName] = useState('Delhi Public School (DPS)');
  const [schoolDomain, setSchoolDomain] = useState('dps-delhi.immersionlabs.in');
  const [adminEmail, setAdminEmail] = useState('immersionlabsindia@gmail.com');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const WALLPAPERS = [
    { id: 'future', name: 'Future Version Cyber Glass', path: '/assets/Future%20verion%20lowres.jpg' },
    { id: 'milkyway', name: 'Milky Way Deep Cosmos', path: '/assets/milky-way-starry-sky2k.jpg' },
    { id: 'chapter', name: 'Chapter Horizon', path: '/assets/chapter%20background%20lowres.jpg' }
  ];

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>Institution &amp; System Configuration</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Configure tenant branding, Cloudflare R2 storage quotas, 2FA policies, and themes.</p>
        </div>

        <button
          onClick={handleSaveSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 24px',
            background: savedSuccess ? 'rgba(16, 185, 129, 0.2)' : 'linear-gradient(135deg, #00F0FF, #3B82F6)',
            color: savedSuccess ? '#34d399' : '#000',
            border: savedSuccess ? '1px solid #10B981' : 'none',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: savedSuccess ? 'none' : '0 0 20px rgba(0, 240, 255, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          {savedSuccess ? <Check size={18} /> : <Save size={18} />}
          <span>{savedSuccess ? 'Settings Saved Live!' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Grid Settings Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Section 1: Institution Profile */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <School size={20} color="#00F0FF" />
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Institution Profile &amp; Tenant</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Institution Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Custom School Domain</label>
              <input
                type="text"
                value={schoolDomain}
                onChange={e => setSchoolDomain(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#00F0FF', fontFamily: 'monospace', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Administrator Contact Email</label>
              <input
                type="email"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', fontFamily: 'monospace', outline: 'none', fontSize: '0.9rem' }}
              />
            </div>
          </div>
        </Card>

        {/* Section 2: Cloudflare R2 Storage Allocation */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Cloud size={20} color="#a855f7" />
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Cloudflare R2 Storage &amp; Edge CDN</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>3D GLB &amp; Media Storage Used</span>
                <p style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', margin: '4px 0 0 0', fontFamily: 'monospace' }}>
                  4.82 GB <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'normal' }}>/ 50.00 GB Cap</span>
                </p>
              </div>
              <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: '700' }}>
                9.6% Allocated
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '9.6%', height: '100%', background: 'linear-gradient(90deg, #a855f7, #00F0FF)', borderRadius: '4px' }}></div>
            </div>

            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>R2 Edge Bucket:</span>
                <span style={{ color: '#cbd5e1', fontFamily: 'monospace' }}>edtechplatform</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>CDN Egress Fee:</span>
                <span style={{ color: '#34d399', fontWeight: '700' }}>$0.00 (Zero Egress)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Live Edge Endpoint:</span>
                <span style={{ color: '#00F0FF', fontFamily: 'monospace' }}>pub-670b...r2.dev</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Security & Access Policies */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Shield size={20} color="#10B981" />
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Security &amp; Multi-Factor Auth</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Enforce 2FA for All Faculty</strong>
                <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '0.8rem' }}>Require OTP verification on login</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={e => setTwoFactorAuth(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#00F0FF', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Admin Session Inactivity Timeout (Minutes)</label>
              <select
                value={sessionTimeout}
                onChange={e => setSessionTimeout(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', outline: 'none' }}
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="60">60 Minutes</option>
                <option value="120">2 Hours</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 4: Theme & Backdrop Wallpaper */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Palette size={20} color="#F59E0B" />
            <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>Portal Theme &amp; Backdrop</h4>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Active Cosmic Wallpaper:</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {WALLPAPERS.map(wp => (
                <div
                  key={wp.id}
                  onClick={() => setBackgroundImage(wp.path)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: backgroundImage === wp.path ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.06)',
                    background: backgroundImage === wp.path ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ImageIcon size={18} color={backgroundImage === wp.path ? '#00F0FF' : '#94a3b8'} />
                    <span style={{ color: backgroundImage === wp.path ? '#fff' : '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>
                      {wp.name}
                    </span>
                  </div>

                  {backgroundImage === wp.path && <Check size={16} color="#00F0FF" />}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
