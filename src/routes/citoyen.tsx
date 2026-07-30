import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import jsPDF from "jspdf";
import { SiteHeader } from "@/components/site-header"; // Assumed to exist
import { SiteFooter } from "@/components/site-footer"; // Assumed to exist
import { addDossierToQueue, type DocumentType } from "@/lib/mock-data";

export const Route = createFileRoute("/citoyen")({
  head: () => ({ // SEO and metadata
    meta: [
      { title: "Portail Citoyen — KronoDoc CI" },
      {
        name: "description",
        content: "Faites votre pré-demande d'acte d'état civil depuis votre mobile.",
      },
    ],
  }),
  component: CitoyenPage,
});


// --- Types pour la structure des documents ---
interface DocType {
  id: DocumentType; // Use the shared DocumentType for stronger typing
  label: string;
  groupe: string; // Code du groupe (ex: "G1")
  prix: number;
  delai: string;
  disabled?: boolean;
}

interface GroupType {
  code: string;
  titre: string;
  description: string;
}

// --- NOUVELLE STRUCTURE : Groupes de documents ---
// Mise à jour pour refléter la logique "Circuit Long" vs "Circuit Court"
const GROUPES: GroupType[] = [
  { code: "A", titre: "Groupe A : Documents à Instruction & Validation", description: "Actes nécessitant une étude de dossier par un agent (déclarations, certificats...)." },
  { code: "B", titre: "Groupe B : Rééditions & Copies Certifiées (Paiement en ligne)", description: "Copies d'actes déjà existants dans les registres (extraits, légalisations...) avec paiement en ligne." },
  { code: "C", titre: "Groupe C : Actes sensibles à Retrait Obligatoire", description: "Documents nécessitant une validation et un retrait physique exclusif en mairie." },
  { code: "D", titre: "Groupe D : Titres d'Identité & Voyage", description: "Démarches liées aux documents d'identité nationaux (Passeport, CNI...)." },
];

// --- NOUVELLE STRUCTURE : Référentiel des documents par groupe ---
// En production, ces données seraient chargées depuis une API (table `document_templates` versionnée par mairie)
const DOCUMENTS: DocType[] = [
  // --- Groupe A : Instruction & Validation (Circuit Long / avec supervision) ---
  { id: "certificat_residence", label: "Certificat de résidence", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "attestation_hebergement", label: "Attestation d'hébergement", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "celibat", label: "Certificat de célibat", groupe: "A", prix: 1000, delai: "< 5 min" },
  { id: "non-remariage", label: "Certificat de non-remariage", groupe: "A", prix: 1000, delai: "< 5 min" },
  { id: "certificat_vie", label: "Certificat de vie", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "indigence", label: "Certificat d'indigence", groupe: "A", prix: 0, delai: "< 5 min" },
  { id: "legalisation", label: "Légalisation de signature", groupe: "A", prix: 500, delai: "< 3 min" }, // Exige la présence de l'agent

  // --- Groupe B : Rééditions & Copies (Circuit Court / Simplifié) ---
  { id: "extrait_naissance", label: "Extrait d'acte de naissance", groupe: "B", prix: 1000, delai: "< 5 min" },
  { id: "mariage", label: "Extrait d'acte de mariage", groupe: "B", prix: 2000, delai: "< 5 min" },
  { id: "deces", label: "Extrait d'acte de décès", groupe: "B", prix: 1000, delai: "< 5 min" },
  { id: "copie", label: "Certification de copie conforme", groupe: "B", prix: 500, delai: "< 3 min" },

  // --- Groupe C : Actes sensibles (Circuit Long / avec supervision, Retrait Obligatoire) ---
  { id: "declaration-deces", label: "Déclaration de décès", groupe: "C", prix: 0, delai: "Variable" },
  { id: "permis-inhumer", label: "Permis d'inhumer", groupe: "C", prix: 5000, delai: "Variable" },

  // --- Groupe D : Titres d'Identité (Nouveau) ---
  { id: "renouvellement_passeport", label: "Renouvellement de Passeport", groupe: "D", prix: 40000, delai: "3-4 semaines" },
];

const MAIRIES = [
  "Mairie de Cocody", "Mairie de Yopougon", "Mairie de Abobo",
  "Mairie de Adjamé", "Mairie de Plateau", "Mairie de Treichville",
  "Mairie de Marcory", "Mairie de Koumassi", "Mairie de Port-Bouët",
];

// ─── Composant Progress ───
function Progress({ etape, etapes }: { etape: number; etapes: string[] }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {etapes.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${i < etape ? "bg-green-600 text-white" : i === etape ? "bg-[#0A2540] text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"}`}>
              {i < etape ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium ${i === etape ? "text-[#0A2540]" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < etapes.length - 1 && (
            <div className={`w-10 h-0.5 mb-4 mx-1 ${i < etape ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Composant Upload ───
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

// ─── QR Code simulé ───
function QRCodeDisplay({ reference }: { reference: string }) {
  const cells = Array.from({ length: 12 }, (_, i) => Array.from({ length: 12 }, (_, j) => (i + j) % 3 !== 0));
  return (
    <div className="inline-block p-3 bg-white border-4 border-black rounded-lg">
      {cells.map((row, i) => (
        <div key={i} className="flex">
          {row.map((on, j) => (
            <div key={j} className={`w-3 h-3 ${on ? "bg-black" : "bg-white"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// --- Définition des champs pour les fiches de prélèvement dynamiques ---
const FICHES_PRELEVEMENT: Record<string, { key: string, label: string, placeholder: string, type?: string }[]> = {
  "A": [ // Champs communs pour les documents à instruction
    { key: "adresse", label: "Adresse complète concernée", placeholder: "Lot 47, Rue J24..." },
    { key: "quartier", label: "Quartier / Commune", placeholder: "Cocody Angré 7e tranche" },
    { key: "occupation", label: "Situation d'occupation", placeholder: "Propriétaire, locataire, hébergé(e)..." },
  ],
  "B": [ // Champs communs pour les rééditions
    { key: "acteNumero", label: "Numéro de l'acte original", placeholder: "Ex: 1234/2023" },
    { key: "acteAnnee", label: "Année de l'acte (si connue)", placeholder: "Ex: 2023" },
    { key: "nomPere", label: "Noms & Prénoms du père", placeholder: "KONAN Jean-Pierre" },
    { key: "nomMere", label: "Noms & Prénoms de la mère", placeholder: "KOUAME Ahou" },
  ],
  "D": [ // Champs pour le renouvellement de passeport
    { key: "ancienPasseportNum", label: "Numéro de l'ancien passeport", placeholder: "Ex: 19BI12345" },
    { key: "dateExpirationAncien", label: "Date d'expiration de l'ancien passeport", placeholder: "", type: "date" },
  ],
  // Les autres groupes (G2, G3, G5, G6) auraient leurs propres champs ici.
};

// --- Interfaces pour un typage plus strict des états ---
interface FormData { // Typage des données du formulaire
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone: string;
  email: string;
  [key: string]: string; // Pour les champs dynamiques
}

interface FichiersData { // Typage des fichiers uploadés
  cni: string | null;
  domicile: string | null;
  hebergement: string | null;
  passeportAncien: string | null;
  photosIdentite: string | null;
  recuPaiement: string | null;
  declarationPerte: string | null;
  autorisationParentale: string | null;
}


// --- Composant de formulaire dynamique ---
function DynamicForm({ groupe, form, setForm }: { groupe: string, form: FormData, setForm: (form: FormData) => void }) {
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white";
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5";

  const champsSpecifiques = FICHES_PRELEVEMENT[groupe] || [];

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-4">
      {/* Champs communs */}
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Nom de famille</label><input value={form.nom} onChange={set("nom")} placeholder="KONÉ" className={inputCls} /></div>
        <div><label className={labelCls}>Prénom(s)</label><input value={form.prenom} onChange={set("prenom")} placeholder="Amina Bintou" className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Date de naissance</label><input type="date" value={form.dateNaissance} onChange={set("dateNaissance")} className={inputCls} /></div>
      
      {/* Champs spécifiques au groupe */}
      {champsSpecifiques.length > 0 && (
        <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
          {champsSpecifiques.map(champ => (
            <div key={champ.label}>
              <label className={labelCls}>{champ.label}</label>
              <input type={champ.type || "text"} placeholder={champ.placeholder} className={inputCls} value={form[champ.key] || ""} onChange={set(champ.key)} />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
        <div><label className={labelCls}>Téléphone</label><input value={form.telephone} onChange={set("telephone")} placeholder="07 XX XX XX XX" className={inputCls} /></div>
        <div><label className={labelCls}>Email (optionnel)</label><input type="email" value={form.email} onChange={set("email")} placeholder="vous@exemple.com" className={inputCls} /></div>
      </div>
    </div>
  );
}

// --- Fonction de génération et de téléchargement de PDF ---
// En production, le PDF serait généré côté serveur avec des éléments de sécurité
// (filigrane, sceau numérique cryptographique) et le lien de téléchargement serait sécurisé.
function generateAndDownloadPdf(doc: DocType, form: FormData, reference: string, copies: number) {
  const pdf = new jsPDF();

  for (let i = 1; i <= copies; i++) {
    if (i > 1) {
      pdf.addPage();
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text(doc.label, 20, 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(`Référence Exemplaire: ${reference}-${i}`, 20, 30);
    pdf.text(`Bénéficiaire: ${form.prenom} ${form.nom}`, 20, 40);

    // Simule le sceau numérique et le QR code
    pdf.rect(150, 50, 40, 40);
    pdf.text("QR Code", 157, 70);
    pdf.text("Sceau Numérique", 152, 75);
  }

  pdf.save(`${doc.id}-${reference}.pdf`);
}

// --- Sous-composant pour l'information "Pas de smartphone ?" ---
function NoSmartphoneInfo() {
  return (
    <div className="mt-8 flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3">
      <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-blue-500" />
      <p className="text-xs text-blue-700">
        <strong>Vous n'avez pas de smartphone ?</strong> Rendez-vous dans un
        cybercafé partenaire ou directement au guichet d'accueil de votre
        mairie. Un agent vous assistera gratuitement.
      </p>
    </div>
  );
}

const ETAPE_COMPONENTS = [
  Etape0_ChoixDocument,
  Etape1_InformationsPersonnelles,
  Etape2_PiecesJustificatives,
  Etape3_Paiement,
  Etape4_Recuperation,
];

interface StepProps {
  setEtape: (etape: number) => void;
  setDocChoisi: (doc: DocType | null) => void;
  docChoisi: DocType | null;
  mairie: string;
  setMairie: (mairie: string) => void;
  recherche: string;
  setRecherche: (recherche: string) => void;
  nombreCopies: number;
  setNombreCopies: (n: number) => void;
  form: FormData;
  setForm: (form: FormData) => void;
  fichiers: FichiersData;
  setFichiers: (fichiers: FichiersData) => void;
  heberge: boolean;
  setHeberge: (heberge: boolean) => void;
  paiement: string;
  setPaiement: (paiement: string) => void;
  reference: string;
}

// ─── PAGE PRINCIPALE ───
function CitoyenPage() {
  const navigate = useNavigate();
  const [etape, setEtape] = useState(0);
  const [docChoisi, setDocChoisi] = useState<DocType | null>(null); // Typage plus précis
  const [mairie, setMairie] = useState("");
  const [nombreCopies, setNombreCopies] = useState(1);
  const [heberge, setHeberge] = useState(false);
  const [paiement, setPaiement] = useState("wave");
  const [recherche, setRecherche] = useState("");
  const [form, setForm] = useState<FormData>({ nom: "", prenom: "", dateNaissance: "", telephone: "", email: "" });
  const [fichiers, setFichiers] = useState<FichiersData>({
    cni: null,
    domicile: null,
    hebergement: null,
    passeportAncien: null,
    photosIdentite: null,
    recuPaiement: null,
    declarationPerte: null,
    autorisationParentale: null,
  });
  const [reference] = useState(`KDC-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`);

  // La barre de progression s'adapte au parcours utilisateur
  const ETAPES_PROGRESS = (docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C')
    ? ["Document", "Informations", "Pièces", "QR Code"]
    : ["Document", "Informations", "Pièces", "Paiement", "Récupération"];

  // Ajuste l'index de l'étape si le paiement est sauté
  const etapePaiementIndex = ETAPES_PROGRESS.indexOf("Paiement");
  const etapeQrCodeIndex = ETAPES_PROGRESS.indexOf("QR Code");

  const setFichier = (k: keyof FichiersData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFichiers({ ...fichiers, [k]: f.name });
  };

  const documentsFiltres = DOCUMENTS.filter(doc =>
    doc.label.toLowerCase().includes(recherche.toLowerCase())
  );

  // Regroupe les documents filtrés par leur groupe
  // En production, cette logique serait gérée côté backend ou par un store global
  // pour éviter de re-calculer à chaque rendu.
  
  return (
    <div className="min-h-screen bg-muted/40 flex flex-col">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="space-y-8">
          {/* Titre */}
          {etape === 0 ? (
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Faire une demande</h1>
              <p className="mt-2 text-muted-foreground">Remplissez votre dossier depuis chez vous. Venez juste signer au guichet.</p>
            </div>
          ) : null}

          <Progress etape={etape} etapes={ETAPES_PROGRESS} />

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">

            {/* ── ÉTAPE 0 : Choix du document ── */}
            {etape === 0 && (
              <Etape0_ChoixDocument {...{ setEtape, docChoisi, setDocChoisi, mairie, setMairie, recherche, setRecherche, nombreCopies, setNombreCopies, documentsFiltres }} />
            )}

            {/* ── ÉTAPE 1 : Informations personnelles ── */}
            {etape === 1 && (
              <Etape1_InformationsPersonnelles {...{ setEtape, docChoisi, form, setForm }} />
            )}

            {/* ── ÉTAPE 2 : Pièces justificatives ── */}
            {etape === 2 && (
              <Etape2_PiecesJustificatives {...{ setEtape, docChoisi, form, reference, etapeQrCodeIndex, etapePaiementIndex, fichiers, setFichiers, heberge, setHeberge }} />
            )}

            {/* ── ÉTAPE 3 : Paiement ── */}
            {etape === etapePaiementIndex && docChoisi?.groupe === 'B' && ( // Ne s'affiche que pour le Groupe B
              <Etape3_Paiement {...{ setEtape, docChoisi, form, mairie, nombreCopies, paiement, setPaiement, reference, etapePaiementIndex }} />
            )}

            {/* ── ÉTAPE 4 : QR Code / Récupération ── */}
            {etape >= etapeQrCodeIndex && (
              <Etape4_Recuperation {...{ setEtape, docChoisi, form, mairie, nombreCopies, reference, navigate, setDocChoisi }} />
            )}
          </div>
        </div>

        {/* Info bas de page */}
        {etape < ETAPES_PROGRESS.length - 1 && (
          <NoSmartphoneInfo />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}


// ====================================================================================
// ========================== SOUS-COMPOSANTS PAR ÉTAPE ===============================
// ====================================================================================

// NOTE: The following components are extracted from the main CitoyenPage component
// to improve readability and maintainability. They receive state and setters as props.

type StepSpecificProps<T> = StepProps & T;

// --- ÉTAPE 0 : CHOIX DU DOCUMENT ---
function Etape0_ChoixDocument({ setEtape, docChoisi, setDocChoisi, mairie, setMairie, recherche, setRecherche, nombreCopies, setNombreCopies, documentsFiltres }: StepSpecificProps<{ documentsFiltres: DocType[] }>) {
  return (
    <div>
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Mairie concernée</label>
        <select value={mairie} onChange={e => setMairie(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">Sélectionner votre mairie...</option>
          {MAIRIES.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="relative mb-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Rechercher un document</label>
        <Search size={16} className="absolute left-4 top-10 text-gray-400" />
        <input
          type="text"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          placeholder="Ex: certificat de résidence, acte de naissance..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white pl-10"
        />
      </div>
      <div className="space-y-4">
        {GROUPES.map(groupe => {
          const docsDuGroupe = documentsFiltres.filter(d => d.groupe === groupe.code);
          if (docsDuGroupe.length === 0) return null;
          return (
            <div key={groupe.code}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{groupe.titre}</h3>
              <p className="text-xs text-gray-500 mb-3">{groupe.description}</p>
              {docsDuGroupe.map(doc => (
                <button key={doc.id} onClick={() => setDocChoisi(doc)}
                  className={`w-full text-left border-2 rounded-xl p-4 transition-all flex items-center justify-between mb-2
                    ${docChoisi?.id === doc.id ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div>
                    <div className="font-semibold text-sm text-[#0A2540]">{doc.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{`Délai au guichet : ${doc.delai}`}</div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`font-bold text-sm ${doc.prix > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {doc.prix > 0 ? `${doc.prix} FCFA` : 'Gratuit'}
                    </div>
                    {docChoisi?.id === doc.id && <CheckCircle size={16} className="text-green-500 mt-1" />}
                  </div>
                </button>
              ))}
            </div>
          );
        })}
      </div>
      {docChoisi && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Nombre d'exemplaires</label>
          <div className="flex items-center gap-2">
            <Copy size={16} className="text-gray-400" />
            <input
              type="number"
              value={nombreCopies}
              onChange={e => setNombreCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
              className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>
        </div>
      )}
      <button onClick={() => setEtape(1)} disabled={!docChoisi || !mairie}
        className="mt-6 w-full py-3.5 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
        Continuer →
      </button>
    </div>
  );
}

// --- ÉTAPE 1 : INFORMATIONS PERSONNELLES ---
function Etape1_InformationsPersonnelles({ setEtape, docChoisi, form, setForm }: StepProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#0A2540] mb-1">Vos informations</h2>
      <p className="text-xs text-gray-400 mb-5">Saisissez exactement vos informations telles qu'elles figurent sur votre CNI.</p>
      <DynamicForm groupe={docChoisi?.groupe || ""} form={form} setForm={setForm} />
      <div className="flex gap-3 mt-6">
        <button onClick={() => setEtape(0)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
        <button onClick={() => setEtape(2)} disabled={!form.nom || !form.prenom || !form.dateNaissance}
          className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
          Continuer →
        </button>
      </div>
    </div>
  );
}

// --- ÉTAPE 2 : PIÈCES JUSTIFICATIVES ---
function Etape2_PiecesJustificatives({ setEtape, docChoisi, form, reference, etapeQrCodeIndex, etapePaiementIndex, fichiers, setFichiers, heberge, setHeberge }: StepProps) {
  const setFichier = (k: keyof FichiersData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFichiers({ ...fichiers, [k]: f.name });
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0A2540] mb-1">Pièces justificatives</h2>
      <p className="text-xs text-gray-400 mb-5">Photos nettes acceptées. L'agent vérifiera les originaux au guichet.</p>
      
      {/* --- Logique d'affichage conditionnelle pour les pièces --- */}
      {docChoisi?.id === 'renouvellement_passeport' ? (
        <>
          <div className="space-y-4 mb-5">
            <UploadZone label="Ancien passeport" hint="Copie de la page d'identité" done={fichiers.passeportAncien} onFile={setFichier("passeportAncien")} />
            <UploadZone label="Acte de naissance" hint="Extrait sécurisé ou copie intégrale (< 3 mois)" done={fichiers.cni} onFile={setFichier("cni")} />
            <UploadZone label="CNI ou Attestation d'Identité" hint="En cours de validité" done={fichiers.cni} onFile={setFichier("cni")} />
            <UploadZone label="Justificatif de domicile" hint="Facture récente ou certificat de résidence" done={fichiers.domicile} onFile={setFichier("domicile")} />
            <UploadZone label="Photos d'identité" hint="Format passeport, fond clair" done={fichiers.photosIdentite} onFile={setFichier("photosIdentite")} />
            <UploadZone label="Reçu de paiement du timbre" hint="Quittance des frais de renouvellement" done={fichiers.recuPaiement} onFile={setFichier("recuPaiement")} />
          </div>
          {/* Section des cas particuliers pour le passeport */}
          <div className="space-y-4">
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 accent-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Cas particulier : Perte ou vol de l'ancien passeport</span>
              </label>
              {/* Ce bloc s'afficherait si la case est cochée */}
              <div className="mt-3 pl-7"><UploadZone label="Déclaration de perte/vol" hint="Délivrée par la police/gendarmerie" done={fichiers.declarationPerte} onFile={setFichier("declarationPerte")} /></div>
            </div>
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="h-4 w-4 accent-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Cas particulier : Demande pour un mineur</span>
              </label>
              <div className="mt-3 pl-7"><UploadZone label="Autorisation parentale + CNI du parent" hint="Documents du tuteur légal" done={fichiers.autorisationParentale} onFile={setFichier("autorisationParentale")} /></div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Pièces pour les autres documents (mairie) */}
          <div className="space-y-4 mb-5">
            <UploadZone label="Pièce d'identité (CNI, Passeport, Attestation)"
              hint="Photo recto/verso — JPG, PNG ou PDF" done={fichiers.cni} onFile={setFichier("cni")} />
            <UploadZone label="Justificatif de domicile"
              hint="Facture CIE, SODECI, Orange, bail signé..." done={fichiers.domicile} onFile={setFichier("domicile")} />
          </div>
          {/* Cas particulier pour les documents de mairie */}
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-amber-800">Facture pas à votre nom ?</div>
                <div className="text-xs text-amber-700 mt-1">Si vous êtes hébergé(e) chez quelqu'un (famille, ami, propriétaire), cochez cette case pour ajouter une déclaration d'hébergement.</div>
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input type="checkbox" checked={heberge} onChange={e => setHeberge(e.target.checked)} className="h-4 w-4 accent-amber-600" />
                  <span className="text-xs font-semibold text-amber-800">Je suis hébergé(e)</span>
                </label>
              </div>
            </div>
          </div>
          {heberge && (
            <div className="space-y-4 mb-5 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Informations de l'hébergeant</div>
              <input placeholder="Nom complet de l'hébergeant" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white" />
              <input placeholder="N° CNI de l'hébergeant" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white" />
              <UploadZone label="CNI de l'hébergeant" hint="Photo recto/verso" done={fichiers.hebergement} onFile={setFichier("hebergement")} />
              <div className="border-2 border-dashed border-amber-300 rounded-xl p-4 text-center bg-white">
                <div className="text-2xl mb-1">✍️</div>
                <div className="text-xs text-amber-700 font-medium">Attestation d'hébergement</div>
                <div className="text-xs text-gray-400 mt-1">L'hébergeant devra signer au guichet ou envoyer une photo de sa signature</div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={() => setEtape(1)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
        <button onClick={() => {
          if (docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C') {
            addDossierToQueue({ id: reference, nom: `${form.nom} ${form.prenom}`, doc: docChoisi.id });
            setEtape(etapeQrCodeIndex);
          } else {
            setEtape(etapePaiementIndex);
          }
        }} disabled={!fichiers.cni || !fichiers.domicile}
          className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
          Continuer →
        </button>
      </div>
    </div>
  );
}

// --- ÉTAPE 3 : PAIEMENT ---
function Etape3_Paiement({ setEtape, docChoisi, form, mairie, nombreCopies, paiement, setPaiement, reference, etapePaiementIndex }: StepProps) {
  // LOGIQUE MISE À JOUR : On ne paie que le document ici. Le timbre sera un "upsell".
  const totalAPayer = docChoisi ? (docChoisi.prix * nombreCopies) : 0;

  return (
    <div data-statut="PAIEMENT_EN_ATTENTE">
      <h2 className="text-lg font-bold text-[#0A2540] mb-1">Paiement des droits</h2>
      <p className="text-xs text-gray-400 mb-5">Le paiement sécurise votre dossier et génère votre QR code de passage au guichet.</p>

      <div className="bg-muted/40 rounded-xl p-4 mb-5">
        <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Récapitulatif de votre demande</div>
        <div className="space-y-1.5">
          {[
            ["Document", docChoisi?.label],
            ["Mairie", mairie],
            ["Demandeur", `${form.nom} ${form.prenom}`],
            ["Exemplaires", `${nombreCopies} (avec QR codes uniques)`],
            ["Téléphone", form.telephone || "—"],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between text-sm">
              <span className="text-gray-400">{k}</span>
              <span className="font-medium text-[#0A2540] text-right max-w-[200px]">{v}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
          <div className="text-sm">
            <div className="text-gray-500 font-semibold">Total à payer</div>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-primary">
              {totalAPayer} FCFA
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mode de paiement</div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { id: "wave", label: "Wave", emoji: "🌊" },
          { id: "orange", label: "Orange Money", emoji: "🟠" },
          { id: "mtn", label: "MTN MoMo", emoji: "💛" },
          { id: "carte", label: "Carte bancaire", emoji: "💳" },
        ].map(opt => (
          <button key={opt.id} onClick={() => setPaiement(opt.id)}
            className={`border-2 rounded-xl p-3 text-center transition-all
              ${paiement === opt.id ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
            <div className="text-2xl mb-1">{opt.emoji}</div>
            <div className="text-xs font-bold text-[#0A2540]">{opt.label}</div>
            {paiement === opt.id && <CheckCircle size={14} className="text-green-500 mx-auto mt-1" />}
          </button>
        ))}
      </div>

      {paiement !== "carte" && (
        <div className="mb-5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Numéro {paiement === "wave" ? "Wave" : paiement === "orange" ? "Orange Money" : "MTN MoMo"}</label>
          <input defaultValue={form.telephone} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" placeholder="07 XX XX XX XX" />
          <p className="text-xs text-gray-400 mt-1.5">Vous recevrez une demande de paiement sur ce numéro</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setEtape(2)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
        <button onClick={() => {
          if (docChoisi) {
            addDossierToQueue({ id: reference, nom: `${form.nom} ${form.prenom}`, doc: docChoisi.id });
          }
          setEtape(etapePaiementIndex + 1);
        }}
          className="flex-1 py-3 bg-[#F77F00] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm"
        >
          Payer {totalAPayer} FCFA via {paiement === "wave" ? "Wave" : paiement === "orange" ? "Orange Money" : paiement === "mtn" ? "MTN" : "Carte bancaire"} →
        </button>
      </div>
    </div>
  );
}

// --- ÉTAPE 4 : RÉCUPÉRATION / QR CODE ---
function Etape4_Recuperation({ setEtape, docChoisi, form, mairie, nombreCopies, reference, navigate, setDocChoisi }: StepSpecificProps<{ navigate: ReturnType<typeof useNavigate> }>) {
  const isCircuitLong = docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C';

  if (isCircuitLong) {
    return (
      <div className="text-center" data-statut="EN_ATTENTE_GUICHET">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Pré-demande enregistrée !</h2>
        <p className="text-sm text-gray-400 mb-6">
          {docChoisi && docChoisi.prix * nombreCopies > 0
            ? `Paiement de ${docChoisi.prix * nombreCopies} FCFA à effectuer au guichet.`
            : "Ce document est gratuit."
          }
          {" · Présentez ce QR code en mairie."}
        </p>

        <div className="flex justify-center mb-4">
          <QRCodeDisplay reference={reference} />
        </div>
        <div className="font-mono text-sm text-gray-500 mb-1">{reference}</div>
        <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          ⏳ En attente validation au guichet
        </div>

        <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-left mb-5">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-800">Important : N'oubliez pas vos originaux !</div>
              <div className="text-xs text-amber-700 mt-1">Pour finaliser votre demande, l'agent au guichet devra comparer les documents originaux (CNI, justificatif de domicile, etc.) avec les copies que vous avez envoyées.</div>
            </div>
          </div>
        </div>

        <div className="bg-muted/40 rounded-xl p-4 text-left mb-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Votre dossier</div>
          <div className="space-y-1.5">
            {[
              ["Document", docChoisi?.label],
              ["Mairie", mairie],
              ["Demandeur", `${form.nom} ${form.prenom}`],
              ["Paiement", `À régler au guichet (${docChoisi ? docChoisi.prix * nombreCopies : 0} FCFA)`],
              ["Délai estimé", docChoisi?.delai + " au guichet"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex justify-between text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="font-medium text-[#0A2540]">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => {
              alert("Dossier annulé.");
              setEtape(0);
              setDocChoisi(null);
            }}
            className="w-full py-2 border-2 border-red-100 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
            🗑️ Annuler ma demande
          </button>
          <button className="w-full py-3 bg-[#0A2540] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
            <QrCode size={16} /> Télécharger le QR Code
          </button>
        </div>

        <div className="mt-6 border-t border-dashed pt-6 text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Après validation par l'agent...
          </div>
          <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-4 text-left">
            <div className="font-semibold text-success mb-3">🎉 Notification : Votre document est prêt !</div>
            
            {/* Choix de récupération pour l'utilisateur */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  alert("Simulation du paiement de 500 FCFA pour le timbre numérique.\nLe document final certifié serait maintenant téléchargé.");
                  if (docChoisi) generateAndDownloadPdf(docChoisi, form, reference, nombreCopies);
                }}
                className="w-full text-left border-2 border-primary bg-primary/5 rounded-xl p-4 transition-all flex items-start gap-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-primary">Légaliser et Télécharger le PDF (+ 500 FCFA)</div>
                  <div className="text-xs text-primary/80 mt-0.5">Obtenez la version numérique officielle, infalsifiable.</div>
                </div>
              </button>
              <button onClick={() => {
                alert("Votre demande de retrait en mairie a été enregistrée.");
                navigate({ to: "/" });
              }}
                className="w-full text-left border-2 border-gray-100 hover:border-gray-200 rounded-xl p-4 transition-all flex items-start gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                  <Building size={20} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">Retirer le document papier à la mairie</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Le document sera déjà légalisé par l'officier.</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Circuit Court (Groupe B) ---
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Demande validée !</h2>
      <p className="text-sm text-gray-400 mb-6">Paiement confirmé. Comment souhaitez-vous recevoir votre document ?</p>

      <div className="space-y-4">
        {/* Option 1: Télécharger le document NON légalisé */}
        <button
          onClick={() => {
            if (docChoisi) generateAndDownloadPdf(docChoisi, form, reference, nombreCopies);
          }}
          className="w-full text-left border-2 border-gray-200 bg-muted/30 rounded-xl p-4 transition-all flex items-start gap-4 hover:bg-muted/60"
        >
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground flex-shrink-0">
            <Download size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Télécharger le document (non-légalisé)</div>
            <div className="text-xs text-muted-foreground mt-0.5">Pour consultation personnelle ou archivage. Un filigrane "Spécimen" sera appliqué.</div>
          </div>
        </button>

        {/* Option 2: Légaliser et télécharger */}
        <button
          onClick={() => {
            alert("Simulation du paiement de 500 FCFA pour le timbre numérique.\nLe document final certifié serait maintenant téléchargé.");
            // Ici, on lancerait le paiement du timbre, puis le téléchargement du PDF final.
            if (docChoisi) generateAndDownloadPdf(docChoisi, form, reference, nombreCopies);
          }}
          className="w-full text-left border-2 border-primary bg-primary/5 rounded-xl p-4 transition-all flex items-start gap-4"
        >
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <ShieldCheck className="h-5 w-5" /> {/* Icône de sécurité */}
          </div>
          <div>
            <div className="font-semibold text-sm text-primary">Légaliser ce document (+ 500 FCFA)</div>
            <div className="text-xs text-primary/80 mt-0.5">Payez le timbre numérique pour obtenir le PDF officiel avec sceau et QR code de vérification.</div>
          </div>
        </button>

        <button onClick={() => {
          alert("Votre demande de retrait en mairie a été enregistrée.");
          navigate({ to: "/" });
        }}
          className="w-full text-left border-2 border-gray-100 hover:border-gray-200 rounded-xl p-4 transition-all flex items-start gap-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground flex-shrink-0">
            <Building size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">Voie Classique</div>
            <div className="text-xs text-muted-foreground mt-0.5">Retirez le document papier déjà certifié à la mairie.</div>
          </div>
        </button>
      </div>

      <div className="mt-6">
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
}
