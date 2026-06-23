import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Try to load from localStorage, otherwise default to the milky way image
  const [backgroundImage, setBackgroundImage] = useState(() => {
    return localStorage.getItem('portal_bg') || '/src/assets/milky-way-starry-sky2k.jpg';
  });

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem('portal_avatar') || '/src/assets/avatar.png';
  });

  // Update localStorage when it changes
  useEffect(() => {
    localStorage.setItem('portal_bg', backgroundImage);
  }, [backgroundImage]);

  useEffect(() => {
    localStorage.setItem('portal_avatar', profileImage);
  }, [profileImage]);

  return (
    <ThemeContext.Provider value={{ backgroundImage, setBackgroundImage, profileImage, setProfileImage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
