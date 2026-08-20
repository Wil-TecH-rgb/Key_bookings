# Classroom Key Booking — Frontend

Modern static frontend (HTML/CSS/vanilla JS) built to work with the Express/MySQL backend.

## Files

- `index.html` + `js/auth.js` — Sign in / create account, with a 3D flip transition between the two forms
- `dashboard.html` + `js/dashboard.js` — Student view: browse rooms, book a key, view/cancel your bookings
- `admin.html` + `js/admin.js` — Porter/admin view: see all bookings, mark keys as returned
- `js/api.js` — shared fetch wrapper; **set `API_BASE` here to your EC2 URL** before deploying
- `css/style.css` — the full design system (colors, type, animations)

## Before you deploy

1. Open `js/api.js` and change:
   ```js
   const API_BASE = "http://localhost:5000/api";
   ```
   to your real backend URL, e.g. `http://<your-ec2-public-ip>:5000/api`

2. Host these files anywhere static (GitHub Pages, S3, or directly on EC2 behind your backend).

## Design notes

- **Palette:** `#021024 / #052659 / #5483B3 / #7DA0CA / #C1E8FF` (from the supplied gradient), plus a small muted green/red strictly for room-availability status.
- **Type:** Space Grotesk (headings), Inter (body), JetBrains Mono (room codes, timestamps).
- **Signature interaction:** the login/signup card does a real 3D flip (`turn-key` keyframe in `style.css`), like a keycard turning — a nod to the "key" in Classroom Key Booking.
- **Motion:** every hover/transition uses `cubic-bezier(.22,1,.36,1)` for a consistent, Apple-style ease-out feel — used in the expanding pill nav bar and the "key sliding home" booking-confirmation animation.
- Respects `prefers-reduced-motion` — animations are disabled for users who have that OS setting on.
- **Scroll reveals:** sections on the dashboard/admin pages (room grid, booking panel, bookings table) fade and rise into place as you scroll, using `IntersectionObserver` (`js/scroll-reveal.js`) — same easing curve as everything else, so it feels like one system rather than a bolted-on effect. The room grid staggers each card slightly (60ms apart) rather than revealing all at once.

## Known limitation

The admin page currently re-uses the same student login (the backend doesn't yet have separate admin authentication — there's an `admins` table in the schema but no login route wired to it). For your final submission, either:
- Add a `POST /api/auth/admin-login` route on the backend using the `admins` table, or
- Note in your report that admin access is a planned enhancement.
