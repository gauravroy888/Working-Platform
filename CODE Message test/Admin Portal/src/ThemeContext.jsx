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
    initialUser?.avatar_url || initialUser?.avatar || localStorage.getItem('admin_portal_avatar') || localStorage.getItem('portal_avatar') || 'https://api.dicebear.com/7.x/micah/svg?seed=ImmersionAdmin&backgroundColor=060a14'
  );

  useEffect(() => {
    const handleStorage = () => {
      const u = getInitialUser();
      const storedAvatar = localStorage.getItem('admin_portal_avatar') || localStorage.getItem('portal_avatar');
      if (u) {
        if (u.name) setProfileName(u.name);
        if (u.org) setProfileDesignation(`${u.org} Admin`);
        if (u.avatar_url || u.avatar) setProfileImage(u.avatar_url || u.avatar);
      } else if (storedAvatar) {
        setProfileImage(storedAvatar);
      }
    };
    window.addEventListener('storage', handleStorage);

    let channel = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel('edtech_platform_sync');
        channel.onmessage = (e) => {
          if (e.data && (e.data.type === 'AVATAR_UPDATE' || e.data.type === 'PROFILE_UPDATE')) {
            if (e.data.avatar_url) setProfileImage(e.data.avatar_url);
            if (e.data.name) setProfileName(e.data.name);
            handleStorage();
          }
        };
      } catch (err) {}
    }

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) channel.close();
    };
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

