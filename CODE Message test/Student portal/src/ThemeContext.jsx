import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultBg from './assets/milky-way-starry-sky2k.jpg';
import defaultAvatar from './assets/avatar.png';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Background image
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('student_portal_bg') || defaultBg;
  });

  // Avatar — prefer per-portal key, then the shared portal_avatar key
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('student_portal_avatar')
      || localStorage.getItem('portal_avatar')
      || defaultAvatar;
  });

  // Name — read from the authenticated edtech_user object first, then fallbacks
  const [profileName, setProfileName] = useState(() => {
    try {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name) return u.name;
      }
    } catch (e) {}
    return localStorage.getItem('student_portal_name') || 'Student';
  });

  // Designation
  const [profileDesignation, setProfileDesignation] = useState(() => {
    try {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role === 'super_admin' || u.role === 'superadmin') return 'Super Administrator';
        if (u.role === 'student') return 'Student';
      }
    } catch (e) {}
    return localStorage.getItem('student_portal_designation') || 'Student';
  });

  // Keep name in sync across tabs and portals
  useEffect(() => {
    const sync = () => {
      try {
        const userStr = localStorage.getItem('edtech_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.name) setProfileName(u.name);
          if (u.avatar_url) setProfileImage(u.avatar_url);
        } else {
          const avatar = localStorage.getItem('portal_avatar') || localStorage.getItem('student_portal_avatar');
          if (avatar) setProfileImage(avatar);
        }
      } catch (e) {}
    };
    sync();
    window.addEventListener('storage', sync);

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('edtech_platform_sync');
        channel.onmessage = (e) => {
          if (e.data && (e.data.type === 'AVATAR_UPDATE' || e.data.type === 'PROFILE_UPDATE')) {
            if (e.data.avatar_url) setProfileImage(e.data.avatar_url);
            if (e.data.name) setProfileName(e.data.name);
            sync();
          }
        };
      } catch (err) {}
    }

    return () => {
      window.removeEventListener('storage', sync);
      if (channel) channel.close();
    };
  }, []);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('student_portal_bg', backgroundImage); }, [backgroundImage]);
  useEffect(() => { localStorage.setItem('student_portal_avatar', profileImage); }, [profileImage]);
  useEffect(() => { localStorage.setItem('student_portal_name', profileName); }, [profileName]);
  useEffect(() => { localStorage.setItem('student_portal_designation', profileDesignation); }, [profileDesignation]);

  return (
    <ThemeContext.Provider value={{
      backgroundImage, setBackgroundImage,
      profileImage, setProfileImage,
      profileName, setProfileName,
      profileDesignation, setProfileDesignation
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
