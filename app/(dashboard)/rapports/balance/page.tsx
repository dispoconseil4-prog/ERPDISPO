"use client";
import { useEffect, useState } from "react";
import { Button, Card, Label, Select, Table, Td, Th } from "@/components/ui";
import type { Societe, Exercice } from "@/lib/types";
import { formatMontant } from "@/lib/utils";

export default function BalancePage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [exerciceId, setExerciceId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    fetch(`/api/exercices?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setExercices(d); });
  }, [societeId]);

  const handleSearch = async () => {
    if (!societeId || !exerciceId) return;
    setLoading(true);
    const res = await fetch(`/api/rapports/balance?societe_id=${societeId}&exercice_id=${exerciceId}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Balance</h1>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-60"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>
        <div className="w-36"><Label>Exercice</Label><Select value={exerciceId} onChange={(e) => setExerciceId(e.target.value)}><option value="">--</option>{exercices.map((ex) => <option key={ex.id} value={ex.id}>{ex.annee}</option>)}</Select></div>
        <Button onClick={handleSearch} disabled={loading}>Afficher</Button>
      </div>

      {data && (
        <Card>
          <div className="overflow-x-auto">
          <Table>
            <thead><tr><Th>Compte</Th><Th>Intitulé</Th><Th className="text-right">Débit</Th><Th className="text-right">Crédit</Th><Th className="text-right">Solde</Th></tr></thead>
            <tbody>
              {data.comptes.map((c: any) => (
                <tr key={c.compte.id} className="hover:bg-gray-50">
                  <Td className="font-mono text-blue-600">{c.compte.numero}</Td>
                  <Td className="font-medium">{c.compte.intitule}</Td>
                  <Td className="font-mono text-right">{formatMontant(c.total_debit)}</Td>
                  <Td className="font-mono text-right">{formatMontant(c.total_credit)}</Td>
                  <Td className={`font-mono font-semibold text-right ${c.solde < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatMontant(c.solde)}</Td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="border-t-2 border-gray-300 font-semibold"><Td colSpan={2}>TOTAUX</Td><Td className="text-right">{formatMontant(data.total_debit)}</Td><Td className="text-right">{formatMontant(data.total_credit)}</Td><Td className="text-right">{formatMontant(data.total_solde)}</Td></tr></tfoot>
          </Table>
          </div>
        </Card>
      )}
      {!data && <div className="text-center py-16 text-gray-400 text-lg">Sélectionnez une société et un exercice pour afficher la balance.</div>}
    </div>
  );
}