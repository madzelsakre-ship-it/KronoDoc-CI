import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, Clock, ChevronRight, Search, Camera, BarChart2, FileText, Settings, LogOut, User, ScanLine } from "lucide-react";

// ─── Données simulées ───
const QUEUE = [
  { id: "KDC-2026-00847", nom: "Koné Amina Bintou", doc: "Certificat de résidence", heure: "14:23", statut: "ocr_ok", avatar: "KA", color: "#D1FAE5", textColor: "#065F46" },
  { id: "KDC-2026-00848", nom: "Diabaté Moussa", doc: "Acte de naissance", heure: "14:31", statut: "en_attente", avatar: "DM", color: "#EEF2FF", textColor: "#3730A3" },
  { id: "KDC-2026-00849", nom: "Yao Désirée Epse Brou", doc: "Certificat de résidence", heure: "14:38", statut: "en_attente", avatar: "YD", color: "#FEF3C7", textColor: "#92400E" },
  { id: "KDC-2026-00850", nom: "Bamba Seydou", doc: "Certificat de nationalité", heure: "14:42", statut: "en_attente", avatar: "BS", color: "#FCE7F3", textColor: "#831843" },
  { id: "KDC-2026-00851", nom: "Coulibaly Awa", doc: "Certificat de résidence", heure: "14:55", statut: "en_attente", avatar: "CA", color: "#F0FDF4", textColor: "#166534" },
];

const DOSSIER = {
  id: "KDC-2026-00847",
  nom: "Koné Amina Bintou",
  doc: "Certificat de résidence",
  dateNaissance: "12/03/1992",
  adresse: "Lot 47, Quartier Belle-Ville, Cocody, Abidjan",
  telephone: "07 48 23 XX XX",
  paiement: "Wave · 500 FCFA",
  mairie: "Mairie de Cocody",
  heberge: false,
  ocr: {
    champs: [
      { label: "Nom complet", saisie: "Koné Amina Bintou", extrait: "Koné Amina Bintou", match: true },
      { label: "Date de naissance", saisie: "12/03/1992", extrait: "12/03/1992", match: true },
      { label: "N° CNI", saisie: "CI0234781", extrait: "CI0234718", match: false },
      { label: "Lieu de naissance", saisie: "Abidjan", extrait: "Abidjan", match: true },
    ]
  }
};

const NAV = [
  { icon: FileText, label: "File d'attente", badge: QUEUE.length }, // Badge dynamique
  { icon: ScanLine, label: "Scanner QR" }, // Utilisation de ScanLine pour le scan
  { icon: BarChart2, label: "Statistiques" }, // Tableau de bord décisionnel
  { icon: Search, label: "Rechercher un dossier" }, // Recherche de dossiers
];

// ─── Badge statut ───
function StatutBadge({ statut }: { statut: string }) {
  const map: any = {
    ocr_ok: { label: "OCR ✓", cls: "bg-indigo-100 text-indigo-700" },
    en_attente: { label: "En attente", cls: "bg-amber-100 text-amber-700" },
    valide: { label: "Validé ✓", cls: "bg-green-100 text-green-700" },
    rejete: { label: "Rejeté", cls: "bg-red-100 text-red-700" },
  };
  const s = map[statut] || map.en_attente;
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.cls}`}>{s.label}</span>;
}

// ─── Scanner QR simulé ───
function ScannerModal({ onClose, onScan }: any) {
  // En production, cette modal utiliserait la caméra de l'appareil
  // et une bibliothèque de lecture de QR code (ex: instascan, html5-qrcode).
  // Le traitement serait 100% offline pour la résilience.
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  const simulerScan = () => {
    setScanning(true);
    setTimeout(() => { setDone(true); setScanning(false); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-[#0A2540] mb-4 text-center">Scanner le QR Code</h3>
        <div className={`relative bg-gray-900 rounded-xl h-56 flex items-center justify-center mb-4 overflow-hidden`}>
          {!done ? (
            <>
              {/* Cadre de scan */}
              <div className="absolute inset-8 border-2 border-white/40 rounded-lg">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#009A44] rounded-tl-lg -translate-x-0.5 -translate-y-0.5" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#009A44] rounded-tr-lg translate-x-0.5 -translate-y-0.5" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#009A44] rounded-bl-lg -translate-x-0.5 translate-y-0.5" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#009A44] rounded-br-lg translate-x-0.5 translate-y-0.5" />
              </div>
              {scanning && (
                <div className="absolute inset-x-8 h-0.5 bg-[#009A44] animate-bounce top-1/3" />
              )}
              <Camera size={28} className="text-white/30" />
            </>
          ) : (
            <div className="text-center">
              <CheckCircle size={40} className="text-green-400 mx-auto mb-2" />
              <div className="text-white text-sm font-bold">KDC-2026-00847</div>
              <div className="text-white/50 text-xs">Koné Amina Bintou</div>
            </div>
          )}
        </div>
        {!done ? (
          <button onClick={simulerScan} disabled={scanning}
            className="w-full py-3 bg-[#009A44] text-white font-bold rounded-xl text-sm disabled:opacity-60">
            {scanning ? "Scan en cours..." : "📷 Simuler un scan"}
          </button>
        ) : (
          <button onClick={() => { onScan(); onClose(); }}
            className="w-full py-3 bg-[#0A2540] text-white font-bold rounded-xl text-sm">
            ✅ Ouvrir le dossier
          </button>
        )}
        <button onClick={onClose} className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600">
          Annuler
        </button>
      </div>
    </div>
  );
}

// ─── Modal rejet ───
function RejetModal({ onClose, onConfirm }: any) {
  // En production, les motifs de rejet seraient configurables et tracés dans les audit_logs.
  const [motif, setMotif] = useState("");
  const MOTIFS = [
    "Document expiré ou illisible",
    "Incohérence non résolue sur le nom",
    "Justificatif de domicile insuffisant",
    "Pièce d'identité non présentée",
    "Autre motif",
  ];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <XCircle size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-[#0A2540]">Motif de rejet</h3>
          <p className="text-xs text-gray-400 mt-1">Le citoyen sera informé par SMS</p>
        </div>
        <div className="space-y-2 mb-4">
          {MOTIFS.map(m => (
            <button key={m} onClick={() => setMotif(m)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded-xl border-2 transition-all
                ${motif === m ? "border-red-400 bg-red-50 text-red-700 font-medium" : "border-gray-100 hover:border-gray-200"}`}>
              {m}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium">
            Annuler
          </button>
          <button onClick={() => { onConfirm(motif); onClose(); }} disabled={!motif}
            className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm disabled:opacity-40">
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───
export default function Agent() {
  const [navActif, setNavActif] = useState(0);
  const [dossierOuvert, setDossierOuvert] = useState(true);
  const [checklist, setChecklist] = useState([false, false, false, false]);
  const [showScanner, setShowScanner] = useState(false);
  const [showRejet, setShowRejet] = useState(false);
  const [statuts, setStatuts] = useState<any>({});
  // En production, les statuts seraient gérés par le backend et mis à jour via WebSockets ou polling.
  const [notification, setNotification] = useState<string | null>(null);

  const toggleCheck = (i: number) => {
    const n = [...checklist]; n[i] = !n[i]; setChecklist(n);
  };

  const notifier = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const valider = () => {
    // En production, cette action déclencherait un appel API au backend
    // pour changer le statut du dossier et l'envoyer au parapheur de l'officier.
    setStatuts({ ...statuts, [DOSSIER.id]: "valide" });
    setDossierOuvert(false);
    notifier("✅ Dossier validé — Envoyé au parapheur de l'officier");
  };
  
  const rejeter = (motif: string) => {
    setStatuts({ ...statuts, [DOSSIER.id]: "rejete" });
    setDossierOuvert(false);
    notifier(`❌ Dossier rejeté — SMS envoyé au citoyen`);
  };

  const checklistItems = [
    // Ces éléments de checklist seraient dynamiques en fonction du type de document et de la fiche de prélèvement.
    "CNI originale présentée et conforme",
    "Justificatif de domicile original vérifié",
    "Numéro CNI corrigé manuellement (CI0234781)",
    "Photo du demandeur correspond à la CNI",
  ];

  const allChecked = checklist.every(Boolean);
  const incohérences = DOSSIER.ocr.champs.filter(c => !c.match).length;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Notification toast */}
      {notification && (
        // Ce composant de notification serait un composant réutilisable.
        <div className="fixed top-4 right-4 z-50 bg-[#0A2540] text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg">
          {notification}
        </div>
      )}

      {showScanner && <ScannerModal onClose={() => setShowScanner(false)} onScan={() => setDossierOuvert(true)} />}
      {showRejet && <RejetModal onClose={() => setShowRejet(false)} onConfirm={rejeter} />}

      {/* Header */}
      <header className="bg-[#0A2540] text-white px-6 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#009A44] rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">K</div>
        <div>
          <div className="font-bold text-sm leading-tight">KronoDoc CI — Espace Agent</div>
          <div className="text-xs text-white/40">Mairie de Cocody · Guichet 03</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
            <User size={13} />
            <span className="text-xs font-medium">Traoré Kouamé</span>
          </div>
          <Link to="/" className="text-white/50 hover:text-white">
            <LogOut size={16} />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 bg-[#0A2540] flex flex-col py-4 flex-shrink-0">
          {NAV.map((item, i) => (
            <button key={i} onClick={() => { setNavActif(i); if (i === 1) setShowScanner(true); }}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#009A44]
                ${navActif === i ? "bg-white/10 text-white border-l-2 border-[#009A44]" : "text-white/50 hover:text-white/80"}`}>
              <item.icon size={16} />
              <span>{item.label}</span>
              {item.badge && <span className="ml-auto bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
          <div className="mt-auto px-3">
            {/* Ces statistiques seraient récupérées via une API de tableau de bord */}
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-[10px] text-white/40 uppercase tracking-wide mb-2">Aujourd'hui</div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Traités</span>
                <span className="text-[#009A44] font-bold">18</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-white/60">Temps moy.</span>
                <span className="text-white font-bold">2m 14s</span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/30 hover:text-white/60 mt-2 focus:outline-none focus:ring-2 focus:ring-[#009A44]">
            <Settings size={16} /> Paramètres
          </button>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-auto p-5">
          <div className="grid grid-cols-5 gap-4 h-full">

            {/* File d'attente */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#0A2540]">File d'attente <span className="text-gray-400 font-normal">({QUEUE.filter(item => item.statut === "en_attente" || item.statut === "ocr_ok").length})</span></h2>
                <button onClick={() => setShowScanner(true)}
                  className="flex items-center gap-1.5 bg-[#009A44] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
                  <Camera size={13} /> Scanner QR
                </button>
              </div>

              <div className="space-y-2">
                {/* En production, cette liste serait chargée dynamiquement depuis le backend */}
                {QUEUE.map((item) => (
                  <button key={item.id} onClick={() => setDossierOuvert(true)}
                    className={`w-full text-left bg-white border-2 rounded-xl p-3 transition-all hover:border-[#009A44]
                      ${dossierOuvert && item.id === DOSSIER.id ? "border-[#009A44] shadow-sm" : "border-gray-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: item.color, color: item.textColor }}>
                        {item.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#0A2540] truncate">{item.nom}</div>
                        <div className="text-xs text-gray-400 truncate">{item.doc}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <StatutBadge statut={statuts[item.id] || item.statut} />
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={10} /> {item.heure}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dossier détail */}
            <div className="col-span-3">
              {!dossierOuvert ? (
                // État initial quand aucun dossier n'est ouvert
                <div className="bg-white rounded-2xl border border-gray-100 h-full flex flex-col items-center justify-center text-center p-8">
                  <Camera size={36} className="text-gray-200 mb-3" />
                  <div className="text-sm font-semibold text-gray-400 mb-1">Aucun dossier ouvert</div>
                  <div className="text-xs text-gray-300 mb-4">Scannez un QR code ou sélectionnez un dossier</div>
                  <button onClick={() => setShowScanner(true)}
                    className="bg-[#009A44] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors">
                    📷 Scanner un QR Code
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  {/* En production, ces données seraient chargées depuis le backend */}
                  {/* En-tête dossier */}
                  <div className="border-b border-gray-100 px-5 py-4 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#0A2540]">{DOSSIER.nom}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{DOSSIER.doc} · {DOSSIER.id}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        QR Scanné ✓
                      </span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        Payé ✓
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 overflow-auto max-h-[calc(100vh-220px)]">
                    {/* Données injectées */}
                    <div>
                      {/* Ces données proviennent de la pré-demande citoyen */}
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                        Données injectées automatiquement via QR Code
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          ["Nom complet", DOSSIER.nom],
                          ["Date de naissance", DOSSIER.dateNaissance],
                          ["Adresse", DOSSIER.adresse],
                          ["Paiement", DOSSIER.paiement],
                        ].map(([k, v]) => (
                          <div key={k} className="bg-gray-50 rounded-xl px-3 py-2.5">
                            <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">{k}</div>
                            <div className="text-sm font-semibold text-[#0A2540]">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* OCR Analyse */}
                    {/*
                      En production, l'OCR serait une intégration réelle (ex: Google ML Kit, Tesseract.js)
                      qui comparerait les données extraites des pièces scannées avec les données de la pré-demande.
                    */}
                    <div className={`rounded-xl p-4 border ${incohérences > 0 ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
                      <div className={`flex items-center gap-2 text-sm font-bold mb-3 ${incohérences > 0 ? "text-amber-800" : "text-green-800"}`}>
                        {incohérences > 0 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        Analyse OCR — {incohérences > 0 ? `${incohérences} incohérence(s) détectée(s)` : "Tous les champs concordent"}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Champ</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Saisie citoyen</div>
                        <div className="text-[10px] font-bold text-gray-500 uppercase">Extrait CNI (OCR)</div>
                      </div>
                      <div className="space-y-1.5">
                        {DOSSIER.ocr.champs.map((c, i) => (
                          <div key={i} className="grid grid-cols-3 gap-2 items-center">
                            <div className="text-xs text-gray-500">{c.label}</div>
                            <div className={`text-xs font-mono px-2 py-1 rounded-lg font-medium
                              ${c.match ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                              {c.saisie}
                            </div>
                            <div className={`text-xs font-mono px-2 py-1 rounded-lg font-medium
                              ${c.match ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700 font-bold"}`}>
                              {c.extrait}
                              {!c.match && " ⚠"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checklist originaux */}
                    <div>
                      {/* La checklist serait dynamique en fonction du type de document */}
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                        Vérification des originaux papier
                      </div>
                      <div className="space-y-2">
                        {checklistItems.map((item, i) => (
                          <button key={i} onClick={() => toggleCheck(i)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all
                              ${checklist[i] ? "border-green-200 bg-green-50" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${checklist[i] ? "bg-[#009A44] border-[#009A44]" : "border-gray-300"}`}>
                              {checklist[i] && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm ${checklist[i] ? "text-green-800 font-medium" : "text-gray-600"}`}>{item}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-400 text-right">
                        {checklist.filter(Boolean).length}/{checklist.length} vérifications effectuées
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                      <button onClick={() => setShowRejet(true)}
                        className="px-4 py-3 bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl text-sm hover:bg-red-100 transition-colors flex items-center gap-2">
                        <XCircle size={16} /> Rejeter
                      </button>
                      <button onClick={valider} disabled={!allChecked}
                        className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        <CheckCircle size={16} />
                        {allChecked ? "✅ Valider — Envoyer à la signature" : `Cocher les ${checklist.filter(v => !v).length} vérification(s) restante(s)`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
