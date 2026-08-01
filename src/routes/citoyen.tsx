import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
} from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site-header"; // Assumed to exist
import { SiteFooter } from "@/components/site-footer"; // Assumed to exist
import { addDossierToQueue, type DocumentType, type Dossier } from "@/lib/mock-data";
import { CATEGORIES, SOUS_CATEGORIES, DOCUMENTS, type DocType, type DeliveryOption, type DeliveryFormat, type FormFieldConfig, type JustificatifConfig } from "@/lib/document-config";
import { useSession } from "@/hooks/use-session";

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

const MAIRIES = [
  "Mairie de Cocody", "Mairie de Yopougon", "Mairie de Abobo",
  "Mairie de Adjamé", "Mairie de Plateau", "Mairie de Treichville",
  "Mairie de Marcory", "Mairie de Koumassi", "Mairie de Port-Bouët",
];

// ─── Composant Progress ───
function Progress({ etape, etapes, currentDoc }: { etape: number; etapes: string[]; currentDoc: DocType | null }) {

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {etapes.map((label, i) => {
        const isCurrent = i === etape;
        const isCompleted = i < etape;

        return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
              ${isCompleted ? "bg-green-600 text-white" : isCurrent ? "bg-[#0A2540] text-white ring-4 ring-blue-100" : "bg-gray-100 text-gray-400"}`}>
              {isCompleted ? "✓" : i + 1}
            </div>
            <span className={`text-[10px] mt-1 font-medium text-center max-w-[80px] ${isCurrent ? "text-[#0A2540]" : "text-gray-400"}`}>
              {label}
            </span>
          </div>
          {i < etapes.length - 1 && (
            <div className={`w-10 h-0.5 mb-4 mx-1 transition-all duration-200 ${isCompleted ? "bg-green-500" : "bg-gray-200"}`} />
          )}
        </div>
        );
      })}
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


// --- Interfaces pour un typage plus strict des états ---
interface FormData { // Typage des données du formulaire
  nom: string;
  prenom: string;
  dateNaissance: string;
  telephone: string;
  email?: string;
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
  certificatMedical: string | null;
  livretFamille: string | null;
  jugementDivorce: string | null;
  acteOrigine: string | null;
}


// --- Composant de formulaire dynamique ---
function DynamicForm({ fields, form, setForm }: { fields: FormFieldConfig[], form: FormData, setForm: (form: FormData) => void }) {
  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5";

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-4">
      {fields.map(field => (
        <div key={field.id}>
          <label className={labelCls}>{field.label}{field.required && <span className="text-red-500">*</span>}</label>
          {field.type === "select" ? (
            <select className={inputCls} value={form[field.id] || ""} onChange={set(field.id)} required={field.required}>
              <option value="">Sélectionner...</option>
              {field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          ) : field.type === "textarea" ? (
            <textarea placeholder={field.placeholder} className={`${inputCls} h-24`} value={form[field.id] || ""} onChange={set(field.id)} required={field.required} />
          ) : (
            <input
              type={field.type || "text"}
              placeholder={field.placeholder}
              className={inputCls}
              value={form[field.id] || ""}
              onChange={set(field.id)}
              required={field.required}
            />
          )}
        </div>
      ))}
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
  selectedDeliveryOption: DeliveryOption | null;
  setSelectedDeliveryOption: (option: DeliveryOption | null) => void;
  etapeInformationsIndex: number;
  etapeChoixDelivranceIndex: number;
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
  const [form, setForm] = useState<FormData>({ nom: "", prenom: "", dateNaissance: "", telephone: "" });
  const [fichiers, setFichiers] = useState<FichiersData>({
    cni: null,
    domicile: null,
    hebergement: null,
    passeportAncien: null,
    photosIdentite: null,
    recuPaiement: null,
    declarationPerte: null,
    autorisationParentale: null,
    certificatMedical: null,
    livretFamille: null,
    jugementDivorce: null,
    acteOrigine: null,
  });
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<DeliveryOption | null>(null);
  const [reference] = useState(`KDC-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`);
  const { user } = useSession(); // To pre-fill form data

  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (user) {
      setForm(prevForm => ({
        ...prevForm,
        nom: user.user_metadata?.last_name || "",
        prenom: user.user_metadata?.first_name || "",
        email: user.email || "",
        telephone: user.user_metadata?.phone || "",
      }));
    }
  }, [user]);

  // La barre de progression s'adapte au parcours utilisateur
  const ETAPES_PROGRESS = (docChoisi?.groupe === 'A' || docChoisi?.groupe === 'C')
    ? ["Document", "Informations", "Pièces", "QR Code"]
    : ["Document", "Informations", "Pièces", "Paiement", "Récupération"];

  const DYNAMIC_ETAPES = useMemo(() => {
    if (!docChoisi) return ["Document", "Confirmation"];

    const base = ["Document"];
    if (docChoisi.workflow) {
      docChoisi.workflow.forEach(step => {
        base.push(step.label);
      });
    } else {
      if (docChoisi.formFields && docChoisi.formFields.length > 0) {
        base.push("Informations");
      }
      if (docChoisi.justificatifs && docChoisi.justificatifs.length > 0) {
        base.push("Pièces");
      }
      if (docChoisi.deliveryOptions && docChoisi.deliveryOptions.length > 0) {
        base.push("Délivrance");
      }
      if ((docChoisi.prix ?? 0) > 0 || (docChoisi.deliveryOptions?.some(o => o.prix > 0))) {
        base.push("Paiement");
      }
    }
    base.push("Confirmation");
    return base;
  }, [docChoisi]);

  const getEtapeIndex = (label: string) => DYNAMIC_ETAPES.indexOf(label);

  const etapeInformationsIndex = getEtapeIndex("Informations");
  const etapePiecesIndex = getEtapeIndex("Pièces");
  const etapeChoixDelivranceIndex = getEtapeIndex("Délivrance");
  const etapePaiementIndex = getEtapeIndex("Paiement"); // Assuming payment is part of a workflow or a final step
  const etapeConfirmationIndex = getEtapeIndex("Confirmation");
  
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

          <Progress etape={etape} etapes={DYNAMIC_ETAPES} currentDoc={docChoisi} />

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">

            {/* ── ÉTAPE 0 : Choix du document ── */}
            {etape === 0 && (
              <Etape0_ChoixDocument {...{ setEtape, docChoisi, setDocChoisi, mairie, setMairie, recherche, setRecherche, nombreCopies, setNombreCopies, etapeChoixDelivranceIndex, etapeInformationsIndex } as any} />
            )}

            {/* ── ÉTAPE : Choix du mode de délivrance (si applicable) ── */}
            {etape === etapeChoixDelivranceIndex && docChoisi?.deliveryOptions && (
              <Etape_ChoixDelivrance {...{ setEtape, docChoisi, selectedDeliveryOption, setSelectedDeliveryOption, etapeChoixDelivranceIndex, etapePaiementIndex, etapeInformationsIndex, etapePiecesIndex } as any} />
            )}

            {/* ── ÉTAPE 1 : Informations personnelles ── */}
            {etape === etapeInformationsIndex && (
              <Etape1_InformationsPersonnelles {...{ setEtape, docChoisi, form, setForm, etapeChoixDelivranceIndex, etapePiecesIndex, etapeConfirmationIndex } as any} />
            )}

            {/* ── ÉTAPE 2 : Pièces justificatives ── */}
            {etape === etapePiecesIndex && (
              <Etape2_PiecesJustificatives {...{ setEtape, docChoisi, form, reference, fichiers, setFichiers, heberge, setHeberge, etapeInformationsIndex, etapePaiementIndex, etapeConfirmationIndex, etapeChoixDelivranceIndex } as any} />
            )}

            {/* ── ÉTAPE 3 : Paiement ── */}
            {etape === etapePaiementIndex && (
              <Etape3_Paiement {...{ setEtape, docChoisi, form, mairie, nombreCopies, paiement, setPaiement, reference, etapePaiementIndex, selectedDeliveryOption, etapePiecesIndex, etapeConfirmationIndex } as any} />
            )}

            {/* ── ÉTAPE 3 : Paiement ── */}
            {etape === etapeConfirmationIndex && (
              <Etape4_Recuperation {...{ setEtape, docChoisi, form, mairie, nombreCopies, reference, navigate, setDocChoisi, selectedDeliveryOption } as any} />
            )}
          </div>
        </div>

        {/* Info bas de page */}
        {etape < DYNAMIC_ETAPES.length - 1 && (
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
function Etape0_ChoixDocument({ setEtape, docChoisi, setDocChoisi, mairie, setMairie, recherche, setRecherche, nombreCopies, setNombreCopies, etapeChoixDelivranceIndex, etapeInformationsIndex }: StepSpecificProps<{ etapeInformationsIndex: number }>) {
  
  const documentsFiltres = DOCUMENTS.filter(doc =>
    doc.label.toLowerCase().includes(recherche.toLowerCase())
  );
  
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
      <div className="space-y-6">
        {CATEGORIES.map(categorie => {
          const sousCategoriesDeLaCat = SOUS_CATEGORIES.filter(sc => sc.categorieId === categorie.id);
          const documentsDeLaCat = DOCUMENTS.filter(doc => doc.categorie === categorie.id && doc.label.toLowerCase().includes(recherche.toLowerCase()));

          if (documentsDeLaCat.length === 0 && sousCategoriesDeLaCat.length === 0) return null; // Hide empty categories

          return (
            <div key={categorie.id}>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">{categorie.icon} {categorie.titre}</h3>
              {sousCategoriesDeLaCat?.map(sousCat => {
                const docsDeLaSousCat = documentsDeLaCat.filter(doc => doc.sousCategorie === sousCat.id);
                if (docsDeLaSousCat.length === 0) return null;
                return (
                  <div key={sousCat.id} className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{sousCat.titre}</h4>
                    {docsDeLaSousCat.map(doc => (
                      <button key={doc.id} onClick={() => setDocChoisi(doc)}
                        className={`w-full text-left border-2 rounded-xl p-4 transition-all flex items-center justify-between mb-2
                          ${docChoisi?.id === doc.id ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                        <div>
                          <div className="font-semibold text-sm text-[#0A2540]">{doc.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{`Délai estimé : ${doc.delai || 'Variable'}`}</div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className={`font-bold text-sm ${doc.prix && doc.prix > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                            {doc.prix && doc.prix > 0 ? `${doc.prix} FCFA` : 'Gratuit'}
                          </div>
                          {docChoisi?.id === doc.id && <CheckCircle size={16} className="text-green-500 mt-1" />}
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })}
              {/* Direct documents not in sub-categories, if any */}
              {documentsDeLaCat.filter(doc => !sousCategoriesDeLaCat.some(sc => sc.id === doc.sousCategorie)).map(doc => (
                <button key={doc.id} onClick={() => setDocChoisi(doc)}
                  className={`w-full text-left border-2 rounded-xl p-4 transition-all flex items-center justify-between mb-2
                    ${docChoisi?.id === doc.id ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div>
                    <div className="font-semibold text-sm text-[#0A2540]">{doc.label}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{`Délai estimé : ${doc.delai || 'Variable'}`}</div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className={`font-bold text-sm ${doc.prix && doc.prix > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {doc.prix && doc.prix > 0 ? `${doc.prix} FCFA` : 'Gratuit'}
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
      <button onClick={() => setEtape(docChoisi?.deliveryOptions && docChoisi.deliveryOptions.length > 0 ? etapeChoixDelivranceIndex : etapeInformationsIndex)} disabled={!docChoisi || !mairie}
        className="mt-6 w-full py-3.5 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
        Continuer →
      </button>
    </div>
  );
}

// --- NOUVELLE ÉTAPE : CHOIX DU MODE DE DÉLIVRANCE ---
function Etape_ChoixDelivrance({ setEtape, docChoisi, selectedDeliveryOption, setSelectedDeliveryOption, etapeInformationsIndex, etapePiecesIndex }: StepSpecificProps<{ etapeInformationsIndex: number, etapePiecesIndex: number }>) {
  const nextStep = (docChoisi?.formFields && docChoisi.formFields.length > 0)
    ? etapeInformationsIndex
    : (docChoisi?.justificatifs && docChoisi.justificatifs.length > 0 ? etapePiecesIndex : etapeInformationsIndex + 1); // Fallback to next logical step

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0A2540] mb-1">Choisissez le format de délivrance</h2>
      <p className="text-xs text-gray-400 mb-5">Sélectionnez comment vous souhaitez recevoir votre document.</p>

      <div className="space-y-4">
        {docChoisi?.deliveryOptions?.map(option => (
          <button
            key={option.format}
            onClick={() => setSelectedDeliveryOption(option)}
            className={`w-full text-left border-2 rounded-xl p-4 transition-all flex items-center justify-between
              ${selectedDeliveryOption?.format === option.format ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}
          >
            <div>
              <div className="font-semibold text-sm text-[#0A2540]">{option.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{option.description}</div>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className={`font-bold text-sm ${option.prix > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                {option.prix > 0 ? `${option.prix} FCFA` : 'Gratuit'}
              </div>
              {selectedDeliveryOption?.format === option.format && <CheckCircle size={16} className="text-green-500 mt-1" />}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={() => setEtape(0)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
        <button
          onClick={() => setEtape(nextStep)}
          disabled={!selectedDeliveryOption}
          className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm"
        >
          Continuer →
        </button>
      </div>
    </div>
  );
}

// --- ÉTAPE 1 : INFORMATIONS PERSONNELLES ---
function Etape1_InformationsPersonnelles({ setEtape, docChoisi, form, setForm, etapeChoixDelivranceIndex, etapePiecesIndex, etapeConfirmationIndex }: StepSpecificProps<{ etapePiecesIndex: number, etapeConfirmationIndex: number }>) {
  const fieldsToRender = docChoisi?.formFields || docChoisi?.workflow?.[0]?.formFields || [];
  const previousStep = (docChoisi?.deliveryOptions && docChoisi.deliveryOptions.length > 0) ? etapeChoixDelivranceIndex : 0;
  const nextStep = (docChoisi?.justificatifs && docChoisi.justificatifs.length > 0)
    ? etapePiecesIndex
    : etapeConfirmationIndex;

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0A2540] mb-1">Vos informations</h2>
      <p className="text-xs text-gray-400 mb-5">Saisissez exactement vos informations telles qu'elles figurent sur votre CNI.</p>
      <DynamicForm fields={fieldsToRender} form={form} setForm={setForm} />
      <div className="flex gap-3 mt-6">
        <button onClick={() => setEtape(previousStep)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
        <button onClick={() => setEtape(nextStep)} disabled={!form.nom || !form.prenom || !form.dateNaissance}
          className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
          Continuer →
        </button>
      </div>
    </div>
  );
}

// --- ÉTAPE 2 : PIÈCES JUSTIFICATIVES ---
function Etape2_PiecesJustificatives({ setEtape, docChoisi, form, reference, fichiers, setFichiers, heberge, setHeberge, etapeInformationsIndex, etapePaiementIndex, etapeConfirmationIndex, etapeChoixDelivranceIndex }: StepSpecificProps<{ etapeInformationsIndex: number, etapePaiementIndex: number, etapeConfirmationIndex: number }>) {
  const setFichier = (k: keyof FichiersData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFichiers({ ...fichiers, [k]: f.name });
  };

  const justificatifsToRender: JustificatifConfig[] = docChoisi?.justificatifs || docChoisi?.workflow?.find(s => s.type === 'upload_justificatifs')?.justificatifs || [];
  const previousStep = (docChoisi?.formFields && docChoisi.formFields.length > 0) ? etapeInformationsIndex : (docChoisi?.deliveryOptions && docChoisi.deliveryOptions.length > 0 ? etapeChoixDelivranceIndex : 0);
  const nextStep = etapePaiementIndex !== -1 ? etapePaiementIndex : etapeConfirmationIndex;

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0A2540] mb-1">Pièces justificatives</h2>
      <p className="text-xs text-gray-400 mb-5">Photos nettes acceptées. L'agent vérifiera les originaux au guichet.</p>

      <div className="space-y-4 mb-5">
        {justificatifsToRender.map((justificatif, index) => (
          <UploadZone key={index} label={justificatif.label} hint={justificatif.description || `Téléchargez votre ${justificatif.label.toLowerCase()}`} done={fichiers[justificatif.label as keyof FichiersData]} onFile={setFichier(justificatif.label as keyof FichiersData)} />
        ))}
      </div>

      {docChoisi?.id === 'certificat_residence' && (
        <div className="space-y-4 mb-5">
          <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 accent-amber-600" />
              <span className="text-sm font-semibold text-amber-800">Parents mariés ?</span>
            </label>
            <div className="mt-3 pl-7"><UploadZone label="Livret de famille ou Acte de mariage" hint="Si applicable" done={fichiers.livretFamille} onFile={setFichier("livretFamille")} /></div>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button onClick={() => setEtape(previousStep)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
        <button onClick={() => {
          setEtape(nextStep);
        }} disabled={!fichiers.cni || !fichiers.domicile}
          className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
          Continuer →
        </button>
      </div>
    </div>
  );
}

// --- ÉTAPE 3 : PAIEMENT ---
function Etape3_Paiement({ setEtape, docChoisi, form, mairie, nombreCopies, paiement, setPaiement, reference, selectedDeliveryOption, etapePiecesIndex, etapeConfirmationIndex }: StepSpecificProps<{ etapePiecesIndex: number, etapeConfirmationIndex: number }>) {
  const totalAPayer = (docChoisi?.prix || 0) * nombreCopies + (selectedDeliveryOption?.prix || 0);

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
            ["Option de délivrance", selectedDeliveryOption?.label || "N/A"],
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
        <button onClick={() => setEtape(etapePiecesIndex)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ArrowLeft size={14} /> Retour
        </button>
        <button onClick={() => {
          if (docChoisi && selectedDeliveryOption) {
            addDossierToQueue({ id: reference, nom: `${form.nom} ${form.prenom}`, doc: docChoisi.id, paymentMethod: "digital", deliveryMethod: "sur_place" }); // Simplified for now
          }
          setEtape(etapeConfirmationIndex);
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
function Etape
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
              ["Paiement", `À régler au guichet (${(docChoisi?.prix ?? 0) * nombreCopies} FCFA)`],
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
                  alert("Simulation du paiement pour la légalisation.\nLe document final certifié serait maintenant téléchargé.");
                  // if (docChoisi) generateAndDownloadPdf(docChoisi, form, reference, nombreCopies);
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

  // --- Circuit Court (document simple avec paiement en ligne) ---
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Demande validée !</h2>
      <p className="text-sm text-gray-400 mb-6">Paiement confirmé. Votre document est prêt.</p>

      <div className="space-y-4">
        {/* Option 1: Télécharger le document NON légalisé */}
        <button
          onClick={() => {
            alert("Téléchargement du document non-légalisé...");
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
            alert("Simulation du paiement pour la légalisation.\nLe document final certifié serait maintenant téléchargé.");
            // Ici, on lancerait le paiement du timbre, puis le téléchargement du PDF final.
          }}
          className="w-full text-left border-2 border-primary bg-primary/5 rounded-xl p-4 transition-all flex items-start gap-4"
        >
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground flex-shrink-0">
            <ShieldCheck className="h-5 w-5" /> {/* Icône de sécurité */}
          </div>
          <div>
            <div className="font-semibold text-sm text-primary">Légaliser ce document (+ {selectedDeliveryOption.prix} FCFA)</div>
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
