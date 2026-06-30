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
        <header className="top-header">
          <div className="header-brand">
            <h2>TEACHER PORTAL</h2>
            <p>Welcome back, {userName}!</p>
          </div>
          <div className="header-actions">
            {/* Any global actions could go here */}
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
