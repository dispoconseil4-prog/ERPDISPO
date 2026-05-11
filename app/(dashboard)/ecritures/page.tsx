"use client";
import { useEffect, useState, useMemo } from "react";
import { Button, Card, Input, Label, Modal, Select, Table, Td, Th, Badge } from "@/components/ui";
import type { EcritureComptable, PlanComptable, Societe, Exercice, Journal } from "@/lib/types";
import { formatDate, formatMontant } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function EcrituresPage() {
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [journaux, setJournaux] = useState<Journal[]>([]);
  const [comptes, setComptes] = useState<PlanComptable[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ exercice_id: "", journal_id: "", numero_piece: "", date_ecriture: "", libelle: "", compte_debit: "", compte_credit: "", montant: "" });

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    Promise.all([
      fetch(`/api/exercices?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/journaux?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/plan-comptable?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/ecritures?societe_id=${societeId}`).then((r) => r.json()),
    ]).then(([ex, jn, pc, ec]) => {
      if (Array.isArray(ex)) setExercices(ex);
      if (Array.isArray(jn)) setJournaux(jn);
      if (Array.isArray(pc)) setComptes(pc);
      if (Array.isArray(ec)) setEcritures(ec);
    });
  }, [societeId]);

  const exOuvert = useMemo(() => exercices.filter((ex) => !ex.cloture), [exercices]);
  const comptesUtil = useMemo(() => comptes.filter((c) => c.niveau >= 2), [comptes]);

  const totalDebit = (e: EcritureComptable) => (e.lignes?.reduce((s: number, l: any) => s + l.debit, 0) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseFloat(form.montant);
    const body = {
      societe_id: societeId,
      exercice_id: form.exercice_id,
      journal_id: form.journal_id,
      numero_piece: form.numero_piece,
      date_ecriture: form.date_ecriture,
      mois: new Date(form.date_ecriture).getMonth() + 1,
      libelle: form.libelle,
      validee: true,
      lignes: [
        { compte_id: form.compte_debit, debit: m, credit: 0, ligne: 1, libelle: form.libelle },
        { compte_id: form.compte_credit, debit: 0, credit: m, ligne: 2, libelle: form.libelle },
      ],
    };
    const res = await fetch("/api/ecritures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const ec = await res.json();
      fetch(`/api/ecritures?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setEcritures(d); });
      setOpen(false);
      setForm({ exercice_id: "", journal_id: "", numero_piece: "", date_ecriture: "", libelle: "", compte_debit: "", compte_credit: "", montant: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Écritures comptables</h1>
          <p className="text-sm text-gray-500 mt-1">Saisie et suivi des écritures</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!societeId} icon={<Plus className="h-4 w-4" />}>Nouvelle écriture</Button>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-56"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}>
          <option value="">Sélectionner...</option>
          {societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}
        </Select></div>
      </div>

      <Card>
        <div className="overflow-x-auto">
        <Table>
          <thead><tr><Th>Pièce</Th><Th>Date</Th><Th>Journal</Th><Th>Libellé</Th><Th className="text-right">Débit</Th><Th className="text-right">Crédit</Th><Th>Statut</Th></tr></thead>
          <tbody>
            {ecritures.length === 0 && <tr><Td colSpan={7} className="text-center text-gray-400 py-8">Aucune écriture.</Td></tr>}
            {ecritures.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <Td className="font-mono font-medium">{e.numero_piece}</Td>
                <Td>{formatDate(e.date_ecriture)}</Td>
                <Td><Badge variant="purple">{e.journal?.code}</Badge></Td>
                <Td className="max-w-xs truncate">{e.libelle || "-"}</Td>
                <Td className="font-mono">{formatMontant(totalDebit(e))}</Td>
                <Td className="font-mono">-</Td>
                <Td><Badge variant={e.validee ? "green" : "amber"}>{e.validee ? "Validée" : "Brouillon"}</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle écriture" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Exercice</Label><Select value={form.exercice_id} onChange={(e) => setForm({ ...form, exercice_id: e.target.value })} required>
              <option value="">Sélectionner...</option>
              {exOuvert.map((ex) => <option key={ex.id} value={ex.id}>{ex.annee}</option>)}
            </Select></div>
            <div><Label>Journal</Label><Select value={form.journal_id} onChange={(e) => setForm({ ...form, journal_id: e.target.value })} required>
              <option value="">Sélectionner...</option>
              {journaux.map((j) => <option key={j.id} value={j.id}>{j.code} - {j.intitule}</option>)}
            </Select></div>
            <div><Label>N° pièce</Label><Input value={form.numero_piece} onChange={(e) => setForm({ ...form, numero_piece: e.target.value })} required /></div>
            <div><Label>Date</Label><Input type="date" value={form.date_ecriture} onChange={(e) => setForm({ ...form, date_ecriture: e.target.value })} required /></div>
            <div className="col-span-2"><Label>Libellé</Label><Input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} /></div>
            <div><Label>Compte débit</Label><Select value={form.compte_debit} onChange={(e) => setForm({ ...form, compte_debit: e.target.value })} required>
              <option value="">Sélectionner...</option>
              {comptesUtil.map((c) => <option key={c.id} value={c.id}>{c.numero} - {c.intitule}</option>)}
            </Select></div>
            <div><Label>Compte crédit</Label><Select value={form.compte_credit} onChange={(e) => setForm({ ...form, compte_credit: e.target.value })} required>
              <option value="">Sélectionner...</option>
              {comptesUtil.map((c) => <option key={c.id} value={c.id}>{c.numero} - {c.intitule}</option>)}
            </Select></div>
            <div><Label>Montant</Label><Input type="number" step="0.01" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} required /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}