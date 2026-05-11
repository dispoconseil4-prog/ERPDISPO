"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Modal, Select, Table, Td, Th } from "@/components/ui";
import type { PlanComptable, Societe } from "@/lib/types";
import { Plus, Search } from "lucide-react";

export default function PlanComptablePage() {
  const [comptes, setComptes] = useState<PlanComptable[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({ numero: "", intitule: "", niveau: 0, taux_tva: "" });

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    fetch(`/api/plan-comptable?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setComptes(d); });
  }, [societeId]);

  const filtered = comptes.filter((c) => c.numero.includes(search) || c.intitule.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { societe_id: societeId, ...form, taux_tva: form.taux_tva ? parseFloat(form.taux_tva) : null };
    const res = await fetch("/api/plan-comptable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const c = await res.json();
      setComptes((prev) => [...prev, c]);
      setOpen(false);
      setForm({ numero: "", intitule: "", niveau: 0, taux_tva: "" });
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setMsg("");
    const res = await fetch("/api/plan-comptable/importer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ societe_id: societeId }) });
    const data = await res.json();
    if (res.ok) {
      setMsg(`${data.inserted} comptes PCG importés avec succès`);
      fetch(`/api/plan-comptable?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setComptes(d); });
    } else {
      setMsg(data.error || "Erreur lors de l'import");
    }
    setImporting(false);
  };

  const getNiveauBadge = (n: number) => {
    const styles = ["bg-gray-100 text-gray-600", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700"];
    return styles[n] || styles[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan comptable</h1>
          <p className="text-sm text-gray-500 mt-1">Plan comptable de votre société</p>
        </div>
        <div className="flex gap-2">
          {societeId && !importing && <Button variant="outline" onClick={handleImport} disabled={importing}>Importer PCG Marocain</Button>}
          <Button onClick={() => setOpen(true)} disabled={!societeId} icon={<Plus className="h-4 w-4" />}>Nouveau compte</Button>
        </div>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-72"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}>
          <option value="">Sélectionner...</option>
          {societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}
        </Select></div>
        <div className="w-64"><Label>Rechercher</Label><Input placeholder="Numéro ou intitulé" value={search} onChange={(e) => setSearch(e.target.value)} icon={<Search className="h-4 w-4 text-gray-400" />} /></div>
      </div>

      {societeId && !importing && <p className="text-sm text-gray-500">{comptes.length} compte(s)</p>}
      {msg && <div className={`text-sm px-3 py-2 rounded-lg ${msg.includes("importés") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{msg}</div>}

      <Card className="table-container">
        <Table>
          <thead><tr><Th>Numéro</Th><Th>Intitulé</Th><Th>Niveau</Th><Th>TVA</Th><Th></Th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><Td colSpan={5} className="text-center text-gray-400 py-8">Aucun compte.</Td></tr>}
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <Td className="font-mono font-semibold text-blue-600">{c.numero}</Td>
                <Td className="font-medium">{c.intitule}</Td>
                <Td><span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${getNiveauBadge(c.niveau)}`}>N{c.niveau}</span></Td>
                <Td>{c.taux_tva ? `${c.taux_tva}%` : <span className="text-gray-300">—</span>}</Td>
                <Td><Button variant="ghost" size="sm">Modifier</Button></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau compte" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Numéro</Label><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} required /></div>
            <div><Label>Intitulé</Label><Input value={form.intitule} onChange={(e) => setForm({ ...form, intitule: e.target.value })} required /></div>
            <div><Label>Niveau</Label><Input type="number" value={form.niveau} onChange={(e) => setForm({ ...form, niveau: parseInt(e.target.value) || 0 })} /></div>
            <div><Label>Taux TVA (%)</Label><Input type="number" step="0.01" value={form.taux_tva} onChange={(e) => setForm({ ...form, taux_tva: e.target.value })} placeholder="Ex: 20" /></div>
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