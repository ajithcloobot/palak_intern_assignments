import { useState } from "react";
import { upsertFeedback } from "../api/conversations";

export default function ConversationView({ conversation, onBack }) {
  const [rating, setRating] = useState(conversation.feedback?.rating || null);
  const [comment, setComment] = useState(conversation.feedback?.comment || "");
  const [saved, setSaved] = useState(!!conversation.feedback);
  const [saving, setSaving] = useState(false);

  const handleSaveFeedback = async () => {
    setSaving(true);
    await upsertFeedback(conversation.id, { rating, comment });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={onBack}>← Back</button>
      <h1 style={styles.title}>{conversation.title}</h1>
      <p style={styles.meta}>{new Date(conversation.created_at).toLocaleString()}</p>

      {/* Messages */}
      <div style={styles.msgList}>
        {conversation.messages.map((msg, i) => (
          <div key={i} style={{ ...styles.msgBubble, alignSelf: msg.role === "user" ? "flex-end" : "flex-start", background: msg.role === "user" ? "#1a1a1a" : "#fff", color: msg.role === "user" ? "#fff" : "#1a1a1a" }}>
            <span style={{ ...styles.roleLabel, color: msg.role === "user" ? "#ccc" : "#999" }}>{msg.role}</span>
            <p style={styles.msgText}>{msg.content}</p>
          </div>
        ))}
      </div>

      {/* Feedback */}
      <div style={styles.feedbackBox}>
        <h2 style={styles.feedbackTitle}>Feedback</h2>

        <div style={styles.ratingRow}>
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              style={{ ...styles.starBtn, color: rating >= n ? "#f59e0b" : "#ddd", fontSize: rating >= n ? 28 : 24 }}
              onClick={() => setRating(n)}
            >★</button>
          ))}
          {rating && <span style={styles.ratingLabel}>{["", "Poor", "Fair", "Good", "Great"][rating]}</span>}
        </div>

        <textarea
          style={styles.commentInput}
          value={comment}
          onChange={e => { setComment(e.target.value); setSaved(false); }}
          placeholder="Add a comment (optional)..."
        />

        <div style={styles.feedbackActions}>
          {saved && <span style={styles.savedMsg}>✓ Feedback saved</span>}
          <button style={styles.btnPrimary} onClick={handleSaveFeedback} disabled={saving}>
            {saving ? "Saving..." : saved ? "Update Feedback" : "Save Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 760, margin: "0 auto", padding: "40px 32px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#f0f0f0", minHeight: "100vh" },
  backBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#555", marginBottom: 16, padding: 0 },
  title: { fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#1a1a1a" },
  meta: { fontSize: 12, color: "#999", margin: "0 0 24px" },
  msgList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 },
  msgBubble: { maxWidth: "75%", padding: "12px 16px", borderRadius: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  roleLabel: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 4 },
  msgText: { margin: 0, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" },
  feedbackBox: { background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #e0e0e0" },
  feedbackTitle: { fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#1a1a1a" },
  ratingRow: { display: "flex", alignItems: "center", gap: 4, marginBottom: 16 },
  starBtn: { background: "none", border: "none", cursor: "pointer", padding: "0 2px", lineHeight: 1, transition: "font-size 0.1s" },
  ratingLabel: { fontSize: 13, color: "#666", marginLeft: 8 },
  commentInput: { width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, minHeight: 80, resize: "vertical", boxSizing: "border-box", color: "#1a1a1a" },
  feedbackActions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  savedMsg: { fontSize: 13, color: "#16a34a", fontWeight: 500 },
  btnPrimary: { background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 },
};