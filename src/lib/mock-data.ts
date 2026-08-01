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
  | "certificat_nationalite"
  | "renouvellement_passeport"
  | "declaration_naissance"
  | "dossier_mariage"
  | "casier_judiciaire"
  // Nouveaux services spécifiques
  | "cni_premiere_demande"
  | "cni_renouvellement_expiration"
  | "cni_renouvellement_perte_vol"
  | "cni_correction_erreurs"
  | "cni_suivi_demande"
  | "passeport_premiere_demande"
  | "passeport_perdu_vole"
  | "passeport_suivi_demande"
  | "permis_premiere_demande"
  | "permis_renouvellement"
  | "permis_provisoire"
  | "permis_reserver_examen"
  | "permis_suivi_demande"
  | "copie_integrale_naissance"
  | "attestation_identite"
  | "certificat_coutume"
  | "certificat_heredite"
  | "declaration_perte"
  | "declaration_honneur"
  | "certificat_capacite_mariage"
  | "acte_reconnaissance_enfant"
  | "casier_judiciaire_b3"
  | "casier_judiciaire_b2"
  | "legalisation_signature"
  | "certification_conforme"
  | "authentification_documents"
  | "laissez_passer"
  | "autorisation_transfert_corps"
  | "informations_naturalisation"
  | "declaration_perte_cni_spec"
  | "registre_commerce"
  | "patente_professionnelle";

export type DossierStatut =
  "en_attente" | "ocr_ok" | "valide" | "rejete" | "signature" | "pret_pour_impression";

export type PaymentMethod = "physique" | "digital";
export type PaymentStatus = "non_paye" | "paye";
export type DeliveryMethod = "sur_place" | "a_domicile";

export interface Dossier {
  id: string;
  nom: string;
  doc: DocumentType; // Use the new DocumentType
  heure: string;
  statut: DossierStatut;
  avatar: string;
  color: string;
  textColor: string;
  userId: string; // Ajouté pour lier le dossier à un utilisateur
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryMethod: DeliveryMethod;
  transactionId?: string;
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
    userId: "user-1",
    paymentMethod: "physique",
    paymentStatus: "non_paye",
    deliveryMethod: "sur_place",
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
    userId: "user-1",
    paymentMethod: "digital",
    paymentStatus: "paye",
    deliveryMethod: "a_domicile",
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
    userId: "user-2",
    paymentMethod: "physique",
    paymentStatus: "non_paye",
    deliveryMethod: "sur_place",
  },
];

// Définition des rôles possibles dans l'application
export type UserRole = "citoyen" | "agent" | "administrateur" | "passe_partout";

// Interface pour un profil utilisateur
export interface UserProfile {
  id: string; // ID unique de l'utilisateur
  email: string; // Adresse email de l'utilisateur (pour l'authentification)
  nom: string; // Nom complet de l'utilisateur
  role: UserRole; // Rôle de l'utilisateur
  avatar: string; // Initiales ou image d'avatar
  dateDeNaissance?: string; // Nouvelle information: Date de naissance
  commune?: string; // Nouvelle information: Commune de résidence
  quartier?: string; // Nouvelle information: Quartier de résidence
  telephone?: string; // Nouvelle information: Numéro de téléphone
  isProfileComplete: boolean; // Indique si le profil est complet
}

let users: UserProfile[] = [
  {
    id: "user-1",
    email: "moussa.diabate@example.com",
    nom: "Diabaté Moussa",
    role: "citoyen",
    avatar: "DM",
    dateDeNaissance: "1990-05-15",
    commune: "Abidjan",
    quartier: "Cocody",
    telephone: "0707123456",
    isProfileComplete: true,
  },
  {
    id: "user-2",
    email: "agent.yao@example.com",
    nom: "Yao Désirée",
    role: "agent",
    avatar: "YD",
    dateDeNaissance: "1985-11-22",
    commune: "Abidjan",
    quartier: "Marcory",
    telephone: "0707987654",
    isProfileComplete: true,
  },
  {
    id: "user-3",
    email: "admin.bamba@example.com",
    nom: "Bamba Seydou",
    role: "administrateur",
    avatar: "BS",
    dateDeNaissance: "1978-01-01",
    commune: "Abidjan",
    quartier: "Plateau",
    telephone: "0707112233",
    isProfileComplete: true,
  },
  {
    id: "user-4",
    email: "super.admin@example.com",
    nom: "Super Admin",
    role: "passe_partout",
    avatar: "SA",
    dateDeNaissance: "1970-03-08",
    commune: "Abidjan",
    quartier: "Adjamé",
    telephone: "0707445566",
    isProfileComplete: true,
  },
];

// Fonctions pour interagir avec la "base de données"
export const getQueue = () => [...queue];
export const getUsers = () => [...users];
export const getUserById = (id: string) => users.find((user) => user.id === id);
export const getUserByEmail = (email: string) => users.find((user) => user.email === email);

// Constants for new dossier default styling
const DEFAULT_NEW_DOSSIER_COLOR = "#F0FDF4";
const DEFAULT_NEW_DOSSIER_TEXT_COLOR = "#166534";

export const addDossierToQueue = (
  dossier: NewDossierPayload & {
    userId: string;
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
  },
) => {
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
    // Le statut de paiement dépend de la méthode choisie
    paymentStatus: dossier.paymentMethod === "digital" ? "paye" : "non_paye",
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
