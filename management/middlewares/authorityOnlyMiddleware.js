const checkAuthorityRole = (req, res, next) => {
  if (req.user.role !== "Authority") {
    return res.status(403).json({ error: "Access denied. Not an Authority." });
  }
  next();
};

module.exports = checkAuthorityRole;
