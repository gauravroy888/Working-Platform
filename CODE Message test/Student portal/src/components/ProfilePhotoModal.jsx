import React, { useState, useRef } from 'react';
import { X, User, Image as ImageIcon, Upload } from 'lucide-react';
import { useTheme } from '../ThemeContext';

export default function ProfilePhotoModal({ isOpen, onClose }) {
  const { profileName, profileImage, setProfileImage } = useTheme();
  
  const [activeTab, setActiveTab] = useState('avatar'); // 'avatar' | 'upload'
  
  // Avatar Customization States
  const [hair, setHair] = useState('shortFlat');
  const [hairColor, setHairColor] = useState('2c1b18');
  const [skinColor, setSkinColor] = useState('ffdbb4');
  const [expression, setExpression] = useState('happy');
  const [avatarBgColor, setAvatarBgColor] = useState('b6e3f4');

  if (!isOpen) return null;

  const expressionParams = expression === 'happy' ? '&mouth=smile,default&eyes=happy,default' : 
                           expression === 'surprised' ? '&mouth=twinkle&eyes=surprised' : '&mouth=default&eyes=default';
                           
  const previewAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileName || 'Student')}&top=${hair}&hairColor=${hairColor}&skinColor=${skinColor}${expressionParams}&backgroundColor=${avatarBgColor}`;

  const handleSave = () => {
    setProfileImage(previewAvatarUrl);
    localStorage.setItem('student_avatar', previewAvatarUrl);
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        localStorage.setItem('student_avatar', reader.result);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#0D1424',
        border: '1px solid rgba(0, 240, 255, 0.3)',
        borderRadius: '24px',
        width: '500px',
        maxWidth: '90vw',
        padding: '32px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <h3 style={{ margin: '0 0 20px 0', color: 'white', fontSize: '1.4rem', fontWeight: '800' }}>
          Customize Profile Photo
        </h3>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button 
            onClick={() => setActiveTab('avatar')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: activeTab === 'avatar' ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'avatar' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeTab === 'avatar' ? '#00F0FF' : '#94a3b8',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Avatar Creator
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '10px',
              border: activeTab === 'upload' ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'upload' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeTab === 'upload' ? '#00F0FF' : '#94a3b8',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Upload Photo
          </button>
        </div>

        {activeTab === 'avatar' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid #00F0FF',
              boxShadow: '0 0 25px rgba(0, 240, 255, 0.3)'
            }}>
              <img src={previewAvatarUrl} alt="Avatar Preview" style={{ width: '100%', height: '100%' }} />
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Hairstyle</label>
                <select value={hair} onChange={(e) => setHair(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <option value="shortFlat">Short Flat</option>
                  <option value="longNotTooLong">Long Hair</option>
                  <option value="curly">Curly</option>
                  <option value="dreads">Dreads</option>
                  <option value="bob">Bob Cut</option>
                </select>
              </div>

              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Expression</label>
                <select value={expression} onChange={(e) => setExpression(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <option value="happy">Happy</option>
                  <option value="surprised">Surprised</option>
                  <option value="default">Neutral</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSave}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
                color: '#000',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                marginTop: '12px',
                boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
              }}
            >
              Save Avatar
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
            <Upload size={48} color="#00F0FF" />
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: 0 }}>Select a photo from your computer to set as your profile avatar.</p>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ color: 'white' }} />
          </div>
        )}
      </div>
    </div>
  );
}
