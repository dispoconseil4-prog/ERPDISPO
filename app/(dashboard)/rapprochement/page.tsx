"use client";
import { useEffect, useState } from "react";
import { Button, Card, Label, Modal, Select, Table, Td, Th, Badge } from "@/components/ui";
import type { Societe, Exercice } from "@/lib/types";
import { Plus, Landmark, CheckCircle2 } from "lucide-react";
import { formatDate, formatMontant } from "@/lib/utils";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function RapprochementPage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [societe, setSociete] = useState<any>(null);
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [exerciceId, setExerciceId] = useState("");
  const [rapprochements, setRapprochements] = useState<any[]>([]);
  const [openNew, setOpenNew] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ banque_id: "", mois: `${new Date().getMonth() + 1}` });

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    Promise.all([
      fetch(`/api/societes/${societeId}`).then((r) => r.json()),
      fetch(`/api/exercices?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/rapprochement?societe_id=${societeId}`).then((r) => r.json()),
    ]).then(([soc, ex, rap]) => { setSociete(soc); if (Array.isArray(ex)) setExercices(ex); if (Array.isArray(rap)) setRapprochements(rap); });
  }, [societeId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/rapprochement", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ societe_id: societeId, banque_id: form.banque_id, mois: parseInt(form.mois), exercice_id: exerciceId }) });
    if (res.ok) { const r = await res.json(); setRapprochements((prev) => [r, ...prev]); setOpenNew(false); }
  };

  const openDetailHandler = async (id: string) => {
    const res = await fetch(`/api/rapprochement/${id}`);
    if (res.ok) { const d = await res.json(); setDetail(d); setSelected(new Set()); setOpenDetail(true); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.has(id) ? new Set([...prev].filter(x => x !== id)) : new Set([...prev, id]));
  };

  const handleReconcilier = async () => {
    if (!detail || selected.size === 0) return;
    const res = await fetch(`/api/rapprochement/${detail.rapprochement.id}/reconcilier`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ligne_ids: Array.from(selected) }) });
    if (res.ok) openDetailHandler(detail.rapprochement.id);
  };

  const banques = societe?.banques_societe || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rapprochement bancaire</h1>
        <Button onClick={() => setOpenNew(true)} disabled={!societeId} icon={<Landmark className="h-4 w-4" />}>Nouveau rapprochement</Button>
      </div>

      <div className="w-72"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>

      <Card>
        <Table>
          <thead><tr><Th>Banque</Th><Th>Mois</Th><Th>Exercice</Th><Th></Th></tr></thead>
          <tbody>
            {rapprochements.length === 0 && <tr><Td colSpan={4} className="text-center text-gray-400 py-8">Aucun rapprochement.</Td></tr>}
            {rapprochements.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50"><Td className="font-medium">{r.banque?.nom || "-"}</Td><Td>{MOIS[r.mois - 1]}</Td><Td>{r.exercice_id?.slice(0, 8) || "-"}</Td><Td><Button variant="ghost" size="sm" onClick={() => openDetailHandler(r.id)}>Détail</Button></Td></tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={openNew} onClose={() => setOpenNew(false)} title="Nouveau rapprochement bancaire" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div><Label>Compte bancaire</Label><Select value={form.banque_id} onChange={(e) => setForm({ ...form, banque_id: e.target.value })} required><option value="">Sélectionner...</option>{banques.map((b: any) => <option key={b.id} value={b.id}>{b.nom} - {b.rib || ""}</option>)}</Select></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Mois</Label><Select value={form.mois} onChange={(e) => setForm({ ...form, mois: e.target.value })}>{MOIS.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}</Select></div><div><Label>Exercice</Label><Select value={exerciceId} onChange={(e) => setExerciceId(e.target.value)} required><option value="">--</option>{exercices.map((ex) => <option key={ex.id} value={ex.id}>{ex.annee}</option>)}</Select></div></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpenNew(false)}>Annuler</Button><Button type="submit">Créer</Button></div>
        </form>
      </Modal>

      <Modal open={openDetail} onClose={() => { setOpenDetail(false); setDetail(null); }} title={detail ? `Rapprochement ${detail.rapprochement.banque?.nom} - ${MOIS[detail.rapprochement.mois - 1]}` : ""} size="xl">
        {detail && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">Non rapprochés : <span className="font-semibold text-blue-700">{detail.non_rapprochees.length} écriture(s)</span> — Solde : <span className="font-semibold">{formatMontant(detail.solde)}</span></p>
              <Button onClick={handleReconcilier} disabled={selected.size === 0} icon={<CheckCircle2 className="h-4 w-4" />}>Rapprocher ({selected.size})</Button>
            </div>

            <h3 className="font-semibold text-gray-700">Écritures non rapprochées</h3>
            <div className="overflow-x-auto">
            <Table>
              <thead><tr><Th className="w-10"><input type="checkbox" onChange={(e) => { if (e.target.checked) setSelected(new Set(detail.non_rapprochees.map((l: any) => l.id))); else setSelected(new Set()); }} checked={selected.size === detail.non_rapprochees.length && detail.non_rapprochees.length > 0} /></Th><Th>Date</Th><Th>Pièce</Th><Th>Libellé</Th><Th className="text-right">Débit</Th><Th className="text-right">Crédit</Th></tr></thead>
              <tbody>
                {detail.non_rapprochees.length === 0 && <tr><Td colSpan={6} className="text-center text-gray-400 py-4">Toutes les écritures sont rapprochées. 🎉</Td></tr>}
                {detail.non_rapprochees.map((l: any) => (
                  <tr key={l.id} className={selected.has(l.id) ? "bg-blue-50" : "hover:bg-gray-50 transition-colors"}>
                    <Td><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></Td>
                    <Td>{formatDate(l.ecriture.date_ecriture)}</Td>
                    <Td className="font-mono">{l.ecriture.numero_piece}</Td>
                    <Td className="truncate max-w-xs">{l.libelle || l.ecriture.libelle || "-"}</Td>
                    <Td className="font-mono text-right tabular-nums">{l.debit > 0 ? formatMontant(l.debit) : ""}</Td>
                    <Td className="font-mono text-right tabular-nums">{l.credit > 0 ? formatMontant(l.credit) : ""}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </div>

            {detail.rapprochees.length > 0 && (
              <>
                <h3 className="font-semibold text-gray-700 mt-6">Écritures rapprochées ({detail.rapprochees.length})</h3>
                <div className="overflow-x-auto">
                <Table>
                  <thead><tr><Th>Date</Th><Th>Pièce</Th><Th>Libellé</Th><Th className="text-right">Débit</Th><Th className="text-right">Crédit</Th><Th>Date rapprochement</Th></tr></thead>
                  <tbody>
                    {detail.rapprochees.map((l: any) => (
                      <tr key={l.id} className="hover:bg-gray-50"><Td>{formatDate(l.ecriture.date_ecriture)}</Td><Td className="font-mono">{l.ecriture.numero_piece}</Td><Td className="truncate max-w-xs">{l.libelle || l.ecriture.libelle || "-"}</Td><Td className="font-mono text-right tabular-nums">{l.debit > 0 ? formatMontant(l.debit) : ""}</Td><Td className="font-mono text-right tabular-nums">{l.credit > 0 ? formatMontant(l.credit) : ""}</Td><Td>{l.date_rapprochement ? formatDate(l.date_rapprochement) : "-"}</Td></tr>
                    ))}
                  </tbody>
                </Table>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}