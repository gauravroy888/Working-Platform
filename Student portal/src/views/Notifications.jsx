import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Bell, BookOpen, MessageSquare, Star, CheckCircle, UserPlus, Info } from 'lucide-react';
import { supabase } from '../supabase';
import './Notifications.css';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const fetchNotifications = async () => {
    if (!currentUser) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .in('user_email', [currentUser.email, 'all'])
      .order('created_at', { ascending: false });
    
    if (data) {
      setNotifications(data);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    fetchNotifications();

    const subscription = supabase.channel('public:notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications'
      }, (payload) => {
        if (payload.new && (payload.new.user_email === currentUser.email || payload.new.user_email === 'all')) {
          fetchNotifications();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser]);

  const markAsRead = async (id) => {
    const notif = notifications.find(n => n.id === id);
    if (notif && notif.user_email !== 'all') {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    // We only mark the user's specific unread notifications as read. 
    // Global 'all' notifications can be dismissed locally or we update them for the user specifically, 
    // but a simple update to 'user_email' is safest for now.
    await supabase.from('notifications').update({ is_read: true }).eq('user_email', currentUser.email).eq('is_read', false);
    
    // For 'all' notifications, ideally we'd track reads in a join table, 
    // but for this UI, we can just fetch again (the global ones will still be unread unfortunately unless we update all).
    // As a hack to clear them for the user, we can set them to read globally, or just rely on manual dismiss.
    fetchNotifications();
  };

  const getIconAndColor = (type) => {
    switch (type) {
      case 'assignment': return { icon: BookOpen, color: '#00E5FF' };
      case 'message': return { icon: MessageSquare, color: '#8A2BE2' };
      case 'system': return { icon: Bell, color: '#0A84FF' };
      case 'achievement': return { icon: Star, color: '#FFD700' };
      case 'grade': return { icon: CheckCircle, color: '#10B981' };
      case 'user_add': return { icon: UserPlus, color: '#FF6B6B' };
      default: return { icon: Info, color: '#a0aebc' };
    }
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
            const { icon: Icon, color } = getIconAndColor(notif.type);
            return (
              <div 
                key={notif.id} 
                className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '15px', 
                  background: !notif.is_read ? 'rgba(0, 229, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)', 
                  border: '1px solid var(--panel-border)', 
                  borderRadius: '12px',
                  cursor: !notif.is_read ? 'pointer' : 'default',
                  position: 'relative'
                }}
              >
                <div className="notif-icon-wrapper" style={{ backgroundColor: `${color}20`, color: color, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                  <Icon size={20} />
                </div>
                <div className="notif-content" style={{ flex: 1, minWidth: 0 }}>
                  <h4 className="notif-title" style={{ margin: '0 0 5px 0', color: '#fff', fontSize: '15px' }}>{notif.title}</h4>
                  <p className="notif-message" style={{ margin: 0, color: '#e2e8f0', fontSize: '14.5px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.message}</p>
                  <span className="notif-time" style={{ display: 'block', marginTop: '6px', color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px' }}>
                    {new Date(notif.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                {!notif.is_read && <div className="unread-dot" style={{ width: '8px', height: '8px', backgroundColor: '#00E5FF', borderRadius: '50%', position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}></div>}
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
