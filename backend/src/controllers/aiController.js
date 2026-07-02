const AIDiagnosis = require("../models/AIDiagnosis");
const { evaluateRisk } = require("../services/diagnosisEngine");

// POST /api/ai/pre-diagnosis
exports.createPreDiagnosis = async (req, res) => {
  try {
    const patientId = req.user.id;

    const {
      fievre,
      toux,
      fatigue,
      douleur,
      intensite_douleur,
      difficulte_respiratoire,
      duree_jours,
      age,
      maladie_chronique,
      description_libre,
    } = req.body;

    // Validation des champs obligatoires
    if (fievre === undefined || toux === undefined || fatigue === undefined) {
      return res.status(400).json({ message: "Les champs fièvre, toux et fatigue sont requis." });
    }

    const symptoms = {
      fievre,
      toux,
      fatigue,
      douleur: douleur || "non",
      intensite_douleur: intensite_douleur || 0,
      difficulte_respiratoire: difficulte_respiratoire || "non",
      duree_jours: duree_jours || 0,
      age: age || 0,
      maladie_chronique: maladie_chronique || "non",
      description_libre: description_libre || "",
    };

    // Analyse par le moteur de règles
    const result = evaluateRisk(symptoms);

    // Sauvegarde en base de données
    const diagnosis = await AIDiagnosis.create({
      patientId,
      symptoms,
      riskLevel: result.risk_level,
      suggestion: result.suggestion,
      recommendation: result.recommendation,
      disclaimer: result.disclaimer,
    });

    res.status(201).json({
      message: "Pré-diagnostic réalisé avec succès",
      data: {
        id: diagnosis.id,
        risk_level: diagnosis.risk_level,
        suggestion: diagnosis.suggestion,
        recommendation: diagnosis.recommendation,
        disclaimer: diagnosis.disclaimer,
        created_at: diagnosis.created_at,
      },
    });
  } catch (err) {
    console.error("Erreur createPreDiagnosis:", err.message);
    res.status(500).json({ message: "Erreur serveur lors de l'analyse" });
  }
};

// GET /api/ai/history
exports.getHistory = async (req, res) => {
  try {
    const patientId = req.user.id;
    const diagnoses = await AIDiagnosis.findByPatientId(patientId);
    res.json(diagnoses);
  } catch (err) {
    console.error("Erreur getHistory:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// GET /api/ai/:id
exports.getById = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    const diagnosis = await AIDiagnosis.findById(id, patientId);
    if (!diagnosis) {
      return res.status(404).json({ message: "Pré-diagnostic introuvable" });
    }

    res.json(diagnosis);
  } catch (err) {
    console.error("Erreur getById:", err.message);
    res.status(500).json({ message: "Erreur serveur" });
  }
};