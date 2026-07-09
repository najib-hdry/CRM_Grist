# 🔧 Guide du système de mapping des colonnes

## Vue d'ensemble

Le **Grist CRM Widget** intègre un système de mapping flexible qui vous permet d'utiliser vos propres tables et colonnes Grist existantes au lieu des tables par défaut (`CRM_Comptes`, `CRM_Contacts`, `CRM_Contrats`, `CRM_Equipe`).

Cette fonctionnalité est particulièrement utile si :
- ✅ Vous avez déjà une liste de clients/prospects dans Grist
- ✅ Vos colonnes ont des noms différents
- ✅ Vous souhaitez intégrer le widget dans un document existant
- ✅ Vous voulez réutiliser vos structures de données actuelles

---

## 🚀 Démarrage rapide

### Pour les nouveaux utilisateurs

Si vous installez le widget pour la première fois, **aucune configuration n'est nécessaire** ! Le widget crée automatiquement :
- Les tables par défaut (`CRM_Comptes`, `CRM_Contacts`, `CRM_Contrats`, `CRM_Equipe`, etc.)
- La table de configuration `CRM_Configuration`
- Le mapping par défaut

### Pour les utilisateurs avec des données existantes

Le mapping s'édite directement dans la table **`CRM_Configuration`**, visible dans votre document Grist comme n'importe quelle autre table :

1. Ouvrez la table `CRM_Configuration` dans Grist
2. Repérez la ligne dont `Cle_Config` correspond au champ à remapper (ex. `compte_name`)
3. Modifiez `Nom_Table` et `Nom_Colonne` pour pointer vers votre table et colonne existantes
4. Rechargez le widget — il relira automatiquement le mapping à chaque ouverture

> 💡 Le mapping peut aussi se consulter en lecture dans l'onglet **Paramètres** du widget (section « Mapping des tables Grist »).

---

## 📋 Champs et colonnes supportés

### Table des Comptes (`CRM_Comptes`)

| Champ Widget | Cle_Config | Description | Requis | Type Grist recommandé |
|--------------|------------|-------------|--------|------------------------|
| **Nom** | `compte_name` | Nom du client/prospect | ✅ Oui | Text |
| **Type** | `compte_type` | client / prospect / ancien | ✅ Oui | Choice |
| **Statut** | `compte_status` | Étape du pipeline | Non | Choice |
| **Priorité** | `compte_priority` | high / medium / low | Non | Choice |
| **Responsable** | `compte_responsible` | Membre de l'équipe en charge | Non | Ref:CRM_Equipe |
| **Montant** | `compte_amount` | Montant modifiable (CA ou prévisionnel) | Non | Numeric |
| **Total contrats** | `compte_contracts_total` | Calculé automatiquement (lecture seule) | Non | Numeric (formule) |
| **Prochaine action** | `compte_next_action` | Action commerciale prévue | Non | Text |
| **Date prochaine action** | `compte_next_action_date` | Date de l'action prévue | Non | Date |
| **Date de relance** | `compte_relance_date` | Date à laquelle relancer le contact | Non | Date |
| **Catégorie** | `compte_category` | Secteur d'activité ou segment libre (ex. "BTP", "Santé") | Non | Text |
| **Tag** | `compte_tag` | Étiquette libre et cumulable (ex. "urgent", "salon-2026") | Non | Text |
| **Notes** | `compte_description` | Notes générales | Non | Text |
| **Site web** | `compte_website` | URL du site de l'entreprise | Non | Text |
| **Adresse** | `compte_address_street` | Numéro et rue | Non | Text |
| **Code postal** | `compte_address_zip` | Code postal | Non | Text |
| **Ville** | `compte_address_city` | Ville | Non | Text |

### Table des Contacts (`CRM_Contacts`)

| Champ Widget | Cle_Config | Description | Requis | Type Grist recommandé |
|--------------|------------|-------------|--------|------------------------|
| **Nom** | `contact_name` | Nom du contact | ✅ Oui | Text |
| **Email** | `contact_email` | Adresse email | Non | Text |
| **Téléphone** | `contact_phone` | Numéro de téléphone | Non | Text |
| **Fonction** | `contact_role` | Poste / fonction | Non | Text |
| **Contact principal** | `contact_is_primary` | Interlocuteur principal | Non | Bool |
| **Consentement RGPD** | `contact_consent` | Consentement obtenu | Non | Bool |
| **Date consentement** | `contact_consent_date` | Date du consentement | Non | Date |

### Table des Contrats (`CRM_Contrats`)

| Champ Widget | Cle_Config | Description | Requis | Type Grist recommandé |
|--------------|------------|-------------|--------|------------------------|
| **Intitulé** | `contract_label` | Nom/objet du contrat | ✅ Oui | Text |
| **Montant** | `contract_amount` | Montant du contrat | Non | Numeric |
| **Statut** | `contract_status` | en_cours / signe / termine / annule | Non | Choice |
| **Date début** | `contract_start_date` | Date de début | Non | Date |
| **Date fin** | `contract_end_date` | Date de fin | Non | Date |

> 📎 Les colonnes `Fichier_Nom`, `Fichier_Type` et `Fichier_Data` (pièce jointe du contrat, stockée en base64) ne sont pas mappables : elles restent toujours nommées ainsi.

### Table de l'Équipe (`CRM_Equipe`)

| Champ Widget | Cle_Config | Description | Requis | Type Grist recommandé |
|--------------|------------|-------------|--------|------------------------|
| **Nom** | `equipe_name` | Nom du membre | ✅ Oui | Text |
| **Email** | `equipe_email` | Adresse email | Non | Text |
| **Rôle** | `equipe_role` | Fonction dans l'équipe | Non | Text |

Cette table alimente les listes déroulantes **Responsable** (fiche compte) et **Assigné à** (tâches).

> ⚠️ Les tables `CRM_Taches` et `CRM_Commentaires` (tâches et fil de commentaires) ne sont pas mappables pour le moment : elles restent toujours nommées ainsi.

---

## 🎯 Cas d'usage

### Cas 1 : Colonnes personnalisées sur une table de clients existante

Vous avez une table `Clients` avec des colonnes différentes :

```
Table: Clients
- Raison_Sociale (Text)
- Categorie_Client (Choice: client, prospect, ancien)
- Etape_Pipeline (Choice)
- CA_Annuel (Numeric)
- Charge_Affaire (Ref:Commerciaux)
```

**Configuration dans `CRM_Configuration` :**
```
compte_name        → Clients . Raison_Sociale
compte_type        → Clients . Categorie_Client
compte_status      → Clients . Etape_Pipeline
compte_amount      → Clients . CA_Annuel
compte_responsible → Clients . Charge_Affaire
```

⚠️ **Important :**
- Les valeurs de `Type` doivent rester `client` / `prospect` / `ancien` (en minuscules, sans accent).
- Les statuts du pipeline doivent correspondre aux clés définies dans Paramètres → Colonnes du pipeline.
- `compte_responsible` doit pointer vers une colonne de type `Ref:` vers votre table d'équipe — pas un champ texte libre.

### Cas 2 : Table de contacts déjà existante

```
Table: Interlocuteurs
- NomComplet (Text)
- Mail (Text)
- Tel (Text)
- Compte_Id (Ref:Clients)
```

**Configuration :**
```
contact_name  → Interlocuteurs . NomComplet
contact_email → Interlocuteurs . Mail
contact_phone → Interlocuteurs . Tel
```

⚠️ **Attention :** la colonne de liaison vers le compte doit impérativement s'appeler `Compte_Id` et être de type `Ref:<votre_table_comptes>` — ce nom n'est pas mappable.

---

## 🔧 Configuration avancée

### Ajouter un champ personnalisé sans toucher au mapping

Pour un champ supplémentaire qui n'a pas d'équivalent dans le widget (ex. "Origine du lead", "Numéro SIRET"), pas besoin de mapping : utilisez **Paramètres → Ajouter un champ personnalisé**. La colonne est ajoutée directement à la table Grist choisie et reste éditable depuis Grist, même si le widget ne l'affiche pas encore dans ses propres formulaires.

### Édition manuelle de `CRM_Configuration`

| Colonne | Description | Exemple |
|---------|--------------|---------|
| `Cle_Config` | Identifiant unique du champ | `compte_name` |
| `Nom_Table` | Nom de la table Grist | `Clients` |
| `Nom_Colonne` | Nom de la colonne | `Raison_Sociale` |
| `Libelle_Affiche` | Label affiché dans l'UI | `Nom` |
| `Obligatoire` | Champ obligatoire | `TRUE` |
| `Valeur_Defaut` | Valeur par défaut | `Nom` |

### Réinitialisation du mapping

Pour revenir au mapping par défaut :
1. Supprimez toutes les lignes de la table `CRM_Configuration`
2. Rechargez le widget
3. Le widget recréera automatiquement la configuration par défaut

---

## ⚠️ Limitations et bonnes pratiques

### Limitations

1. **Une table par entité** : vous ne pouvez mapper qu'une seule table pour les comptes, une pour les contacts, une pour les contrats, une pour l'équipe.
2. **Types de colonnes** : les types Grist doivent être compatibles (Text pour Text, Date pour Date, etc.)
3. **Valeurs de Choice** : les valeurs de `Type` et de statut du pipeline doivent correspondre exactement aux valeurs attendues par le widget.
4. **`Compte_Id`** : la colonne de liaison entre comptes et contacts/contrats/tâches/commentaires n'est pas mappable.
5. **Responsable / Assigné à** : doivent rester des références (`Ref:`) vers la table équipe mappée — un champ texte cassera l'affichage du nom.

### Bonnes pratiques

✅ **À faire :**
- Testez le mapping avec quelques fiches avant de migrer toute votre base
- Conservez une sauvegarde de vos données avant de configurer le mapping
- Documentez votre mapping personnalisé

❌ **À éviter :**
- Ne mappez pas plusieurs champs sur la même colonne
- Ne modifiez pas les noms de tables après avoir configuré le mapping

---

## 🆘 Support

1. **Consultez la console JavaScript** (F12) pour les erreurs détaillées
2. **Vérifiez la table `CRM_Configuration`** pour voir le mapping actuel
3. **Testez avec les tables par défaut** pour isoler le problème
