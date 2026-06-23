import React, { useState } from 'react';
import Card from '../components/Card';
import { Save, Image as ImageIcon, User, Upload } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import defaultAvatar from '../assets/avatar.png';
import defaultBg from '../assets/milky-way-starry-sky2k.jpg';

export default function Settings() {
  const { 
    profileName, setProfileName, 
    profileDesignation, setProfileDesignation,
    profileImage, setProfileImage,
    backgroundImage, setBackgroundImage 
  } = useTheme();

  // Local state for the form so we don't update context on every keystroke
  const [localName, setLocalName] = useState(profileName);
  const [localDesignation, setLocalDesignation] = useState(profileDesignation);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileName(localName);
    setProfileDesignation(localDesignation);
    // Could add a toast notification here
  };

  const handleImageUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const inputStyle = {
    width: '100%', 
    padding: '10px', 
    borderRadius: '8px', 
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid var(--panel-border)', 
    color: 'white'
  };

  const uploadBtnStyle = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 20px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--text-secondary)',
    color: 'var(--text-primary)', cursor: 'pointer', width: 'fit-content',
    transition: 'all 0.3s'
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px' }}>
      <div className="view-header">
        <h1>Settings</h1>
        <p>Manage your account, profile, and portal preferences.</p>
      </div>

      <div style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
        
        {/* Profile Info Card */}
        <Card title="Profile Information">
          <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>Display Name</label>
                <input 
                  type="text" 
                  value={localName} 
                  onChange={(e) => setLocalName(e.target.value)} 
                  style={inputStyle} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>Designation / Role</label>
                <input 
                  type="text" 
                  value={localDesignation} 
                  onChange={(e) => setLocalDesignation(e.target.value)} 
                  style={inputStyle} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email (Read Only)</label>
              <input type="email" value="anderson@edtech.edu" readOnly style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start', marginTop: '10px' }}>
              <Save size={16} /> Save Changes
            </button>
          </form>
        </Card>

        {/* Personalization Card */}
        <Card title="Appearance & Personalization">
          <div style={{ display: 'grid', gap: '25px' }}>
            
            {/* Avatar Upload */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="var(--accent-cyan)" /> Profile Avatar
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img src={profileImage} alt="Avatar Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                <div>
                  <label style={uploadBtnStyle}>
                    <Upload size={16} /> Upload New Avatar
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setProfileImage)} />
                  </label>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Recommended size: 256x256px (Max 5MB)</p>
                  <button onClick={() => setProfileImage(defaultAvatar)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '12px', marginTop: '5px', cursor: 'pointer', padding: 0 }}>Reset to default</button>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--panel-border)' }}></div>

            {/* Wallpaper Upload */}
            <div>
              <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={18} color="var(--accent-purple)" /> Background Wallpaper
              </h4>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                <div style={{ width: '150px', height: '80px', borderRadius: '8px', backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(255,255,255,0.1)' }}></div>
                <div>
                  <label style={uploadBtnStyle}>
                    <Upload size={16} /> Upload New Wallpaper
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, setBackgroundImage)} />
                  </label>
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Recommended resolution: 1920x1080 (Max 5MB)</p>
                  <button onClick={() => setBackgroundImage(defaultBg)} style={{ background: 'none', border: 'none', color: 'var(--accent-purple)', fontSize: '12px', marginTop: '5px', cursor: 'pointer', padding: 0 }}>Reset to default</button>
                </div>
              </div>
            </div>

          </div>
        </Card>

        {/* Existing Notifications Card */}
        <Card title="Notification Preferences">
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>Email Notifications</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Receive daily summaries of student activities.</p>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }} />
            </div>
            <div style={{ borderTop: '1px solid var(--panel-border)', margin: '10px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>In-app Alerts</h4>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Real-time alerts for messages and submissions.</p>
              </div>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }} />
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
