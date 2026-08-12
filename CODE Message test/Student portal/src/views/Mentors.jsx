import React, { useState, useEffect } from 'react';
import { Search, Star, MessageCircle } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './Mentors.css';

export default function Mentors() {
  const [activeTab, setActiveTab] = useState('all');
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();

    const channel = supabase
      .channel('public:teachers')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers' }, () => {
        fetchTeachers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('teachers').select('*').order('name', { ascending: true });
      if (data && data.length > 0) {
        setTeachers(data);
      } else {
        setTeachers([{
          id: 't-gaurav',
          name: 'Gaurav',
          degree: 'Head of Science & Physics',
          subject: 'Physics',
          rating: 5.0,
          status: 'Online',
          email: 'gauravroy476@gmail.com',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gaurav&top=shortFlat&hairColor=2c1b18&skinColor=ffdbb4&clothing=blazerAndShirt&clothingColor=black&backgroundColor=b6e3f4'
        }]);
      }
    } catch (err) {
      console.error('Error fetching teachers from database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openDirectChat = (teacher) => {
    const targetEmail = teacher.email || 'gauravroy476@gmail.com';
    navigate(`/chats?name=${encodeURIComponent(teacher.name)}&email=${encodeURIComponent(targetEmail)}`);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="view-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'white' }}>Teachers & Mentors</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Connect directly with your course instructors.</p>
      </div>

      <Card className="full-height-card">
        <div className="mentors-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div className="tabs" style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: activeTab === 'all' ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.1)',
                background: activeTab === 'all' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                color: activeTab === 'all' ? '#00F0FF' : '#94a3b8',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              All Teachers
            </button>
          </div>
          
          <div className="search-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 16px', width: '280px' }}>
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search teachers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
        
        <div className="mentors-list">
          {isLoading ? (
            <p style={{ color: '#94a3b8', padding: '20px' }}>Loading teachers...</p>
          ) : filteredTeachers.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '20px' }}>No teachers found.</p>
          ) : (
            filteredTeachers.map(mentor => (
              <div key={mentor.id} className="mentor-row">
                <div className="mentor-info-block">
                  <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                    <img 
                      src={mentor.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gaurav'} 
                      alt={mentor.name} 
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: '2px solid #00F0FF',
                        boxShadow: '0 0 12px rgba(0, 240, 255, 0.3)',
                        objectFit: 'cover'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#10B981',
                      border: '2px solid #0D1424'
                    }}></span>
                  </div>
                  <div>
                    <h4 className="mentor-name" style={{ color: 'white', fontWeight: '700', margin: '0 0 2px 0' }}>{mentor.name}</h4>
                    <p className="mentor-title" style={{ color: '#94a3b8', margin: '0 0 2px 0', fontSize: '0.85rem' }}>{mentor.degree || 'Head of Science & Physics'}</p>
                    <span className="status-text online" style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: '600' }}>● {mentor.status || 'Online'}</span>
                  </div>
                </div>
                
                <div className="mentor-subject">
                  <span className="subject-badge" style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.3)', padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '0.85rem' }}>
                    {mentor.subject || 'Physics'}
                  </span>
                </div>
                
                <div className="mentor-rating">
                  <span className="rating-val" style={{ color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>{mentor.rating || 5.0}</span>
                  <Star size={16} fill="#EAB308" color="#EAB308" />
                </div>
                
                <div className="mentor-row-actions">
                  <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                    View Profile
                  </button>
                  <button 
                    onClick={() => openDirectChat(mentor)}
                    style={{
                      background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
                      color: '#000',
                      fontWeight: '700',
                      border: 'none',
                      padding: '8px 18px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)'
                    }}
                  >
                    <MessageCircle size={16} /> Chat
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
