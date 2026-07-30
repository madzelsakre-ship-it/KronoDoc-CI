// --- Simulation d'une base de données partagée ---
// Dans une application réelle, ces données seraient gérées par un backend
// et les mises à jour se feraient via des appels API et des WebSockets.

export interface Dossier {
  id: string;
  nom: string;
  doc: string;
  heure: string;
  statut: "en_attente" | "ocr_ok" | "valide" | "rejete" | "signature";
  avatar: string;
  color: string;
  textColor: string;
}

let queue: Dossier[] = [
  { id: "KDC-2026-00848", nom: "Diabaté Moussa", doc: "Acte de naissance", heure: "14:31", statut: "en_attente", avatar: "DM", color: "#EEF2FF", textColor: "#3730A3" },
  { id: "KDC-2026-00849", nom: "Yao Désirée Epse Brou", doc: "Certificat de résidence", heure: "14:38", statut: "en_attente", avatar: "YD", color: "#FEF3C7", textColor: "#92400E" },
  { id: "KDC-2026-00850", nom: "Bamba Seydou", doc: "Certificat de nationalité", heure: "14:42", statut: "en_attente", avatar: "BS", color: "#FCE7F3", textColor: "#831843" },
];

// Fonctions pour interagir avec la "base de données"
export const getQueue = () => [...queue];

export const addDossierToQueue = (dossier: { id: string; nom: string; doc: string; }) => {
  const now = new Date();
  const newDossier: Dossier = {
    ...dossier,
    heure: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
    statut: "en_attente",
    avatar: dossier.nom.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    color: "#F0FDF4",
    textColor: "#166534",
  };
  
  // Ajoute le nouveau dossier en haut de la liste
  queue = [newDossier, ...queue];
  
  console.log("✅ Nouveau dossier envoyé à la mairie :", newDossier);
};

// Permet de mettre à jour le statut d'un dossier (simule la validation par l'agent)
export const updateDossierStatus = (id: string, statut: Dossier['statut']) => {
  queue = queue.map(d => d.id === id ? { ...d, statut } : d);
};