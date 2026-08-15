import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, BookOpen, Star, Plus, ShieldCheck, CheckCircle, MessageSquare, ExternalLink, X } from 'lucide-react';
import Card from '../components/Card';
import { supabase } from '../supabase';

const INITIAL_TEACHERS = [
  {
    id: 't-gaurav',
    name: 'Gaurav',
    email: 'gauravroy476@gmail.com',
    role: 'Head of Science & Physics',
    department: 'Science & Physics',
    classes: ['Class 6th A', 'Class 6th B', 'Class 8th A'],
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=GauravPhysics&backgroundColor=060a14',
    rating: 4.9,
    status: 'Active',
    joined: '2026-07-03'
  },
  {
    id: 't-harsh',
    name: 'Harsh',
    email: 'rathorehps@gmail.com',
    role: 'Faculty of Mathematics & Computing',
    department: 'Mathematics',
    classes: ['Class 6th A', 'Class 7th A', 'Class 9th B'],
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=HarshMath&backgroundColor=060a14',
    rating: 4.85,
    status: 'Active',
    joined: '2026-05-27'
  },
  {
    id: 't-priya',
    name: 'Dr. Priya Sharma',
    email: 'priya.sharma@immersionlabs.in',
    role: 'Senior Faculty of Geometry',
    department: 'Mathematics',
    classes: ['Class 8th A', 'Class 10th A'],
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=PriyaSharma&backgroundColor=060a14',
    rating: 4.95,
    status: 'Active',
    joined: '2026-06-10'
  },
  {
    id: 't-ananya',
    name: 'Dr. Ananya Roy',
    email: 'ananya.roy@immersionlabs.in',
    role: 'Faculty of World History & Civilizations',
    department: 'Social Sciences',
    classes: ['Class 6th A', 'Class 6th B'],
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=AnanyaRoy&backgroundColor=060a14',
    rating: 4.88,
    status: 'Active',
    joined: '2026-06-15'
  },
  {
    id: 't-vikram',
    name: 'Prof. Vikram Patel',
    email: 'vikram.patel@immersionlabs.in',
    role: 'Faculty of Earth & Physical Geography',
    department: 'Social Sciences',
    classes: ['Class 6th A', 'Class 7th B'],
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=VikramPatel&backgroundColor=060a14',
    rating: 4.79,
    status: 'Active',
    joined: '2026-06-18'
  },
  {
    id: 't-sunita',
    name: 'Dr. Sunita Kapoor',
    email: 'sunita.kapoor@immersionlabs.in',
    role: 'Faculty of Chemistry & Life Sciences',
    department: 'Science & Physics',
    classes: ['Class 7th A', 'Class 8th A'],
    avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=SunitaKapoor&backgroundColor=060a14',
    rating: 4.92,
    status: 'Active',
    joined: '2026-06-20'
  }
];

export default function Teachers() {
  const [teachers, setTeachers] = useState(INITIAL_TEACHERS);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
    department: 'Science & Physics',
    role: 'Subject Instructor'
  });

  // Fetch real database records from Supabase if available
  useEffect(() => {
    async function loadTeachers() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or('role.eq.teacher,role.eq.TEACHER');

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(u => ({
            id: u.id,
            name: u.name || u.email.split('@')[0],
            email: u.email,
            role: u.role === 'teacher' ? 'Subject Faculty' : u.role,
            department: u.department || 'Academic Faculty',
            classes: ['Class 6th A'],
            avatar: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(u.name || u.email)}&backgroundColor=060a14`,
            rating: 4.9,
            status: 'Active',
            joined: (u.created_at || '').slice(0, 10) || '2026-08-01'
          }));

          // Merge unique by email
          const existingEmails = new Set(mapped.map(m => m.email.toLowerCase()));
          const combined = [...mapped, ...INITIAL_TEACHERS.filter(t => !existingEmails.has(t.email.toLowerCase()))];
          setTeachers(combined);
        }
      } catch (e) {
        // Fallback to initial teachers
      }
    }
    loadTeachers();
  }, []);

  const departments = ['ALL', 'Science & Physics', 'Mathematics', 'Social Sciences'];

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.email.toLowerCase().includes(search.toLowerCase()) ||
                          t.role.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || t.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddFaculty = (e) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email) return;
    const added = {
      id: `t-${Date.now()}`,
      name: newFaculty.name,
      email: newFaculty.email,
      role: newFaculty.role,
      department: newFaculty.department,
      classes: ['Class 6th A'],
      avatar: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(newFaculty.name)}&backgroundColor=060a14`,
      rating: 5.0,
      status: 'Active',
      joined: new Date().toISOString().slice(0, 10)
    };
    setTeachers([added, ...teachers]);
    setShowAddModal(false);
    setNewFaculty({ name: '', email: '', department: 'Science & Physics', role: 'Subject Instructor' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>Faculty &amp; Staff Directory</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Manage school teachers, class section allocations, and academic credentials.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #00F0FF, #3B82F6)',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)'
            }}
          >
            <Plus size={18} />
            <span>Add Faculty Member</span>
          </button>
        </div>
      </div>

      {/* Search & Department Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search teachers by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              color: '#fff',
              outline: 'none',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                border: deptFilter === dept ? '1px solid #00F0FF' : '1px solid rgba(255,255,255,0.08)',
                background: deptFilter === dept ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                color: deptFilter === dept ? '#00F0FF' : '#94a3b8',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {dept === 'ALL' ? '👥 All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
        {filteredTeachers.map(teacher => (
          <Card key={teacher.id}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                  <img
                    src={teacher.avatar}
                    alt={teacher.name}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid rgba(0, 240, 255, 0.4)', objectFit: 'cover', background: '#0a0f1d' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>{teacher.name}</h4>
                      <ShieldCheck size={16} color="#00F0FF" />
                    </div>
                    <p style={{ color: '#00F0FF', fontSize: '0.8rem', fontWeight: '600', margin: '2px 0 0 0' }}>{teacher.role}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '2px 0 0 0', fontFamily: 'monospace' }}>{teacher.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#94a3b8' }}>Department:</span>
                    <span style={{ color: '#cbd5e1', fontWeight: '700' }}>{teacher.department}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#94a3b8' }}>Assigned Sections:</span>
                    <span style={{ color: '#34d399', fontWeight: '700' }}>{teacher.classes.join(', ')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#94a3b8' }}>Student Rating:</span>
                    <span style={{ color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={13} fill="#f59e0b" /> {teacher.rating} / 5.0
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <a
                  href={`/admin/communications?to=${encodeURIComponent(teacher.email)}`}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: '#00F0FF',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    textDecoration: 'none'
                  }}
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </a>

                <button
                  onClick={() => setSelectedTeacher(teacher)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <BookOpen size={14} />
                  <span>Assign Class</span>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Assign Class */}
      {selectedTeacher && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '28px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>Assign Classes to {selectedTeacher.name}</h3>
              <button onClick={() => setSelectedTeacher(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>Select section to allocate to this faculty member for the 2026 academic year.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {['Class 6th A', 'Class 6th B', 'Class 7th A', 'Class 8th A', 'Class 9th A', 'Class 10th A'].map(cls => (
                <label key={cls} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={selectedTeacher.classes.includes(cls)} style={{ accentColor: '#00F0FF' }} />
                  <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{cls}</span>
                </label>
              ))}
            </div>

            <button
              onClick={() => setSelectedTeacher(null)}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #00F0FF, #3B82F6)', border: 'none', color: '#000', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Save Section Assignments
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Faculty */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '28px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>Add New Faculty Member</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Verma"
                  value={newFaculty.name}
                  onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.verma@immersionlabs.in"
                  value={newFaculty.email}
                  onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Department</label>
                <select
                  value={newFaculty.department}
                  onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                >
                  <option value="Science & Physics">Science & Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Social Sciences">Social Sciences</option>
                  <option value="Languages">Languages</option>
                  <option value="Visual Arts">Visual Arts</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Head of English Literature"
                  value={newFaculty.role}
                  onChange={e => setNewFaculty({ ...newFaculty, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #00F0FF, #3B82F6)', border: 'none', color: '#000', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Onboard Faculty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
