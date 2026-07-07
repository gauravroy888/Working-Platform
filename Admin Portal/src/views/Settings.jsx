import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { supabase } from '../supabase';
import { User } from 'lucide-react';
import ProfilePhotoModal from '../components/ProfilePhotoModal';

export default function Settings() {
  const { profileImage, setProfileImage, profileName } = useTheme();
  
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-gradient">Admin Settings</h1>
      <p style={{ marginBottom: '30px' }}>Configure global platform settings and your profile.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Institution Profile */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px' }}>Institution Profile</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Institution Name</label>
              <input type="text" defaultValue="Edtech Island High School" style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Academic Year</label>
              <select style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '8px' }}>
                <option>2026 - 2027</option>
                <option>2025 - 2026</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>

        {/* Profile Photo Settings */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--panel-border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--accent-cyan)" /> Profile Photo
          </h3>
          
          <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
            <img src={profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&mouth=smile,default&eyes=happy,default'} alt="Current Profile" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)', background: '#fff' }} />
            
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '16px' }}>Your Avatar</h4>
              <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Customize your generated avatar or upload a custom photo.</p>
              <button onClick={() => setShowPhotoModal(true)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                Edit Profile Photo
              </button>
            </div>
          </div>
        </div>

      </div>

      <ProfilePhotoModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </div>
  );
}
