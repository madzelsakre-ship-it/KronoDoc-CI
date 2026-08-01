import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  QrCode,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Download,
  Building,
  Phone,
  Copy,
  Search,
  Camera,
} from "lucide-react";
import { MapPin } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSession } from "@/hooks/use-session";
import { PaymentMethod, getUserById } from "@/lib/mock-data"; // Assumons que c'est la bonne façon de récupérer le profil
import { isDevTestModeEnabled, setDevTestMode } from "@/lib/test-mode";
import { canAccessRoute, getUserRole } from "@/lib/role-guard";

export const Route = createFileRoute("/citoyen")({
  head: () => ({
    meta: [
      { title: "Portail Citoyen — KronoDoc CI" },
      {
        name: "description",
        content: "Faites votre pré-demande d'acte d'état civil depuis votre mobile.",
      },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      throw redirect({
        to: "/auth",
        search: { redirect: location.href },
      });
    }

    // On appelle getUserRole SEULEMENT si la session existe.
    const role = getUserRole(data.session.user);

    if (!canAccessRoute(role, "/citoyen")) {
      throw redirect({ to: "/agent" });
    }
  },
  component: CitoyenPage,
});

// ====================================================================================
// 1. BASE DE DONNÉES (SERVICES_DATA)
// ====================================================================================
const SERVICES_DATA = {
  mairie: {
    title: "Mairie & État civil",
    icon: "🏛️",
    description: "Demandes relatives à la naissance, résidence, mariage et documents officiels.",
    entityLabel: "MAIRIE CONCERNÉE",
    entityPlaceholder: "Sélectionner votre mairie...",
    entities: ["Mairie de Yopougon", "Mairie d'Abobo", "Mairie de Cocody", "Mairie de Treichville", "Mairie de Marcory"],
    sections: [
      {
        title: "TYPE A — DÉLIVRANCE RAPIDE / AUTOMATIQUE",
        items: [
          { id: "birth_extract", name: "Extrait d'acte de naissance", time: "< 5 min", price: "1000 FCFA" },
          { id: "marriage_extract", name: "Extrait d'acte de mariage", time: "< 5 min", price: "2000 FCFA" },
        ],
      },
      {
        title: "TYPE B — SUPERVISION OFFICIER / DOCUMENTS LOURDS",
        items: [
          { id: "birth_declaration", name: "Déclaration de naissance d'un enfant", time: "1-2 jours", price: "2000 FCFA" },
          { id: "residence_certificate", name: "Certificat de résidence", time: "< 3 min", price: "500 FCFA" },
          { id: "full_birth_copy", name: "Copie intégrale d'acte de naissance", time: "1-2 jours", price: "1500 FCFA" },
          { id: "document_legalisation", name: "Légalisation de document", time: "2-3 jours", price: "1500 FCFA" },
          { id: "death_extract", name: "Extrait d'acte de décès", time: "< 5 min", price: "1000 FCFA" },
        ],
      },
    ],
  },
  identite: {
    title: "Identité, CNI & Passeport",
    icon: "🪪",
    description: "CNI, passeport, certificat de nationalité...",
    entityLabel: "CENTRE D'ENRÔLEMENT CONCERNÉ",
    entityPlaceholder: "Sélectionner votre centre...",
    entities: ["Centre ONI Plateau", "Commissariat 16ème Yopougon", "Commissariat 22ème Cocody"],
    sections: [
      {
        title: "TYPE C — MODÈLE SOUVERAIN / ECITIZEN",
        items: [
          { id: "cni_first", name: "Première demande CNI", time: "7-14 jours", price: "5000 FCFA" },
          { id: "cni_renew", name: "Renouvellement CNI", time: "5-7 jours", price: "5000 FCFA" },
          { id: "passport", name: "Passeport biométrique", time: "7-10 jours", price: "40000 FCFA" },
          { id: "attestation_id", name: "Attestation d'identité", time: "< 10 min", price: "2000 FCFA" },
          { id: "nationality", name: "Certificat de nationalité", time: "2-3 jours", price: "2500 FCFA" },
        ],
      },
    ],
  },
  transport: {
    title: "Transport & Permis",
    icon: "🚗",
    description: "Permis de conduire, carte grise...",
    entityLabel: "CENTRE DES TRANSPORTS CONCERNÉ",
    entityPlaceholder: "Sélectionner la direction/guichet...",
    entities: ["Guichet Unique Automobile Abidjan", "Direction Régionale des Transports"],
    sections: [
      {
        title: "PERMIS DE CONDUIRE & CARTE GRISE",
        items: [
          { id: "permit_renew", name: "Renouvellement du permis de conduire", time: "2-3 jours", price: "10000 FCFA" },
          { id: "permit_duplicata", name: "Duplicata du permis de conduire", time: "24h", price: "15000 FCFA" },
          { id: "permit_inter", name: "Permis international", time: "3-5 jours", price: "25000 FCFA" },
          { id: "grey_card", name: "Mutation de carte grise", time: "2-4 jours", price: "20000 FCFA" },
        ],
      },
    ],
  },
  justice: {
    title: "Justice & Casier Judiciaire",
    icon: "⚖️",
    description: "Demande de casier judiciaire...",
    entityLabel: "TRIBUNAL CONCERNÉ",
    entityPlaceholder: "Sélectionner le tribunal...",
    entities: ["Tribunal de Première Instance d'Abidjan", "Tribunal de Yopougon"],
    sections: [
      {
        title: "ACTES DE JUSTICE",
        items: [
          { id: "casier", name: "Extrait de casier judiciaire (Bulletin N°3)", time: "24-48h", price: "2500 FCFA" },
        ],
      },
    ],
  },
  legalisation: {
    title: "Légalisation de Documents",
    icon: "📜",
    description: "Faites certifier vos documents personnels (diplômes, contrats...).",
    entityLabel: "MAIRIE POUR LA LÉGALISATION",
    entityPlaceholder: "Sélectionner la mairie...",
    entities: ["Mairie de Yopougon", "Mairie d'Abobo", "Mairie de Cocody"],
    sections: [],
  },
};

const DOCUMENT_FORM_CONFIG: Record<string, {
  title: string;
  intro: string;
  fields: Array<{ key: string; label: string; type?: "text" | "date" | "textarea"; placeholder?: string; required?: boolean }>; 
  attachments: Array<{ label: string; required: boolean; accept: string }>; 
  note?: string;
}> = {
  birth_extract: {
    title: "Demande d'extrait d'acte de naissance",
    intro: "Fiche de demande simple et rapide. Votre document sera traité automatiquement après validation des pièces.",
    fields: [
      { key: "nom", label: "Nom", type: "text", placeholder: "Nom du demandeur" },
      { key: "prenom", label: "Prénom(s)", type: "text", placeholder: "Prénoms" },
      { key: "date_naissance", label: "Date de naissance", type: "date" },
      { key: "lieu_naissance", label: "Lieu de naissance", type: "text", placeholder: "Ville / commune" },
      { key: "registre_numero", label: "Numéro du registre d'acte", type: "text", placeholder: "Optionnel" },
      { key: "registre_annee", label: "Année du registre", type: "text", placeholder: "Optionnel" },
    ],
    attachments: [
      { label: "Copie / photo de la CNI", required: true, accept: "image/*,.pdf" },
      { label: "Photo de l'ancien extrait d'acte de naissance", required: false, accept: "image/*,.pdf" },
    ],
  },
  marriage_extract: {
    title: "Demande d'extrait d'acte de mariage",
    intro: "Renseignez les informations du couple pour traiter votre demande.",
    fields: [
      { key: "nom_epoux", label: "Nom et prénom(s) de l'époux", type: "text", placeholder: "Nom complet" },
      { key: "nom_epouse", label: "Nom et prénom(s) de l'épouse", type: "text", placeholder: "Nom complet" },
      { key: "date_mariage", label: "Date du mariage", type: "date" },
      { key: "registre_mariage", label: "Numéro du registre de mariage", type: "text", placeholder: "Optionnel" },
    ],
    attachments: [
      { label: "CNI du demandeur", required: true, accept: "image/*,.pdf" },
      { label: "Photo du livret de famille ou ancien extrait", required: false, accept: "image/*,.pdf" },
    ],
  },
  birth_declaration: {
    title: "Déclaration de naissance d'un enfant",
    intro: "Votre déclaration sera transmise à l'Officier d'État Civil pour vérification du registre et validation de l'acte.",
    fields: [
      { key: "enfant_prenoms", label: "Prénom(s) de l'enfant", type: "text", placeholder: "Prénoms" },
      { key: "enfant_sexe", label: "Sexe", type: "text", placeholder: "Masculin / Féminin" },
      { key: "enfant_date_heure", label: "Date et heure exacte de la naissance", type: "text", placeholder: "Ex: 12/04/2026 à 21h40" },
      { key: "enfant_lieu", label: "Lieu de naissance", type: "text", placeholder: "Hôpital / maternité / commune" },
      { key: "pere_nom", label: "Nom et prénom(s) du père", type: "text", placeholder: "Nom complet" },
      { key: "pere_profession", label: "Profession du père", type: "text", placeholder: "Profession" },
      { key: "pere_domicile", label: "Domicile / résidence du père", type: "text", placeholder: "Quartier / commune" },
      { key: "pere_cni", label: "Numéro de CNI / pièce d'identité du père", type: "text", placeholder: "Numéro" },
      { key: "mere_nom", label: "Nom et prénom(s) de la mère", type: "text", placeholder: "Nom complet" },
      { key: "mere_profession", label: "Profession de la mère", type: "text", placeholder: "Profession" },
      { key: "mere_domicile", label: "Domicile / résidence de la mère", type: "text", placeholder: "Quartier / commune" },
      { key: "mere_cni", label: "Numéro de CNI / pièce d'identité de la mère", type: "text", placeholder: "Numéro" },
      { key: "statut_matrimonial", label: "Statut matrimonial", type: "text", placeholder: "Mariés / Célibataires" },
    ],
    attachments: [
      { label: "Certificat de déclaration de naissance / certificat d'accouchement", required: true, accept: "image/*,.pdf" },
      { label: "CNI / pièce d'identité du père ou de la mère", required: true, accept: "image/*,.pdf" },
      { label: "Livret de famille ou acte de mariage", required: false, accept: "image/*,.pdf" },
    ],
    note: "ℹ️ Note : Votre déclaration sera transmise à l'Officier d'État Civil pour vérification du registre et validation de l'acte.",
  },
  residence_certificate: {
    title: "Demande de certificat de résidence",
    intro: "Veuillez renseigner les informations de votre domicile et joindre les pièces demandées.",
    fields: [
      { key: "nom_demandeur", label: "Nom et prénom(s) du demandeur", type: "text", placeholder: "Nom complet" },
      { key: "profession", label: "Profession", type: "text", placeholder: "Profession" },
      { key: "commune", label: "Commune d'habitation", type: "text", placeholder: "Commune" },
      { key: "quartier", label: "Quartier / secteur", type: "text", placeholder: "Quartier" },
      { key: "lot_ilot", label: "Numéro de lot et ilôt", type: "text", placeholder: "Si disponible" },
      { key: "duree_residence", label: "Nombre d'années de résidence dans la commune", type: "text", placeholder: "Ex: 5 ans" },
    ],
    attachments: [
      { label: "CNI du demandeur", required: true, accept: "image/*,.pdf" },
      { label: "Justificatif de domicile (facture CIE/SODECI ou attestation d'hébergement)", required: true, accept: "image/*,.pdf" },
    ],
  },
  full_birth_copy: {
    title: "Demande de copie intégrale d'acte de naissance",
    intro: "Ce document nécessite la vérification complète de la filiation.",
    fields: [
      { key: "titulaire_nom", label: "Nom et prénom(s) du titulaire", type: "text", placeholder: "Nom complet" },
      { key: "date_lieu_naissance", label: "Date et lieu de naissance", type: "text", placeholder: "Ex: 15/08/1995 à Abidjan" },
      { key: "pere_complet", label: "Nom et prénom(s) complets du père", type: "text", placeholder: "Nom complet" },
      { key: "mere_complete", label: "Nom et prénom(s) complets de la mère", type: "text", placeholder: "Nom complet" },
      { key: "motif", label: "Motif de la demande", type: "textarea", placeholder: "Ex: Mariage, dossier officiel, nationalité" },
    ],
    attachments: [
      { label: "CNI du demandeur", required: true, accept: "image/*,.pdf" },
      { label: "Justificatif de filiation si la demande concerne un tiers (livret de famille)", required: true, accept: "image/*,.pdf" },
    ],
  },
  document_legalisation: {
    title: "Demande de légalisation de document",
    intro: "Ce dossier doit être vérifié au guichet et l'original physique doit être présenté lors du retrait final.",
    fields: [
      { key: "demandeur_nom", label: "Nom et prénom(s) du demandeur", type: "text", placeholder: "Nom complet" },
      { key: "type_document", label: "Type de document à légaliser", type: "text", placeholder: "Ex: diplôme du BAC, relevé de notes, contrat de bail" },
      { key: "nombre_exemplaires", label: "Nombre d'exemplaires souhaités", type: "text", placeholder: "1, 2, 3..." },
    ],
    attachments: [
      { label: "Scan haute définition ou photo nette du document original", required: true, accept: "image/*,.pdf" },
      { label: "CNI du demandeur", required: true, accept: "image/*,.pdf" },
    ],
    note: "⚠️ ATTENTION : Pour la légalisation, vous devez impérativement vous munir du document ORIGINAL physique lors de votre passage au guichet pour la vérification finale et l'apposition du cachet.",
  },
  death_extract: {
    title: "Déclaration et extrait de décès",
    intro: "Le déclarant devra fournir les éléments et les pièces nécessaires pour l'enregistrement du décès.",
    fields: [
      { key: "defunt_nom", label: "Nom et prénom(s) du défunt", type: "text", placeholder: "Nom complet" },
      { key: "date_lieu_deces", label: "Date et lieu du décès", type: "text", placeholder: "Ex: 10/02/2026 à Abidjan" },
      { key: "declarant_nom", label: "Nom, prénom(s) et lien de parenté du déclarant", type: "text", placeholder: "Ex: Marie Kouassi, fille" },
    ],
    attachments: [
      { label: "Certificat médical de constat de décès", required: true, accept: "image/*,.pdf" },
      { label: "CNI du déclarant", required: true, accept: "image/*,.pdf" },
    ],
  },
  cni: {
    title: "Carte Nationale d'Identité (CNI / ONI)",
    intro: "La demande de CNI s'appuie sur les données d'état civil déjà vérifiées pour une pré-demande rapide.",
    fields: [
      { key: "motif_demande", label: "Motif de la demande", type: "text", placeholder: "Première demande / Renouvellement / Perte (Duplicata)" },
      { key: "nom", label: "Nom", type: "text", placeholder: "Nom complet" },
      { key: "prenom", label: "Prénom(s)", type: "text", placeholder: "Prénoms" },
      { key: "date_naissance", label: "Date de naissance", type: "date" },
      { key: "lieu_naissance", label: "Lieu de naissance", type: "text", placeholder: "Ville / commune" },
      { key: "pere_nom", label: "Nom et prénom du père", type: "text", placeholder: "Nom complet" },
      { key: "mere_nom", label: "Nom et prénom de la mère", type: "text", placeholder: "Nom complet" },
      { key: "nni", label: "Numéro NNI / ancien CNI", type: "text", placeholder: "Si renouvellement" },
      { key: "centre_enrolement", label: "Centre de prise d'empreintes / enrôlement souhaité", type: "text", placeholder: "Mairie ou centre ONI le plus proche" },
    ],
    attachments: [
      { label: "Extrait d'acte de naissance (photo ou scan clair)", required: true, accept: "image/*,.pdf" },
      { label: "Certificat de nationalité ou déclaration de perte", required: true, accept: "image/*,.pdf" },
      { label: "Photo d'identité au format officiel", required: true, accept: "image/*,.pdf" },
    ],
  },
  passport: {
    title: "Passeport Biométrique",
    intro: "Pré-demande en ligne, puis rendez-vous pour la capture biométrique dans le centre sélectionné.",
    fields: [
      { key: "identite_complete", label: "Identité complète", type: "text", placeholder: "Nom et prénom(s)" },
      { key: "profession", label: "Profession", type: "text", placeholder: "Profession" },
      { key: "nni", label: "Numéro NNI / CNI obligatoire", type: "text", placeholder: "Numéro" },
      { key: "taille", label: "Taille", type: "text", placeholder: "Ex: 1m72" },
      { key: "couleur_yeux", label: "Couleur des yeux", type: "text", placeholder: "Ex: noir / marron" },
      { key: "contact_nom", label: "Personne à contacter en cas d'urgence", type: "text", placeholder: "Nom complet" },
      { key: "contact_telephone", label: "Téléphone de contact", type: "text", placeholder: "Numéro de téléphone" },
      { key: "lien_parente", label: "Lien de parenté", type: "text", placeholder: "Ex: frère, épouse, parent" },
      { key: "centre_rendezvous", label: "Centre de rendez-vous biométrique", type: "text", placeholder: "Plateau, Cocody, etc." },
      { key: "date_heure_rendezvous", label: "Date / heure du créneau", type: "text", placeholder: "Ex: 12/08/2026 - 10h30" },
    ],
    attachments: [
      { label: "Photo / scan de la CNI (recto-verso)", required: true, accept: "image/*,.pdf" },
      { label: "Extrait d'acte de naissance datant de moins de 3 mois", required: true, accept: "image/*,.pdf" },
      { label: "Justificatif de profession", required: true, accept: "image/*,.pdf" },
      { label: "Ancien passeport (si renouvellement)", required: false, accept: "image/*,.pdf" },
    ],
    note: "Une fois votre pré-demande validée et réglée, munissez-vous de vos originaux et présentez-vous au centre sélectionné le jour de votre rendez-vous pour la prise d'empreintes digitales et de la photo biométrique.",
  },
  permit: {
    title: "Permis de conduire",
    intro: "Préparez votre dossier de permis avec les données CNI et le certificat médical requis.",
    fields: [
      { key: "type_demarche", label: "Type de démarche", type: "text", placeholder: "Premier permis / Renouvellement / Extension / Duplicata" },
      { key: "numero_cni", label: "Numéro CNI / NNI", type: "text", placeholder: "Numéro" },
      { key: "auto_ecole", label: "Auto-école de formation", type: "text", placeholder: "Nom de l'auto-école" },
      { key: "numero_permis_actuel", label: "Numéro du permis actuel", type: "text", placeholder: "Si renouvellement ou extension" },
    ],
    attachments: [
      { label: "Photo / scan de la CNI", required: true, accept: "image/*,.pdf" },
      { label: "Certificat d'aptitude médicale à la conduite", required: true, accept: "image/*,.pdf" },
      { label: "Photo d'identité récente", required: true, accept: "image/*,.pdf" },
      { label: "Attestation de succès à l'examen / ancien permis", required: false, accept: "image/*,.pdf" },
    ],
  },
  casier: {
    title: "Extrait de casier judiciaire (Bulletin n°3)",
    intro: "Dossier rapide pour les demandes liées à l'embauche, concours ou visa.",
    fields: [
      { key: "nom", label: "Nom et prénom(s)", type: "text", placeholder: "Nom complet" },
      { key: "date_naissance", label: "Date et lieu de naissance", type: "text", placeholder: "Ex: 25/06/1994 à Abidjan" },
      { key: "tribunal_naissance", label: "Tribunal de première instance de naissance", type: "text", placeholder: "Ex: Tribunal de Yopougon, Abidjan, Bouaké" },
      { key: "pere_nom", label: "Nom complet du père", type: "text", placeholder: "Nom complet" },
      { key: "mere_nom", label: "Nom complet de la mère", type: "text", placeholder: "Nom complet" },
      { key: "motif_demande", label: "Motif de la demande", type: "text", placeholder: "Concours administratif, Embauche, Visa, etc." },
    ],
    attachments: [
      { label: "Photo / scan de la CNI ou attestation d'identité", required: true, accept: "image/*,.pdf" },
      { label: "Photo / scan de l'extrait d'acte de naissance", required: true, accept: "image/*,.pdf" },
    ],
  },
};

// ====================================================================================
// COMPOSANTS UTILITAIRES
// ====================================================================================

function Progress({ step }: { step: number }) {
  const steps = ["Catégorie", "Document", "Confirmation"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
              ${i < step - 1 ? "bg-green-600 text-white" : i === step - 1 ? "bg-[#0A2540] text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"}`}>
              {i < step - 1 ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium text-center max-w-[80px] ${i === step - 1 ? "text-[#0A2540]" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-10 h-0.5 mb-4 mx-1 transition-all duration-200 ${i < step - 1 ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function UploadZone({ label, hint, done, onFile }: {
  label: string;
  hint: string;
  done: string | null;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{label}</label>
      <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all
        ${done ? "border-green-400 bg-green-50" : "border-gray-200 bg-gray-50 hover:border-[#009A44] hover:bg-green-50"}`}>
        <input type="file" className="hidden" accept="image/*,.pdf" onChange={onFile} />
        {done ? (
          <>
            <CheckCircle size={22} className="text-green-500 mb-1" />
            <span className="text-xs text-green-700 font-semibold">{done}</span>
          </>
        ) : (
          <>
            <Upload size={20} className="text-gray-400 mb-1" />
            <span className="text-xs text-gray-500 text-center">{hint}</span>
          </>
        )}
      </label>
    </div>
  );
}

type DocumentItem = {
  id: string;
  name: string;
  time: string;
  price: string;
};

const PROFILE_STORAGE_KEY = "kronodoc_profile_v1";
const PROFILE_KEYS = new Set([
  "nom",
  "prenom",
  "date_naissance",
  "lieu_naissance",
  "cni",
  "nni",
  "numero_cni",
  "motif_demande",
  "pere_nom",
  "mere_nom",
  "identite_complete",
  "profession",
  "nom_demandeur",
  "titulaire_nom",
  "defunt_nom",
  "centre_enrolement",
  "centre_rendezvous",
  "tribunal_naissance",
]);

const DEMO_PROFILE_BY_DOCUMENT: Record<string, Record<string, string>> = {
  birth_extract: {
    nom: "Kouassi",
    prenom: "Amani",
    date_naissance: "1998-05-12",
    lieu_naissance: "Abidjan",
    registre_numero: "AB-0458",
    registre_annee: "1998",
  },
  marriage_extract: {
    nom_epoux: "Kouassi Yao",
    nom_epouse: "Diarra Awa",
    date_mariage: "2022-02-15",
    registre_mariage: "MR-2214",
  },
  birth_declaration: {
    enfant_prenoms: "Nina Kouassi",
    enfant_sexe: "Féminin",
    enfant_date_heure: "12/04/2026 à 21h40",
    enfant_lieu: "Centre Hospitalier de Treichville",
    pere_nom: "Kouassi Jean",
    pere_profession: "Comptable",
    pere_domicile: "Yopougon",
    pere_cni: "CI123456789",
    mere_nom: "Diarra Aline",
    mere_profession: "Infirmière",
    mere_domicile: "Yopougon",
    mere_cni: "CI987654321",
    statut_matrimonial: "Mariés",
  },
  residence_certificate: {
    nom_demandeur: "Kouassi Amani",
    profession: "Agent de sécurité",
    commune: "Abidjan",
    quartier: "Plateau",
    lot_ilot: "Lot 22, Ilot 14",
    duree_residence: "5 ans",
  },
  full_birth_copy: {
    titulaire_nom: "Kouassi Amani",
    date_lieu_naissance: "12/05/1998 à Abidjan",
    pere_complet: "Kouassi Jean",
    mere_complete: "Diarra Aline",
    motif: "Dossier de mariage",
  },
  document_legalisation: {
    demandeur_nom: "Kouassi Amani",
    type_document: "Diplôme du BAC",
    nombre_exemplaires: "2",
  },
  death_extract: {
    defunt_nom: "Diarra Marcel",
    date_lieu_deces: "10/02/2026 à Abidjan",
    declarant_nom: "Diarra Yao, fils",
  },
  cni: {
    motif_demande: "Première demande",
    nom: "Kouassi",
    prenom: "Amani",
    date_naissance: "1998-05-12",
    lieu_naissance: "Abidjan",
    pere_nom: "Kouassi Jean",
    mere_nom: "Diarra Aline",
    nni: "CI-2024-9911",
    centre_enrolement: "Centre ONI Plateau",
  },
  passport: {
    identite_complete: "Kouassi Amani",
    profession: "Chef de projet",
    nni: "CI-2024-9911",
    taille: "1m72",
    couleur_yeux: "Noir",
    contact_nom: "Diarra Aline",
    contact_telephone: "+225 07 00 00 00 01",
    lien_parente: "Épouse",
    centre_rendezvous: "Plateau",
    date_heure_rendezvous: "12/08/2026 - 10h30",
  },
  permit: {
    type_demarche: "Premier permis",
    numero_cni: "CI123456789",
    auto_ecole: "Auto École Excellence",
    numero_permis_actuel: "Permis non applicable",
  },
  casier: {
    nom: "Kouassi Amani",
    date_naissance: "25/06/1994 à Abidjan",
    tribunal_naissance: "Tribunal de Yopougon",
    pere_nom: "Kouassi Jean",
    mere_nom: "Diarra Aline",
    motif_demande: "Embauche",
  },
};

function loadStoredProfile(): Record<string, string> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function persistProfile(data: Record<string, string>) {
  if (typeof window === "undefined") return;

  const filtered: Record<string, string> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (PROFILE_KEYS.has(key) && typeof value === "string" && value.trim()) {
      filtered[key] = value;
    }
  });

  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(filtered));
}

// ====================================================================================
// PAGE PRINCIPALE
// ====================================================================================
function CitoyenPage() {
  const [step, setStep] = useState(1);
  const [isTestMode, setIsTestMode] = useState<boolean>(() => isDevTestModeEnabled());
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof SERVICES_DATA | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [legalisationFile, setLegalisationFile] = useState<File | null>(null);
  const [legalisationCopies, setLegalisationCopies] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  // --- États pour le formulaire dynamique de l'étape 3 ---
  const [beneficiaryType, setBeneficiaryType] = useState<"for_me" | "for_child" | "for_third_party">("for_me");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({});

  const categoryData = selectedCategory ? SERVICES_DATA[selectedCategory] : null;

  const toggleTestMode = () => {
    const nextValue = !isTestMode;
    setIsTestMode(nextValue);
    setDevTestMode(nextValue);
  };

  const fillTestDraft = (documentId: string) => {
    const demoProfile = DEMO_PROFILE_BY_DOCUMENT[documentId] ?? {};
    const config = DOCUMENT_FORM_CONFIG[documentId];
    const nextFormData = { ...loadStoredProfile(), ...demoProfile };
    setFormData(nextFormData);
    persistProfile(nextFormData);

    if (config) {
      const nextFiles: Record<string, File> = {};
      config.attachments.forEach((attachment) => {
        nextFiles[attachment.label] = new File(["Test file"], `${attachment.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`, {
          type: "application/pdf",
        });
      });
      setDocumentFiles(nextFiles);
    }
  };

  const filteredSections = useMemo(() => {
    if (!categoryData || !searchQuery) {
      return categoryData?.sections || [];
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return categoryData.sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.name.toLowerCase().includes(lowerCaseQuery))
      }))
      .filter(section => section.items.length > 0);
  }, [categoryData, searchQuery]);

  const handleSelectCategory = (categoryId: keyof typeof SERVICES_DATA) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedEntity(null);
    setSearchQuery("");
    setSelectedDocument(null);
    setBeneficiaryType("for_me");
    setStep(1);
  };

  const handleTestModeToggle = () => {
    toggleTestMode();
  };

  useEffect(() => {
    if (!selectedDocument) return;
    const stored = loadStoredProfile();
    setFormData(prev => ({ ...stored, ...prev }));
  }, [selectedDocument]);

  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDocument(doc);
    setStep(3); // Passe à l'étape du formulaire
  };

  const handleBackToDocumentSelection = () => {
    setSelectedDocument(null);
    setBeneficiaryType("for_me");
    setStep(2);
  }

  const qrStatusLabel = paymentMethod === "digital" ? "PAYÉ EN LIGNE" : "NON PAYÉ / À ENCAISSER";
  const qrStatusColor = paymentMethod === "digital" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200";
  const qrInstruction =
    paymentMethod === "digital"
      ? "Le guichet vérifiera les pièces physiques puis passera directement à la validation de votre dossier."
      : "Présentez-vous à la mairie avec vos originaux et votre QR Code. L’agent encaissera les frais à la caisse avant validation.";

// ─── PAGE PRINCIPALE ───
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pb-10 pt-6 md:pt-8">
        <div className="space-y-8">
          {step === 1 && (
            <div className="text-center">
              <div className="mb-4 flex items-center justify-center gap-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Faire une demande</h1>
                <button
                  type="button"
                  onClick={handleTestModeToggle}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all ${
                    isTestMode
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-border bg-white text-muted-foreground hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {isTestMode ? "Mode test actif" : "Laisser passer test"}
                </button>
              </div>
              <p className="mt-2 text-muted-foreground">Remplissez votre dossier depuis chez vous. Venez juste signer au guichet.</p>
            </div>
          )}

          {isTestMode && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-semibold">Mode test activé : validation de formulaire désactivée et données d’exemple disponibles.</span>
                <button
                  type="button"
                  onClick={handleTestModeToggle}
                  className="text-xs font-bold underline underline-offset-2"
                >
                  Désactiver
                </button>
              </div>
            </div>
          )}

          <Progress step={step} />

          <div className="rounded-[28px] border border-border bg-card p-6 shadow-[0_18px_45px_-28px_rgba(10,37,64,0.35)] md:p-8">
            {/* ÉTAPE 1 : GRILLE DES CATÉGORIES */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-[#0A2540] mb-1">De quel domaine s'agit-il ?</h2>
                <p className="text-xs text-gray-400 mb-6">Sélectionnez le service public concerné par votre demande.</p>
                <div className="space-y-3">
                  {Object.entries(SERVICES_DATA).map(([key, cat]) => (
                    <button
                      key={key}
                      className="group w-full rounded-2xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#009A44] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-200"
                      onClick={() => handleSelectCategory(key as keyof typeof SERVICES_DATA)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A2540] text-xl text-white shadow-sm">
                          {cat.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-base font-bold text-[#0A2540]">{cat.title}</div>
                          <p className="mt-1 text-sm text-gray-600 leading-relaxed">{cat.description}</p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700 transition-colors group-hover:bg-green-100">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : SÉLECTION ENTITÉ & DOCUMENT */}
            {step === 2 && categoryData && (
              <div>
                <button onClick={handleBackToCategories} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
                  <ArrowLeft size={16} /> Retour aux catégories
                </button>

                {/* Sélecteur d'entité */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{categoryData.entityLabel}</label>
                  <select
                    onChange={(e) => setSelectedEntity(e.target.value)}
                    defaultValue=""
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="" disabled>{categoryData.entityPlaceholder}</option>
                    {categoryData.entities.map(entity => <option key={entity} value={entity}>{entity}</option>)}
                  </select>
                </div>

                {/* Contenu affiché seulement si une entité est choisie */}
                {selectedEntity && (
                  <>
                    {/* Barre de recherche (sauf pour légalisation) */}
                    {selectedCategory !== 'legalisation' && (
                      <div className="relative my-6">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Rechercher un document</label>
                        <Search size={16} className="absolute left-4 top-10 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Ex: certificat de résidence, acte de naissance..."
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white pl-10"
                        />
                      </div>
                    )}

                    {/* Titre du domaine */}
                    <h2 className="text-lg font-bold text-[#0A2540] mb-4 mt-6">{categoryData.icon} {categoryData.title}</h2>

                    {/* Cas spécifique : Légalisation */}
                    {selectedCategory === 'legalisation' ? (
                      <div className="space-y-6">
                        <UploadZone
                          label="Document à légaliser"
                          hint="Scannez ou prenez en photo votre diplôme, attestation, contrat..."
                          done={legalisationFile?.name || null}
                          onFile={(e) => e.target.files && setLegalisationFile(e.target.files[0])}
                        />
                        {legalisationFile && (
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nombre de copies</label>
                            <div className="flex items-center gap-2">
                              <Copy size={16} className="text-gray-400" />
                              <input
                                type="number"
                                value={legalisationCopies}
                                onChange={e => setLegalisationCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                min="1"
                                className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center"
                              />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Total à payer : <span className="font-bold text-orange-600">{legalisationCopies * 500} FCFA</span></p>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Liste des documents pour les autres catégories */
                      <div className="space-y-6">
                        {filteredSections.map((section, i) => (
                          <div key={i}>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{section.title}</h3>
                            <div className="space-y-2">
                              {section.items.map(item => (
                                <div key={item.id} className="w-full text-left border-2 border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                  <div>
                                    <div className="font-semibold text-sm text-[#0A2540]">{item.name}</div>
                                    <div className="text-xs text-gray-400 mt-0.5" dangerouslySetInnerHTML={{ __html: `Délai estimé : ${item.time}` }} />
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="font-bold text-sm text-orange-600">{item.price}</div>
                                    <button onClick={() => handleSelectDocument(item)} className="px-4 py-2 bg-[#009A44] text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-xs">
                                      Demander
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ÉTAPE 3 : FORMULAIRE D'INFORMATIONS */}
            {step === 3 && selectedDocument && (
              <Etape3_InformationsEtJustificatif
                selectedDocument={selectedDocument}
                beneficiaryType={beneficiaryType}
                setBeneficiaryType={setBeneficiaryType}
                formData={formData}
                setFormData={setFormData}
                documentFiles={documentFiles}
                setDocumentFiles={setDocumentFiles}
                onBack={handleBackToDocumentSelection}
                onComplete={() => setStep(4)}
              />
            )}

            {/* ÉTAPE 4 : CHOIX DU PAIEMENT */}
            {step === 4 && (
              <div>
                <button onClick={() => setStep(4)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
                  <ArrowLeft size={16} /> Retour aux informations
                </button>
                <h2 className="text-lg font-bold text-[#0A2540] mb-1">Mode de règlement</h2>
                <p className="text-xs text-gray-400 mb-6">Choisissez comment régler les frais administratifs de votre dossier.</p>

                <div className="space-y-4">
                  <PaymentOption
                    icon="🏢"
                    title="Paiement à la caisse de la mairie"
                    description="Aucun paiement en ligne. Vous payez les frais physiques au guichet lors de votre passage avec vos originaux."
                    isSelected={paymentMethod === 'physique'}
                    onClick={() => setPaymentMethod('physique')}
                  />
                  <PaymentOption
                    icon="📱"
                    title="Paiement en ligne"
                    description="Payez par Wave, Orange Money ou carte. Le QR généré sera marqué comme payé et la caisse n’encaissera rien."
                    isSelected={paymentMethod === 'digital'}
                    onClick={() => setPaymentMethod('digital')}
                  />
                </div>

                <button onClick={() => setStep(5)} disabled={!paymentMethod} className="mt-8 w-full py-3.5 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
                  {paymentMethod === 'digital' ? 'Payer et Valider' : 'Valider ma pré-demande'}
                </button>
              </div>
            )}

            {/* ÉTAPE 5 : CONFIRMATION ET QR CODE */}
            {step === 5 && selectedDocument && selectedEntity && (
              <div className="text-center">
                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Pré-demande enregistrée !</h2>
                <p className="text-sm text-gray-500 mb-6">Votre dossier est en cours de validation. Présentez ce QR code au guichet de : <span className="font-semibold text-gray-700">{selectedEntity}</span>.</p>

                <div className="mb-4 flex justify-center">
                  <div className={`inline-block rounded-2xl border-4 p-4 ${paymentMethod === "digital" ? "border-emerald-500 bg-emerald-50" : "border-amber-400 bg-amber-50"}`}>
                    <QrCode size={160} strokeWidth={2.5} className={paymentMethod === "digital" ? "text-emerald-700" : "text-amber-700"} />
                  </div>
                </div>

                <div className="mb-3 font-mono text-lg font-bold tracking-widest text-gray-700">KDC-2024-AB76F2</div>

                <div className={`mb-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${qrStatusColor}`}>
                  {qrStatusLabel}
                </div>

                <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm text-gray-700">
                  <div className="font-semibold text-[#0A2540]">Statut de votre dossier</div>
                  <p className="mt-1">Pré-demande en cours · En attente de validation physique et de vérification par l’agent de guichet.</p>
                  <p className="mt-2 text-xs text-gray-500">{qrInstruction}</p>
                </div>

                <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Veuillez vous rendre à la mairie de <span className="font-bold">{selectedEntity}</span> muni de vos originaux et de votre QR Code. L’agent scannera votre dossier puis validera la transmission pour la signature du maire.
                </div>

                <button onClick={handleBackToCategories} className="mt-6 w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">
                  Faire une autre demande
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Etape3_InformationsEtJustificatif({
  selectedDocument,
  beneficiaryType,
  setBeneficiaryType,
  formData,
  setFormData,
  documentFiles,
  setDocumentFiles,
  onBack,
  onComplete,
}: {
  selectedDocument: DocumentItem;
  beneficiaryType: "for_me" | "for_child" | "for_third_party";
  setBeneficiaryType: React.Dispatch<React.SetStateAction<"for_me" | "for_child" | "for_third_party">>;
  formData: Record<string, string>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  documentFiles: Record<string, File | null>;
  setDocumentFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>>;
  onBack: () => void;
  onComplete: () => void;
}) {
  const config = DOCUMENT_FORM_CONFIG[selectedDocument.id] ?? {
    title: selectedDocument.name,
    intro: "Complétez les informations demandées pour vous inscrire.",
    fields: [
      { key: "nom", label: "Nom", type: "text" as const, placeholder: "Nom" },
      { key: "prenom", label: "Prénom(s)", type: "text" as const, placeholder: "Prénoms" },
      { key: "cni", label: "Numéro de CNI", type: "text" as const, placeholder: "Numéro de CNI" },
    ],
    attachments: [{ label: "Pièce justificative", required: true, accept: "image/*,.pdf" }],
  };

  const handleFieldChange = (key: string, value: string) => {
    const nextData = { ...formData, [key]: value };
    setFormData(nextData);
    persistProfile(nextData);
  };

  const handleAttachmentChange = (label: string, file: File | null) => {
    setDocumentFiles(prev => ({ ...prev, [label]: file }));
  };

  const identityLabel = "Pièce d'identité du demandeur (CNI, Attestation, Passeport, Livret de famille)";
  const beneficiaryOptions = [
    { value: "for_me", label: "Pour moi-même" },
    { value: "for_child", label: "Pour mon enfant / un mineur" },
    { value: "for_third_party", label: "Pour un tiers" },
  ] as const;

  const requiredFieldsMissing = config.fields.some(field => field.required !== false && !String(formData[field.key] ?? "").trim());
  const requiredFilesMissing = config.attachments.some(attachment => attachment.required && !documentFiles[attachment.label]);
  const canContinue = isDevTestModeEnabled() || (!requiredFieldsMissing && !requiredFilesMissing);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft size={16} /> Retour à la sélection
      </button>

      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
        <div>
          <h2 className="text-lg font-bold text-[#0A2540] mb-1">{config.title}</h2>
          <p className="text-xs text-gray-400">{config.intro}</p>
        </div>
        {isDevTestModeEnabled() && (
          <button
            type="button"
            onClick={() => {
              const profile = DEMO_PROFILE_BY_DOCUMENT[selectedDocument.id] ?? {};
              const nextData = { ...formData, ...profile };
              setFormData(nextData);
              persistProfile(nextData);
              const nextFiles: Record<string, File> = {};
              config.attachments.forEach((attachment) => {
                nextFiles[attachment.label] = new File(["test"], `${attachment.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`, { type: "application/pdf" });
              });
              setDocumentFiles(nextFiles);
            }}
            className="rounded-xl bg-[#0A2540] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#112d4f]"
          >
            Remplir test
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Demande pour</label>
        <div className="space-y-2">
          {beneficiaryOptions.map(option => (
            <label key={option.value} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:border-green-300 hover:bg-green-50">
              <input
                type="radio"
                name="beneficiaryType"
                checked={beneficiaryType === option.value}
                onChange={() => setBeneficiaryType(option.value)}
                className="h-4 w-4 accent-[#009A44]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                value={formData[field.key] ?? ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-h-[100px]"
              />
            ) : (
              <input
                type={field.type === "date" ? "date" : "text"}
                value={formData[field.key] ?? ""}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {config.attachments.map((attachment, index) => (
          <UploadZone
            key={`${attachment.label}-${index}`}
            label={index === 0 ? identityLabel : attachment.label}
            hint={attachment.required ? "📷 Caméra / 📄 Image ou PDF" : "Optionnel : caméra ou fichier"}
            done={documentFiles[attachment.label]?.name || null}
            onFile={(e) => {
              const selectedFile = e.target.files?.[0] ?? null;
              handleAttachmentChange(attachment.label, selectedFile);
              if (e.target) e.target.value = "";
            }}
          />
        ))}
      </div>

      {config.note && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {config.note}
        </div>
      )}

      <button
        onClick={onComplete}
        disabled={!canContinue}
        className="mt-8 w-full py-3.5 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm"
      >
        Continuer →
      </button>
    </div>
  );
}

function PaymentOption({ icon, title, description, isSelected, onClick }: {
  icon: string;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left border-2 rounded-xl p-5 transition-all flex items-start gap-4
        ${isSelected ? "border-[#009A44] bg-green-50 ring-2 ring-green-200" : "border-gray-200 bg-white hover:border-gray-300"}`}
    >
      <span className="text-3xl mt-1">{icon}</span>
      <div>
        <div className="font-semibold text-base text-[#0A2540]">{title}</div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      {isSelected && <CheckCircle size={20} className="text-green-500 ml-auto flex-shrink-0 mt-1" />}
    </button>
  );
}

function Etape4_Justificatifs({ file, setFile, onBack, onComplete }: {
  file: File | null;
  setFile: (file: File | null) => void;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(selectedFile));
      } else {
        setPreview(null); // No preview for non-image files like PDF
      }
    }
  };

  const resetFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ArrowLeft size={16} /> Retour aux informations
      </button>
      <h2 className="text-lg font-bold text-[#0A2540] mb-1">Pièce justificative</h2>
      <p className="text-xs text-gray-400 mb-6">Fournissez une photo ou un scan de votre pièce d'identité (CNI, passeport...).</p>

      <div className="space-y-4">
        {/* Option 1: Prendre une photo */}
        <label className="w-full text-center cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:bg-gray-50">
          <Camera size={24} className="text-gray-400 mb-2" />
          <span className="font-semibold text-sm text-gray-700">Prendre une photo / Scanner</span>
          <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
        </label>

        {/* Option 2: Importer un fichier */}
        <UploadZone
          label="Ou importer un document"
          hint="Importer un fichier (PDF / JPG / PNG)"
          done={file?.name || null}
          onFile={handleFileChange}
        />

        {/* Aperçu ou info fichier */}
        {file && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
            {preview && <img src={preview} alt="Aperçu" className="w-16 h-12 object-cover rounded-md" />}
            <div className="text-xs flex-1 mx-3">
              <p className="font-semibold text-gray-800 truncate">{file.name}</p>
              <p className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onClick={resetFile} className="text-xs text-red-600 hover:underline">Supprimer</button>
          </div>
        )}
      </div>

      <button onClick={onComplete} disabled={!file} className="mt-8 w-full py-3.5 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
        Continuer →
      </button>
    </div>
  );
}
