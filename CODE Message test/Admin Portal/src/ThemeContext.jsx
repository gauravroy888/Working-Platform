import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const getInitialUser = () => {
    try {
      const u = localStorage.getItem('edtech_user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  };

  const initialUser = getInitialUser();
  const [backgroundImage, setBackgroundImage] = useState('/assets/Future%20verion%20lowres.jpg');
  const [profileName, setProfileName] = useState(initialUser?.name || 'Administrator');
  const [profileDesignation, setProfileDesignation] = useState(
    initialUser?.org ? `${initialUser.org} Admin` : 'Immersion Labs Admin'
  );
  const [profileImage, setProfileImage] = useState(
    initialUser?.avatar || 'https://api.dicebear.com/7.x/micah/svg?seed=ImmersionAdmin&backgroundColor=060a14'
  );

  useEffect(() => {
    const handleStorage = () => {
      const u = getInitialUser();
      if (u) {
        if (u.name) setProfileName(u.name);
        if (u.org) setProfileDesignation(`${u.org} Admin`);
        if (u.avatar) setProfileImage(u.avatar);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <ThemeContext.Provider value={{
      backgroundImage, setBackgroundImage,
      profileName, setProfileName,
      profileDesignation, setProfileDesignation,
      profileImage, setProfileImage
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

