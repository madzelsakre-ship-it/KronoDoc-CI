import type { DocumentType } from "./mock-data";

// --- Types pour les justificatifs (pièces à fournir) ---
export interface JustificatifConfig {
  type: "fichier" | "texte"; // Type de justificatif : un fichier à uploader ou un champ texte
  label: string; // Le nom du champ, ex: "Ancien extrait de naissance"
  description?: string; // Aide contextuelle pour l'utilisateur
  optionnel: boolean; // Si le justificatif est obligatoire ou non
}

// New interface for form fields
export interface FormFieldConfig {
  id: string;
  label: string;
  type: "text" | "date" | "select" | "textarea" | "number";
  placeholder?: string;
  required: boolean;
  prefilled?: boolean; // Indicates if it can be pre-filled from user profile
  options?: { value: string; label: string }[]; // For select type
}

// --- Types pour les workflows complexes (CNI, Passeport, etc.) ---
export type WorkflowStepType =
  | "formulaire_saisie" // User fills out a form
  | "upload_justificatifs" // User uploads documents
  | "paiement" // User makes a payment
  | "rdv_biometrique" // User schedules and attends biometric appointment
  | "traitement_agent" // Internal step for agent processing
  | "production" // Internal step for document production
  | "retrait" // User picks up document
  | "suivi_demande"; // User can track status

export interface WorkflowStep {
  type: WorkflowStepType; // Utilise le bon type pour les étapes de workflow
  label: string;
  description?: string;
  justificatifs?: JustificatifConfig[]; // Une étape peut elle-même demander des justificatifs
  formFields?: FormFieldConfig[]; // Fields to fill in this step
  // Add other properties specific to step types, e.g., payment options, appointment locations
}

// --- Types pour les actions possibles sur un service ---
export type ServiceActionType =
  | "faire_demande"
  | "telecharger_modele"
  | "suivre_demande"
  | "generer_prerempli"
  | "declarer_en_ligne"
  | "reserver_examen"
  | "demander_correction"
  | "informations_generales"; // For "Informations sur la naturalisation"

export interface ServiceAction {
  label: string;
  type: ServiceActionType;
  description?: string; // Optional description for the action
  link?: string; // If it's a direct link, e.g., to a model PDF
  disabled?: boolean; // If the action is not yet available
}

// --- Types pour la structure des documents ---
export interface DocType {
  id: DocumentType;
  label: string;
  categorie: "MAIRIE" | "IDENTITE" | "PASSEPORT" | "TRANSPORT" | "JUSTICE" | "ENTREPRISE";
  sousCategorie: string; // Identifiant de la sous-catégorie (ex: "ACTES_ETAT_CIVIL")
  prix?: number; // Base price, might be overridden by delivery options or workflow steps
  delai?: string;
  disabled?: boolean;
  workflow?: WorkflowStep[]; // Workflow en plusieurs étapes pour les démarches complexes
  justificatifs?: JustificatifConfig[]; // For simple, single-step document uploads
  actions: ServiceAction[]; // Actions available for this service
  descriptionCourte?: string; // Short description for display in lists/cards
}

export interface CategorieServices {
  id: DocType["categorie"];
  titre: string;
  description: string;
  icon?: string; // For the icons like 🏛️, 🪪, ✈️, 🚗, ⚖️, 💼
  disabled?: boolean;
}

export interface SousCategorie {
  id: string;
  categorieId: CategorieServices["id"];
  titre: string;
  description?: string; // For sub-category description like "Actes, certificats, etc."
}

// --- 1. Définition des grandes catégories de services ---
export const CATEGORIES: CategorieServices[] = [
  {
    id: "MAIRIE",
    titre: "Mairie & État civil",
    description: "Actes, certificats, déclarations, mariage, etc.",
    icon: "🏛️",
  },
  {
    id: "IDENTITE",
    titre: "Identité & Nationalité",
    description: "CNI, nationalité, corrections, etc.",
    icon: "🪪",
  },
  {
    id: "PASSEPORT",
    titre: "Passeports & Voyages",
    description: "Demandes et renouvellements de passeports et autres documents.",
    icon: "✈️",
  },
  {
    id: "TRANSPORT",
    titre: "Transports & Permis",
    description: "Toutes les démarches liées au permis de conduire.",
    icon: "🚗",
  },
  {
    id: "JUSTICE",
    titre: "Justice & Casier judiciaire",
    description: "Bulletins de casier, légalisations et autres actes légaux.",
    icon: "⚖️",
  },
  {
    id: "ENTREPRISE",
    titre: "Entreprises & Commerce",
    description: "Registres, patentes...",
    icon: "💼",
    disabled: true, // Assuming this is not yet fully implemented
  },
];

// --- 2. Définition des sous-catégories ---
export const SOUS_CATEGORIES: SousCategorie[] = [
  // Mairie & État civil
  { id: "ACTES_ETAT_CIVIL", categorieId: "MAIRIE", titre: "Actes d'état civil" },
  { id: "CERTIFICATS_ATTESTATIONS", categorieId: "MAIRIE", titre: "Certificats & attestations" },
  { id: "DECLARATIONS", categorieId: "MAIRIE", titre: "Déclarations" },
  { id: "MARIAGE_FAMILLE", categorieId: "MAIRIE", titre: "Mariage & famille" },
  // Identité & Nationalité
  { id: "CNI_SOUS_CAT", categorieId: "IDENTITE", titre: "Carte Nationale d'Identité (CNI)" },
  { id: "NATIONALITE_SOUS_CAT", categorieId: "IDENTITE", titre: "Nationalité" },
  { id: "AUTRES_DOCS_IDENTITE", categorieId: "IDENTITE", titre: "Autres documents d'identité" },
  // Passeports & Voyages
  { id: "PASSEPORT_ORDINAIRE_SOUS_CAT", categorieId: "PASSEPORT", titre: "Passeport ordinaire" },
  { id: "AUTRES_DOCS_VOYAGE", categorieId: "PASSEPORT", titre: "Autres documents de voyage" },
  // Transports & Permis
  { id: "PERMIS_CONDUIRE_SOUS_CAT", categorieId: "TRANSPORT", titre: "Permis de conduire" },
  // Justice
  { id: "CASIER_JUDICIAIRE_SOUS_CAT", categorieId: "JUSTICE", titre: "Casier judiciaire" },
  {
    id: "LEGALISATION_CERTIFICATION",
    categorieId: "JUSTICE",
    titre: "Légalisation / certification",
  },
  // Entreprises & Commerce
  { id: "ENTREPRISES_COMMERCE_SOUS_CAT", categorieId: "ENTREPRISE", titre: "Registres & Patentes" },
];

// --- Référentiel des documents par groupe ---
// C'est ici que la logique métier de votre tableau est appliquée.
export const DOCUMENTS: DocType[] = [
  // =================================================================
  // Catégorie : MAIRIE & ÉTAT CIVIL
  // =================================================================

  // --- Sous-catégorie : Actes d'état civil ---
  {
    id: "extrait_naissance",
    label: "Extrait d'acte de naissance",
    categorie: "MAIRIE",
    sousCategorie: "ACTES_ETAT_CIVIL",
    prix: 1000,
    delai: "< 5 min",
    justificatifs: [
      {
        type: "fichier",
        label: "Photo/Scan de l'ancien extrait",
        description:
          "Permet à l'agent de retrouver rapidement le feuillet dans le registre papier.",
        optionnel: false,
      },
      {
        type: "texte",
        label: "Numéro de l'acte original",
        description: "Si vous le connaissez, cela accélère le traitement.",
        optionnel: true,
      },
    ],
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "copie_integrale_naissance",
    label: "Copie intégrale d'acte de naissance",
    categorie: "MAIRIE",
    sousCategorie: "ACTES_ETAT_CIVIL",
    prix: 1500,
    delai: "1-2 jours",
    justificatifs: [
      {
        type: "fichier",
        label: "Ancien acte ou pièce d'identité",
        description: "Pour vérification et identification.",
        optionnel: false,
      },
    ],
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "mariage",
    label: "Extrait d'acte de mariage",
    categorie: "MAIRIE",
    sousCategorie: "ACTES_ETAT_CIVIL",
    prix: 2000,
    delai: "< 5 min",
    justificatifs: [
      {
        type: "fichier",
        label: "Photo/Scan de l'ancien extrait ou du livret de famille",
        optionnel: false,
      },
      { type: "texte", label: "Numéro de registre (si connu)", optionnel: true },
    ],
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "deces",
    label: "Extrait d'acte de décès",
    categorie: "MAIRIE",
    sousCategorie: "ACTES_ETAT_CIVIL",
    prix: 1000,
    delai: "< 5 min",
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },

  // --- Sous-catégorie : Certificats & attestations ---
  {
    id: "certificat_residence",
    label: "Certificat de résidence",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 500,
    delai: "< 3 min",
    actions: [
      { label: "Générer pré-rempli", type: "generer_prerempli" },
      {
        label: "Télécharger modèle",
        type: "telecharger_modele",
        link: "/modeles/certificat_residence.pdf",
      },
    ],
  },
  {
    id: "attestation_hebergement",
    label: "Attestation d'hébergement",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 500,
    delai: "< 3 min",
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      {
        label: "Télécharger modèle",
        type: "telecharger_modele",
        link: "/modeles/attestation_hebergement.pdf",
      },
    ],
  },
  {
    id: "celibat",
    label: "Certificat de célibat",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 1000,
    delai: "< 5 min",
    actions: [
      { label: "Générer pré-rempli", type: "generer_prerempli" },
      {
        label: "Télécharger modèle",
        type: "telecharger_modele",
        link: "/modeles/certificat_celibat.pdf",
      },
    ],
  },
  {
    id: "non-remariage",
    label: "Certificat de non-remariage",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 1000,
    delai: "< 5 min",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "certificat_vie",
    label: "Certificat de vie",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 500,
    delai: "< 3 min",
    actions: [{ label: "Générer pré-rempli", type: "generer_prerempli" }],
  },
  {
    id: "indigence",
    label: "Certificat d'indigence",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 0,
    delai: "< 5 min",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "attestation_identite",
    label: "Attestation d'identité",
    categorie: "MAIRIE", // Primary category, but also relevant for IDENTITE, will be linked
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 500,
    delai: "< 3 min",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "certificat_coutume",
    label: "Certificat de coutume",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 2000,
    delai: "Variable",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "certificat_heredite",
    label: "Certificat d'hérédité",
    categorie: "MAIRIE",
    sousCategorie: "CERTIFICATS_ATTESTATIONS",
    prix: 3000,
    delai: "Variable",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },

  // --- Sous-catégorie : Déclarations ---
  {
    id: "declaration_naissance",
    label: "Déclaration de Naissance (Nouvel Acte)",
    categorie: "MAIRIE",
    sousCategorie: "DECLARATIONS",
    prix: 0,
    delai: "Variable",
    actions: [
      { label: "Déclarer en ligne", type: "declarer_en_ligne" },
      { label: "Suivre ma déclaration", type: "suivre_demande" },
    ],
  },
  {
    id: "declaration-deces",
    label: "Déclaration de décès",
    categorie: "MAIRIE",
    sousCategorie: "DECLARATIONS",
    prix: 0,
    delai: "Variable",
    actions: [
      { label: "Déclarer en ligne", type: "declarer_en_ligne" },
      { label: "Suivre ma déclaration", type: "suivre_demande" },
    ],
  },
  {
    id: "declaration_perte",
    label: "Déclaration de perte (CNI, Passeport)",
    categorie: "MAIRIE", // Primary category, but also relevant for IDENTITE/PASSEPORT
    sousCategorie: "DECLARATIONS",
    prix: 500,
    delai: "< 10 min",
    actions: [{ label: "Déclarer en ligne", type: "declarer_en_ligne" }],
  },
  {
    id: "declaration_honneur",
    label: "Déclaration sur l'honneur (modèles)",
    categorie: "MAIRIE",
    sousCategorie: "DECLARATIONS",
    prix: 0,
    delai: "< 1 min",
    actions: [
      {
        label: "Télécharger modèle",
        type: "telecharger_modele",
        link: "/modeles/declaration_honneur.pdf",
      },
    ],
  },

  // --- Sous-catégorie : Mariage & famille ---
  {
    id: "dossier_mariage",
    label: "Dossier en vue de mariage",
    categorie: "MAIRIE",
    sousCategorie: "MARIAGE_FAMILLE",
    prix: 10000, // Frais de dossier
    delai: "Variable",
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "certificat_capacite_mariage",
    label: "Certificat de capacité à mariage (CCM)",
    categorie: "MAIRIE",
    sousCategorie: "MARIAGE_FAMILLE",
    prix: 2000,
    delai: "Variable",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "acte_reconnaissance_enfant",
    label: "Acte de reconnaissance d'enfant",
    categorie: "MAIRIE",
    sousCategorie: "MARIAGE_FAMILLE",
    prix: 0,
    delai: "Variable",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "permis-inhumer",
    label: "Permis d'inhumer",
    categorie: "MAIRIE",
    sousCategorie: "DECLARATIONS", // Could be its own sub-category
    prix: 5000,
    delai: "Variable",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },

  // =================================================================
  // Catégorie : IDENTITÉ & NATIONALITÉ
  // =================================================================

  // --- Sous-catégorie : Carte Nationale d'Identité (CNI) ---
  {
    id: "cni_premiere_demande", // NOUVEAU
    label: "Première demande de CNI",
    categorie: "IDENTITE",
    sousCategorie: "CNI_SOUS_CAT",
    prix: 5000, // Timbre
    delai: "4-6 semaines",
    disabled: true, // À implémenter
    workflow: [
      {
        type: "formulaire_saisie",
        label: "Informations personnelles",
        description: "Saisissez vos informations d'état civil et de filiation.",
      },
      {
        type: "upload_justificatifs",
        label: "Justificatifs",
        justificatifs: [
          { type: "fichier", label: "Acte de naissance", optionnel: false },
          { type: "fichier", label: "Photo d'identité", optionnel: false },
        ],
      },
      { type: "paiement", label: "Paiement des frais", description: "Réglez les frais de timbre." },
      {
        type: "rdv_biometrique",
        label: "Rendez-vous d'enrôlement",
        description: "Choisissez un centre et un créneau pour la capture biométrique.",
      },
      { type: "production", label: "Production de la CNI" },
      { type: "retrait", label: "Retrait de la CNI" },
    ],
    actions: [
      { label: "Faire une pré-demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "cni_renouvellement_expiration",
    label: "Renouvellement de CNI (expiration)",
    categorie: "IDENTITE",
    sousCategorie: "CNI_SOUS_CAT",
    prix: 5000,
    delai: "4-6 semaines",
    disabled: true,
    workflow: [
      {
        type: "formulaire_saisie",
        label: "Vérification des informations",
        description: "Vérifiez et mettez à jour vos informations personnelles.",
      },
      {
        type: "upload_justificatifs",
        label: "Justificatifs",
        justificatifs: [{ type: "fichier", label: "Ancienne CNI", optionnel: false }],
      },
      { type: "paiement", label: "Paiement des frais", description: "Réglez les frais de timbre." },
      {
        type: "rdv_biometrique",
        label: "Rendez-vous d'enrôlement",
        description:
          "Choisissez un centre et un créneau pour la capture biométrique (si nécessaire).",
      },
      { type: "production", label: "Production de la CNI" },
      { type: "retrait", label: "Retrait de la CNI" },
    ],
    actions: [
      { label: "Faire une demande de renouvellement", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "cni_renouvellement_perte_vol",
    label: "Renouvellement de CNI (perte / vol)",
    categorie: "IDENTITE",
    sousCategorie: "CNI_SOUS_CAT",
    prix: 5000,
    delai: "4-6 semaines",
    disabled: true,
    workflow: [
      {
        type: "formulaire_saisie",
        label: "Déclaration de perte/vol",
        description: "Déclarez la perte ou le vol de votre CNI.",
      },
      {
        type: "upload_justificatifs",
        label: "Justificatifs",
        justificatifs: [
          { type: "fichier", label: "Récépissé de déclaration de perte/vol", optionnel: false },
        ],
      },
      { type: "paiement", label: "Paiement des frais", description: "Réglez les frais de timbre." },
      {
        type: "rdv_biometrique",
        label: "Rendez-vous d'enrôlement",
        description: "Choisissez un centre et un créneau pour la capture biométrique.",
      },
      { type: "production", label: "Production de la CNI" },
      { type: "retrait", label: "Retrait de la CNI" },
    ],
    actions: [
      { label: "Déclarer la perte / vol + demande de renouvellement", type: "declarer_en_ligne" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "cni_correction_erreurs",
    label: "Correction d'erreurs sur la CNI",
    categorie: "IDENTITE",
    sousCategorie: "CNI_SOUS_CAT",
    prix: 2000, // Example price
    delai: "Variable",
    disabled: true,
    workflow: [
      {
        type: "formulaire_saisie",
        label: "Description de l'erreur",
        description: "Décrivez l'erreur à corriger et fournissez les informations exactes.",
      },
      {
        type: "upload_justificatifs",
        label: "Justificatifs",
        justificatifs: [
          { type: "fichier", label: "CNI actuelle", optionnel: false },
          {
            type: "fichier",
            label: "Preuve de la correction (ex: acte de naissance corrigé)",
            optionnel: false,
          },
        ],
      },
      {
        type: "paiement",
        label: "Paiement des frais",
        description: "Réglez les frais de correction.",
      },
      { type: "traitement_agent", label: "Vérification et validation" },
      { type: "production", label: "Production de la CNI corrigée" },
      { type: "retrait", label: "Retrait de la CNI corrigée" },
    ],
    actions: [
      { label: "Demander une correction", type: "demander_correction" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "cni_suivi_demande",
    label: "Suivre ma demande de CNI",
    categorie: "IDENTITE",
    sousCategorie: "CNI_SOUS_CAT",
    prix: 0,
    delai: "N/A",
    actions: [{ label: "Suivre ma demande", type: "suivre_demande" }],
  },

  // --- Sous-catégorie : Nationalité ---
  {
    id: "certificat_nationalite",
    label: "Certificat de nationalité ivoirienne",
    categorie: "IDENTITE",
    sousCategorie: "NATIONALITE_SOUS_CAT",
    prix: 5000,
    delai: "Variable",
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "informations_naturalisation",
    label: "Informations sur la naturalisation",
    categorie: "IDENTITE",
    sousCategorie: "NATIONALITE_SOUS_CAT",
    prix: 0,
    delai: "N/A",
    actions: [
      {
        label: "Consulter les informations",
        type: "informations_generales",
        link: "/info/naturalisation",
      },
    ],
  },

  // --- Sous-catégorie : Autres documents d'identité ---
  // Attestation d'identité is already under MAIRIE, but can be referenced here
  {
    id: "declaration_perte_cni_spec", // Specific declaration of loss for CNI, links to general one
    label: "Déclaration de perte de CNI",
    categorie: "IDENTITE",
    sousCategorie: "AUTRES_DOCS_IDENTITE",
    prix: 500,
    delai: "< 10 min",
    actions: [
      {
        label: "Déclarer en ligne",
        type: "declarer_en_ligne",
        description: "Redirige vers la déclaration de perte générale.",
      },
    ],
  },

  // =================================================================
  // Catégorie : PASSEPORTS & VOYAGES
  // =================================================================

  // --- Sous-catégorie : Passeport ordinaire ---
  {
    id: "renouvellement_passeport",
    label: "Renouvellement de Passeport",
    categorie: "PASSEPORT",
    sousCategorie: "PASSEPORT_ORDINAIRE_SOUS_CAT",
    prix: 40000,
    delai: "3-4 semaines",
    workflow: [
      {
        type: "formulaire", // Maintenant valide
        label: "Informations personnelles et de voyage",
        description: "Remplissez les détails requis pour votre demande de passeport.",
      },
      {
        type: "upload_justificatifs",
        label: "Justificatifs requis",
        description: "Scannez votre acte de naissance, votre CNI et une photo d'identité.",
        justificatifs: [
          { type: "fichier", label: "Pièces requises", optionnel: false, description: "" },
        ],
      },
      {
        type: "paiement",
        label: "Paiement des frais de timbre",
        description: "Réglez les frais de 40 000 FCFA en ligne par Mobile Money ou Carte Bancaire.",
      },
      {
        type: "rdv_biometrique",
        label: "Rendez-vous pour l'enrôlement",
        description:
          "Choisissez un centre et un créneau pour la capture de votre photo et de vos empreintes.",
      },
      {
        type: "retrait",
        label: "Retrait du passeport",
        description:
          "Une fois notifié, présentez-vous au centre de retrait avec votre reçu et votre CNI.",
      },
    ],
    actions: [
      { label: "Renouveler mon passeport", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "passeport_premiere_demande",
    label: "Première demande de passeport",
    categorie: "PASSEPORT",
    sousCategorie: "PASSEPORT_ORDINAIRE_SOUS_CAT",
    prix: 40000,
    delai: "3-4 semaines",
    disabled: true, // To be implemented
    workflow: [
      {
        type: "formulaire_saisie",
        label: "Informations personnelles et de voyage",
        description: "Remplissez les détails requis pour votre demande de passeport.",
      },
      {
        type: "upload_justificatifs",
        label: "Justificatifs requis",
        justificatifs: [
          { type: "fichier", label: "Acte de naissance", optionnel: false },
          { type: "fichier", label: "CNI", optionnel: false },
          { type: "fichier", label: "Photo d'identité", optionnel: false },
        ],
      },
      {
        type: "paiement",
        label: "Paiement des frais de timbre",
        description: "Réglez les frais de 40 000 FCFA en ligne par Mobile Money ou Carte Bancaire.",
      },
      {
        type: "rdv_biometrique",
        label: "Rendez-vous pour l'enrôlement",
        description:
          "Choisissez un centre et un créneau pour la capture de votre photo et de vos empreintes.",
      },
      { type: "production", label: "Production du passeport" },
      { type: "retrait", label: "Retrait du passeport" },
    ],
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "passeport_perdu_vole",
    label: "Passeport perdu / volé – nouvelle demande",
    categorie: "PASSEPORT",
    sousCategorie: "PASSEPORT_ORDINAIRE_SOUS_CAT",
    prix: 40000,
    delai: "3-4 semaines",
    disabled: true,
    workflow: [
      {
        type: "formulaire_saisie",
        label: "Déclaration de perte/vol",
        description: "Déclarez la perte ou le vol de votre passeport.",
      },
      {
        type: "upload_justificatifs",
        label: "Justificatifs",
        justificatifs: [
          { type: "fichier", label: "Récépissé de déclaration de perte/vol", optionnel: false },
        ],
      },
      { type: "paiement", label: "Paiement des frais", description: "Réglez les frais de timbre." },
      {
        type: "rdv_biometrique",
        label: "Rendez-vous d'enrôlement",
        description: "Choisissez un centre et un créneau pour la capture biométrique.",
      },
      { type: "production", label: "Production du passeport" },
      { type: "retrait", label: "Retrait du passeport" },
    ],
    actions: [
      { label: "Déclarer la perte / vol", type: "declarer_en_ligne" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },
  {
    id: "passeport_suivi_demande",
    label: "Suivre ma demande de passeport",
    categorie: "PASSEPORT",
    sousCategorie: "PASSEPORT_ORDINAIRE_SOUS_CAT",
    prix: 0,
    delai: "N/A",
    actions: [{ label: "Suivre ma demande", type: "suivre_demande" }],
  },

  // =================================================================
  // Catégorie : TRANSPORTS & PERMIS
  // =================================================================

  // --- Sous-catégorie : Permis de conduire ---
  {
    id: "permis_conduire", // NOUVEAU
    label: "Première demande de Permis", // This should be permis_premiere_demande
    categorie: "TRANSPORT",
    sousCategorie: "PERMIS_CONDUIRE_SOUS_CAT",
    prix: 60000, // Exemple de frais
    delai: "Variable",
    disabled: true, // À implémenter
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },

  // =================================================================
  // Catégorie : JUSTICE & CASIER JUDICIAIRE
  // =================================================================

  // --- Sous-catégorie : Casier judiciaire ---
  {
    id: "casier_judiciaire",
    label: "Casier Judiciaire (Bulletin n°3)",
    categorie: "JUSTICE",
    sousCategorie: "CASIER_JUDICIAIRE_SOUS_CAT",
    prix: 2500,
    delai: "2-3 jours",
    actions: [
      { label: "Faire une demande", type: "faire_demande" },
      { label: "Suivre ma demande", type: "suivre_demande" },
    ],
  },

  // --- Sous-catégorie : Légalisation / certification ---
  {
    id: "legalisation",
    label: "Légalisation de signature",
    categorie: "JUSTICE",
    sousCategorie: "LEGALISATION_CERTIFICATION",
    prix: 500,
    delai: "< 3 min",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "copie",
    label: "Certification de copie conforme",
    categorie: "JUSTICE",
    sousCategorie: "LEGALISATION_CERTIFICATION",
    prix: 500,
    delai: "< 3 min",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
  {
    id: "authentification_documents",
    label: "Authentification de documents",
    categorie: "JUSTICE",
    sousCategorie: "LEGALISATION_CERTIFICATION",
    prix: 1000,
    delai: "Variable",
    actions: [{ label: "Faire une demande", type: "faire_demande" }],
  },
];
