"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Modal, Select, Table, Td, Th } from "@/components/ui";
import type { Societe, Exercice } from "@/lib/types";
import { Plus, Calendar } from "lucide-react";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function ExercicesPage() {
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [form, setForm] = useState({ annee: now.getFullYear(), date_debut: `${now.getFullYear()}-01-01`, date_fin: `${now.getFullYear()}-12-31` });

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    fetch(`/api/exercices?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setExercices(d); });
  }, [societeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/exercices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, societe_id: societeId }) });
    if (res.ok) {
      const ex = await res.json();
      setExercices((prev) => [ex, ...prev]);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercices</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos exercices/comptables et fiscalité</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!societeId} icon={<Plus className="h-4 w-4" />}>Nouvel exercice</Button>
      </div>

      <div className="w-72">
        <Label>Société</Label>
        <Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}>
          <option value="">Sélectionner...</option>
          {societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}
        </Select>
      </div>

      <Card>
        <Table>
          <thead><tr><Th>Année</Th><Th>Date début</Th><Th>Date fin</Th><Th>Durée</Th><Th>Statut</Th><Th></Th></tr></thead>
          <tbody>
            {exercices.length === 0 && <tr><Td colSpan={6} className="text-center text-gray-400 py-8">Aucun exercice.</Td></tr>}
            {exercices.map((ex) => {
              const duree = Math.round(((new Date(ex.date_fin).getTime() - new Date(ex.date_debut).getTime()) / (1000 * 60 * 60 * 24) + 1) / 365.25);
              return (
                <tr key={ex.id} className="hover:bg-gray-50">
                  <Td className="font-mono font-semibold text-lg">{ex.annee}</Td>
                  <Td>{new Date(ex.date_debut).toLocaleDateString("fr-FR")}</Td>
                  <Td>{new Date(ex.date_fin).toLocaleDateString("fr-FR")}</Td>
                  <Td>{duree} an{duree > 1 ? "s" : ""}</Td>
                  <Td><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${ex.cloture ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{ex.cloture ? "Clôturé" : "Ouvert"}</span></Td>
                  <Td><Button variant="ghost" size="sm" onClick={() => {}}>Modifier</Button></Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvel exercice comptable" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)} required>
            {societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}
          </Select></div>
          <div><Label>Année</Label><Input type="number" value={form.annee} onChange={(e) => setForm({ ...form, annee: parseInt(e.target.value) || 0 })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date début</Label><Input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} required /></div>
            <div><Label>Date fin</Label><Input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} required /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit"><Calendar className="h-4 w-4 mr-1.5" />Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}