// Chargement de toutes les tables CRM depuis Grist vers l'état en mémoire (state.js).

import {
  comptes, contacts, contracts, equipe, crmComments, crmTasks, activityLog,
  currentUserEmail
} from '../state.js';
import {
  COMPTES_TABLE, CONTACTS_TABLE, CONTRATS_TABLE, COMMENTAIRES_TABLE, TACHES_TABLE, EQUIPE_TABLE,
  JOURNAL_TABLE
} from '../config/tables.js';
import { getColumnName, loadColumnMapping } from '../config/column-mapping.js';
import { refreshAllViews } from '../app.js';

export async function loadAllData() {
  await loadColumnMapping();

  // --- CRM_Equipe ---
  try {
    var equipeData = await grist.docApi.fetchTable(EQUIPE_TABLE);
    equipe.length = 0;
    if (equipeData && equipeData.id) {
      var eNameCol = getColumnName('equipe', 'name');
      var eEmailCol = getColumnName('equipe', 'email');
      var eRoleCol = getColumnName('equipe', 'role');
      for (var z = 0; z < equipeData.id.length; z++) {
        equipe.push({
          id: equipeData.id[z],
          Nom: equipeData[eNameCol] ? equipeData[eNameCol][z] : '',
          Email: equipeData[eEmailCol] ? equipeData[eEmailCol][z] : '',
          Role: equipeData[eRoleCol] ? equipeData[eRoleCol][z] : ''
        });
      }
    }
  } catch (e) {
    equipe.length = 0;
  }

  // --- CRM_Comptes ---
  try {
    var compteData = await grist.docApi.fetchTable(COMPTES_TABLE);
    comptes.length = 0;
    if (compteData && compteData.id) {
      var nameCol = getColumnName('comptes', 'name');
      var typeCol = getColumnName('comptes', 'type');
      var statusCol = getColumnName('comptes', 'status');
      var priorityCol = getColumnName('comptes', 'priority');
      var responsibleCol = getColumnName('comptes', 'responsible');
      var amountCol = getColumnName('comptes', 'amount');
      var contractsTotalCol = getColumnName('comptes', 'contractsTotal');
      var nextActionCol = getColumnName('comptes', 'nextAction');
      var nextActionDateCol = getColumnName('comptes', 'nextActionDate');
      var relanceDateCol = getColumnName('comptes', 'relanceDate');
      var categoryCol = getColumnName('comptes', 'category');
      var tagCol = getColumnName('comptes', 'tag');
      var descCol = getColumnName('comptes', 'description');
      var createdAtCol = getColumnName('comptes', 'createdAt');
      var websiteCol = getColumnName('comptes', 'website');
      var addressStreetCol = getColumnName('comptes', 'addressStreet');
      var addressZipCol = getColumnName('comptes', 'addressZip');
      var addressCityCol = getColumnName('comptes', 'addressCity');

      for (var i = 0; i < compteData.id.length; i++) {
        comptes.push({
          id: compteData.id[i],
          Name: compteData[nameCol] ? compteData[nameCol][i] : '',
          Type: compteData[typeCol] ? compteData[typeCol][i] : 'prospect',
          Status: compteData[statusCol] ? compteData[statusCol][i] : 'premier_contact',
          Priority: compteData[priorityCol] ? compteData[priorityCol][i] : 'medium',
          Responsible: compteData[responsibleCol] ? compteData[responsibleCol][i] : 0,
          Amount: compteData[amountCol] ? compteData[amountCol][i] : 0,
          Contracts_Total: compteData[contractsTotalCol] ? compteData[contractsTotalCol][i] : 0,
          Next_Action: compteData[nextActionCol] ? compteData[nextActionCol][i] : '',
          Next_Action_Date: compteData[nextActionDateCol] ? compteData[nextActionDateCol][i] : null,
          Relance_Date: compteData[relanceDateCol] ? compteData[relanceDateCol][i] : null,
          Category: compteData[categoryCol] ? compteData[categoryCol][i] : '',
          Tag: compteData[tagCol] ? compteData[tagCol][i] : '',
          Description: compteData[descCol] ? compteData[descCol][i] : '',
          Created_At: compteData[createdAtCol] ? compteData[createdAtCol][i] : null,
          Website: compteData[websiteCol] ? compteData[websiteCol][i] : '',
          Address_Street: compteData[addressStreetCol] ? compteData[addressStreetCol][i] : '',
          Address_Zip: compteData[addressZipCol] ? compteData[addressZipCol][i] : '',
          Address_City: compteData[addressCityCol] ? compteData[addressCityCol][i] : '',
          Client_Depuis: compteData.Client_Depuis ? compteData.Client_Depuis[i] : null,
          Address_Lat: compteData.Adresse_Lat ? compteData.Adresse_Lat[i] : null,
          Address_Lng: compteData.Adresse_Lng ? compteData.Adresse_Lng[i] : null,
          Departement: compteData.Departement ? compteData.Departement[i] : ''
        });
      }
    }
  } catch (e) {
    console.warn('[CRM] Could not load comptes:', e);
    comptes.length = 0;
  }

  // --- CRM_Contacts ---
  try {
    var contactData = await grist.docApi.fetchTable(CONTACTS_TABLE);
    contacts.length = 0;
    if (contactData && contactData.id) {
      var cNameCol = getColumnName('contacts', 'name');
      var cEmailCol = getColumnName('contacts', 'email');
      var cPhoneCol = getColumnName('contacts', 'phone');
      var cRoleCol = getColumnName('contacts', 'role');
      var cPrimaryCol = getColumnName('contacts', 'isPrimary');
      var cConsentCol = getColumnName('contacts', 'consent');
      var cConsentDateCol = getColumnName('contacts', 'consentDate');

      for (var j = 0; j < contactData.id.length; j++) {
        contacts.push({
          id: contactData.id[j],
          Compte_Id: contactData.Compte_Id ? contactData.Compte_Id[j] : null,
          Name: contactData[cNameCol] ? contactData[cNameCol][j] : '',
          Email: contactData[cEmailCol] ? contactData[cEmailCol][j] : '',
          Phone: contactData[cPhoneCol] ? contactData[cPhoneCol][j] : '',
          Role: contactData[cRoleCol] ? contactData[cRoleCol][j] : '',
          Is_Primary: contactData[cPrimaryCol] ? !!contactData[cPrimaryCol][j] : false,
          RGPD_Consent: contactData[cConsentCol] ? !!contactData[cConsentCol][j] : false,
          RGPD_Consent_Date: contactData[cConsentDateCol] ? contactData[cConsentDateCol][j] : null
        });
      }
    }
  } catch (e) {
    contacts.length = 0;
  }

  // --- CRM_Contrats ---
  try {
    var contractData = await grist.docApi.fetchTable(CONTRATS_TABLE);
    contracts.length = 0;
    if (contractData && contractData.id) {
      var lLabelCol = getColumnName('contrats', 'label');
      var lAmountCol = getColumnName('contrats', 'amount');
      var lStatusCol = getColumnName('contrats', 'status');
      var lStartCol = getColumnName('contrats', 'startDate');
      var lEndCol = getColumnName('contrats', 'endDate');

      for (var k = 0; k < contractData.id.length; k++) {
        contracts.push({
          id: contractData.id[k],
          Compte_Id: contractData.Compte_Id ? contractData.Compte_Id[k] : null,
          Label: contractData[lLabelCol] ? contractData[lLabelCol][k] : '',
          Amount: contractData[lAmountCol] ? contractData[lAmountCol][k] : 0,
          Status: contractData[lStatusCol] ? contractData[lStatusCol][k] : 'en_cours',
          Start_Date: contractData[lStartCol] ? contractData[lStartCol][k] : null,
          End_Date: contractData[lEndCol] ? contractData[lEndCol][k] : null,
          Fichier_Nom: contractData.Fichier_Nom ? contractData.Fichier_Nom[k] : '',
          Fichier_Type: contractData.Fichier_Type ? contractData.Fichier_Type[k] : '',
          Fichier_Data: contractData.Fichier_Data ? contractData.Fichier_Data[k] : ''
        });
      }
    }
  } catch (e) {
    contracts.length = 0;
  }

  // --- CRM_Commentaires ---
  try {
    var commentData = await grist.docApi.fetchTable(COMMENTAIRES_TABLE);
    crmComments.length = 0;
    if (commentData && commentData.id) {
      for (var m = 0; m < commentData.id.length; m++) {
        crmComments.push({
          id: commentData.id[m],
          Compte_Id: commentData.Compte_Id ? commentData.Compte_Id[m] : null,
          Author: commentData.Auteur ? commentData.Auteur[m] : '',
          Content: commentData.Contenu ? commentData.Contenu[m] : '',
          Created_At: commentData.Cree_Le ? commentData.Cree_Le[m] : null
        });
      }
    }
  } catch (e) {
    crmComments.length = 0;
  }

  // --- CRM_Taches ---
  try {
    var taskData = await grist.docApi.fetchTable(TACHES_TABLE);
    crmTasks.length = 0;
    if (taskData && taskData.id) {
      for (var n = 0; n < taskData.id.length; n++) {
        crmTasks.push({
          id: taskData.id[n],
          Compte_Id: taskData.Compte_Id ? taskData.Compte_Id[n] : null,
          Title: taskData.Titre ? taskData.Titre[n] : '',
          Status: taskData.Statut ? taskData.Statut[n] : 'a_faire',
          Due_Date: taskData.Date_Echeance ? taskData.Date_Echeance[n] : null,
          Assignee: taskData.Assigne_A ? taskData.Assigne_A[n] : 0,
          Created_At: taskData.Cree_Le ? taskData.Cree_Le[n] : null
        });
      }
    }
  } catch (e) {
    crmTasks.length = 0;
  }

  // --- CRM_JournalActivite ---
  try {
    var logData = await grist.docApi.fetchTable(JOURNAL_TABLE);
    activityLog.length = 0;
    if (logData && logData.id) {
      for (var r = 0; r < logData.id.length; r++) {
        activityLog.push({
          id: logData.id[r],
          Timestamp: logData.Horodatage ? logData.Horodatage[r] : null,
          User_Email: logData.Email_Utilisateur ? logData.Email_Utilisateur[r] : '',
          Action: logData.Action ? logData.Action[r] : '',
          Compte_Id: logData.Compte_Id ? logData.Compte_Id[r] : null,
          Compte_Name: logData.Nom_Compte ? logData.Nom_Compte[r] : '',
          Details: logData.Details ? logData.Details[r] : ''
        });
      }
    }
  } catch (e) {
    activityLog.length = 0;
  }

  refreshAllViews();
}

export async function logActivity(action, compteId, compteName, details) {
  try {
    await grist.docApi.applyUserActions([
      ['AddRecord', JOURNAL_TABLE, null, {
        Horodatage: Math.floor(Date.now() / 1000),
        Email_Utilisateur: currentUserEmail || '',
        Action: action,
        Compte_Id: compteId || 0,
        Nom_Compte: compteName || '',
        Details: details || ''
      }]
    ]);
  } catch (e) {
    console.log('[CRM] logActivity ignoré :', e.message);
  }
}
