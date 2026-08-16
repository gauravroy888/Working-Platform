import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import { supabase } from '../supabase';

export default function GlobalBroadcastBanner() {
  const [broadcast, setBroadcast] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 1. Check local storage for active broadcast
    const checkLocalBroadcast = () => {
      try {
        const stored = localStorage.getItem('edtech_active_broadcast');
        if (stored) {
          const parsed = JSON.parse(stored);
          const dismissedId = localStorage.getItem('edtech_dismissed_broadcast');
          const isFresh = parsed.timestamp && (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000);
          if (isFresh && dismissedId !== (parsed.id || parsed.timestamp?.toString())) {
            setBroadcast(parsed);
            setVisible(true);
          }
        }
      } catch (e) {}
    };

    checkLocalBroadcast();

    // 2. Fetch latest announcement from Supabase
    const fetchLatestAnnouncement = async () => {
      try {
        const { data } = await supabase
          .from('announcements')
          .select('*')
          .order('createdAt', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const latest = data[0];
          const latestTime = new Date(latest.createdAt || latest.created_at || Date.now()).getTime();
          const isFresh = Date.now() - latestTime < 24 * 60 * 60 * 1000;
          const dismissedId = localStorage.getItem('edtech_dismissed_broadcast');
          const broadcastId = latest.id?.toString() || latestTime.toString();

          if (isFresh && dismissedId !== broadcastId) {
            setBroadcast({
              id: broadcastId,
              title: latest.title || 'Platform Announcement',
              message: latest.text || latest.content || latest.message || 'Important update from administration.',
              author: latest.author || latest.author_name || 'SuperAdmin'
            });
            setVisible(true);
          }
        }
      } catch (err) {
        console.warn('Could not fetch latest announcement:', err);
      }
    };

    fetchLatestAnnouncement();

    // 3. Listen on native BroadcastChannel for instant 0ms cross-tab notification
    let bc = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('edtech_platform_sync');
        bc.onmessage = (event) => {
          if (event.data?.type === 'BROADCAST_ALERT') {
            const newBcast = {
              id: `bcast_${event.data.timestamp || Date.now()}`,
              title: event.data.title || 'Platform Announcement',
              message: event.data.message || event.data.text || '',
              author: event.data.author || 'SuperAdmin'
            };
            setBroadcast(newBcast);
            setVisible(true);
          }
        };
      } catch (e) {}
    }

    // 4. Supabase Realtime subscription
    const subscription = supabase.channel('portal_admin_broadcast_listener')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, (payload) => {
        if (payload.new) {
          setBroadcast({
            id: payload.new.id?.toString() || Date.now().toString(),
            title: payload.new.title || 'Platform Announcement',
            message: payload.new.text || payload.new.content || payload.new.message || '',
            author: payload.new.author || payload.new.author_name || 'SuperAdmin'
          });
          setVisible(true);
        }
      })
      .subscribe();

    return () => {
      if (bc) bc.close();
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    if (broadcast?.id) {
      localStorage.setItem('edtech_dismissed_broadcast', broadcast.id);
    }
  };

  if (!visible || !broadcast || !broadcast.message) return null;

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(59, 130, 246, 0.25), rgba(0, 240, 255, 0.25))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(168, 85, 247, 0.5)',
        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
        borderRadius: '14px',
        margin: '12px 16px 0 16px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        color: '#fff',
        zIndex: 9999,
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <div 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            background: 'rgba(168, 85, 247, 0.35)', 
            border: '1px solid rgba(168, 85, 247, 0.6)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#c084fc',
            flexShrink: 0
          }}
        >
          <Megaphone size={20} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#a855f7', color: '#000', padding: '2px 8px', borderRadius: '6px' }}>
              OFFICIAL BROADCAST
            </span>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '600' }}>
              From: {broadcast.author}
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#f8fafc', fontWeight: '500', lineHeight: '1.4', wordBreak: 'break-word' }}>
            {broadcast.message}
          </p>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          color: '#cbd5e1',
          cursor: 'pointer',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        title="Dismiss Alert"
      >
        <X size={18} />
      </button>
    </div>
  );
}
