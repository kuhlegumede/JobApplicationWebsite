import { useEffect, useState, useRef } from "react";
import {
  startConnection,
  registerHandler,
  sendMessageToUser,
} from "../services/signalRService";

/**
 * Simple chat scaffold.
 * props:
 *  - currentUserId
 *  - peerId (the other user to chat with)
 *  - hubUrl, accessTokenFactory (optional)
 */
export function ChatWidget({ currentUserId, peerId, hubUrl, accessTokenFactory }) {
  const [messages, setMessages] = useState([]); // {id, from, text, at}
  const [text, setText] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    let off;
    (async () => {
      await startConnection({ url: hubUrl, accessTokenFactory });
      off = registerHandler("ReceiveMessage", (sender, message) => {
        // only add messages relevant to this conversation
        if (sender === peerId || sender === currentUserId) {
          setMessages((m) => [...m, { id: Date.now(), from: sender, text: message, at: new Date().toISOString() }]);
        }
      });
    })();

    return () => {
      off && off();
    };
  }, [peerId, currentUserId, hubUrl, accessTokenFactory]);

  useEffect(() => {
    scrollRef.current && (scrollRef.current.scrollTop = scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      // optimistic add
      setMessages((m) => [...m, { id: Date.now(), from: currentUserId, text: text.trim(), at: new Date().toISOString() }]);
      await sendMessageToUser(peerId, text.trim());
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
      // optionally show error to user
    }
  };

  return (
    <div className="border rounded p-3" style={{ width: 320 }}>
      <div style={{ maxHeight: 240, overflowY: "auto" }} ref={scrollRef}>
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.from === currentUserId ? "text-end" : "text-start"}`}>
            <div style={{ display: "inline-block", padding: "6px 10px", borderRadius: 8, background: m.from === currentUserId ? "#0d6efd" : "#e9ecef", color: m.from === currentUserId ? "#fff" : "#000" }}>
              {m.text}
            </div>
            <div style={{ fontSize: 11, color: "#666" }}>{new Date(m.at).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 mt-2">
        <input className="form-control" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
        <button className="btn btn-primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}