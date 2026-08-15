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

  // Keep name in sync if edtech_user changes (e.g. after login redirect)
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
