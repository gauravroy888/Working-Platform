import React from 'react';
import './Layout.css';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeContext';

export default function Layout({ children }) {
  const { backgroundImage } = useTheme();
  const userName = React.useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('edtech_user') || '{}');
      return u.name || 'Teacher';
    } catch { return 'Teacher'; }
  }, []);

  return (
    <div className="app-container">
      <div className="bg-overlay" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
      <div className="bg-gradient"></div>
      
      <Sidebar />
      
      <main className="main-content">
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
