// Domaine "Paramètres" : types de comptes, prochaines actions, statuts Kanban,
// rôles équipe, modèles email, et le stockage clé/valeur (CRM_Parametres) qui
// les persiste. Regroupés dans un seul module (plutôt qu'un fichier par
// domaine) car chaque partie a son état "brouillon" propre, ses fonctions de
// rendu et ses commits, mais tous se rechargent ensemble depuis loadSettings()
// et doivent rester synchronisés avec les colonnes Choice de Grist.
//
// Vue Paramètres (rendu HTML de l'onglet) et éditeur de modèles email inclus
// ici aussi : ils lisent/écrivent directement cet état.

import { equipe, isOwner } from '../state.js';
import { sanitize, slugifyTypeKey } from '../utils/format.js';
import { getVal } from '../ui/dom.js';
import {
  COMPTES_TABLE, CONTACTS_TABLE, CONTRATS_TABLE, TACHES_TABLE, EQUIPE_TABLE, PARAMETRES_TABLE
} from '../config/tables.js';
import { columnMapping, getColumnName } from '../config/column-mapping.js';
import { syncChoiceColumnOptions } from '../data/schema.js';
import { buildEquipeRoleOptions } from '../crud/equipe.js';
import { showToast, t, currentLang, refreshAllViews } from '../app.js';

// --- ACCOUNT TYPES (personnalisables — client / prospect / ancien + custom) ---

var defaultAccountTypes = [
  { key: 'client',   label: 'Client',        color: '#42B6C8' },
  { key: 'prospect', label: 'Prospect',      color: '#B9FFB7' },
  { key: 'ancien',   label: 'Ancien client', color: '#EEFFEE' }
];
var customAccountTypes = null;

export function getAccountTypes() {
  return customAccountTypes || defaultAccountTypes;
}
export function getAccountTypeLabel(key) {
  var found = getAccountTypes().find(function(t) { return t.key === key; });
  return found ? found.label : key;
}
async function saveAccountTypes() {
  await saveSetting('account_types', JSON.stringify(customAccountTypes));
}

// draft pour l'éditeur dans Paramètres
var draftAccountTypes = null;

function renderAccountTypeList() {
  var list = draftAccountTypes || getAccountTypes();
  var html = '';
  if (!list.length) html += '<div class="empty-state">Aucun type</div>';
  list.forEach(function(type, idx) {
    var color = type.color || '#CCCCCC';
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="color" value="' + color + '" title="Couleur du badge" onchange="updateAccountTypeDraftColor(' + idx + ', this.value)">';
    html += '<input type="text" value="' + sanitize(type.label) + '" oninput="updateAccountTypeDraftLabel(' + idx + ', this.value)">';
    html += '<button class="btn-icon" title="Supprimer" onclick="removeAccountTypeDraft(' + idx + ')">🗑️</button>';
    html += '</div>';
  });
  html += '<div class="kanban-status-edit-row">';
  html += '<input type="text" id="new-account-type-name" placeholder="' + (currentLang === 'fr' ? 'Nom du nouveau type' : 'New type name') + '" style="flex:1;">';
  html += '</div>';
  return html;
}

function applyAccountTypeStyles() {
  var existing = document.getElementById('account-type-dynamic-styles');
  if (!existing) {
    existing = document.createElement('style');
    existing.id = 'account-type-dynamic-styles';
    document.head.appendChild(existing);
  }
  var types = getAccountTypes();
  var css = types.map(function(t) {
    var color = t.color || '#CCCCCC';
    // texte blanc si couleur foncée, sinon primaire
    var r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
    var lum = (0.299*r + 0.587*g + 0.114*b) / 255;
    var textColor = lum < 0.55 ? 'white' : 'var(--color-primary)';
    return '.type-' + t.key + ' { background: ' + color + ' !important; color: ' + textColor + ' !important; }';
  }).join('\n');
  existing.textContent = css;
}

export function updateAccountTypeDraftLabel(idx, val) {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  draftAccountTypes[idx].label = val;
}

export function updateAccountTypeDraftColor(idx, val) {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  draftAccountTypes[idx].color = val;
}

export function addAccountTypeDraft() {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  var label = getVal('new-account-type-name', '').trim();
  if (!label) {
    showToast(currentLang === 'fr' ? 'Indiquez un nom de type avant d’ajouter' : 'Enter a type name before adding', 'error');
    return;
  }
  var slug = slugifyTypeKey(label);
  var existingKeys = draftAccountTypes.map(function(t) { return t.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  draftAccountTypes.push({ key: finalKey, label: label, color: '#CCCCCC' });
  commitAccountTypes();
}

export function removeAccountTypeDraft(idx) {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  draftAccountTypes.splice(idx, 1);
  document.getElementById('account-type-list').innerHTML = renderAccountTypeList();
}

export async function commitAccountTypes() {
  if (!draftAccountTypes) return;
  var previousTypes = customAccountTypes;
  var newTypes = draftAccountTypes;
  customAccountTypes = newTypes;
  draftAccountTypes = null;
  try {
    await saveAccountTypes();
  } catch (e) {
    customAccountTypes = previousTypes;
    console.error('[CRM] Échec sauvegarde types de comptes :', e);
    showToast((currentLang === 'fr' ? 'Échec de l’enregistrement : ' : 'Save failed: ') + e.message, 'error', 8000);
    return;
  }
  applyAccountTypeStyles();
  refreshTypeSelects();
  var listEl = document.getElementById('account-type-list');
  if (listEl) listEl.innerHTML = renderAccountTypeList();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'type'), newTypes);
  showToast(currentLang === 'fr' ? 'Types de comptes enregistrés' : 'Account types saved', 'success');
}

export function refreshTypeSelects() {
  var types = getAccountTypes();
  // Kanban toolbar
  var kanbanSel = document.getElementById('kanban-type-select');
  if (kanbanSel) {
    var cur = kanbanSel.value;
    kanbanSel.innerHTML = '<option value="">' + t('allTypes') + '</option>' +
      types.map(function(tp) { return '<option value="' + tp.key + '"' + (cur === tp.key ? ' selected' : '') + '>' + sanitize(tp.label) + '</option>'; }).join('');
  }
  // Table filter
  var tableSel = document.getElementById('table-filter-type');
  if (tableSel) {
    var cur2 = tableSel.value;
    tableSel.innerHTML = '<option value="">' + t('allTypes') + '</option>' +
      types.map(function(tp) { return '<option value="' + tp.key + '"' + (cur2 === tp.key ? ' selected' : '') + '>' + sanitize(tp.label) + '</option>'; }).join('');
  }
}

// --- PROCHAINE ACTION (personnalisable par type — prospect / client) — chaque action a un
// délai de relance (en jours) utilisé pour calculer automatiquement la date de relance. ---

var defaultNextActionsProspect = [
  { key: 'premier_appel',    label: 'Premier appel',       reminderDays: 3 },
  { key: 'envoi_devis',      label: 'Envoi devis',         reminderDays: 5 },
  { key: 'relance_devis',    label: 'Relance devis',       reminderDays: 3 },
  { key: 'rdv_decouverte',   label: 'RDV découverte',      reminderDays: 2 },
  { key: 'envoi_contrat',    label: 'Envoi contrat',       reminderDays: 3 }
];
var defaultNextActionsClient = [
  { key: 'renouvellement_contrat', label: 'Renouvellement contrat',         reminderDays: 7 },
  { key: 'point_suivi',            label: 'Point de suivi',                 reminderDays: 5 },
  { key: 'facture_a_envoyer',      label: 'Facture à envoyer',              reminderDays: 3 },
  { key: 'upsell',                 label: 'Proposition complémentaire',     reminderDays: 5 }
];
var customNextActionsProspect = null;
var customNextActionsClient = null;

export function getNextActions(compteType) {
  if (compteType === 'client' || compteType === 'ancien') return customNextActionsClient || defaultNextActionsClient;
  return customNextActionsProspect || defaultNextActionsProspect;
}
export function getNextActionLabel(compteType, key) {
  if (!key) return '';
  var all = (customNextActionsProspect || defaultNextActionsProspect).concat(customNextActionsClient || defaultNextActionsClient);
  var found = all.find(function(a) { return a.key === key; });
  return found ? found.label : key;
}
export function getNextActionReminderDays(compteType, key) {
  var found = getNextActions(compteType).find(function(a) { return a.key === key; });
  return found ? found.reminderDays : null;
}
// Fusionne les actions prospect + client (dédupliquées par clé) pour alimenter
// la liste de choix native Grist de la colonne Prochaine_Action, commune aux deux types.
function getAllNextActionsMerged() {
  var seen = {};
  var merged = [];
  (customNextActionsProspect || defaultNextActionsProspect).concat(customNextActionsClient || defaultNextActionsClient).forEach(function(a) {
    if (!seen[a.key]) { seen[a.key] = true; merged.push(a); }
  });
  return merged;
}
async function saveNextActionsProspect() {
  await saveSetting('next_actions_prospect', JSON.stringify(customNextActionsProspect));
}
async function saveNextActionsClient() {
  await saveSetting('next_actions_client', JSON.stringify(customNextActionsClient));
}

var draftNextActionsProspect = null;
var draftNextActionsClient = null;

function renderNextActionsList(kind) {
  var isClient = kind === 'client';
  var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
  var list = draftVar || getNextActions(isClient ? 'client' : 'prospect');
  var html = '';
  if (!list.length) html += '<div class="empty-state">Aucune action</div>';
  list.forEach(function(a, idx) {
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="text" value="' + sanitize(a.label) + '" oninput="updateNextActionDraftLabel(\'' + kind + '\', ' + idx + ', this.value)">';
    html += '<input type="number" min="0" value="' + (a.reminderDays != null ? a.reminderDays : 3) + '" title="' + (currentLang === 'fr' ? 'Relancer après (jours)' : 'Follow up after (days)') + '" style="width:60px;" onchange="updateNextActionDraftDays(\'' + kind + '\', ' + idx + ', this.value)">';
    html += '<span class="settings-hint" style="white-space:nowrap;">' + (currentLang === 'fr' ? 'j.' : 'd.') + '</span>';
    html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Supprimer' : 'Delete') + '" onclick="removeNextActionDraft(\'' + kind + '\', ' + idx + ')">🗑️</button>';
    html += '</div>';
  });
  html += '<div class="kanban-status-edit-row">';
  html += '<input type="text" id="new-next-action-' + kind + '" placeholder="' + (currentLang === 'fr' ? 'Nom de la nouvelle action' : 'New action name') + '" style="flex:1;">';
  html += '</div>';
  return html;
}

export function updateNextActionDraftLabel(kind, idx, val) {
  var isClient = kind === 'client';
  if (isClient) { if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions('client'))); draftNextActionsClient[idx].label = val; }
  else { if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions('prospect'))); draftNextActionsProspect[idx].label = val; }
}

export function updateNextActionDraftDays(kind, idx, val) {
  var days = parseInt(val, 10) || 0;
  var isClient = kind === 'client';
  if (isClient) { if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions('client'))); draftNextActionsClient[idx].reminderDays = days; }
  else { if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions('prospect'))); draftNextActionsProspect[idx].reminderDays = days; }
}

export function addNextActionDraft(kind) {
  var isClient = kind === 'client';
  var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
  if (!draftVar) { draftVar = JSON.parse(JSON.stringify(getNextActions(isClient ? 'client' : 'prospect'))); if (isClient) draftNextActionsClient = draftVar; else draftNextActionsProspect = draftVar; }
  var label = getVal('new-next-action-' + kind, '').trim();
  if (!label) {
    showToast(currentLang === 'fr' ? 'Indiquez un nom d’action avant d’ajouter' : 'Enter an action name before adding', 'error');
    return;
  }
  var slug = slugifyTypeKey(label);
  var existingKeys = draftVar.map(function(a) { return a.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  draftVar.push({ key: finalKey, label: label, reminderDays: 3 });
  commitNextActions(kind);
}

export function removeNextActionDraft(kind, idx) {
  var isClient = kind === 'client';
  if (isClient) { if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions('client'))); draftNextActionsClient.splice(idx, 1); }
  else { if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions('prospect'))); draftNextActionsProspect.splice(idx, 1); }
  commitNextActions(kind);
}

export async function commitNextActions(kind) {
  var isClient = kind === 'client';
  var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
  if (!draftVar) return;
  try {
    if (isClient) { customNextActionsClient = draftVar; draftNextActionsClient = null; await saveNextActionsClient(); }
    else { customNextActionsProspect = draftVar; draftNextActionsProspect = null; await saveNextActionsProspect(); }
  } catch (e) {
    console.error('[CRM] Échec sauvegarde actions :', e);
    showToast((currentLang === 'fr' ? 'Échec de l’enregistrement : ' : 'Save failed: ') + e.message, 'error', 8000);
    return;
  }
  var listEl = document.getElementById('next-actions-list-' + kind);
  if (listEl) listEl.innerHTML = renderNextActionsList(kind);
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'nextAction'), getAllNextActionsMerged());
  showToast(currentLang === 'fr' ? 'Actions enregistrées' : 'Actions saved', 'success');
}

// --- KANBAN STATUSES (personnalisables — comme le widget PM) ---

var defaultKanbanStatuses = [
  { key: 'nouveau',         label: 'Nouveau',         color: '#a855f7' },
  { key: 'premier_contact', label: 'Premier contact', color: '#3b82f6' },
  { key: 'negociation',     label: 'En négociation',  color: '#f59e0b' },
  { key: 'signature',       label: 'En signature',    color: '#8b5cf6' },
  { key: 'signe',           label: 'Contrat signé',   color: '#22c55e', marksAsClient: true },
  { key: 'perdu',           label: 'Perdu',           color: '#94a3b8', stopFollowUp: true }
];
var customKanbanStatuses = null;
export function getKanbanStatuses() {
  return customKanbanStatuses || defaultKanbanStatuses;
}
async function saveKanbanStatuses() {
  await saveSetting('kanban_statuses', JSON.stringify(customKanbanStatuses));
}
export function getStatusLabel(key) {
  var statuses = getKanbanStatuses();
  var found = statuses.find(function(s) { return s.key === key; });
  return found ? found.label : key;
}
export function getStatusColor(key) {
  var statuses = getKanbanStatuses();
  var found = statuses.find(function(s) { return s.key === key; });
  return found ? found.color : '#94a3b8';
}

var draftKanbanStatuses = null;

function renderKanbanStatusList() {
  var html = '';
  draftKanbanStatuses.forEach(function(s, i) {
    html += '<div class="kanban-status-edit-row" draggable="true" data-index="' + i + '" ondragstart="onStatusDragStart(event, ' + i + ')" ondragover="onStatusDragOver(event)" ondrop="onStatusDrop(event, ' + i + ')" ondragend="onStatusDragEnd(event)">';
    html += '<span class="drag-handle" title="' + (currentLang === 'fr' ? 'Glisser pour réordonner' : 'Drag to reorder') + '">⠿</span>';
    html += '<input type="color" value="' + s.color + '" onchange="updateKanbanStatusDraft(' + i + ', \'color\', this.value)">';
    html += '<input type="text" value="' + sanitize(s.label) + '" onchange="updateKanbanStatusDraft(' + i + ', \'label\', this.value)">';
    html += '<label class="stage-flag-check" title="' + (currentLang === 'fr' ? 'Convertit automatiquement le prospect en client' : 'Automatically converts prospect to client') + '"><input type="checkbox" ' + (s.marksAsClient ? 'checked' : '') + ' onchange="updateKanbanStatusFlag(' + i + ', \'marksAsClient\', this.checked)"> 🤝</label>';
    html += '<label class="stage-flag-check" title="' + (currentLang === 'fr' ? 'Sans suite : arrête les relances et prochaines actions' : 'No follow-up: stops reminders and next actions') + '"><input type="checkbox" ' + (s.stopFollowUp ? 'checked' : '') + ' onchange="updateKanbanStatusFlag(' + i + ', \'stopFollowUp\', this.checked)"> 🚫</label>';
    html += '<button class="btn-icon" onclick="removeKanbanStatusDraft(' + i + ')">🗑️</button>';
    html += '</div>';
  });
  return html;
}

var draggedStatusIndex = null;

export function onStatusDragStart(e, index) {
  draggedStatusIndex = index;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
}

export function onStatusDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over-row');
}

export function onStatusDragEnd(e) {
  document.querySelectorAll('.kanban-status-edit-row').forEach(function(el) {
    el.classList.remove('dragging', 'drag-over-row');
  });
}

export function onStatusDrop(e, targetIndex) {
  e.preventDefault();
  document.querySelectorAll('.kanban-status-edit-row').forEach(function(el) { el.classList.remove('drag-over-row'); });
  if (draggedStatusIndex === null || draggedStatusIndex === targetIndex) return;

  var moved = draftKanbanStatuses.splice(draggedStatusIndex, 1)[0];
  draftKanbanStatuses.splice(targetIndex, 0, moved);
  draggedStatusIndex = null;

  document.getElementById('kanban-status-list').innerHTML = renderKanbanStatusList();
}

export function updateKanbanStatusDraft(index, field, value) {
  draftKanbanStatuses[index][field] = value;
  if (field === 'label') {
    draftKanbanStatuses[index].key = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || ('stage_' + index);
  }
}

export function updateKanbanStatusFlag(index, flag, checked) {
  draftKanbanStatuses[index][flag] = checked;
}

export function addKanbanStatusDraft() {
  draftKanbanStatuses.push({ key: 'stage_' + draftKanbanStatuses.length, label: currentLang === 'fr' ? 'Nouvelle étape' : 'New stage', color: '#64748b' });
  document.getElementById('kanban-status-list').innerHTML = renderKanbanStatusList();
}

export function removeKanbanStatusDraft(index) {
  draftKanbanStatuses.splice(index, 1);
  document.getElementById('kanban-status-list').innerHTML = renderKanbanStatusList();
}

export async function commitKanbanStatuses() {
  customKanbanStatuses = draftKanbanStatuses;
  await saveKanbanStatuses();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'status'), customKanbanStatuses);
  showToast(currentLang === 'fr' ? 'Pipeline mis à jour' : 'Pipeline updated', 'success');
  refreshAllViews();
}

// --- TAGS (liste de choix personnalisable pour CRM_Comptes.Tag — gérée dans Paramètres,
// et complétable à la volée depuis la fiche compte, cf. addTagValue()) ---

var defaultTagsList = [];
var customTagsList = null;

export function getTagsList() {
  return customTagsList || defaultTagsList;
}
export function getTagLabel(key) {
  if (!key) return '';
  var found = getTagsList().find(function(tg) { return tg.key === key; });
  return found ? found.label : key;
}
async function saveTagsList() {
  await saveSetting('tags_list', JSON.stringify(customTagsList));
}

// Ajoute un tag à la volée (depuis la fiche compte) et le sauvegarde immédiatement —
// contrairement aux autres listes de Paramètres, il n'y a pas de brouillon ici car
// l'ajout se fait en dehors de l'écran Paramètres.
export async function addTagValue(label) {
  var list = getTagsList().slice();
  var slug = slugifyTypeKey(label);
  var existingKeys = list.map(function(tg) { return tg.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  var newTag = { key: finalKey, label: label, color: '#CCCCCC' };
  list.push(newTag);
  customTagsList = list;
  await saveTagsList();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'tag'), customTagsList);
  return newTag;
}

// draft pour l'éditeur dans Paramètres
var draftTagsList = null;

function renderTagsList() {
  var list = draftTagsList || getTagsList();
  var html = '';
  if (!list.length) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucun tag' : 'No tag') + '</div>';
  list.forEach(function(tg, idx) {
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="color" value="' + (tg.color || '#CCCCCC') + '" title="' + (currentLang === 'fr' ? 'Couleur du badge' : 'Badge color') + '" onchange="updateTagDraftColor(' + idx + ', this.value)">';
    html += '<input type="text" value="' + sanitize(tg.label) + '" oninput="updateTagDraftLabel(' + idx + ', this.value)">';
    html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Supprimer' : 'Delete') + '" onclick="removeTagDraft(' + idx + ')">🗑️</button>';
    html += '</div>';
  });
  html += '<div class="kanban-status-edit-row">';
  html += '<input type="text" id="new-tag-name" placeholder="' + (currentLang === 'fr' ? 'Nom du nouveau tag' : 'New tag name') + '" style="flex:1;">';
  html += '</div>';
  return html;
}

export function updateTagDraftLabel(idx, val) {
  if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
  draftTagsList[idx].label = val;
}

export function updateTagDraftColor(idx, val) {
  if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
  draftTagsList[idx].color = val;
}

export function addTagDraft() {
  if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
  var label = getVal('new-tag-name', '').trim();
  if (!label) {
    showToast(currentLang === 'fr' ? 'Indiquez un nom de tag avant d’ajouter' : 'Enter a tag name before adding', 'error');
    return;
  }
  var slug = slugifyTypeKey(label);
  var existingKeys = draftTagsList.map(function(tg) { return tg.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  draftTagsList.push({ key: finalKey, label: label, color: '#CCCCCC' });
  commitTagsList();
}

export function removeTagDraft(idx) {
  if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
  draftTagsList.splice(idx, 1);
  document.getElementById('tags-list').innerHTML = renderTagsList();
}

export async function commitTagsList() {
  if (!draftTagsList) return;
  var previousTags = customTagsList;
  customTagsList = draftTagsList;
  draftTagsList = null;
  try {
    await saveTagsList();
  } catch (e) {
    customTagsList = previousTags;
    console.error('[CRM] Échec sauvegarde des tags :', e);
    showToast((currentLang === 'fr' ? 'Échec de l’enregistrement : ' : 'Save failed: ') + e.message, 'error', 8000);
    return;
  }
  var listEl = document.getElementById('tags-list');
  if (listEl) listEl.innerHTML = renderTagsList();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'tag'), customTagsList);
  showToast(currentLang === 'fr' ? 'Tags enregistrés' : 'Tags saved', 'success');
}

// --- CATÉGORIES (liste de choix personnalisable pour CRM_Comptes.Categorie — gérée dans
// Paramètres, complétable à la volée depuis la fiche compte, cf. addCategoryValue() ; et
// utilisée par le filtre Catégorie du Kanban, cf. refreshCategorySelects()) ---

var defaultCategoriesList = [];
var customCategoriesList = null;

export function getCategoriesList() {
  return customCategoriesList || defaultCategoriesList;
}
export function getCategoryLabel(key) {
  if (!key) return '';
  var found = getCategoriesList().find(function(c) { return c.key === key; });
  return found ? found.label : key;
}
async function saveCategoriesList() {
  await saveSetting('categories_list', JSON.stringify(customCategoriesList));
}

// Ajoute une catégorie à la volée (depuis la fiche compte) et la sauvegarde immédiatement —
// pas de brouillon ici, l'ajout se fait en dehors de l'écran Paramètres.
export async function addCategoryValue(label) {
  var list = getCategoriesList().slice();
  var slug = slugifyTypeKey(label);
  var existingKeys = list.map(function(c) { return c.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  var newCategory = { key: finalKey, label: label, color: '#CCCCCC' };
  list.push(newCategory);
  customCategoriesList = list;
  await saveCategoriesList();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'category'), customCategoriesList);
  refreshCategorySelects();
  return newCategory;
}

// draft pour l'éditeur dans Paramètres
var draftCategoriesList = null;

function renderCategoriesList() {
  var list = draftCategoriesList || getCategoriesList();
  var html = '';
  if (!list.length) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucune catégorie' : 'No category') + '</div>';
  list.forEach(function(c, idx) {
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="color" value="' + (c.color || '#CCCCCC') + '" title="' + (currentLang === 'fr' ? 'Couleur du badge' : 'Badge color') + '" onchange="updateCategoryDraftColor(' + idx + ', this.value)">';
    html += '<input type="text" value="' + sanitize(c.label) + '" oninput="updateCategoryDraftLabel(' + idx + ', this.value)">';
    html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Supprimer' : 'Delete') + '" onclick="removeCategoryDraft(' + idx + ')">🗑️</button>';
    html += '</div>';
  });
  html += '<div class="kanban-status-edit-row">';
  html += '<input type="text" id="new-category-name" placeholder="' + (currentLang === 'fr' ? 'Nom de la nouvelle catégorie' : 'New category name') + '" style="flex:1;">';
  html += '</div>';
  return html;
}

export function updateCategoryDraftLabel(idx, val) {
  if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
  draftCategoriesList[idx].label = val;
}

export function updateCategoryDraftColor(idx, val) {
  if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
  draftCategoriesList[idx].color = val;
}

export function addCategoryDraft() {
  if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
  var label = getVal('new-category-name', '').trim();
  if (!label) {
    showToast(currentLang === 'fr' ? 'Indiquez un nom de catégorie avant d’ajouter' : 'Enter a category name before adding', 'error');
    return;
  }
  var slug = slugifyTypeKey(label);
  var existingKeys = draftCategoriesList.map(function(c) { return c.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  draftCategoriesList.push({ key: finalKey, label: label, color: '#CCCCCC' });
  commitCategoriesList();
}

export function removeCategoryDraft(idx) {
  if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
  draftCategoriesList.splice(idx, 1);
  document.getElementById('categories-list').innerHTML = renderCategoriesList();
}

export async function commitCategoriesList() {
  if (!draftCategoriesList) return;
  var previousCategories = customCategoriesList;
  customCategoriesList = draftCategoriesList;
  draftCategoriesList = null;
  try {
    await saveCategoriesList();
  } catch (e) {
    customCategoriesList = previousCategories;
    console.error('[CRM] Échec sauvegarde des catégories :', e);
    showToast((currentLang === 'fr' ? 'Échec de l’enregistrement : ' : 'Save failed: ') + e.message, 'error', 8000);
    return;
  }
  var listEl = document.getElementById('categories-list');
  if (listEl) listEl.innerHTML = renderCategoriesList();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'category'), customCategoriesList);
  refreshCategorySelects();
  showToast(currentLang === 'fr' ? 'Catégories enregistrées' : 'Categories saved', 'success');
}

export function refreshCategorySelects() {
  var cats = getCategoriesList();
  var kanbanSel = document.getElementById('kanban-category-select');
  if (kanbanSel) {
    var cur = kanbanSel.value;
    kanbanSel.innerHTML = '<option value="">' + (currentLang === 'fr' ? 'Toutes catégories' : 'All categories') + '</option>' +
      cats.map(function(c) { return '<option value="' + c.key + '"' + (cur === c.key ? ' selected' : '') + '>' + sanitize(c.label) + '</option>'; }).join('');
  }
}

// --- EQUIPE ROLES (single-select avec création de rôles à la volée) ---

var defaultEquipeRoles = ['Commercial', 'Manager', 'Support', 'Direction'];
var customEquipeRoles = null;
export function getEquipeRoles() {
  return customEquipeRoles || defaultEquipeRoles;
}
async function saveEquipeRoles() {
  await saveSetting('equipe_roles', JSON.stringify(customEquipeRoles));
}
export async function addEquipeRole(roleName) {
  var roles = getEquipeRoles().slice();
  if (roles.indexOf(roleName) === -1) {
    roles.push(roleName);
    customEquipeRoles = roles;
    await saveEquipeRoles();
  }
}

// --- SETTINGS HELPERS (CRM_Settings — table clé/valeur) ---

var _settingsCache = {};

export async function loadSettings() {
  try {
    var data = await grist.docApi.fetchTable(PARAMETRES_TABLE);
    _settingsCache = {};
    if (data && data.id) {
      for (var i = 0; i < data.id.length; i++) {
        _settingsCache[data.Cle[i]] = { id: data.id[i], value: data.Valeur[i] };
      }
    }
    if (_settingsCache.kanban_statuses) {
      try { customKanbanStatuses = JSON.parse(_settingsCache.kanban_statuses.value); } catch (e) {}
    }
    // Migration : les pipelines déjà personnalisés avant l'ajout des étapes "Contrat signé"
    // (conversion auto en client) et "Perdu" (arrêt des relances) n'ont pas ces marqueurs —
    // on les complète une fois, sans écraser les personnalisations existantes.
    if (customKanbanStatuses) {
      var hasMarksAsClient = customKanbanStatuses.some(function(s) { return s.marksAsClient; });
      var hasStopFollowUp = customKanbanStatuses.some(function(s) { return s.stopFollowUp; });
      var kanbanMigrated = false;
      if (!hasMarksAsClient) {
        var signeStage = customKanbanStatuses.find(function(s) { return s.key === 'signe'; });
        if (signeStage) { signeStage.marksAsClient = true; kanbanMigrated = true; }
      }
      if (!hasStopFollowUp) {
        customKanbanStatuses.push({ key: 'perdu', label: currentLang === 'fr' ? 'Perdu' : 'Lost', color: '#94a3b8', stopFollowUp: true });
        kanbanMigrated = true;
      }
      var hasNouveau = customKanbanStatuses.some(function(s) { return s.key === 'nouveau'; });
      if (!hasNouveau) {
        customKanbanStatuses.unshift({ key: 'nouveau', label: currentLang === 'fr' ? 'Nouveau' : 'New', color: '#a855f7' });
        kanbanMigrated = true;
      }
      if (kanbanMigrated) { saveSetting('kanban_statuses', JSON.stringify(customKanbanStatuses)); }
    }
    if (_settingsCache.account_types) {
      try { customAccountTypes = JSON.parse(_settingsCache.account_types.value); } catch (e) {}
    }
    if (_settingsCache.tags_list) {
      try { customTagsList = JSON.parse(_settingsCache.tags_list.value); } catch (e) {}
    }
    if (_settingsCache.categories_list) {
      try { customCategoriesList = JSON.parse(_settingsCache.categories_list.value); } catch (e) {}
    }
    if (_settingsCache.next_actions_prospect) {
      try { customNextActionsProspect = JSON.parse(_settingsCache.next_actions_prospect.value); } catch (e) {}
    }
    if (_settingsCache.next_actions_client) {
      try { customNextActionsClient = JSON.parse(_settingsCache.next_actions_client.value); } catch (e) {}
    }
    applyAccountTypeStyles();
    // Re-synchronise les listes de choix Grist (Type, Statut) avec les valeurs personnalisées
    // enregistrées, au cas où l'ajout précédent n'aurait pas mis à jour la colonne native.
    syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'type'), getAccountTypes());
    syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'status'), getKanbanStatuses());
    syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'nextAction'), getAllNextActionsMerged());
    syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'tag'), getTagsList());
    syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'category'), getCategoriesList());
    if (_settingsCache.equipe_roles) {
      try { customEquipeRoles = JSON.parse(_settingsCache.equipe_roles.value); } catch (e) {}
    }
  } catch (e) {
    console.log('[CRM] CRM_Parametres not available yet');
  }
}

async function saveSetting(key, value) {
  try {
    if (_settingsCache[key]) {
      await grist.docApi.applyUserActions([['UpdateRecord', PARAMETRES_TABLE, _settingsCache[key].id, { Valeur: value }]]);
      _settingsCache[key].value = value;
    } else {
      var result = await grist.docApi.applyUserActions([['AddRecord', PARAMETRES_TABLE, null, { Cle: key, Valeur: value }]]);
      var newId = (result && result.retValues && result.retValues[0]) || result;
      _settingsCache[key] = { id: newId, value: value };
    }
  } catch (e) {
    console.error('[CRM] Error saving setting:', e);
    throw e;
  }
}

// --- VUE PARAMÈTRES (rendu de l'onglet) ---

export function renderSettingsView() {
  var container = document.getElementById('settings-view');
  if (!container) return;
  if (!draftKanbanStatuses) draftKanbanStatuses = JSON.parse(JSON.stringify(getKanbanStatuses()));

  var html = '<div class="settings-row-2col">';

  // Bloc 1 — Colonnes du pipeline
  html += '<div class="settings-section">';
  html += '<h3>' + t('kanbanColumnsConfig') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Personnalisez les étapes de votre pipeline commercial (nom et couleur).' : 'Customize your pipeline stages.') + '</p>';
  html += '<p class="settings-hint">🤝 = ' + (currentLang === 'fr' ? 'convertit le prospect en client' : 'converts prospect to client') + ' · 🚫 = ' + (currentLang === 'fr' ? 'sans suite (arrête les relances)' : 'no follow-up (stops reminders)') + '</p>';
  html += '<div id="kanban-status-list">' + renderKanbanStatusList() + '</div>';
  html += '<button class="btn btn-secondary" onclick="addKanbanStatusDraft()">+ ' + (currentLang === 'fr' ? 'Ajouter une étape' : 'Add a stage') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitKanbanStatuses()">' + t('save') + '</button>';
  html += '</div>';

  // Bloc 2 — Types de comptes
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Types de comptes' : 'Account types') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Renommez les types existants ou ajoutez-en de nouveaux. Les 3 types de base ne peuvent pas être supprimés.'
    : 'Rename existing types or add new ones. The 3 base types cannot be deleted.') + '</p>';
  html += '<div id="account-type-list">' + renderAccountTypeList() + '</div>';
  html += '<button class="btn btn-secondary" onclick="addAccountTypeDraft()">+ ' + (currentLang === 'fr' ? 'Ajouter un type' : 'Add a type') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitAccountTypes()">' + t('save') + '</button>';
  html += '</div>';

  html += '</div>'; // fin .settings-row-2col

  // Bloc 2bis — Tags & Catégories
  if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
  if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
  html += '<div class="settings-row-2col">';
  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Tags' : 'Tags') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Liste des tags disponibles sur une fiche compte (choix unique). Peuvent aussi être créés directement depuis la fiche.'
    : 'Available tags on an account record (single choice). Can also be created directly from the record.') + '</p>';
  html += '<div id="tags-list">' + renderTagsList() + '</div>';
  html += '<button class="btn btn-secondary" onclick="addTagDraft()">+ ' + (currentLang === 'fr' ? 'Ajouter un tag' : 'Add a tag') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitTagsList()">' + t('save') + '</button>';
  html += '</div>';

  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Catégories' : 'Categories') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Liste des catégories disponibles sur une fiche compte (choix unique), utilisées aussi pour le filtre du Kanban. Peuvent aussi être créées directement depuis la fiche.'
    : 'Available categories on an account record (single choice), also used for the Kanban filter. Can also be created directly from the record.') + '</p>';
  html += '<div id="categories-list">' + renderCategoriesList() + '</div>';
  html += '<button class="btn btn-secondary" onclick="addCategoryDraft()">+ ' + (currentLang === 'fr' ? 'Ajouter une catégorie' : 'Add a category') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitCategoriesList()">' + t('save') + '</button>';
  html += '</div>';
  html += '</div>'; // fin .settings-row-2col

  html += '<div class="settings-row-2col">';

  // Bloc 3 — Prochaines actions Prospect
  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Actions — Prospects' : 'Actions — Prospects') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Actions disponibles pour un prospect, avec délai de relance (en jours) si aucune réponse.'
    : 'Available actions for a prospect, with follow-up delay (days) if no response.') + '</p>';
  html += '<div id="next-actions-list-prospect">' + renderNextActionsList('prospect') + '</div>';
  html += '<button class="btn btn-secondary" onclick="addNextActionDraft(\'prospect\')">+ ' + (currentLang === 'fr' ? 'Ajouter une action' : 'Add an action') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitNextActions(\'prospect\')">' + t('save') + '</button>';
  html += '</div>';

  // Bloc 4 — Prochaines actions Client
  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Actions — Clients' : 'Actions — Clients') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Actions disponibles pour un client (ou ancien client), avec délai de relance (en jours).'
    : 'Available actions for a client (or former client), with follow-up delay (days).') + '</p>';
  html += '<div id="next-actions-list-client">' + renderNextActionsList('client') + '</div>';
  html += '<button class="btn btn-secondary" onclick="addNextActionDraft(\'client\')">+ ' + (currentLang === 'fr' ? 'Ajouter une action' : 'Add an action') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitNextActions(\'client\')">' + t('save') + '</button>';
  html += '</div>';

  html += '</div>'; // fin .settings-row-2col

  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Équipe' : 'Team') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Gérez les membres pouvant être Responsables d’un compte ou assignés à une tâche.' : 'Manage members who can be Account owners or task assignees.') + '</p>';
  html += '<div class="sub-list">';
  equipe.forEach(function(m) {
    html += '<div class="sub-item">';
    html += '<div class="sub-item-main"><strong>' + sanitize(m.Nom) + '</strong>';
    if (m.Role) html += ' <span class="badge-primary">' + sanitize(m.Role) + '</span>';
    if (m.Email) html += '<div class="sub-item-detail">' + sanitize(m.Email) + '</div>';
    html += '</div>';
    if (isOwner) html += '<div class="sub-item-actions"><button class="btn-icon" onclick="deleteEquipeMember(' + m.id + ')" title="' + t('delete') + '">🗑️</button></div>';
    html += '</div>';
  });
  if (equipe.length === 0) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucun membre pour le moment' : 'No member yet') + '</div>';
  html += '</div>';
  html += '<div class="add-form">';
  html += '<input id="new-equipe-name" type="text" placeholder="' + (currentLang === 'fr' ? 'Nom *' : 'Name *') + '">';
  html += '<input id="new-equipe-email" type="email" placeholder="Email">';
  html += '<select id="new-equipe-role" onchange="handleEquipeRoleSelectChange(this)">' + buildEquipeRoleOptions(null) + '</select>';
  html += '<input id="new-equipe-role-custom" type="text" class="hidden" placeholder="' + (currentLang === 'fr' ? 'Nom du nouveau rôle' : 'New role name') + '">';
  html += '<button class="btn btn-primary" onclick="addEquipeMember()">+ ' + (currentLang === 'fr' ? 'Ajouter un membre' : 'Add member') + '</button>';
  html += '</div>';
  html += '</div>';

  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Ajouter un champ personnalisé' : 'Add a custom field') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Ajoute une nouvelle colonne directement dans une table Grist du CRM.' : 'Adds a new column directly to a CRM Grist table.') + '</p>';
  html += '<div class="add-form">';
  html += '<select id="new-field-table">';
  html += '<option value="' + COMPTES_TABLE + '">' + (currentLang === 'fr' ? 'Comptes' : 'Accounts') + '</option>';
  html += '<option value="' + CONTACTS_TABLE + '">' + (currentLang === 'fr' ? 'Contacts' : 'Contacts') + '</option>';
  html += '<option value="' + CONTRATS_TABLE + '">' + (currentLang === 'fr' ? 'Contrats' : 'Contracts') + '</option>';
  html += '<option value="' + TACHES_TABLE + '">' + (currentLang === 'fr' ? 'Tâches' : 'Tasks') + '</option>';
  html += '</select>';
  html += '<input id="new-field-name" type="text" placeholder="' + (currentLang === 'fr' ? 'Nom du champ' : 'Field name') + '">';
  html += '<select id="new-field-type">';
  html += '<option value="Text">' + (currentLang === 'fr' ? 'Texte' : 'Text') + '</option>';
  html += '<option value="Numeric">' + (currentLang === 'fr' ? 'Nombre' : 'Number') + '</option>';
  html += '<option value="Date">Date</option>';
  html += '<option value="Bool">' + (currentLang === 'fr' ? 'Case à cocher' : 'Checkbox') + '</option>';
  html += '</select>';
  html += '<button class="btn btn-primary" onclick="addCustomField()">+ ' + (currentLang === 'fr' ? 'Ajouter le champ' : 'Add field') + '</button>';
  html += '</div>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Le champ sera visible et modifiable directement dans la table Grist correspondante (le widget n’affiche pour le moment que ses champs prédéfinis).' : 'The field will be visible and editable directly in the corresponding Grist table.') + '</p>';
  html += '</div>';

  html += '<div class="settings-section">';
  html += '<h3>' + t('mappingConfig') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'La table CRM_Configuration définit la correspondance entre les champs du widget et vos colonnes Grist. Modifiable directement dans cette table.' : 'Edit CRM_Configuration table directly to remap columns.') + '</p>';
  html += '<table class="data-table"><thead><tr><th>' + (currentLang === 'fr' ? 'Champ' : 'Field') + '</th><th>' + (currentLang === 'fr' ? 'Table' : 'Table') + '</th><th>' + (currentLang === 'fr' ? 'Colonne' : 'Column') + '</th></tr></thead><tbody>';
  ['comptes', 'contacts', 'contrats', 'equipe'].forEach(function(entity) {
    Object.keys(columnMapping[entity]).forEach(function(field) {
      var tableName = entity === 'comptes' ? COMPTES_TABLE : (entity === 'contacts' ? CONTACTS_TABLE : (entity === 'contrats' ? CONTRATS_TABLE : EQUIPE_TABLE));
      html += '<tr><td>' + entity + '.' + field + '</td><td>' + tableName + '</td><td>' + columnMapping[entity][field] + '</td></tr>';
    });
  });
  html += '</tbody></table>';
  html += '</div>';

  container.innerHTML = html;
}

export async function addCustomField() {
  var tableName = getVal('new-field-table', COMPTES_TABLE);
  var fieldName = getVal('new-field-name', '').trim();
  var fieldType = getVal('new-field-type', 'Text');
  if (!fieldName) { showToast(currentLang === 'fr' ? 'Indiquez un nom de champ' : 'Enter a field name', 'error'); return; }

  var cleanName = fieldName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  if (!cleanName) { showToast(currentLang === 'fr' ? 'Nom de champ invalide' : 'Invalid field name', 'error'); return; }

  try {
    var existingCols = Object.keys(await grist.docApi.fetchTable(tableName));
    if (existingCols.indexOf(cleanName) !== -1) {
      showToast(currentLang === 'fr' ? 'Ce champ existe déjà' : 'This field already exists', 'error');
      return;
    }
    await grist.docApi.applyUserActions([['AddColumn', tableName, cleanName, { type: fieldType, label: fieldName }]]);
    showToast((currentLang === 'fr' ? 'Champ "' + fieldName + '" ajouté à ' + tableName : 'Field added'), 'success');
    document.getElementById('new-field-name').value = '';
  } catch (e) {
    console.error('[CRM] Error adding custom field:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}
