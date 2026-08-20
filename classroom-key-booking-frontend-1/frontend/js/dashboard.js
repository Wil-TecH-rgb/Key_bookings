// ============================================================
// dashboard.js — powers the student dashboard: browsing rooms,
// submitting a booking, and viewing/cancelling your own bookings.
// ============================================================

requireAuth();

const student = getStudent();
if (student) {
  document.getElementById("welcomeText").textContent = "Hi, " + student.full_name.split(" ")[0];
}

let selectedRoom = null;

// ---------------- Logout ----------------

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearSession();
  window.location.href = "index.html";
});

// ---------------- Nav scroll-to (simple single-page sections) ----------------

document.querySelectorAll(".nav-item[data-view]").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item[data-view]").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    const view = item.dataset.view;
    if (view === "mybookings") {
      document.getElementById("bookingsBody").closest(".table-wrap").scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
});

// ---------------- Load rooms ----------------

async function loadRooms() {
  const grid = document.getElementById("roomGrid");
  try {
    const rooms = await apiRequest("/rooms", { auth: true });
    document.getElementById("roomCount").textContent = rooms.length + " rooms";

    if (rooms.length === 0) {
      grid.innerHTML = '<p class="eyebrow">No rooms configured yet.</p>';
      return;
    }

    grid.innerHTML = "";
    rooms.forEach(room => {
      const card = document.createElement("div");
      card.className = "room-card";
      card.dataset.roomId = room.id;
      card.dataset.roomName = room.room_name;
      card.innerHTML = `
        <div class="room-name">${escapeHtml(room.room_name)}</div>
        <div class="room-key mono">${escapeHtml(room.key_id)}</div>
        <span class="status-pill available"><span class="status-dot"></span>Available</span>
      `;
      card.addEventListener("click", () => selectRoom(card, room));
      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = '<p class="eyebrow">Could not load rooms: ' + escapeHtml(err.message) + '</p>';
  }
  refreshScrollReveal();
}

function selectRoom(card, room) {
  document.querySelectorAll(".room-card").forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");
  selectedRoom = room;

  document.getElementById("selectedRoomName").textContent = room.room_name;
  const panel = document.getElementById("bookingPanel");
  panel.style.display = "block";
  panel.classList.add("in-view"); // was hidden, so the scroll-observer never saw it — reveal it directly
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ---------------- Submit booking ----------------

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById("bookingError");
  const btn = document.getElementById("bookBtn");
  const confirmBox = document.getElementById("keyConfirm");
  errorBox.classList.remove("show");
  confirmBox.classList.remove("playing");

  if (!selectedRoom) {
    errorBox.textContent = "Select a room first.";
    errorBox.classList.add("show");
    return;
  }

  const booking_date = document.getElementById("bookingDate").value;
  const start_time = document.getElementById("startTime").value;
  const end_time = document.getElementById("endTime").value;

  btn.disabled = true;
  btn.textContent = "Reserving...";

  try {
    await apiRequest("/bookings", {
      method: "POST",
      auth: true,
      body: { room_id: selectedRoom.id, booking_date, start_time, end_time }
    });

    btn.style.display = "none";
    confirmBox.classList.add("playing");
    await loadMyBookings();

    setTimeout(() => {
      btn.style.display = "block";
      btn.disabled = false;
      btn.textContent = "Reserve key";
      confirmBox.classList.remove("playing");
      document.getElementById("bookingForm").reset();
      document.getElementById("bookingPanel").style.display = "none";
      document.querySelectorAll(".room-card").forEach(c => c.classList.remove("selected"));
      selectedRoom = null;
    }, 1800);
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add("show");
    btn.disabled = false;
    btn.textContent = "Reserve key";
  }
});

// ---------------- My bookings ----------------

async function loadMyBookings() {
  const body = document.getElementById("bookingsBody");
  try {
    const bookings = await apiRequest("/bookings/mine", { auth: true });
    document.getElementById("bookingCount").textContent = bookings.length + " total";

    if (bookings.length === 0) {
      body.innerHTML = `
        <tr><td colspan="5">
          <div class="empty-state">
            <span class="eyebrow">No bookings yet</span>
            Pick a room above to reserve your first key.
          </div>
        </td></tr>`;
      return;
    }

    body.innerHTML = "";
    bookings.forEach(b => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(b.room_name)}</td>
        <td class="mono">${escapeHtml(b.booking_date)}</td>
        <td class="mono">${escapeHtml(b.start_time)}&ndash;${escapeHtml(b.end_time)}</td>
        <td><span class="status-pill ${b.status}"><span class="status-dot"></span>${escapeHtml(b.status)}</span></td>
        <td>${b.status === "active" ? `<button class="small-action" data-id="${b.id}">Cancel</button>` : ""}</td>
      `;
      body.appendChild(row);
    });

    document.querySelectorAll(".small-action[data-id]").forEach(btn => {
      btn.addEventListener("click", () => cancelBooking(btn.dataset.id));
    });
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5" class="eyebrow">Could not load bookings: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function cancelBooking(id) {
  try {
    await apiRequest(`/bookings/${id}/cancel`, { method: "PUT", auth: true });
    await loadMyBookings();
  } catch (err) {
    alert(err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

loadRooms();
loadMyBookings();
