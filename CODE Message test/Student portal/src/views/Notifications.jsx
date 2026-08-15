import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Bell, BookOpen, MessageSquare, Star, CheckCircle, UserPlus, Info } from 'lucide-react';
import { supabase } from '../supabase';
import './Notifications.css';

const typeIconMap = {
  assignment: { icon: BookOpen, color: '#00E5FF' },
  message:    { icon: MessageSquare, color: '#8A2BE2' },
  system:     { icon: Bell, color: '#0A84FF' },
  achievement:{ icon: Star, color: '#FFD700' },
  grade:      { icon: CheckCircle, color: '#10B981' },
  user:       { icon: UserPlus, color: '#3B82F6' },
  info:       { icon: Info, color: '#94a3b8' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [currentUser, setCurrentUser] = useState(null);

  // Resolve current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try { setCurrentUser(JSON.parse(userStr)); } catch (e) {}
    }
  }, []);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .in('user_email', [currentUser.email, 'all'])
      .order('created_at', { ascending: false });

    if (data) setNotifications(data);
  };

  // Fetch + subscribe when currentUser is ready
  useEffect(() => {
    if (!currentUser) return;

    fetchNotifications();

    const subscription = supabase.channel('student:notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        if (
          payload.new &&
          (payload.new.user_email === currentUser.email || payload.new.user_email === 'all')
        ) {
          fetchNotifications();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [currentUser]);

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    if (!currentUser) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('user_email', [currentUser.email, 'all'])
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="view-container animate-fade-in">
      <Card className="full-height-card">
        <div className="notifications-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.3rem', fontWeight: '700' }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span style={{
                background: '#EF4444', color: '#fff',
                fontSize: '11px', fontWeight: '700',
                padding: '2px 8px', borderRadius: '12px'
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="tabs" style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>
          <button className="btn btn-ghost text-sm" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>

        <div className="notifications-list">
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: '#94a3b8', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '12px'
            }}>
              <Bell size={40} style={{ opacity: 0.3 }} />
              <p style={{ margin: 0 }}>
                {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
              </p>
            </div>
          ) : (
            filtered.map(notif => {
              const typeKey = notif.type || 'info';
              const { icon: Icon, color } = typeIconMap[typeKey] || typeIconMap.info;
              return (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="notif-icon-wrapper"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="notif-content">
                    <h4 className="notif-title">{notif.title}</h4>
                    <p className="notif-message">{notif.message || notif.body}</p>
                    <span className="notif-time">
                      {notif.created_at
                        ? new Date(notif.created_at).toLocaleString('en-GB', {
                            day: '2-digit', month: 'short',
                            hour: '2-digit', minute: '2-digit'
                          })
                        : 'Just now'}
                    </span>
                  </div>
                  {!notif.is_read && <div className="unread-dot" />}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
