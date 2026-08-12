import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Users, Shield, Megaphone, MessageSquare, BookOpen } from 'lucide-react';
import { supabase } from '../supabase';
import ChatInterface from '../components/ChatInterface';
import { useLocation } from 'react-router-dom';

export default function Chats() {
  const [activeTab, setActiveTab] = useState('direct'); 
  const [currentUser, setCurrentUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({ direct: 0, teachers: 0 });
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userParam = params.get('user');
    if (userParam) {
      localStorage.setItem('edtech_user', userParam);
      setCurrentUser(JSON.parse(userParam));
    } else {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      } else {
        // Fallback default student user
        const defaultStudent = { name: 'Alex', email: 'alex@student.edtech.org', role: 'student' };
        setCurrentUser(defaultStudent);
        localStorage.setItem('edtech_user', JSON.stringify(defaultStudent));
      }
    }
  }, [location.search]);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase.from('announcements').select('*').order('createdAt', { ascending: false });
      if (data) setAnnouncements(data);
    };
    
    fetchAnnouncements();
    
    const subscription = supabase.channel('student_announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();
      
    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'white' }}>Inbox & Direct Messages</h1>
          <p style={{ margin: 0, color: '#94a3b8' }}>Chat directly with teacher Gaurav and your course mentors.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '5px', flexWrap: 'wrap', gap: '5px' }}>
              <button 
                onClick={() => setActiveTab('direct')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', borderRadius: '25px', border: 'none',
                  background: activeTab === 'direct' ? 'var(--accent-cyan)' : 'transparent',
                  color: activeTab === 'direct' ? '#000' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                }}
              >
                <MessageSquare size={16} /> Direct
              </button>
              <button 
                onClick={() => setActiveTab('teachers')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px', borderRadius: '25px', border: 'none',
                  background: activeTab === 'teachers' ? '#FF6B6B' : 'transparent',
                  color: activeTab === 'teachers' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
                }}
              >
                <Users size={16} /> Teachers
              </button>
          </div>
        </div>
      </div>

      <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '600px', overflow: 'hidden' }}>
        <ChatInterface 
          currentUser={currentUser} 
          activeTab={activeTab} 
          isManager={false} 
          onUnreadCountChange={setUnreadCounts}
        />
      </Card>
    </div>
  );
}
