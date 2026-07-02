# Grist CRM Widget

> **Widget personnalisé pour Grist — Prospects & Clients**
> **Licence :** Apache-2.0

---

## 📋 Fonctionnalités

- **Pipeline (Kanban)** : suivi visuel des prospects/clients par étape, glisser-déposer entre colonnes
- **Colonnes personnalisables** : adaptez les étapes du pipeline (nom, couleur, **et ordre par glisser-déposer**) à votre process commercial dans Paramètres
- **Liste** : vue tableau avec recherche, tri par colonne et filtres avancés (type, priorité)
- **Bandeau de relances** : les relances en retard ou à venir s'affichent directement en haut de la page, sans avoir besoin d'ouvrir l'onglet dédié — un badge numéroté reste aussi visible sur l'onglet **À relancer**
- **Fiche compte complète** : informations générales, contacts, contrats, historique de notes, tâches — tout au même endroit
- **Typologie** : chaque fiche est Client / Prospect / Ancien client, modifiable à tout moment (un prospect qui signe devient client sans perdre son historique)
- **Équipe** : table dédiée des collaborateurs, utilisée pour le **Responsable** d'un compte et l'**Assigné à** d'une tâche (gestion dans Paramètres, rôle en liste déroulante avec création de nouveaux rôles à la volée)
- **Contacts multiples** : plusieurs interlocuteurs par compte, avec contact principal
- **Contrats** : un ou plusieurs contrats liés à chaque compte (montant, statut, dates, **pièce jointe**) ; le total des contrats signés s'affiche automatiquement à côté du montant saisi manuellement
- **Historique / commentaires** : fil de notes horodatées par fiche, jamais écrasées
- **Tâches & relances** : tâches liées à un compte, dates de relance avec onglet dédié (en retard / cette semaine / à venir) et indicateur visuel sur les cartes Kanban
- **Statistiques** : compteurs (total, clients, prospects, anciens, CA, pipeline, relances) et graphiques de répartition
- **Import / Export** : CSV et **Excel** en import, CSV et PDF en export — accessibles directement en haut de l'écran
- **Champs personnalisés** : ajoutez une colonne à la volée sur n'importe quelle table du CRM depuis Paramètres, sans toucher au code
- **Boutons d'action** (Appeler, Envoyer un email, Envoyer le contrat, Relancer) : sur la fiche compte et sur chaque tâche. Ouvrent le client mail/téléphone par défaut (mailto:/tel:) avec sujet et corps pré-remplis ; demandent quel contact utiliser si plusieurs existent ; journalisent chaque action
- **Modèles d'email personnalisables** : sujet et corps modifiables par type d'action (relance, contrat, générique) depuis Paramètres, avec variables `{contact}`, `{compte}`, `{responsable}`, `{montant}`
- **Sélection multiple & actions groupées** : dans la vue Liste, cochez plusieurs fiches pour envoyer un email groupé ou relancer en masse — sans webhook, un seul brouillon Bcc générique s'ouvre (destinataires invisibles entre eux) ; avec un webhook configuré, chaque destinataire reçoit un e-mail personnalisé et séparé via n8n/Power Automate
- **Webhook (avancé)** : URL optionnelle configurable dans Paramètres pour relayer chaque action (individuelle ou groupée) vers un service externe (n8n, Power Automate) en vue d'un envoi automatisé réel — voir [EMAIL-AUTOMATISATION-CRM.md](EMAIL-AUTOMATISATION-CRM.md)
- **Filtres avancés dans la Liste** : Type, Statut et Responsable, en plus de la recherche libre
- **RGPD** : consentement par contact (avec date), export des données d'un contact (portabilité), suppression définitive (droit à l'oubli), confirmation systématique avant toute suppression
- **🆕 Système de mapping de colonnes** : utilisez vos propres tables et colonnes Grist existantes (voir [GUIDE_MAPPING.md](GUIDE_MAPPING.md))

---

## 🎨 Charte graphique

Le widget reprend l'identité visuelle de **La Suite numérique** :

| Usage | Couleur |
|-------|---------|
| Fond de page | `#FBFFFB` |
| Couleur principale (texte, boutons) | `#271A79` |
| Accent vert | `#B9FFB7` |
| Accent cyan | `#42B6C8` |
| Fond doux | `#EEFFEE` |
| Accent jaune (alertes) | `#FAF56D` |
| Accent menthe | `#A9EFC5` |
| Police | Barlow |

Les couleurs des statuts (étapes du pipeline, priorités) restent personnalisables par chaque organisation depuis l'onglet Paramètres.

---

## 🚀 Démarrage rapide

1. Dans Grist, cliquez sur **« Ajouter un widget à la page »**
2. Sélectionnez **« Personnalisé »** comme type de widget
3. Entrez l'URL du widget (hébergement à votre charge — voir *Déploiement* ci-dessous)
4. Définissez le niveau d'accès sur **« Full document access »**
5. C'est prêt ! Le widget crée automatiquement toutes ses tables (`CRM_Comptes`, `CRM_Contacts`, etc.) au premier chargement.

### ⚙️ Configuration requise

Le widget nécessite un **accès complet au document** (`Full document access`) pour :
- Créer et gérer les tables CRM
- Lire et écrire les données des comptes, contacts, contrats, tâches, équipe
- Détecter votre rôle (propriétaire / éditeur) afin d'adapter les actions disponibles

---

## 🛠️ Développement local

```bash
git clone <votre-repo>
cd grist-crm-widget
python3 -m http.server 8092
```

Puis dans Grist, utilisez : `http://localhost:8092/index.html`

---

## 📁 Structure des fichiers

```
grist-crm-widget/
├── index.html       # Interface HTML + CSS du widget
├── widget.js        # Logique JavaScript (Kanban, Liste, Relances, Stats, RGPD)
├── package.json     # Métadonnées
├── vercel.json       # Configuration Vercel (headers iframe)
├── GUIDE_MAPPING.md  # Guide du mapping de colonnes
├── EMAIL-AUTOMATISATION-CRM.md   # Guide d'envoi automatisé via n8n
├── n8n-grist-crm-email.json         # Workflow n8n — SMTP générique
├── n8n-grist-crm-email-gmail.json   # Workflow n8n — Gmail
├── n8n-grist-crm-email-outlook.json # Workflow n8n — Outlook / Microsoft 365
└── README.md
```

---

## 🗄️ Tables créées automatiquement

| Table | Rôle |
|-------|------|
| `CRM_Comptes` | Table principale : une ligne par client/prospect/ancien client |
| `CRM_Contacts` | Interlocuteurs liés à un compte (1 compte → plusieurs contacts) |
| `CRM_Contrats` | Contrats liés à un compte (montant, statut, dates, pièce jointe) |
| `CRM_Commentaires` | Fil d'historique / notes horodatées par compte |
| `CRM_Taches` | Tâches et relances liées à un compte |
| `CRM_Equipe` | Membres de l'équipe (Responsable de compte, Assigné à une tâche) |
| `CRM_Categories` / `CRM_Tags` | Filtres transverses optionnels |
| `CRM_Configuration` | Mapping des colonnes (voir GUIDE_MAPPING.md) |
| `CRM_Parametres` | Préférences du widget (étapes du pipeline personnalisées, etc.) |
| `CRM_JournalActivite` | Journal des actions (création, modification, suppression RGPD) — utile pour la traçabilité |

Toutes ces tables sont visibles et éditables directement dans Grist comme n'importe quelle autre table.

---

## 🔒 RGPD

Le widget intègre une gestion minimale de conformité pour les données de contact (nom, email, téléphone) :

- **Mention d'information** affichée dans l'onglet Contacts de chaque fiche
- **Case de consentement** par contact, horodatée
- **Export des données** d'un contact en un clic (format JSON, portabilité)
- **Suppression définitive** (droit à l'oubli), distincte de la suppression simple, avec confirmation explicite
- **Confirmation systématique** avant toute suppression (compte, contact, contrat, tâche, note, membre d'équipe)
- **Journal d'activité** (`CRM_JournalActivite`) conservant une trace des actions sensibles

Ceci constitue une base technique ; la conformité RGPD complète (mentions légales précises, durée de conservation, registre des traitements) reste de la responsabilité de l'organisation utilisatrice.

---

## 🔗 Ressources

- [Guide du mapping de colonnes](GUIDE_MAPPING.md)
- [Grist Custom Widgets Documentation](https://support.getgrist.com/widget-custom/)
- [Grist Plugin API](https://support.getgrist.com/code/modules/grist_plugin_api/)
