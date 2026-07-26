import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Upload, AlertCircle, ChevronRight, ArrowLeft, QrCode, Phone } from "lucide-react";

// ─── Types de documents disponibles ───
const DOCUMENTS = [
  { id: "residence", label: "Certificat de résidence", prix: 500, delai: "< 3 min" },
  { id: "naissance", label: "Acte de naissance (extrait)", prix: 1000, delai: "< 5 min" },
  { id: "nationalite", label: "Certificat de nationalité", prix: 1500, delai: "< 5 min" },
  { id: "legalisation", label: "Légalisation de signature", prix: 500, delai: "< 3 min" },
  { id: "vie", label: "Certificat de vie", prix: 500, delai: "< 3 min" },
];

const ETAPES = ["Document", "Informations", "Pièces", "Paiement", "QR Code"];

const MAIRIES = [
  "Mairie de Cocody", "Mairie de Yopougon", "Mairie de Abobo",
  "Mairie de Adjamé", "Mairie de Plateau", "Mairie de Treichville",
  "Mairie de Marcory", "Mairie de Koumassi", "Mairie de Port-Bouët",
];

// ─── Composant Progress ───
function Progress({ etape }: { etape: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {ETAPES.map((label, i) => (
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
          {i < ETAPES.length - 1 && (
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

// ─── PAGE PRINCIPALE ───
export default function Citoyen() {
  const [etape, setEtape] = useState(0);
  const [docChoisi, setDocChoisi] = useState<any>(null);
  const [mairie, setMairie] = useState("");
  const [heberge, setHeberge] = useState(false);
  const [paiement, setPaiement] = useState("wave");
  const [form, setForm] = useState({ nom: "", prenom: "", dateNaissance: "", adresse: "", quartier: "", telephone: "", email: "" });
  const [fichiers, setFichiers] = useState<any>({ cni: null, domicile: null, hebergement: null });
  const [reference] = useState(`KDC-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`);

  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });
  const setFichier = (k: string) => (e: any) => {
    const f = e.target.files?.[0];
    if (f) setFichiers({ ...fichiers, [k]: f.name });
  };

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
  const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5";

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

        <Progress etape={etape} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

          {/* ── ÉTAPE 0 : Choix du document ── */}
          {etape === 0 && (
            <div>
              <div className="mb-5">
                <label className={labelCls}>Mairie concernée</label>
                <select value={mairie} onChange={e => setMairie(e.target.value)} className={inputCls}>
                  <option value="">Sélectionner votre mairie...</option>
                  {MAIRIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className={labelCls} style={{ marginBottom: 12 }}>Document souhaité</div>
              <div className="space-y-3">
                {DOCUMENTS.map(doc => (
                  <button key={doc.id} onClick={() => setDocChoisi(doc)}
                    className={`w-full text-left border-2 rounded-xl p-4 transition-all flex items-center justify-between
                      ${docChoisi?.id === doc.id ? "border-[#009A44] bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <div>
                      <div className="font-semibold text-sm text-[#0A2540]">{doc.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">Délivré en {doc.delai}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#009A44] text-sm">{doc.prix} FCFA</div>
                      {docChoisi?.id === doc.id && <CheckCircle size={16} className="text-green-500 ml-auto mt-1" />}
                    </div>
                  </button>
                ))}
              </div>
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
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelCls}>Nom de famille</label>
                  <input value={form.nom} onChange={set("nom")} placeholder="KONÉ" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Prénom(s)</label>
                  <input value={form.prenom} onChange={set("prenom")} placeholder="Amina Bintou" className={inputCls} />
                </div>
              </div>
              <div className="mb-4">
                <label className={labelCls}>Date de naissance</label>
                <input type="date" value={form.dateNaissance} onChange={set("dateNaissance")} className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Adresse complète</label>
                <input value={form.adresse} onChange={set("adresse")} placeholder="Lot 47, Rue J24..." className={inputCls} />
              </div>
              <div className="mb-4">
                <label className={labelCls}>Quartier / Commune</label>
                <input value={form.quartier} onChange={set("quartier")} placeholder="Cocody Angré 7e tranche" className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className={labelCls}>Téléphone</label>
                  <input value={form.telephone} onChange={set("telephone")} placeholder="07 XX XX XX XX" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Email (optionnel)</label>
                  <input type="email" value={form.email} onChange={set("email")} placeholder="vous@exemple.com" className={inputCls} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEtape(0)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <ArrowLeft size={14} /> Retour
                </button>
                <button onClick={() => setEtape(2)} disabled={!form.nom || !form.prenom || !form.adresse}
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
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-wide">Informations de l'hébergeant</div>
                  <input placeholder="Nom complet de l'hébergeant" className={inputCls} />
                  <input placeholder="N° CNI de l'hébergeant" className={inputCls} />
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
                <button onClick={() => setEtape(3)} disabled={!fichiers.cni || !fichiers.domicile}
                  className="flex-1 py-3 bg-[#009A44] text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-green-700 transition-colors text-sm">
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Paiement ── */}
          {etape === 3 && (
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
                    ["Adresse", form.adresse || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-400">{k}</span>
                      <span className="font-medium text-[#0A2540] text-right max-w-[200px]">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Taxe communale</span>
                  <span className="text-xl font-extrabold text-[#009A44]">{docChoisi?.prix} FCFA</span>
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
                  <label className={labelCls}>Numéro {paiement === "wave" ? "Wave" : paiement === "orange" ? "Orange Money" : "MTN MoMo"}</label>
                  <input defaultValue={form.telephone} className={inputCls} placeholder="07 XX XX XX XX" />
                  <p className="text-xs text-gray-400 mt-1.5">Vous recevrez une demande de paiement sur ce numéro</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setEtape(2)} className="px-5 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                  <ArrowLeft size={14} /> Retour
                </button>
                <button onClick={() => setEtape(4)}
                  className="flex-1 py-3 bg-[#F77F00] text-white font-bold rounded-xl hover:bg-orange-600 transition-colors text-sm">
                  Payer {docChoisi?.prix} FCFA via {paiement === "wave" ? "Wave" : paiement === "orange" ? "Orange Money" : paiement === "mtn" ? "MTN" : "Carte"} →
                </button>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 4 : QR Code ── */}
          {etape === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-[#0A2540] mb-1">Dossier enregistré !</h2>
              <p className="text-sm text-gray-400 mb-6">Paiement confirmé · Présentez ce QR code au guichet</p>

              <div className="flex justify-center mb-4">
                <QRCodeDisplay reference={reference} />
              </div>
              <div className="font-mono text-sm text-gray-500 mb-1">{reference}</div>
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                ⏳ En attente validation au guichet
              </div>

              {/* Récapitulatif final */}
              <div className="bg-[#F0F2F5] rounded-xl p-4 text-left mb-5">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Votre dossier</div>
                <div className="space-y-1.5">
                  {[
                    ["Document", docChoisi?.label],
                    ["Mairie", mairie],
                    ["Demandeur", `${form.nom} ${form.prenom}`],
                    ["Paiement", `${paiement === "wave" ? "Wave" : paiement === "orange" ? "Orange Money" : "MTN"} · ${docChoisi?.prix} FCFA ✅`],
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
                <button className="w-full py-3 bg-[#0A2540] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2">
                  <QrCode size={16} /> Télécharger le QR Code
                </button>
                <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  📲 Envoyer par WhatsApp
                </button>
                <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  📧 Recevoir par email
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-5">
                Vous serez notifié par SMS au <strong>{form.telephone || "07 XX XX XX XX"}</strong> quand votre document sera prêt.
              </p>
            </div>
          )}
        </div>

        {/* Info bas de page */}
        {etape < 4 && (
          <div className="mt-4 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
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
