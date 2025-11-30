import api from "./client";

export async function getUsers() {
  const res = await api.get("/users");
  return res.data;
}

export async function createUser(user) {
  const res = await api.post("/users", user);
  return res.data;
}
