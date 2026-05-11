"use client";
import React, { useEffect, useState } from "react";
import { Button, Card, Input, Label, Select, Table, Td, Th, Badge } from "@/components/ui";
import type { Societe, Exercice, PlanComptable } from "@/lib/types";
import { Search } from "lucide-react";
import { formatDate, formatMontant } from "@/lib/utils";

export default function GrandLivrePage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [exerciceId, setExerciceId] = useState("");
  const [comptes, setComptes] = useState<PlanComptable[]>([]);
  const [compteId, setCompteId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    Promise.all([
      fetch(`/api/exercices?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/plan-comptable?societe_id=${societeId}`).then((r) => r.json()),
    ]).then(([ex, pc]) => {
      if (Array.isArray(ex)) setExercices(ex);
      if (Array.isArray(pc)) setComptes(pc);
    });
  }, [societeId]);

  const handleSearch = async () => {
    if (!societeId || !exerciceId) return;
    setLoading(true);
    const params = new URLSearchParams({ societe_id: societeId, exercice_id: exerciceId });
    if (compteId) params.set("compte_id", compteId);
    const res = await fetch(`/api/rapports/grand-livre?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  const totalDebit = data?.comptes?.reduce((s: number, c: any) => s + c.total_debit, 0) || 0;
  const totalCredit = data?.comptes?.reduce((s: number, c: any) => s + c.total_credit, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Grand Livre</h1>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-60"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>
        <div className="w-36"><Label>Exercice</Label><Select value={exerciceId} onChange={(e) => setExerciceId(e.target.value)}><option value="">--</option>{exercices.map((ex) => <option key={ex.id} value={ex.id}>{ex.annee}</option>)}</Select></div>
        <div className="w-64"><Label>Compte (optionnel)</Label><Select value={compteId} onChange={(e) => setCompteId(e.target.value)}><option value="">Tous</option>{comptes.filter(c => c.niveau >= 2).map((c) => <option key={c.id} value={c.id}>{c.numero} - {c.intitule}</option>)}</Select></div>
        <Button onClick={handleSearch} disabled={loading} icon={<Search className="h-4 w-4" />}>{loading ? "Chargement..." : "Afficher"}</Button>
      </div>

      {data && (
        <>
          <Card>
            <div className="overflow-x-auto">
            <Table>
              <thead><tr><Th>Compte</Th><Th>Libellé</Th><Th>Date</Th><Th>Pièce</Th><Th>Journal</Th><Th>Libellé écriture</Th><Th className="text-right">Débit</Th><Th className="text-right">Crédit</Th><Th className="text-right">Solde</Th></tr></thead>
              <tbody>
                {data.comptes.map((c: any) => (
                  <React.Fragment key={c.compte_id}>
                    <tr className="bg-gray-50 font-semibold">
                      <Td colSpan={2} className="text-blue-700">{c.compte.numero} - {c.compte.intitule}</Td>
                      <Td colSpan={5}></Td>
                      <Td className="text-right">{formatMontant(c.total_debit)}</Td>
                      <Td className="text-right">{formatMontant(c.total_credit)}</Td>
                      <Td className="text-right">{formatMontant(c.solde)}</Td>
                    </tr>
                    {c.lignes.map((l: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50"><Td colSpan={2}></Td><Td>{formatDate(l.ecriture.date_ecriture)}</Td><Td className="font-mono">{l.ecriture.numero_piece}</Td><Td><Badge variant="purple">{l.ecriture.journal?.code}</Badge></Td><Td className="truncate max-w-xs">{l.libelle || l.ecriture.libelle || "-"}</Td><Td className="font-mono text-right">{l.debit > 0 ? formatMontant(l.debit) : ""}</Td><Td className="font-mono text-right">{l.credit > 0 ? formatMontant(l.credit) : ""}</Td><Td className={`font-mono text-right ${l.solde < 0 ? "text-red-600" : ""}`}>{formatMontant(l.solde)}</Td></tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 font-semibold"><Td colSpan={6}>TOTAUX</Td><Td className="text-right">{formatMontant(totalDebit)}</Td><Td className="text-right">{formatMontant(totalCredit)}</Td><Td className="text-right">{formatMontant(totalDebit - totalCredit)}</Td></tr></tfoot>
            </Table>
            </div>
          </Card>
        </>
      )}
      {!data && <div className="text-center py-16 text-gray-400 text-lg">Sélectionnez une société et un exercice pour afficher le grand livre.</div>}
    </div>
  );
}