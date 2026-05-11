"use client";
import { useEffect, useState } from "react";
import { Card, Button, Label, Select } from "@/components/ui";
import type { ParametrageCompta } from "@/lib/types";
export default function ParametragePage() {
  const [params, setParams] = useState<ParametrageCompta | null>(null);
  useEffect(() => { fetch("/api/parametrage?societe_id=demo").then((r) => r.json()).then((d) => { if (d && typeof d === 'object' && !Array.isArray(d)) setParams(d); }); }, []);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Paramétrage comptabilité</h1>
      <Card className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Libellé de la 2e ligne</Label>
            <Select defaultValue={params?.libelle_deuxieme_ligne || "manuel"}>
              <option value="manuel">Manuel</option>
              <option value="selon_plan">Selon plan comptable</option>
              <option value="repetition">Répéter le libellé</option>
              <option value="aucun">Ne pas affecter</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Validation à l'équilibre</Label>
            <Select defaultValue={params?.validation_piece_equilibre || "manuelle"}>
              <option value="automatique">Oui automatiquement</option>
              <option value="message">Avec message de confirmation</option>
              <option value="manuelle">Manuelle</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Saisie immobilisation</Label>
            <Select defaultValue={params?.saisie_immobilisation || "manuelle"}>
              <option value="automatique">Oui automatiquement</option>
              <option value="message">Avec message de confirmation</option>
              <option value="manuelle">Manuelle</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sorties immo. → compta</Label>
            <Select defaultValue={params?.integration_sorties_immobilisations || "manuelle"}>
              <option value="automatique">Automatique</option>
              <option value="manuelle">Manuelle</option>
              <option value="non">Non</option>
            </Select>
          </div>
        </div>
        <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" defaultChecked={params?.caisse_creditrice} className="h-4 w-4" /><span className="text-sm">Permettre à la caisse d'être créditrice</span></label>
        <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" defaultChecked={params?.integration_auto_dotations} className="h-4 w-4" /><span className="text-sm">Intégration auto. des dotations aux amortissements</span></label>
        <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" defaultChecked={params?.tva_saisie_manuelle_import_excel} className="h-4 w-4" /><span className="text-sm">TVA : saisie manuelle et import Excel</span></label>
        <label className="flex items-center gap-3 rounded-lg border p-3"><input type="checkbox" defaultChecked={params?.calcul_amortissement_par_mois} className="h-4 w-4" /><span className="text-sm">Calcul de l'amortissement par mois</span></label>
        <Button>Enregistrer les paramètres</Button>
      </Card>
    </div>
  );
}
