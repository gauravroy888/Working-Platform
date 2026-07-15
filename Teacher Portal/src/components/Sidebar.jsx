import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, CheckSquare, Inbox, Users, BarChart2, Video, Settings, Bell, Database } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
  { id: 'timetable', label: 'Time Table', icon: Calendar, path: '/timetable' },
  { id: 'todo', label: 'To Do List', icon: CheckSquare, path: '/todo' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, path: '/inbox' },
  { id: 'classes', label: 'Assigned Classes', icon: Users, path: '/classes' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics' },
  { id: 'liveclass', label: 'Online Class/Tests', icon: Video, path: '/liveclass' },
  { id: 'question-bank', label: 'Question Bank', icon: Database, path: '/question-bank' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
];

export default function Sidebar() {
  const { profileImage, profileName, profileDesignation } = useTheme();
  const unreadCount = useUnreadMessages();
  const unreadNotifs = useUnreadNotifications();

  return (
    <aside className="sidebar glass-panel">
      <div className="profile-section">
        <div className="avatar-wrapper">
          <img src={profileImage} alt="Teacher Profile" className="avatar" />
          <span className="status-dot"></span>
        </div>
        <h3 className="profile-name">{profileName}</h3>
        <p className="profile-role">{profileDesignation}</p>
      </div>
      
      <nav className="nav-menu">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.id} 
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.id === 'inbox' ? (
                <div className="icon-wrapper">
                  <Icon size={20} className="nav-icon" />
                  {unreadCount > 0 && (
                    <span className="badge" style={{ background: '#FF6B6B', color: '#fff', position: 'absolute', top: '-5px', right: '-10px', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                      {unreadCount}
                    </span>
                  )}
                </div>
              ) : (
                <Icon size={20} className="nav-icon" />
              )}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <NavLink to="/notifications" className={({ isActive }) => `nav-link notification-btn ${isActive ? 'active' : ''}`}>
          <div className="icon-wrapper">
            <Bell size={20} className="nav-icon" />
            {unreadNotifs > 0 && (
              <span className="badge" style={{ background: '#FF6B6B', color: '#fff', position: 'absolute', top: '-5px', right: '-10px', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>
                {unreadNotifs}
              </span>
            )}
          </div>
          <span>Notifications</span>
        </NavLink>
      </div>
    </aside>
  );
}
