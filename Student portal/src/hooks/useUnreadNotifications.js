import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let currentUser = null;
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (e) {
        return;
      }
    }
    
    if (!currentUser) return;

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .in('user_email', [currentUser.email, 'all'])
        .eq('is_read', false);
      
      if (count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    const subscription = supabase.channel('public:notifications:unread')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications'
      }, (payload) => {
        if (payload.new && (payload.new.user_email === currentUser.email || payload.new.user_email === 'all')) {
          fetchUnreadCount();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return unreadCount;
}
