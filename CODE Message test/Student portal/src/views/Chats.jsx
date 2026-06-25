import React, { useState, useEffect } from 'react';
import { Search, Plus, Phone, Video, MoreVertical, FileText, Download, Send } from 'lucide-react';
import Card from '../components/Card';
import './Chats.css';

// Supabase imports
import { supabase } from '../supabase';

export default function Chats() {
  const [activeTab, setActiveTab] = useState('direct'); // 'direct' | 'group' | 'class' | 'announcements'
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  // Current logged in user from localStorage (set by Landing Page)
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

  // Fetch Announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase.from('announcements').select('*').order('createdAt', { ascending: false });
      if (data) setAnnouncements(data);
    };
    
    fetchAnnouncements();
    
    const subscription = supabase.channel('student_announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchAnnouncements)
      .subscribe();
      
    return () => { supabase.removeChannel(subscription); };
  }, []);

  // Fetch Chat List (Conversations the user is part of)
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchConversations = async () => {
      const { data } = await supabase.from('conversations').select('*').order('updatedAt', { ascending: false });
      if (data) {
        setChats(data);
        if (!activeChat && data.length > 0 && activeTab !== 'announcements') {
          setActiveChat(data[0]);
        }
      }
    };
    
    fetchConversations();
    
    const subscription = supabase.channel('student_conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, fetchConversations)
      .subscribe();
      
    return () => { supabase.removeChannel(subscription); };
  }, [currentUser, activeTab]);

  // Fetch Messages for Active Chat
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').eq('conversationId', activeChat.id).order('createdAt', { ascending: true });
      if (data) setMessages(data);
    };
    
    fetchMessages();
    
    const subscription = supabase.channel('student_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversationId=eq.${activeChat.id}` }, fetchMessages)
      .subscribe();
      
    return () => { supabase.removeChannel(subscription); };
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !currentUser) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversationId: activeChat.id,
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.name || "Student",
      });
      if (error) throw error;
      
      await supabase.from('conversations').update({ lastMessage: newMessage, updatedAt: new Date() }).eq('id', activeChat.id);
      
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="view-container">
      <div className="chats-layout">
        
        {/* Chats Sidebar */}
        <Card className="chats-sidebar">
          <div className="chat-type-switcher" style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            <button className={`switcher-btn ${activeTab === 'direct' ? 'active' : ''}`} onClick={() => { setActiveTab('direct'); if(chats.length>0) setActiveChat(chats[0]); }}>Direct</button>
            <button className={`switcher-btn ${activeTab === 'group' ? 'active' : ''}`} onClick={() => setActiveTab('group')}>Group</button>
            <button className={`switcher-btn ${activeTab === 'class' ? 'active' : ''}`} onClick={() => setActiveTab('class')}>Class</button>
            <button className={`switcher-btn ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => { setActiveTab('announcements'); setActiveChat(null); }}>Announcements</button>
          </div>
          
          <div className="chats-header-row" style={{ marginTop: '10px' }}>
            <h3>{activeTab === 'announcements' ? 'Updates' : 'Recent Chats'}</h3>
            {activeTab !== 'announcements' && <button className="icon-btn" onClick={() => alert("Create new chat functionality here")}><Plus size={18} /></button>}
          </div>
          
          <div className="chats-list">
            {activeTab === 'announcements' ? (
               <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                 <p>Viewing Announcements...</p>
               </div>
            ) : chats.length > 0 ? chats.map((chat) => (
              <div 
                key={chat.id} 
                className={`chat-list-item ${activeChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="mentor-avatar">
                  <img src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name || 'Chat'}`} alt={chat.name} />
                  {!chat.isGroup && <span className={`status-dot online`}></span>}
                </div>
                <div className="chat-list-info">
                  <div className="chat-list-top">
                    <h5 className="chat-list-name">{chat.name}</h5>
                  </div>
                  <p className="chat-list-msg">{chat.lastMessage}</p>
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                <p>No chats found.</p>
                <p style={{fontSize: '0.8rem'}}>Ensure Supabase is configured and DB has data.</p>
              </div>
            )}
          </div>
        </Card>
        
        {/* Active Chat Window */}
        {activeTab === 'announcements' ? (
          <Card className="active-chat" style={{ padding: '30px', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Global Announcements</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {announcements.length > 0 ? announcements.map(ann => (
                <div key={ann.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid var(--primary-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h4 style={{ color: '#fff', margin: 0 }}>{ann.title}</h4>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>
                      {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Just now'}
                    </span>
                  </div>
                  <p style={{ color: '#ccc', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{ann.text}</p>
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#aaa' }}>Posted by: {ann.author}</div>
                </div>
              )) : (
                <div style={{ color: '#aaa', textAlign: 'center', padding: '40px' }}>No announcements yet.</div>
              )}
            </div>
          </Card>
        ) : activeChat ? (
        <Card className="active-chat">
          <div className="active-chat-header">
            <div className="chat-user-info">
              <div className="mentor-avatar">
                <img src={activeChat.avatar || `https://ui-avatars.com/api/?name=${activeChat.name}`} alt="User" />
                <span className="status-dot online"></span>
              </div>
              <div>
                <h4>{activeChat.name}</h4>
                <span className="status-text online">Online</span>
              </div>
            </div>
            <div className="chat-window-actions">
              <button className="icon-btn"><Phone size={18} /></button>
              <button className="icon-btn"><Video size={18} /></button>
              <button className="icon-btn"><MoreVertical size={18} /></button>
            </div>
          </div>
          
          <div className="chat-messages-area" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg) => {
              const isMe = currentUser && msg.senderId === currentUser.uid;
              return (
                <div key={msg.id} className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}>
                  {!isMe && <img src={`https://ui-avatars.com/api/?name=${msg.senderName}`} alt="User" className="msg-avatar" />}
                  <div className="bubble-wrapper" style={{ alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div className={`chat-bubble ${isMe ? 'primary' : ''}`}>
                      {msg.text}
                    </div>
                    {msg.createdAt && (
                      <span className="msg-time-inline">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Sending...'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <form className="chat-input-area chat-main-input" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="chat-input" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="send-btn"><Send size={18} /></button>
          </form>
        </Card>
        ) : (
          <Card className="active-chat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Select a chat to start messaging</p>
          </Card>
        )}
      </div>
    </div>
  );
}
