// Messages Component
// Path: src/frontend/components/messages/Messages.jsx
// Purpose: Real-time messaging interface with conversation list and chat view

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import './Message.css';

const Messages = () => {
  const navigate = useNavigate();
  const { userId: urlUserId } = useParams();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [newMatches, setNewMatches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [userSeeds, setUserSeeds] = useState(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const currentUserId = JSON.parse(localStorage.getItem('user'))?._id;

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    const serverUrl = window.location.hostname === 'localhost' 
      ? 'http://localhost:5000' 
      : 'https://www.wallflower.me';
    
    const newSocket = io(serverUrl, {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join_user_room', currentUserId);
    });

    newSocket.on('new_message', (data) => {
      if (data.conversationId === getConversationId(currentUserId, selectedUser?._id)) {
        setMessages(prev => [...prev, data.message]);
        markMessagesAsRead(data.conversationId);
      }
      updateConversationList();
    });

    newSocket.on('messages_read', (data) => {
      if (data.conversationId === getConversationId(currentUserId, selectedUser?._id)) {
        setMessages(prev => prev.map(msg => 
          msg.sender._id === currentUserId ? { ...msg, read: true, readAt: new Date() } : msg
        ));
      }
    });

    newSocket.on('message_deleted', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      updateConversationList();
    });

    newSocket.on('user_typing', (data) => {
      if (data.userId === selectedUser?._id) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId, selectedUser]);

  // Load conversations on mount
  useEffect(() => {
    console.log('Messages component mounted');
    setLoading(false);
    
    // Directly fetch matches here to ensure it runs
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/garden', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log('Direct garden fetch:', data);
        
        if (data.success && data.garden && data.garden.matches) {
          console.log('Setting matches:', data.garden.matches);
          setNewMatches(data.garden.matches);
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };
    
    fetchMatches();
    loadUserSeeds();
  }, []);

  // If userId is in URL, load that conversation
  useEffect(() => {
    if (urlUserId) {
      // Check conversations first
      const conversation = conversations.find(conv => conv.otherUser._id === urlUserId);
      if (conversation) {
        selectConversation(conversation.otherUser);
      } else {
        // Check new matches
        const match = newMatches.find(m => m._id === urlUserId);
        if (match) {
          selectConversation(match);
        }
      }
    }
  }, [urlUserId, conversations, newMatches]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getConversationId = (userId1, userId2) => {
    if (!userId1 || !userId2) return null;
    const sortedIds = [userId1.toString(), userId2.toString()].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  };

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const loadUserSeeds = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/seeds/data', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUserSeeds(data.balance);
        setHasSubscription(data.hasActiveSubscription);
      }
    } catch (error) {
      console.error('Error loading seeds:', error);
    }
  };

  const loadNewMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/garden', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success && data.matches) {
        // Get user IDs from existing conversations
        const conversationUserIds = conversations.map(conv => conv.otherUser._id);
        
        // Filter matches to only show those without conversations
        const matchesWithoutConversations = data.matches.filter(match => 
          !conversationUserIds.includes(match._id)
        );
        
        setNewMatches(matchesWithoutConversations);
      }
    } catch (error) {
      console.error('Error loading new matches:', error);
    }
  };

  const updateConversationList = () => {
    loadConversations();
  };

  const selectConversation = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
        markMessagesAsRead(data.conversationId);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/messages/read/${conversationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      updateConversationList();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        userId: currentUserId,
        recipientId: selectedUser._id
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sending) return;

    setSending(true);
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: messageInput
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setMessageInput('');
        updateConversationList();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      alert('Please select a JPEG, PNG or WebP image');
      return;
    }

    if (file.size > maxSize) {
      alert('Image must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setShowImageModal(true);
  };

  const sendImage = async () => {
    if (!selectedImage || imageUploading) return;

    if (!hasSubscription && userSeeds < 1) {
      alert('You need 1 seed to send an image. Please purchase more seeds.');
      setShowImageModal(false);
      return;
    }

    setImageUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('receiverId', selectedUser._id);

      console.log('Sending image to:', selectedUser._id);
      console.log('Image file:', selectedImage);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/send-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
        },
        body: formData
      });

      const data = await response.json();
      console.log('Image send response:', data);
      
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setUserSeeds(data.remainingSeeds);
        updateConversationList();
        setShowImageModal(false);
        setSelectedImage(null);
        setImagePreview('');
      } else {
        alert(data.message || 'Failed to send image');
      }
    } catch (error) {
      console.error('Error sending image:', error);
      alert('Failed to send image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        updateConversationList();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now - messageDate;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return messageDate.toLocaleDateString();
  };

  if (loading && !selectedUser) {
    return (
      <div className="messages-container">
        <div className="messages-loading">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-layout">
        {/* Conversations List */}
        <div className={`conversations-sidebar ${selectedUser ? 'mobile-hidden' : ''}`}>
          <div className="conversations-header">
            <h2>Messages</h2>
          </div>
          
          {/* New Matches Section - Always show if there are matches */}
          {newMatches.length > 0 && (
            <div className="new-matches-section">
              <h3 className="new-matches-title">New Matches</h3>
              <div className="new-matches-list">
                {newMatches.map(match => (
                  <div
                    key={match._id}
                    className="new-match-item"
                    onClick={() => selectConversation(match)}
                  >
                    <div className="match-avatar">
                      {match.profile?.photos?.[0] ? (
                        <img 
                          src={match.profile.photos[0].thumbnailUrl || match.profile.photos[0].url} 
                          alt={match.username} 
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {match.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="match-name">{match.username}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Show empty state only if no matches and no conversations */}
          {conversations.length === 0 && newMatches.length === 0 ? (
            <div className="empty-conversations">
              <div className="empty-icon">💬</div>
              <p>No conversations yet</p>
              <span>When you match with someone, you can message them here</span>
            </div>
          ) : (
            <div className="conversations-list">
              {conversations.map(conv => (
                <div
                  key={conv.conversationId}
                  className={`conversation-item ${selectedUser?._id === conv.otherUser._id ? 'active' : ''}`}
                  onClick={() => selectConversation(conv.otherUser)}
                >
                  <div className="conversation-avatar">
                    {conv.otherUser.profile?.photos?.[0] ? (
                      <img 
                        src={conv.otherUser.profile.photos[0].thumbnailUrl || conv.otherUser.profile.photos[0].url} 
                        alt={conv.otherUser.username} 
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {conv.otherUser.username[0].toUpperCase()}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                  
                  <div className="conversation-info">
                    <h4>{conv.otherUser.username}</h4>
                    <p className="last-message">
                      {conv.lastMessage.sender === currentUserId && 'You: '}
                      {conv.lastMessage.messageType === 'image' ? '📷 Photo' : conv.lastMessage.content}
                    </p>
                  </div>
                  
                  <span className="conversation-time">
                    {formatTime(conv.lastMessage.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat View */}
        {selectedUser ? (
          <div className="chat-view">
            <div className="chat-header">
              <button className="back-button mobile-only" onClick={() => setSelectedUser(null)}>
                ←
              </button>
              
              <div className="chat-user-info" onClick={() => navigate(`/profile/${selectedUser._id}`)}>
                <div className="chat-avatar">
                  {selectedUser.profile?.photos?.[0] ? (
                    <img 
                      src={selectedUser.profile.photos[0].thumbnailUrl || selectedUser.profile.photos[0].url} 
                      alt={selectedUser.username} 
                    />
                  ) : (
                    <div className="avatar-placeholder">
                      {selectedUser.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="chat-user-details">
                  <h3>{selectedUser.username}</h3>
                  {otherUserTyping && <span className="typing-indicator">typing...</span>}
                </div>
              </div>
            </div>

            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="empty-messages">
                  <div className="empty-icon">🌸</div>
                  <p>Say hello to {selectedUser.username}!</p>
                  <span>Start your conversation with a thoughtful message</span>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div 
                      key={msg._id} 
                      className={`message ${msg.sender._id === currentUserId ? 'sent' : 'received'}`}
                    >
                      <div className="message-bubble">
                        {msg.messageType === 'image' ? (
                          <img 
                            src={msg.imageUrl} 
                            alt="Shared image" 
                            className="message-image"
                            onClick={() => window.open(msg.imageUrl, '_blank')}
                          />
                        ) : (
                          <p>{msg.content}</p>
                        )}
                        
                        <div className="message-meta">
                          <span className="message-time">{formatTime(msg.createdAt)}</span>
                          {msg.sender._id === currentUserId && (
                            <>
                              {msg.read && <span className="read-indicator">✓✓</span>}
                              <button 
                                className="delete-message"
                                onClick={() => deleteMessage(msg._id)}
                              >
                                ×
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <form className="message-input-area" onSubmit={sendMessage}>
              <button
                type="button"
                className="image-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
              >
                📷
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              
              <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                placeholder="Type a message..."
                disabled={sending}
                className="message-input"
              />
              
              <button 
                type="submit" 
                disabled={!messageInput.trim() || sending}
                className="send-button"
              >
                {sending ? '...' : '→'}
              </button>
            </form>
          </div>
        ) : (
          <div className="no-chat-selected">
            <div className="empty-icon">💌</div>
            <h3>Welcome to your messages</h3>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* Image Send Modal */}
      {showImageModal && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Send Image</h3>
            
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
            
            <div className="seed-info">
              {hasSubscription ? (
                <p className="subscription-info">
                  ✨ Unlimited member - Send free!
                </p>
              ) : (
                <p className="seed-cost">
                  This will cost 1 seed 
                  <span className="seed-balance">(You have {userSeeds} seeds)</span>
                </p>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="cancel-button" 
                onClick={() => {
                  setShowImageModal(false);
                  setSelectedImage(null);
                  setImagePreview('');
                }}
              >
                Cancel
              </button>
              <button 
                className="send-image-button" 
                onClick={sendImage}
                disabled={imageUploading || (!hasSubscription && userSeeds < 1)}
              >
                {imageUploading ? 'Sending...' : 'Send Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;