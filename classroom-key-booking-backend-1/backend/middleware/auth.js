// Middleware that checks for a valid login token before allowing
// access to protected routes (e.g., creating a booking).

const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  // Expecting header format: "Bearer <token>"
  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    // Attach decoded student info to the request so routes can use it
    req.student = decoded;
    next();
  });
}

module.exports = verifyToken;
