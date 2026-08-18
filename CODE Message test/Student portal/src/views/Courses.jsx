import React, { useEffect, useState } from 'react';
import { Search, Sparkles, ExternalLink, PlayCircle } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { supabase } from '../supabase';
import './Courses.css';

const R2_PUBLIC_CDN_URL = 'https://pub-670b98370fe642a2be08ee37cbfd385f.r2.dev';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchAssignedCourses();
  }, []);

  async function fetchAssignedCourses() {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('edtech_user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userClass = user?.class_name || 'Class 6th';

      const { data, error } = await supabase
        .from('courses')
        .select(`
          id, title, class_name, subject, description, thumbnail_url, is_published,
          course_chapters (
            id, title, chapter_order, icon_class,
            chapter_modalities (id, modality_type, title, resource_url, content_status)
          )
        `)
        .eq('class_name', userClass)
        .eq('is_published', true);

      if (error) {
        console.error('Error fetching courses:', error);
        setCourses(getFallbackCourses());
      } else if (data && data.length > 0) {
        setCourses(data);
      } else {
        setCourses(getFallbackCourses());
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
      setCourses(getFallbackCourses());
    } finally {
      setLoading(false);
    }
  }

  function getFallbackCourses() {
    return [
      {
        id: 'c6000000-0000-0000-0000-000000000001',
        title: 'Class 6th Science & Physics',
        category: 'Science',
        subject: 'Science',
        progress: 85,
        icon: '💡',
        description: 'Explore optics, light propagation, and shadow formation through 3D simulations.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/optics.webp`
      },
      {
        id: 'c6000000-0000-0000-0000-000000000002',
        title: 'Class 6th Ancient & World History',
        category: 'History',
        subject: 'History',
        progress: 45,
        icon: '🏛️',
        description: 'Explore ancient empires, archaeological timelines, civilizations, and historical architecture.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/history.webp`
      },
      {
        id: 'c6000000-0000-0000-0000-000000000003',
        title: 'Class 6th World Geography & Continents',
        category: 'Geography',
        subject: 'Geography',
        progress: 70,
        icon: '🌍',
        description: 'Discover continental tectonics, climate zones, world topography, and interactive 3D map exploration.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/geography.webp`
      },
      {
        id: 'c6000000-0000-0000-0000-000000000004',
        title: 'Class 6th Physical Education & Sports Science',
        category: 'Physical Education',
        subject: 'Physical Education',
        progress: 60,
        icon: '🏃',
        description: 'Study biomechanics, athletic training regimens, physiology, and sports science fundamentals.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/pe.webp`
      },
      {
        id: 'c6000000-0000-0000-0000-000000000005',
        title: 'Class 6th Visual Arts & 3D Design',
        category: 'Arts',
        subject: 'Arts',
        progress: 40,
        icon: '🎨',
        description: 'Master color harmony theory, spatial perspective, 3D artistic sculpting, and creative composition.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/arts.webp`
      },
      {
        id: 'c6000000-0000-0000-0000-000000000006',
        title: 'Class 6th English Literature & Grammar',
        category: 'English',
        subject: 'English',
        progress: 65,
        icon: '📝',
        description: 'Analyze classic literature, narrative character development, poetry syntax, and advanced grammar.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/english.webp`
      },
      {
        id: 'c6000000-0000-0000-0000-000000000007',
        title: 'Class 6th Mathematics & Geometry',
        category: 'Mathematics',
        subject: 'Mathematics',
        progress: 80,
        icon: 'π',
        description: 'Master algebraic expressions, geometry theorems, number theory, and spatial calculations.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/math.webp`
      },
      {
        id: 'c6000000-0000-0000-0000-000000000008',
        title: 'Class 6th Music Theory & Acoustics',
        category: 'Music',
        subject: 'Music',
        progress: 30,
        icon: '🎵',
        description: 'Learn harmonic scales, rhythm composition, acoustic waveforms, and orchestral instrumentation.',
        thumbnail_url: `${R2_PUBLIC_CDN_URL}/placeholders/music.webp`
      }
    ];
  }

  function handleLaunchCourse(course) {
    // Open Study Island 3D Content Viewing Platform
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const basePath = isLocal ? '' : '/Working-Platform';
    const contentPlatformUrl = window.location.origin + basePath + '/study-island/index.html';
    window.open(contentPlatformUrl, '_blank');
  }

  const allSubjects = ['All', 'Science', 'History', 'Geography', 'Physical Education', 'Arts', 'English', 'Mathematics', 'Music'];

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.subject && c.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || c.subject === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="view-container">
      <Card className="full-height-card">
        <div className="courses-header">
          <div className="tabs" style={{ flexWrap: 'wrap', gap: '6px' }}>
            {allSubjects.map(sub => (
              <button 
                key={sub} 
                className={`tab ${selectedCategory === sub ? 'active' : ''}`} 
                onClick={() => setSelectedCategory(sub)}
              >
                {sub === 'All' ? 'All Subjects' : sub}
              </button>
            ))}
          </div>
          
          <div className="courses-actions">
            <div className="search-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search assigned courses..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {loading ? (
          <div style={{ padding: '40px', textAlig: 'center', color: '#94a3b8' }}>
            <Sparkles className="spin" size={24} style={{ marginBottom: '12px', color: 'var(--brand-primary, #00F0FF)' }} />
            <p>Loading assigned courses from Supabase & Cloudflare R2...</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <div key={course.id} className="course-card" style={{ border: '1px solid var(--brand-border, rgba(0, 240, 255, 0.2))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="course-category" style={{ color: 'var(--brand-primary, #00F0FF)', fontWeight: '700' }}>{course.subject || 'Science'}</span>
                  <span style={{ fontSize: '0.75rem', background: 'var(--brand-glow, rgba(0, 240, 255, 0.1))', color: 'var(--brand-primary, #00F0FF)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--brand-border, rgba(0, 240, 255, 0.3))' }}>
                    {course.class_name || 'Class 6th'}
                  </span>
                </div>

                <h4 className="course-title" style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{course.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px', flexGrow: 1 }}>{course.description}</p>
                
                <ProgressBar progress={course.progress || 85} />
                
                <button 
                  className="btn btn-primary w-100 mt-auto" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--brand-primary, #00F0FF), var(--brand-secondary, #3B82F6))', color: '#000', fontWeight: '700' }}
                  onClick={() => handleLaunchCourse(course)}
                >
                  <PlayCircle size={18} /> Launch 3D Experience <ExternalLink size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
