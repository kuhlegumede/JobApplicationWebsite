import React, { useState, useEffect, useRef } from "react";
import { messageService } from "../../services/messageService";
import { EmployerHeader } from "../../components/EmployerHeader";
import { Footer } from "../../components/Footer";
import { NewMessageModal } from "../../components/NewMessageModal";

export default function EmployerMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserId = Number(JSON.parse(localStorage.getItem("user"))?.userId);

  // Load all conversations
  const loadConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data || []);
    } catch (error) {
      console.error("❌ Error loading conversations:", error);
    }
  };

  // Load messages for a specific conversation
  const loadConversation = async (partnerId) => {
    try {
      const data = await messageService.getConversation(partnerId);
      setMessages(data || []);
      
      // Mark conversation as read
      await messageService.markConversationAsRead(partnerId);
      
      // Update unread count in conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv.partnerId === partnerId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error("❌ Error loading conversation:", error);
    }
  };

  // Refresh button handler - reload conversations and current conversation
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reload conversations list
      await loadConversations();
      
      // If a conversation is open, reload its messages
      if (selectedConversation) {
        await loadConversation(selectedConversation.partnerId);
      }
      
      console.log("✅ Messages refreshed");
    } catch (error) {
      console.error("❌ Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        await loadConversations();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadConversation(conversation.partnerId);
  };

  const handleNewMessage = (userId, userName) => {
    // Create a new conversation object
    const newConv = {
      partnerId: userId,
      partnerName: userName,
      lastMessage: "",
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };
    setSelectedConversation(newConv);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();

    try {
      setSending(true);
      setNewMessage("");
      
      // Send to backend
      await messageService.sendMessage(
        selectedConversation.partnerId,
        messageContent
      );
      
      // Reload the conversation to show the new message
      await loadConversation(selectedConversation.partnerId);
      
      // Reload conversations to update preview
      await loadConversations();
      
      console.log("✅ Message sent");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setNewMessage(messageContent); // Restore message text
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <EmployerHeader />
      <div className="bg-light" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-md-12">
              <div className="d-flex bg-white rounded shadow-sm" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
                {/* Conversations List */}
                <div className="border-end d-flex flex-column" style={{ width: '350px' }}>
                  <div className="p-3 border-bottom bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Messages</h5>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleRefresh}
                          disabled={refreshing}
                          title="Refresh messages"
                        >
                          <i className={`bi bi-arrow-clockwise`} style={refreshing ? { animation: 'spin 1s linear infinite' } : {}}></i>
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setShowNewMessageModal(true)}
                        >
                          <i className="bi bi-plus-lg me-1"></i>
                          New
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-auto flex-grow-1">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted p-4">
                        <i className="bi bi-chat-dots" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.partnerId}
                          className={`d-flex p-3 border-bottom ${
                            selectedConversation?.partnerId === conv.partnerId ? "bg-primary bg-opacity-10" : ""
                          }`}
                          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                          onClick={() => handleSelectConversation(conv)}
                          onMouseEnter={(e) => {
                            if (selectedConversation?.partnerId !== conv.partnerId) {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedConversation?.partnerId !== conv.partnerId) {
                              e.currentTarget.style.backgroundColor = '';
                            }
                          }}
                        >
                          <div className="me-3 text-secondary" style={{ fontSize: '2.5rem' }}>
                            <i className="bi bi-person-circle"></i>
                          </div>
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-start">
                              <strong className="text-dark">{conv.partnerName}</strong>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                {formatTime(conv.lastMessageTime)}
                              </small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <p className="mb-0 text-muted small text-truncate">{conv.lastMessage}</p>
                              {conv.unreadCount > 0 && (
                                <span className="badge bg-primary rounded-pill ms-2">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Message Thread */}
                <div className="flex-grow-1 d-flex flex-column bg-white">
                  {selectedConversation ? (
                    <>
                      <div className="p-3 border-bottom bg-white">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-circle me-2" style={{ fontSize: "2rem" }}></i>
                          <div>
                            <h6 className="mb-0">{selectedConversation.partnerName}</h6>
                            <small className="text-muted">Job Seeker</small>
                          </div>
                        </div>
                      </div>

                      <div className="flex-grow-1 overflow-auto p-3 bg-light d-flex flex-column">
                        {messages.map((msg) => {
                          const isSentByMe = Number(msg.senderId) === currentUserId;
                          
                          return (
                            <div
                              key={msg.messageId}
                              className={`mb-3 d-flex flex-column ${isSentByMe ? 'align-items-end ms-auto' : 'align-items-start me-auto'}`}
                              style={{ maxWidth: '70%', width: 'fit-content' }}
                            >
                              {!isSentByMe && (
                                <small className="fw-semibold text-secondary mb-1 px-2" style={{ fontSize: '0.75rem' }}>
                                  {selectedConversation.partnerName}
                                </small>
                              )}
                              <div 
                                className={`p-3 rounded ${isSentByMe ? 'bg-primary text-white' : 'bg-white border'}`}
                                style={{ 
                                  borderRadius: '1rem',
                                  ...(isSentByMe ? { borderBottomRightRadius: '0.25rem' } : { borderBottomLeftRadius: '0.25rem' }),
                                  wordWrap: 'break-word'
                                }}
                              >
                                {isSentByMe && <span className="fw-semibold me-1">You: </span>}
                                {msg.content}
                              </div>
                              <small className="text-muted mt-1 px-2" style={{ fontSize: '0.75rem' }}>
                                {new Date(msg.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="p-3 border-top bg-white">
                        <form onSubmit={handleSendMessage} className="d-flex gap-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={sending}
                          />
                          <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={sending || !newMessage.trim()}
                          >
                            {sending ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              <i className="bi bi-send"></i>
                            )}
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                      <i className="bi bi-chat-left-text" style={{ fontSize: "4rem", opacity: 0.3 }}></i>
                      <p>Select a conversation to start messaging</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <Footer />
      <NewMessageModal
        show={showNewMessageModal}
        onHide={() => setShowNewMessageModal(false)}
        onSelectUser={handleNewMessage}
        userType="employer"
      />
    </>
  );
}
