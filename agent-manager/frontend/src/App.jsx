import { useState, useEffect } from "react";
import { getAgents, createAgent, updateAgent, deleteAgent } from "./api/agents";
import AgentDetail from "./components/AgentDetail";

export default function App() {
  const [agents, setAgents] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const load = () => getAgents().then(setAgents);
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: "", description: "" });
    setError("");
    setModal("create");
  };

  const openEdit = (agent) => {
    setForm({ name: agent.name, description: agent.description || "" });
    setError("");
    setModal(agent);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Agent name is required"); return; }
    const isEdit = modal !== "create";
    const res = isEdit
      ? await updateAgent(modal.id, form)
      : await createAgent(form);
    if (res.ok) {
      setModal(null);
      load();
    } else {
      const data = await res.json();
      setError(data.detail || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    await deleteAgent(confirmDelete.id);
    setConfirmDelete(null);
    load();
  };

  if (selectedAgent) {
    return <AgentDetail agent={selectedAgent} onBack={() => { setSelectedAgent(null); load(); }} />;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>🤖 Agents</h1>
        <button style={styles.btnPrimary} onClick={openCreate}>+ Create Agent</button>
      </header>

      {agents.length === 0 ? (
        <p style={styles.empty}>No agents yet. Click "+ Create Agent" to get started.</p>
      ) : (
        <div style={styles.grid}>
          {agents.map(agent => (
            <div key={agent.id} style={styles.card}>
              <div style={styles.cardBody} onClick={() => setSelectedAgent(agent)}>
                <h2 style={styles.agentName}>{agent.name}</h2>
                <p style={styles.agentDesc}>{agent.description || <em>No description</em>}</p>
              </div>
              <div style={styles.cardActions}>
                <button style={styles.btnEdit} onClick={(e) => { e.stopPropagation(); openEdit(agent); }}>✏️ Edit</button>
                <button style={styles.btnDelete} onClick={(e) => { e.stopPropagation(); setConfirmDelete(agent); }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>{modal === "create" ? "Create Agent" : "Edit Agent"}</h2>
            <label style={styles.label}>Agent Name *</label>
            <input
              style={styles.input}
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Sales Helper"
            />
            <label style={styles.label}>Description (optional)</label>
            <textarea
              style={{ ...styles.input, height: 80, resize: "vertical" }}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What does this agent do?"
            />
            {error && <p style={styles.error}>⚠️ {error}</p>}
            <div style={styles.modalActions}>
              <button style={styles.btnSecondary} onClick={() => setModal(null)}>Cancel</button>
              <button style={styles.btnPrimary} onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Delete Agent?</h2>
            <p>Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>? This cannot be undone.</p>
            <div style={styles.modalActions}>
              <button style={styles.btnSecondary} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={styles.btnDeleteConfirm} onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1200, margin: "0 auto", padding: "48px 48px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", background: "#f0f0f0", minHeight: "100vh" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 },
  title: { fontSize: 26, fontWeight: 700, margin: 0, color: "#1a1a1a", letterSpacing: "-0.5px" },
  empty: { color: "#999", textAlign: "center", marginTop: 80, fontSize: 15 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 },
  card: { border: "1px solid #ddd", borderRadius: 14, padding: 22, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.04)", cursor: "pointer" },
  cardBody: { marginBottom: 18 },
  agentName: { fontSize: 17, fontWeight: 650, margin: "0 0 8px", color: "#1a1a1a" },
  agentDesc: { color: "#777", fontSize: 13.5, margin: 0, lineHeight: 1.6 },
  cardActions: { display: "flex", gap: 8 },
  btnPrimary: { background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13.5 },
  btnSecondary: { background: "#ebebeb", color: "#333", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 13.5 },
  btnEdit: { background: "#f4f4f4", color: "#444", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 13 },
  btnDelete: { background: "#f4f4f4", color: "#c0392b", border: "none", borderRadius: 6, padding: "7px 14px", cursor: "pointer", fontSize: 13 },
  btnDeleteConfirm: { background: "#c0392b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 600 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modal: { background: "#fff", borderRadius: 16, padding: 32, width: 440, maxWidth: "90vw", boxShadow: "0 24px 60px rgba(0,0,0,0.15)" },
  modalTitle: { margin: "0 0 22px", fontSize: 19, fontWeight: 700, color: "#1a1a1a" },
  label: { display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "#555", textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { width: "100%", padding: "10px 12px", border: "1.5px solid #e0e0e0", borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: "border-box", outline: "none", background: "#fafafa", color: "#1a1a1a" },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  error: { color: "#c0392b", fontSize: 13, margin: "-8px 0 12px", fontWeight: 500 },
};