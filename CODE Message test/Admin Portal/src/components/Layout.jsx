import React from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../ThemeContext';
import './Layout.css';

export default function Layout({ children }) {
  const { backgroundImage, profileName } = useTheme();

  return (
    <div className="app-container">
      <div className="bg-overlay" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
      <div className="bg-gradient"></div>
      
      <Sidebar />
      
      <main className="main-content">
        <header className="top-header">
          <div className="header-brand">
            <h2>ADMIN PORTAL</h2>
            <p>Welcome back, {profileName}!</p>
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}
