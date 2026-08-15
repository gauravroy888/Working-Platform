import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, Clock, Users, BookOpen, MessageSquare, BarChart2, Settings as SettingsIcon, Bell, Camera, Edit2 } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import ProfilePhotoModal from './ProfilePhotoModal';
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
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileName || 'Admin')}&backgroundColor=b6e3f4`;

  return (
    <aside className="portal-sidebar">
      <div className="brand-logo">
        <span className="brand-icon">🎓</span>
        <span className="brand-title">Study Island</span>
      </div>

      <div className="profile-section">
        <div 
          className="avatar-wrapper"
          onClick={() => setShowPhotoModal(true)}
          style={{ cursor: 'pointer', position: 'relative' }}
          title="Click to customize avatar or upload photo"
        >
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
        <h3 className="profile-name" style={{ cursor: 'pointer' }} onClick={() => setShowPhotoModal(true)}>{profileName || 'Administrator'}</h3>
        <p className="profile-role">{profileDesignation || 'Immersion Labs Admin'}</p>
        <button
          onClick={() => setShowPhotoModal(true)}
          style={{
            marginTop: '8px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            color: '#00F0FF',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
        >
          <Camera size={12} />
          <span>Edit Avatar</span>
        </button>
      </div>

      <ProfilePhotoModal isOpen={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
      
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

