import React, { useState, useEffect, useRef } from "react";
import { notificationService } from "../services/notificationService";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    // Subscribe to real-time notifications
    const subscribeToRealTime = async () => {
      try {
        notificationService.subscribeToNotifications((notification) => {
          // Add new notification to the list
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          
          // Play sound or show browser notification (optional)
          showBrowserNotification(notification);
        });
      } catch (error) {
        console.error("Failed to subscribe to notifications:", error);
      }
    };

    subscribeToRealTime();

    // Cleanup on unmount
    return () => {
      if (notificationService.unsubscribe) {
        notificationService.unsubscribe();
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getAllNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.notificationId === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((n) => n.notificationId !== notificationId)
      );
      loadUnreadCount(); // Refresh count
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const showBrowserNotification = (notification) => {
    // Check if browser supports notifications
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/logo.png", // Add your app logo
      });
    }
  };

  const formatDate = (dateString) => {
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

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <div
        role="button"
        className="position-relative"
        onClick={() => setShowDropdown(!showDropdown)}
        style={{ cursor: "pointer" }}
      >
        <i className="bi bi-bell fs-1 text-dark"></i>
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.65rem" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {showDropdown && (
        <div
          className="dropdown-menu dropdown-menu-end show p-0"
          style={{
            position: "absolute",
            right: 0,
            minWidth: "350px",
            maxHeight: "500px",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-link p-0"
                onClick={handleMarkAllAsRead}
                style={{ textDecoration: "none", fontSize: "0.875rem" }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-bell-slash" style={{ fontSize: "2rem" }}></i>
              <p className="mb-0 mt-2">No notifications</p>
            </div>
          ) : (
            <>
              {recentNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`border-bottom p-3 ${
                    !notification.isRead ? "bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.notificationId);
                    }
                  }}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong style={{ fontSize: "0.9rem" }}>
                          {notification.title}
                        </strong>
                        {!notification.isRead && (
                          <span
                            className="badge bg-primary"
                            style={{ fontSize: "0.65rem" }}
                          >
                            New
                          </span>
                        )}
                      </div>
                      <p
                        className="mb-1 text-muted"
                        style={{ fontSize: "0.875rem" }}
                      >
                        {notification.message}
                      </p>
                      <small className="text-muted">
                        {formatDate(notification.createdAt)}
                      </small>
                    </div>
                    <button
                      className="btn btn-sm btn-link p-0 ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.notificationId);
                      }}
                      style={{ textDecoration: "none" }}
                    >
                      <i className="bi bi-x" style={{ fontSize: "1.25rem" }}></i>
                    </button>
                  </div>
                </div>
              ))}

              {notifications.length > 5 && (
                <div className="text-center p-2 border-top">
                  <button
                    className="btn btn-sm btn-link"
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to notifications page when implemented
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
