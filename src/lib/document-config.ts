import type { DocumentType } from "./mock-data";

// --- Types pour la structure des documents ---
export interface DocType {
  id: DocumentType;
  label: string;
  groupe: string; // Code du groupe (ex: "A")
  prix: number;
  delai: string;
  disabled?: boolean;
}

export interface GroupType {
  code: string;
  titre: string;
  description: string;
}

// --- Groupes de documents ---
// Cette structure définit les différents parcours utilisateurs.
export const GROUPES: GroupType[] = [
  {
    code: "A",
    titre: "Groupe A : Documents avec Supervision Requise",
    description:
      "Actes nécessitant une étude de dossier et la validation par un agent (déclarations, certificats...).",
  },
  {
    code: "B",
    titre: "Groupe B : Renouvellements & Copies (Circuit Simplifié)",
    description:
      "Copies d'actes déjà existants dans les registres (extraits, etc.) avec paiement en ligne.",
  },
  {
    code: "C",
    titre: "Groupe C : Actes sensibles à Retrait Obligatoire",
    description: "Documents nécessitant une validation et un retrait physique exclusif en mairie.",
  },
  {
    code: "D",
    titre: "Groupe D : Titres d'Identité & Voyage",
    description: "Démarches liées aux documents d'identité nationaux (Passeport, CNI...).",
  },
];

// --- Référentiel des documents par groupe ---
// C'est ici que la logique métier de votre tableau est appliquée.
export const DOCUMENTS: DocType[] = [
  // --- Groupe A : Instruction & Validation (Circuit Long / avec supervision) ---
  {
    id: "certificat_residence",
    label: "Certificat de résidence",
    groupe: "A",
    prix: 500,
    delai: "< 3 min",
  },
  {
    id: "attestation_hebergement",
    label: "Attestation d'hébergement",
    groupe: "A",
    prix: 500,
    delai: "< 3 min",
  },
  { id: "celibat", label: "Certificat de célibat", groupe: "A", prix: 1000, delai: "< 5 min" },
  {
    id: "non-remariage",
    label: "Certificat de non-remariage",
    groupe: "A",
    prix: 1000,
    delai: "< 5 min",
  },
  { id: "certificat_vie", label: "Certificat de vie", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "indigence", label: "Certificat d'indigence", groupe: "A", prix: 0, delai: "< 5 min" },
  {
    id: "legalisation",
    label: "Légalisation de signature",
    groupe: "A",
    prix: 500,
    delai: "< 3 min",
  }, // Exige la présence de l'agent

  // --- Groupe B : Rééditions & Copies (Circuit Court / Simplifié) ---
  {
    id: "extrait_naissance",
    label: "Extrait d'acte de naissance",
    groupe: "B",
    prix: 1000,
    delai: "< 5 min",
  },
  { id: "mariage", label: "Extrait d'acte de mariage", groupe: "B", prix: 2000, delai: "< 5 min" },
  { id: "deces", label: "Extrait d'acte de décès", groupe: "B", prix: 1000, delai: "< 5 min" },
  {
    id: "copie",
    label: "Certification de copie conforme",
    groupe: "B",
    prix: 500,
    delai: "< 3 min",
  },

  // --- Groupe C : Actes sensibles (Circuit Long / avec supervision, Retrait Obligatoire) ---
  {
    id: "declaration-deces",
    label: "Déclaration de décès",
    groupe: "C",
    prix: 0,
    delai: "Variable",
  },
  { id: "permis-inhumer", label: "Permis d'inhumer", groupe: "C", prix: 5000, delai: "Variable" },

  // --- Groupe D : Titres d'Identité (Nouveau) ---
  {
    id: "renouvellement_passeport",
    label: "Renouvellement de Passeport",
    groupe: "D",
    prix: 40000,
    delai: "3-4 semaines",
  },
];
