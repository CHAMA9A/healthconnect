const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    // Vérifications des champs obligatoires
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Vérifier si l'email existe déjà
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création de l'utilisateur
    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: role || "PATIENT",
    });

    // Génération du token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Erreur register:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    // Vérifier l'utilisateur
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Mettre à jour la dernière connexion
    await User.updateLastLogin(user.id);

    // Génération du token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Erreur login:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Erreur me:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};