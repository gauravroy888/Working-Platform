import React, { useState, useEffect } from 'react';
import { Search, Star, MessageCircle, X, Mail, BookOpen, Clock, MapPin, Award, CheckCircle2, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';
import './Mentors.css';

export default function Mentors() {
  const [activeTab, setActiveTab] = useState('all');
  const [teachers, setTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
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

  const CLASS_6TH_FACULTY = [
    {
      id: 't-gaurav',
      name: 'Gaurav',
      degree: 'Head of Science & Physics',
      subject: 'Physics',
      rating: 5.0,
      status: 'Online',
      email: 'gauravroy476@gmail.com',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gaurav&top=shortFlat&hairColor=2c1b18&skinColor=ffdbb4&clothing=blazerAndShirt&clothingColor=black&backgroundColor=b6e3f4',
      bio: 'Senior Physics educator specializing in 3D Ray Optics, Quantum Mechanics, and interactive curriculum design for secondary education.',
      classes: 'Class 6th, Class 7th, Class 8th, Class 9th, Class 10th',
      office_hours: 'Mon - Fri: 09:00 AM - 04:00 PM',
      location: 'Science Lab 3 (3D VR Room)'
    },
    {
      id: 't-priya',
      name: 'Dr. Priya Sharma',
      degree: 'M.Sc., Ph.D. in Mathematics & Geometry',
      subject: 'Mathematics',
      rating: 4.9,
      status: 'Online',
      email: 'priya.sharma@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma&clothing=blazerAndShirt&backgroundColor=b6e3f4',
      bio: 'Mathematics specialist focusing on spatial geometry, algebraic foundations, and interactive problem solving.',
      classes: 'Class 6th, Class 7th',
      office_hours: 'Mon - Thu: 10:00 AM - 03:00 PM',
      location: 'Mathematics Wing Room 204'
    },
    {
      id: 't-ananya',
      name: 'Dr. Ananya Roy',
      degree: 'Ph.D. in World History & Civilizations',
      subject: 'History',
      rating: 4.9,
      status: 'Online',
      email: 'ananya.roy@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnanyaRoy&clothing=blazerAndShirt&backgroundColor=ffd5dc',
      bio: 'History faculty expert in Mesopotamian, Indus Valley, and Vedic civilizational heritage.',
      classes: 'Class 6th, Class 8th',
      office_hours: 'Tue - Fri: 09:30 AM - 02:30 PM',
      location: 'Social Sciences Room 105'
    },
    {
      id: 't-vikram-p',
      name: 'Prof. Vikram Patel',
      degree: 'M.Sc. in Physical & Earth Geography',
      subject: 'Geography',
      rating: 4.8,
      status: 'Available',
      email: 'vikram.patel@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramPatel&clothing=blazerAndShirt&backgroundColor=d1d4f9',
      bio: 'Geographer specializing in plate tectonics, atmospheric science, and interactive planetary mapping.',
      classes: 'Class 6th, Class 7th',
      office_hours: 'Mon - Fri: 11:00 AM - 04:00 PM',
      location: 'Earth Sciences Geo Lab 1'
    },
    {
      id: 't-sunita',
      name: 'Dr. Sunita Kapoor',
      degree: 'M.Sc., Ph.D. in Chemistry & Life Sciences',
      subject: 'Chemistry',
      rating: 5.0,
      status: 'Online',
      email: 'sunita.kapoor@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunitaKapoor&clothing=blazerAndShirt&backgroundColor=c0aede',
      bio: 'Researcher in molecular chemistry and life systems, guiding students through virtual laboratory experiments.',
      classes: 'Class 6th, Class 9th',
      office_hours: 'Mon - Thu: 09:00 AM - 01:00 PM',
      location: 'Virtual Chemistry Sim Lab'
    },
    {
      id: 't-rajesh',
      name: 'Prof. Rajesh Verma',
      degree: 'M.A. in English Literature & Linguistics',
      subject: 'English',
      rating: 4.8,
      status: 'Available',
      email: 'rajesh.verma@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RajeshVerma&clothing=blazerAndShirt&backgroundColor=c0aede',
      bio: 'Literature educator developing student creative writing, grammar syntax, and public speaking skills.',
      classes: 'Class 6th, Class 7th, Class 8th',
      office_hours: 'Mon - Fri: 08:30 AM - 02:00 PM',
      location: 'Humanities Room 102'
    },
    {
      id: 't-rohan',
      name: 'Prof. Rohan Gupta',
      degree: 'Master of Fine Arts (MFA) & 3D Spatial Design',
      subject: 'Arts',
      rating: 4.9,
      status: 'Available',
      email: 'rohan.gupta@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RohanGupta&clothing=blazerAndShirt&backgroundColor=b6e3f4',
      bio: 'Visual arts designer teaching digital rendering, spatial composition, and 3D architectural forms.',
      classes: 'Class 6th, Class 7th',
      office_hours: 'Wed - Fri: 12:00 PM - 05:00 PM',
      location: 'Creative Arts Studio A'
    },
    {
      id: 't-meera',
      name: 'Prof. Meera Iyer',
      degree: 'M.Mus. in Acoustics & Classical Music Theory',
      subject: 'Music',
      rating: 4.8,
      status: 'Online',
      email: 'meera.iyer@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MeeraIyer&clothing=blazerAndShirt&backgroundColor=ffd5dc',
      bio: 'Musicologist and acoustic physicist demonstrating sound wave resonance and melodic harmony.',
      classes: 'Class 6th, Class 8th',
      office_hours: 'Mon - Thu: 10:00 AM - 03:00 PM',
      location: 'Acoustics & Sound Lab'
    },
    {
      id: 't-singh',
      name: 'Coach Vikram Singh',
      degree: 'B.P.Ed. in Sports Science & Fitness',
      subject: 'Physical Education',
      rating: 5.0,
      status: 'Available',
      email: 'vikram.singh@edtech.org',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VikramSingh&clothing=hoodie&backgroundColor=d1d4f9',
      bio: 'Athletic director focusing on cardiovascular health, kinetic movement, and youth sports development.',
      classes: 'Class 6th, Class 7th, Class 8th',
      office_hours: 'Mon - Fri: 07:30 AM - 01:30 PM',
      location: 'Main Sports Complex & Gymnasium'
    }
  ];

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('teachers').select('*').order('name', { ascending: true });
      if (data && data.length > 0) {
        // Merge Supabase DB teachers with full faculty list
        const merged = data.slice();
        CLASS_6TH_FACULTY.forEach(fac => {
          const exists = merged.some(t => (t.email && t.email.toLowerCase() === fac.email.toLowerCase()) || t.name.toLowerCase() === fac.name.toLowerCase());
          if (!exists) {
            merged.push(fac);
          }
        });
        setTeachers(merged);
      } else {
        setTeachers(CLASS_6TH_FACULTY);
      }
    } catch (err) {
      console.error('Error fetching teachers from database:', err);
      setTeachers(CLASS_6TH_FACULTY);
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
    <div className="view-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 6px 0', color: 'white' }}>Teachers & Mentors</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Connect directly with your course instructors and faculty.</p>
      </div>

      <Card className="full-height-card">
        <div className="mentors-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
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
              All Teachers ({filteredTeachers.length})
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
            <p style={{ color: '#94a3b8', padding: '20px' }}>No teachers found matching your search.</p>
          ) : (
            filteredTeachers.map(mentor => (
              <div key={mentor.id} className="mentor-row">
                <div className="mentor-info-block">
                  <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                    <img 
                      src={mentor.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + mentor.name} 
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
                  <button 
                    onClick={() => setSelectedTeacher(mentor)}
                    className="btn btn-ghost" 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                  >
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

      {/* Teacher Profile Modal */}
      {selectedTeacher && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(4, 7, 18, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: 'rgba(13, 20, 36, 0.98)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 240, 255, 0.15)',
            borderRadius: '24px',
            padding: '32px',
            position: 'relative'
          }}>
            
            {/* Close button */}
            <button
              onClick={() => setSelectedTeacher(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                borderRadius: '10px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Profile Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0 }}>
                <img
                  src={selectedTeacher.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + selectedTeacher.name}
                  alt={selectedTeacher.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid #00F0FF',
                    boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                    objectFit: 'cover'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: '#10B981',
                  border: '2px solid #0D1424'
                }}></span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'white' }}>{selectedTeacher.name}</h3>
                  <span style={{ padding: '2px 8px', borderRadius: '6px', background: 'rgba(0,240,255,0.15)', color: '#00F0FF', fontSize: '0.75rem', fontWeight: '800' }}>
                    VERIFIED FACULTY
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.92rem' }}>
                  {selectedTeacher.degree || 'Head of Science & Physics'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <Star size={14} fill="#EAB308" color="#EAB308" />
                  <span style={{ color: 'white', fontWeight: '700', fontSize: '0.88rem' }}>{selectedTeacher.rating || 5.0} / 5.0</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>• 98 Student Reviews</span>
                </div>
              </div>
            </div>

            {/* Bio Card */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', marginBottom: '20px' }}>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.6' }}>
                {selectedTeacher.bio || 'Senior Physics and Science educator dedicated to interactive 3D simulations, optics experiments, and concept mastery.'}
              </p>
            </div>

            {/* Quick Details List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <Mail size={16} color="#00F0FF" />
                <span>Email: <strong style={{ color: 'white' }}>{selectedTeacher.email || 'gauravroy476@gmail.com'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <BookOpen size={16} color="#00F0FF" />
                <span>Assigned Classes: <strong style={{ color: 'white' }}>{selectedTeacher.classes || 'Class 6th, Class 7th, Class 8th'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <Clock size={16} color="#00F0FF" />
                <span>Office Hours: <strong style={{ color: 'white' }}>{selectedTeacher.office_hours || 'Mon - Fri: 09:00 AM - 04:00 PM'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <MapPin size={16} color="#00F0FF" />
                <span>Room / Lab: <strong style={{ color: 'white' }}>{selectedTeacher.location || 'Lab 3 (3D VR Room)'}</strong></span>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setSelectedTeacher(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedTeacher(null);
                  openDirectChat(selectedTeacher);
                }}
                style={{
                  flex: 1.5,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
                  color: '#000',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
                }}
              >
                <MessageCircle size={18} /> Send Direct Message
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
