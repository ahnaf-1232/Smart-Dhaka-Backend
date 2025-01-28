const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const secretKey = process.env.JWT_SECRET; // Make sure you have this in your environment variables
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMiddleware;
