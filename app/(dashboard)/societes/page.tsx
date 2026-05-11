"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Select, Table, Td, Th } from "@/components/ui";
import { Modal } from "@/components/modal";
import type { Societe } from "@/lib/types";
import { Building2, Plus } from "lucide-react";

export default function SocietesPage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ code: "", nom: "", ville: "", identifiant_fiscal: "", date_creation: "" });

  useEffect(() => { fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setSocietes(d); }); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/societes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!res.ok) { const err = await res.json(); setError(err.error || "Erreur"); return; }
    const s = await res.json();
    setSocietes((prev) => [...prev, s]);
    setOpen(false);
    setForm({ code: "", nom: "", ville: "", identifiant_fiscal: "", date_creation: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sociétés</h1>
          <p className="text-sm text-gray-500 mt-1">Gérez vos entités juridiques</p>
        </div>
        <Button onClick={() => setOpen(true)} icon={<Plus className="h-4 w-4" />}>Nouvelle société</Button>
      </div>

      <Card header={<span className="text-sm font-medium text-gray-500">{societes.length} société(s)</span>}>
        <Table>
          <thead><tr><Th>Code</Th><Th>Nom</Th><Th>Ville</Th><Th>Identifiant fiscal</Th><Th>Date création</Th><Th></Th></tr></thead>
          <tbody>
            {societes.length === 0 && <tr><Td colSpan={6} className="text-center text-gray-400 py-8">Aucune société. Cliquez sur "Nouvelle société" pour commencer.</Td></tr>}
            {societes.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <Td className="font-mono font-semibold text-blue-600">{s.code}</Td>
                <Td className="font-medium">{s.nom}</Td>
                <Td>{s.ville || "-"}</Td>
                <Td className="font-mono">{s.identifiant_fiscal || "-"}</Td>
                <Td>{s.date_creation ? new Date(s.date_creation).toLocaleDateString("fr-FR") : "-"}</Td>
                <Td><Button variant="ghost" size="sm">Modifier</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle société" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Code (3 car.)</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required maxLength={3} /></div>
            <div><Label>Nom *</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div>
            <div><Label>Ville</Label><Input value={form.ville} onChange={(e) => setForm({ ...form, ville: e.target.value })} /></div>
            <div><Label>Identifiant fiscal</Label><Input value={form.identifiant_fiscal} onChange={(e) => setForm({ ...form, identifiant_fiscal: e.target.value })} /></div>
            <div className="col-span-2"><Label>Date création *</Label><Input type="date" value={form.date_creation} onChange={(e) => setForm({ ...form, date_creation: e.target.value })} required /></div>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}