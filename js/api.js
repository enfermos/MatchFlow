const API_BASE = "http://localhost:3005";

// GET
export const getData = async (endpoint) => {
  const res = await fetch(API_BASE + endpoint);

  if (!res.ok) return null;

  return res.json();
};

// POST
export const postData = async (endpoint, data) => {
  const res = await fetch(API_BASE + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) return null;

  return res.json();
};

// PUT
export const putData = async (endpoint, data) => {
  const res = await fetch(API_BASE + endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) return null;

  return res.json();
};

// DELETE
export const deleteData = async (endpoint) => {
  const res = await fetch(API_BASE + endpoint, {
    method: "DELETE",
  });

  return res.ok;
};

/* SESIÓN */

export const getSession = () => {
  return JSON.parse(localStorage.getItem("auth_user"));
};

export const setSession = (user) => {
  localStorage.setItem("auth_user", JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem("auth_user");
};
