import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Search, Users, Shield, Megaphone } from 'lucide-react';
import { supabase } from '../supabase';
import ChatInterface from '../components/ChatInterface';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'staff' | 'announcements'
  const [currentUser, setCurrentUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({ students: 0, staff: 0 });

  useEffect(() => {
    const userStr = localStorage.getItem('edtech_user');
    if (userStr) {
      try { setCurrentUser(JSON.parse(userStr)); } catch (e) {}
    }
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('createdAt', { ascending: false });
      if (data) setAnnouncements(data);
      if (error) console.warn('Announcements fetch error:', error.message);
    };
    
    fetchAnnouncements();
    
    const subscription = supabase.channel('teacher_announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();
      
    return () => { supabase.removeChannel(subscription); };
  }, []);

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="view-header flex-between" style={{ flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h1>Inbox & Announcements</h1>
          <p>Manage your communications and stay up to date.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '5px' }}>
            <button 
              onClick={() => setActiveTab('students')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '25px', border: 'none',
                background: activeTab === 'students' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'students' ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
              }}
            >
              <Users size={16} /> Students
              {unreadCounts.students > 0 && (
                <span style={{ background: '#25D366', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginLeft: '5px' }}>
                  {unreadCounts.students}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('staff')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '25px', border: 'none',
                background: activeTab === 'staff' ? 'var(--accent-purple)' : 'transparent',
                color: activeTab === 'staff' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
              }}
            >
              <Shield size={16} /> Staff
              {unreadCounts.staff > 0 && (
                <span style={{ background: '#25D366', color: '#000', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginLeft: '5px' }}>
                  {unreadCounts.staff}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 20px', borderRadius: '25px', border: 'none',
                background: activeTab === 'announcements' ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === 'announcements' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s'
              }}
            >
              <Megaphone size={16} /> Updates
            </button>
          </div>
        </div>
      </div>

      <Card style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, minHeight: '600px', overflow: 'hidden' }}>
        {activeTab === 'announcements' ? (
          <div style={{ padding: '30px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, marginBottom: '10px' }}>Global Announcements</h3>
            {announcements.length > 0 ? announcements.map(ann => (
              <div key={ann.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--accent-purple)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h4 style={{ color: '#fff', margin: 0 }}>{ann.title}</h4>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Just now'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{ann.text}</p>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>Posted by: {ann.author}</div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No announcements yet.</div>
            )}
          </div>
        ) : (
          <ChatInterface 
            currentUser={currentUser} 
            activeTab={activeTab} 
            isManager={true}
            onUnreadCountChange={setUnreadCounts} 
          />
        )}
      </Card>
    </div>
  );
}
