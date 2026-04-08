const BASE = "http://localhost:8000";

const clean = (data) => ({
  name: data.name,
  description: data.description?.trim() || null,
});

export const getAgents = () =>
  fetch(`${BASE}/agents`).then(r => r.json());

export const createAgent = (data) =>
  fetch(`${BASE}/agents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clean(data)),
  });

export const updateAgent = (id, data) =>
  fetch(`${BASE}/agents/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clean(data)),
  });

export const deleteAgent = (id) =>
  fetch(`${BASE}/agents/${id}`, { method: "DELETE" });