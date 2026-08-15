import React, { useState } from 'react';
import { BookOpen, Users, UserCheck, Plus, ChevronRight, Activity, Award, X } from 'lucide-react';
import Card from '../components/Card';

const INITIAL_CLASSES = [
  {
    id: 'cls-6',
    name: 'Class 6th',
    sections: ['6th A', '6th B', '6th C'],
    students: 128,
    classTeacher: 'Gaurav',
    activeSubject: 'Science — LIGHT AND SHADOWS',
    progress: 78,
    status: 'Active',
    color: '#00F0FF'
  },
  {
    id: 'cls-7',
    name: 'Class 7th',
    sections: ['7th A', '7th B'],
    students: 94,
    classTeacher: 'Harsh',
    activeSubject: 'Science — Thermal Dynamics',
    progress: 64,
    status: 'Active',
    color: '#3B82F6'
  },
  {
    id: 'cls-8',
    name: 'Class 8th',
    sections: ['8th A', '8th B'],
    students: 110,
    classTeacher: 'Dr. Priya Sharma',
    activeSubject: 'Science — Space & Astronomy',
    progress: 82,
    status: 'Active',
    color: '#A855F7'
  },
  {
    id: 'cls-9',
    name: 'Class 9th',
    sections: ['9th A', '9th B', '9th C'],
    students: 145,
    classTeacher: 'Dr. Sunita Kapoor',
    activeSubject: 'Physics — Kinematics & Force',
    progress: 55,
    status: 'Active',
    color: '#F59E0B'
  },
  {
    id: 'cls-10',
    name: 'Class 10th',
    sections: ['10th A', '10th B'],
    students: 120,
    classTeacher: 'Prof. Vikram Patel',
    activeSubject: 'Optics & Ray Diagram Simulation',
    progress: 91,
    status: 'Active',
    color: '#10B981'
  }
];

export default function Classes() {
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClass, setNewClass] = useState({
    name: '',
    section: 'A',
    classTeacher: 'Gaurav',
    students: 40
  });

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.name) return;
    const added = {
      id: `cls-${Date.now()}`,
      name: newClass.name,
      sections: [`${newClass.name} ${newClass.section}`],
      students: parseInt(newClass.students) || 40,
      classTeacher: newClass.classTeacher,
      activeSubject: 'Standard CBSE Curriculum',
      progress: 0,
      status: 'Active',
      color: '#00F0FF'
    };
    setClasses([...classes, added]);
    setShowAddModal(false);
    setNewClass({ name: '', section: 'A', classTeacher: 'Gaurav', students: 40 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>Class &amp; Section Management</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>Monitor grade enrollment, assigned class teachers, and 3D curriculum syllabus pacing.</p>
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
            <span>Add Class / Section</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Card>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>TOTAL ENROLLED STUDENTS</span>
          <h4 style={{ color: '#00F0FF', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            {classes.reduce((acc, c) => acc + c.students, 0)}
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>Across {classes.length} Grades</span>
        </Card>

        <Card>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>ACTIVE SECTIONS</span>
          <h4 style={{ color: '#3B82F6', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            {classes.reduce((acc, c) => acc + c.sections.length, 0)} Sections
          </h4>
          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>100% Class Teachers Assigned</span>
        </Card>

        <Card>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' }}>CURRICULUM SYLLABUS PACING</span>
          <h4 style={{ color: '#10B981', fontSize: '1.8rem', fontWeight: '800', margin: '6px 0 0 0', fontFamily: 'monospace' }}>
            {Math.round(classes.reduce((acc, c) => acc + c.progress, 0) / classes.length)}%
          </h4>
          <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '600' }}>On Schedule for Term 1</span>
        </Card>
      </div>

      {/* Classes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {classes.map(cls => (
          <Card key={cls.id}>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: `${cls.color}20`,
                      border: `1px solid ${cls.color}50`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cls.color,
                      fontWeight: '800',
                      fontSize: '1rem'
                    }}>
                      {cls.name.replace('Class ', '')}
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', margin: 0 }}>{cls.name}</h4>
                      <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{cls.sections.join(' • ')}</span>
                    </div>
                  </div>

                  <span style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.75rem', fontWeight: '700' }}>
                    {cls.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.25)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Class Teacher:</span>
                    <span style={{ color: '#00F0FF', fontWeight: '700' }}>{cls.classTeacher}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Total Students:</span>
                    <span style={{ color: '#fff', fontWeight: '700' }}>{cls.students} Enrolled</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Current 3D Unit:</span>
                    <span style={{ color: '#cbd5e1', fontWeight: '600' }}>{cls.activeSubject}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Syllabus Mastery</span>
                    <span style={{ color: '#00F0FF', fontWeight: '700' }}>{cls.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${cls.progress}%`, height: '100%', background: `linear-gradient(90deg, ${cls.color}, #00F0FF)`, borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <button
                  onClick={() => setSelectedClass(cls)}
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
                    cursor: 'pointer'
                  }}
                >
                  <Users size={14} />
                  <span>Student Roster</span>
                </button>

                <a
                  href="/study-island/"
                  target="_blank"
                  rel="noreferrer"
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
                    textDecoration: 'none'
                  }}
                >
                  <span>Open 3D Lab</span>
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Student Roster */}
      {selectedClass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '28px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.3rem', fontWeight: '800' }}>{selectedClass.name} — Student Cohort</h3>
              <button onClick={() => setSelectedClass(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px' }}>
              Class Teacher: <strong style={{ color: '#00F0FF' }}>{selectedClass.classTeacher}</strong> • Enrolled: <strong style={{ color: '#34d399' }}>{selectedClass.students} Students</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
              {[
                { name: 'GAURAV Roy', email: 'thorroy888@gmail.com', attendance: '98%', rank: 'Rank #1' },
                { name: 'Harsh Singh', email: 'hps.sunghrathore@gmail.com', attendance: '96%', rank: 'Rank #2' },
                { name: 'Saurav Roy', email: 'sauravroy469@gmail.com', attendance: '94%', rank: 'Rank #3' },
                { name: 'Aarav Sharma', email: 'aarav.s@dps.edu.in', attendance: '92%', rank: 'Rank #4' },
                { name: 'Diya Patel', email: 'diya.p@dps.edu.in', attendance: '95%', rank: 'Rank #5' }
              ].map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{s.name}</strong>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0, fontFamily: 'monospace' }}>{s.email}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: '700', display: 'block' }}>{s.attendance} Attendance</span>
                    <span style={{ color: '#00F0FF', fontSize: '0.75rem', fontWeight: '600' }}>{s.rank}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedClass(null)}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}
            >
              Close Roster
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#0a0f1d', border: '1px solid rgba(0, 240, 255, 0.4)', borderRadius: '20px', width: '100%', maxWidth: '460px', padding: '28px', boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>Add New Class Section</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleAddClass} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Grade Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 11th"
                  value={newClass.name}
                  onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Section</label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={newClass.section}
                    onChange={e => setNewClass({ ...newClass, section: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Capacity (Students)</label>
                  <input
                    type="number"
                    value={newClass.students}
                    onChange={e => setNewClass({ ...newClass, students: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Designated Class Teacher</label>
                <select
                  value={newClass.classTeacher}
                  onChange={e => setNewClass({ ...newClass, classTeacher: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', outline: 'none' }}
                >
                  <option value="Gaurav">Gaurav (Head of Science)</option>
                  <option value="Harsh">Harsh (Mathematics)</option>
                  <option value="Dr. Priya Sharma">Dr. Priya Sharma (Geometry)</option>
                  <option value="Dr. Ananya Roy">Dr. Ananya Roy (History)</option>
                </select>
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
