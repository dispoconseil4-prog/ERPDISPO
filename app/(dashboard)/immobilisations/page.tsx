"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Modal, Select, Table, Td, Th, Badge } from "@/components/ui";
import type { Immobilisation, PlanComptable, Societe } from "@/lib/types";
import { Plus } from "lucide-react";
import { formatDate, formatMontant } from "@/lib/utils";

export default function ImmobilisationsPage() {
  const [immos, setImmos] = useState<Immobilisation[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [comptes, setComptes] = useState<PlanComptable[]>([]);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({ designation: "", date_acquisition: "", date_mise_service: "", montant_acquisition: "", duree_utilisation: "", valeur_residuelle: "0", compte_immobilisation_id: "", compte_tva_id: "" });

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    Promise.all([
      fetch(`/api/immobilisations?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/plan-comptable?societe_id=${societeId}`).then((r) => r.json()),
    ]).then(([im, pc]) => {
      if (Array.isArray(im)) setImmos(im);
      if (Array.isArray(pc)) setComptes(pc);
    });
  }, [societeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      societe_id: societeId,
      designation: form.designation,
      date_acquisition: form.date_acquisition,
      date_mise_service: form.date_mise_service || null,
      montant_acquisition: parseFloat(form.montant_acquisition),
      duree_utilisation: form.duree_utilisation ? parseInt(form.duree_utilisation) : null,
      valeur_residuelle: parseFloat(form.valeur_residuelle) || 0,
      compte_immobilisation_id: form.compte_immobilisation_id || null,
      compte_tva_id: form.compte_tva_id || null,
    };
    const res = await fetch("/api/immobilisations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      const imm = await res.json();
      await fetch(`/api/immobilisations/${imm.id}/dotations`, { method: "POST" });
      fetch(`/api/immobilisations?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setImmos(d); });
      setOpen(false);
      setForm({ designation: "", date_acquisition: "", date_mise_service: "", montant_acquisition: "", duree_utilisation: "", valeur_residuelle: "0", compte_immobilisation_id: "", compte_tva_id: "" });
    }
  };

  const openDetailHandler = async (id: string) => {
    const res = await fetch(`/api/immobilisations/${id}`);
    if (res.ok) { setDetail(await res.json()); setOpenDetail(true); }
  };

  const generateDotations = async (id: string) => {
    setGenerating(true);
    await fetch(`/api/immobilisations/${id}/dotations`, { method: "POST" });
    openDetailHandler(id);
    fetch(`/api/immobilisations?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setImmos(d); });
    setGenerating(false);
  };

  const derniereDotation = (i: Immobilisation) => i.dotations?.[i.dotations.length - 1];
  const comptesImmo = comptes.filter((c) => c.niveau >= 2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Immobilisations</h1><p className="text-sm text-gray-500 mt-1">Gérez vos actifs et amortissements</p></div>
        <Button onClick={() => setOpen(true)} disabled={!societeId} icon={<Plus className="h-4 w-4" />}>Nouvelle immobilisation</Button>
      </div>

      <div className="w-72"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>

      <Card>
        <Table>
          <thead><tr><Th>Désignation</Th><Th>Date acquisition</Th><Th className="text-right">Montant</Th><Th>Taux</Th><Th className="text-right">VNC</Th><Th>Statut</Th><Th></Th></tr></thead>
          <tbody>
            {immos.length === 0 && <tr><Td colSpan={7} className="text-center text-gray-400 py-8">Aucune immobilisation.</Td></tr>}
            {immos.map((i) => {
              const d = derniereDotation(i);
              return (
                <tr key={i.id} className="hover:bg-gray-50">
                  <Td className="font-medium">{i.designation}</Td>
                  <Td>{formatDate(i.date_acquisition)}</Td>
                  <Td className="font-mono text-right">{formatMontant(i.montant_acquisition)}</Td>
                  <Td>{i.taux_amortissement ? `${i.taux_amortissement}%` : i.duree_utilisation ? `${(100 / i.duree_utilisation).toFixed(1)}%` : "-"}</Td>
                  <Td className="font-mono text-right">{d ? formatMontant(d.valeur_nette) : formatMontant(i.montant_acquisition)}</Td>
                  <Td><Badge variant={i.actif ? "green" : "red"}>{i.actif ? "En cours" : "Sortie"}</Badge></Td>
                  <Td><Button variant="ghost" size="sm" onClick={() => openDetailHandler(i.id)}>Détail</Button></Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle immobilisation" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label>Désignation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Date d'acquisition</Label><Input type="date" value={form.date_acquisition} onChange={(e) => setForm({ ...form, date_acquisition: e.target.value })} required /></div>
            <div><Label>Date mise en service</Label><Input type="date" value={form.date_mise_service} onChange={(e) => setForm({ ...form, date_mise_service: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Montant acquisition</Label><Input type="number" step="0.01" value={form.montant_acquisition} onChange={(e) => setForm({ ...form, montant_acquisition: e.target.value })} required /></div>
            <div><Label>Durée (ans)</Label><Input type="number" value={form.duree_utilisation} onChange={(e) => setForm({ ...form, duree_utilisation: e.target.value })} placeholder="Ex: 5, 10, 20" /></div>
            <div><Label>Valeur résiduelle</Label><Input type="number" step="0.01" value={form.valeur_residuelle} onChange={(e) => setForm({ ...form, valeur_residuelle: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Compte d'immobilisation</Label><Select value={form.compte_immobilisation_id} onChange={(e) => setForm({ ...form, compte_immobilisation_id: e.target.value })}><option value="">--</option>{comptesImmo.map((c) => <option key={c.id} value={c.id}>{c.numero} - {c.intitule}</option>)}</Select></div>
            <div><Label>Compte TVA</Label><Select value={form.compte_tva_id} onChange={(e) => setForm({ ...form, compte_tva_id: e.target.value })}><option value="">--</option>{comptesImmo.map((c) => <option key={c.id} value={c.id}>{c.numero} - {c.intitule}</option>)}</Select></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit">Créer</Button>
          </div>
        </form>
      </Modal>

      <Modal open={openDetail} onClose={() => { setOpenDetail(false); setDetail(null); }} title={detail?.designation || "Détail"} size="xl">
        {detail && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><span className="text-gray-500">Acquisition:</span> <span className="font-semibold">{formatDate(detail.date_acquisition)}</span></div>
              <div><span className="text-gray-500">Montant:</span> <span className="font-semibold">{formatMontant(detail.montant_acquisition)}</span></div>
              <div><span className="text-gray-500">Durée:</span> <span className="font-semibold">{detail.duree_utilisation || "-"} ans</span></div>
              <div><span className="text-gray-500">Taux:</span> <span className="font-semibold">{detail.taux_amortissement ? `${detail.taux_amortissement}%` : "-"}</span></div>
              <div><span className="text-gray-500">Valeur résiduelle:</span> <span className="font-semibold">{formatMontant(detail.valeur_residuelle)}</span></div>
              <div><span className="text-gray-500">Statut:</span> <Badge variant={detail.actif ? "green" : "red"}>{detail.actif ? "En cours" : "Sortie"}</Badge></div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Plan d'amortissement</h3>
              <Button variant="outline" size="sm" onClick={() => generateDotations(detail.id)} disabled={generating}>{generating ? "Génération..." : "Re-générer"}</Button>
            </div>

            <Table>
              <thead><tr><Th>Année</Th><Th>Exercice</Th><Th className="text-right">Annuité</Th><Th className="text-right">Cumul</Th><Th className="text-right">VNC</Th></tr></thead>
              <tbody>
                {(!detail.dotations || detail.dotations.length === 0) && <tr><Td colSpan={5} className="text-center text-gray-400 py-4">Aucune dotation. Cliquez "Re-générer".</Td></tr>}
                {detail.dotations?.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50"><Td className="font-medium">{d.annee}</Td><Td>{d.exercice?.annee || "-"}</Td><Td className="font-mono text-right">{formatMontant(d.dotation_annuelle)}</Td><Td className="font-mono text-right">{formatMontant(d.cumul_amortissement)}</Td><Td className="font-mono text-right">{formatMontant(d.valeur_nette)}</Td></tr>
                ))}
              </tbody>
              {detail.dotations?.length > 0 && (
                <tfoot><tr className="border-t-2 font-semibold"><Td colSpan={2}>Totaux</Td><Td className="text-right">{formatMontant(detail.dotations.reduce((s: number, d: any) => s + d.dotation_annuelle, 0))}</Td><Td className="text-right">{formatMontant(detail.dotations[detail.dotations.length - 1]?.cumul_amortissement)}</Td><Td className="text-right">{formatMontant(detail.dotations[detail.dotations.length - 1]?.valeur_nette)}</Td></tr></tfoot>
              )}
            </Table>
          </div>
        )}
      </Modal>
    </div>
  );
}