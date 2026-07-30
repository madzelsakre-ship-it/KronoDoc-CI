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
];

// --- NOUVELLE STRUCTURE : Référentiel des documents par groupe ---
// En production, ces données seraient chargées depuis une API (table `document_templates` versionnée par mairie)
const DOCUMENTS: DocType[] = [
  // --- Groupe A : Instruction & Validation (Circuit Long - Paiement au guichet) ---
  { id: "certificat_residence", label: "Certificat de résidence", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "attestation_hebergement", label: "Attestation d'hébergement", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "celibat", label: "Certificat de célibat", groupe: "A", prix: 1000, delai: "< 5 min" },
  // Note: "non-remariage" and "indigence" are not in DocumentType yet.
  // For this example, we'll assume they are added or we'll use existing ones.
  { id: "certificat_vie", label: "Certificat de vie", groupe: "A", prix: 500, delai: "< 3 min" },

  // --- Groupe B : Rééditions & Instantanés (Circuit Court) ---
  { id: "extrait_naissance", label: "Extrait d'acte de naissance", groupe: "B", prix: 1000, delai: "< 5 min" },
  // Note: "mariage" and "deces" extracts are not in DocumentType yet.
  { id: "legalisation", label: "Légalisation de signature", groupe: "B", prix: 500, delai: "< 3 min" }, // Pas de disabled
  // Note: "copie" is not in DocumentType yet.

  // --- Groupe C : Actes sensibles (Circuit Long, Retrait Obligatoire) ---
  // Note: "declaration-deces" and "permis-inhumer" are not in DocumentType yet.
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
  const [fichiers, setFichiers] = useState<FichiersData>({ cni: null, domicile: null, hebergement: null });
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
          {etape === 0 && (
            <div className="text-center">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Faire une demande</h1>
              <p className="mt-2 text-muted-foreground">Remplissez votre dossier depuis chez vous. Venez juste signer au guichet.</p>
            </div>
          )}

          <Progress etape={etape} etapes={ETAPES_PROGRESS} />

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">

            {/* ── ÉTAPE 0 : Choix du document ── */}
            {etape === 0 && (
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
                    if (docsDuGroupe.length === 0) return null; // N'affiche pas le groupe s'il n'y a pas de documents filtrés
                    return (
                      <div key={groupe.code}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{groupe.titre}</h3>
                        <p className="text-xs text-gray-500 mb-3">{groupe.description}</p>
                        {docsDuGroupe.map(doc => ( // Suppression de `disabled`
                          <button key={doc.id} onClick={() => setDocChoisi(doc)}
                            className={`w-full text-left border-2 rounded-xl p-4 transition-all flex items-center justify-between mb-2
                              ${docChoisi?.id === doc.id ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                            <div>
                              <div className="font-semibold text-sm text-[#0A2540]">{doc.label}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{`Délai au guichet : ${doc.delai}`}</div>
                            </div>
                            <div className="text-right">
                              {docChoisi?.id === doc.id && <CheckCircle size={20} className="text-green-500 ml-auto" />}
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
            )}

            {/* ── ÉTAPE 1 : Informations personnelles ── */}
            {etape === 1 && (
              <div>
                <h2 className="text-lg font-bold text-[#0A2540] mb-1">Vos informations</h2>
                <p className="text-xs text-gray-400 mb-5">Saisissez exactement vos informations telles qu'elles figurent sur votre CNI.</p>
                
                {/* Le formulaire dynamique est rendu ici */}
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
            )}

            {/* ── ÉTAPE 2 : Pièces justificatives ── */}
            {etape === 2 && (
              <div>
                <h2 className="text-lg font-bold text-[#0A2540] mb-1">Pièces justificatives</h2>
                <p className="text-xs text-gray-400 mb-5">Photos nettes acceptées. L'agent vérifiera les originaux au guichet.</p>
                <div className="space-y-4 mb-5">
                  <UploadZone label="Pièce d'identité (CNI, Passeport, Attestation)"
                    hint="Photo recto/verso — JPG, PNG ou PDF" done={fichiers.cni} onFile={setFichier("cni")} />
                  <UploadZone label="Justificatif de domicile"
                    hint="Facture CIE, SODECI, Orange, bail signé..." done={fichiers.domicile} onFile={setFichier("domicile")} />
                </div>

                {/* Cas hébergé */}
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
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Informations de l'hébergeant</div> {/* Ces champs devraient être connectés à l'état */}
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

                <div className="flex gap-3">
                  <button onClick={() => setEtape(1)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                    <ArrowLeft size={14} /> Retour
                  </button>
                  <button onClick={() => {
                    // --- Logique de branchement : Paiement ou QR direct ---
                    // Pour les circuits longs (A et C), on saute le paiement en ligne.
                    if (docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C') {
                      addDossierToQueue({ id: reference, nom: `${form.nom} ${form.prenom}`, doc: docChoisi.id }); // docChoisi.id is now of type DocumentType
                      setEtape(etapeQrCodeIndex); // Va directement à l'étape QR Code
                    } else {
                      setEtape(etapePaiementIndex); // Va à l'étape de paiement pour le circuit court (Groupe B)
                    }
                  }} disabled={!fichiers.cni || !fichiers.domicile}
                    className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 3 : Paiement ── */}
            {etape === etapePaiementIndex && docChoisi?.groupe === 'B' && ( // Ne s'affiche que pour le Groupe B
              <div data-statut="PAIEMENT_EN_ATTENTE">
                <h2 className="text-lg font-bold text-[#0A2540] mb-1">Paiement des droits</h2>
                <p className="text-xs text-gray-400 mb-5">Le paiement sécurise votre dossier et génère votre QR code de passage au guichet.</p>

                {/* Récapitulatif */}
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
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-medium text-[#0A2540] text-right max-w-[200px]">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                    <div className="text-sm">
                      <div className="text-gray-500">Coût du document</div>
                      <div className="text-gray-400 text-xs mt-1">+ Timbre numérique (légalisation)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-[#0A2540]">{docChoisi ? docChoisi.prix * nombreCopies : 0} FCFA</div>
                      <div className="font-semibold text-[#0A2540] text-xs mt-1">+ 500 FCFA</div>
                      <div className="border-t border-gray-300 mt-1 pt-1 text-xl font-extrabold text-[#009A44]">
                        {docChoisi ? (docChoisi.prix * nombreCopies) + 500 : 0} FCFA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modes de paiement */}
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Mode de paiement</div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { id: "wave", label: "Wave", emoji: "🌊", color: "#1E3A5F" },
                    { id: "orange", label: "Orange Money", emoji: "🟠", color: "#FF6600" },
                    { id: "mtn", label: "MTN MoMo", emoji: "💛", color: "#FFCC00" },
                    { id: "carte", label: "Carte bancaire", emoji: "💳", color: "#185FA5" },
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

                {/* Numéro de téléphone pour mobile money */}
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
                    // --- Envoi des informations à la mairie (simulation) ---
                    if (docChoisi) {
                      addDossierToQueue({ id: reference, nom: `${form.nom} ${form.prenom}`, doc: docChoisi.id }); // docChoisi.id is now of type DocumentType
                    }
                    setEtape(etapePaiementIndex + 1);
                  }}
                    className="flex-1 py-3 bg-[#F77F00] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                  >
                    Payer {docChoisi ? (docChoisi.prix * nombreCopies) + 500 : 0} FCFA via {paiement === "wave" ? "Wave" : paiement === "orange" ? "Orange Money" : paiement === "mtn" ? "MTN" : "Carte bancaire"} →
                  </button>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 4 : QR Code / Récupération ── */}
            {etape >= etapeQrCodeIndex && (
              // --- Logique de branchement : Circuit Long (A/C) vs Circuit Court (B) ---
              (docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C' ? (
                <div className="text-center" data-statut="EN_ATTENTE_GUICHET"> {/* Statut pour le backend */}
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Pré-demande enregistrée !</h2>
                <p className="text-sm text-gray-400 mb-6">
                  {/* Message conditionnel qui gère les documents gratuits */}
                  {docChoisi && docChoisi.prix * nombreCopies > 0
                    ? `Paiement de ${
                        docChoisi.prix * nombreCopies
                      } FCFA à effectuer au guichet.`
                    : "Cette démarche est gratuite au guichet."}
                  {" · Présentez ce QR code en mairie."}
                </p>

                <div className="flex justify-center mb-4">
                  <QRCodeDisplay reference={reference} />
                </div> {/* En production, ce QR code serait généré par le backend */}
                <div className="font-mono text-sm text-gray-500 mb-1">{reference}</div>
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                  ⏳ En attente validation au guichet
                </div>

                {/* Message important sur la vérification physique */}
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-left mb-5">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-amber-800">Important : N'oubliez pas vos originaux !</div>
                      <div className="text-xs text-amber-700 mt-1">Pour finaliser votre demande, l'agent au guichet devra comparer les documents originaux (CNI, justificatif de domicile, etc.) avec les copies que vous avez envoyées.</div>
                    </div>
                  </div>
                </div>

                {/* Récapitulatif final */}
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
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-medium text-[#0A2540]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={() => {
                      alert("Dossier annulé.\nEn production, le statut du dossier passerait à 'ANNULE_PAR_UTILISATEUR' (Soft Delete).");
                      setEtape(0);
                      setDocChoisi(null);
                    }}
                    className="w-full py-2 border-2 border-red-100 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                    🗑️ Annuler ma demande
                  </button>
                  <button className="w-full py-3 bg-[#0A2540] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 mt-4!">
                    <QrCode size={16} /> Télécharger le QR Code {/* En production, ce bouton déclencherait un téléchargement réel */}
                  </button>
                  <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    📲 Envoyer par WhatsApp
                  </button>
                  <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    📧 Recevoir par email
                  </button>
                </div>

                {/* --- Simulation de la notification post-validation --- */}
                <div className="mt-6 border-t border-dashed pt-6 text-center">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Après validation par l'agent...
                  </div>
                  <div className="mt-3 rounded-lg border border-success/30 bg-success/5 p-4">
                    {docChoisi?.groupe === 'C' ? (
                      <>
                        <div className="font-semibold text-success">🎉 Notification : Document prêt pour retrait</div>
                        <div className="mt-1 text-xs text-success/80">Veuillez vous présenter au guichet de la mairie pour récupérer votre document officiel.</div>
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-success">🎉 Notification : Votre document est prêt !</div>
                        <div className="mt-1 text-xs text-success/80">Vous pouvez le télécharger en format PDF sécurisé ou le récupérer au guichet.</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              ) : (
                // --- NOUVELLE INTERFACE POUR LE CIRCUIT COURT (GROUPE B) ---
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Demande validée !</h2>
                  <p className="text-sm text-gray-400 mb-6">Paiement confirmé. Comment souhaitez-vous recevoir votre document ?</p>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (docChoisi) generateAndDownloadPdf(docChoisi, form, reference, nombreCopies);
                      }}
                      className="w-full text-left border-2 border-primary bg-primary/5 rounded-xl p-4 transition-all flex items-start gap-4"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
                        <Download size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-primary">Voie Numérique (Recommandé)</div>
                        <div className="text-xs text-primary/80 mt-0.5">Téléchargez immédiatement le PDF légalisé, prêt à l'emploi.</div>
                      </div>
                    </button>
                    <button onClick={() => {
                      alert("Votre demande de retrait en mairie a été enregistrée. Vous serez notifié quand le document sera prêt.");
                      // En production, on mettrait à jour le statut du dossier en "ATTENTE_RETRAIT_GUICHET" dans la BDD
                      // et on redirigerait vers l'espace citoyen.
                      navigate({ to: "/" });
                    }}
                      className="w-full text-left border-2 border-gray-100 hover:border-gray-200 rounded-xl p-4 transition-all flex items-start gap-4">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                        <Building size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">Voie Classique</div>
                        <div className="text-xs text-muted-foreground mt-0.5">Retirez le document papier déjà légalisé à la mairie (paiement du timbre au guichet).</div>
                      </div>
                    </button>
                  </div>

                  <div className="mt-6">
                    <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
                      Retourner à l'accueil
                    </Link>
                  </div>
                </div>
              )
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
