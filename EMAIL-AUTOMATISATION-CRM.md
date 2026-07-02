# 🔔📧 Envoi d'e-mails automatisé (CRM) — Guide n8n

Comment passer du **mailto: manuel** (un brouillon s'ouvre dans votre messagerie) à un **envoi automatisé réel**, individuel ou en masse, via n8n.

---

## 🧭 Le principe en 30 secondes

Contrairement au widget Gestion de projet (qui pose un webhook *sur Grist*), le widget **CRM appelle directement un webhook depuis le navigateur** à chaque action :

1. Vous cliquez sur **Envoyer un email**, **Relancer**, **Envoyer le contrat** (sur une fiche ou en sélection groupée dans la Liste)
2. Si aucun **webhook** n'est configuré dans **Paramètres → Automatisation** : un brouillon s'ouvre dans votre messagerie (mailto:), comme avant
3. Si un **webhook** est configuré : le widget envoie directement les données (destinataire, sujet, corps déjà personnalisés) à cette URL en HTTP POST, sans ouvrir votre messagerie
4. n8n reçoit cette requête et envoie le ou les e-mails à votre place, via votre propre compte (Gmail, Outlook, ou tout serveur SMTP)

> ⚠️ **Aucune configuration côté Grist n'est nécessaire** pour cette fonctionnalité (pas de webhook Grist, pas de variable d'environnement serveur). Tout se passe entre le widget et n8n.

| Étape | Qui le fait | Automatique ? |
|-------|-------------|----------------|
| Préparer sujet/corps personnalisés par destinataire | Le widget | ✅ Oui |
| Appeler le webhook | Le widget | ✅ Oui, dès qu'une URL est renseignée dans Paramètres |
| Envoyer l'e-mail réellement | n8n | ✅ après configuration (ce guide) |

---

## Étape 1 — Importer le workflow dans n8n

Téléchargez le fichier correspondant à votre messagerie, puis dans n8n : **menu ⋮ (en haut à droite) → Import from File**.

| Messagerie | Fichier |
|------------|---------|
| **Gmail** (OAuth) | n8n-grist-crm-email-gmail.json |
| **Outlook / Microsoft 365** (OAuth) | n8n-grist-crm-email-outlook.json |
| **Tout autre serveur SMTP** | n8n-grist-crm-email.json |

## Étape 2 — Configurer le nœud d'envoi

Ouvrez le nœud **« Envoyer l'e-mail »** et associez vos identifiants :
- **Gmail** : connexion OAuth2 à votre compte Google
- **Outlook** : connexion OAuth2 à votre compte Microsoft 365
- **SMTP** : hôte, port, identifiant, mot de passe de votre serveur mail, et adresse d'expédition

## Étape 3 — Activer le workflow et récupérer l'URL

1. Activez le workflow (bouton en haut à droite de l'éditeur n8n)
2. Cliquez sur le nœud **Webhook**, copiez l'**URL de production** (pas l'URL de test)

## Étape 4 — Coller l'URL dans le widget

Dans le widget CRM : **Paramètres → Automatisation (avancé) → URL du webhook**, collez l'URL copiée, puis **Enregistrer**.

C'est tout — les prochains clics sur Envoyer un email / Relancer / Envoyer le contrat (individuels ou en sélection groupée) passeront automatiquement par n8n.

---

## 📦 Ce que le widget envoie

### Action individuelle (un seul destinataire)

```json
{
  "type": "action_email",
  "compte": "Société Exemple",
  "contact": "Marie Dupont",
  "email": "marie@exemple.fr",
  "subject": "Suivi de notre échange — Société Exemple",
  "body": "Bonjour Marie,\n\n..."
}
```

`type` vaut `action_email`, `action_relance` ou `action_send_contract` selon le bouton utilisé.

### Action groupée (sélection multiple dans la Liste)

```json
{
  "type": "bulk_email",
  "recipients": [
    { "email": "marie@exemple.fr", "contact": "Marie Dupont", "compte": "Société A", "subject": "...", "body": "Bonjour Marie,\n\n..." },
    { "email": "paul@exemple.fr", "contact": "Paul Martin", "compte": "Société B", "subject": "...", "body": "Bonjour Paul,\n\n..." }
  ]
}
```

`type` vaut `bulk_email` ou `bulk_relance`. **Chaque destinataire a déjà son sujet et son corps personnalisés** (variables `{contact}`, `{compte}`, `{responsable}`, `{montant}` déjà remplacées côté widget) — n8n n'a rien à personnaliser, juste à envoyer.

Le workflow fourni gère les deux formats automatiquement (un nœud « Normaliser les destinataires » détecte s'il y a un tableau `recipients` ou un seul destinataire direct) : **aucun destinataire ne voit jamais les autres**, chaque e-mail est envoyé séparément par n8n.

---

## 🆘 Dépannage

- **Rien ne se passe au clic** : vérifiez que le workflow est bien *activé* dans n8n (pas seulement sauvegardé), et que l'URL collée dans Paramètres est l'URL *de production* (pas celle affichée en mode test/écoute).
- **L'e-mail part mais sans le bon contenu** : vérifiez que les expressions `{{ $json.subject }}` et `{{ $json.body }}` n'ont pas été modifiées dans le nœud d'envoi.
- **Erreur CORS dans la console du widget** : certains hébergements n8n restreignent les origines autorisées sur les webhooks ; vérifiez les paramètres CORS de votre instance n8n ou de votre reverse proxy.
- **Vous préférez Power Automate** : le principe est identique (un flux HTTP déclenché par requête, qui boucle sur `recipients` et envoie un e-mail Outlook par destinataire) — voir POWER-AUTOMATE-GUIDE.md pour la configuration générale d'un flux HTTP dans Power Automate, à adapter avec le payload ci-dessus.
