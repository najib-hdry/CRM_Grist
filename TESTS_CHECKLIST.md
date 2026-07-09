# Checklist de tests manuels — CRM Widget

> Fichier temporaire — à supprimer une fois les tests terminés.

Cochez les cases au fur et à mesure de vos tests, et signalez-moi les bugs trouvés directement dans le chat (onglet concerné + description). Je me chargerai de remplir le tableau "Journal des bugs" en bas de ce fichier.

---

## 0. Chargement initial

- [ ] Le widget se charge sans erreur dans la console (F12)
- [ ] Les tables Grist nécessaires sont créées automatiquement si absentes (message "Tables créées automatiquement")
- [ ] Le rôle (Owner / Editor / Viewer) est correctement détecté (boutons de suppression visibles seulement si Owner)
- [ ] Les données existantes (comptes, contacts, contrats, etc.) s'affichent correctement au chargement
- [ ] Aucune erreur dans la console au chargement de chaque onglet

## 1. Onglet Pipeline (Kanban)

### Affichage
- [x] Les colonnes du pipeline s'affichent dans le bon ordre, avec les bonnes couleurs
- [x] Chaque carte affiche : nom, badge type, priorité (couleur du point), contact principal, montant, prochaine action, date de relance
- [x] Le compteur de cartes par colonne est correct (reflète le nombre réellement affiché, pas le total si limité à 15)
- [x] Les cartes en retard de relance sont mises en évidence (couleur/style "relance-late")
- [x] La colonne "Contrat signé" n'affiche par défaut que les **15 clients les plus récents** (les plus récemment convertis/créés en haut)
- [x] La case "Afficher tous les clients" fait apparaître **tous** les clients dans la colonne "Contrat signé" (plus seulement les 15 derniers)

### Filtres / recherche
- [x] Le filtre par type (Tous / Client / Prospect / Ancien) fonctionne
- [x] Le filtre par Catégorie (nouveau menu déroulant) ne garde que les comptes de la catégorie choisie, toutes colonnes confondues
- [x] Choisir "Toutes catégories" réaffiche tous les comptes
- [x] La recherche texte (si présente sur cet onglet) filtre correctement

### Drag & drop — gestion automatique du statut Client/Prospect
- [x] Glisser une carte d'une colonne à une autre met à jour son statut
- [x] Glisser un prospect vers l'étape "Contrat signé" (🤝) le transforme bien en client (badge type + Client_Depuis renseigné), et la carte apparaît en haut de la colonne "Contrat signé"
- [x] Glisser un client depuis "Contrat signé" vers une étape antérieure du pipeline (ex. Négociation) le fait **redevenir prospect** (badge type + Client_Depuis effacé)
- [x] Glisser vers une étape "🚫 sans suite" arrête bien les relances (vérifier onglet Tâches de la fiche)
- [ ] Un toast de confirmation s'affiche après le déplacement (y compris pour le retour en arrière client → prospect)
- [ ] Le déplacement échoue proprement (message d'erreur) si la connexion Grist est coupée

### Création
- [ ] Bouton "+ Client" ouvre le formulaire de saisie avec le type Client **et le statut "Contrat signé" déjà présélectionnés** — **aucune fiche n'est créée dans Grist à ce stade**
- [ ] Bouton "+ Prospect" ouvre le formulaire de saisie (type Prospect, première étape du pipeline présélectionnée) — **aucune fiche n'est créée dans Grist à ce stade**
- [ ] Cliquer sur la croix (✕) ou sur "Annuler" après avoir ouvert "+ Client"/"+ Prospect" ferme le formulaire **sans laisser de fiche vide** dans Grist (vérifier dans la grille Grist elle-même)
- [ ] Cliquer sur "Enregistrer" après avoir rempli le nom crée bien la fiche dans Grist avec les valeurs saisies, puis ferme la modale
- [ ] Créer un client directement (bouton "+ Client") renseigne bien `Client_Depuis` à la création
- [ ] Cliquer sur "Enregistrer" sans nom refuse la création (message d'erreur, aucune fiche créée)
- [ ] Le bouton "Enregistrer" fonctionne toujours normalement en **modification** d'une fiche existante (pas de régression sur la mise à jour)

## 2. Onglet Liste (Table)

- [ ] Toutes les colonnes s'affichent (Nom, Type, Statut, Priorité, Responsable, Montant, Prochaine action, Date prochaine action, Relance, Actions)
- [ ] Le tri par colonne fonctionne (clic sur l'en-tête), y compris l'inversion du sens au second clic
- [ ] Les icônes de tri (▲/▼/⇅) reflètent l'état courant
- [ ] Le filtre type / statut / responsable fonctionne, y compris en combinaison
- [ ] La recherche texte (nom, contact, email, catégorie, tag) fonctionne
- [ ] Clic sur une ligne ouvre la fiche compte correspondante
- [ ] Suppression d'un compte depuis la liste (bouton 🗑️, Owner uniquement) fonctionne et redemande confirmation

## 3. Onglet À relancer (Relances)

- [ ] Les comptes sont bien répartis dans les 3 groupes : 🔴 En retard / 🟡 Cette semaine / ⚪ À venir
- [ ] Le nombre de jours de retard / à venir affiché est correct
- [ ] Le badge sur l'onglet (nombre de relances en retard) est correct et se met à jour
- [ ] Clic sur un élément ouvre la fiche compte
- [ ] Message "Aucune relance programmée" quand la liste est vide

## 4. Onglet Statistiques

- [ ] Les compteurs (Total, Clients, Prospects, Anciens clients) sont corrects
- [ ] Le CA clients cumulé est correct (Amount ou total des contrats signés)
- [ ] Le pipeline prospects (somme des montants) est correct
- [ ] Relances en attente / en retard : nombres corrects
- [ ] Graphique "Répartition du pipeline" : barres cohérentes avec le nombre de comptes par statut
- [ ] Graphique "Répartition par priorité" : cohérent
- [ ] Donut "CA par étape du pipeline" : segments, couleurs et légende cohérents, total au centre correct
- [ ] Le donut affiche "Aucune donnée" proprement si aucun montant

## 5. Onglet Carte

### Mode Pins (Leaflet)
- [ ] La carte se charge (pas d'erreur "Leaflet non chargé")
- [ ] Seuls les comptes géolocalisés (Address_Lat/Lng renseignés) apparaissent, clients + prospects hors statuts "sans suite"
- [ ] Le compteur "X compte(s) sur la carte" est correct
- [ ] Le filtre par type fonctionne
- [ ] Le filtre par département fonctionne, et la liste des départements proposée correspond aux comptes existants
- [ ] Clic sur un pin ouvre un popup avec nom, type, ville
- [ ] Le lien "Ouvrir la fiche →" dans le popup ouvre bien la fiche et ferme le popup
- [ ] Le zoom/cadrage automatique (fitBounds) est cohérent avec les pins affichés

### Mode Région (choroplèthe D3)
- [ ] Bascule pins/région fonctionne (affiche/masque les bons éléments : sélecteur département masqué en mode région, sélecteur métrique visible)
- [ ] La carte des régions se charge (pas d'erreur "D3 non chargé" ni "contours indisponibles")
- [ ] Les couleurs reflètent bien la métrique choisie (nombre de comptes vs CA)
- [ ] Le texte (nom de région + valeur) reste lisible sur toutes les couleurs (contraste clair/foncé) — **point de vigilance : bug historique corrigé (rgb() vs hex)**
- [ ] Le survol d'une région affiche un tooltip avec le bon nom, nombre de comptes et CA
- [ ] La légende (dégradé de couleurs) est cohérente avec les valeurs min/max
- [ ] Les chips DOM-TOM (Guadeloupe, Martinique, Guyane, La Réunion, Mayotte) affichent les bonnes valeurs et couleurs
- [ ] Changer la métrique (nombre/CA) recalcule bien les couleurs partout (régions + DOM-TOM + légende)

## 6. Fiche compte (modale)

### Onglet Informations (lecture seule)
- [ ] Toutes les infos s'affichent correctement (contact principal, infos commerciales, suivi/relances, adresse, catégorisation, description)
- [ ] Email et téléphone du contact s'affichent en texte simple (non cliquables — retrait des liens tel:/mailto: avec les fonctionnalités email/appel) ; le site web reste un lien cliquable
- [ ] Bouton "Modifier" bascule vers l'onglet édition
- [ ] Bouton "Supprimer" (Owner) redemande confirmation puis supprime bien la fiche + ses données liées

### Onglet Modifier
- [ ] Tous les champs se pré-remplissent avec les valeurs actuelles
- [x] Le champ Catégorie est un menu déroulant (choix unique), pas du texte libre
- [x] Choisir "+ Créer une nouvelle catégorie..." affiche un champ de saisie ; saisir un nom puis Enregistrer crée la catégorie (visible ensuite dans Paramètres et dans le filtre Kanban) et l'assigne à la fiche
- [x] Choisir "+ Créer une nouvelle catégorie..." puis Enregistrer **sans saisir de nom** n'assigne aucune catégorie (pas d'erreur bloquante)
- [ ] Le champ Tag est un menu déroulant (choix unique), pas du texte libre
- [ ] Choisir "+ Créer un nouveau tag..." affiche un champ de saisie ; saisir un nom puis Enregistrer crée le tag (visible ensuite dans Paramètres) et l'assigne à la fiche
- [ ] Choisir "+ Créer un nouveau tag..." puis Enregistrer **sans saisir de nom** n'assigne aucun tag (pas d'erreur bloquante)
- [ ] Changer le type recharge bien la liste des prochaines actions disponibles
- [ ] Choisir une prochaine action + une date recalcule automatiquement la date de relance (délai configuré dans Paramètres)
- [ ] **Autocomplétion d'adresse** : taper 3+ caractères déclenche des suggestions (API adresse.data.gouv.fr), sélectionner une suggestion remplit rue/CP/ville/lat/lng
- [ ] Modifier manuellement l'adresse invalide bien les coordonnées lat/lng tant qu'aucune suggestion n'est resélectionnée
- [ ] Enregistrer sauvegarde bien tous les champs modifiés
- [ ] Annuler ferme la modale sans sauvegarder
- [ ] **Changer d'onglet sans sauvegarder puis revenir sur Modifier** : la saisie en cours n'est pas perdue (mécanisme de brouillon `editModalDraft`)
- [ ] Bouton agrandir/réduire la modale (⤢/⤡) fonctionne et persiste en changeant d'onglet

### Onglet Contacts
- [ ] Liste des contacts affichée avec badge "Principal" sur le bon contact
- [ ] Ajout d'un nouveau contact fonctionne
- [ ] Case à cocher consentement RGPD fonctionne et horodate
- [ ] "Télécharger les données de ce contact" (export RGPD) fonctionne
- [ ] 🗑️ Retirer le contact de la fiche (Owner) fonctionne
- [ ] ⚠️ Suppression RGPD définitive (droit à l'oubli, Owner) fonctionne et redemande confirmation

### Onglet Contrats
- [ ] Liste des contrats avec statut, montant, dates
- [ ] Ajout d'un contrat avec fichier joint (PDF/doc/image) fonctionne
- [ ] Téléchargement du fichier joint fonctionne
- [ ] Suppression d'un contrat (Owner) fonctionne
- [ ] Le "Total contrats signés" dans l'onglet Modifier reflète bien la somme des contrats au statut "Signé"

### Onglet Notes (commentaires)
- [ ] Ajout d'une note fonctionne, avec auteur et date
- [ ] Modifier une note existante (crayon) fonctionne
- [ ] Annuler l'édition d'une note fonctionne
- [ ] Suppression d'une note (Owner) fonctionne
- [ ] Ajout/modification/suppression d'une note crée bien une ligne dans `CRM_JournalActivite` (`comment_added`/`comment_edited`/`comment_deleted`)

### Onglet Tâches
- [ ] Le bandeau "Relance à traiter" / "Sans suite" s'affiche correctement selon le statut du compte
- [ ] "Marquer comme traitée" efface bien la relance en cours
- [ ] Liste des tâches, tri par date d'échéance
- [ ] Cocher une tâche comme faite fonctionne
- [ ] Ajout d'une tâche avec échéance et assigné fonctionne
- [ ] Suppression d'une tâche (Owner) fonctionne
- [ ] Ajout/coche/décoche/suppression d'une tâche crée bien une ligne dans `CRM_JournalActivite` (`task_added`/`task_completed`/`task_reopened`/`task_deleted`)

### Journal d'activité (CRM_JournalActivite)
- [ ] Seules les actions sur les notes et les tâches y apparaissent
- [ ] Créer, modifier, déplacer (Kanban) ou supprimer un compte **ne crée aucune ligne**
- [ ] La suppression RGPD d'un contact **ne crée aucune ligne**

## 7. Import / Export

- [ ] Export CSV : fichier téléchargé, encodage correct (accents), toutes les colonnes attendues, ouvrable dans Excel/LibreOffice sans corruption
- [ ] Import CSV : reconnaît les colonnes Nom/Type/Responsable/Montant/Catégorie (variantes FR/EN)
- [ ] Import CSV : rejette proprement un fichier vide ou sans colonne "Nom"
- [ ] Import CSV : responsables non reconnus signalés dans un message dédié, sans bloquer l'import du reste
- [ ] Import Excel (.xlsx) fonctionne de la même façon que le CSV
- [ ] Import Excel : message clair si la librairie XLSX n'est pas chargée
- [ ] Les nouvelles fiches importées apparaissent bien dans le Kanban/Liste après import

## 8. Onglet Paramètres

### Statuts Kanban (pipeline)
- [ ] Liste des étapes modifiable (libellé, couleur)
- [ ] Glisser-déposer pour réordonner les étapes fonctionne
- [ ] Case 🤝 (convertit en client) modifiable
- [ ] Case 🚫 (sans suite) modifiable
- [ ] Ajouter une étape fonctionne (clé générée automatiquement, pas de collision)
- [ ] Supprimer une étape fonctionne
- [ ] "Enregistrer" persiste bien en base (CRM_Parametres) et met à jour le Kanban immédiatement

### Types de comptes
- [ ] Renommer un type existant fonctionne
- [ ] Changer la couleur d'un type met bien à jour les badges partout (Kanban, Liste, fiche)
- [ ] Ajouter un nouveau type fonctionne (slug généré, pas de collision)
- [ ] Les 3 types de base ne peuvent pas être supprimés (ou : vérifier le comportement réel)

### Prochaines actions (Prospects / Clients)
- [ ] Modifier le libellé d'une action fonctionne
- [ ] Modifier le délai de relance (jours) fonctionne et impacte bien le calcul automatique de date de relance
- [ ] Ajouter/supprimer une action fonctionne, séparément pour Prospects et Clients

### Équipe
- [ ] Liste des membres affichée avec rôle et email
- [ ] Ajout d'un membre avec rôle existant fonctionne
- [ ] Ajout d'un membre avec un **nouveau rôle** (option "+ Créer un nouveau rôle") fonctionne
- [ ] Suppression d'un membre (Owner) : avertissement si le membre est assigné à des comptes/tâches
- [ ] Les listes déroulantes "Responsable" partout dans l'app reflètent bien l'équipe à jour

### Tags
- [ ] Liste des tags modifiable (libellé, couleur), séparément de la table CRM_Tags (supprimée)
- [ ] Ajouter un tag depuis Paramètres fonctionne (slug généré, pas de collision)
- [ ] Supprimer un tag depuis Paramètres fonctionne
- [ ] "Enregistrer" persiste bien en base (CRM_Parametres, clé `tags_list`) et synchronise la liste de choix native de la colonne `Tag` dans Grist

### Catégories
- [x] Liste des catégories modifiable (libellé, couleur), séparément de la table CRM_Categories (supprimée)
- [x] Ajouter une catégorie depuis Paramètres fonctionne (slug généré, pas de collision)
- [x] Supprimer une catégorie depuis Paramètres fonctionne
- [x] "Enregistrer" persiste bien en base (CRM_Parametres, clé `categories_list`), synchronise la liste de choix native de la colonne `Categorie` dans Grist, et met à jour le filtre Catégorie du Kanban

### Champ personnalisé
- [ ] Ajouter un champ (Comptes/Contacts/Contrats/Tâches), types Texte/Nombre/Date/Case à cocher
- [ ] Rejet propre si le nom de champ est vide ou déjà existant
- [ ] Le champ apparaît bien dans la table Grist correspondante

### Mapping des colonnes
- [ ] Le tableau de correspondance champ ↔ table ↔ colonne Grist s'affiche correctement pour comptes/contacts/contrats/équipe

## 9. Cas limites / robustesse

- [ ] Comportement correct avec 0 compte (tous les onglets, messages "vide" partout)
- [ ] Comportement avec un très grand nombre de comptes (perf de la Liste/Kanban/Carte)
- [ ] Perte de connexion Grist en cours d'action : message d'erreur clair, pas de plantage silencieux
- [ ] Utilisateur en lecture seule (Viewer) : aucun bouton de modification/suppression visible
- [ ] Rechargement du widget en cours d'édition d'une fiche : pas de perte de données inattendue au-delà de ce qui est prévisible

---

## Journal des bugs trouvés

| # | Onglet / fonctionnalité | Description | Gravité (bloquant/majeur/mineur) | Statut |
|---|---|---|---|---|
| 1 | Pipeline (Kanban) — Création | Cliquer sur "+ Client"/"+ Prospect" créait immédiatement une fiche vide dans Grist. Fermer avec la croix (✕) ou "Annuler" ne la supprimait pas : la fiche fantôme restait en base. | Majeur | ✅ Corrigé |
| 2 | Journal d'activité (CRM_JournalActivite) | Toutes les actions (création/modification/suppression de compte, déplacement Kanban, conversion en client, suppression RGPD contact) étaient journalisées, alors que seules les notes et les tâches doivent l'être. | Mineur (demande produit) | ✅ Corrigé |
| 3 | Pipeline (Kanban) — Statut Client/Prospect | Le passage prospect → client ne fonctionnait que dans un sens (glisser vers "Contrat signé"). Aucun moyen de revenir en arrière automatiquement, et le réglage "masquer les clients depuis N jours" ne correspondait plus au besoin. | Mineur (demande produit) | ✅ Corrigé |
| 4 | Fiche compte — Tags | Le champ Tag était en texte libre (valeurs incohérentes possibles) et la table CRM_Tags existait mais n'était jamais exploitée par le widget. Demande : passer Tag en choix unique géré depuis Paramètres, avec création à la volée depuis la fiche. | Mineur (demande produit) | ✅ Corrigé |
| 5 | Fiche compte + Pipeline — Catégories | Le champ Catégorie était en texte libre et la table CRM_Categories existait mais n'était jamais exploitée. Demande : passer Categorie en choix unique géré depuis Paramètres (création à la volée depuis la fiche), et ajouter un filtre par Catégorie dans le Kanban. | Mineur (demande produit) | ✅ Corrigé |
| | | | | |
