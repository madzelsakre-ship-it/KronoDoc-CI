import { createFileRoute, Link } from "@tanstack/react-router";
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
import { addDossierToQueue } from "@/lib/mock-data";

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
  component: Citoyen,
});


// --- Types pour la structure des documents ---
interface DocType {
  id: string;
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
  { code: "B", titre: "Groupe B : Rééditions & Copies Certifiées", description: "Copies d'actes déjà existants dans les registres (extraits, légalisations...)." },
  { code: "C", titre: "Groupe C : Actes sensibles à Retrait Obligatoire", description: "Documents nécessitant une validation et un retrait physique exclusif en mairie." },
];

// --- NOUVELLE STRUCTURE : Référentiel des documents par groupe ---
// En production, ces données seraient chargées depuis une API (table `document_templates` versionnée par mairie)
const DOCUMENTS = [
  // --- Groupe A : Instruction & Validation (Circuit Long) ---
  { id: "residence", label: "Certificat de résidence", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "domicile", label: "Attestation de domicile", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "hebergement", label: "Attestation d'hébergement", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "celibat", label: "Certificat de célibat", groupe: "A", prix: 1000, delai: "< 5 min" },
  { id: "non-remariage", label: "Certificat de non-remariage", groupe: "A", prix: 1000, delai: "< 5 min" },
  { id: "vie", label: "Certificat de vie", groupe: "A", prix: 500, delai: "< 3 min" },
  { id: "indigence", label: "Certificat d'indigence", groupe: "A", prix: 0, delai: "< 5 min" },

  // --- Groupe B : Rééditions & Instantanés (Circuit Court) ---
  { id: "naissance", label: "Extrait d'acte de naissance", groupe: "B", prix: 1000, delai: "< 5 min" },
  { id: "mariage", label: "Extrait d'acte de mariage", groupe: "B", prix: 2000, delai: "< 5 min" },
  { id: "deces", label: "Extrait d'acte de décès", groupe: "B", prix: 1000, delai: "< 5 min" },
  { id: "legalisation", label: "Légalisation de signature", groupe: "B", prix: 500, delai: "< 3 min" },
  { id: "copie", label: "Certification de copie conforme", groupe: "B", prix: 500, delai: "< 3 min" },

  // --- Groupe C : Actes sensibles (Circuit Long, Retrait Obligatoire) ---
  { id: "declaration-deces", label: "Déclaration de décès", groupe: "C", prix: 0, delai: "Variable" },
  { id: "permis-inhumer", label: "Permis d'inhumer", groupe: "C", prix: 5000, delai: "Variable" },
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
function UploadZone({ label, hint, done, onFile }: any) {
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
interface FormData {
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone: string;
  email: string;
  [key: string]: string; // Pour les champs dynamiques
}

interface FichiersData {
  cni: string | null;
  domicile: string | null;
  hebergement: string | null;
}


// --- Composant de formulaire dynamique ---
function DynamicForm({ groupe, form, setForm }: { groupe: string, form: FormData, setForm: (form: FormData) => void }) {
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5";

  const champsSpecifiques = FICHES_PRELEVEMENT[groupe] || [];

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

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

// ─── PAGE PRINCIPALE ───
function Citoyen() {
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
  const ETAPES = (docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C')
    ? ["Document", "Informations", "Pièces", "QR Code"]
    : ["Document", "Informations", "Pièces", "Paiement", "Récupération"];

  // Ajuste l'index de l'étape si le paiement est sauté
  const etapePaiementIndex = ETAPES.indexOf("Paiement");
  const etapeQrCodeIndex = ETAPES.indexOf("QR Code");

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
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Header */}
      <header className="bg-[#0A2540] text-white px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#009A44] rounded-lg flex items-center justify-center font-black text-sm">K</div>
          <span className="font-bold text-sm">KronoDoc CI</span>
        </Link>
        <ChevronRight size={14} className="text-white/30" />
        <span className="text-sm text-white/70">Portail Citoyen</span>
        <div className="ml-auto flex items-center gap-2">
          <Phone size={14} className="text-white/50" />
          <span className="text-xs text-white/50">Aide : 20 22 XX XX</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Titre */}
        {etape === 0 && (
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-[#0A2540] mb-2">Faire une demande de document</h1>
            <p className="text-gray-500 text-sm">Remplissez votre dossier depuis chez vous. Venez juste signer au guichet.</p>
          </div>
        )}

        <Progress etape={etape} etapes={ETAPES} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

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
                  placeholder="Ex: résidence, naissance..."
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
                      {docsDuGroupe.map(doc => (
                        <button key={doc.id} onClick={() => setDocChoisi(doc)} disabled={doc.disabled}
                          className={`w-full text-left border-2 rounded-xl p-4 transition-all flex items-center justify-between mb-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
                            ${docChoisi?.id === doc.id ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                          <div>
                            <div className="font-semibold text-sm text-[#0A2540]">{doc.label}</div>
                            <div className="text-xs text-gray-400 mt-0.5">{doc.disabled ? "Bientôt disponible" : `Délai au guichet : ${doc.delai}`}</div>
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
                      <input type="checkbox" checked={heberge} onChange={e => setHeberge(e.target.checked)} className="w-4 h-4 accent-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">Je suis hébergé(e)</span>
                    </label>
                  </div>
                </div>
              </div>

              {heberge && (
                <div className="space-y-4 mb-5 p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Informations de l'hébergeant</div> {/* Ces champs devraient être connectés à l'état */}
                  <input placeholder="Nom complet de l'hébergeant" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
                  <input placeholder="N° CNI de l'hébergeant" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white" />
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
                    addDossierToQueue({ id: reference, nom: `${form.nom} ${form.prenom}`, doc: docChoisi.label });
                    setEtape(etapeQrCodeIndex); // Va directement à l'étape QR Code
                  } else {
                    setEtape(etapePaiementIndex); // Va à l'étape de paiement pour le circuit court
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
            <div>
              <h2 className="text-lg font-bold text-[#0A2540] mb-1">Paiement des droits</h2>
              <p className="text-xs text-gray-400 mb-5">Le paiement sécurise votre dossier et génère votre QR code de passage au guichet.</p>

              {/* Récapitulatif */}
              <div className="bg-[#F0F2F5] rounded-xl p-4 mb-5">
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
                    addDossierToQueue({ id: reference, nom: `${form.nom} ${form.prenom}`, doc: docChoisi.label });
                  }
                  setEtape(etapePaiementIndex + 1);
                }}
                  className="flex-1 py-3 bg-[#F77F00] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                >
                  Payer {docChoisi ? (docChoisi.prix * nombreCopies) + 500 : 0} FCFA via {paiement === "wave" ? "Wave" : paiement === "orange" ? "Orange Money" : "MTN"} →
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : QR Code ── */}
          {etape >= etapeQrCodeIndex && (
            // --- Logique de branchement : Circuit Long (A) vs Circuit Court (B) ---
            (docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C' ? (
              <div className="text-center" data-statut="EN_ATTENTE_GUICHET"> {/* Statut pour le backend */}
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Pré-demande enregistrée !</h2>
              <p className="text-sm text-gray-400 mb-6">
                {docChoisi?.groupe === 'B' ? 'Paiement confirmé' : 'Paiement à effectuer au guichet'}
                · Présentez ce QR code en mairie.
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
              <div className="bg-[#F0F2F5] rounded-xl p-4 text-left mb-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Votre dossier</div>
                <div className="space-y-1.5">
                  {[
                    ["Document", docChoisi?.label],
                    ["Mairie", mairie],
                    ["Demandeur", `${form.nom} ${form.prenom}`],
                    ["Paiement", docChoisi?.groupe === 'B'
                      ? `${paiement === "wave" ? "Wave" : "Mobile Money"} · ${(docChoisi.prix * nombreCopies) + 500} FCFA ✅`
                      : `À régler au guichet (${docChoisi?.prix * nombreCopies} FCFA)`
                    ],
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
              <div className="space-y-3">
                <button
                  onClick={() => {
                    alert("Dossier annulé.\nEn production, le statut du dossier passerait à 'ANNULE_PAR_UTILISATEUR' (Soft Delete).");
                    setEtape(0);
                    setDocChoisi(null); // Réinitialise la sélection du document
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
                  <button className="w-full text-left border-2 border-primary bg-primary/5 rounded-xl p-4 transition-all flex items-start gap-4">
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
                    // En production, on mettrait à jour le statut du dossier en "ATTENTE_RETRAIT_GUICHET"
                    // et on redirigerait vers l'espace citoyen.
                    setEtape(0);
                    setDocChoisi(null);
                  }}
                    className="w-full text-left border-2 border-gray-100 hover:border-gray-200 rounded-xl p-4 transition-all flex items-start gap-4">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted text-muted-foreground flex-shrink-0">
                      <Building size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">Voie Classique</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Retirez le document papier déjà légalisé à la mairie (paiement au guichet).</div>
                    </div>
                  </button>
                </div>

                <div className="mt-6">
                  <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">
                    Retourner à l'accueil
                  </Link>
                </div>
              </div>
            ))

              <p className="text-xs text-gray-400 mt-5">
                Vous serez notifié par SMS au <strong>{form.telephone || "07 XX XX XX XX"}</strong> quand votre document sera prêt.
              </p>
            </div>
          )}
        </div>

        {/* Info bas de page */}
        {etape < 4 && (
          <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3"> {/* Cette section pourrait être un composant réutilisable */}
            <AlertCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">
              <strong>Vous n'avez pas de smartphone ?</strong> Rendez-vous dans un cybercafé partenaire ou directement au guichet d'accueil de votre mairie. Un agent vous assistera gratuitement.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
