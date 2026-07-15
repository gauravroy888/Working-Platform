import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Video, FileText, CheckCircle, ExternalLink, Play, Clock, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../supabase';

export default function LiveClass() {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'upcoming' | 'tests'
  const [activeLiveClasses, setActiveLiveClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Test Taking State
  const [activeTest, setActiveTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // 'saved', 'saving', ''
  const autoSaveTimer = React.useRef(null);

  useEffect(() => {
    fetchActiveClasses();
    fetchUpcomingClasses();
    fetchTests();
  }, []);

  const fetchActiveClasses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('live_classes')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (data && !error) setActiveLiveClasses(data);
    setIsLoading(false);
  };

  const fetchUpcomingClasses = async () => {
    const { data, error } = await supabase
      .from('live_classes')
      .select('*')
      .eq('status', 'scheduled')
      .order('start_time', { ascending: true });
    
    if (data && !error) setUpcomingClasses(data);
  };

  const fetchTests = async () => {
    const { data, error } = await supabase.from('tests').select('*').order('created_at', { ascending: false });
    if (data && !error) setAvailableTests(data);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveTest(null);
    if (tab === 'active') fetchActiveClasses();
    else if (tab === 'upcoming') fetchUpcomingClasses();
    else fetchTests();
  };

  const startTest = (test) => {
    // Restore any saved draft answers from localStorage
    const draftKey = `test_draft_${test.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    const restoredAnswers = savedDraft ? JSON.parse(savedDraft) : {};
    setActiveTest(test);
    setAnswers(restoredAnswers);
    if (savedDraft) setAutoSaveStatus('Draft restored!');
  };

  // Auto-save answers to localStorage every time answers change
  const handleAnswerChange = (questionId, value) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    // Debounced auto-save
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaveStatus('Saving...');
    autoSaveTimer.current = setTimeout(() => {
      if (activeTest) {
        localStorage.setItem(`test_draft_${activeTest.id}`, JSON.stringify(updated));
        setAutoSaveStatus('Draft saved ✓');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    }, 1000);
  };

  const submitTest = async () => {
    if (!activeTest) return;
    setIsSubmitting(true);

    try {
      let score = 0;
      if (activeTest.type === 'mcq') {
        activeTest.questions.forEach((q) => {
          const selectedOptId = answers[q.id];
          const correctOpt = q.options.find(o => o.isCorrect);
          if (correctOpt && selectedOptId === correctOpt.id) score++;
        });
      }

      const currentUser = JSON.parse(localStorage.getItem('edtech_user') || '{}');
      
      const { error } = await supabase.from('test_submissions').insert({
        test_id: activeTest.id,
        student_email: currentUser.email || 'student@example.com',
        score: score,
        answers: answers,
        submitted_at: new Date().toISOString()
      });

      if (error) throw error;
      
      // Clear saved draft after successful submission
      localStorage.removeItem(`test_draft_${activeTest.id}`);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

      alert(`Test submitted! Your score: ${score}/${activeTest.questions?.length || 0}`);
      setActiveTest(null);
      setAutoSaveStatus('');
    } catch (err) {
      alert('Failed to submit test: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '8px', 
    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', 
    color: 'white', marginBottom: '15px'
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px' }}>
      <div className="view-header flex-between">
        <div>
          <h1>Live Classes & Tests</h1>
          <p>Join active sessions, view upcoming schedules, and take assigned tests.</p>
        </div>
        
        {/* Tab Switcher */}
        {!activeTest && (
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '5px' }}>
            <button 
              onClick={() => handleTabChange('active')}
              style={{
                padding: '8px 20px', borderRadius: '25px', border: 'none',
                background: activeTab === 'active' ? 'var(--accent-cyan)' : 'transparent',
                color: activeTab === 'active' ? '#000' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s'
              }}
            >
              Active Session
            </button>
            <button 
              onClick={() => handleTabChange('upcoming')}
              style={{
                padding: '8px 20px', borderRadius: '25px', border: 'none',
                background: activeTab === 'upcoming' ? 'var(--accent-blue)' : 'transparent',
                color: activeTab === 'upcoming' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s'
              }}
            >
              Upcoming
            </button>
            <button 
              onClick={() => handleTabChange('tests')}
              style={{
                padding: '8px 20px', borderRadius: '25px', border: 'none',
                background: activeTab === 'tests' ? 'var(--accent-purple)' : 'transparent',
                color: activeTab === 'tests' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s'
              }}
            >
              Assigned Tests
            </button>
          </div>
        )}
      </div>

      {activeTest ? (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2>{activeTest.title}</h2>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {autoSaveStatus && <span style={{ color: 'var(--accent-cyan)', fontSize: '13px', fontWeight: '500' }}>{autoSaveStatus}</span>}
              <button className="btn btn-ghost" onClick={() => setActiveTest(null)}><X size={16} /> Cancel</button>
              <button className="btn btn-primary" onClick={submitTest} disabled={isSubmitting}>
                <Save size={16} /> {isSubmitting ? 'Submitting...' : 'Submit Test'}
              </button>
            </div>
          </div>

          {activeTest.type === 'mcq' ? (
             activeTest.questions?.map((q, i) => (
               <Card key={q.id} style={{ marginBottom: '20px' }}>
                 <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>{i + 1}. {q.text}</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   {q.options?.map(opt => (
                     <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', cursor: 'pointer', border: answers[q.id] === opt.id ? '1px solid var(--accent-cyan)' : '1px solid transparent' }}>
                       <input 
                         type="radio" 
                         name={`q-${q.id}`} 
                         value={opt.id}
                         checked={answers[q.id] === opt.id}
                         onChange={() => handleAnswerChange(q.id, opt.id)}
                         style={{ accentColor: 'var(--accent-cyan)', width: '18px', height: '18px' }}
                       />
                       <span>{opt.text}</span>
                     </label>
                   ))}
                 </div>
               </Card>
             ))
          ) : (
            activeTest.questions?.map((q, i) => (
               <Card key={q.id} style={{ marginBottom: '20px' }}>
                 <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-primary)' }}>{i + 1}. {q.text}</h4>
                 <textarea 
                   style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }} 
                   placeholder="Type your answer here..."
                   value={answers[q.id] || ''}
                   onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                 ></textarea>
               </Card>
            ))
          )}
        </div>
      ) : activeTab === 'active' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="animate-fade-in">
          <Card title="Currently Active Classes">
            {isLoading ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>Checking for active classes...</div>
            ) : activeLiveClasses.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <Video size={48} color="var(--text-secondary)" style={{ marginBottom: '15px', opacity: 0.5 }} />
                <div style={{ padding: '30px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>There are no online classes happening right now. Check the Upcoming tab for your schedule.</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {activeLiveClasses.map(cls => (
                  <div key={cls.id} style={{ padding: '20px', background: 'rgba(0, 240, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)', animation: 'pulse 2s infinite' }}></div>
                      <h3 style={{ margin: 0, color: 'var(--accent-cyan)' }}>{cls.title}</h3>
                    </div>
                    <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Instructor: {cls.created_by}</p>
                    <p style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>Target: {cls.class_name}</p>
                    <a href={cls.meet_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '12px', width: '100%', boxSizing: 'border-box' }}>
                      <ExternalLink size={18} /> Join Meeting Now
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      ) : activeTab === 'upcoming' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="animate-fade-in">
          <Card title="Upcoming Scheduled Classes">
             {upcomingClasses.length === 0 ? (
               <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                 <CalendarIcon size={48} color="var(--text-secondary)" style={{ marginBottom: '15px', opacity: 0.5 }} />
                 <h2 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>No Upcoming Classes</h2>
                 <p style={{ margin: 0, color: 'var(--text-secondary)' }}>You don't have any scheduled classes at the moment.</p>
               </div>
             ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                 {upcomingClasses.map(cls => {
                   const startObj = new Date(cls.start_time);
                   const endObj = new Date(cls.end_time);
                   const isToday = startObj.toDateString() === new Date().toDateString();
                   
                   return (
                     <div key={cls.id} style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                       <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>{cls.title}</h3>
                       <p style={{ margin: '0 0 15px 0', color: 'var(--accent-blue)', fontSize: '14px', fontWeight: 'bold' }}>Target: {cls.class_name}</p>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <CalendarIcon size={16} /> 
                           {isToday ? 'Today' : startObj.toLocaleDateString()}
                         </span>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Clock size={16} /> 
                           {startObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {endObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                       </div>
                       <button disabled className="btn" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px', width: '100%', boxSizing: 'border-box', background: 'transparent', border: '1px dashed var(--text-secondary)', color: 'var(--text-secondary)', cursor: 'not-allowed' }}>
                         Waiting for Teacher...
                       </button>
                     </div>
                   );
                 })}
               </div>
             )}
          </Card>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }} className="animate-fade-in">
          <Card title="Available Tests">
             {availableTests.length === 0 ? (
               <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)' }}>No tests assigned to you at the moment.</div>
             ) : (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                 {availableTests.map(test => {
                   const now = new Date();
                   const startTime = test.start_time ? new Date(test.start_time) : null;
                   const endTime = test.end_time ? new Date(test.end_time) : null;
                   
                   let buttonState = 'available';
                   let buttonText = 'Take Test';
                   
                   if (startTime && now < startTime) {
                     buttonState = 'locked';
                     buttonText = `Opens ${startTime.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}`;
                   } else if (endTime && now > endTime) {
                     buttonState = 'closed';
                     buttonText = 'Test Closed';
                   }

                   return (
                     <div key={test.id} style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                          <FileText size={20} color="var(--accent-purple)" />
                          <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{test.title}</h3>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <Clock size={14} /> <span>{test.duration ? `${test.duration} mins` : 'Unlimited time'}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <CheckCircle size={14} /> <span>{test.questions?.length || 0} Questions ({test.type.toUpperCase()})</span>
                       </div>
                       
                       {startTime && endTime && (
                         <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', borderLeft: buttonState === 'available' ? '2px solid var(--accent-purple)' : '2px solid var(--text-secondary)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px' }}>
                             <CalendarIcon size={12} color={buttonState === 'available' ? "var(--accent-purple)" : "var(--text-secondary)"} />
                             <span style={{ fontWeight: 'bold' }}>Opens:</span> {startTime.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                             <Clock size={12} color={buttonState === 'available' ? "var(--accent-purple)" : "var(--text-secondary)"} />
                             <span style={{ fontWeight: 'bold' }}>Closes:</span> {endTime.toLocaleString([], {month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                           </div>
                         </div>
                       )}

                       <button 
                         onClick={() => buttonState === 'available' && startTest(test)} 
                         disabled={buttonState !== 'available'}
                         className="btn" 
                         style={{ 
                           display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '12px', width: '100%', 
                           border: buttonState === 'available' ? '1px solid var(--accent-purple)' : '1px dashed var(--text-secondary)', 
                           background: buttonState === 'available' ? 'transparent' : 'rgba(0,0,0,0.2)',
                           color: buttonState === 'available' ? 'var(--accent-purple)' : 'var(--text-secondary)',
                           cursor: buttonState === 'available' ? 'pointer' : 'not-allowed'
                         }}>
                         {buttonState === 'available' ? <Play size={16} /> : <Clock size={16} />} {buttonText}
                       </button>
                     </div>
                   );
                 })}
               </div>
             )}
          </Card>
        </div>
      )}
    </div>
  );
}
