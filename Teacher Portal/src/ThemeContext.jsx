import React, { createContext, useContext, useState, useEffect } from 'react';
import defaultBg from './assets/milky-way-starry-sky2k.jpg';
import defaultAvatar from './assets/avatar.png';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Try to load from localStorage, otherwise default to the milky way image
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('teacher_portal_bg') || defaultBg;
  });

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('portal_avatar') || defaultAvatar;
  });

  const [profileName, setProfileName] = useState(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name) return u.name;
      } catch (e) {}
    }
    return localStorage.getItem('portal_name') || 'Teacher';
  });

  const [profileDesignation, setProfileDesignation] = useState(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role === 'teacher') return 'Faculty / Teacher';
        if (u.role === 'super_admin' || u.role === 'superadmin') return 'Super Administrator';
      } catch (e) {}
    }
    return localStorage.getItem('portal_designation') || 'Faculty / Teacher';
  });

  // Update localStorage when it changes
  useEffect(() => {
    localStorage.setItem('teacher_portal_bg', backgroundImage);
  }, [backgroundImage]);

  useEffect(() => {
    localStorage.setItem('portal_avatar', profileImage);
  }, [profileImage]);

  useEffect(() => {
    localStorage.setItem('portal_name', profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem('portal_designation', profileDesignation);
  }, [profileDesignation]);

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
