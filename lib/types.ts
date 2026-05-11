export interface Societe {
  id: string; code: string; nom: string; adresse?: string; ville?: string;
  tel?: string; email?: string; date_creation: string; logo_url?: string;
  identifiant_fiscal?: string; registre_commerce?: string; cnss?: string;
  activite?: string; forme_juridique?: string; regime_tva?: string;
  longueur_compte: number; premier_mois_exercice: number; created_at: string;
}
export interface Exercice {
  id: string; societe_id: string; annee: number;
  date_debut: string; date_fin: string; cloture: boolean;
}
export interface Utilisateur {
  id: string; societe_id: string; login: string; nom: string; prenom: string;
  superviseur: boolean; actif: boolean;
}
export interface PlanComptable {
  id: string; societe_id: string; numero: string; intitule: string;
  parent_id?: string; niveau: number; compte_tva_id?: string;
  taux_tva?: number; duree_amortissement?: number; actif: boolean;
}
export interface Journal {
  id: string; societe_id: string; type_journal_id: string;
  type_journal?: TypeJournal; code: string; intitule: string;
  compte_contrepartie_id?: string; nature?: string;
}
export interface TypeJournal { id: string; code: string; nom: string; }
export interface EcritureComptable {
  id: string; societe_id: string; exercice_id: string; journal_id: string;
  journal?: Journal; numero_piece: string; date_ecriture: string;
  mois: number; libelle?: string; validee: boolean;
  created_by?: string; lignes?: LigneEcriture[]; created_at: string;
}
export interface LigneEcriture {
  id: string; ecriture_id: string; compte_id: string; compte?: PlanComptable;
  libelle?: string; debit: number; credit: number; ligne: number;
  lettree: boolean; rapprochee: boolean; date_rapprochement?: string;
}
export interface Immobilisation {
  id: string; societe_id: string; designation: string;
  date_acquisition: string; date_mise_service?: string;
  montant_acquisition: number; duree_utilisation?: number;
  taux_amortissement?: number; compte_immobilisation_id?: string;
  valeur_residuelle: number; actif: boolean;
  dotations?: DotationAmortissement[];
}
export interface DotationAmortissement {
  id: string; immobilisation_id: string; exercice_id: string;
  annee: number; dotation_annuelle: number;
  cumul_amortissement: number; valeur_nette: number;
}
export interface DeclarationTVA {
  id: string; societe_id: string; exercice_id: string;
  mois: number; declaree: boolean; declaration_tardive: boolean;
  penalite: number; date_declaration?: string;
}
export interface TVAFactureDeduction {
  id: string; declaration_id: string; fournisseur?: string;
  ice?: string; date_facture?: string; numero_facture?: string;
  montant_ht: number; montant_tva: number;
  tva_deductible: number; importee: boolean;
}
export interface TVAFactureEncaissement {
  id: string; declaration_id: string; client?: string;
  ice?: string; date_facture?: string; numero_facture?: string;
  montant_ttc: number; montant_tva: number; encaisse: boolean;
}
export interface TVADetail {
  declaration: DeclarationTVA;
  deductions: TVAFactureDeduction[];
  encaissements: TVAFactureEncaissement[];
}
export interface Lettrage {
  id: string; societe_id: string; compte_id: string;
  date_lettrage: string; lettre: string; partiel: boolean;
  est_delettre: boolean; lignes?: LettrageLigne[];
  compte?: PlanComptable;
}
export interface LettrageLigne {
  id: string; lettrage_id: string; ligne_ecriture_id: string;
  montant_lettre: number;
}
export interface ParametrageCompta {
  id: string; societe_id: string; libelle_deuxieme_ligne: string;
  validation_piece_equilibre: string; saisie_immobilisation: string;
  saisie_encaissement_reglement: string; caisse_creditrice: boolean;
  integration_auto_dotations: boolean;
  integration_sorties_immobilisations: string;
  tva_saisie_manuelle_import_excel: boolean;
  calcul_amortissement_par_mois: boolean;
  lettrage_journal_ouverture: boolean;
}
