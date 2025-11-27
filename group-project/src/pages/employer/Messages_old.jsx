import React, { useState, useEffect, useRef, useCallback } from "react";
import { messageService } from "../../services/messageService";
import { EmployerHeader } from "../../components/EmployerHeader";
import { Footer } from "../../components/Footer";
import { NewMessageModal } from "../../components/NewMessageModal";
import "../jobSeeker/Messages.css";

export default function EmployerMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  //const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const conversationPollingRef = useRef(null);
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
  const loadConversation = useCallback(async (partnerId) => {
    try {
      console.log("Loading conversation with partner ID:", partnerId);
      console.log("Current user ID:", currentUserId);
      const data = await messageService.getConversation(partnerId);
      console.log("Loaded messages:", data);
      console.log("Number of messages:", data?.length || 0);
      if (data && data.length > 0) {
        data.forEach(msg => {
          console.log(`  Message ${msg.messageId}: from ${msg.senderId} to ${msg.receiverId}, content: "${msg.content.substring(0, 50)}..."`);
        });
      } else {
        console.log("No messages found in this conversation");
      }
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
      alert("Failed to load conversation. Please try again.");
    }
  }, [currentUserId]);

  // Refresh button handler - reload conversations and current conversation
  /*const handleRefresh = async () => {
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
  };*/

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
    // Verify we have authentication
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      console.error("❌ No authentication found, redirecting to login");
      window.location.href = "/";
      return;
    }
    
    const userData = JSON.parse(user);
    console.log("✅ User authenticated:", userData.userId, userData.role);
    
    // Load initial conversations
    loadConversations();
    
    // Set up polling for conversations list (every 3 seconds)
    console.log("Starting conversations polling (every 3s)");
    pollingIntervalRef.current = setInterval(() => {
      console.log("Polling for new conversations...");
      loadConversations();
    }, 3000);

    return () => {
      // Cleanup polling on unmount
      if (pollingIntervalRef.current) {
        console.log("Stopping conversations polling");
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Poll for messages in the active conversation
  useEffect(() => {
    if (selectedConversation) {
      console.log("Starting conversation polling for partner:", selectedConversation.partnerId);
      
      // Set up polling for active conversation (every 3 seconds)
      conversationPollingRef.current = setInterval(() => {
        console.log("Polling for new messages in conversation...");
        loadConversation(selectedConversation.partnerId);
      }, 3000);
    }

    return () => {
      // Cleanup conversation polling
      if (conversationPollingRef.current) {
        console.log("Stopping conversation polling");
        clearInterval(conversationPollingRef.current);
      }
    };
  }, [selectedConversation, loadConversation]);

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
    const tempId = Date.now(); 

    try {
      setSending(true);
      
      //  add message to UI immediately
      const optimisticMessage = {
        messageId: tempId,
        senderId: currentUserId,
        receiverId: selectedConversation.partnerId,
        content: messageContent,
        sentAt: new Date().toISOString(),
        isRead: false,
      };
      
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage("");
      
      // Send to backend
      const sentMessage = await messageService.sendMessage(
        selectedConversation.partnerId,
        messageContent
      );
      
      // Replace optimistic message with real one from server
      setMessages((prev) => 
        prev.map(msg => msg.messageId === tempId ? sentMessage : msg)
      );
      
      // Reload conversations to update preview
      setTimeout(loadConversations, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.filter(msg => msg.messageId !== tempId));
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
      <div className="messages-page">
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-md-12">
              <div className="messages-container">
                {/* Conversations List */}
                <div className="conversations-sidebar">
                  <div className="conversations-header">
                    <h5 className="mb-0">Messages</h5>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowNewMessageModal(true)}
                    >
                      <i className="bi bi-plus-lg me-1"></i>
                      New
                    </button>
                  </div>
                  
                  <div className="conversations-list">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : conversations.length === 0 ? (
                      <div className="no-conversations">
                        <i className="bi bi-chat-dots" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                        <p>No messages yet</p>
                      </div>
                    ) : (
                      conversations.map((conv) => (
                        <div
                          key={conv.partnerId}
                          className={`conversation-item ${
                            selectedConversation?.partnerId === conv.partnerId ? "active" : ""
                          }`}
                          onClick={() => handleSelectConversation(conv)}
                        >
                          <div className="conversation-avatar">
                            <i className="bi bi-person-circle"></i>
                          </div>
                          <div className="conversation-details">
                            <div className="d-flex justify-content-between align-items-start">
                              <strong className="conversation-name">{conv.partnerName}</strong>
                              <small className="conversation-time">
                                {formatTime(conv.lastMessageTime)}
                              </small>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <p className="conversation-preview">{conv.lastMessage}</p>
                              {conv.unreadCount > 0 && (
                                <span className="badge bg-primary rounded-pill">
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
                <div className="message-thread">
                  {selectedConversation ? (
                    <>
                      <div className="message-thread-header">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-circle me-2" style={{ fontSize: "2rem" }}></i>
                          <div>
                            <h6 className="mb-0">{selectedConversation.partnerName}</h6>
                            <small className="text-muted">Job Seeker</small>
                          </div>
                        </div>
                      </div>

                      <div className="message-thread-body">
                        {messages.map((msg) => {
                          const isSentByMe = Number(msg.senderId) === currentUserId;
                          console.log(`   Rendering Message ${msg.messageId}:`);
                          console.log(`   senderId: ${msg.senderId} (type: ${typeof msg.senderId})`);
                          console.log(`   receiverId: ${msg.receiverId} (type: ${typeof msg.receiverId})`);
                          console.log(`   currentUserId: ${currentUserId} (type: ${typeof currentUserId})`);
                          console.log(`   Number(senderId): ${Number(msg.senderId)}`);
                          console.log(`   isSentByMe: ${isSentByMe}`);
                          console.log(`   CSS class: ${isSentByMe ? "sent" : "received"}`);
                          
                          return (
                            <div
                              key={msg.messageId}
                              className={`message-bubble ${isSentByMe ? "sent" : "received"}`}
                            >
                              {!isSentByMe && (
                                <div className="message-sender-name">
                                  {selectedConversation.partnerName}
                                </div>
                              )}
                              <div className="message-content">
                                {isSentByMe && <span className="message-you-label">You: </span>}
                                {msg.content}
                              </div>
                              <div className="message-time">
                                {new Date(msg.sentAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      <div className="message-thread-footer">
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
                    <div className="no-conversation-selected">
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