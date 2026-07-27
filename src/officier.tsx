import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, FileText, BarChart2, Search, LogOut, Eye, PenTool, Download, Send, Shield, Clock, TrendingUp, Users } from "lucide-react";

// ─── Données simulées ───
const DOSSIERS = [
  { id: "KDC-2026-00847", nom: "Koné Amina Bintou", doc: "Certificat de résidence", agent: "Traoré K.", heure: "14:23", avatar: "KA", color: "#D1FAE5", textColor: "#065F46" },
  { id: "KDC-2026-00848", nom: "Diabaté Moussa", doc: "Acte de naissance", agent: "Traoré K.", heure: "14:31", avatar: "DM", color: "#EEF2FF", textColor: "#3730A3" },
  { id: "KDC-2026-00849", nom: "Yao Désirée Epse Brou", doc: "Certificat de résidence", agent: "Coulibaly A.", heure: "14:38", avatar: "YD", color: "#FEF3C7", textColor: "#92400E" },
  { id: "KDC-2026-00850", nom: "Bamba Seydou", doc: "Certificat de nationalité", agent: "Coulibaly A.", heure: "14:42", avatar: "BS", color: "#FCE7F3", textColor: "#831843" },
  { id: "KDC-2026-00851", nom: "Coulibaly Awa", doc: "Certificat de résidence", agent: "Diallo M.", heure: "14:55", avatar: "CA", color: "#F0FDF4", textColor: "#166534" },
];

const NAV = [
  { icon: PenTool, label: "Parapheur", badge: 5 },
  { icon: CheckCircle, label: "Signés aujourd'hui" },
  { icon: BarChart2, label: "Rapports" },
  { icon: Search, label: "Vérifier document" },
];

// ─── QR Code simulé ───
function MiniQR() {
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
    <div style={{ display:"inline-block", padding:4, background:"#fff", border:"2px solid #000", borderRadius:3 }}>
      {pattern.map((row, i) => (
        <div key={i} style={{ display:"flex" }}>
          {row.map((cell, j) => (
            <div key={j} style={{ width:5, height:5, background: cell ? "#000" : "#fff" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Aperçu document ───
function DocPreview({ dossier, signe }: any) {
  const today = new Date().toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" });
  const hash = "a7f3c2e19b4d..." + dossier.id.slice(-4);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* En-tête doc officiel */}
      <div className="border-b-2 border-[#009A44] p-5 text-center bg-white">
        <div className="flex justify-center gap-1 mb-3">
          <div className="w-4 h-6 rounded-sm" style={{background:"#F77F00"}}/>
          <div className="w-4 h-6 rounded-sm" style={{background:"#ffffff", border:"1px solid #eee"}}/>
          <div className="w-4 h-6 rounded-sm" style={{background:"#009A44"}}/>
        </div>
        <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-0.5">République de Côte d'Ivoire</div>
        <div className="text-[9px] text-gray-400 mb-1">Union — Discipline — Travail</div>
        <div className="text-[10px] font-bold text-gray-600 mb-2">MAIRIE DE COCODY</div>
        <div className="text-base font-extrabold text-[#0A2540] tracking-wide">
          {dossier.doc.toUpperCase()}
        </div>
      </div>

      {/* Corps du document */}
      <div className="p-5 text-sm leading-relaxed text-gray-800 relative">
        {/* QR code flottant */}
        <div className="float-right ml-4 mb-2 text-center">
          <MiniQR />
          <div className="text-[8px] text-gray-400 mt-1">Vérifier sur<br/>kronodoc.ci</div>
        </div>

        <p>
          Nous, <strong>Maire Adjoint de la Commune de Cocody</strong>, certifions que :
        </p>
        <br/>
        <p>
          <strong>Madame/Monsieur {dossier.nom}</strong>, de nationalité ivoirienne,
          réside effectivement au <strong>Lot 47, Quartier Belle-Ville, Cocody, Abidjan</strong>.
        </p>
        <br/>
        <p>Le présent certificat est délivré pour servir et valoir ce que de droit.</p>
        <br/>
        <p className="text-xs text-gray-500 italic">Fait à Cocody, le {today}</p>
      </div>

      {/* Zone signature */}
      <div className="px-5 pb-5">
        <div className="border-t border-gray-200 pt-4 flex justify-end">
          <div className="text-center">
            {signe ? (
              <div>
                <div className="text-[#009A44] font-bold text-sm mb-1" style={{ fontFamily:"cursive" }}>
                  J.B. Coulibaly
                </div>
                <div className="w-32 border-t border-gray-400 pt-1">
                  <div className="text-[10px] text-gray-500">M. Coulibaly Jean-Baptiste</div>
                  <div className="text-[9px] text-gray-400">Maire Adjoint · Cocody</div>
                  <div className="text-[9px] text-[#009A44] font-bold mt-0.5">✅ Signé électroniquement</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-32 h-8 border-b border-gray-300 mb-1" />
                <div className="text-[10px] text-gray-500">M. Coulibaly Jean-Baptiste</div>
                <div className="text-[9px] text-gray-400">Maire Adjoint · Cocody</div>
                <div className="text-[9px] text-amber-500 mt-0.5">⏳ En attente de signature</div>
              </div>
            )}
          </div>
        </div>

        {/* Hash SHA-256 */}
        <div className="mt-3 bg-gray-50 rounded-lg p-2 border border-gray-100">
          <div className="flex items-center gap-2">
            <Shield size={11} className="text-gray-400" />
            <span className="text-[9px] font-mono text-gray-400">SHA-256 : {hash}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Modal confirmation signature ───
function SignModal({ dossier, onConfirm, onClose }: any) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const confirmer = () => {
    if (code.length < 4) return;
    setLoading(true);
    setTimeout(() => { onConfirm(); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <PenTool size={24} className="text-[#F77F00]" />
          </div>
          <h3 className="text-lg font-bold text-[#0A2540]">Confirmer la signature</h3>
          <p className="text-xs text-gray-400 mt-1">
            Document : <strong>{dossier.doc}</strong><br />
            Bénéficiaire : <strong>{dossier.nom}</strong>
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Votre signature électronique sera apposée avec horodatage. Le document sera certifié SHA-256 et envoyé au citoyen par SMS et WhatsApp.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Code PIN de signature
          </label>
          <input
            type="password"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="••••"
            maxLength={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#F77F00]"
          />
          <p className="text-xs text-gray-400 mt-1.5 text-center">Entrez votre PIN officier (démo : 1234)</p>
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium">
            Annuler
          </button>
          <button onClick={confirmer} disabled={code.length < 4 || loading}
            className="flex-1 py-3 bg-[#F77F00] text-white font-bold rounded-xl text-sm disabled:opacity-40">
            {loading ? "Signature en cours..." : "✍ Signer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ───
export default function Officier() {
  const [navActif, setNavActif] = useState(0);
  const [dossierActif, setDossierActif] = useState<any>(DOSSIERS[0]);
  const [showSignModal, setShowSignModal] = useState(false);
  const [signes, setSignes] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [signTout, setSignTout] = useState(false);

  const notifier = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const signer = (id: string) => {
    setSignes(prev => [...prev, id]);
    notifier(`✅ Document signé — SMS + WhatsApp envoyés à ${dossierActif.nom}`);
  };

  const signerTout = () => {
    setSignes(DOSSIERS.map(d => d.id));
    setSignTout(true);
    notifier(`✅ ${DOSSIERS.length} documents signés — Notifications envoyées à tous les citoyens`);
  };

  const dossiersRestants = DOSSIERS.filter(d => !signes.includes(d.id));

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-[#0A2540] text-white px-4 py-3 rounded-xl text-sm font-medium shadow-lg max-w-sm">
          {notification}
        </div>
      )}

      {showSignModal && dossierActif && (
        <SignModal dossier={dossierActif} onConfirm={() => signer(dossierActif.id)} onClose={() => setShowSignModal(false)} />
      )}

      {/* Header */}
      <header className="bg-[#0A2540] text-white px-6 py-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#F77F00] rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">⚖️</div>
        <div>
          <div className="font-bold text-sm leading-tight">KronoDoc CI — Console Officier</div>
          <div className="text-xs text-white/40">Mairie de Cocody</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
            <Shield size={13} className="text-[#F77F00]" />
            <span className="text-xs font-medium">M. Coulibaly Jean-Baptiste</span>
            <span className="text-[10px] text-white/40">Maire Adjoint</span>
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
            <button key={i} onClick={() => setNavActif(i)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left
                ${navActif === i ? "bg-white/10 text-white border-l-2 border-[#F77F00]" : "text-white/50 hover:text-white/80"}`}>
              <item.icon size={16} />
              <span>{item.label}</span>
              {item.badge && signes.length < DOSSIERS.length && (
                <span className="ml-auto bg-[#F77F00] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {DOSSIERS.length - signes.length}
                </span>
              )}
            </button>
          ))}

          <div className="mt-auto px-3 space-y-2">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="text-[10px] text-white/40 uppercase tracking-wide mb-2">Aujourd'hui</div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">Signés</span>
                <span className="text-[#F77F00] font-bold">{34 + signes.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">En attente</span>
                <span className="text-white font-bold">{dossiersRestants.length}</span>
              </div>
              <div className="mt-2 bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#F77F00] h-full rounded-full transition-all"
                  style={{ width: `${(signes.length / DOSSIERS.length) * 100}%` }} />
              </div>
            </div>
          </div>

          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/30 hover:text-white/60 mt-2">
            <Shield size={16} /> Sécurité
          </button>
        </aside>

        {/* Contenu */}
        <main className="flex-1 overflow-auto p-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { icon: Clock, label: "En attente", value: dossiersRestants.length, color: "text-amber-600" },
              { icon: CheckCircle, label: "Signés aujourd'hui", value: 34 + signes.length, color: "text-green-600" },
              { icon: TrendingUp, label: "Ce mois", value: 247, color: "text-blue-600" },
              { icon: Users, label: "Citoyens servis", value: 1842, color: "text-purple-600" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                <Icon size={20} className={color} />
                <div>
                  <div className="text-xl font-extrabold text-[#0A2540]">{value}</div>
                  <div className="text-xs text-gray-400">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            {/* Parapheur gauche */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#0A2540]">
                  Parapheur <span className="text-gray-400 font-normal">({dossiersRestants.length} restants)</span>
                </h2>
              </div>

              {/* Bouton tout signer */}
              {dossiersRestants.length > 0 && (
                <button onClick={signerTout}
                  className="w-full mb-3 py-2.5 bg-[#F77F00] text-white font-bold rounded-xl text-xs hover:bg-orange-600 transition-colors flex items-center justify-center gap-2">
                  <PenTool size={13} /> Signer tous les {dossiersRestants.length} documents
                </button>
              )}

              <div className="space-y-2">
                {DOSSIERS.map(d => {
                  const estSigne = signes.includes(d.id);
                  return (
                    <button key={d.id} onClick={() => setDossierActif(d)}
                      className={`w-full text-left border-2 rounded-xl p-3 transition-all
                        ${dossierActif?.id === d.id ? "border-[#F77F00] shadow-sm" : "border-gray-100 hover:border-gray-200"}
                        ${estSigne ? "bg-green-50 opacity-70" : "bg-white"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: d.color, color: d.textColor }}>
                          {d.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#0A2540] truncate">{d.nom}</div>
                          <div className="text-xs text-gray-400 truncate">{d.doc}</div>
                          <div className="text-[10px] text-gray-300 mt-0.5">Agent : {d.agent}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {estSigne ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Signé ✓</span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">À signer</span>
                          )}
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={9} /> {d.heure}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document + actions droite */}
            <div className="col-span-3 space-y-3">
              {dossierActif && (
                <>
                  {/* Actions rapides */}
                  <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-bold text-[#0A2540] text-sm">{dossierActif.nom}</div>
                      <div className="text-xs text-gray-400">{dossierActif.doc} · {dossierActif.id}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors">
                        <Eye size={13} /> Aperçu
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium hover:bg-gray-50 transition-colors">
                        <Download size={13} /> PDF
                      </button>
                      {!signes.includes(dossierActif.id) ? (
                        <button onClick={() => setShowSignModal(true)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#F77F00] text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">
                          <PenTool size={13} /> Signer ce document
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
                          <CheckCircle size={13} className="text-green-600" />
                          <span className="text-xs font-bold text-green-700">Signé</span>
                          <button className="flex items-center gap-1 text-xs text-blue-600 ml-2 hover:underline">
                            <Send size={11} /> Renvoyer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aperçu document */}
                  <DocPreview dossier={dossierActif} signe={signes.includes(dossierActif.id)} />

                  {/* Info envoi */}
                  {signes.includes(dossierActif.id) && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <div className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <Send size={13} /> Document envoyé automatiquement
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                          <div className="text-lg mb-0.5">📱</div>
                          <div className="font-medium text-blue-800">SMS</div>
                          <div className="text-blue-500">07 48 23 XX XX</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                          <div className="text-lg mb-0.5">💬</div>
                          <div className="font-medium text-blue-800">WhatsApp</div>
                          <div className="text-blue-500">PDF joint</div>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center border border-blue-100">
                          <div className="text-lg mb-0.5">🖨️</div>
                          <div className="font-medium text-blue-800">Impression</div>
                          <div className="text-blue-500">Guichet 03</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
