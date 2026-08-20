const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/rooms - list all active rooms
router.get('/', async (req, res) => {
  try {
    const [rooms] = await pool.query('SELECT id, room_name, key_id FROM rooms WHERE is_active = TRUE');
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch rooms.' });
  }
});

module.exports = router;
