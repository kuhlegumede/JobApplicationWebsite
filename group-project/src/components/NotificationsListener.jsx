import { useEffect, useState } from "react";
import { startConnection, registerHandler, stopConnection } from "../services/signalRService";
import { isAuthenticated } from "../services/authUtils";

export function NotificationsListener({
  hubUrl,
  accessTokenFactory,
  onNotification,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let off;
    let mounted = true;

    const connectIfAuthenticated = async () => {
      const authenticated = isAuthenticated();
      
      // If not authenticated and connected, disconnect
      if (!authenticated && isConnected) {
        console.log("User logged out, disconnecting SignalR");
        await stopConnection();
        setIsConnected(false);
        setAuthChecked(false);
        return;
      }

      // If authenticated but not connected, connect
      if (authenticated && !isConnected && !authChecked) {
        setAuthChecked(true); // Prevent multiple simultaneous connection attempts
        try {
          console.log("Attempting SignalR connection...");
          await startConnection({ url: hubUrl, accessTokenFactory });
          if (!mounted) return;
          
          off = registerHandler("ReceiveNotification", (payload) => {
            try {
              onNotification && onNotification(payload);
            } catch (e) {
              console.error("onNotification handler error", e);
            }
          });
          
          setIsConnected(true);
          console.log("✅ SignalR connected successfully for notifications");
        } catch (err) {
          console.error("NotificationsListener: failed to start connection", err);
          setIsConnected(false);
          setAuthChecked(false); // Allow retry
        }
      }
    };

    // Initial connection attempt
    connectIfAuthenticated();

    // Check authentication status less frequently (every 5 seconds instead of 1)
    const interval = setInterval(connectIfAuthenticated, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
      off && off();
    };
  }, [hubUrl, accessTokenFactory, onNotification, isConnected, authChecked]);

  return null;
}
