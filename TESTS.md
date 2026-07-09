# Tests

Ce document recense les tests du widget CRM : comment les lancer, ce qu'ils couvrent, et
l'historique des bugs corrigés avec leur scénario de non-régression associé.

## Comment lancer les tests

```bash
npm test
```

34 tests sur les fonctions utilitaires pures + tests d'intégration ajoutés au fil des
corrections (voir ci-dessous), soit 86 tests au total, répartis sur 13 fichiers.

## Deux niveaux de test

Ce widget dépend entièrement de l'API `grist.docApi`, qui n'existe que dans une vraie
iframe Grist connectée à un document. Un E2E automatisé "de bout en bout" en navigateur
réel n'est donc pas possible sans un document Grist et des identifiants dédiés. On
distingue donc deux niveaux :

### 1. Tests d'intégration automatisés (`npm test`)

- **Vitest + jsdom** (`vitest.config.js`), avec un environnement DOM minimal
  (`test/setup.js`) et un **faux `window.grist`** en mémoire (`test/mock-grist.js`).
- Le mock simule `fetchTable`, `applyUserActions` (AddTable, AddColumn, RemoveColumn,
  ModifyColumn, AddRecord, BulkAddRecord, UpdateRecord, RemoveRecord) et `listTables`,
  sans navigateur ni vrai document Grist.
- Ça permet de tester le vrai code métier (créer un compte, consentement RGPD, mapping
  de table, migrations de schéma, export CSV) de façon rapide et reproductible.
- Convention : les tests vivent à côté du fichier testé (`src/crud/comptes.test.js`),
  comme les tests existants sur `src/utils/`.

### 2. Checklist de test manuel (dans un vrai document Grist)

Pour tout ce que le mock ne peut pas simuler fidèlement : rendu visuel réel, glisser-déposer
Kanban, comportement natif des colonnes Grist (Choice, Ref), migrations destructives sur un
vrai document. Voir la section [Checklist manuelle](#checklist-de-test-manuel) en bas de ce
fichier.

---

## Historique des bugs et fonctionnalités testés

### Consentement RGPD non persisté

- **Contexte** : la case "Consentement contact obtenu" dans l'onglet Contacts d'une fiche
  avait l'air de fonctionner (cochée visuellement) mais la valeur ne survivait jamais à un
  rechargement du widget.
- **Cause racine** : `setContactConsent()` (`src/crud/contacts.js`) écrivait directement sur
  des noms de colonnes Grist codés en dur (`RGPD_Consent`, `RGPD_Consent_Date`) — qui sont en
  réalité les noms des **champs internes JS**, pas les colonnes Grist réelles
  (`RGPD_Consentement`, `RGPD_Date_Consentement`, cf. `column-mapping.js`). La lecture
  (`src/data/load.js`) utilisait bien le mapping ; seule l'écriture le contournait.
- **Correction** : `setContactConsent()` utilise désormais `setField(record, 'contacts',
  'consent', ...)` / `setField(record, 'contacts', 'consentDate', ...)`, comme le reste du
  code. Ajout au passage d'un toast d'erreur en cas d'échec de sauvegarde (absent avant), et
  correction d'une fuite d'URL blob dans l'export de données contact (`URL.revokeObjectURL`
  manquant).
- **Scénario de test** : `src/crud/contacts.test.js` — coche puis décoche le consentement
  sur un contact seedé dans le mock Grist, vérifie que `RGPD_Consentement` /
  `RGPD_Date_Consentement` sont bien écrits, et que les anciens noms erronés
  (`RGPD_Consent`/`RGPD_Consent_Date`) ne sont jamais recréés (régression).
- **Résultat** : ✅ 3 tests passent.

### Mapping de table jamais relu (`GUIDE_MAPPING.md`)

- **Contexte** : `GUIDE_MAPPING.md` documente un scénario où l'utilisateur remappe le widget
  sur ses propres tables Grist existantes (ex. `compte_name` → table `Clients` au lieu de
  `CRM_Comptes`), via la colonne `Nom_Table` de `CRM_Configuration`.
- **Cause racine** : `loadColumnMapping()` (`src/config/column-mapping.js`) ne lisait que
  `Nom_Colonne` — jamais `Nom_Table`. Les tables (`COMPTES_TABLE`, `CONTACTS_TABLE`, etc.)
  restaient donc figées sur leurs valeurs par défaut, quoi que l'utilisateur configure.
- **Correction** : `loadColumnMapping()` lit aussi `Nom_Table` et appelle la nouvelle
  fonction `applyTableMapping()` (`src/config/tables.js`), qui réaffecte les variables de
  table exportées.
- **Scénario de test** : `src/config/column-mapping.test.js` — remappe `compte_name`/
  `compte_type` vers une table `Clients`, vérifie que `COMPTES_TABLE` devient `'Clients'` et
  que `getColumnName('comptes', 'name')` renvoie la bonne colonne ; vérifie aussi qu'un
  remap partiel (une seule entité) laisse les autres tables intactes, et que l'absence de
  remap garde les valeurs par défaut.
- **Résultat** : ✅ 3 tests passent.

### Colonne Prochaine_Action en Texte libre au lieu de Choix unique

- **Contexte** : le champ "Prochaine action" est un menu déroulant dans le widget, mais la
  colonne Grist sous-jacente était de type `Text` — donc en texte libre si on l'ouvrait
  directement dans la grille Grist.
- **Correction** : colonne créée en type `Choice` pour les nouveaux documents
  (`src/data/schema.js`), migration `ModifyColumn` pour les documents existants, et
  synchronisation de la liste de choix (actions prospect + client fusionnées) au chargement
  et à chaque modification des actions dans Paramètres.
- **Scénario de test** : `src/data/schema.test.js` — vérifie que `ensureTables()` crée bien
  `Prochaine_Action` en type `Choice` sur un document neuf.
- **Résultat** : ✅ couvert (voir aussi les tests de migration email ci-dessous, même
  fichier).

### Retrait des fonctionnalités email et appel

- **Contexte** : demande client — le widget ne doit plus envoyer d'email ni déclencher
  d'appel depuis l'interface (suppression des boutons Appeler/Envoyer email/Envoyer
  contrat/Relancer, des modèles d'email, du webhook n8n, de la sélection multiple en vue
  Liste, et des colonnes `Email_Status`/`Email_Sujet`/`Email_Corps`/`Email_Destinataire`).
- **Scénario de test / non-régression** :
  - `src/crud/comptes.test.js` — vérifie qu'un compte nouvellement créé n'a plus de champ
    `Email_Status`.
  - `src/data/schema.test.js` — sur un document **existant créé avant le retrait**
    (colonnes email présentes), vérifie que la migration de nettoyage supprime bien les 4
    colonnes de `CRM_Comptes` (sans toucher aux autres données du compte), et supprime les
    réglages `webhook_url`/`email_templates` de `CRM_Parametres` tout en conservant les
    autres réglages (ex. `kanban_statuses`).
- **Résultat** : ✅ couvert par 4 tests dans `schema.test.js` + 1 dans `comptes.test.js`.
- **Non couvert par les tests automatisés** : l'absence des boutons dans l'interface
  (DOM généré par les vues) — à vérifier manuellement, voir checklist ci-dessous.

### Export CSV

- **Contexte** : seul canal d'export restant depuis le retrait de l'export PDF.
- **Scénario de test** : `src/io/export.test.js` — génère un CSV à partir d'un compte
  seedé dans l'état en mémoire, capture le `Blob` réellement produit (interception de
  `URL.createObjectURL`), et vérifie l'en-tête, une ligne de données, et l'échappement
  correct des virgules et retours à la ligne dans les champs.
- **Résultat** : ✅ 2 tests passent.
- **Limite connue non testée** : le format généré n'échappe pas les valeurs commençant par
  `=`, `+`, `-` ou `@` (risque d'injection CSV/formule à l'ouverture dans Excel) — signalé
  dans la revue de code du 2026-07-07, pas encore corrigé.

### Fiche fantôme à la création d'un compte

- **Contexte** : cliquer sur "+ Client"/"+ Prospect" créait immédiatement une fiche vide
  dans Grist. Fermer avec la croix ou "Annuler" ne la supprimait pas — une fiche vide
  restait en base à chaque essai/annulation.
- **Cause racine** : `createCompte()` (`src/crud/comptes.js`) faisait un `AddRecord` dès le
  clic sur le bouton, avant même que l'utilisateur ait rempli le formulaire.
- **Correction** : `createCompte()` n'écrit plus rien — il ouvre le formulaire via la
  nouvelle fonction `openNewCompteModal()` (`src/modal/compte-modal.js`). C'est
  `saveCompteFromModal()` qui fait l'`AddRecord`, uniquement au clic sur "Enregistrer"
  (détecté via `compteId == null`), en unifiant création et modification dans la même
  fonction.
- **Scénario de test** : `src/crud/comptes.test.js` — vérifie qu'ouvrir le formulaire
  n'écrit rien, que fermer ensuite ne laisse aucune fiche, qu'Enregistrer crée bien la
  fiche avec les valeurs saisies puis ferme la modale, que le nom reste obligatoire, et que
  la modification d'une fiche existante fonctionne toujours (une seule ligne mise à jour,
  pas de doublon).
- **Résultat** : ✅ 9 tests passent.

### Journal d'activité limité aux notes et tâches

- **Contexte** : demande produit — `CRM_JournalActivite` ne doit contenir que l'historique
  des commentaires et des tâches, pas les autres actions (création/modification/suppression
  de compte, déplacement Kanban, conversion en client, suppression RGPD d'un contact).
- **Correction** : retrait des appels `logActivity()` dans `src/crud/comptes.js`,
  `src/crud/contacts.js` et `src/views/kanban.js`. Ajout des appels manquants pour les
  actions sur les tâches (`task_added`, `task_completed`/`task_reopened`, `task_deleted`
  dans `src/crud/tasks.js`) et sur les notes (`comment_edited`, `comment_deleted` dans
  `src/crud/comments.js` — seul `comment_added` était déjà journalisé). Le retrait du log
  `relance_handled` (marquer une relance comme traitée) est volontaire : cette action ne
  touche pas la table `CRM_Taches`, ce n'est pas une "tâche" au sens strict de la demande.
- **Scénario de test** : `src/data/journal.test.js` — vérifie qu'aucune ligne n'est créée
  pour la création/modification/suppression d'un compte ni pour la suppression RGPD d'un
  contact, et qu'une ligne est bien créée pour l'ajout d'une note, l'ajout d'une tâche, et
  le fait de cocher une tâche comme faite.
- **Résultat** : ✅ 7 tests passent.

### Gestion automatique du statut Client/Prospect dans le Kanban

- **Contexte** : demande produit — le statut Client/Prospect d'une fiche doit suivre
  automatiquement sa position dans le pipeline Kanban, dans les deux sens (pas seulement à
  la conversion prospect → client). L'ancien réglage "masquer du Kanban les clients
  convertis depuis plus de X jours" (Paramètres) ne correspondait plus au besoin et a été
  retiré.
- **Correction** :
  - Glisser un client depuis l'étape "Contrat signé" (`marksAsClient`) vers une étape
    antérieure du pipeline le fait **redevenir prospect** (type remis à `prospect`,
    `Client_Depuis` effacé) — symétrique de la conversion prospect → client déjà existante.
  - Retrait du réglage "masquer les clients depuis N jours" (`src/settings/settings-domain.js`,
    `src/app.js`) ; nettoyage de l'ancienne clé `kanban_hide_client_days` dans
    `CRM_Parametres` pour les documents existants (`src/data/schema.js`).
  - Remplacé par une limite d'affichage : la colonne `marksAsClient` n'affiche par défaut
    que les **15 clients les plus récents** (triés par `Client_Depuis`/`Created_At`
    décroissant) ; la case "Afficher tous les clients" lève la limite (`src/views/kanban.js`).
  - Le bouton "+ Client" présélectionne désormais l'étape `marksAsClient` (au lieu de la
    première étape du pipeline, réservée aux prospects) (`src/modal/compte-modal.js`).
  - Un client créé directement (pas via conversion d'un prospect) a désormais `Client_Depuis`
    renseigné dès sa création (`src/crud/comptes.js`).
- **Scénario de test** :
  - `src/views/kanban.test.js` — conversion prospect → client, retour client → prospect,
    déplacement neutre (sans changement de type), tri et limite à 15 clients récents,
    affichage complet avec "Afficher tous les clients".
  - `src/modal/compte-modal.test.js` — étape présélectionnée selon le type (client vs
    prospect) à l'ouverture du formulaire de création.
  - `src/crud/comptes.test.js` — `Client_Depuis` renseigné à la création directe d'un client.
- **Résultat** : ✅ 8 tests passent (5 + 2 + 1).

### Tags : choix unique géré dans Paramètres + création à la volée

- **Contexte** : demande produit — le champ Tag de la fiche compte était en texte libre
  (valeurs incohérentes possibles selon la saisie), et la table `CRM_Tags` existait dans le
  schéma mais n'était jamais lue par aucune vue du widget (donnée morte).
- **Correction** :
  - Retrait complet de `CRM_Tags` (`src/config/tables.js`, `src/state.js`, `src/data/load.js`,
    `src/app.js`) ; migration `RemoveTable` pour les documents existants où elle a déjà été
    créée (`src/data/schema.js`).
  - Colonne `Tag` de `CRM_Comptes` passée en type `Choice` (comme `Prochaine_Action`
    auparavant) — migration `ModifyColumn` idempotente pour les documents existants, les
    valeurs texte déjà stockées restant valides.
  - Nouvelle liste de tags personnalisable dans Paramètres (`getTagsList()`/`commitTagsList()`
    dans `src/settings/settings-domain.js`, sur le modèle des "Types de comptes" — libellé et
    couleur éditables, persistée dans `CRM_Parametres` sous la clé `tags_list`, synchronisée
    sur la liste de choix native de la colonne `Tag`).
  - Création à la volée depuis la fiche compte : le champ Tag est maintenant un `<select>`
    avec une option "+ Créer un nouveau tag..." qui révèle un champ de saisie (même pattern
    que la création de rôle équipe dans `src/crud/equipe.js`) ; `addTagValue()` est appelée
    au moment d'Enregistrer (`src/crud/comptes.js`) si cette option est sélectionnée.
- **Scénario de test** :
  - `src/data/schema.test.js` — Tag créé en `Choice` sur un document neuf (pas de table
    `CRM_Tags` créée) ; sur un document existant avec `CRM_Tags` peuplée et `Tag` en texte
    libre, vérifie que la table est supprimée, la colonne convertie en `Choice`, et les
    données déjà présentes conservées.
  - `src/settings/settings-domain.test.js` (nouveau) — `addTagValue()` ajoute le tag à la
    liste, le persiste dans `CRM_Parametres`, et évite les collisions de clé (slug) entre deux
    tags de nom proche.
  - `src/crud/comptes.test.js` — enregistrer une fiche avec "+ Créer un nouveau tag..." crée
    le tag et l'assigne ; sans nom saisi, aucun tag n'est assigné (pas d'erreur bloquante).
  - `src/modal/compte-modal.test.js` — le formulaire de création propose bien l'option
    "+ Créer un nouveau tag..." avec le champ de saisie personnalisé masqué par défaut.
- **Résultat** : ✅ 6 tests passent (2 dans schema.test.js + 2 dans settings-domain.test.js +
  2 dans comptes.test.js) + 1 dans compte-modal.test.js.

### Catégories : choix unique géré dans Paramètres + création à la volée + filtre Kanban

- **Contexte** : demande produit — même problème que pour les Tags : le champ Categorie de la
  fiche compte était en texte libre, et la table `CRM_Categories` existait dans le schéma mais
  n'était jamais lue par aucune vue (donnée morte). Demande additionnelle : un filtre par
  Catégorie dans le Kanban, qui n'existait pas alors que `currentFilterCategory` existait déjà
  côté filtrage (`src/data/filtering.js`) sans aucune UI pour le renseigner.
- **Correction** : exactement le même traitement que pour les Tags (voir entrée précédente),
  appliqué à `Categorie` :
  - Retrait complet de `CRM_Categories` ; migration `RemoveTable` pour les documents existants.
  - Colonne `Categorie` passée en `Choice` ; migration `ModifyColumn` idempotente.
  - Liste de catégories personnalisable dans Paramètres (`getCategoriesList()`/
    `commitCategoriesList()` dans `src/settings/settings-domain.js`), persistée sous la clé
    `categories_list`, affichée à côté du bloc Tags.
  - Création à la volée depuis la fiche compte (`addCategoryValue()`, même mécanisme que pour
    les tags — option "+ Créer une nouvelle catégorie..." dans un `<select>`).
  - Nouveau filtre Kanban : `<select id="kanban-category-select">` dans la barre d'outils
    (`index.html`), piloté par `setFilterCategory()` (`src/views/kanban.js`, symétrique de
    `setFilterType()`) qui appelle `setCurrentFilterCategory()` (`src/state.js`, nouveau
    setter) puis `refreshAllViews()`. La liste d'options est peuplée par
    `refreshCategorySelects()`, appelée au chargement et à chaque modification des catégories
    dans Paramètres (comme `refreshTypeSelects()` pour les types de comptes).
- **Scénario de test** :
  - `src/data/schema.test.js` — Categorie créée en `Choice` sur un document neuf (pas de table
    `CRM_Categories` créée) ; sur un document existant avec `CRM_Categories` peuplée et
    `Categorie` en texte libre, vérifie que la table est supprimée, la colonne convertie, et
    les données conservées.
  - `src/settings/settings-domain.test.js` — `addCategoryValue()` ajoute la catégorie à la
    liste, la persiste dans `CRM_Parametres`, et évite les collisions de clé.
  - `src/crud/comptes.test.js` — enregistrer une fiche avec "+ Créer une nouvelle
    catégorie..." crée la catégorie et l'assigne ; sans nom saisi, aucune catégorie n'est
    assignée.
  - `src/modal/compte-modal.test.js` — le formulaire de création propose bien l'option
    "+ Créer une nouvelle catégorie...".
  - `src/views/kanban.test.js` — `setFilterCategory()` ne garde que les comptes de la
    catégorie choisie (toutes colonnes confondues), et réaffiche tout quand on repasse sur
    "Toutes catégories".
- **Résultat** : ✅ 9 tests passent (2 dans schema.test.js + 2 dans settings-domain.test.js +
  2 dans comptes.test.js + 1 dans compte-modal.test.js + 2 dans kanban.test.js).

---

## Checklist de test manuel

À exécuter dans un vrai document Grist (`http://localhost:8092/index.html` en widget
personnalisé), après chaque changement structurel important.

- [ ] **Création de compte** : créer un prospect et un client depuis les deux boutons dédiés,
      vérifier l'ouverture de la fiche en mode édition.
- [ ] **Kanban** : glisser une fiche vers l'étape "Contrat signé" → passe bien en type
      client ; vers "Perdu" → les relances s'arrêtent (plus de badge de relance).
- [ ] **RGPD** : cocher le consentement d'un contact, **recharger le widget**, vérifier que
      la case est toujours cochée avec sa date.
- [ ] **Mapping de table** : sur un document de test, configurer `CRM_Configuration` pour
      pointer `compte_name` vers une table existante différente, recharger, vérifier que le
      widget lit/écrit bien dans cette table (et pas dans `CRM_Comptes`).
- [ ] **Prochaine action** : ouvrir la colonne `Prochaine_Action` directement dans la grille
      Grist (hors widget) et vérifier qu'elle propose un menu déroulant (Choix), pas du texte
      libre.
- [ ] **Absence email/appel** : parcourir la fiche compte, la vue Liste et Paramètres —
      vérifier qu'aucun bouton Appeler/Email/Webhook/Modèles n'est visible nulle part.
- [ ] **Migration destructive** : sur une **copie** d'un document créé avant le retrait des
      emails (avec des colonnes `Email_Status` etc. déjà peuplées), charger le widget et
      vérifier dans la grille Grist que ces colonnes ont bien disparu — irréversible, donc à
      tester uniquement sur une copie, jamais sur le document de production directement.
- [ ] **Import/Export CSV** : exporter, réimporter le même fichier, vérifier qu'aucune ligne
      n'est perdue ni dupliquée.
