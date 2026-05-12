import { useEffect, useState, useRef } from "react";
import Sidebar from "../components/Sidebar";
import socket from "../socket.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function EmployeeChat() {
  const { employee } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!socket.connected) {
      socket.auth = { token: localStorage.getItem("empToken") };
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Employee connected!", socket.id);
      socket.emit("get-history", { withUserId: "admin" });
    });

      socket.on('reconnect', (attempt) => {
    console.log('Reconnected after', attempt, 'attempts');
  });

  socket.on('reconnect_attempt', () => {
    socket.auth = { token: localStorage.getItem('empToken') };
  });

  socket.on('reconnect_failed', () => {
    console.log('Reconnection failed!');
  });

    socket.on("connect_error", (err) => {
      console.log("❌ Connect error:", err.message);
    });

    socket.on("private-message", (data) => {
        console.log('Message data:', data);
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: "private",
          fromMe: false,
        },
      ]);
      setUnreadCount((prev) => prev + 1);
      socket.emit("message-read", { messageId: data._id });
    });

    socket.on("broadcast-message", (data) => {
      setMessages((prev) => [...prev, { ...data, type: "broadcast" }]);
    });

    socket.on("message-sent", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          ...data,
          type: "private",
          fromMe: true,
        },
      ]);
    });

    socket.on("chat-history", (history) => {
      setMessages(
        history.map((m) => ({
          ...m,
          type: m.type || "private",
          fromMe: m.sender !== null,
        })),
      );
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("private-message");
      socket.off("broadcast-message");
      socket.off("message-sent");
      socket.off("chat-history");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("private-message", {
      receiverId: "admin",
      message: input.trim(),
    });
    setInput("");
  };

  return (
    <div style={s.layout}>
      <Sidebar />

      <main style={s.main}>
        <h1 style={s.heading}>
          Chat 💬
          {unreadCount > 0 && <span style={s.badge}>{unreadCount}</span>}
        </h1>

        <div style={s.chatBox}>
          <div style={s.header}>
            <div style={s.adminAvatar}>A</div>
            <div>
              <p style={s.adminName}>Administrator</p>
              <p style={s.adminSub}>Admin Portal</p>
            </div>
          </div>

          <div style={s.messagesBox}>
            {messages.length === 0 && (
              <p style={s.emptyMsg}>No messages yet. Say Hi! 👋</p>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  ...s.msgRow,
                  justifyContent: msg.fromMe ? "flex-end" : "flex-start",
                }}
              >
                {msg.type === "broadcast" ? (
                  <div style={s.broadcastMsg}>
                    📢 <b>Announcement:</b> {msg.message}
                    <p style={s.broadcastTime}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      ...s.bubble,
                      background: msg.fromMe ? "#0369a1" : "#1e293b",
                      borderRadius: msg.fromMe
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    }}
                  >
                    <p style={s.bubbleText}>{msg.message}</p>
                    <p style={s.bubbleTime}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {msg.fromMe && (
                        <span
                          style={{
                            marginLeft: "6px",
                            color: msg.isRead ? "#38bdf8" : "#94a3b8",
                          }}
                        >
                          {msg.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div style={s.inputRow}>
            <input
              style={s.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
            />
            <button style={s.sendBtn} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  layout: { display: "flex", fontFamily: "'Segoe UI', sans-serif" },
  main: {
    marginLeft: "250px",
    flex: 1,
    padding: "32px",
    background: "#f0f9ff",
    minHeight: "100vh",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  badge: {
    background: "#dc2626",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "999px",
  },
  chatBox: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    height: "calc(100vh - 130px)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  adminAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#0369a1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
  },
  adminName: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
  },
  adminSub: { color: "#64748b", fontSize: "12px", margin: "2px 0 0" },
  messagesBox: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  emptyMsg: { color: "#94a3b8", textAlign: "center", marginTop: "40px" },
  msgRow: { display: "flex" },
  bubble: { maxWidth: "65%", padding: "10px 14px" },
  bubbleText: { color: "#fff", fontSize: "14px", margin: 0 },
  bubbleTime: {
    color: "#94a3b8",
    fontSize: "11px",
    margin: "4px 0 0",
    textAlign: "right",
  },
  broadcastMsg: {
    background: "#fef9c3",
    color: "#713f12",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    width: "100%",
    border: "1px solid #fde047",
  },
  broadcastTime: {
    color: "#92400e",
    fontSize: "11px",
    margin: "6px 0 0",
    textAlign: "right",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    padding: "14px 16px",
    borderTop: "1px solid #e2e8f0",
  },
  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    color: "#0f172a",
  },
  sendBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    background: "#0369a1",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
