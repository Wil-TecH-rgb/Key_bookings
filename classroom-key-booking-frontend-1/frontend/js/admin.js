// ============================================================
// admin.js — porter/admin view of every booking in the system.
// NOTE: reuses the same student login for now since the backend
// doesn't yet have separate admin authentication. See the note
// in the README about adding a real admin login before production use.
// ============================================================

requireAuth();

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

async function loadAllBookings() {
  const body = document.getElementById("bookingsBody");
  try {
    const bookings = await apiRequest("/bookings/all", { auth: true });
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
        <td class="mono">${escapeHtml(b.start_time)}&ndash;${escapeHtml(b.end_time)}</td>
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
  refreshScrollReveal();
}

async function markReturned(id) {
  try {
    await apiRequest(`/bookings/${id}/return`, { method: "PUT", auth: true });
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

loadAllBookings();
