import React, { useState } from 'react';
import Card from '../components/Card';
import { Video, Mic, MonitorUp, Users, FileText, CheckCircle, LogIn, Link as LinkIcon, ExternalLink, Loader2 } from 'lucide-react';
import CreateMCQTest from '../components/CreateMCQTest';
import CreateQATest from '../components/CreateQATest';
import { useGoogleLogin } from '@react-oauth/google';

export default function LiveClass() {
  const [activeTab, setActiveTab] = useState('live'); // 'live' | 'tests'
  const [testCreationMode, setTestCreationMode] = useState(null); // null | 'mcq' | 'qa'
  
  // Google Meet State
  const [accessToken, setAccessToken] = useState(null);
  const [meetLink, setMeetLink] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setAccessToken(codeResponse.access_token);
      setErrorMsg(null);
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setErrorMsg("Failed to sign in with Google.");
    },
    scope: 'https://www.googleapis.com/auth/calendar.events',
  });

  const generateMeetLink = async () => {
    if (!accessToken) return;
    setIsGenerating(true);
    setErrorMsg(null);

    // Create an event starting now, ending in 1 hour
    const start = new Date();
    const end = new Date();
    end.setHours(end.getHours() + 1);

    const event = {
      summary: 'Live Class: Physics 9-B',
      description: 'Automatically generated Google Meet for Live Class.',
      start: {
        dateTime: start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(7),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Failed to create event");
      }

      if (data.hangoutLink) {
        setMeetLink(data.hangoutLink);
      } else {
        throw new Error("No Meet link returned. Ensure Calendar API is enabled for this project.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred while generating the link.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'live') {
      setTestCreationMode(null);
    }
  };

  return (
    <div className="view-container animate-fade-in" style={{ paddingBottom: '50px' }}>
      <div className="view-header flex-between">
        <div>
          <h1>Live Class & Tests</h1>
          <p>Host live sessions and monitor active tests.</p>
        </div>
        
        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '5px' }}>
          <button 
            onClick={() => handleTabChange('live')}
            style={{
              padding: '8px 20px', borderRadius: '25px', border: 'none',
              background: activeTab === 'live' ? 'var(--accent-blue)' : 'transparent',
              color: activeTab === 'live' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s'
            }}
          >
            Live Classes
          </button>
          <button 
            onClick={() => handleTabChange('tests')}
            style={{
              padding: '8px 20px', borderRadius: '25px', border: 'none',
              background: activeTab === 'tests' ? 'var(--accent-purple)' : 'transparent',
              color: activeTab === 'tests' ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s'
            }}
          >
            Tests
          </button>
        </div>
      </div>

      {activeTab === 'live' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }} className="animate-fade-in">
          <Card title="Active Session: Physics 9-B">
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--panel-border)', padding: '30px', textAlign: 'center' }}>
              
              {/* Google Meet Flow */}
              {!accessToken ? (
                <>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Video size={40} color="var(--accent-blue)" />
                  </div>
                  <h2 style={{ margin: '0 0 10px 0' }}>Start a Live Class</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', maxWidth: '400px' }}>
                    Sign in with your Google Workspace account to instantly generate a Google Meet link for your students.
                  </p>
                  <button onClick={() => login()} className="btn btn-primary" style={{ padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <LogIn size={20} /> Sign in with Google
                  </button>
                </>
              ) : !meetLink ? (
                <>
                   <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <CheckCircle size={40} color="#34c759" />
                  </div>
                  <h2 style={{ margin: '0 0 10px 0' }}>Authenticated Successfully</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
                    You are signed in. Click below to generate the Meet link for this session.
                  </p>
                  
                  {errorMsg && (
                    <div style={{ padding: '10px 15px', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid #ff3b30', borderRadius: '8px', color: '#ff3b30', marginBottom: '20px', fontSize: '14px' }}>
                      {errorMsg}
                    </div>
                  )}

                  <button onClick={generateMeetLink} disabled={isGenerating} className="btn" style={{ padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--accent-cyan)', color: 'black', fontWeight: 'bold', opacity: isGenerating ? 0.7 : 1 }}>
                    {isGenerating ? <Loader2 size={20} className="spinner" /> : <LinkIcon size={20} />} 
                    {isGenerating ? 'Generating...' : 'Generate Google Meet Link'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Video size={50} color="var(--accent-gold)" />
                  </div>
                  <h2 style={{ margin: '0 0 10px 0', color: 'var(--accent-gold)' }}>Live Class is Ready!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    The Meet link has been generated and distributed to your students.
                  </p>
                  
                  <div style={{ padding: '15px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px', border: '1px dashed var(--panel-border)' }}>
                    <code style={{ fontSize: '16px', color: 'var(--accent-cyan)' }}>{meetLink}</code>
                  </div>

                  <a href={meetLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '15px 30px', display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', fontSize: '16px' }}>
                    <ExternalLink size={20} /> Join Google Meet
                  </a>
                </>
              )}
            </div>
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="Participants">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Users size={18} color="var(--accent-cyan)" />
                <span>24 / 28 Students Present</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                {['John D.', 'Sarah M.', 'Michael B.', 'Emma W.', 'Alex K.'].map((student, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{student}</span>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759', alignSelf: 'center' }}></span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="Active Tests">
              <div style={{ padding: '15px', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-gold)' }}>Physics Midterm</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>15/28 submitted</p>
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '10px', borderRadius: '2px' }}>
                  <div style={{ width: '53%', height: '100%', background: 'var(--accent-gold)', borderRadius: '2px' }}></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : testCreationMode === 'mcq' ? (
        <CreateMCQTest onCancel={() => setTestCreationMode(null)} />
      ) : testCreationMode === 'qa' ? (
        <CreateQATest onCancel={() => setTestCreationMode(null)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }} className="animate-fade-in">
          <Card title="Create a Test">
             <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <button onClick={() => setTestCreationMode('mcq')} className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '15px', border: '1px dashed var(--accent-cyan)' }}>
                  <CheckCircle size={20} color="var(--accent-cyan)" />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Multiple Choice (MCQ)</h4>
                    <p style={{ margin: '5px 0 0', fontSize: '12px' }}>Auto-graded quiz</p>
                  </div>
                </button>
                <button onClick={() => setTestCreationMode('qa')} className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '15px', border: '1px dashed var(--accent-purple)' }}>
                  <FileText size={20} color="var(--accent-purple)" />
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Question / Answer</h4>
                    <p style={{ margin: '5px 0 0', fontSize: '12px' }}>Long form essay style</p>
                  </div>
                </button>
             </div>
          </Card>

          <Card title="Manage Tests">
             <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ padding: '15px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Physics Midterm (MCQ)</h4>
                    <p style={{ margin: '5px 0 0', fontSize: '13px' }}>Assigned to: Class 9-B • Due: Today</p>
                  </div>
                  <span style={{ padding: '5px 10px', borderRadius: '15px', background: 'rgba(255, 215, 0, 0.1)', color: 'var(--accent-gold)', fontSize: '12px', fontWeight: 'bold' }}>Active</span>
                </li>
                <li style={{ padding: '15px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Math Pop Quiz (Q/A)</h4>
                    <p style={{ margin: '5px 0 0', fontSize: '13px' }}>Assigned to: Class 10-A • Due: Tomorrow</p>
                  </div>
                  <span style={{ padding: '5px 10px', borderRadius: '15px', background: 'rgba(0, 229, 255, 0.1)', color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 'bold' }}>Draft</span>
                </li>
             </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
