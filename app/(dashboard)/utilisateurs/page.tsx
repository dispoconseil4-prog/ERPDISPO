"use client";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Modal, Select, Table, Td, Th, Badge } from "@/components/ui";
import type { Utilisateur, Societe } from "@/lib/types";
import { Plus, Shield, Check, X } from "lucide-react";

export default function UtilisateursPage() {
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [societeId, setSocieteId] = useState("");
  const [open, setOpen] = useState(false);
  const [openDroits, setOpenDroits] = useState(false);
  const [currentUser, setCurrentUser] = useState<Utilisateur | null>(null);
  const [fenetres, setFenetres] = useState<any[]>([]);
  const [droits, setDroits] = useState<Record<string, any>>({});
  const [form, setForm] = useState({ login: "", nom: "", prenom: "", mot_de_passe: "", superviseur: false, actif: true });

  useEffect(() => {
    fetch("/api/societes").then((r) => r.json()).then((d) => { if (Array.isArray(d)) { setSocietes(d); if (d.length > 0) setSocieteId(d[0].id); } });
    fetch("/api/fenetres").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setFenetres(d); });
  }, []);

  useEffect(() => {
    if (!societeId) return;
    fetch(`/api/utilisateurs?societe_id=${societeId}`).then((r) => r.json()).then((d) => { if (Array.isArray(d)) setUsers(d); });
  }, [societeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/utilisateurs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, societe_id: societeId }) });
    if (res.ok) {
      const u = await res.json();
      setUsers((prev) => [...prev, u]);
      setOpen(false);
      setForm({ login: "", nom: "", prenom: "", mot_de_passe: "", superviseur: false, actif: true });
    }
  };

  const openDroitsHandler = async (u: Utilisateur) => {
    setCurrentUser(u);
    const res = await fetch(`/api/droits-acces?utilisateur_id=${u.id}`);
    if (res.ok) {
      const d = await res.json();
      const map: Record<string, any> = {};
      (Array.isArray(d) ? d : []).forEach((dr: any) => { map[dr.fenetre_id] = dr; });
      setDroits(map);
    }
    setOpenDroits(true);
  };

  const toggleDroit = async (fenetreId: string, champ: string) => {
    if (!currentUser) return;
    const existant = droits[fenetreId];
    const value = existant ? !(existant as any)[champ] : true;
    const res = await fetch("/api/droits-acces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ utilisateur_id: currentUser.id, fenetre_id: fenetreId, [champ]: value, ...(existant ? { id: existant.id } : {}) }) });
    if (res.ok) { const updated = await res.json(); setDroits((prev) => ({ ...prev, [fenetreId]: updated })); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1><p className="text-sm text-gray-500 mt-1">Gérez les accès et permissions</p></div>
        <Button onClick={() => setOpen(true)} disabled={!societeId} icon={<Plus className="h-4 w-4" />}>Nouvel utilisateur</Button>
      </div>

      <div className="w-72"><Label>Société</Label><Select value={societeId} onChange={(e) => setSocieteId(e.target.value)}><option value="">Sélectionner...</option>{societes.map((s) => <option key={s.id} value={s.id}>{s.code} - {s.nom}</option>)}</Select></div>

      <Card>
        <Table>
          <thead><tr><Th>Login</Th><Th>Nom</Th><Th>Prénom</Th><Th>Profil</Th><Th>Statut</Th><Th></Th></tr></thead>
          <tbody>
            {users.length === 0 && <tr><Td colSpan={6} className="text-center text-gray-400 py-8">Aucun utilisateur.</Td></tr>}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50"><Td className="font-mono font-semibold">{u.login}</Td><Td className="font-medium">{u.nom}</Td><Td>{u.prenom}</Td>
                <Td><Badge variant={u.superviseur ? "amber" : "gray"}>{u.superviseur ? <><Shield className="h-3 w-3 inline mr-1" />Superviseur</> : <><Check className="h-3 w-3 inline mr-1" />Utilisateur</>}</Badge></Td>
                <Td><Badge variant={u.actif ? "green" : "red"}>{u.actif ? "Actif" : "Inactif"}</Badge></Td>
                <Td><Button variant="ghost" size="sm" onClick={() => openDroitsHandler(u)}>Droits</Button></Td></tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Nouvel utilisateur" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div><Label>Login</Label><Input value={form.login} onChange={(e) => setForm({ ...form, login: e.target.value })} required /></div><div><Label>Nom</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required /></div></div>
          <div className="grid grid-cols-2 gap-4"><div><Label>Prénom</Label><Input value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} required /></div><div><Label>Mot de passe</Label><Input type="password" value={form.mot_de_passe} onChange={(e) => setForm({ ...form, mot_de_passe: e.target.value })} required /></div></div>
          <div className="flex items-center gap-6"><label className="flex items-center gap-2"><input type="checkbox" checked={form.superviseur} onChange={(e) => setForm({ ...form, superviseur: e.target.checked })} /><span className="text-sm">Superviseur</span></label><label className="flex items-center gap-2"><input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} /><span className="text-sm">Actif</span></label></div>
          <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button type="submit">Créer</Button></div>
        </form>
      </Modal>

      <Modal open={openDroits} onClose={() => { setOpenDroits(false); setCurrentUser(null); }} title={`Droits - ${currentUser?.prenom} ${currentUser?.nom}`} size="lg">
        <div className="overflow-x-auto">
        <Table>
          <thead><tr><Th>Module</Th><Th>Fenêtre</Th><Th className="text-center">Ajout</Th><Th className="text-center">Modif.</Th><Th className="text-center">Suppr.</Th><Th className="text-center">Impression</Th></tr></thead>
          <tbody>
            {fenetres.map((f) => {
              const d = droits[f.id];
              return (<tr key={f.id} className="hover:bg-gray-50"><Td><Badge variant="gray">{f.module?.code}</Badge></Td><Td className="font-medium">{f.nom}</Td>
                {["ajout", "modification", "suppression", "impression"].map((champ) => (
                  <Td key={champ} className="text-center"><input type="checkbox" checked={d?.[champ] ?? true} onChange={() => toggleDroit(f.id, champ)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></Td>
                ))}
              </tr>);
            })}
          </tbody>
        </Table>
        </div>
      </Modal>
    </div>
  );
}