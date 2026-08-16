import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import GlobalBroadcastBanner from './GlobalBroadcastBanner';
import { useTheme } from '../ThemeContext';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import './Layout.css';

const PAGE_TITLES = {
  '/': 'Admin Dashboard',
  '/events': 'School Events & Calendar',
  '/timetable': 'Master Institutional Timetable',
  '/teachers': 'Faculty & Staff Directory',
  '/classes': 'Class & Section Management',
  '/communications': 'Communications Hub',
  '/analytics': 'Institutional Performance Analytics',
  '/settings': 'System & Institution Settings',
  '/notifications': 'Notification Center'
};

export default function Layout({ children }) {
  const { backgroundImage, profileName, profileDesignation } = useTheme();
  const location = useLocation();
  const currentTitle = PAGE_TITLES[location.pathname] || 'Admin Portal';

  return (
    <div className="app-container">
      <div className="bg-overlay" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
      <div className="bg-gradient"></div>
      
      <Sidebar />
      
      <main className="main-content">
        <GlobalBroadcastBanner />

        <header className="top-header">
          <div className="header-brand">
            <h2>{currentTitle}</h2>
            <p className="header-sub">{profileDesignation} • Operational Deck</p>
          </div>

          <div className="header-right-actions">
            <div className="status-badge">
              <span className="live-pulse"></span>
              <span>Online • Supabase Active</span>
            </div>
            
            <a 
              href="/study-island/" 
              target="_blank" 
              rel="noreferrer"
              className="study-island-link"
              title="Launch 3D Study Island Simulator"
            >
              <span>🏝️ Study Island 3D</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </header>
        
        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}

