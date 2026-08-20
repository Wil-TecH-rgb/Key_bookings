const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');

const app = express();

// Allow the frontend (hosted elsewhere, e.g. GitHub Pages) to call this API
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// Simple health check - visit this to confirm the server is alive
app.get('/', (req, res) => {
  res.json({ status: 'Classroom Key Booking API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
