import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [backgroundImage, setBackgroundImage] = useState('/assets/milky-way-starry-sky2k.jpg');
  const [profileName, setProfileName] = useState('Administrator');
  const [profileDesignation, setProfileDesignation] = useState('Immersion Labs Admin');
  const [profileImage, setProfileImage] = useState('/assets/avatar.png');

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
