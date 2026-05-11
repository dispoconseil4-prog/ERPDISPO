-- ============================================================
-- Données de base ERP-DISPO — Contexte Marocain (PCG)
-- Exécuter dans Supabase SQL Editor
-- ============================================================

-- 1. TYPES DE JOURNAL ----------------------------------------
INSERT INTO types_journal (code, nom) VALUES
  ('BQ', 'Banque'), ('CA', 'Caisse'), ('AC', 'Achat'),
  ('VT', 'Vente'), ('OD', 'Opérations Diverses'),
  ('EAP', 'Effets à Payer'), ('EAR', 'Effets à Recevoir'),
  ('DA', 'Dotations aux Amortissements')
ON CONFLICT (code) DO NOTHING;

-- 2. TYPES DE SORTIE IMMOBILISATION --------------------------
INSERT INTO types_sortie_immobilisation (code, nom) VALUES
  ('CESSION', 'Cession'), ('RETRAIT', 'Retrait'), ('VIREMENT', 'Virement')
ON CONFLICT (code) DO NOTHING;

-- 3. MODULES -------------------------------------------------
INSERT INTO modules (code, nom) VALUES
  ('GRH', 'Gestion des Ressources Humaines'),
  ('FINANCE', 'Gestion Financière'),
  ('PARAM', 'Paramétrage')
ON CONFLICT (code) DO NOTHING;

-- 4. CLASSES COMPTABLES (PCG Marocain) ----------------------
INSERT INTO classes_comptables (code, nom) VALUES
  ('1', 'Classe 1 : Comptes de financement permanent'),
  ('2', 'Classe 2 : Comptes d''actif immobilisé'),
  ('3', 'Classe 3 : Comptes d''actif circulant (hors trésorerie)'),
  ('4', 'Classe 4 : Comptes de passif circulant (hors trésorerie)'),
  ('5', 'Classe 5 : Comptes de trésorerie'),
  ('6', 'Classe 6 : Comptes de charges'),
  ('7', 'Classe 7 : Comptes de produits'),
  ('8', 'Classe 8 : Comptes de résultats'),
  ('9', 'Classe 9 : Comptes de la comptabilité analytique')
ON CONFLICT (code) DO NOTHING;

-- 5. POSTES COMPTABLES (PCG Marocain) -----------------------
INSERT INTO postes_comptables (classe_id, code, nom)
SELECT id, code, nom FROM (VALUES
  -- Classe 1: Financement permanent
  ('1','111','Capital social'), ('1','112','Primes d''apport'),
  ('1','113','Réserves'), ('1','114','Report à nouveau'),
  ('1','115','Résultat net'), ('1','116','Subventions d''investissement'),
  ('1','117','Provisions réglementées'), ('1','118','Dettes de financement permanent'),
  -- Classe 2: Actif immobilisé
  ('2','211','Immobilisations corporelles'),
  ('2','212','Immobilisations incorporelles'),
  ('2','213','Immobilisations financières'),
  ('2','214','Amortissements et provisions'),
  -- Classe 3: Actif circulant (hors trésorerie)
  ('3','311','Stocks'), ('3','312','Créances clients'),
  ('3','313','Autres créances'), ('3','314','Titres et valeurs de placement'),
  ('3','315','Provisions'),
  -- Classe 4: Passif circulant (hors trésorerie)
  ('4','411','Dettes fournisseurs'), ('4','412','Dettes fiscales'),
  ('4','413','Dettes sociales'), ('4','414','Autres dettes'),
  ('4','415','Provisions'),
  -- Classe 5: Trésorerie
  ('5','511','Banque'), ('5','512','Caisse'),
  ('5','513','Chèques postaux'), ('5','514','Virements internes'),
  -- Classe 6: Charges
  ('6','611','Achats'), ('6','612','Charges externes'),
  ('6','613','Charges de personnel'), ('6','614','Impôts et taxes'),
  ('6','615','Charges financières'), ('6','616','Dotations d''exploitation'),
  -- Classe 7: Produits
  ('7','711','Ventes'), ('7','712','Produits accessoires'),
  ('7','713','Produits financiers'), ('7','714','Reprises'),
  -- Classe 8: Résultats
  ('8','811','Résultat d''exploitation'), ('8','812','Résultat financier'),
  ('8','813','Résultat net'), ('8','814','Résultat hors exploitation')
) AS t(classe_c, code, nom)
INNER JOIN classes_comptables c ON c.code = t.classe_c
ON CONFLICT DO NOTHING;

-- 6. RUBRIQUES COMPTABLES (PCG Marocain) ---------------------
INSERT INTO rubriques_comptables (poste_id, code, nom)
SELECT p.id, t.code, t.nom FROM (VALUES
  -- 111 - Capital
  ('111','1111','Capital individuel'), ('111','1112','Capital des sociétés'),
  ('111','1113','Capital personnel'),
  -- 113 - Réserves
  ('113','1131','Réserve légale'), ('113','1132','Réserves statutaires'),
  ('113','1133','Réserves libres'), ('113','1134','Réserves spéciales'),
  -- 114 - Report à nouveau
  ('114','1141','Report à nouveau créditeur'),
  ('114','1142','Report à nouveau débiteur'),
  -- 118 - Dettes de financement
  ('118','1181','Emprunts obligataires'),
  ('118','1182','Emprunts auprès des établissements de crédit'),
  ('118','1183','Avances reçues de l''État'),
  ('118','1185','Dettes liées à la location-acquisition'),
  -- 211 - Immobilisations corporelles
  ('211','2111','Terrains nus'), ('211','2112','Terrains aménagés'),
  ('211','2113','Constructions'), ('211','2114','Installations techniques'),
  ('211','2115','Matériel et outillage'), ('211','2116','Matériel de transport'),
  ('211','2117','Mobilier et matériel de bureau'),
  ('211','2118','Immobilisations en cours'),
  -- 212 - Immobilisations incorporelles
  ('212','2121','Frais de constitution'),
  ('212','2122','Frais d''établissement'),
  ('212','2123','Frais de recherche et développement'),
  ('212','2124','Brevets et licences'), ('212','2125','Fonds commercial'),
  ('212','2126','Logiciels'),
  -- 213 - Immobilisations financières
  ('213','2131','Prêts immobilisés'), ('213','2132','Titres de participation'),
  ('213','2133','Dépôts et cautionnements'),
  -- 311 - Stocks
  ('311','3111','Stock de matières premières'),
  ('311','3112','Stock de marchandises'),
  ('311','3113','Stock de produits finis'),
  ('311','3114','Stock d''emballages'),
  -- 312 - Créances clients
  ('312','3121','Clients'), ('312','3122','Clients douteux'),
  ('312','3123','Clients - effets à recevoir'),
  ('312','3124','Clients - retenues de garantie'),
  -- 313 - Autres créances
  ('313','3131','État - TVA récupérable'),
  ('313','3132','État - Impôt sur les sociétés'),
  ('313','3133','État - Autres impôts'),
  ('313','3134','Personnel'), ('313','3135','Organismes sociaux'),
  ('313','3136','Comptes courants d''associés'),
  -- 411 - Dettes fournisseurs
  ('411','4111','Fournisseurs'), ('411','4112','Fournisseurs - effets à payer'),
  ('411','4113','Fournisseurs - retenues de garantie'),
  -- 412 - Dettes fiscales
  ('412','4121','TVA facturée'), ('412','4122','TVA due'),
  ('412','4123','Impôt sur les sociétés'), ('412','4124','Taxe professionnelle'),
  ('412','4125','IRSA'), ('412','4126','TVA à décaisser'),
  -- 413 - Dettes sociales
  ('413','4131','CNSS'), ('413','4132','AMO'),
  ('413','4133','CIMR'), ('413','4134','Mutuelle'),
  -- 511 - Banque
  ('511','5111','Banque - compte courant'),
  ('511','5112','Banque - compte épargne'),
  ('511','5113','Banque - compte devises'),
  -- 611 - Achats
  ('611','6111','Achats de matières premières'),
  ('611','6112','Achats de marchandises'),
  ('611','6113','Achats d''emballages'), ('611','6114','Variation des stocks'),
  -- 612 - Charges externes
  ('612','6121','Location'), ('612','6122','Entretien et réparations'),
  ('612','6123','Assurances'), ('612','6124','Honoraires'),
  ('612','6125','Publicité'), ('612','6126','Transport'),
  ('612','6127','Frais postaux et télécommunications'),
  ('612','6128','Eau, électricité, gaz'),
  -- 613 - Charges de personnel
  ('613','6131','Salaires'), ('613','6132','Charges sociales'),
  ('613','6133','Indemnités'), ('613','6134','Formation'),
  -- 614 - Impôts et taxes
  ('614','6141','Taxe professionnelle'), ('614','6142','Taxe urbaine'),
  ('614','6143','Taxe de services'), ('614','6144','Droits d''enregistrement'),
  -- 615 - Charges financières
  ('615','6151','Intérêts des emprunts'),
  ('615','6152','Agios bancaires'),
  ('615','6153','Pertes de change'),
  -- 616 - Dotations
  ('616','6161','Dotations aux amortissements'),
  ('616','6162','Dotations aux provisions'),
  -- 711 - Ventes
  ('711','7111','Ventes de marchandises'),
  ('711','7112','Ventes de produits finis'),
  ('711','7113','Ventes de services'), ('711','7114','Rabais et remises'),
  -- 712 - Produits accessoires
  ('712','7121','Location diverse'), ('712','7122','Commission'),
  ('712','7123','Escomptes obtenus'),
  -- 713 - Produits financiers
  ('713','7131','Intérêts bancaires'), ('713','7132','Revenus de titres'),
  ('713','7133','Gains de change')
) AS t(poste_c, code, nom)
INNER JOIN postes_comptables p ON p.code = t.poste_c
ON CONFLICT DO NOTHING;

-- 7. FENÊTRES (pour droits d'accès) --------------------------
INSERT INTO fenetres (module_id, code, nom)
SELECT m.id, t.code, t.nom FROM (VALUES
  ('FINANCE','saisie_ecritures','Saisie des écritures'),
  ('FINANCE','journal','Journal'),
  ('FINANCE','grand_livre','Grand livre'),
  ('FINANCE','balance','Balance'),
  ('FINANCE','plan_comptable','Plan comptable'),
  ('FINANCE','gestion_immobilisations','Gestion des immobilisations'),
  ('FINANCE','declaration_tva','Déclaration de TVA'),
  ('FINANCE','lettrage','Lettrage des comptes'),
  ('FINANCE','rapprochement','Rapprochement bancaire'),
  ('FINANCE','etats_synthese','États de synthèse'),
  ('FINANCE','journal_centralisateur','Journal centralisateur'),
  ('PARAM','parametrage_compta','Paramétrage comptabilité'),
  ('PARAM','fichier_societe','Fichier société'),
  ('PARAM','gestion_utilisateurs','Gestion des utilisateurs'),
  ('PARAM','fichier_journaux','Fichier journaux'),
  ('PARAM','modeles_ecritures','Modèles d''écritures')
) AS t(module_c, code, nom)
INNER JOIN modules m ON m.code = t.module_c
ON CONFLICT DO NOTHING;
