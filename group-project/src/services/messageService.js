// Message Service
// Simplified version - HTTP only, no real-time connections or polling

const API_URL = "https://localhost:7087/api";

export const messageService = {

  async sendMessage(receiverId, content) {
    try {
      const token = localStorage.getItem("token");
      console.log(' Sending message to user:', receiverId);
      
      const response = await fetch(`${API_URL}/Message/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId,
          content,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Message send failed:', response.status, errorText);
        throw new Error(`Failed to send message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Message sent successfully');
      return result;
    } catch (error) {
      console.error("❌ Error sending message:", error);
      throw error;
    }
  },

  async getConversations() {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      console.log(" Fetching conversations");
      
      const response = await fetch(`${API_URL}/Message/conversations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to fetch conversations:", errorText);
        throw new Error(`Failed to fetch conversations: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Conversations loaded:", data.length);
      return data;
    } catch (error) {
      console.error("❌ Error fetching conversations:", error);
      throw error;
    }
  },

  async getConversation(otherUserId) {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("Not authenticated");
      }
      
      console.log("Fetching conversation with user:", otherUserId);
      
      const response = await fetch(
        `${API_URL}/Message/conversation/${otherUserId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Failed to fetch conversation:", errorText);
        throw new Error(`Failed to fetch conversation: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Conversation loaded:", data.length, "messages");
      return data;
    } catch (error) {
      console.error("❌ Error fetching conversation:", error);
      throw error;
    }
  },

  async getUnreadCount() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Message/unread-count`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error("❌ Error fetching unread count:", error);
      return 0;
    }
  },

  async markConversationAsRead(otherUserId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/Message/conversation/${otherUserId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark conversation as read");
      }

      return await response.json();
    } catch (error) {
      console.error("❌ Error marking conversation as read:", error);
      throw error;
    }
  },
};
