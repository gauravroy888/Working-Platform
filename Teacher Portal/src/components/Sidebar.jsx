import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, MessageSquare, Users, BarChart2, Video, Database, Settings as SettingsIcon, Bell } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import './Sidebar.css';

export default function Sidebar({ isOpen = false, closeMenu = () => {} }) {
  const { profileImage, profileName, profileDesignation } = useTheme();
  const unreadCount = useUnreadMessages();
  const unreadNotifs = useUnreadNotifications();

  return (
    <aside className={`portal-sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="brand-logo">
        <span className="brand-icon">👨‍🏫</span>
        <span className="brand-title">Teacher Portal</span>
      </div>

      <div className="profile-section">
        <div className="avatar-wrapper">
          <img src={profileImage || '/assets/avatar.png'} alt={profileName || 'Teacher'} className="avatar" />
          <span className="status-dot" style={{ backgroundColor: '#10B981' }}></span>
        </div>
        <h3 className="profile-name">{profileName || 'Teacher'}</h3>
        <p className="profile-role">{profileDesignation || 'Faculty / Teacher'}</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/timetable" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={20} />
          <span>Time Table</span>
        </NavLink>
        <NavLink to="/todo" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <CheckSquare size={20} />
          <span>To Do List</span>
        </NavLink>
        <NavLink to="/inbox" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <MessageSquare size={20} />
            {unreadCount > 0 && (
              <span className="badge" style={{ background: '#FF6B6B', color: '#fff', position: 'absolute', top: '-6px', right: '-8px', fontSize: '10px', padding: '1px 5px', borderRadius: '10px' }}>
                {unreadCount}
              </span>
            )}
          </div>
          <span>Inbox</span>
        </NavLink>
        <NavLink to="/classes" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Users size={20} />
          <span>Assigned Classes</span>
        </NavLink>
        <NavLink to="/analytics" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <BarChart2 size={20} />
          <span>Analytics</span>
        </NavLink>
        <NavLink to="/liveclass" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Video size={20} />
          <span>Online Class/Tests</span>
        </NavLink>
        <NavLink to="/question-bank" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Database size={20} />
          <span>Question Bank</span>
        </NavLink>
        <NavLink to="/notifications" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={20} />
            {unreadNotifs > 0 && (
              <span className="badge" style={{ background: '#FF6B6B', color: '#fff', position: 'absolute', top: '-6px', right: '-8px', fontSize: '10px', padding: '1px 5px', borderRadius: '10px' }}>
                {unreadNotifs}
              </span>
            )}
          </div>
          <span>Notifications</span>
        </NavLink>
        <NavLink to="/settings" onClick={closeMenu} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <SettingsIcon size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
}
