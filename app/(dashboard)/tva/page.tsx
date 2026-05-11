"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Modal, Select, Table, Td, Th, Badge } from "@/components/ui";
import type { DeclarationTVA, Societe, Exercice } from "@/lib/types";
import { Plus } from "lucide-react";
import { formatMontant } from "@/lib/utils";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function TVAPage() {
  const [declarations, setDeclarations] = useState<DeclarationTVA[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [exerciceId, setExerciceId] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [openDed, setOpenDed] = useState(false);
  const [openEnc, setOpenEnc] = useState(false);
  const [form, setForm] = useState({ mois: `${new Date().getMonth() + 1}`, penalite: "0" });
  const [dedForm, setDedForm] = useState({ fournisseur: "", ice: "", numero_facture: "", date_facture: "", montant_ht: "", montant_tva: "", tva_deductible: "" });
  const [encForm, setEncForm] = useState({ client: "", ice: "", numero_facture: "", date_facture: "", montant_ttc: "", montant_tva: "" });

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    Promise.all([
      fetch(`/api/exercices?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/tva?societe_id=${societeId}`).then((r) => r.json()),
    ]).then(([ex, tv]) => {
      if (Array.isArray(ex)) { setExercices(ex); if (ex.length > 0) setExerciceId(ex[0].id); }
      if (Array.isArray(tv)) setDeclarations(tv);
    });
  }, [societeId]);

  const handleNew = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tva", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ societe_id: societeId, exercice_id: exerciceId, mois: parseInt(form.mois), penalite: parseFloat(form.penalite) }) });
    if (res.ok) {
      const d = await res.json();
      setDeclarations((prev) => [d, ...prev]);
      setOpenNew(false);
      setForm({ mois: `${new Date().getMonth() + 1}`, penalite: "0" });
    }
  };

  const openDetailHandler = async (id: string) => {
    const res = await fetch(`/api/tva/${id}`);
    if (res.ok) { setDetail(await res.json()); setOpenDetail(true); }
  };

  const handleDeclaree = async (id: string, declaree: boolean) => {
    await fetch(`/api/tva/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ declaree, date_declaration: declaree ? new Date().toISOString().split("T")[0] : null }) });
    setDeclarations((prev) => prev.map((d) => d.id === id ? { ...d, declaree, date_declaration: declaree ? new Date().toISOString().split("T")[0] : undefined! } : d));
  };

  const addDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    const body = { fournisseur: dedForm.fournisseur, ice: dedForm.ice, numero_facture: dedForm.numero_facture, date_facture: dedForm.date_facture, montant_ht: parseFloat(dedForm.montant_ht), montant_tva: parseFloat(dedForm.montant_tva), tva_deductible: parseFloat(dedForm.tva_deductible || dedForm.montant_tva) };
    const res = await fetch(`/api/tva/${detail.declaration.id}/deductions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setOpenDed(false); setDedForm({ fournisseur: "", ice: "", numero_facture: "", date_facture: "", montant_ht: "", montant_tva: "", tva_deductible: "" }); openDetailHandler(detail.declaration.id); }
  };

  const addEncaissement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail) return;
    const body = { client: encForm.client, ice: encForm.ice, numero_facture: encForm.numero_facture, date_facture: encForm.date_facture, montant_ttc: parseFloat(encForm.montant_ttc), montant_tva: parseFloat(encForm.montant_tva) };
    const res = await fetch(`/api/tva/${detail.declaration.id}/encaissements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setOpenEnc(false); setEncForm({ client: "", ice: "", numero_facture: "", date_facture: "", montant_ttc: "", montant_tva: "" }); openDetailHandler(detail.declaration.id); }
  };

  const tvaCollectee = detail?.encaissements.reduce((s: number, e: any) => s + e.montant_tva, 0) || 0;
  const tvaDeductible = detail?.deductions.reduce((s: number, d: any) => s + d.tva_deductible, 0) || 0;
  const tvaDue = tvaCollectee - tvaDeductible;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Déclarations TVA</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion des déclarations de TVA</p>
        </div>
        <Button onClick={() => setOpenNew(true)} disabled={!societeId} icon={<Plus className="h-4 w-4" />}>Nouvelle déclaration</Button>
      </div>

      <div className="flex gap-4">
        <div className="w-72"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>
        <div className="w-44"><Label>Exercice</Label><Select value={exerciceId} onChange={(e) => setExerciceId(e.target.value)}>{exercices.map((ex) => <option key={ex.id} value={ex.id}>{ex.annee}</option>)}</Select></div>
      </div>

      <Card>
        <Table>
          <thead><tr><Th>Mois</Th><Th>Date déclaration</Th><Th>Pénalité</Th><Th>Statut</Th><Th></Th></tr></thead>
          <tbody>
            {declarations.length === 0 && <tr><Td colSpan={5} className="text-center text-gray-400 py-8">Aucune déclaration.</Td></tr>}
            {declarations.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <Td className="font-medium">{MOIS[d.mois - 1]}</Td>
                <Td>{d.date_declaration ? new Date(d.date_declaration).toLocaleDateString("fr-FR") : "-"}</Td>
                <Td>{d.penalite > 0 ? `${d.penalite} DH` : <span className="text-gray-300">—</span>}</Td>
                <Td><Badge variant={d.declaree ? "green" : "amber"}>{d.declaree ? "Déclarée" : "En cours"}</Badge></Td>
                <Td className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openDetailHandler(d.id)}>Détail</Button>
                  {!d.declaree && <Button variant="success" size="sm" onClick={() => handleDeclaree(d.id, true)}>Valider</Button>}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Nouvelle déclaration TVA" size="md">
        <form onSubmit={handleNew} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Mois</Label><Select value={form.mois} onChange={(e) => setForm({ ...form, mois: e.target.value })}>{MOIS.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}</Select></div>
            <div><Label>Exercice</Label><Select value={exerciceId} onChange={(e) => setExerciceId(e.target.value)} required>{exercices.map((ex) => <option key={ex.id} value={ex.id}>{ex.annee}</option>)}</Select></div>
          </div>
          <div><Label>Pénalité (DH)</Label><Input type="number" step="0.01" value={form.penalite} onChange={(e) => setForm({ ...form, penalite: e.target.value })} /></div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpenNew(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal open={openDetail} onClose={() => { setOpenDetail(false); setDetail(null); }} title={detail ? `${MOIS[detail.declaration.mois - 1]} ${detail.declaration.date_declaration ? new Date(detail.declaration.date_declaration).getFullYear() : ""}` : ""} size="xl">
        {detail && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card header={<span className="text-sm font-semibold text-gray-600">TVA collectée</span>} className="bg-emerald-50 border-emerald-100"><p className="text-2xl font-bold text-emerald-700">{detail.encaissements.reduce((s: number, e: any) => s + e.montant_tva, 0).toLocaleString()} DH</p></Card>
              <Card header={<span className="text-sm font-semibold text-gray-600">TVA déductible</span>} className="bg-blue-50 border-blue-100"><p className="text-2xl font-bold text-blue-700">{detail.deductions.reduce((s: number, d: any) => s + d.tva_deductible, 0).toLocaleString()} DH</p></Card>
              <Card header={<span className="text-sm font-semibold text-gray-600">TVA due</span>} className={`${tvaDue >= 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}>
                <p className={`text-2xl font-bold ${tvaDue >= 0 ? "text-red-700" : "text-emerald-700"}`}>{tvaDue.toLocaleString()} DH</p>
              </Card>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-gray-700">Factures fournisseurs (déductions)</h3><Button variant="outline" size="sm" onClick={() => setOpenDed(true)}>+ Ajouter</Button></div>
              <Table>
                <thead><tr><Th>Fournisseur</Th><Th>Facture</Th><Th>Date</Th><Th className="text-right">HT</Th><Th className="text-right">TVA</Th></tr></thead>
                <tbody>
                  {detail.deductions.length === 0 && <tr><Td colSpan={5} className="text-center text-gray-400 py-4">Aucune facture.</Td></tr>}
                  {detail.deductions.map((f: any) => (
                    <tr key={f.id}><Td>{f.fournisseur || "-"}</Td><Td className="font-mono">{f.numero_facture || "-"}</Td><Td>{f.date_facture ? new Date(f.date_facture).toLocaleDateString("fr-FR") : "-"}</Td><Td className="font-mono text-right">{formatMontant(f.montant_ht)}</Td><Td className="font-mono text-right">{formatMontant(f.montant_tva)}</Td></tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2"><h3 className="font-semibold text-gray-700">Factures clients (encaissements)</h3><Button variant="outline" size="sm" onClick={() => setOpenEnc(true)}>+ Ajouter</Button></div>
              <Table>
                <thead><tr><Th>Client</Th><Th>Facture</Th><Th>Date</Th><Th className="text-right">TTC</Th><Th className="text-right">TVA</Th></tr></thead>
                <tbody>
                  {detail.encaissements.length === 0 && <tr><Td colSpan={5} className="text-center text-gray-400 py-4">Aucune facture.</Td></tr>}
                  {detail.encaissements.map((f: any) => (
                    <tr key={f.id}><Td>{f.client || "-"}</Td><Td className="font-mono">{f.numero_facture || "-"}</Td><Td>{f.date_facture ? new Date(f.date_facture).toLocaleDateString("fr-FR") : "-"}</Td><Td className="font-mono text-right">{formatMontant(f.montant_ttc)}</Td><Td className="font-mono text-right">{formatMontant(f.montant_tva)}</Td></tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={openDed} onClose={() => setOpenDed(false)} title="Facture fournisseur" size="md">
        <form onSubmit={addDeduction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><Label>Fournisseur</Label><Input value={dedForm.fournisseur} onChange={(e) => setDedForm({ ...dedForm, fournisseur: e.target.value })} /></div><div><Label>ICE</Label><Input value={dedForm.ice} onChange={(e) => setDedForm({ ...dedForm, ice: e.target.value })} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>N° facture</Label><Input value={dedForm.numero_facture} onChange={(e) => setDedForm({ ...dedForm, numero_facture: e.target.value })} /></div><div><Label>Date</Label><Input type="date" value={dedForm.date_facture} onChange={(e) => setDedForm({ ...dedForm, date_facture: e.target.value })} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Montant HT</Label><Input type="number" step="0.01" value={dedForm.montant_ht} onChange={(e) => setDedForm({ ...dedForm, montant_ht: e.target.value })} required /></div><div><Label>Montant TVA</Label><Input type="number" step="0.01" value={dedForm.montant_tva} onChange={(e) => setDedForm({ ...dedForm, montant_tva: e.target.value })} required /></div></div>
          <div><Label>TVA déductible</Label><Input type="number" step="0.01" value={dedForm.tva_deductible} onChange={(e) => setDedForm({ ...dedForm, tva_deductible: e.target.value })} placeholder="Par défaut = TVA" /></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpenDed(false)}>Annuler</Button><Button type="submit">Ajouter</Button></div>
        </form>
      </Modal>

      <Modal open={openEnc} onClose={() => setOpenEnc(false)} title="Facture client" size="md">
        <form onSubmit={addEncaissement} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><Label>Client</Label><Input value={encForm.client} onChange={(e) => setEncForm({ ...encForm, client: e.target.value })} /></div><div><Label>ICE</Label><Input value={encForm.ice} onChange={(e) => setEncForm({ ...encForm, ice: e.target.value })} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>N° facture</Label><Input value={encForm.numero_facture} onChange={(e) => setEncForm({ ...encForm, numero_facture: e.target.value })} /></div><div><Label>Date</Label><Input type="date" value={encForm.date_facture} onChange={(e) => setEncForm({ ...encForm, date_facture: e.target.value })} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Montant TTC</Label><Input type="number" step="0.01" value={encForm.montant_ttc} onChange={(e) => setEncForm({ ...encForm, montant_ttc: e.target.value })} required /></div><div><Label>Montant TVA</Label><Input type="number" step="0.01" value={encForm.montant_tva} onChange={(e) => setEncForm({ ...encForm, montant_tva: e.target.value })} required /></div></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpenEnc(false)}>Annuler</Button><Button type="submit">Ajouter</Button></div>
        </form>
      </Modal>
    </div>
  );
}