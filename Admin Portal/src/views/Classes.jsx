import React, { useState } from 'react';
import Card from '../components/Card';
import { Users, CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import { supabase } from '../supabase';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  
  // Create Class Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ grade: '1st', section: '', subjects: '' });
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentAvatarFile, setStudentAvatarFile] = useState(null);

  // Add Student Modal State
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStudentData, setNewStudentData] = useState({ name: '', age: '', email: '', login_id: '', password: '', avatar_url: '' });
  const [studentSelectedClasses, setStudentSelectedClasses] = useState([]);

  // View Students Modal State
  const [studentModalData, setStudentModalData] = useState(null); // holds class object
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Full Report State
  const [reportModalData, setReportModalData] = useState(null); 

  React.useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'student').order('name');
    if (data) setAllStudents(data);
  };

  const fetchClasses = async () => {
    // Only fetch non-archived classes
    const { data, error } = await supabase.from('classes').select('*').eq('is_archived', false).order('created_at', { ascending: true });
    if (data) {
      setClasses(data);
    }
  };

  const handleArchiveClass = async (cls) => {
    if (!window.confirm(`Archive "${cls.name}"? It will be hidden but all data will be preserved.`)) return;
    await supabase.from('classes').update({ is_archived: true }).eq('id', cls.id);
    fetchClasses();
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!formData.grade || !formData.section) return;

    const newClass = {
      name: `Class ${formData.grade} - Section ${formData.section.toUpperCase()}`,
      subject: formData.subjects || null,
      students: selectedStudents.length,
      avg_attendance: 0,
      avg_score: 0,
      status: 'On Track'
    };

    // 1. Create the class
    const { data: insertedClass, error: classError } = await supabase.from('classes').insert([newClass]).select().single();
    
    if (classError) {
      console.error('Error creating class:', classError);
      return;
    }

    // 2. Link the selected students
    if (selectedStudents.length > 0 && insertedClass) {
      const studentLinks = selectedStudents.map(studentId => ({
        class_id: insertedClass.id,
        student_id: studentId
      }));
      
      const { error: linkError } = await supabase.from('class_students').insert(studentLinks);
      if (linkError) {
        console.error('Error linking students:', linkError);
      }
    }

    setFormData({ grade: '1st', section: '', subjects: '' });
    setSelectedStudents([]);
    setIsCreateModalOpen(false);
    fetchClasses();
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentData.name || !newStudentData.login_id || !newStudentData.password) return;

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.innerText = 'Creating...'; btn.disabled = true; }

    try {
      let finalAvatarUrl = newStudentData.avatar_url || null;

      if (studentAvatarFile) {
        const fileExt = studentAvatarFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(fileName, studentAvatarFile);
        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
          finalAvatarUrl = publicUrl;
        }
      }

      // Call the secure Edge Function — password is hashed by Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('https://qmyrxvtbzlbnvzxypnus.supabase.co/functions/v1/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFteXJ4dnRiemxibnZ6eHlwbnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MjA4OTcsImV4cCI6MjA5NTM5Njg5N30.ABvW_oBzXC2Ffxm5ToLh6t4WmdKPdtg9SyfeAE76iJo'
        },
        body: JSON.stringify({
          name: newStudentData.name,
          login_id: newStudentData.login_id,
          password: newStudentData.password,
          role: 'student',
          email: newStudentData.email || null,
          age: newStudentData.age || null,
          avatar_url: finalAvatarUrl,
          class_ids: studentSelectedClasses
        })
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        alert('Error adding student: ' + (result.error || 'Unknown error'));
        return;
      }

      // Update student count on classes
      for (const classId of studentSelectedClasses) {
        const targetClass = classes.find(c => c.id === classId);
        if (targetClass) {
          await supabase.from('classes').update({ students: targetClass.students + 1 }).eq('id', classId);
        }
      }

      setNewStudentData({ name: '', age: '', email: '', login_id: '', password: '', avatar_url: '' });
      setStudentAvatarFile(null);
      setStudentSelectedClasses([]);
      setIsAddStudentModalOpen(false);
      fetchStudents();
      fetchClasses();
      alert('Student added successfully! They can now log in securely.');
    } finally {
      if (btn) { btn.innerText = 'Save Student'; btn.disabled = false; }
    }
  };

  const openViewStudents = async (cls) => {
    setStudentModalData(cls);
    setIsLoadingStudents(true);
    
    // Fetch students linked to this class
    const { data, error } = await supabase
      .from('class_students')
      .select('profiles(*)')
      .eq('class_id', cls.id);
      
    if (data) {
      setEnrolledStudents(data.map(d => d.profiles));
    }
    setIsLoadingStudents(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="text-gradient">Class Performance & Monitoring</h1>
          <p>Overview of all active classes, attendance, and average scores.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" style={{ border: '1px solid var(--panel-border)' }} onClick={() => setIsAddStudentModalOpen(true)}>+ Add New Student</button>
          <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>+ Create New Class</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {classes.map(cls => (
          <div key={cls.id} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '4px' }}>{cls.name}</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} /> {cls.students} Students Enrolled
                </span>
              </div>
              {cls.status === 'Needs Attention' ? (
                <AlertCircle size={20} color="#EF4444" />
              ) : cls.status === 'Excellent' ? (
                <CheckCircle size={20} color="#10B981" />
              ) : (
                <TrendingUp size={20} color="var(--accent-cyan)" />
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Average Attendance</span>
                <span>{cls.avg_attendance || 0}%</span>
              </div>
              <ProgressBar progress={cls.avg_attendance || 0} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Average Class Score</span>
                <span>{cls.avg_score || 0}%</span>
              </div>
              <ProgressBar progress={cls.avg_score || 0} color="var(--accent-purple)" />
            </div>

            <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-ghost" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => openViewStudents(cls)}>View Students</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleArchiveClass(cls)} style={{ background: 'transparent', border: '1px solid #EF4444', color: '#EF4444', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }} title="Archive this class">Archive</button>
                <button className="btn btn-primary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => setReportModalData(cls)}>Full Report</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Class Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-scale-in" style={{ width: '90%', maxWidth: '600px', background: '#0B1120', border: '1px solid var(--panel-border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Create New Class</h2>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleCreateClass}>
              <div style={{ padding: '25px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Grade</label>
                    <div 
                      onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span>Class {formData.grade}</span>
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
                    </div>
                    
                    {isGradeDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#0B1120', border: '1px solid var(--panel-border)', borderRadius: '8px', marginTop: '4px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                        {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'].map(grade => (
                          <div 
                            key={grade}
                            onClick={() => { setFormData({...formData, grade}); setIsGradeDropdownOpen(false); }}
                            style={{ padding: '10px 15px', cursor: 'pointer', color: 'white', background: formData.grade === grade ? 'rgba(255,255,255,0.1)' : 'transparent', transition: 'background 0.2s' }}
                            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.target.style.background = formData.grade === grade ? 'rgba(255,255,255,0.1)' : 'transparent'}
                          >
                            Class {grade}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Section</label>
                    <input type="text" className="form-control" placeholder="e.g. A" required
                      value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Subjects (comma separated)</label>
                  <input type="text" className="form-control" placeholder="e.g. English, Math, Science"
                    value={formData.subjects} onChange={e => setFormData({...formData, subjects: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                </div>
                
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Add Students to Class</label>
                    <span style={{ fontSize: '12px', background: 'var(--accent-cyan)', color: 'black', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{selectedStudents.length} Selected</span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                    {allStudents.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found in the database.</div>
                    ) : (
                      allStudents.map(student => (
                        <label key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStudents([...selectedStudents, student.id]);
                              else setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                            }}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
                          />
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
                            {student.avatar_url ? (
                              <img src={student.avatar_url} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{student.name.charAt(0)}</div>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontWeight: '500' }}>{student.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{student.email}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px 25px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 25px', background: 'var(--accent-cyan)', color: 'black' }}>Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Student Modal */}
      {isAddStudentModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-scale-in" style={{ width: '90%', maxWidth: '600px', background: '#0B1120', border: '1px solid var(--panel-border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Add New Student</h2>
              <button onClick={() => setIsAddStudentModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAddStudent}>
              <div style={{ padding: '25px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Full Name</label>
                    <input type="text" required value={newStudentData.name} onChange={e => setNewStudentData({...newStudentData, name: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Age</label>
                    <input type="number" required value={newStudentData.age} onChange={e => setNewStudentData({...newStudentData, age: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Login ID (e.g. Student ID)</label>
                    <input type="text" required value={newStudentData.login_id} onChange={e => setNewStudentData({...newStudentData, login_id: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Password</label>
                    <input type="text" required value={newStudentData.password} onChange={e => setNewStudentData({...newStudentData, password: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '15px' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Gmail ID</label>
                  <input type="email" required value={newStudentData.email} onChange={e => setNewStudentData({...newStudentData, email: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={e => setStudentAvatarFile(e.target.files[0])} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>OR</div>
                  <input type="url" placeholder="Image URL (if not uploading a file)" value={newStudentData.avatar_url} onChange={e => setNewStudentData({...newStudentData, avatar_url: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', marginTop: '10px' }}/>
                </div>
                
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Assign to Classes</label>
                    <span style={{ fontSize: '12px', background: 'var(--accent-purple)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{studentSelectedClasses.length} Selected</span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {classes.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No classes available.</div>
                    ) : (
                      classes.map(cls => (
                        <label key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={studentSelectedClasses.includes(cls.id)}
                            onChange={(e) => {
                              if (e.target.checked) setStudentSelectedClasses([...studentSelectedClasses, cls.id]);
                              else setStudentSelectedClasses(studentSelectedClasses.filter(id => id !== cls.id));
                            }}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-purple)' }}
                          />
                          <div style={{ color: '#fff', fontWeight: '500' }}>{cls.name}</div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px 25px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsAddStudentModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 25px', background: 'var(--accent-purple)', color: 'white' }}>Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Students Modal */}
      <Modal isOpen={!!studentModalData} onClose={() => setStudentModalData(null)} title={`Enrolled Students: ${studentModalData?.name}`}>
        {isLoadingStudents ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading students...</div>
        ) : enrolledStudents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students are enrolled in this class.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {enrolledStudents.map(student => (
              <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
                  {student.avatar_url ? (
                    <img src={student.avatar_url} alt={student.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{student.name.charAt(0)}</div>
                  )}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: '#fff', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.email}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button type="button" className="btn btn-primary" onClick={() => setStudentModalData(null)}>Close</button>
        </div>
      </Modal>

      {/* Full Report Modal */}
      <Modal isOpen={!!reportModalData} onClose={() => setReportModalData(null)} title={`Full Report: ${reportModalData?.name}`}>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '15px' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Overall Status</h4>
            <div style={{ fontSize: '20px', color: '#fff', fontWeight: 'bold' }}>{reportModalData?.status}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="glass-panel" style={{ padding: '15px' }}>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Attendance</h4>
              <div style={{ fontSize: '24px', color: 'var(--accent-cyan)' }}>{reportModalData?.avgAttendance}%</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Top 10% in school</p>
            </div>
            <div className="glass-panel" style={{ padding: '15px' }}>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Test Averages</h4>
              <div style={{ fontSize: '24px', color: 'var(--accent-purple)' }}>{reportModalData?.avgScore}%</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Requires improvement</p>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '15px' }}>
            <h4 style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Recent Assessments</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#fff' }}>Mid-term Math</span>
              <span style={{ color: '#10B981' }}>88% Avg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px', marginBottom: '8px' }}>
              <span style={{ color: '#fff' }}>Science Quiz</span>
              <span style={{ color: '#F59E0B' }}>72% Avg</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff' }}>English Essay</span>
              <span style={{ color: '#10B981' }}>85% Avg</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost">Download PDF</button>
          <button className="btn btn-primary" onClick={() => setReportModalData(null)}>Close</button>
        </div>
      </Modal>

    </div>
  );
}
