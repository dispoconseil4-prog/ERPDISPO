"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Select, Table, Td, Th, Badge } from "@/components/ui";
import { Modal } from "@/components/modal";
import type { Societe, Exercice, PlanComptable } from "@/lib/types";
import { Plus, CheckCircle2 } from "lucide-react";
import { formatDate, formatMontant } from "@/lib/utils";

const MOIS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function LettragePage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [comptesSolde, setComptesSolde] = useState<any[]>([]);
  const [compteId, setCompteId] = useState("");
  const [lignes, setLignes] = useState<any[]>([]);
  const [solde, setSolde] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [lettrages, setLettrages] = useState<any[]>([]);
  const [openLettrages, setOpenLettrages] = useState(false);

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    fetch(`/api/lettrage/comptes?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setComptesSolde(d); });
  }, [societeId]);

  useEffect(() => {
    if (!societeId || !compteId) { setLignes([]); setSolde(0); return; }
    fetch(`/api/lettrage/lignes?societe_id=${societeId}&compte_id=${compteId}`).then((r) => r.json()).then((d) => { if (d.lignes) { setLignes(d.lignes); setSolde(d.solde); } });
  }, [societeId, compteId]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.has(id) ? new Set([...prev].filter(x => x !== id)) : new Set([...prev, id]));
  };

  const handleLettrage = async () => {
    if (selected.size === 0) return;
    const res = await fetch("/api/lettrage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ societe_id: societeId, compte_id: compteId, ligne_ids: Array.from(selected) }) });
    if (res.ok) {
      setSelected(new Set());
      const fetchLignes = await fetch(`/api/lettrage/lignes?societe_id=${societeId}&compte_id=${compteId}`);
      const l = await fetchLignes.json();
      if (l.lignes) { setLignes(l.lignes); setSolde(l.solde); }
      const fetchComptes = await fetch(`/api/lettrage/comptes?societe_id=${societeId}`);
      const c = await fetchComptes.json();
      if (Array.isArray(c)) setComptesSolde(c);
    }
  };

  const selectedSolde = lignes.filter((l: any) => selected.has(l.id)).reduce((s: number, l: any) => s + l.debit - l.credit, 0);

  const openLettragesHandler = async () => {
    const res = await fetch(`/api/lettrage?societe_id=${societeId}${compteId ? `&compte_id=${compteId}` : ""}`);
    if (res.ok) { const d = await res.json(); if (Array.isArray(d)) setLettrages(d); }
    setOpenLettrages(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lettrage</h1>
        <Button variant="outline" onClick={openLettragesHandler} disabled={!societeId} icon={<CheckCircle2 className="h-4 w-4" />}>Lettrages effectués</Button>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-72"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>
        <div className="w-80"><Label>Compte à lettrer</Label><Select value={compteId} onChange={(e) => setCompteId(e.target.value)}><option value="">Sélectionner...</option>{comptesSolde.map((c) => <option key={c.compte.id} value={c.compte.id}>{c.compte.numero} - {c.compte.intitule}</option>)}</Select></div>
      </div>

      {compteId && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm text-gray-600">Solde : <span className="font-semibold text-xl text-blue-700">{((solde / 100) | 0) > 999 ? formatMontant(solde) : solde.toFixed(2)}</span> — {lignes.length} ligne(s) non lettrée(s)</p>
            <div className="flex gap-2 items-center">
              {selected.size > 0 && <span className="text-sm text-gray-500">Sélectionné : {formatMontant(selectedSolde)}</span>}
              <Button onClick={handleLettrage} disabled={selected.size === 0} icon={<CheckCircle2 className="h-4 w-4" />}>Lettrer ({selected.size})</Button>
            </div>
          </div>

          <Card>
            <div className="overflow-x-auto">
            <Table>
              <thead><tr><Th className="w-10"><input type="checkbox" onChange={(e) => { if (e.target.checked) setSelected(new Set(lignes.map((l: any) => l.id))); else setSelected(new Set()); }} checked={selected.size === lignes.length && lignes.length > 0} /></Th><Th>Date</Th><Th>Pièce</Th><Th>Libellé</Th><Th className="text-right">Débit</Th><Th className="text-right">Crédit</Th></tr></thead>
              <tbody>
                {lignes.length === 0 && <tr><Td colSpan={6} className="text-center text-gray-400 py-8">Aucune ligne à lettrer 🎉</Td></tr>}
                {lignes.map((l: any) => (
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
          </Card>
        </>
      )}

      <Modal open={openLettrages} onClose={() => { setOpenLettrages(false); }} title="Lettrages effectués" size="lg">
        <div className="space-y-4">
          {!compteId && <p className="text-gray-400">Sélectionnez un compte pour voir les lettrages.</p>}
          {compteId && (
            <Table>
              <thead><tr><Th>Lettre</Th><Th>Date</Th><Th className="text-right">Montant</Th><Th>Partiel</Th></tr></thead>
              <tbody>
                {lettrages.length === 0 && <tr><Td colSpan={4} className="text-center text-gray-400 py-4">Aucun lettrage.</Td></tr>}
                {lettrages.map((l: any) => (
                  <tr key={l.id} className="hover:bg-gray-50"><Td className="font-mono font-bold text-blue-600">{l.lettre}</Td><Td>{formatDate(l.date_lettrage)}</Td><Td className="font-mono text-right">{formatMontant(l.lignes?.reduce((s: number, lr: any) => s + lr.montant_lettre, 0) || 0)}</Td><Td>{l.partiel ? "Oui" : "Non"}</Td></tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </Modal>
    </div>
  );
}