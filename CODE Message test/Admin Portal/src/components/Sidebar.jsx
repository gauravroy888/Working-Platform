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

  return (
    <aside className="portal-sidebar">
      <div className="brand-logo">
        <span className="brand-icon">🎓</span>
        <span className="brand-title">Study Island</span>
      </div>

      <div className="profile-section">
        <div className="avatar-wrapper">
          <img src={profileImage} alt="Admin Profile" className="avatar" />
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
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <NavLink to="/notifications" className={({ isActive }) => `nav-link notification-btn ${isActive ? 'active' : ''}`}>
          <Bell size={20} className="nav-icon" />
          <span>Notifications</span>
        </NavLink>
      </div>
    </aside>
  );
}
