// =============================================================================
// GRIST CRM WIDGET — Gestion Prospects / Clients
// =============================================================================

import { todayEpoch, daysFromNow, toEpoch, formatDate, epochToInputDate, addDaysToDateInput } from './utils/dates.js';
import { sanitize, formatAmount, escapeCsv, sanitizeFilename, capitalize, slugifyTypeKey, fillTemplate } from './utils/format.js';
import { DEPARTEMENTS_FR, getDepartementFromZip, getDepartementLabel, getCompteDepartement } from './utils/geo.js';
import { getTextColorForBackground } from './utils/colors.js';
import {
  comptes, contacts, contracts, equipe, crmComments, crmTasks, activityLog,
  currentFilterType, currentFilterPriority, currentFilterCategory, currentFilterTag,
  kanbanSearch, kanbanShowAll, isOwner, isEditor, currentUserEmail, currentTab,
  setRole, setCurrentUserEmail, setCurrentFilterType, setCurrentFilterCategory, setKanbanSearchState, setKanbanShowAllState, setCurrentTab
} from './state.js';
import {
  COMPTES_TABLE, CONTACTS_TABLE, CONTRATS_TABLE, COMMENTAIRES_TABLE, TACHES_TABLE, EQUIPE_TABLE,
  CONFIG_TABLE, PARAMETRES_TABLE, JOURNAL_TABLE,
  DEFAULT_COMPTES_TABLE, DEFAULT_CONTACTS_TABLE, DEFAULT_CONTRATS_TABLE, DEFAULT_EQUIPE_TABLE
} from './config/tables.js';
import { columnMapping, getColumnName, setField } from './config/column-mapping.js';
import { syncChoiceColumnOptions, ensureTables } from './data/schema.js';
import { loadAllData, logActivity } from './data/load.js';
import {
  getContactsForCompte, getContractsForCompte, getCommentsForCompte, getTasksForCompte, getCompteById,
  getSignedContractsTotal, getPrimaryContact, getEquipeMemberById, getEquipeMemberName, buildEquipeOptions
} from './data/relations.js';
import {
  getFilteredComptes, isStageStopFollowUp, isRelanceOverdue, isRelanceUpcoming, getRelanceComptes
} from './data/filtering.js';
import { getVal } from './ui/dom.js';
import { createCompte, saveCompteFromModal, deleteCompte } from './crud/comptes.js';
import { addContact, setContactConsent, deleteContact, exportContactData, rgpdDeleteContact } from './crud/contacts.js';
import { addContract, downloadContractFile, updateFileLabel, deleteContract } from './crud/contracts.js';
import { addCrmComment, deleteCrmComment, editCrmComment, cancelCrmCommentEdit, saveCrmComment } from './crud/comments.js';
import { addCrmTask, clearRelance, toggleCrmTask, deleteCrmTask } from './crud/tasks.js';
import { buildEquipeRoleOptions, handleEquipeRoleSelectChange, addEquipeMember, deleteEquipeMember } from './crud/equipe.js';
import {
  renderKanbanView, renderCompteCard, onKanbanDragStart, onKanbanDragOver, onKanbanDragLeave,
  onKanbanDrop, setKanbanSearch, setKanbanShowAll, setFilterType, setFilterCategory
} from './views/kanban.js';
import {
  renderTableView, sortTable,
  setTableFilterTypes, setTableFilterPriorities
} from './views/table.js';
export { renderTableView };
import { renderRelancesView } from './views/relances.js';
import { renderStatsView } from './views/stats.js';
import {
  setCarteFilterType, setCarteFilterDepartement, setCarteMode, setCarteMetric,
  computeRegionAggregates, renderCarteView, closeAllPopups
} from './views/carte.js';
import {
  editModalActiveTab, setEditModalActiveTab, editModalDraft, clearEditModalDraft,
  toggleModalExpand, openEditCompteModal, openNewCompteModal, switchModalTab, onAddressStreetInput,
  hideAddressSuggestions, selectAddressSuggestion, refreshNextActionOptions, recalcRelanceDate,
  closeModal, showConfirmModal, handleTagSelectChange, handleCategorySelectChange
} from './modal/compte-modal.js';
import { exportComptesToCsv } from './io/export.js';
import { triggerCsvImport, triggerExcelImport, handleCsvImport, handleExcelImport } from './io/import.js';
import {
  getAccountTypes, getAccountTypeLabel, updateAccountTypeDraftLabel, updateAccountTypeDraftColor,
  addAccountTypeDraft, removeAccountTypeDraft, commitAccountTypes, refreshTypeSelects,
  getNextActions, getNextActionLabel, getNextActionReminderDays,
  updateNextActionDraftLabel, updateNextActionDraftDays, addNextActionDraft, removeNextActionDraft, commitNextActions,
  getKanbanStatuses, getStatusLabel, getStatusColor,
  onStatusDragStart, onStatusDragOver, onStatusDragEnd, onStatusDrop,
  updateKanbanStatusDraft, updateKanbanStatusFlag, addKanbanStatusDraft, removeKanbanStatusDraft, commitKanbanStatuses,
  getTagsList, getTagLabel, addTagValue,
  updateTagDraftLabel, updateTagDraftColor, addTagDraft, removeTagDraft, commitTagsList,
  getCategoriesList, getCategoryLabel, addCategoryValue,
  updateCategoryDraftLabel, updateCategoryDraftColor, addCategoryDraft, removeCategoryDraft, commitCategoriesList,
  refreshCategorySelects,
  getEquipeRoles, addEquipeRole,
  loadSettings,
  renderSettingsView, addCustomField
} from './settings/settings-domain.js';
export {
  getAccountTypes, getAccountTypeLabel, getNextActions, getNextActionLabel, getNextActionReminderDays,
  getKanbanStatuses, getStatusLabel, getStatusColor,
  getTagsList, getTagLabel, addTagValue,
  getCategoriesList, getCategoryLabel, addCategoryValue,
  getEquipeRoles, addEquipeRole, renderSettingsView
};
export {
  editModalActiveTab, setEditModalActiveTab, editModalDraft, clearEditModalDraft,
  openEditCompteModal, openNewCompteModal, closeModal, showConfirmModal
};

// =============================================================================
// I18N (FR uniquement pour cette version — structure prête pour EN plus tard)
// =============================================================================

export var currentLang = 'fr';

var i18n = {
  fr: {
    appTitle: 'CRM',
    appSubtitle: 'Suivez vos prospects, clients et contrats.',
    notInGrist: 'Ce widget doit être utilisé dans Grist.',
    tabKanban: 'Pipeline',
    tabTable: 'Liste',
    tabRelances: 'À relancer',
    tabStats: 'Statistiques',
    tabSettings: 'Paramètres',
    newCompte: 'Nouveau',
    newCompteClient: 'Nouveau client',
    newCompteProspect: 'Nouveau prospect',
    statTotal: 'Total',
    statClients: 'Clients',
    statProspects: 'Prospects',
    statAnciens: 'Anciens clients',
    statCA: 'CA clients (cumulé)',
    statPipeline: 'Pipeline prospects',
    statRelances: 'Relances en attente',
    statRelancesLate: 'Relances en retard',
    noComptes: 'Aucune fiche',
    addCompte: '+ Ajouter une fiche',
    tableTitle: 'Liste des comptes',
    tableSubtitle: 'Tous vos clients et prospects, recherche et tri avancés',
    searchPlaceholder: 'Rechercher (nom, contact, email...)',
    allTypes: 'Tous types',
    allStatuses: 'Tous les statuts',
    allPriorities: 'Toutes priorités',
    colName: 'Nom',
    colType: 'Type',
    colStatus: 'Statut',
    colPriority: 'Priorité',
    colResponsible: 'Responsable',
    colAmount: 'Montant',
    colNextAction: 'Prochaine action',
    colRelance: 'Relance',
    colActions: 'Supprimer',
    typeClient: 'Client',
    typeProspect: 'Prospect',
    typeAncien: 'Ancien client',
    priorityHigh: 'Haute',
    priorityMedium: 'Moyenne',
    priorityLow: 'Basse',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    confirmDelete: 'Supprimer cette fiche ? Cette action supprimera aussi ses contacts, contrats, commentaires et tâches liés.',
    compteCreated: 'Fiche créée !',
    compteUpdated: 'Fiche mise à jour !',
    compteDeleted: 'Fiche supprimée.',
    compteMoved: 'Fiche déplacée.',
    notDefined: 'Non défini',
    overdue: 'en retard',
    noDate: 'Aucune date',
    tablesCreated: 'Tables créées automatiquement.',
    exportCsv: 'Export CSV',
    importCsv: 'Importer CSV',
    statistics: 'Statistiques',
    statsTitle: 'Statistiques',
    statsSubtitle: 'Vue d\u2019ensemble de votre activité commerciale',
    modalNewCompte: 'Nouvelle fiche',
    modalEditCompte: 'Modifier la fiche',
    fieldName: 'Nom *',
    fieldType: 'Type *',
    fieldStatus: 'Statut',
    fieldPriority: 'Priorité',
    fieldResponsible: 'Responsable',
    fieldAmount: 'Montant (€)',
    fieldContractsTotal: 'Total contrats actifs',
    fieldNextAction: 'Prochaine action',
    fieldNextActionDate: 'Date prochaine action',
    fieldRelanceDate: 'Date de relance',
    fieldCategory: 'Catégorie',
    fieldTag: 'Tag',
    fieldDescription: 'Notes générales',
    fieldWebsite: 'Site web',
    fieldAddressStreet: 'Adresse',
    fieldAddressZip: 'Code postal',
    fieldAddressCity: 'Ville',
    contactsTitle: 'Contacts',
    addContact: '+ Ajouter un contact',
    contractsTitle: 'Contrats',
    addContract: '+ Ajouter un contrat',
    commentsTitle: 'Historique / Commentaires',
    addComment: 'Ajouter une note',
    tasksTitle: 'Tâches & relances',
    addTask: '+ Ajouter une tâche',
    rgpdTitle: 'RGPD',
    rgpdConsent: 'Consentement contact obtenu',
    rgpdExport: 'Exporter les données du contact',
    rgpdDelete: 'Supprimer définitivement ce contact',
    rgpdNotice: 'Les données de contact (nom, email, téléphone) sont conservées pour la gestion de la relation commerciale. Conformément au RGPD, la personne concernée peut demander l\u2019accès, la rectification ou la suppression de ses données.',
    settingsTitle: 'Paramètres',
    settingsSubtitle: 'Personnalisez les colonnes du pipeline et le mapping des tables',
    kanbanColumnsConfig: 'Colonnes du pipeline (Kanban)',
    mappingConfig: 'Mapping des tables Grist',
  }
};

export function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || key;
}

// =============================================================================
// UTILS
// =============================================================================

function isInsideGrist() {
  try { return window.frameElement !== null || window !== window.parent; }
  catch (e) { return true; }
}

export function showToast(msg, type, duration) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, duration || 3000);
}

// =============================================================================
// VIEW SWITCHING
// =============================================================================

function switchTab(tab) {
  setCurrentTab(tab);
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
  });
  document.querySelectorAll('.tab-content').forEach(function(el) {
    el.classList.toggle('active', el.id === 'tab-' + tab);
  });
  refreshAllViews();
  try { localStorage.setItem('crm-active-tab', tab); } catch (e) {}
}

function restoreActiveTab() {
  try {
    var saved = localStorage.getItem('crm-active-tab');
    if (saved) {
      setCurrentTab(saved);
      document.querySelectorAll('.tab-btn').forEach(function(btn) { btn.classList.toggle('active', btn.getAttribute('data-tab') === saved); });
      document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.toggle('active', el.id === 'tab-' + saved); });
    }
  } catch (e) {}
}

export function refreshAllViews() {
  refreshTypeSelects();
  refreshCategorySelects();
  updateStatsBadges();
  if (currentTab === 'kanban') renderKanbanView();
  else if (currentTab === 'table') renderTableView();
  else if (currentTab === 'relances') renderRelancesView();
  else if (currentTab === 'stats') renderStatsView();
  else if (currentTab === 'carte') renderCarteView();
  else if (currentTab === 'settings') renderSettingsView();
}

function updateStatsBadges() {
  var relanceLateBadge = document.getElementById('relance-late-badge');
  var lateComptes = comptes.filter(isRelanceOverdue);
  if (relanceLateBadge) {
    var count = lateComptes.length;
    relanceLateBadge.textContent = count > 0 ? count : '';
    relanceLateBadge.classList.toggle('hidden', count === 0);
  }
  renderRelanceBanner(lateComptes);
}

function renderRelanceBanner(lateComptes) {
  var container = document.getElementById('relance-banner-container');
  if (!container) return;

  var soonComptes = comptes.filter(isRelanceUpcoming);

  if (lateComptes.length === 0 && soonComptes.length === 0) {
    container.innerHTML = '';
    return;
  }

  var isLate = lateComptes.length > 0;
  var list = isLate ? lateComptes : soonComptes;
  var names = list.slice(0, 3).map(function(c) { return c.Name; }).join(', ');
  var extra = list.length > 3 ? (currentLang === 'fr' ? ' et ' + (list.length - 3) + ' autre(s)' : ' and ' + (list.length - 3) + ' more') : '';

  var text = isLate
    ? (currentLang === 'fr'
        ? lateComptes.length + ' relance' + (lateComptes.length > 1 ? 's' : '') + ' en retard : ' + names + extra
        : lateComptes.length + ' overdue follow-up(s): ' + names + extra)
    : (currentLang === 'fr'
        ? soonComptes.length + ' relance' + (soonComptes.length > 1 ? 's' : '') + ' à venir cette semaine : ' + names + extra
        : soonComptes.length + ' upcoming follow-up(s) this week: ' + names + extra);

  var html = '<div class="relance-banner ' + (isLate ? 'late' : '') + '" onclick="switchTab(\'relances\')">';
  html += '<span class="relance-banner-icon">' + (isLate ? '🔴' : '🟡') + '</span>';
  html += '<span class="relance-banner-text">' + sanitize(text) + '</span>';
  html += '<span class="relance-banner-link">' + (currentLang === 'fr' ? 'Voir les relances →' : 'View follow-ups →') + '</span>';
  html += '</div>';
  container.innerHTML = html;
}

// =============================================================================
// INIT
// =============================================================================

if (!isInsideGrist()) {
  document.getElementById('not-in-grist').classList.remove('hidden');
  document.getElementById('main-content').classList.add('hidden');
} else {
  (async function() {
    await grist.ready({ requiredAccess: 'full' });

    // --- Role detection (Owner / Editor / Viewer), même méthode que le widget PM ---
    var USER_INFO_TABLE = 'CRM_UserInfo';
    var helperWriteSucceeded = false;

    try {
      var existingTabs = await grist.docApi.listTables();
      if (existingTabs.indexOf(USER_INFO_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ['AddTable', USER_INFO_TABLE, [{ id: 'UserEmail', fields: { type: 'Text', label: 'UserEmail' } }]]
        ]);
        await grist.docApi.applyUserActions([
          ['ModifyColumn', USER_INFO_TABLE, 'UserEmail', { isFormula: false, formula: 'user.Email', recalcWhen: 2, recalcDeps: null }]
        ]);
      }
    } catch (e) {
      console.warn('[CRM] Could not create helper table:', e.message);
    }

    try {
      try {
        var existingData = await grist.docApi.fetchTable(USER_INFO_TABLE);
        var rowIds = (existingData && existingData.id) ? existingData.id : [];
        var actions = [];
        for (var r = 0; r < rowIds.length; r++) actions.push(['RemoveRecord', USER_INFO_TABLE, rowIds[r]]);
        actions.push(['AddRecord', USER_INFO_TABLE, null, {}]);
        await grist.docApi.applyUserActions(actions);
        helperWriteSucceeded = true;
      } catch (writeErr) {
        console.log('[CRM] Could not refresh row (read-only?):', writeErr.message);
      }

      var tokenInfo = await grist.docApi.getAccessToken({ readOnly: true });
      var tableResp = await fetch(tokenInfo.baseUrl + '/tables/' + USER_INFO_TABLE + '/records?auth=' + tokenInfo.token);
      if (tableResp.ok) {
        var tableData = await tableResp.json();
        if (tableData.records && tableData.records.length > 0) {
          setCurrentUserEmail(tableData.records[0].fields.UserEmail || '');
        }
      } else {
        var userInfoData = await grist.docApi.fetchTable(USER_INFO_TABLE);
        if (userInfoData && userInfoData.UserEmail && userInfoData.UserEmail.length > 0) {
          setCurrentUserEmail(userInfoData.UserEmail[0] || '');
        }
      }
    } catch (e) {
      console.warn('[CRM] Could not read helper table:', e.message);
    }

    var roleDetected = false;
    try {
      await grist.docApi.applyUserActions([
        ['ModifyColumn', USER_INFO_TABLE, 'UserEmail', { isFormula: false, formula: 'user.Email', recalcWhen: 2, recalcDeps: null }]
      ]);
      setRole(true, false); roleDetected = true;
    } catch (structErr) {
      if (helperWriteSucceeded) { setRole(false, true); roleDetected = true; }
      else { setRole(false, false); roleDetected = true; }
    }
    if (!roleDetected) {
      if (helperWriteSucceeded) { setRole(false, true); }
      else { setRole(false, false); }
    }
    console.log('[CRM] Role detection — isOwner:', isOwner, 'isEditor:', isEditor, 'email:', currentUserEmail);

    await ensureTables();
    await loadSettings();
    await loadAllData();
    restoreActiveTab();
    refreshAllViews();

    // Synchro live : recharge si la table change ailleurs (autre utilisateur, édition directe Grist)
    if (typeof grist.onRecords === 'function') {
      var _liveReloadTimer = null;
      grist.onRecords(function() {
        if (_liveReloadTimer) clearTimeout(_liveReloadTimer);
        _liveReloadTimer = setTimeout(function() {
          var modal = document.getElementById('modal-container');
          if (modal && modal.innerHTML.trim() !== '') return;
          loadAllData();
        }, 500);
      });
    }
  })();
}

// =============================================================================
// EXPOSITION GLOBALE (window) — nécessaire car esbuild encapsule ce bundle dans
// une IIFE. Le HTML généré dynamiquement utilise des attributs onclick/onchange/
// oninput/onblur qui référencent ces fonctions par leur nom global : sans cette
// exposition explicite, elles resteraient piégées dans le scope du bundle.
// =============================================================================
Object.assign(window, {
  addAccountTypeDraft, addCategoryDraft, addContact, addContract, addCrmComment, addCrmTask, addCustomField,
  addEquipeMember, addKanbanStatusDraft, addNextActionDraft, addTagDraft, cancelCrmCommentEdit, clearRelance,
  closeAllPopups, closeModal, commitAccountTypes, commitCategoriesList,
  commitKanbanStatuses, commitNextActions, commitTagsList, createCompte,
  deleteCompte, deleteContact, deleteContract, deleteCrmComment, deleteCrmTask, deleteEquipeMember,
  downloadContractFile, editCrmComment, exportComptesToCsv,
  exportContactData, handleCategorySelectChange, handleCsvImport, handleEquipeRoleSelectChange, handleExcelImport, handleTagSelectChange,
  hideAddressSuggestions, onAddressStreetInput, onKanbanDragLeave, onKanbanDragOver,
  onKanbanDragStart, onKanbanDrop, onStatusDragEnd, onStatusDragOver, onStatusDragStart, onStatusDrop,
  openEditCompteModal, recalcRelanceDate, refreshNextActionOptions, removeAccountTypeDraft, removeCategoryDraft,
  removeKanbanStatusDraft, removeNextActionDraft, removeTagDraft, renderTableView,
  rgpdDeleteContact, saveCompteFromModal, saveCrmComment, selectAddressSuggestion,
  setCarteFilterDepartement, setCarteFilterType, setCarteMetric, setCarteMode, setContactConsent,
  setFilterCategory, setFilterType, setKanbanSearch, setKanbanShowAll, sortTable, switchModalTab, switchTab,
  toggleCrmTask, toggleModalExpand,
  triggerCsvImport, triggerExcelImport, updateAccountTypeDraftColor,
  updateAccountTypeDraftLabel, updateCategoryDraftColor, updateCategoryDraftLabel, updateFileLabel, updateKanbanStatusDraft,
  updateKanbanStatusFlag, updateNextActionDraftDays, updateNextActionDraftLabel,
  updateTagDraftColor, updateTagDraftLabel
});
