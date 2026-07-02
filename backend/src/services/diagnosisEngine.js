// ============================================================
// Moteur de règles pour le pré-diagnostic IA
// Analyse les symptômes et retourne un niveau de risque,
// une suggestion et une recommandation.
// ============================================================

const DISCLAIMER =
  "Ce résultat est indicatif et ne remplace pas un avis médical professionnel. En cas de doute ou de symptômes graves, consultez un médecin.";

function evaluateRisk(symptoms) {
  const {
    fievre,
    toux,
    fatigue,
    douleur,
    intensite_douleur = 0,
    difficulte_respiratoire,
    duree_jours = 0,
    age = 0,
    maladie_chronique,
  } = symptoms;

  let score = 0;
  let reasons = [];

  // === Règles critiques → HIGH direct ===

  // Difficulté respiratoire = HIGH
  if (difficulte_respiratoire === "oui" || difficulte_respiratoire === true) {
    return {
      risk_level: "HIGH",
      suggestion: "Suspicion d'affection respiratoire sévère nécessitant une prise en charge rapide.",
      recommendation:
        "Consultez un médecin en urgence ou rendez-vous aux urgences si les symptômes sont graves.",
      disclaimer: DISCLAIMER,
    };
  }

  // Douleur >= 8 = HIGH
  const painLevel = parseInt(intensite_douleur) || 0;
  if (painLevel >= 8) {
    return {
      risk_level: "HIGH",
      suggestion: "Douleur sévère nécessitant une évaluation médicale rapide.",
      recommendation:
        "Prenez rendez-vous en urgence avec votre médecin traitant ou consultez une structure d'urgence.",
      disclaimer: DISCLAIMER,
    };
  }

  // Age > 65 + symptômes importants = HIGH
  const ageNum = parseInt(age) || 0;
  const hasSignificantSymptoms =
    (fievre === "oui" || fievre === true) ||
    (difficulte_respiratoire === "oui" || difficulte_respiratoire === true) ||
    painLevel >= 5;
  if (ageNum > 65 && hasSignificantSymptoms) {
    return {
      risk_level: "HIGH",
      suggestion: "Patient âgé présentant des symptômes significatifs. Risque élevé de complication.",
      recommendation:
        "Consultez un médecin rapidement. Une évaluation médicale est fortement recommandée.",
      disclaimer: DISCLAIMER,
    };
  }

  // === Scoring pour les niveaux MOYEN / FAIBLE ===

  // Fièvre
  if (fievre === "oui" || fievre === true) {
    score += 3;
    reasons.push("fièvre");
  }

  // Toux
  if (toux === "oui" || toux === true) {
    score += 2;
    reasons.push("toux");
  }

  // Fatigue
  if (fatigue === "oui" || fatigue === true) {
    score += 1;
    reasons.push("fatigue");
  }

  // Douleur
  if (douleur === "oui" || douleur === true) {
    score += painLevel >= 5 ? 3 : 1;
    reasons.push(`douleur (intensité ${painLevel}/10)`);
  }

  // Durée > 7 jours
  const durationNum = parseInt(duree_jours) || 0;
  if (durationNum > 7) {
    score += 2;
    reasons.push("durée prolongée");
  }

  // Maladie chronique + fièvre
  if ((maladie_chronique === "oui" || maladie_chronique === true) && (fievre === "oui" || fievre === true)) {
    score += painLevel >= 5 ? 4 : 2;
    reasons.push("maladie chronique avec fièvre");
  }

  // Maladie chronique seule
  if (maladie_chronique === "oui" || maladie_chronique === true) {
    score += 1;
    reasons.push("maladie chronique");
  }

  // === Détermination du niveau de risque ===
  if (score >= 6) {
    return {
      risk_level: "MEDIUM",
      suggestion: `Symptômes modérés (${reasons.join(", ")}). Une consultation est conseillée.`,
      recommendation:
        "Prenez rendez-vous avec votre médecin traitant dans les jours à venir pour une évaluation.",
      disclaimer: DISCLAIMER,
    };
  }

  if (score >= 3) {
    return {
      risk_level: "LOW",
      suggestion: `Symptômes légers (${reasons.join(", ")}). Probablement bénin.`,
      recommendation:
        "Surveillez l'évolution de vos symptômes. Reposez-vous et hydratez-vous. Consultez si les symptômes s'aggravent ou persistent.",
      disclaimer: DISCLAIMER,
    };
  }

  // Symptômes légers et durée courte = LOW
  return {
    risk_level: "LOW",
    suggestion:
      "Symptômes très légers ou absence de symptômes significatifs. Aucune inquiétude particulière.",
    recommendation:
      "Surveillez votre état. Si de nouveaux symptômes apparaissent, n'hésitez pas à refaire une analyse.",
    disclaimer: DISCLAIMER,
  };
}

module.exports = { evaluateRisk, DISCLAIMER };