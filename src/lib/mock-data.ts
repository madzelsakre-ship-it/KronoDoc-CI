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

export type DocumentRecognition = {
  label: string;
  requiredDocuments: string[];
  minCompliance: "standard" | "strict";
  status: "reconnu" | "verification" | "souverain";
};

export type PaymentStatus = "non_paye" | "paye";
export type DeliveryMethod = "sur_place" | "a_domicile";

export const DOCUMENT_RECOGNITION: Record<DocumentType, DocumentRecognition> = {
  certificat_residence: {
    label: "Certificat de résidence",
    requiredDocuments: ["CNI", "Justificatif de domicile"],
    minCompliance: "standard",
    status: "reconnu",
  },
  attestation_hebergement: {
    label: "Attestation d’hébergement",
    requiredDocuments: ["CNI hébergeant", "Attestation de domicile"],
    minCompliance: "standard",
    status: "reconnu",
  },
  celibat: {
    label: "Certificat de célibat",
    requiredDocuments: ["CNI", "Déclaration de circonstance"],
    minCompliance: "standard",
    status: "reconnu",
  },
  "non-remariage": {
    label: "Certificat de non-remariage",
    requiredDocuments: ["CNI", "Déclaration de situation"],
    minCompliance: "standard",
    status: "reconnu",
  },
  certificat_vie: {
    label: "Certificat de vie",
    requiredDocuments: ["CNI", "Justificatif de domicile"],
    minCompliance: "standard",
    status: "reconnu",
  },
  indigence: {
    label: "Certificat d’indigence",
    requiredDocuments: ["CNI", "Justificatif de ressources"],
    minCompliance: "strict",
    status: "verification",
  },
  extrait_naissance: {
    label: "Extrait d’acte de naissance",
    requiredDocuments: ["CNI", "Acte original ou registre"],
    minCompliance: "standard",
    status: "reconnu",
  },
  mariage: {
    label: "Acte de mariage",
    requiredDocuments: ["CNI", "Livret de famille"],
    minCompliance: "strict",
    status: "reconnu",
  },
  deces: {
    label: "Extrait d’acte de décès",
    requiredDocuments: ["CNI", "Déclaration de décès"],
    minCompliance: "standard",
    status: "reconnu",
  },
  legalisation: {
    label: "Légalisation de document",
    requiredDocuments: ["Document original", "Copie de pièce d’identité"],
    minCompliance: "strict",
    status: "verification",
  },
  copie: {
    label: "Copie intégrale",
    requiredDocuments: ["Acte original", "CNI"],
    minCompliance: "standard",
    status: "reconnu",
  },
  "declaration-deces": {
    label: "Déclaration de décès",
    requiredDocuments: ["Acte de décès", "CNI déclarant"],
    minCompliance: "strict",
    status: "verification",
  },
  "permis-inhumer": {
    label: "Permis d’inhumer",
    requiredDocuments: ["Décès", "Autorisation du médecin"],
    minCompliance: "strict",
    status: "verification",
  },
  certificat_nationalite: {
    label: "Certificat de nationalité",
    requiredDocuments: ["CNI", "Acte de naissance", "Justificatif de résidence"],
    minCompliance: "strict",
    status: "verification",
  },
  renouvellement_passeport: {
    label: "Renouvellement de passeport",
    requiredDocuments: ["Ancien passeport", "CNI", "Photo biométrique"],
    minCompliance: "strict",
    status: "souverain",
  },
  declaration_naissance: {
    label: "Déclaration de naissance",
    requiredDocuments: ["Certificat médical", "CNI parents", "Livret de famille"],
    minCompliance: "strict",
    status: "verification",
  },
  dossier_mariage: {
    label: "Dossier de mariage",
    requiredDocuments: ["CNI", "Livret de famille", "Acte de naissance"],
    minCompliance: "strict",
    status: "verification",
  },
  casier_judiciaire: {
    label: "Casier judiciaire",
    requiredDocuments: ["CNI", "Demande signée"],
    minCompliance: "standard",
    status: "reconnu",
  },
  cni_premiere_demande: {
    label: "Première demande de CNI",
    requiredDocuments: ["Acte de naissance", "CNI parents", "Photo biométrique"],
    minCompliance: "strict",
    status: "souverain",
  },
  cni_renouvellement_expiration: {
    label: "Renouvellement de CNI",
    requiredDocuments: ["Ancienne CNI", "Photo", "Justificatif de résidence"],
    minCompliance: "strict",
    status: "souverain",
  },
  cni_renouvellement_perte_vol: {
    label: "Renouvellement CNI (perte / vol)",
    requiredDocuments: ["Déclaration de perte", "CNI / pièce d’identité", "Photo"],
    minCompliance: "strict",
    status: "souverain",
  },
  cni_correction_erreurs: {
    label: "Correction d’erreurs sur la CNI",
    requiredDocuments: ["Ancienne CNI", "Justificatif de correction", "Photo"],
    minCompliance: "strict",
    status: "souverain",
  },
  cni_suivi_demande: {
    label: "Suivi demande CNI",
    requiredDocuments: ["Référence dossier", "CNI / preuve d’identité"],
    minCompliance: "standard",
    status: "reconnu",
  },
  passeport_premiere_demande: {
    label: "Première demande de passeport",
    requiredDocuments: ["CNI", "Acte de naissance", "Photo biométrique"],
    minCompliance: "strict",
    status: "souverain",
  },
  passeport_perdu_vole: {
    label: "Passeport perdu / volé",
    requiredDocuments: ["Déclaration de perte", "CNI", "Ancien document"],
    minCompliance: "strict",
    status: "souverain",
  },
  passeport_suivi_demande: {
    label: "Suivi demande passeport",
    requiredDocuments: ["Référence dossier", "CNI"],
    minCompliance: "standard",
    status: "reconnu",
  },
  permis_premiere_demande: {
    label: "Première demande permis",
    requiredDocuments: ["CNI", "Certificat médical", "Photo"],
    minCompliance: "strict",
    status: "verification",
  },
  permis_renouvellement: {
    label: "Renouvellement permis",
    requiredDocuments: ["Ancien permis", "CNI", "Certificat médical"],
    minCompliance: "strict",
    status: "verification",
  },
  permis_provisoire: {
    label: "Permis provisoire",
    requiredDocuments: ["CNI", "Certificat médical"],
    minCompliance: "standard",
    status: "verification",
  },
  permis_reserver_examen: {
    label: "Réservation d’examen permis",
    requiredDocuments: ["CNI", "Justificatif médical"],
    minCompliance: "standard",
    status: "reconnu",
  },
  permis_suivi_demande: {
    label: "Suivi demande permis",
    requiredDocuments: ["Référence dossier", "CNI"],
    minCompliance: "standard",
    status: "reconnu",
  },
  copie_integrale_naissance: {
    label: "Copie intégrale acte de naissance",
    requiredDocuments: ["Acte original", "CNI"],
    minCompliance: "standard",
    status: "reconnu",
  },
  attestation_identite: {
    label: "Attestation d’identité",
    requiredDocuments: ["CNI", "Justificatif de domicile"],
    minCompliance: "standard",
    status: "reconnu",
  },
  certificat_coutume: {
    label: "Certificat de coutume",
    requiredDocuments: ["CNI", "Déclaration de circonstance"],
    minCompliance: "standard",
    status: "reconnu",
  },
  certificat_heredite: {
    label: "Certificat d’hérédité",
    requiredDocuments: ["CNI", "Justificatif de filiation"],
    minCompliance: "strict",
    status: "verification",
  },
  declaration_perte: {
    label: "Déclaration de perte",
    requiredDocuments: ["CNI", "Description de l’objet"],
    minCompliance: "standard",
    status: "reconnu",
  },
  declaration_honneur: {
    label: "Déclaration d’honneur",
    requiredDocuments: ["CNI", "Déclaration signée"],
    minCompliance: "standard",
    status: "reconnu",
  },
  certificat_capacite_mariage: {
    label: "Certificat de capacité de mariage",
    requiredDocuments: ["CNI", "Acte de naissance", "Statut civil"],
    minCompliance: "strict",
    status: "verification",
  },
  acte_reconnaissance_enfant: {
    label: "Acte de reconnaissance d’enfant",
    requiredDocuments: ["CNI parents", "Déclaration de reconnaissance"],
    minCompliance: "strict",
    status: "verification",
  },
  casier_judiciaire_b3: {
    label: "Bulletin n°3 du casier judiciaire",
    requiredDocuments: ["CNI", "Demande signée"],
    minCompliance: "strict",
    status: "reconnu",
  },
  casier_judiciaire_b2: {
    label: "Bulletin n°2 du casier judiciaire",
    requiredDocuments: ["CNI", "Demande signée"],
    minCompliance: "strict",
    status: "reconnu",
  },
  legalisation_signature: {
    label: "Légalisation de signature",
    requiredDocuments: ["Signature", "Pièce d’identité"],
    minCompliance: "standard",
    status: "verification",
  },
  certification_conforme: {
    label: "Certification conforme",
    requiredDocuments: ["Document original", "CNI"],
    minCompliance: "standard",
    status: "reconnu",
  },
  authentification_documents: {
    label: "Authentification de documents",
    requiredDocuments: ["Document original", "Demande signée"],
    minCompliance: "standard",
    status: "reconnu",
  },
  laissez_passer: {
    label: "Laissez-passer",
    requiredDocuments: ["CNI", "Justificatif de déplacement"],
    minCompliance: "standard",
    status: "verification",
  },
  autorisation_transfert_corps: {
    label: "Autorisation de transfert de corps",
    requiredDocuments: ["CNI", "Décès", "Autorisation médicale"],
    minCompliance: "strict",
    status: "verification",
  },
  informations_naturalisation: {
    label: "Informations naturalisation",
    requiredDocuments: ["Pièce d’identité", "Preuves de résidence"],
    minCompliance: "strict",
    status: "verification",
  },
  declaration_perte_cni_spec: {
    label: "Déclaration de perte CNI",
    requiredDocuments: ["CNI antérieure", "Déclaration", "Photo"],
    minCompliance: "strict",
    status: "souverain",
  },
  registre_commerce: {
    label: "Registre de commerce",
    requiredDocuments: ["Pièce d’identité", "Kbis", "Justificatif agence"],
    minCompliance: "strict",
    status: "verification",
  },
  patente_professionnelle: {
    label: "Patente professionnelle",
    requiredDocuments: ["CNI", "Justificatif de bureau", "Declaration"],
    minCompliance: "strict",
    status: "verification",
  },
};

export function recognizeDocument(doc: DocumentType): DocumentRecognition {
  return (
    DOCUMENT_RECOGNITION[doc] ?? {
      label: "Document non reconnu",
      requiredDocuments: ["Pièce d’identité", "Pièce justificative"],
      minCompliance: "strict",
      status: "verification",
    }
  );
}

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
