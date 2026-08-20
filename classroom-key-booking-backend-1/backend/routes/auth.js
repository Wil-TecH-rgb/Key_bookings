const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();
const pool = require('../config/db');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { full_name, index_number, email, password } = req.body;

    if (!full_name || !index_number || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Check if a student already exists with this email or index number
    const [existing] = await pool.query(
      'SELECT id FROM students WHERE email = ? OR index_number = ?',
      [email, index_number]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email or index number already registered.' });
    }

    // Hash the password before storing it — never store plain text passwords
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO students (full_name, index_number, email, password_hash) VALUES (?, ?, ?, ?)',
      [full_name, index_number, email, password_hash]
    );

    res.status(201).json({ message: 'Account created successfully.', student_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during signup.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const student = rows[0];
    const passwordMatches = await bcrypt.compare(password, student.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create a token the frontend will send with future requests
    const token = jwt.sign(
      { id: student.id, full_name: student.full_name, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Login successful.', token, student: { id: student.id, full_name: student.full_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong during login.' });
  }
});

module.exports = router;
