// ============================================================
// api.js — thin wrapper around fetch() for talking to the backend.
// Change API_BASE to your EC2 public IP/domain once deployed.
// ============================================================

const API_BASE = "http://13.60.54.95:5000"; // TODO: replace with your EC2 URL, e.g. http://YOUR_EC2_IP:5000/api

function getToken() {
  return localStorage.getItem("ckb_token");
}

function setSession(token, student) {
  localStorage.setItem("ckb_token", token);
  localStorage.setItem("ckb_student", JSON.stringify(student));
}

function clearSession() {
  localStorage.removeItem("ckb_token");
  localStorage.removeItem("ckb_student");
}

function getStudent() {
  const raw = localStorage.getItem("ckb_student");
  return raw ? JSON.parse(raw) : null;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = "index.html";
  }
}

// Core request helper. Automatically attaches the auth token if present.
async function apiRequest(path, { method = "GET", body = null, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const message = (data && data.error) ? data.error : "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
}
