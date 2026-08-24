// ============================================================
// admin.js — porter/admin login + view of every booking in the system.
// ============================================================

const adminLoginView = document.getElementById("adminLoginView");
const adminDashboardView = document.getElementById("adminDashboardView");

// If already logged in as admin, skip straight to the dashboard.
if (localStorage.getItem("ckb_admin_token")) {
  showDashboard();
}

document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById("adminLoginError");
  const btn = document.getElementById("adminLoginBtn");
  errorBox.classList.remove("show");

  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;

  btn.disabled = true;
  btn.textContent = "Signing in...";

  try {
    const data = await apiRequest("/auth/admin-login", {
      method: "POST",
      body: { email, password }
    });
    localStorage.setItem("ckb_admin_token", data.token);
    localStorage.setItem("ckb_admin", JSON.stringify(data.admin));
    showDashboard();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add("show");
    btn.disabled = false;
    btn.textContent = "Sign in";
  }
});

function showDashboard() {
  adminLoginView.classList.add("view-hidden");
  adminDashboardView.classList.remove("view-hidden");
  loadAllBookings();
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("ckb_admin_token");
  localStorage.removeItem("ckb_admin");
  window.location.href = "admin.html";
});

async function loadAllBookings() {
  const body = document.getElementById("bookingsBody");
  try {
    const token = localStorage.getItem("ckb_admin_token");
    const response = await fetch(API_BASE + "/bookings/all", {
      headers: { "Authorization": "Bearer " + token }
    });
    const bookings = await response.json();

    if (!response.ok) throw new Error(bookings.error || "Could not fetch bookings.");

    document.getElementById("bookingCount").textContent = bookings.length + " total";

    if (bookings.length === 0) {
      body.innerHTML = `
        <tr><td colspan="7">
          <div class="empty-state">
            <span class="eyebrow">No bookings yet</span>
            Bookings will show up here as students reserve keys.
          </div>
        </td></tr>`;
      return;
    }

    body.innerHTML = "";
    bookings.forEach(b => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(b.full_name)}</td>
        <td class="mono">${escapeHtml(b.index_number)}</td>
        <td>${escapeHtml(b.room_name)}</td>
        <td class="mono">${escapeHtml(b.booking_date)}</td>
        <td class="mono">${escapeHtml(b.start_time)}–${escapeHtml(b.end_time)}</td>
        <td><span class="status-pill ${b.status}"><span class="status-dot"></span>${escapeHtml(b.status)}</span></td>
        <td>${b.status === "active" ? `<button class="small-action positive" data-id="${b.id}">Mark returned</button>` : ""}</td>
      `;
      body.appendChild(row);
    });

    document.querySelectorAll(".small-action[data-id]").forEach(btn => {
      btn.addEventListener("click", () => markReturned(btn.dataset.id));
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="7" class="eyebrow">Could not load bookings: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function markReturned(id) {
  try {
    const token = localStorage.getItem("ckb_admin_token");
    const response = await fetch(API_BASE + "/bookings/" + id + "/return", {
      method: "PUT",
      headers: { "Authorization": "Bearer " + token }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not update booking.");
    await loadAllBookings();
  } catch (err) {
    alert(err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
