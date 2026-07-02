exports.getDashboard = async (req, res) => {
  try {
    const { id, role } = req.user;

    // Données basiques selon le rôle
    const dashboardData = {
      user_id: id,
      role,
      message: `Bienvenue sur votre tableau de bord ${
        role === "PATIENT"
          ? "patient"
          : role === "DOCTOR"
          ? "médecin"
          : "administrateur"
      }`,
      stats: {
        title:
          role === "PATIENT"
            ? "Mes rendez-vous"
            : role === "DOCTOR"
            ? "Mes patients"
            : "Vue d'ensemble",
        count: 0,
      },
    };

    res.json(dashboardData);
  } catch (err) {
    console.error("Erreur dashboard:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};