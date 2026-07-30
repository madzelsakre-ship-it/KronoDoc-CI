// --- Simulation d'une base de données partagée ---
// Dans une application réelle, ces données seraient gérées par un backend
// et les mises à jour se feraient via des appels API et des WebSockets.

// Define a union type for document types, reflecting potential document types in the system.
// This list should be the single source of truth for document IDs.
// It is synchronized with the `id` fields in `citoyen.tsx`.
export type DocumentType =
  | "certificat_residence"
  | "attestation_hebergement"
  | "celibat" // Corrected to match citoyen.tsx
  | "non-remariage"
  | "certificat_vie" // Corrected to match citoyen.tsx
  | "indigence"
  | "extrait_naissance"
  | "mariage"
  | "deces"
  | "legalisation"
  | "copie"
  | "declaration-deces"
  | "permis-inhumer"
  | "certificat_nationalite"; // From initial data

export type DossierStatut = "en_attente" | "ocr_ok" | "valide" | "rejete" | "signature";

export interface Dossier {
  id: string;
  nom: string;
  doc: DocumentType; // Use the new DocumentType
  heure: string;
  statut: DossierStatut;
  avatar: string;
  color: string;
  textColor: string;
}

export type NewDossierPayload = Pick<Dossier, "id" | "nom" | "doc">;

let queue: Dossier[] = [
  // Updated doc types to match DocumentType union
  {
    id: "KDC-2026-00848",
    nom: "Diabaté Moussa",
    doc: "extrait_naissance",
    heure: "14:31",
    statut: "en_attente",
    avatar: "DM",
    color: "#EEF2FF",
    textColor: "#3730A3",
  },
  {
    id: "KDC-2026-00849",
    nom: "Yao Désirée Epse Brou",
    doc: "certificat_residence",
    heure: "14:38",
    statut: "en_attente",
    avatar: "YD",
    color: "#FEF3C7",
    textColor: "#92400E",
  },
  {
    id: "KDC-2026-00850",
    nom: "Bamba Seydou",
    doc: "certificat_nationalite",
    heure: "14:42",
    statut: "en_attente",
    avatar: "BS",
    color: "#FCE7F3",
    textColor: "#831843",
  },
];

// Fonctions pour interagir avec la "base de données"
export const getQueue = () => [...queue];

// Constants for new dossier default styling
const DEFAULT_NEW_DOSSIER_COLOR = "#F0FDF4";
const DEFAULT_NEW_DOSSIER_TEXT_COLOR = "#166534";

export const addDossierToQueue = (dossier: NewDossierPayload) => {
  const now = new Date();
  const newDossier: Dossier = {
    ...dossier,
    heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    statut: "en_attente",
    avatar: dossier.nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase(),
    color: DEFAULT_NEW_DOSSIER_COLOR, // Use constant
    textColor: DEFAULT_NEW_DOSSIER_TEXT_COLOR, // Use constant
  };

  // Ajoute le nouveau dossier en haut de la liste
  queue.unshift(newDossier);

  console.log("✅ Nouveau dossier envoyé à la mairie :", newDossier);
};

// Permet de mettre à jour le statut d'un dossier (simule la validation par l'agent)
export const updateDossierStatus = (id: string, statut: DossierStatut) => {
  // Use map to create a new array, promoting immutability
  queue = queue.map((d) => (d.id === id ? { ...d, statut } : d));
};
