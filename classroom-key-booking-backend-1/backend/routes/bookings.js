const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// All booking routes require the student to be logged in
router.use(verifyToken);

// POST /api/bookings - create a new booking
router.post('/', async (req, res) => {
  try {
    const { room_id, booking_date, start_time, end_time } = req.body;
    const student_id = req.student.id;

    if (!room_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'room_id, booking_date, start_time, and end_time are required.' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({ error: 'start_time must be before end_time.' });
    }

    // Check for an overlapping active booking on the same room and date.
    // Two time ranges overlap if one starts before the other ends, in both directions.
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings
       WHERE room_id = ?
         AND booking_date = ?
         AND status = 'active'
         AND start_time < ?
         AND end_time > ?`,
      [room_id, booking_date, end_time, start_time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'This room is already booked for the selected time.' });
    }

    const [result] = await pool.query(
      `INSERT INTO bookings (student_id, room_id, booking_date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [student_id, room_id, booking_date, start_time, end_time]
    );

    res.status(201).json({ message: 'Booking created successfully.', booking_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create booking.' });
  }
});

// GET /api/bookings/mine - view the logged-in student's own bookings
router.get('/mine', async (req, res) => {
  try {
    const student_id = req.student.id;
    const [bookings] = await pool.query(
      `SELECT b.id, r.room_name, b.booking_date, b.start_time, b.end_time, b.status
       FROM bookings b
       JOIN rooms r ON b.room_id = r.id
       WHERE b.student_id = ?
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [student_id]
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch your bookings.' });
  }
});

// PUT /api/bookings/:id/cancel - cancel a booking (only your own)
router.put('/:id/cancel', async (req, res) => {
  try {
    const student_id = req.student.id;
    const booking_id = req.params.id;

    const [result] = await pool.query(
      `UPDATE bookings SET status = 'cancelled'
       WHERE id = ? AND student_id = ? AND status = 'active'`,
      [booking_id, student_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Active booking not found for this student.' });
    }

    res.json({ message: 'Booking cancelled.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not cancel booking.' });
  }
});

// PUT /api/bookings/:id/return - mark a key as returned (admin/porter use)
router.put('/:id/return', async (req, res) => {
  try {
    const booking_id = req.params.id;

    const [result] = await pool.query(
      `UPDATE bookings SET status = 'returned' WHERE id = ? AND status = 'active'`,
      [booking_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Active booking not found.' });
    }

    res.json({ message: 'Key marked as returned.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update booking.' });
  }
});

// GET /api/bookings/all - admin view of all active bookings
router.get('/all', async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.id, s.full_name, s.index_number, r.room_name, b.booking_date, b.start_time, b.end_time, b.status
       FROM bookings b
       JOIN students s ON b.student_id = s.id
       JOIN rooms r ON b.room_id = r.id
       ORDER BY b.booking_date DESC, b.start_time DESC`
    );
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch bookings.' });
  }
});

module.exports = router;
