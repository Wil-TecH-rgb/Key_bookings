// ============================================================
// auth.js — handles the login/signup forms and the flip transition
// between them on the auth page.
// ============================================================

const authCard = document.getElementById("authCard");
const loginPanel = document.getElementById("loginPanel");
const signupPanel = document.getElementById("signupPanel");

// If already logged in, skip straight to the dashboard.
if (getToken()) {
  window.location.href = "dashboard.html";
}

function switchPanel(showSignupNext) {
  // Kick off the flip animation on the card.
  authCard.classList.remove("flip");
  // Force reflow so the animation can restart if triggered twice quickly.
  void authCard.offsetWidth;
  authCard.classList.add("flip");

  // Swap which panel is visible at the animation's halfway point,
  // exactly when the card is edge-on to the viewer (invisible).
  setTimeout(() => {
    if (showSignupNext) {
      loginPanel.classList.add("view-hidden");
      signupPanel.classList.remove("view-hidden");
    } else {
      signupPanel.classList.add("view-hidden");
      loginPanel.classList.remove("view-hidden");
    }
  }, 390); // half of the 780ms turn-key animation
}

document.getElementById("showSignup").addEventListener("click", () => switchPanel(true));
document.getElementById("showLogin").addEventListener("click", () => switchPanel(false));

// ---------------- Login ----------------

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById("loginError");
  const btn = document.getElementById("loginBtn");
  errorBox.classList.remove("show");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  btn.disabled = true;
  btn.textContent = "Signing in...";

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password }
    });
    setSession(data.token, data.student);
    window.location.href = "dashboard.html";
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add("show");
    btn.disabled = false;
    btn.textContent = "Sign in";
  }
});

// ---------------- Signup ----------------

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById("signupError");
  const btn = document.getElementById("signupBtn");
  errorBox.classList.remove("show");

  const full_name = document.getElementById("signupName").value.trim();
  const index_number = document.getElementById("signupIndex").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;

  btn.disabled = true;
  btn.textContent = "Creating account...";

  try {
    await apiRequest("/auth/signup", {
      method: "POST",
      body: { full_name, index_number, email, password }
    });
    // Auto switch back to login after successful signup
    switchPanel(false);
    setTimeout(() => {
      document.getElementById("loginEmail").value = email;
    }, 450);
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add("show");
  } finally {
    btn.disabled = false;
    btn.textContent = "Create account";
  }
});
