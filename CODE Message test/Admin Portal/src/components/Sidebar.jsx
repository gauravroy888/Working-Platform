import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, Users, BookOpen, MessageSquare, BarChart2, Settings as SettingsIcon, Bell } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import './Sidebar.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/events' },
  { id: 'timetable', label: 'Time Table', icon: Clock, path: '/timetable' },
  { id: 'teachers', label: 'Teachers', icon: Users, path: '/teachers' },
  { id: 'classes', label: 'Classes', icon: BookOpen, path: '/classes' },
  { id: 'communications', label: 'Communications', icon: MessageSquare, path: '/communications' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings' }
];

export default function Sidebar() {
  const { profileImage, profileName, profileDesignation } = useTheme();

  const fallbackAvatar = `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(profileName || 'Admin')}&backgroundColor=060a14`;

  return (
    <aside className="portal-sidebar">
      <div className="brand-logo">
        <span className="brand-icon">🎓</span>
        <span className="brand-title">Study Island</span>
      </div>

      <div className="profile-section">
        <div className="avatar-wrapper">
          <img 
            src={profileImage || fallbackAvatar} 
            alt={profileName || 'Admin Profile'} 
            className="avatar"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackAvatar;
            }}
          />
          <span className="status-dot"></span>
        </div>
        <h3 className="profile-name">{profileName || 'Administrator'}</h3>
        <p className="profile-role">{profileDesignation || 'Immersion Labs Admin'}</p>
      </div>
      
      <nav className="nav-menu">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.id} 
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <NavLink 
          to="/notifications" 
          className={({ isActive }) => `nav-link notification-btn ${isActive ? 'active' : ''}`}
        >
          <Bell size={20} className="nav-icon" />
          <span>Notifications</span>
        </NavLink>
      </div>
    </aside>
  );
}

