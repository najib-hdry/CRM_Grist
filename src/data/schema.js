// Création des tables CRM au premier chargement + migrations pour les
// documents créés avant l'introduction de certaines colonnes/fonctionnalités.

import {
  COMPTES_TABLE, CONTACTS_TABLE, CONTRATS_TABLE, COMMENTAIRES_TABLE, TACHES_TABLE, EQUIPE_TABLE,
  CONFIG_TABLE, PARAMETRES_TABLE, JOURNAL_TABLE,
  DEFAULT_COMPTES_TABLE, DEFAULT_CONTACTS_TABLE, DEFAULT_CONTRATS_TABLE, DEFAULT_EQUIPE_TABLE
} from '../config/tables.js';
import { loadColumnMapping } from '../config/column-mapping.js';
import { getDepartementFromZip } from '../utils/geo.js';
import { showToast, t } from '../app.js';

// Synchronise la liste de choix (widgetOptions.choices) d'une colonne Grist de type Choice,
// pour que les valeurs personnalisées (types de comptes, étapes du pipeline) apparaissent
// dans le menu déroulant natif de Grist, et pas seulement comme texte libre.
export async function syncChoiceColumnOptions(tableName, columnName, items) {
  try {
    var choices = items.map(function(it) { return it.key; });
    var choiceOptions = {};
    items.forEach(function(it) {
      choiceOptions[it.key] = { fillColor: it.color || '#CCCCCC', textColor: '#271A79' };
    });
    await grist.docApi.applyUserActions([
      ['ModifyColumn', tableName, columnName, { widgetOptions: JSON.stringify({ choices: choices, choiceOptions: choiceOptions }) }]
    ]);
  } catch (e) {
    console.error('[CRM] Échec synchronisation des choix pour ' + tableName + '.' + columnName + ' :', e.message);
  }
}

export async function ensureTables() {
  try {
    var existingTables = await grist.docApi.listTables();

    // Si CRM_Configuration existe déjà, charger le mapping AVANT de décider quoi créer
    // (sinon on risquerait de recréer une table par défaut alors qu'elle a été remappée)
    if (existingTables.indexOf(CONFIG_TABLE) !== -1) {
      await loadColumnMapping();
    }

    // --- CRM_Equipe (membres de l'équipe — pour Responsable et Assigné à) ---
    if (EQUIPE_TABLE === DEFAULT_EQUIPE_TABLE && existingTables.indexOf(EQUIPE_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', EQUIPE_TABLE, [
          { id: 'Nom', type: 'Text' },
          { id: 'Email', type: 'Text' },
          { id: 'Role', type: 'Choice', widgetOptions: JSON.stringify({ choices: [] }) }
        ]]
      ]);
    }

    // --- CRM_Comptes (table principale : clients / prospects / anciens clients) ---
    if (COMPTES_TABLE === DEFAULT_COMPTES_TABLE && existingTables.indexOf(COMPTES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', COMPTES_TABLE, [
          { id: 'Nom', type: 'Text' },
          { id: 'Type', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['client', 'prospect', 'ancien'], choiceOptions: {
            client: { fillColor: '#42B6C8', textColor: '#271A79' },
            prospect: { fillColor: '#B9FFB7', textColor: '#271A79' },
            ancien: { fillColor: '#EEFFEE', textColor: '#271A79' }
          } }) },
          { id: 'Statut', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['premier_contact', 'negociation', 'signature', 'signe'] }) },
          { id: 'Priorite', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['high', 'medium', 'low'] }) },
          { id: 'Responsable', type: 'Ref:' + EQUIPE_TABLE },
          { id: 'Montant', type: 'Numeric' },
          { id: 'Prochaine_Action', type: 'Choice', widgetOptions: JSON.stringify({ choices: [] }) },
          { id: 'Date_Prochaine_Action', type: 'Date' },
          { id: 'Date_Relance', type: 'Date' },
          { id: 'Categorie', type: 'Choice', widgetOptions: JSON.stringify({ choices: [] }) },
          { id: 'Tag', type: 'Choice', widgetOptions: JSON.stringify({ choices: [] }) },
          { id: 'Description', type: 'Text' },
          { id: 'Site_Web', type: 'Text' },
          { id: 'Adresse_Rue', type: 'Text' },
          { id: 'Adresse_Code_Postal', type: 'Text' },
          { id: 'Adresse_Ville', type: 'Text' },
          { id: 'Adresse_Lat', type: 'Numeric' },
          { id: 'Adresse_Lng', type: 'Numeric' },
          { id: 'Departement', type: 'Text' },
          { id: 'Cree_Le', type: 'Date' },
          { id: 'Client_Depuis', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Contacts (1-N : interlocuteurs d'un compte) ---
    if (CONTACTS_TABLE === DEFAULT_CONTACTS_TABLE && existingTables.indexOf(CONTACTS_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', CONTACTS_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Nom', type: 'Text' },
          { id: 'Email', type: 'Text' },
          { id: 'Telephone', type: 'Text' },
          { id: 'Fonction', type: 'Text' },
          { id: 'Principal', type: 'Bool' },
          { id: 'RGPD_Consentement', type: 'Bool' },
          { id: 'RGPD_Date_Consentement', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Contrats (1-N : contrats liés à un compte, avec pièce jointe) ---
    if (CONTRATS_TABLE === DEFAULT_CONTRATS_TABLE && existingTables.indexOf(CONTRATS_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', CONTRATS_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Intitule', type: 'Text' },
          { id: 'Montant', type: 'Numeric' },
          { id: 'Statut', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['en_cours', 'signe', 'termine', 'annule'] }) },
          { id: 'Date_Debut', type: 'Date' },
          { id: 'Date_Fin', type: 'Date' },
          { id: 'Fichier_Nom', type: 'Text' },
          { id: 'Fichier_Type', type: 'Text' },
          { id: 'Fichier_Data', type: 'Text' }
        ]]
      ]);
    }

    // --- CRM_Commentaires (fil d'historique / notes horodatées par compte) ---
    if (existingTables.indexOf(COMMENTAIRES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', COMMENTAIRES_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Auteur', type: 'Text' },
          { id: 'Contenu', type: 'Text' },
          { id: 'Cree_Le', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Taches (tâches / relances liées à un compte — propre au CRM) ---
    if (existingTables.indexOf(TACHES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', TACHES_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Titre', type: 'Text' },
          { id: 'Statut', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['a_faire', 'fait'] }) },
          { id: 'Date_Echeance', type: 'Date' },
          { id: 'Assigne_A', type: 'Ref:' + EQUIPE_TABLE },
          { id: 'Cree_Le', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Configuration (mapping des colonnes — cf. GUIDE_MAPPING.md) ---
    if (existingTables.indexOf(CONFIG_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', CONFIG_TABLE, [
          { id: 'Cle_Config', type: 'Text' },
          { id: 'Nom_Table', type: 'Text' },
          { id: 'Nom_Colonne', type: 'Text' },
          { id: 'Libelle_Affiche', type: 'Text' },
          { id: 'Obligatoire', type: 'Bool' },
          { id: 'Valeur_Defaut', type: 'Text' }
        ]]
      ]);

      var defaultConfig = [
        ['compte_name', COMPTES_TABLE, 'Nom', 'Nom', true, 'Nom'],
        ['compte_type', COMPTES_TABLE, 'Type', 'Type', true, 'Type'],
        ['compte_status', COMPTES_TABLE, 'Statut', 'Statut', false, 'Statut'],
        ['compte_priority', COMPTES_TABLE, 'Priorite', 'Priorité', false, 'Priorite'],
        ['compte_responsible', COMPTES_TABLE, 'Responsable', 'Responsable', false, 'Responsable'],
        ['compte_amount', COMPTES_TABLE, 'Montant', 'Montant', false, 'Montant'],
        ['compte_contracts_total', COMPTES_TABLE, 'Total_Contrats', 'Total contrats', false, 'Total_Contrats'],
        ['compte_next_action', COMPTES_TABLE, 'Prochaine_Action', 'Prochaine action', false, 'Prochaine_Action'],
        ['compte_next_action_date', COMPTES_TABLE, 'Date_Prochaine_Action', 'Date prochaine action', false, 'Date_Prochaine_Action'],
        ['compte_relance_date', COMPTES_TABLE, 'Date_Relance', 'Date de relance', false, 'Date_Relance'],
        ['compte_category', COMPTES_TABLE, 'Categorie', 'Catégorie', false, 'Categorie'],
        ['compte_tag', COMPTES_TABLE, 'Tag', 'Tag', false, 'Tag'],
        ['compte_description', COMPTES_TABLE, 'Description', 'Notes', false, 'Description'],
        ['compte_created_at', COMPTES_TABLE, 'Cree_Le', 'Créé le', false, 'Cree_Le'],
        ['compte_website', COMPTES_TABLE, 'Site_Web', 'Site web', false, 'Site_Web'],
        ['compte_address_street', COMPTES_TABLE, 'Adresse_Rue', 'Adresse', false, 'Adresse_Rue'],
        ['compte_address_zip', COMPTES_TABLE, 'Adresse_Code_Postal', 'Code postal', false, 'Adresse_Code_Postal'],
        ['compte_address_city', COMPTES_TABLE, 'Adresse_Ville', 'Ville', false, 'Adresse_Ville'],
        ['contact_name', CONTACTS_TABLE, 'Nom', 'Nom', true, 'Nom'],
        ['contact_email', CONTACTS_TABLE, 'Email', 'Email', false, 'Email'],
        ['contact_phone', CONTACTS_TABLE, 'Telephone', 'Téléphone', false, 'Telephone'],
        ['contact_role', CONTACTS_TABLE, 'Fonction', 'Fonction', false, 'Fonction'],
        ['contact_is_primary', CONTACTS_TABLE, 'Principal', 'Contact principal', false, 'Principal'],
        ['contact_consent', CONTACTS_TABLE, 'RGPD_Consentement', 'Consentement RGPD', false, 'RGPD_Consentement'],
        ['contact_consent_date', CONTACTS_TABLE, 'RGPD_Date_Consentement', 'Date consentement', false, 'RGPD_Date_Consentement'],
        ['contract_label', CONTRATS_TABLE, 'Intitule', 'Intitulé', true, 'Intitule'],
        ['contract_amount', CONTRATS_TABLE, 'Montant', 'Montant', false, 'Montant'],
        ['contract_status', CONTRATS_TABLE, 'Statut', 'Statut', false, 'Statut'],
        ['contract_start_date', CONTRATS_TABLE, 'Date_Debut', 'Date début', false, 'Date_Debut'],
        ['contract_end_date', CONTRATS_TABLE, 'Date_Fin', 'Date fin', false, 'Date_Fin'],
        ['equipe_name', EQUIPE_TABLE, 'Nom', 'Nom', true, 'Nom'],
        ['equipe_email', EQUIPE_TABLE, 'Email', 'Email', false, 'Email'],
        ['equipe_role', EQUIPE_TABLE, 'Role', 'Rôle', false, 'Role']
      ];

      var configRecords = defaultConfig.map(function(c) {
        return { Cle_Config: c[0], Nom_Table: c[1], Nom_Colonne: c[2], Libelle_Affiche: c[3], Obligatoire: c[4], Valeur_Defaut: c[5] };
      });

      await grist.docApi.applyUserActions([
        ['BulkAddRecord', CONFIG_TABLE, configRecords.map(function() { return null; }), configRecords]
      ]);
    }

    // --- CRM_Parametres (préférences widget : statuts Kanban personnalisés, etc.) ---
    if (existingTables.indexOf(PARAMETRES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', PARAMETRES_TABLE, [
          { id: 'Cle', type: 'Text' },
          { id: 'Valeur', type: 'Text' }
        ]]
      ]);
    }

    // --- CRM_JournalActivite (traçabilité — utile aussi pour le RGPD) ---
    if (existingTables.indexOf(JOURNAL_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', JOURNAL_TABLE, [
          { id: 'Horodatage', type: 'Date' },
          { id: 'Email_Utilisateur', type: 'Text' },
          { id: 'Action', type: 'Text' },
          { id: 'Compte_Id', type: 'Int' },
          { id: 'Nom_Compte', type: 'Text' },
          { id: 'Details', type: 'Text' }
        ]]
      ]);
    }

    // Migration : ajouter la colonne calculée Total_Contrats sur CRM_Comptes
    // (créée après coup car la formule référence CRM_Contrats, qui doit déjà exister)
    try {
      var compteCols = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      if (compteCols.indexOf('Total_Contrats') === -1) {
        await grist.docApi.applyUserActions([
          ['AddColumn', COMPTES_TABLE, 'Total_Contrats', {
            type: 'Numeric',
            isFormula: true,
            formula: 'sum([c.Montant for c in ' + CONTRATS_TABLE + '.lookupRecords(Compte_Id=$id) if c.Statut == "signe"])'
          }]
        ]);
        console.log('[CRM] Total_Contrats ajouté à ' + COMPTES_TABLE);
      }
    } catch (e) {
      console.log('[CRM] Migration Total_Contrats ignorée :', e.message);
    }

    // Migration : ajouter Site_Web et les champs d'adresse sur CRM_Comptes
    // (pour les documents créés avant l'introduction de ces champs)
    try {
      var compteColsAddr = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      var addressFields = [
        ['Site_Web', 'Text'],
        ['Adresse_Rue', 'Text'],
        ['Adresse_Code_Postal', 'Text'],
        ['Adresse_Ville', 'Text']
      ];
      for (var af = 0; af < addressFields.length; af++) {
        var fieldName = addressFields[af][0];
        var fieldType = addressFields[af][1];
        if (compteColsAddr.indexOf(fieldName) === -1) {
          await grist.docApi.applyUserActions([
            ['AddColumn', COMPTES_TABLE, fieldName, { type: fieldType }]
          ]);
          console.log('[CRM] ' + fieldName + ' ajouté à ' + COMPTES_TABLE);
        }
      }
    } catch (e) {
      console.log('[CRM] Migration Site_Web/Adresse ignorée :', e.message);
    }

    // Migration : suppression de la file d'attente email (fonctionnalité retirée) sur les
    // documents créés avant sa suppression — colonnes de CRM_Comptes et réglages associés.
    try {
      var compteColsEmailCleanup = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      var emailColsToRemove = ['Email_Status', 'Email_Sujet', 'Email_Corps', 'Email_Destinataire'];
      for (var ec = 0; ec < emailColsToRemove.length; ec++) {
        if (compteColsEmailCleanup.indexOf(emailColsToRemove[ec]) !== -1) {
          await grist.docApi.applyUserActions([['RemoveColumn', COMPTES_TABLE, emailColsToRemove[ec]]]);
          console.log('[CRM] ' + emailColsToRemove[ec] + ' supprimée de ' + COMPTES_TABLE);
        }
      }
    } catch (e) {
      console.error('[CRM] Nettoyage colonnes email ignoré :', e.message);
    }

    // Nettoyage des réglages obsolètes (fonctionnalités email/webhook et masquage Kanban
    // par délai, toutes deux retirées) sur les documents créés avant leur suppression.
    try {
      var paramsDataCleanup = await grist.docApi.fetchTable(PARAMETRES_TABLE);
      if (paramsDataCleanup && paramsDataCleanup.id) {
        var obsoleteSettingKeys = ['webhook_url', 'email_templates', 'kanban_hide_client_days'];
        var removeSettingActions = [];
        for (var ps = 0; ps < paramsDataCleanup.id.length; ps++) {
          if (obsoleteSettingKeys.indexOf(paramsDataCleanup.Cle[ps]) !== -1) {
            removeSettingActions.push(['RemoveRecord', PARAMETRES_TABLE, paramsDataCleanup.id[ps]]);
          }
        }
        if (removeSettingActions.length) await grist.docApi.applyUserActions(removeSettingActions);
      }
    } catch (e) {
      console.error('[CRM] Nettoyage réglages obsolètes ignoré :', e.message);
    }

    try {
      var compteColsClient = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      if (compteColsClient.indexOf('Client_Depuis') === -1) {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, 'Client_Depuis', { type: 'Date' }]]);
        console.log('[CRM] Client_Depuis ajouté à ' + COMPTES_TABLE);
      }
    } catch (e) {
      console.error('[CRM] Migration Client_Depuis ignorée :', e.message);
    }

    try {
      var compteColsGeo = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      if (compteColsGeo.indexOf('Adresse_Lat') === -1) {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, 'Adresse_Lat', { type: 'Numeric' }]]);
      }
      if (compteColsGeo.indexOf('Adresse_Lng') === -1) {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, 'Adresse_Lng', { type: 'Numeric' }]]);
      }
      if (compteColsGeo.indexOf('Departement') === -1) {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, 'Departement', { type: 'Text' }]]);
        // Backfill : calcule le département des fiches déjà existantes à partir de leur code postal
        var compteDataBackfill = await grist.docApi.fetchTable(COMPTES_TABLE);
        if (compteDataBackfill && compteDataBackfill.id) {
          var backfillActions = [];
          for (var bf = 0; bf < compteDataBackfill.id.length; bf++) {
            var zipBf = compteDataBackfill.Adresse_Code_Postal ? compteDataBackfill.Adresse_Code_Postal[bf] : '';
            var deptBf = getDepartementFromZip(zipBf);
            if (deptBf) backfillActions.push(['UpdateRecord', COMPTES_TABLE, compteDataBackfill.id[bf], { Departement: deptBf }]);
          }
          if (backfillActions.length) await grist.docApi.applyUserActions(backfillActions);
        }
      }
    } catch (e) {
      console.error('[CRM] Migration Departement ignorée :', e.message);
    }

    // Migration : Prochaine_Action était en Texte libre, passe en Choix unique
    // (les valeurs stockées, des clés comme 'appel_1', restent valides dans les deux cas).
    try {
      await grist.docApi.applyUserActions([
        ['ModifyColumn', COMPTES_TABLE, 'Prochaine_Action', { type: 'Choice' }]
      ]);
    } catch (e) {
      console.error('[CRM] Migration Prochaine_Action (Choix) ignorée :', e.message);
    }

    // Migration : Tag était en Texte libre, passe en Choix unique (la liste des valeurs est
    // désormais gérée dans Paramètres — cf. getTagsList() dans settings-domain.js) ; les
    // valeurs déjà stockées restent valides dans les deux cas.
    try {
      await grist.docApi.applyUserActions([
        ['ModifyColumn', COMPTES_TABLE, 'Tag', { type: 'Choice' }]
      ]);
    } catch (e) {
      console.error('[CRM] Migration Tag (Choix) ignorée :', e.message);
    }

    // Migration : la table CRM_Tags (jamais exploitée par le widget) est retirée au profit
    // de la liste de choix gérée dans Paramètres, sur la colonne Tag elle-même.
    try {
      var tablesForTagsCleanup = await grist.docApi.listTables();
      if (tablesForTagsCleanup.indexOf('CRM_Tags') !== -1) {
        await grist.docApi.applyUserActions([['RemoveTable', 'CRM_Tags']]);
        console.log('[CRM] Table CRM_Tags supprimée (remplacée par la liste de choix Tag)');
      }
    } catch (e) {
      console.error('[CRM] Suppression de CRM_Tags ignorée :', e.message);
    }

    // Migration : Categorie était en Texte libre, passe en Choix unique (la liste des valeurs
    // est désormais gérée dans Paramètres — cf. getCategoriesList() dans settings-domain.js) ;
    // les valeurs déjà stockées restent valides dans les deux cas.
    try {
      await grist.docApi.applyUserActions([
        ['ModifyColumn', COMPTES_TABLE, 'Categorie', { type: 'Choice' }]
      ]);
    } catch (e) {
      console.error('[CRM] Migration Categorie (Choix) ignorée :', e.message);
    }

    // Migration : la table CRM_Categories (jamais exploitée par le widget) est retirée au
    // profit de la liste de choix gérée dans Paramètres, sur la colonne Categorie elle-même.
    try {
      var tablesForCategoriesCleanup = await grist.docApi.listTables();
      if (tablesForCategoriesCleanup.indexOf('CRM_Categories') !== -1) {
        await grist.docApi.applyUserActions([['RemoveTable', 'CRM_Categories']]);
        console.log('[CRM] Table CRM_Categories supprimée (remplacée par la liste de choix Categorie)');
      }
    } catch (e) {
      console.error('[CRM] Suppression de CRM_Categories ignorée :', e.message);
    }

    // Le toast ne doit apparaître que si des tables ont réellement été créées
    // (sinon il s'affichait à chaque ouverture du widget, même sans rien créer).
    var finalTables = await grist.docApi.listTables();
    if (finalTables.length > existingTables.length) {
      showToast(t('tablesCreated'), 'success');
    }
  } catch (e) {
    console.error('[CRM] Error ensuring tables:', e);
  }
}
