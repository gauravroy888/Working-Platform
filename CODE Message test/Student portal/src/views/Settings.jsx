import React, { useState } from 'react';
import { User, Bell, Lock, Palette } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import ProfilePhotoModal from '../components/ProfilePhotoModal';

export default function Settings() {
  const { profileName, setProfileName, profileImage } = useTheme();
  const [name, setName] = useState(profileName || 'Alex');
  const [email, setEmail] = useState('alex@student.edtech.org');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const handleSaveName = (e) => {
    e.preventDefault();
    setProfileName(name);
    alert('Settings updated successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'white' }}>Settings</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Manage your profile preferences and account settings.</p>
      </div>

      {/* Profile Photo Card */}
      <div style={{
        background: 'rgba(13, 20, 36, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '20px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <User size={20} color="#00F0FF" />
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: '700' }}>Profile Photo</h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #00F0FF',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
          }}>
            <img src={profileImage || '/assets/avatar.png'} alt="Your Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div>
            <h4 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '1.1rem', fontWeight: '700' }}>Your Avatar</h4>
            <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '0.9rem' }}>Customize your generated avatar or upload a custom photo.</p>
            <button 
              onClick={() => setIsPhotoModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
                color: '#000',
                fontWeight: '700',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
              }}
            >
              Edit Profile Photo
            </button>
          </div>
        </div>
      </div>

      {/* Account Info Form Card */}
      <div style={{
        background: 'rgba(13, 20, 36, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '20px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <Lock size={20} color="#a855f7" />
          <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem', fontWeight: '700' }}>Account Information</h3>
        </div>

        <form onSubmit={handleSaveName} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px', fontWeight: '600' }}>Display Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '6px', fontWeight: '600' }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.95rem'
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: '700',
              padding: '10px 24px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            Save Changes
          </button>
        </form>
      </div>

      <ProfilePhotoModal 
        isOpen={isPhotoModalOpen} 
        onClose={() => setIsPhotoModalOpen(false)} 
      />
    </div>
  );
}
