import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import { Bell, BookOpen, MessageSquare, Star, CheckCircle, UserPlus, Info, Megaphone } from 'lucide-react';
import { supabase } from '../supabase';
import './Notifications.css';

// Tracks which announcement IDs have been read locally (persisted in localStorage)
const ANNOUNCE_READ_KEY = 'edtech_student_read_announcements';

function getReadAnnouncements() {
  try { return new Set(JSON.parse(localStorage.getItem(ANNOUNCE_READ_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveReadAnnouncements(set) {
  localStorage.setItem(ANNOUNCE_READ_KEY, JSON.stringify([...set]));
}

const typeIconMap = {
  assignment:  { icon: BookOpen,      color: '#00E5FF' },
  message:     { icon: MessageSquare, color: '#8A2BE2' },
  system:      { icon: Bell,          color: '#0A84FF' },
  achievement: { icon: Star,          color: '#FFD700' },
  grade:       { icon: CheckCircle,   color: '#10B981' },
  user_add:    { icon: UserPlus,      color: '#FF6B6B' },
  info:        { icon: Info,          color: '#a0aebc' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try { setCurrentUser(JSON.parse(userStr)); } catch (e) {}
    }
  }, []);

  // Bug 4 fix: announcements track read state in localStorage, not hardcoded false
  const fetchNotifications = useCallback(async (user) => {
    if (!user) return;
    try {
      const email = user.email;
      const readSet = getReadAnnouncements();

      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: announceData } = await supabase
        .from('announcements')
        .select('*')
        .order('createdAt', { ascending: false });

      const mappedAnnouncements = (announceData || []).map(a => ({
        id: `announce_${a.id}`,
        dbId: a.id,
        title: a.title || 'Platform Announcement',
        message: a.text || a.content || a.message || '',
        type: 'system',
        is_read: readSet.has(`announce_${a.id}`), // Bug 4 fix
        created_at: a.createdAt || a.created_at || new Date().toISOString(),
        author: a.author || 'SuperAdmin',
        is_broadcast: true
      }));

      const filteredNotifs = (notifData || []).filter(n =>
        n.user_email === 'all' || n.user_email === 'system' || n.user_email === email
      );

      const combined = [...mappedAnnouncements, ...filteredNotifs];
      const unique = [];
      const seen = new Set();
      for (const item of combined) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          unique.push(item);
        }
      }
      setNotifications(unique);
    } catch (e) {
      console.error('Error fetching student notifications:', e);
    }
  }, []);

  // Bug 15 fix: subscribe to announcements table so new broadcasts appear without refresh
  useEffect(() => {
    if (!currentUser) return;

    fetchNotifications(currentUser);

    const subscription = supabase.channel('student:notifications:v2')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => fetchNotifications(currentUser))
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'    // Bug 15 fix: was missing this subscription
      }, () => fetchNotifications(currentUser))
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [currentUser, fetchNotifications]);

  const markAsRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;

    if (notif.is_broadcast) {
      // Bug 4 fix: use localStorage for announcement read state
      const readSet = getReadAnnouncements();
      readSet.add(id);
      saveReadAnnouncements(readSet);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } else {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  // Bug 5 fix: marks both DB notifications AND announcement items as read
  const markAllAsRead = async () => {
    if (!currentUser) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_email', currentUser.email)
      .eq('is_read', false);

    const readSet = getReadAnnouncements();
    notifications.forEach(n => { if (n.is_broadcast) readSet.add(n.id); });
    saveReadAnnouncements(readSet);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="view-container">
      <Card className="full-height-card">
        <div className="notifications-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div className="tabs" style={{ display: 'flex', gap: '20px' }}>
            <button
              className={`tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              style={{ background: 'transparent', border: 'none', color: filter === 'all' ? '#00E5FF' : 'var(--text-secondary)', fontWeight: filter === 'all' ? 'bold' : 'normal', cursor: 'pointer', borderBottom: filter === 'all' ? '2px solid #00E5FF' : 'none', paddingBottom: '5px' }}
            >
              All Notifications
            </button>
            <button
              className={`tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
              style={{ background: 'transparent', border: 'none', color: filter === 'unread' ? '#00E5FF' : 'var(--text-secondary)', fontWeight: filter === 'unread' ? 'bold' : 'normal', cursor: 'pointer', borderBottom: filter === 'unread' ? '2px solid #00E5FF' : 'none', paddingBottom: '5px' }}
            >
              Unread
            </button>
          </div>
          <button className="btn btn-ghost text-sm" onClick={markAllAsRead} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', padding: '5px 15px', borderRadius: '15px', cursor: 'pointer' }}>
            Mark all as read
          </button>
        </div>

        <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.length > 0 ? filteredNotifications.map(notif => {
            const isBroadcastAlert = notif.is_broadcast || notif.user_email === 'all' || notif.type === 'system';
            const typeKey = notif.type || 'info';
            const { icon: Icon, color } = isBroadcastAlert ? { icon: Megaphone, color: '#c084fc' } : (typeIconMap[typeKey] || typeIconMap.info);
            return (
              <div
                key={notif.id}
                className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  background: isBroadcastAlert
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.18), rgba(239, 68, 68, 0.12), rgba(13, 20, 36, 0.85))'
                    : (!notif.is_read ? 'rgba(0, 229, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'),
                  border: isBroadcastAlert ? '2px solid rgba(168, 85, 247, 0.5)' : '1px solid var(--panel-border)',
                  boxShadow: isBroadcastAlert ? '0 0 20px rgba(168, 85, 247, 0.25)' : 'none',
                  borderRadius: '14px',
                  cursor: !notif.is_read ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                <div className="notif-icon-wrapper" style={{ backgroundColor: `${color}30`, color: color, width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', flexShrink: 0 }}>
                  <Icon size={22} />
                </div>
                <div className="notif-content" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    {isBroadcastAlert && (
                      <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.6px' }}>
                        🔴 OFFICIAL BROADCAST
                      </span>
                    )}
                    <h4 className="notif-title" style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: '800' }}>{notif.title}</h4>
                  </div>
                  <p className="notif-message" style={{ margin: '4px 0 0 0', color: '#f1f5f9', fontSize: '14px', fontWeight: '500', lineHeight: '1.4' }}>{notif.message}</p>
                  <span className="notif-time" style={{ display: 'block', marginTop: '6px', color: 'rgba(255, 255, 255, 0.45)', fontSize: '11px', fontWeight: '600' }}>
                    {notif.author ? `From: ${notif.author} • ` : ''}{new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                {!notif.is_read && <div className="unread-dot" style={{ width: '10px', height: '10px', backgroundColor: isBroadcastAlert ? '#ef4444' : '#00E5FF', borderRadius: '50%', position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', boxShadow: isBroadcastAlert ? '0 0 8px #ef4444' : '0 0 8px #00E5FF' }}></div>}
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
              No notifications found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
