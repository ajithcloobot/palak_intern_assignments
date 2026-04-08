const BASE = "http://localhost:8000";

export const getConversations = (agentId) =>
  fetch(`${BASE}/agents/${agentId}/conversations`).then(r => r.json());

export const getConversation = (id) =>
  fetch(`${BASE}/conversations/${id}`).then(r => r.json());

export const createConversation = (agentId, data) =>
  fetch(`${BASE}/agents/${agentId}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const uploadConversations = (agentId, data) =>
  fetch(`${BASE}/agents/${agentId}/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteConversation = (id) =>
  fetch(`${BASE}/conversations/${id}`, { method: "DELETE" });

export const upsertFeedback = (conversationId, data) =>
  fetch(`${BASE}/conversations/${conversationId}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const updateGuideline = (agentId, guideline) =>
  fetch(`${BASE}/agents/${agentId}/guideline`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system_guideline: guideline }),
  });