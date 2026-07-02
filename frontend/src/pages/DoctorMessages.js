import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DoctorMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get("/messages/conversations");
        setConversations(res.data);
      } catch (err) {
        console.error("Erreur conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedAppt && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedAppt]);

  const openConversation = async (appointmentId) => {
    setSelectedAppt(appointmentId);
    try {
      const res = await api.get(`/messages/conversation/${appointmentId}`);
      setMessages(res.data);
    } catch (err) {
      setMessages([]);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAppt) return;
    setSending(true);
    try {
      await api.post("/messages", { appointment_id: selectedAppt, content: newMessage });
      setNewMessage("");
      const res = await api.get(`/messages/conversation/${selectedAppt}`);
      setMessages(res.data);
      const convRes = await api.get("/messages/conversations");
      setConversations(convRes.data);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const getParticipantName = (conv) => {
    return conv.other_party_name || conv.participant_name || "Patient";
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) {
      return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const formatMsgTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading)
    return (
      <div className="messages-container">
        <div className="messages-loading">
          <div className="spinner" />
          <p>Chargement des messages...</p>
        </div>
      </div>
    );

  return (
    <div className="messages-container">
      {/* Sidebar conversations */}
      <div className="conv-sidebar">
        <div className="conv-sidebar-header">
          <h3>{user?.first_name}</h3>
          <span className="conv-count">{conversations.length}</span>
        </div>

        <div className="conv-list">
          {conversations.length === 0 ? (
            <div className="conv-empty">
              <div className="conv-empty-icon">💬</div>
              <p>Aucune conversation</p>
              <span>Les conversations apparaissent après un rendez-vous</span>
            </div>
          ) : (
            conversations.map((conv) => {
              const name = getParticipantName(conv);
              const isActive = selectedAppt === conv.appointment_id;
              return (
                <div
                  key={conv.appointment_id}
                  className={`conv-item ${isActive ? "active" : ""}`}
                  onClick={() => openConversation(conv.appointment_id)}
                >
                  <div className="conv-item-avatar" style={{ backgroundColor: isActive ? "#fff" : "#e4e6eb" }}>
                    <span style={{ color: isActive ? "#2563eb" : "#050505" }}>{getInitials(name)}</span>
                  </div>
                  <div className="conv-item-body">
                    <div className="conv-item-top">
                      <span className="conv-item-name">{name}</span>
                      {conv.last_message_at && (
                        <span className="conv-item-time">{formatTime(conv.last_message_at)}</span>
                      )}
                    </div>
                    <div className="conv-item-preview">
                      {conv.last_message || "Dites bonjour !"}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="chat-area">
        {selectedAppt ? (
          <>
            {/* Chat header */}
            <div className="chat-header">
              {(() => {
                const conv = conversations.find((c) => c.appointment_id === selectedAppt);
                const name = conv ? getParticipantName(conv) : "Inconnu";
                return (
                  <>
                    <div className="chat-header-avatar">{getInitials(name)}</div>
                    <div className="chat-header-info">
                      <span className="chat-header-name">{name}</span>
                      <span className="chat-header-status">En ligne</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-messages-empty">
                  <div className="chat-empty-icon">✉️</div>
                  <p>Envoyez votre premier message</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSent = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`msg-row ${isSent ? "sent" : "received"}`}>
                      {!isSent && <div className="msg-avatar-sm">{getInitials(msg.first_name + " " + msg.last_name)}</div>}
                      <div className="msg-group">
                        <div className={`msg-bubble ${isSent ? "sent" : "received"}`}>
                          {msg.content}
                        </div>
                        <div className={`msg-time ${isSent ? "sent" : "received"}`}>
                          {formatMsgTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input" onSubmit={handleSend}>
              <div className="chat-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écrivez votre message..."
                  disabled={sending}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className={`chat-send-btn ${newMessage.trim() ? "active" : ""}`}
                  disabled={sending || !newMessage.trim()}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M2.5 10L17.5 2.5L12.5 10L17.5 17.5L2.5 10Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="chat-empty">
            <div className="chat-empty-icon">💬</div>
            <p className="chat-empty-title">Messagerie HealthConnect</p>
            <p className="chat-empty-subtitle">
              Sélectionnez une conversation pour commencer à discuter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorMessages;