import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, BookOpen, User, Activity, Edit3, Plus, Trash2, Clock } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import Modal from '../components/Modal';
import { supabase } from '../supabase';

export default function Teachers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacherData, setNewTeacherData] = useState({ name: '', dept: '', age: '', email: '', login_id: '', password: '', avatar_url: '' });
  const [teacherAvatarFile, setTeacherAvatarFile] = useState(null);
  const [teacherSelectedClasses, setTeacherSelectedClasses] = useState([]);
  const [teacherClassSubjects, setTeacherClassSubjects] = useState({}); // Maps classId -> string of subjects

  const [assignModalData, setAssignModalData] = useState(null);
  const [assignSelectedClasses, setAssignSelectedClasses] = useState([]);
  const [assignClassSubjects, setAssignClassSubjects] = useState({});
  const [assignTimetable, setAssignTimetable] = useState([]);

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*');
    if (data) setAllClasses(data);
  };

  const fetchTeachers = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'teacher');
    if (!profiles) return;

    const { data: links } = await supabase.from('class_teachers').select('*, classes(name)');
    
    const formatted = profiles.map(p => {
      const assigned = links?.filter(l => l.teacher_id === p.id).map(l => {
        return l.subjects ? `${l.classes?.name} (${l.subjects})` : l.classes?.name;
      }) || [];
      return {
        id: p.id,
        name: p.name,
        dept: p.department || 'General',
        classes: assigned,
        raw_classes: links?.filter(l => l.teacher_id === p.id) || [],
        timetable: p.timetable || [],
        progress: 0,
        tests: 0,
        performance: 'New',
        avatar: p.avatar_url
      };
    });
    setTeachers(formatted);
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacherData.name || !newTeacherData.login_id || !newTeacherData.password) return;

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.innerText = 'Creating...'; btn.disabled = true; }

    try {
      let finalAvatarUrl = newTeacherData.avatar_url || null;

      if (teacherAvatarFile) {
        const fileExt = teacherAvatarFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('avatars').upload(fileName, teacherAvatarFile);
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
          name: newTeacherData.name,
          login_id: newTeacherData.login_id,
          password: newTeacherData.password,
          role: 'teacher',
          email: newTeacherData.email || null,
          age: newTeacherData.age || null,
          department: newTeacherData.dept || null,
          avatar_url: finalAvatarUrl,
          class_ids: teacherSelectedClasses,
          class_subjects: teacherClassSubjects
        })
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        alert('Error adding teacher: ' + (result.error || 'Unknown error'));
        return;
      }

      setNewTeacherData({ name: '', dept: '', age: '', email: '', login_id: '', password: '', avatar_url: '' });
      setTeacherAvatarFile(null);
      setTeacherSelectedClasses([]);
      setTeacherClassSubjects({});
      setIsModalOpen(false);
      fetchTeachers();
      alert('Teacher added successfully! They can now log in securely.');
    } finally {
      if (btn) { btn.innerText = 'Save Teacher'; btn.disabled = false; }
    }
  };

  const openAssignModal = (teacher) => {
    setAssignModalData(teacher);
    const selected = [];
    const subjects = {};
    teacher.raw_classes.forEach(l => {
      selected.push(l.class_id);
      if (l.subjects) subjects[l.class_id] = l.subjects;
    });
    setAssignSelectedClasses(selected);
    setAssignClassSubjects(subjects);
    
    // Ensure timetable slots have unique IDs for React keys
    const parsedTimetable = (Array.isArray(teacher.timetable) ? teacher.timetable : []).map(slot => ({
      ...slot,
      id: slot.id || Math.random().toString(36).substr(2, 9)
    }));
    setAssignTimetable(parsedTimetable);
  };

  const addTimetableSlot = () => {
    setAssignTimetable([...assignTimetable, { id: Math.random().toString(36).substr(2, 9), day: 'Monday', startTime: '09:00', endTime: '10:00', activity: '' }]);
  };
  
  const updateTimetableSlot = (id, field, value) => {
    setAssignTimetable(assignTimetable.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
  };

  const removeTimetableSlot = (id) => {
    setAssignTimetable(assignTimetable.filter(slot => slot.id !== id));
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    if (!assignModalData) return;
    
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.innerText = 'Saving...'; btn.disabled = true; }
    
    try {
      // Determine the main department from the first subject assigned, or default
      const deptList = Object.values(assignClassSubjects).filter(Boolean);
      const newDept = deptList.length > 0 ? deptList[0] : 'General';

      // 1. Update Profiles table (timetable JSON and dept)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          department: newDept,
          timetable: assignTimetable 
        })
        .eq('id', assignModalData.id);
        
      if (profileError) throw profileError;

      // 2. Clear old classes
      await supabase.from('class_teachers').delete().eq('teacher_id', assignModalData.id);

      // 3. Insert new classes
      if (assignSelectedClasses.length > 0) {
        const insertData = assignSelectedClasses.map(classId => ({
          teacher_id: assignModalData.id,
          class_id: classId,
          subjects: assignClassSubjects[classId] || null
        }));
        
        const { error: classesError } = await supabase.from('class_teachers').insert(insertData);
        if (classesError) throw classesError;
      }

      setAssignModalData(null);
      fetchTeachers();
      alert('Assignments and Timetable saved successfully!');
    } catch (err) {
      alert('Error saving assignments: ' + err.message);
    } finally {
      if (btn) { btn.innerText = 'Save Assignments'; btn.disabled = false; }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 className="text-gradient">Teacher Directory & Performance</h1>
      <p style={{ marginBottom: '30px' }}>Monitor teacher assignments, syllabus progress, and test performance.</p>

      <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search teachers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              background: 'rgba(0,0,0,0.3)', 
              border: '1px solid var(--panel-border)', 
              color: '#fff', 
              padding: '10px 10px 10px 40px', 
              borderRadius: '8px',
              outline: 'none'
            }}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add New Teacher</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {teachers.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).map(teacher => (
          <div key={teacher.id} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
              {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', background: 'var(--accent-cyan)' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                  {teacher.name.split(' ').map(n => n[0]).join('').substring(0,2)}
                </div>
              )}
              <div>
                <h3 style={{ color: '#fff', margin: 0 }}>{teacher.name}</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{teacher.dept}</span>
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Assigned Classes</div>
              <div style={{ color: '#fff', fontSize: '14px' }}>{teacher.classes.join(', ') || 'None'}</div>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Syllabus Progress</div>
              <ProgressBar progress={teacher.progress} label={`${teacher.progress}%`} />
            </div>

            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Tests Conducted</div>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>{teacher.tests}</div>
            </div>

            <div style={{ flex: 1, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <span style={{ 
                padding: '4px 10px', 
                borderRadius: '12px', 
                fontSize: '12px', 
                background: teacher.progress >= 75 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: teacher.progress >= 75 ? '#10B981' : '#F59E0B'
              }}>
                {teacher.performance}
              </span>
              <button 
                className="btn btn-ghost" 
                style={{ padding: '6px 12px', fontSize: '13px' }}
                onClick={() => openAssignModal(teacher)}
              >
                <Edit3 size={14} style={{ marginRight: '4px' }}/> Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Teacher Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel animate-scale-in" style={{ width: '90%', maxWidth: '600px', background: '#0B1120', border: '1px solid var(--panel-border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Add New Teacher</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleAddTeacher}>
              <div style={{ padding: '25px', maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Full Name</label>
                    <input type="text" required value={newTeacherData.name} onChange={e => setNewTeacherData({...newTeacherData, name: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Department / Subject</label>
                    <input type="text" required value={newTeacherData.dept} onChange={e => setNewTeacherData({...newTeacherData, dept: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Login ID (e.g. Teacher ID)</label>
                    <input type="text" required value={newTeacherData.login_id} onChange={e => setNewTeacherData({...newTeacherData, login_id: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Password</label>
                    <input type="text" required value={newTeacherData.password} onChange={e => setNewTeacherData({...newTeacherData, password: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Gmail ID</label>
                    <input type="email" required value={newTeacherData.email} onChange={e => setNewTeacherData({...newTeacherData, email: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                  <div className="form-group">
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Age</label>
                    <input type="number" required value={newTeacherData.age} onChange={e => setNewTeacherData({...newTeacherData, age: e.target.value})} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Profile Picture</label>
                  <input type="file" accept="image/*" onChange={e => setTeacherAvatarFile(e.target.files[0])} 
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white' }}/>
                  <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>OR</div>
                  <input type="url" placeholder="Image URL (if not uploading a file)" value={newTeacherData.avatar_url} onChange={e => setNewTeacherData({...newTeacherData, avatar_url: e.target.value})} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: 'white', marginTop: '10px' }}/>
                </div>
                
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Assign to Classes</label>
                    <span style={{ fontSize: '12px', background: 'var(--accent-cyan)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{teacherSelectedClasses.length} Selected</span>
                  </div>
                  
                  <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                    {allClasses.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No classes available.</div>
                    ) : (
                      allClasses.map(cls => (
                        <div key={cls.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={teacherSelectedClasses.includes(cls.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTeacherSelectedClasses([...teacherSelectedClasses, cls.id]);
                                } else {
                                  setTeacherSelectedClasses(teacherSelectedClasses.filter(id => id !== cls.id));
                                  const newSubjects = { ...teacherClassSubjects };
                                  delete newSubjects[cls.id];
                                  setTeacherClassSubjects(newSubjects);
                                }
                              }}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
                            />
                            <div style={{ color: '#fff', fontWeight: '500' }}>{cls.name}</div>
                          </label>
                          {teacherSelectedClasses.includes(cls.id) && (
                            <div style={{ padding: '0 15px 15px 48px', animation: 'fadeIn 0.2s ease' }}>
                              <select 
                                value={teacherClassSubjects[cls.id] || ''}
                                onChange={(e) => setTeacherClassSubjects({...teacherClassSubjects, [cls.id]: e.target.value})}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', fontSize: '13px', outline: 'none' }}
                              >
                                <option value="">-- Select a Subject --</option>
                                {cls.subject ? cls.subject.split(',').map(sub => sub.trim()).filter(Boolean).map((sub, idx) => (
                                  <option key={idx} value={sub}>{sub}</option>
                                )) : (
                                  <option value="" disabled>No subjects available for this class</option>
                                )}
                              </select>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div style={{ padding: '20px 25px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: 'rgba(0,0,0,0.2)' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 25px', background: 'var(--accent-cyan)', color: '#000' }}>Save Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Modal isOpen={!!assignModalData} onClose={() => setAssignModalData(null)} title={`Assign Work: ${assignModalData?.name}`}>
        <form onSubmit={handleAssignTeacher}>
          <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
            {/* Classes & Subjects */}
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 'bold' }}>Assign to Classes & Subjects</label>
                <span style={{ fontSize: '12px', background: 'var(--accent-cyan)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{assignSelectedClasses.length} Selected</span>
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {allClasses.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No classes available.</div>
                ) : (
                  allClasses.map(cls => (
                    <div key={cls.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={assignSelectedClasses.includes(cls.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignSelectedClasses([...assignSelectedClasses, cls.id]);
                            } else {
                              setAssignSelectedClasses(assignSelectedClasses.filter(id => id !== cls.id));
                              const newSubjects = { ...assignClassSubjects };
                              delete newSubjects[cls.id];
                              setAssignClassSubjects(newSubjects);
                            }
                          }}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)' }}
                        />
                        <div style={{ color: '#fff', fontWeight: '500' }}>{cls.name}</div>
                      </label>
                      {assignSelectedClasses.includes(cls.id) && (
                        <div style={{ padding: '0 15px 15px 48px', animation: 'fadeIn 0.2s ease' }}>
                          <select 
                            value={assignClassSubjects[cls.id] || ''}
                            onChange={(e) => setAssignClassSubjects({...assignClassSubjects, [cls.id]: e.target.value})}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', fontSize: '13px', outline: 'none' }}
                          >
                            <option value="">-- Select a Subject --</option>
                            {cls.subject ? cls.subject.split(',').map(sub => sub.trim()).filter(Boolean).map((sub, idx) => (
                              <option key={idx} value={sub}>{sub}</option>
                            )) : (
                              <option value="" disabled>No subjects available for this class</option>
                            )}
                          </select>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timetable Builder */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 'bold' }}>Interactive Timetable</label>
                <button type="button" onClick={addTimetableSlot} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '13px', border: '1px dashed var(--accent-cyan)' }}>
                  <Plus size={14} style={{ marginRight: '4px' }} /> Add Slot
                </button>
              </div>

              {assignTimetable.length === 0 ? (
                <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px dashed var(--panel-border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Clock size={24} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <div>No slots added yet.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {assignTimetable.map((slot) => (
                    <div key={slot.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                      <select 
                        value={slot.day} 
                        onChange={(e) => updateTimetableSlot(slot.id, 'day', e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', fontSize: '13px' }}
                      >
                        <option value="Monday">Mon</option>
                        <option value="Tuesday">Tue</option>
                        <option value="Wednesday">Wed</option>
                        <option value="Thursday">Thu</option>
                        <option value="Friday">Fri</option>
                        <option value="Saturday">Sat</option>
                      </select>
                      <input 
                        type="time" 
                        value={slot.startTime} 
                        onChange={(e) => updateTimetableSlot(slot.id, 'startTime', e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', fontSize: '13px', colorScheme: 'dark' }}
                      />
                      <span style={{ color: 'var(--text-secondary)' }}>to</span>
                      <input 
                        type="time" 
                        value={slot.endTime} 
                        onChange={(e) => updateTimetableSlot(slot.id, 'endTime', e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', fontSize: '13px', colorScheme: 'dark' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Activity"
                        value={slot.activity} 
                        onChange={(e) => updateTimetableSlot(slot.id, 'activity', e.target.value)}
                        style={{ flex: 2, padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', fontSize: '13px' }}
                      />
                      <button type="button" onClick={() => removeTimetableSlot(slot.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '10px' }}>Note: This will notify the teacher of their new schedule.</small>
            </div>
          </div>
          
          <div className="modal-footer" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--panel-border)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setAssignModalData(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Assignments</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
