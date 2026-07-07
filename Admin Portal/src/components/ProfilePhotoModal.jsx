import React, { useState, useRef } from 'react';
import { X, User, Image as ImageIcon, Upload } from 'lucide-react';
import AvatarEditor from 'react-avatar-editor';
import { supabase } from '../supabase';
import { useTheme } from '../ThemeContext';

export default function ProfilePhotoModal({ isOpen, onClose }) {
  const { profileName, setProfileImage } = useTheme();
  
  const [activeTab, setActiveTab] = useState('avatar'); // 'avatar' | 'upload'
  
  // Avatar Customization States
  const [hair, setHair] = useState('shortFlat');
  const [hairColor, setHairColor] = useState('2c1b18');
  const [facialHairColor, setFacialHairColor] = useState('2c1b18');
  const [skinColor, setSkinColor] = useState('ffdbb4');
  const [facialHair, setFacialHair] = useState('');
  const [gender, setGender] = useState('female');
  const [expression, setExpression] = useState('happy');
  const [avatarBgColor, setAvatarBgColor] = useState('b6e3f4');

  // Extended Customization
  const [accessories, setAccessories] = useState('');
  const [clothing, setClothing] = useState('blazerAndShirt');
  const [clothingColor, setClothingColor] = useState('black');

  // Upload States
  const [imageToCrop, setImageToCrop] = useState(null);
  const [zoom, setZoom] = useState(1);
  const editorRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  // Generate real-time preview URL
  const expressionParams = expression === 'happy' ? '&mouth=smile,default&eyes=happy,default' : 
                           expression === 'serious' ? '&mouth=serious,default&eyes=default' : 
                           expression === 'surprised' ? '&mouth=twinkle&eyes=surprised' : '&mouth=default&eyes=default';
                           
  const genderParams = gender === 'male' ? `&facialHairProbability=100` : `&facialHairProbability=0`;
  const accessoriesParams = accessories ? `&accessoriesProbability=100&accessories=${accessories}` : `&accessoriesProbability=0`;

  const previewAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileName || 'User')}&top=${hair}&hairColor=${hairColor}&skinColor=${skinColor}&clothing=${clothing}&clothingColor=${clothingColor}${gender === 'male' && facialHair ? `&facialHair=${facialHair}&facialHairColor=${facialHairColor}` : ''}${genderParams}${accessoriesParams}${expressionParams}&backgroundColor=${avatarBgColor}`;

  const handleSaveToGlobal = async (imageUrl) => {
    setIsSaving(true);
    setProfileImage(imageUrl);
    try {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        await supabase.from('profiles').update({ avatar_url: imageUrl }).eq('email', user.email);
        user.avatar_url = imageUrl;
        localStorage.setItem('edtech_user', JSON.stringify(user));
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save profile photo');
    }
    setIsSaving(false);
  };

  const handleSaveAvatar = () => {
    handleSaveToGlobal(previewAvatarUrl);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageToCrop(file);
    }
  };

  const handleSaveCrop = () => {
    if (editorRef.current) {
      const canvasScaled = editorRef.current.getImageScaledToCanvas();
      // Enforce 1000x1000 limit
      const finalCanvas = document.createElement('canvas');
      const MAX_SIZE = 1000;
      let { width, height } = canvasScaled;
      
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }
      
      finalCanvas.width = width;
      finalCanvas.height = height;
      const ctx = finalCanvas.getContext('2d');
      ctx.drawImage(canvasScaled, 0, 0, width, height);
      
      const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.9);
      handleSaveToGlobal(dataUrl);
    }
  };

  const selectStyle = {
    width: '100%', padding: '8px', borderRadius: '8px', 
    background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', 
    color: 'white', outline: 'none', appearance: 'none', cursor: 'pointer'
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div className="animate-scale-in" style={{ background: '#1a1f2b', borderRadius: '16px', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', border: '1px solid var(--panel-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>Edit Profile Photo</h2>
            <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>Customize your avatar or upload a photo.</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '15px 25px', borderBottom: '1px solid var(--panel-border)', display: 'flex', gap: '10px' }}>
          <button onClick={() => setActiveTab('avatar')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'avatar' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)', color: activeTab === 'avatar' ? '#000' : '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <User size={16} /> Avatar Creator
          </button>
          <button onClick={() => setActiveTab('upload')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'upload' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)', color: activeTab === 'upload' ? '#fff' : '#fff', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ImageIcon size={16} /> Upload Photo
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '25px', flex: 1 }}>
          {activeTab === 'avatar' ? (
            <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <img src={previewAvatarUrl} alt="Preview" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.1)', background: '#fff' }} />
                
                {/* Gender Switch */}
                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '4px', border: '1px solid var(--panel-border)', width: '100%' }}>
                  <button 
                    onClick={() => { setGender('male'); setHair('shortFlat'); setFacialHair(''); }}
                    style={{ flex: 1, padding: '6px 12px', borderRadius: '16px', border: 'none', background: gender === 'male' ? 'var(--accent-cyan)' : 'transparent', color: gender === 'male' ? '#000' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    Male
                  </button>
                  <button 
                    onClick={() => { setGender('female'); setHair('longButNotTooLong'); setFacialHair(''); }}
                    style={{ flex: 1, padding: '6px 12px', borderRadius: '16px', border: 'none', background: gender === 'female' ? 'var(--accent-purple)' : 'transparent', color: gender === 'female' ? '#fff' : '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                    Female
                  </button>
                </div>

                <button onClick={handleSaveAvatar} disabled={isSaving} className="btn btn-primary" style={{ width: '100%' }}>
                  {isSaving ? 'Saving...' : 'Apply Avatar'}
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', flex: 1 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Expression</label>
                  <select value={expression} onChange={(e) => setExpression(e.target.value)} style={selectStyle}>
                    <option value="happy">Happy</option>
                    <option value="smile">Soft Smile</option>
                    <option value="serious">Serious</option>
                    <option value="surprised">Surprised</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Hair Style</label>
                  <select value={hair} onChange={(e) => setHair(e.target.value)} style={selectStyle}>
                    {gender === 'male' ? (
                      <>
                        <option value="shortFlat">Short Flat</option>
                        <option value="shortWaved">Short Waved</option>
                        <option value="shortFrizzle">Short Frizzle</option>
                        <option value="shortDreads01">Short Dreads</option>
                        <option value="frizzle">Frizzle</option>
                        <option value="noHair">Bald</option>
                        <option value="turban">Turban</option>
                      </>
                    ) : (
                      <>
                        <option value="longButNotTooLong">Long</option>
                        <option value="curly">Curly</option>
                        <option value="straight02">Straight</option>
                        <option value="miaWallace">Bob Cut</option>
                        <option value="hijab">Hijab</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Hair Color</label>
                  <select value={hairColor} onChange={(e) => setHairColor(e.target.value)} style={selectStyle}>
                    <option value="2c1b18">Black</option>
                    <option value="724133">Brown</option>
                    <option value="b58143">Blonde</option>
                    <option value="c93305">Red</option>
                    <option value="e8e1e1">Silver / Gray</option>
                    <option value="f59797">Pink</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Skin Tone</label>
                  <select value={skinColor} onChange={(e) => setSkinColor(e.target.value)} style={selectStyle}>
                    <option value="ffdbb4">Light</option>
                    <option value="f8d25c">Yellow</option>
                    <option value="edb98a">Tanned</option>
                    <option value="d08b5b">Brown</option>
                    <option value="ae5d29">Dark Brown</option>
                    <option value="614335">Black</option>
                  </select>
                </div>
                
                {gender === 'male' && (
                  <>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Facial Hair</label>
                      <select value={facialHair} onChange={(e) => setFacialHair(e.target.value)} style={selectStyle}>
                        <option value="">None</option>
                        <option value="beardMedium">Medium Beard</option>
                        <option value="beardLight">Light Beard</option>
                        <option value="beardMajestic">Majestic Beard</option>
                        <option value="moustacheMagnum">Mustache</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Facial Hair Color</label>
                      <select value={facialHairColor} onChange={(e) => setFacialHairColor(e.target.value)} style={selectStyle}>
                        <option value="2c1b18">Black</option>
                        <option value="724133">Brown</option>
                        <option value="b58143">Blonde</option>
                        <option value="c93305">Red</option>
                        <option value="e8e1e1">Silver / Gray</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Accessories</label>
                  <select value={accessories} onChange={(e) => setAccessories(e.target.value)} style={selectStyle}>
                    <option value="">None</option>
                    <option value="prescription01">Glasses 1</option>
                    <option value="prescription02">Glasses 2</option>
                    <option value="round">Round Glasses</option>
                    <option value="sunglasses">Sunglasses</option>
                    <option value="wayfarers">Wayfarers</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Clothing</label>
                  <select value={clothing} onChange={(e) => setClothing(e.target.value)} style={selectStyle}>
                    <option value="blazerAndShirt">Blazer & Shirt</option>
                    <option value="blazerAndSweater">Blazer & Sweater</option>
                    <option value="collarAndSweater">Collar & Sweater</option>
                    <option value="graphicShirt">Graphic Shirt</option>
                    <option value="hoodie">Hoodie</option>
                    <option value="overall">Overalls</option>
                    <option value="shirtCrewNeck">Crew Neck Shirt</option>
                    <option value="shirtVNeck">V-Neck Shirt</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Clothing Color</label>
                  <select value={clothingColor} onChange={(e) => setClothingColor(e.target.value)} style={selectStyle}>
                    <option value="black">Black</option>
                    <option value="blue02">Blue</option>
                    <option value="gray02">Gray</option>
                    <option value="pink">Pink</option>
                    <option value="red">Red</option>
                    <option value="white">White</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>Background Color</label>
                  <select value={avatarBgColor} onChange={(e) => setAvatarBgColor(e.target.value)} style={selectStyle}>
                    <option value="b6e3f4">Light Blue</option>
                    <option value="c0aede">Purple</option>
                    <option value="d1d4f9">Lavender</option>
                    <option value="ffdfbf">Peach</option>
                    <option value="ffd5dc">Pink</option>
                    <option value="c1f4c5">Mint Green</option>
                    <option value="f4d150">Yellow</option>
                  </select>
                </div>

              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              {!imageToCrop ? (
                <div style={{ width: '100%', padding: '40px', border: '2px dashed var(--panel-border)', borderRadius: '12px', textAlign: 'center' }}>
                  <Upload size={32} color="var(--text-secondary)" style={{ marginBottom: '10px' }} />
                  <h3 style={{ margin: '0 0 5px 0', color: '#fff' }}>Upload an Image</h3>
                  <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>PNG, JPG up to 5MB.</p>
                  <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={16} /> Choose File
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--panel-border)' }}>
                    <AvatarEditor
                      ref={editorRef}
                      image={imageToCrop}
                      width={250}
                      height={250}
                      border={50}
                      borderRadius={125}
                      color={[0, 0, 0, 0.7]} // RGBA
                      scale={zoom}
                      rotate={0}
                    />
                  </div>
                  <div style={{ width: '100%', maxWidth: '300px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Zoom</span>
                    <input 
                      type="range" 
                      min="1" max="3" step="0.01" 
                      value={zoom} 
                      onChange={(e) => setZoom(parseFloat(e.target.value))} 
                      style={{ flex: 1, accentColor: 'var(--accent-cyan)' }} 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '25px', width: '100%' }}>
                    <button className="btn btn-ghost" onClick={() => setImageToCrop(null)} style={{ flex: 1 }}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSaveCrop} disabled={isSaving} style={{ flex: 1 }}>
                      {isSaving ? 'Saving...' : 'Apply Photo'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
