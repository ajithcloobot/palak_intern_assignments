import { useState, useEffect } from "react";
import { getConversations, uploadConversations, createConversation, deleteConversation, updateGuideline } from "../api/conversations";
import ConversationView from "./ConversationView";

export default function AgentDetail({ agent, onBack }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [showUploadError, setShowUploadError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [guideline, setGuideline] = useState(agent.system_guideline || "");
  const [editingGuideline, setEditingGuideline] = useState(false);
  const [messages, setMessages] = useState([{ role: "user", content: "" }, { role: "assistant", content: "" }]);
  const [addError, setAddError] = useState("");

  const load = () => getConversations(agent.id).then(setConversations);
  useEffect(() => { load(); }, []);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        const res = await uploadConversations(agent.id, json);
        if (res.ok) {
          if (json.system_guideline) setGuideline(json.system_guideline);
          load();
          setShowUploadError("");
        } else {
          const data = await res.json();
          setShowUploadError(data.detail || "Upload failed");
        }
      } catch {
        setShowUploadError("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const template = {
      system_guideline: "Optional: describe the assistant's behavior here",
      conversations: [
        [
          { role: "user", content: "Your message here" },
          { role: "assistant", content: "Assistant reply here" }
        ]
      ]
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "conversation_template.json";
    a.click();
  };

  const handleSaveGuideline = async () => {
    await updateGuideline(agent.id, guideline);
    setEditingGuideline(false);
  };

  const addMessagePair = () => {
    setMessages([...messages, { role: "user", content: "" }, { role: "assistant", content: "" }]);
  };

  const updateMessage = (index, value) => {
    const updated = [...messages];
    updated[index].content = value;
    setMessages(updated);
  };

  const removeMessagePair = (index) => {
    const updated = messages.filter((_, i) => i !== index && i !== index + 1);
    setMessages(updated);
  };

  const handleSaveConversation = async () => {
    setAddError("");
    for (const m of messages) {
      if (!m.content.trim()) { setAddError("All messages must have content."); return; }
    }
    const res = await createConversation(agent.id, { messages });
    if (res.ok) {
      setShowAddModal(false);
      setMessages([{ role: "user", content: "" }, { role: "assistant", content: "" }]);
      load();
    } else {
      const data = await res.json();
      setAddError(data.detail || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    await deleteConversation(id);
    load();
  };

  if (selectedConv) {
    return <ConversationView conversation={selectedConv} onBack={() => { setSelectedConv(null); load(); }} />;
  }

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={onBack}>← Back</button>

      <h1 style={styles.title}>{agent.name}</h1>
      {agent.description && <p style={styles.desc}>{agent.description}</p>}

      {/* System Guideline */}
      <div style={styles.guidelineBox}>
        <div style={styles.guidelineHeader}>
          <span style={styles.guidelineLabel}>System Guideline</span>
          {!editingGuideline && (
            <button style={styles.editSmall} onClick={() => setEditingGuideline(true)}>Edit</button>
          )}
        </div>
        {editingGuideline ? (
          <>
            <textarea
              style={styles.guidelineInput}
              value={guideline}
              onChange={e => setGuideline(e.target.value)}
              placeholder="Describe how the assistant should behave..."
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={styles.btnPrimary} onClick={handleSaveGuideline}>Save</button>
              <button style={styles.btnSecondary} onClick={() => setEditingGuideline(false)}>Cancel</button>
            </div>
          </>
        ) : (
          <p style={styles.guidelineText}>{guideline || <em>No guideline set</em>}</p>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button style={styles.btnPrimary} onClick={() => setShowAddModal(true)}>+ Add Conversation</button>
        <label style={styles.btnSecondary}>
          Upload JSON
          <input type="file" accept=".json" style={{ display: "none" }} onChange={handleUpload} />
        </label>
        <button style={styles.btnGhost} onClick={handleDownloadTemplate}>⬇ Download Template</button>
      </div>

      {showUploadError && <p style={styles.error}>⚠️ {showUploadError}</p>}

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <p style={styles.empty}>No conversations yet. Upload a JSON or add one manually.</p>
      ) : (
        <div style={styles.convList}>
          {conversations.map(conv => (
            <div key={conv.id} style={styles.convCard}>
              <div style={styles.convInfo} onClick={() => setSelectedConv(conv)}>
                <span style={styles.convTitle}>{conv.title}</span>
                <span style={styles.convMeta}>{conv.messages.length} messages · {new Date(conv.created_at).toLocaleDateString()}</span>
                {conv.feedback?.rating && <span style={styles.convRating}>{"★".repeat(conv.feedback.rating)}{"☆".repeat(4 - conv.feedback.rating)}</span>}
              </div>
              <button style={styles.deleteBtn} onClick={() => handleDelete(conv.id)}>🗑️</button>
            </div>
          ))}
        </div>
      )}

      {/* Add Conversation Modal */}
      {showAddModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Add Conversation</h2>
            <div style={styles.msgList}>
              {messages.map((msg, i) => (
                <div key={i} style={styles.msgRow}>
                  <span style={{ ...styles.roleTag, background: msg.role === "user" ? "#e0e7ff" : "#dcfce7", color: msg.role === "user" ? "#3730a3" : "#166534" }}>
                    {msg.role}
                  </span>
                  <textarea
                    style={styles.msgInput}
                    value={msg.content}
                    onChange={e => updateMessage(i, e.target.value)}
                    placeholder={`${msg.role} message...`}
                  />
                  {i > 1 && msg.role === "user" && (
                    <button style={styles.removeBtn} onClick={() => removeMessagePair(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button style={styles.btnGhost} onClick={addMessagePair}>+ Add another pair</button>
            {addError && <p style={styles.error}>⚠️ {addError}</p>}
            <div style={styles.modalActions}>
              <button style={styles.btnSecondary} onClick={() => { setShowAddModal(false); setAddError(""); }}>Cancel</button>
              <button style={styles.btnPrimary} onClick={handleSaveConversation}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 900, margin: "0 auto", padding: "40px 32px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#f0f0f0", minHeight: "100vh" },
  backBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#555", marginBottom: 16, padding: 0 },
  title: { fontSize: 26, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" },
  desc: { color: "#777", fontSize: 14, margin: "0 0 24px" },
  guidelineBox: { background: "#fff", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #e0e0e0" },
  guidelineHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  guidelineLabel: { fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#555" },
  guidelineText: { fontSize: 14, color: "#444", margin: 0, lineHeight: 1.6 },
  guidelineInput: { width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, minHeight: 80, boxSizing: "border-box", resize: "vertical", color: "#1a1a1a" },
  editSmall: { background: "#f4f4f4", border: "none", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12 },
  actions: { display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" },
  btnPrimary: { background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 },
  btnSecondary: { background: "#ebebeb", color: "#333", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13.5 },
  btnGhost: { background: "none", color: "#555", border: "1.5px solid #ddd", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13.5 },
  error: { color: "#c0392b", fontSize: 13, fontWeight: 500, marginBottom: 12 },
  empty: { color: "#999", textAlign: "center", marginTop: 60, fontSize: 15 },
  convList: { display: "flex", flexDirection: "column", gap: 10 },
  convCard: { background: "#fff", borderRadius: 12, padding: "16px 20px", border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" },
  convInfo: { cursor: "pointer", flex: 1 },
  convTitle: { fontSize: 15, fontWeight: 600, color: "#1a1a1a", display: "block", marginBottom: 4 },
  convMeta: { fontSize: 12, color: "#999" },
  convRating: { fontSize: 13, color: "#f59e0b", marginLeft: 8 },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#c0392b" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, width: 560, maxWidth: "90vw", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" },
  modalTitle: { margin: "0 0 20px", fontSize: 19, fontWeight: 700, color: "#1a1a1a" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  msgList: { display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 },
  msgRow: { display: "flex", gap: 8, alignItems: "flex-start" },
  roleTag: { padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, minWidth: 72, textAlign: "center", marginTop: 4 },
  msgInput: { flex: 1, padding: "8px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 13.5, minHeight: 60, resize: "vertical", color: "#1a1a1a", boxSizing: "border-box", background: "#fafafa" },  removeBtn: { background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 14, marginTop: 4 },
};