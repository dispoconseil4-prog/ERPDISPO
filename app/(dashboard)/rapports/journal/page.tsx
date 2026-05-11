"use client";
import { useEffect, useState } from "react";
import { Button, Card, Label, Select, Table, Td, Th, Badge } from "@/components/ui";
import type { Societe, Exercice } from "@/lib/types";
import { formatDate, formatMontant } from "@/lib/utils";

export default function JournalPage() {
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [exerciceId, setExerciceId] = useState("");
  const [journaux, setJournaux] = useState<any[]>([]);
  const [journalId, setJournalId] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    Promise.all([
      fetch(`/api/exercices?societe_id=${societeId}`).then((r) => r.json()),
      fetch(`/api/journaux?societe_id=${societeId}`).then((r) => r.json()),
    ]).then(([ex, jn]) => {
      if (Array.isArray(ex)) setExercices(ex);
      if (Array.isArray(jn)) setJournaux(jn);
    });
  }, [societeId]);

  const handleSearch = async () => {
    if (!societeId || !exerciceId) return;
    setLoading(true);
    const params = new URLSearchParams({ societe_id: societeId, exercice_id: exerciceId });
    if (journalId) params.set("journal_id", journalId);
    const res = await fetch(`/api/rapports/journal?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
      </div>

      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-60"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>
        <div className="w-36"><Label>Exercice</Label><Select value={exerciceId} onChange={(e) => setExerciceId(e.target.value)}><option value="">--</option>{exercices.map((ex) => <option key={ex.id} value={ex.id}>{ex.annee}</option>)}</Select></div>
        <div className="w-64"><Label>Journal</Label><Select value={journalId} onChange={(e) => setJournalId(e.target.value)}><option value="">Tous</option>{journaux.map((j) => <option key={j.id} value={j.id}>{j.code} - {j.intitule}</option>)}</Select></div>
        <Button onClick={handleSearch} disabled={loading}>Afficher</Button>
      </div>

      {data && (
        <div className="space-y-6">
          {data.ecritures.map((e: any) => (
            <Card key={e.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{formatDate(e.date_ecriture)}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <Badge variant="purple">{e.journal?.code}</Badge>
                  <span className="ml-2 font-mono">{e.numero_piece}</span>
                </div>
                {e.libelle && <span className="text-sm text-gray-500">{e.libelle}</span>}
              </div>
              <Table>
                <thead><tr><Th>Compte</Th><Th>Libellé</Th><Th className="text-right">Débit</Th><Th className="text-right">Crédit</Th></tr></thead>
                <tbody>
                  {e.lignes.map((l: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50"><Td className="font-mono text-blue-600">{l.compte?.numero}</Td><Td>{l.compte?.intitule}</Td><Td className="font-mono text-right">{l.debit > 0 ? formatMontant(l.debit) : "-"}</Td><Td className="font-mono text-right">{l.credit > 0 ? formatMontant(l.credit) : "-"}</Td></tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ))}
          <Card className="p-4">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Total Débit</span>
              <span className="font-semibold text-gray-900">{formatMontant(data.total_debit)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-semibold text-gray-700">Total Crédit</span>
              <span className="font-semibold text-gray-900">{formatMontant(data.total_credit)}</span>
            </div>
          </Card>
        </div>
      )}
      {!data && <div className="text-center py-16 text-gray-400 text-lg">Sélectionnez une société et un exercice pour afficher le journal.</div>}
    </div>
  );
}