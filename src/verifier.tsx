import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, QrCode, Loader2 } from "lucide-react";

// ─── Document simulé trouvé ───
const DOC_VALIDE = {
  reference: "KDC-2026-00847",
  type: "Certificat de résidence",
  beneficiaire: "Koné Amina Bintou",
  mairie: "Mairie de Cocody",
  date_emission: "21 juillet 2026",
  date_expiration: "21 juillet 2027",
  signe_par: "M. Coulibaly Jean-Baptiste — Maire Adjoint",
  hash: "a7f3c2e19b4d8f21c3e5a7b9d1f3c5e7a9b1d3f5",
  statut: "valide",
};
// En production, ces données proviendraient d'une API backend sécurisée.

// ─── QR Code simulé ───
function QRDisplay() {
  const pattern = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,0,1,1,0,1,1,0,1],
    [1,1,1,0,1,0,1,1,1],
    [0,0,0,1,0,1,0,0,0],
    [1,1,0,0,1,0,1,0,1],
    [1,1,1,0,0,1,0,1,1],
    [1,0,1,1,1,0,1,0,1],
    [1,1,1,0,1,1,0,1,1],
  ];
  return (
    <div style={{ display:"inline-block", padding:8, background:"#fff", border:"3px solid #000", borderRadius:4 }}>
      {pattern.map((row, i) => (
        <div key={i} style={{ display:"flex" }}>
          {row.map((cell, j) => (
            <div key={j} style={{ width:9, height:9, background: cell ? "#000" : "#fff" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Résultat de vérification ───
function ResultatVerification({ doc, onReset }: any) {
  const estValide = doc.statut === "valide";
  // Ce composant afficherait les détails du document ou un message d'erreur.
  return (
    <div className="space-y-4">
      {/* Statut principal */}
      <div className={`rounded-2xl p-6 text-center border-2 ${estValide ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${estValide ? "bg-green-100" : "bg-red-100"}`}>
          {estValide
            ? <CheckCircle size={36} className="text-green-600" />
            : <XCircle size={36} className="text-red-600" />}
        </div>
        <h2 className={`text-xl font-extrabold mb-1 ${estValide ? "text-green-800" : "text-red-800"}`}>
          {estValide ? "✅ Document authentique" : "❌ Document invalide ou falsifié"}
        </h2>
        <p className={`text-sm ${estValide ? "text-green-600" : "text-red-600"}`}>
          {estValide
            ? "Ce document a été émis et signé par les autorités compétentes de Côte d'Ivoire."
            : "Ce document ne correspond à aucun document officiel dans notre base."}
        </p>
      </div>

      {estValide && (
        <>
          {/* Détails du document */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#0A2540] text-sm">Informations du document</h3>
              <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">Certifié ✓</span>
            </div>
            <div className="p-5 space-y-3">
              {[
                ["Référence", doc.reference],
                ["Type de document", doc.type],
                ["Bénéficiaire", doc.beneficiaire],
                ["Mairie émettrice", doc.mairie],
                ["Date d'émission", doc.date_emission],
                ["Date d'expiration", doc.date_expiration],
                ["Signé par", doc.signe_par],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-400 font-medium flex-shrink-0">{label}</span>
                  <span className="text-sm text-[#0A2540] font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hash SHA-256 */}
          <div className="bg-[#0A2540] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-[#009A44]" />
              <span className="text-xs font-bold text-white">Empreinte numérique (SHA-256)</span>
            </div>
            <div className="font-mono text-xs text-green-400 break-all leading-relaxed">
              {doc.hash}
            </div>
            <div className="text-[10px] text-white/40 mt-2">
              Cette empreinte garantit que le document n'a pas été modifié depuis sa signature.
            </div>
          </div>

          {/* Infos utilisation */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <strong>Accepté par :</strong> Banques, universités, ambassades, employeurs, et toute administration publique ivoirienne.
                Ce document est légalement reconnu conformément à la loi sur la dématérialisation des actes administratifs.
              </div>
            </div>
          </div>
        </>
      )}

      <button onClick={onReset}
        className="w-full py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors text-gray-600">
        ← Vérifier un autre document
      </button>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───
export default function Verifier() {
  const [mode, setMode] = useState<"accueil" | "reference" | "scan" | "resultat">("accueil");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState<any>(null);

  // En production, cette fonction ferait un appel API au backend pour vérifier la référence.
  const verifierParReference = () => {
    if (!reference.trim()) return;
    setLoading(true);
    setTimeout(() => {
      // Simulation de la réponse du backend
      setResultat(reference.toUpperCase().includes("KDC") ? DOC_VALIDE : { statut: "invalide" });
      setMode("resultat");
      // En cas de succès, le backend renverrait toutes les données du document pour affichage.
      setLoading(false);
    }, 1500);
  };

  const simulerScan = () => {
    setLoading(true);
    setTimeout(() => {
      // Simulation de la réponse du backend après un scan réussi
      setResultat(DOC_VALIDE);
      setMode("resultat");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* Header du site, réutilisable */}
      {/* Header */}
      <header className="bg-[#0A2540] text-white px-6 py-4 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-[#009A44] rounded-lg flex items-center justify-center font-black text-sm">K</div>
          <span className="font-bold text-sm">KronoDoc CI</span>
        </Link>
        <span className="text-white/30">›</span>
        <span className="text-sm text-white/70">Vérification de document</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-10">
        {/* Titre */}
        {/* Section d'accueil pour choisir le mode de vérification */}
        {mode === "accueil" && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0A2540] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={30} className="text-[#009A44]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0A2540] mb-2">Vérifier un document</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Vérifiez l'authenticité d'un document émis par KronoDoc CI en scannant son QR code ou en saisissant sa référence.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* ── Accueil : choix du mode ── */}
          {mode === "accueil" && (
            // Boutons pour choisir entre scan QR et saisie manuelle
            <div className="space-y-3">
              <button onClick={() => setMode("scan")}
                className="w-full border-2 border-gray-100 hover:border-[#009A44] rounded-xl p-5 text-left transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition-colors">
                    <QrCode size={24} className="text-[#009A44]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0A2540] mb-0.5">Scanner le QR Code</div>
                    <div className="text-xs text-gray-400">Pointez votre caméra vers le QR code du document — vérification instantanée</div>
                  </div>
                </div>
              </button>

              <button onClick={() => setMode("reference")}
                className="w-full border-2 border-gray-100 hover:border-[#009A44] rounded-xl p-5 text-left transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                    <Search size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-[#0A2540] mb-0.5">Saisir la référence</div>
                    <div className="text-xs text-gray-400">Entrez le numéro de référence inscrit sur le document (ex: KDC-2026-00847)</div>
                  </div>
                </div>
              </button>

              {/* Qui peut utiliser */}
              <div className="bg-gray-50 rounded-xl p-4 mt-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Utilisé par</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { emoji:"🏦", label:"Banques" },
                    { emoji:"🏛️", label:"Administrations" },
                    { emoji:"🎓", label:"Universités" },
                    { emoji:"🏢", label:"Employeurs" },
                    { emoji:"✈️", label:"Ambassades" },
                    { emoji:"🏥", label:"Hôpitaux" },
                  ].map(({ emoji, label }) => (
                    <div key={label} className="text-center bg-white rounded-lg py-2 border border-gray-100">
                      <div className="text-lg mb-0.5">{emoji}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Saisie référence ── */}
          {mode === "reference" && (
            // Formulaire pour saisir la référence manuellement
            <div>
              <button onClick={() => setMode("accueil")} className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                ← Retour
              </button>
              <h2 className="text-lg font-bold text-[#0A2540] mb-1">Saisir la référence</h2>
              <p className="text-xs text-gray-400 mb-5">La référence est inscrite en bas du document, au format KDC-AAAA-XXXXX</p>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  Numéro de référence
                </label>
                <input
                  value={reference}
                  onChange={e => setReference(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === "Enter" && verifierParReference()}
                  placeholder="KDC-2026-00847"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#009A44] font-mono tracking-wide"
                />
                <p className="text-xs text-gray-400 mt-1.5">Essayez : KDC-2026-00847 pour une démonstration</p>
              </div>

              <button onClick={verifierParReference} disabled={!reference.trim() || loading}
                className="w-full py-3.5 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin"/> Vérification...</>
                ) : (
                  <><Search size={16} /> Vérifier l'authenticité</>
                )}
              </button>
            </div>
          )}

          {/* ── Scanner QR ── */}
          {mode === "scan" && (
            // Interface de scan QR simulée
            <div>
              <button onClick={() => setMode("accueil")} className="text-xs text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
                ← Retour
              </button>
              <h2 className="text-lg font-bold text-[#0A2540] mb-1">Scanner le QR Code</h2>
              <p className="text-xs text-gray-400 mb-4">Pointez votre appareil photo vers le QR code imprimé sur le document</p>

              {/* Zone caméra simulée */}
              <div className="relative bg-gray-900 rounded-2xl h-64 flex flex-col items-center justify-center mb-4 overflow-hidden">
                <div className="absolute inset-10 border-2 border-white/30 rounded-xl">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#009A44] rounded-tl-lg" /> {/* Coins du cadre de scan */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#009A44] rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#009A44] rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#009A44] rounded-br-lg" />
                </div>
                {loading ? (
                  <div className="text-center">
                    <div className="w-10 h-10 border-3 border-white/20 border-t-[#009A44] rounded-full animate-spin mx-auto mb-2" />
                    <div className="text-white text-sm">Analyse en cours...</div> {/* Indicateur de chargement */}
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode size={32} className="text-white/30 mx-auto mb-2" />
                    <div className="text-white/50 text-sm">Caméra active</div>
                  </div>
                )}
              </div>

              {/* QR Code de démo */}
              {/* Ce QR code est un exemple visuel pour la démo */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-4">
                <QRDisplay />
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-1">Document de démonstration</div>
                  <div className="text-xs text-gray-400">Cliquez sur "Scanner" pour simuler la lecture de ce QR code</div>
                </div>
              </div>

              <button onClick={simulerScan} disabled={loading}
                className="w-full py-3.5 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2">
                {loading ? ( {/* Bouton pour simuler le scan */}
                  <><Loader2 className="w-4 h-4 animate-spin"/> Vérification...</>
                ) : (
                  <><QrCode size={16} /> Scanner ce QR Code</>
                )}
              </button>
            </div>
          )}

          {/* ── Résultat ── */}
          {mode === "resultat" && resultat && ( // Affichage du résultat de la vérification
            <ResultatVerification doc={resultat} onReset={() => { setMode("accueil"); setResultat(null); setReference(""); }} />
          )}
        </div>

        {/* Footer info */}
        {mode === "accueil" && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              Service officiel de vérification · KronoDoc CI · Gouvernement de Côte d'Ivoire 🇨🇮
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
