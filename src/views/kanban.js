// Vue Kanban : colonnes par statut, cartes de compte, drag & drop.

import { kanbanShowAll } from '../state.js';
import { COMPTES_TABLE } from '../config/tables.js';
import { setField } from '../config/column-mapping.js';
import { getColumnName } from '../config/column-mapping.js';
import { sanitize, formatAmount } from '../utils/format.js';
import { formatDate } from '../utils/dates.js';
import { getFilteredComptes, isRelanceOverdue, isRelanceUpcoming } from '../data/filtering.js';
import { getCompteById, getPrimaryContact } from '../data/relations.js';
import { loadAllData } from '../data/load.js';
import { setCurrentFilterType, setCurrentFilterCategory, setKanbanSearchState, setKanbanShowAllState } from '../state.js';
import {
  showToast, t, currentLang, getKanbanStatuses,
  getAccountTypeLabel, getNextActionLabel, refreshAllViews
} from '../app.js';

// Nombre de clients affichés par défaut dans la colonne "Contrat signé" (les plus récents
// d'abord) ; "Afficher tous les clients" lève cette limite.
var MAX_RECENT_CLIENTS = 15;

export function renderKanbanView() {
  var board = document.getElementById('kanban-board');
  if (!board) return;
  var statuses = getKanbanStatuses();
  var filtered = getFilteredComptes();

  var html = '';
  for (var s = 0; s < statuses.length; s++) {
    var col = statuses[s];
    var colComptes = filtered.filter(function(c) { return c.Status === col.key; });
    if (col.marksAsClient) {
      colComptes = colComptes.slice().sort(function(a, b) {
        return (b.Client_Depuis || b.Created_At || 0) - (a.Client_Depuis || a.Created_At || 0);
      });
      if (!kanbanShowAll) colComptes = colComptes.slice(0, MAX_RECENT_CLIENTS);
    }
    html += '<div class="kanban-column">';
    html += '<div class="kanban-col-header" style="--kanban-col-color:' + col.color + '; border-bottom-color:' + col.color + ';">';
    html += '<div class="kanban-col-header-left"><span>' + sanitize(col.label) + '</span></div><span class="kanban-count">' + colComptes.length + '</span>';
    html += '</div>';
    html += '<div class="kanban-cards" data-status="' + sanitize(col.key) + '" ondragover="onKanbanDragOver(event)" ondrop="onKanbanDrop(event)" ondragleave="onKanbanDragLeave(event)">';
    for (var i = 0; i < colComptes.length; i++) {
      html += renderCompteCard(colComptes[i]);
    }
    if (colComptes.length === 0) html += '<div class="kanban-empty">' + t('noComptes') + '</div>';
    html += '</div></div>';
  }
  board.innerHTML = html;
}

export function renderCompteCard(compte) {
  var typeClass = 'type-' + compte.Type;
  var prioClass = 'dot-' + compte.Priority;
  var primaryContact = getPrimaryContact(compte.id);
  var relanceLate = isRelanceOverdue(compte);
  var relanceSoon = isRelanceUpcoming(compte);
  var relanceClass = relanceLate ? 'relance-late' : (relanceSoon ? 'relance-soon' : '');

  var html = '<div class="compte-card ' + relanceClass + '" draggable="true" ondragstart="onKanbanDragStart(event, ' + compte.id + ')" onclick="openEditCompteModal(' + compte.id + ')">';
  html += '<div class="compte-card-top">';
  html += '<span class="type-badge ' + typeClass + '">' + getAccountTypeLabel(compte.Type) + '</span>';
  html += '<span class="priority-dot ' + prioClass + '"></span>';
  html += '</div>';
  html += '<div class="compte-card-name">' + sanitize(compte.Name) + '</div>';
  if (primaryContact) html += '<div class="compte-card-contact">👤 ' + sanitize(primaryContact.Name) + '</div>';
  if (compte.Amount) html += '<div class="compte-card-amount">' + formatAmount(compte.Amount) + '</div>';
  if (compte.Next_Action) html += '<div class="compte-card-next">→ ' + sanitize(getNextActionLabel(compte.Type, compte.Next_Action)) + '</div>';
  if (compte.Relance_Date) {
    html += '<div class="compte-card-relance ' + relanceClass + '">📅 ' + formatDate(compte.Relance_Date) + (relanceLate ? ' (' + t('overdue') + ')' : '') + '</div>';
  }
  html += '</div>';
  return html;
}

// --- Drag & Drop ---
var draggedCompteId = null;

export function onKanbanDragStart(e, compteId) {
  draggedCompteId = compteId;
  e.dataTransfer.effectAllowed = 'move';
}

export function onKanbanDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

export function onKanbanDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

export async function onKanbanDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  var newStatus = e.currentTarget.getAttribute('data-status');
  if (!draggedCompteId || !newStatus) return;
  var compte = getCompteById(draggedCompteId);
  if (!compte || compte.Status === newStatus) { draggedCompteId = null; return; }
  try {
    var statutCol = getColumnName('comptes', 'status');
    var record = {};
    record[statutCol] = newStatus;

    var newStage = getKanbanStatuses().find(function(s) { return s.key === newStatus; });
    var converted = false;
    var reverted = false;
    if (newStage && newStage.marksAsClient && compte.Type === 'prospect') {
      // Contrat signé : le prospect devient client.
      setField(record, 'comptes', 'type', 'client');
      record.Client_Depuis = Math.floor(Date.now() / 1000);
      converted = true;
    } else if (newStage && !newStage.marksAsClient && compte.Type === 'client') {
      // Retour en arrière dans le pipeline : le client redevient prospect.
      setField(record, 'comptes', 'type', 'prospect');
      record.Client_Depuis = null;
      reverted = true;
    }

    await grist.docApi.applyUserActions([['UpdateRecord', COMPTES_TABLE, draggedCompteId, record]]);
    if (converted) {
      showToast(currentLang === 'fr' ? '🤝 ' + compte.Name + ' est maintenant client !' : '🤝 ' + compte.Name + ' is now a client!', 'success');
    } else if (reverted) {
      showToast(currentLang === 'fr' ? compte.Name + ' redevient prospect.' : compte.Name + ' is a prospect again.', 'info');
    } else {
      showToast(t('compteMoved'), 'success');
    }
    await loadAllData();
  } catch (err) {
    console.error('[CRM] Error moving compte:', err);
  }
  draggedCompteId = null;
}

export function setKanbanSearch(value) {
  setKanbanSearchState(value);
  renderKanbanView();
}

export function setKanbanShowAll(checked) {
  setKanbanShowAllState(checked);
  renderKanbanView();
}

export function setFilterType(value) {
  setCurrentFilterType(value || null);
  refreshAllViews();
}

export function setFilterCategory(value) {
  setCurrentFilterCategory(value || null);
  refreshAllViews();
}
