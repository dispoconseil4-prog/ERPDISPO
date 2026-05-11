"use client";
import { useEffect, useState } from "react";
import { Button, Card, StatCard } from "@/components/ui";
import { LayoutDashboard, Building2, FileText, Calculator, DollarSign, AlertCircle, CheckCircle2, BarChart2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ societes: 0, exercices: 0, ecritures: 0, immobilisations: 0, tvaDue: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/societes").then((r) => r.json()),
      fetch("/api/exercices?societe_id=all").then((r) => r.json()),
      fetch("/api/ecritures?societe_id=all").then((r) => r.json()),
      fetch("/api/immobilisations?societe_id=all").then((r) => r.json()),
    ]).then(([soc, ex, ec, im]) => {
      setStats({
        societes: Array.isArray(soc) ? soc.length : 0,
        exercices: Array.isArray(ex) ? ex.length : 0,
        ecritures: Array.isArray(ec) ? ec.length : 0,
        immobilisations: Array.isArray(im) ? im.length : 0,
        tvaDue: 1250, // placeholder
      });
    });
  }, []);

  const recentItems = [
    { title: "Société DISPO CONSEIL ajoutée", desc: "Il y a 2 jours", icon: <Building2 className="h-4 w-4" /> },
    { title: "Exercice 2025 créé", desc: "Il y a 1 jour", icon: <FileText className="h-4 w-4" /> },
    { title: "Écriture #1001 enregistrée", desc: "Il y a 3 heures", icon: <Calculator className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">Vue d'ensemble de votre activité comptable</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = "/societes"}>Gérer les sociétés</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sociétés"
          value={stats.societes}
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="Exercices"
          value={stats.exercices}
          icon={<CalendarIcon className="h-5 w-5 text-emerald-600" />}
          color="green"
        />
        <StatCard
          title="Écritures"
          value={stats.ecritures}
          icon={<FileText className="h-5 w-5 text-violet-600" />}
          color="purple"
        />
        <StatCard
          title="Immobilisations"
          value={stats.immobilisations}
          icon={<Calculator className="h-5 w-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          title="TVA due"
          value={`${stats.tvaDue} DH`}
          icon={<DollarSign className="h-5 w-5 text-red-600" />}
          color="red"
          trend="neutral"
        />
        <StatCard
          title="Comptes rapprochés"
          value="85%"
          icon={<BarChart2 className="h-5 w-5 text-blue-600" />}
          color="blue"
          change="+5% ce mois"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card header={<h3 className="text-sm font-semibold text-gray-700">Activités récentes</h3>}>
          <div className="space-y-4">
            {recentItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="rounded-full bg-blue-50 p-2 text-blue-600">{item.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<h3 className="text-sm font-semibold text-gray-700">Actions rapides</h3>}>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Nouvelle écriture", href: "/ecritures", icon: <FileText className="h-5 w-5" /> },
              { label: "Nouveau journal", href: "/journaux", icon: <Calculator className="h-5 w-5" /> },
              { label: "Ajouter un compte", href: "/plan-comptable", icon: <BarChart2 className="h-5 w-5" /> },
              { label: "Déclaration TVA", href: "/tva", icon: <DollarSign className="h-5 w-5" /> },
            ].map((action) => (
              <a key={action.label} href={action.href} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#2563EB] hover:bg-[#EFF6FF] transition-all group">
                <span className="text-[#2563EB]">{action.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-[#2563EB]">{action.label}</span>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
}