import { Card } from "@/components/ui";
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      <div className="grid grid-cols-4 gap-4">
        <Card><p className="text-sm text-gray-500">Écritures</p><p className="text-2xl font-bold">0</p></Card>
        <Card><p className="text-sm text-gray-500">Immobilisations</p><p className="text-2xl font-bold">0</p></Card>
        <Card><p className="text-sm text-gray-500">Déclarations TVA</p><p className="text-2xl font-bold">0</p></Card>
        <Card><p className="text-sm text-gray-500">Sociétés</p><p className="text-2xl font-bold">0</p></Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card><h2 className="mb-4 font-semibold">Dernières écritures</h2><p className="text-sm text-gray-400">Aucune écriture saisie.</p></Card>
        <Card><h2 className="mb-4 font-semibold">Immobilisations récentes</h2><p className="text-sm text-gray-400">Aucune immobilisation.</p></Card>
      </div>
    </div>
  );
}
