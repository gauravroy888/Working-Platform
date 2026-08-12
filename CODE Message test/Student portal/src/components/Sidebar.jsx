import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, Video, MessageSquare, Users, BarChart2, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import './Sidebar.css';

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
          <img src={profileImage || '/assets/avatar.png'} alt={profileName || 'Student'} className="avatar" />
          <span className="status-dot" style={{ backgroundColor: '#10B981' }}></span>
        </div>
        <h3 className="profile-name">{profileName || 'Alex'}</h3>
        <p className="profile-role">{profileDesignation || 'Student'}</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/courses" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BookOpen size={20} />
          <span>Courses</span>
        </NavLink>
        <NavLink to="/timetable" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={20} />
          <span>Time Table</span>
        </NavLink>
        <NavLink to="/liveclass" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Video size={20} />
          <span>Online Class/Tests</span>
        </NavLink>
        <NavLink to="/chats" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <MessageSquare size={20} />
          <span>Chats</span>
        </NavLink>
        <NavLink to="/mentors" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Teachers</span>
        </NavLink>
        <NavLink to="/progress" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart2 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Bell size={20} />
          <span>Alerts</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}
