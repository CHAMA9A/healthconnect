const jwt = require("jsonwebtoken");

const auth = (requiredRole = null) => {
  return (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accès non autorisé" });
    }

    const token = header.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (requiredRole && req.user.role !== requiredRole && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Accès interdit" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }
  };
};

module.exports = auth;