import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultBg from './assets/Future verion lowres.jpg';
import defaultAvatar from './assets/avatar.png';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Background image — default to the futuristic bg
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('teacher_portal_bg') || defaultBg;
  });

  // Avatar — prefer portal-specific key, then shared key
  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('portal_avatar') || defaultAvatar;
  });

  // Name — read from authenticated edtech_user object first, then fallbacks
  const [profileName, setProfileName] = useState(() => {
    try {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.name) return u.name;
      }
    } catch (e) {}
    return localStorage.getItem('portal_name') || 'Teacher';
  });

  // Designation — derive from role
  const [profileDesignation, setProfileDesignation] = useState(() => {
    try {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role === 'teacher') return 'Faculty / Teacher';
        if (u.role === 'super_admin' || u.role === 'superadmin') return 'Super Administrator';
      }
    } catch (e) {}
    return localStorage.getItem('portal_designation') || 'Faculty / Teacher';
  });

  // Keep name/avatar in sync if edtech_user is updated (e.g. after login redirect)
  useEffect(() => {
    const sync = () => {
      try {
        const userStr = localStorage.getItem('edtech_user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.name) setProfileName(u.name);
          if (u.avatar_url) setProfileImage(u.avatar_url);
        }
      } catch (e) {}
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('teacher_portal_bg', backgroundImage); }, [backgroundImage]);
  useEffect(() => { localStorage.setItem('portal_avatar', profileImage); }, [profileImage]);
  useEffect(() => { localStorage.setItem('portal_name', profileName); }, [profileName]);
  useEffect(() => { localStorage.setItem('portal_designation', profileDesignation); }, [profileDesignation]);

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
