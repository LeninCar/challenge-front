import api from "./client";

export async function createRequest(payload) {
  const res = await api.post("/requests", payload);
  return res.data;
}

export async function getRequestsByApprover(approverId) {
  const res = await api.get(`/requests/by-approver/${approverId}`);
  return res.data;
}

export async function getPendingRequests(approverId) {
  const res = await api.get(`/requests/pending/${approverId}`);
  return res.data;
}

export async function getRequestDetail(id) {
  const res = await api.get(`/requests/${id}`);
  return res.data;
}

export async function changeRequestStatus(id, { newStatus, comment, actor_id }) {
  const res = await api.post(`/requests/${id}/status`, {
    newStatus,
    comment,
    actor_id,
  });
  return res.data;
}
