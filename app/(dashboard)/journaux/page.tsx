"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Modal, Select, Table, Td, Th } from "@/components/ui";
import type { Journal, TypeJournal } from "@/lib/types";
import { Plus } from "lucide-react";

export default function JournauxPage() {
  const [journaux, setJournaux] = useState<Journal[]>([]);
  const [typesJournal, setTypesJournal] = useState<TypeJournal[]>([]);
  const [societes, setSocietes] = useState<any[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: "", intitule: "", type_journal_id: "", nature: "" });

  const fetchJournaux = async () => {
    const [jRes, tjRes, sRes] = await Promise.all([
      fetch(`/api/journaux?societe_id=${societeId}`).then((r) => r.json()),
      fetch("/api/types-journal").then((r) => r.json()),
      fetch("/api/societes").then((r) => r.json()),
    ]);
    if (Array.isArray(jRes)) setJournaux(jRes);
    if (Array.isArray(tjRes)) setTypesJournal(tjRes);
    if (Array.isArray(sRes)) { setSocietes(sRes); if (!societeId && sRes.length) setSocieteId(sRes[0].id); }
  };

  useEffect(() => { fetchJournaux(); }, []);
  useEffect(() => {
    if (societeId) fetch(`/api/journaux?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setJournaux(d); });
  }, [societeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/journaux", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, societe_id: societeId }) });
    if (res.ok) {
      const j = await res.json();
      setJournaux((prev) => [...prev, j]);
      setOpen(false);
      setForm({ code: "", intitule: "", type_journal_id: "", nature: "" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journaux</h1>
          <p className="text-sm text-gray-500 mt-1">Liste des journaux comptables</p>
        </div>
        <Button onClick={() => setOpen(true)} disabled={!societeId} icon={<Plus className="h-4 w-4" />}>Nouveau journal</Button>
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
          <thead><tr><Th>Code</Th><Th>Intitulé</Th><Th>Type</Th><Th>Nature</Th><Th></Th></tr></thead>
          <tbody>
            {journaux.length === 0 && <tr><Td colSpan={5} className="text-center text-gray-400 py-8">Aucun journal.</Td></tr>}
            {journaux.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <Td className="font-mono font-semibold">{j.code}</Td>
                <Td className="font-medium">{j.intitule}</Td>
                <Td><span className="bg-blue-100 text-blue-700 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold">{j.type_journal?.code}</span></Td>
                <Td>{j.nature || "—"}</Td>
                <Td><Button variant="ghost" size="sm">Modifier</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau journal" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required maxLength={5} /></div>
            <div><Label>Intitulé</Label><Input value={form.intitule} onChange={(e) => setForm({ ...form, intitule: e.target.value })} required /></div>
            <div><Label>Type de journal</Label>
              <Select value={form.type_journal_id} onChange={(e) => setForm({ ...form, type_journal_id: e.target.value })} required>
                <option value="">Sélectionner...</option>
                {typesJournal.map((tj) => <option key={tj.id} value={tj.id}>{tj.code} - {tj.nom}</option>)}
              </Select>
            </div>
            <div><Label>Nature</Label>
              <Select value={form.nature} onChange={(e) => setForm({ ...form, nature: e.target.value })}>
                <option value="">—</option>
                <option value="Achat">Achat</option>
                <option value="Vente">Vente</option>
                <option value="Trésorerie">Trésorerie</option>
                <option value="Divers">Divers</option>
              </Select>
            </div>
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