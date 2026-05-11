"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Building2, BookOpen, FileText, Receipt, Calculator, Users, Settings, LogOut, Calendar, BarChart3, ScrollText, DollarSign, CheckCircle2, Landmark } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/societes", label: "Sociétés", icon: <Building2 className="h-4 w-4" /> },
    { href: "/exercices", label: "Exercices", icon: <Calendar className="h-4 w-4" /> },
    { href: "/plan-comptable", label: "Plan comptable", icon: <BookOpen className="h-4 w-4" /> },
    { href: "/journaux", label: "Journaux", icon: <FileText className="h-4 w-4" /> },
    { href: "/ecritures", label: "Écritures", icon: <Receipt className="h-4 w-4" /> },
    { href: "/immobilisations", label: "Immobilisations", icon: <Calculator className="h-4 w-4" /> },
    { href: "/tva", label: "TVA", icon: <Calculator className="h-4 w-4" /> },
    { href: "/rapports/grand-livre", label: "Grand Livre", icon: <ScrollText className="h-4 w-4" /> },
    { href: "/rapports/balance", label: "Balance", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/rapports/journal", label: "Journal", icon: <DollarSign className="h-4 w-4" /> },
    { href: "/lettrage", label: "Lettrage", icon: <CheckCircle2 className="h-4 w-4" /> },
    { href: "/rapprochement", label: "Rapprochement", icon: <Landmark className="h-4 w-4" /> },
    { href: "/utilisateurs", label: "Utilisateurs", icon: <Users className="h-4 w-4" /> },
    { href: "/parametrage", label: "Paramétrage", icon: <Settings className="h-4 w-4" /> },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="sidebar w-64 flex-shrink-0 hidden md:flex flex-col">
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <span className="logo-erp text-2xl font-bold tracking-tight">ERP-DISPO</span>
      </div>
      <div className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Navigation</div>
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            isActive(item.href)
              ? "bg-[#3B82F6] text-white shadow-sm"
              : "text-slate-400 hover:bg-white/5 hover:text-white"
          )}>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-700 p-3">
        <form action="/auth/action" method="POST">
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}