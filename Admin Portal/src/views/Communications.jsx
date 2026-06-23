import React, { useState, useEffect } from 'react';
import { MessageSquare, Megaphone, Send, User } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Communications() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'announcements'
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      localStorage.setItem('edtech_user', userParam);
      setCurrentUser(JSON.parse(userParam));
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      const userStr = localStorage.getItem('edtech_user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
    }
  }, []);
  
  // Chat state
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  // Fetch Conversations
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'conversations'), orderBy('updatedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = [];
      snapshot.forEach((doc) => convos.push({ id: doc.id, ...doc.data() }));
      setConversations(convos);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Fetch Messages for Active Chat
  useEffect(() => {
    if (!activeChat) return;
    const q = query(
      collection(db, `conversations/${activeChat.id}/messages`),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat || !currentUser) return;
    try {
      await addDoc(collection(db, `conversations/${activeChat.id}/messages`), {
        text: messageInput,
        senderId: currentUser.uid,
        senderName: currentUser.name || "Admin",
        createdAt: serverTimestamp()
      });
      setMessageInput('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Announcement state
  const [announcements, setAnnouncements] = useState([]);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceText, setAnnounceText] = useState('');

  // Fetch Announcements
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const anns = [];
      snapshot.forEach((doc) => anns.push({ id: doc.id, ...doc.data() }));
      setAnnouncements(anns);
    });
    return () => unsubscribe();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!announceTitle || !announceText) {
      alert("Please enter a title and message.");
      return;
    }
    if (!currentUser) {
      alert("Error: You are not logged in. Please return to the Landing Page and sign in again.");
      return;
    }
    try {
      await addDoc(collection(db, 'announcements'), {
        title: announceTitle,
        text: announceText,
        author: currentUser.name || "Admin",
        createdAt: serverTimestamp()
      });
      setAnnounceTitle('');
      setAnnounceText('');
      alert("Announcement posted successfully!");
    } catch (error) {
      console.error("Error posting announcement:", error);
      alert("Failed to post announcement: " + error.message + "\n\nCheck your Firebase Database Rules if this says 'insufficient permissions'.");
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div>
          <h1 className="text-gradient">Communications Hub</h1>
          <p>Chat with teachers/students and broadcast global announcements.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '12px' }}>
          <button 
            className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ border: 'none' }}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} /> Chat
          </button>
          <button 
            className={`btn ${activeTab === 'announcements' ? 'btn-primary' : 'btn-ghost'}`} 
            style={{ border: 'none' }}
            onClick={() => setActiveTab('announcements')}
          >
            <Megaphone size={16} /> Announcements
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {activeTab === 'chat' ? (
          <>
            {/* Chat Sidebar */}
            <div style={{ width: '300px', borderRight: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--panel-border)' }}>
                <h3 style={{ margin: 0 }}>Conversations</h3>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {conversations.length > 0 ? conversations.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setActiveChat(c)}
                    style={{ 
                      padding: '15px 20px', 
                      borderBottom: '1px solid rgba(255,255,255,0.05)', 
                      cursor: 'pointer',
                      background: activeChat?.id === c.id ? 'rgba(0, 229, 255, 0.1)' : 'transparent'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#fff', fontWeight: 500 }}>{c.name || "Unknown"}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.lastMessage || "No messages yet"}
                    </div>
                  </div>
                )) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No conversations found.
                  </div>
                )}
              </div>
            </div>

            {/* Chat Window */}
            {activeChat ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={24} color="var(--accent-cyan)" />
                  <h3 style={{ margin: 0 }}>{activeChat.name}</h3>
                </div>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {messages.map((msg) => {
                    const isMe = currentUser && msg.senderId === currentUser.uid;
                    return (
                      <div key={msg.id} style={{ 
                        alignSelf: isMe ? 'flex-end' : 'flex-start', 
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{ 
                          background: isMe ? 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))' : 'rgba(255,255,255,0.1)',
                          color: '#fff', 
                          padding: '12px 16px', 
                          borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0' 
                        }}>
                          {msg.text}
                        </div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                          {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: '1px solid var(--panel-border)', display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type your message..." 
                    style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '8px', outline: 'none' }} 
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', borderRadius: '8px' }}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Select a conversation to start chatting.
              </div>
            )}
          </>
        ) : (
          /* Announcements Section */
          <div style={{ flex: 1, display: 'flex', padding: '20px', gap: '30px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '20px' }}>Recent Announcements</h3>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {announcements.length > 0 ? announcements.map(ann => (
                  <div key={ann.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--accent-purple)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ color: '#fff', margin: 0 }}>{ann.title}</h4>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {ann.createdAt?.toDate ? ann.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Just now'}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{ann.text}</p>
                  </div>
                )) : (
                  <div style={{ color: 'var(--text-secondary)' }}>No announcements yet.</div>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', padding: '20px', borderRadius: '12px' }}>
                <h3 style={{ marginBottom: '20px' }}>Broadcast New Announcement</h3>
                <form onSubmit={handlePostAnnouncement}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Title</label>
                    <input type="text" value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} placeholder="Enter title" required
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '8px', outline: 'none' }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Message Body</label>
                    <textarea value={announceText} onChange={e => setAnnounceText(e.target.value)} rows="5" placeholder="Write your announcement..." required
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-border)', color: '#fff', borderRadius: '8px', outline: 'none', resize: 'vertical' }}></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Post Announcement</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
