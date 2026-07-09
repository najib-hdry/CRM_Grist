// Vue Liste : recherche, tri, filtres avancés.

import { comptes, equipe, isOwner } from '../state.js';
import { sanitize, formatAmount, capitalize } from '../utils/format.js';
import { formatDate } from '../utils/dates.js';
import { isRelanceOverdue } from '../data/filtering.js';
import { getPrimaryContact, getEquipeMemberName } from '../data/relations.js';
import {
  t, currentLang, getKanbanStatuses, getStatusLabel, getStatusColor, getAccountTypeLabel
} from '../app.js';

var tableSortField = null;
var tableSortAsc = true;
var tableFilterTypes = [];
var tableFilterPriorities = [];

export function sortTable(field) {
  if (tableSortField === field) { tableSortAsc = !tableSortAsc; }
  else { tableSortField = field; tableSortAsc = true; }
  renderTableView();
}

function populateTableFilterOptions() {
  var statusSelect = document.getElementById('table-filter-status');
  if (statusSelect) {
    var currentVal = statusSelect.value;
    var html = '<option value="">' + (currentLang === 'fr' ? 'Tous statuts' : 'All statuses') + '</option>';
    getKanbanStatuses().forEach(function(s) {
      html += '<option value="' + sanitize(s.key) + '">' + sanitize(s.label) + '</option>';
    });
    statusSelect.innerHTML = html;
    statusSelect.value = currentVal;
  }
  var respSelect = document.getElementById('table-filter-responsible');
  if (respSelect) {
    var currentRespVal = respSelect.value;
    var html2 = '<option value="">' + (currentLang === 'fr' ? 'Tous responsables' : 'All owners') + '</option>';
    equipe.forEach(function(m) {
      html2 += '<option value="' + m.id + '">' + sanitize(m.Nom) + '</option>';
    });
    respSelect.innerHTML = html2;
    respSelect.value = currentRespVal;
  }
}

export function renderTableView() {
  var container = document.getElementById('table-view');
  if (!container) return;

  populateTableFilterOptions();

  var searchEl = document.getElementById('table-search');
  var search = searchEl ? searchEl.value.toLowerCase() : '';
  var typeFilterEl = document.getElementById('table-filter-type');
  var typeFilter = typeFilterEl ? typeFilterEl.value : '';
  var statusFilterEl = document.getElementById('table-filter-status');
  var statusFilter = statusFilterEl ? statusFilterEl.value : '';
  var respFilterEl = document.getElementById('table-filter-responsible');
  var respFilter = respFilterEl ? respFilterEl.value : '';

  var filtered = comptes.filter(function(c) {
    if (tableFilterTypes.length && tableFilterTypes.indexOf(c.Type) === -1) return false;
    if (tableFilterPriorities.length && tableFilterPriorities.indexOf(c.Priority) === -1) return false;
    if (typeFilter && c.Type !== typeFilter) return false;
    if (statusFilter && c.Status !== statusFilter) return false;
    if (respFilter && String(c.Responsible) !== respFilter) return false;
    if (search) {
      var primaryContact = getPrimaryContact(c.id);
      var text = [c.Name, getEquipeMemberName(c.Responsible), c.Category, c.Tag, primaryContact ? primaryContact.Name : '', primaryContact ? primaryContact.Email : ''].join(' ').toLowerCase();
      if (text.indexOf(search) === -1) return false;
    }
    return true;
  });

  if (tableSortField) {
    var dir = tableSortAsc ? 1 : -1;
    filtered.sort(function(a, b) {
      var va, vb;
      switch (tableSortField) {
        case 'Name': va = (a.Name || '').toLowerCase(); vb = (b.Name || '').toLowerCase(); break;
        case 'Type': va = a.Type || ''; vb = b.Type || ''; break;
        case 'Status': va = getStatusLabel(a.Status); vb = getStatusLabel(b.Status); break;
        case 'Priority': var po = { high: 0, medium: 1, low: 2 }; va = po[a.Priority] !== undefined ? po[a.Priority] : 3; vb = po[b.Priority] !== undefined ? po[b.Priority] : 3; break;
        case 'Amount': va = Number(a.Amount) || 0; vb = Number(b.Amount) || 0; break;
        case 'Relance_Date': va = a.Relance_Date || 0; vb = b.Relance_Date || 0; break;
        default: va = ''; vb = '';
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  function sortIcon(field) { return tableSortField === field ? (tableSortAsc ? ' ▲' : ' ▼') : ' ⇅'; }
  var thStyle = 'cursor:pointer;user-select:none;';

  var html = '<table class="data-table">';
  html += '<thead><tr>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Name\')">' + t('colName') + sortIcon('Name') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Type\')">' + t('colType') + sortIcon('Type') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Status\')">' + t('colStatus') + sortIcon('Status') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Priority\')">' + t('colPriority') + sortIcon('Priority') + '</th>';
  html += '<th>' + t('colResponsible') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Amount\')">' + t('colAmount') + sortIcon('Amount') + '</th>';
  html += '<th>' + t('colNextAction') + '</th>';
  html += '<th>' + (currentLang === 'fr' ? 'Date prochaine action' : 'Next action date') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Relance_Date\')">' + t('colRelance') + sortIcon('Relance_Date') + '</th>';
  html += '<th>' + t('colActions') + '</th>';
  html += '</tr></thead><tbody>';

  for (var i = 0; i < filtered.length; i++) {
    var c = filtered[i];
    var relanceLate = isRelanceOverdue(c);
    html += '<tr class="clickable-row">';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><strong>' + sanitize(c.Name) + '</strong></td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="type-badge type-' + c.Type + '">' + getAccountTypeLabel(c.Type) + '</span></td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="status-badge" style="background:' + getStatusColor(c.Status) + '22;color:' + getStatusColor(c.Status) + ';">● ' + sanitize(getStatusLabel(c.Status)) + '</span></td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="priority-dot dot-' + c.Priority + '"></span> ' + t('priority' + capitalize(c.Priority)) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + sanitize(getEquipeMemberName(c.Responsible)) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + formatAmount(c.Amount) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + sanitize(c.Next_Action) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + (c.Next_Action_Date ? formatDate(c.Next_Action_Date) : t('noDate')) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')" style="' + (relanceLate ? 'color:#dc2626;font-weight:700;' : '') + '">' + (c.Relance_Date ? formatDate(c.Relance_Date) : t('noDate')) + '</td>';
    html += '<td onclick="event.stopPropagation();">';
    if (isOwner) html += '<button class="btn-icon" onclick="deleteCompte(' + c.id + ')" title="' + t('delete') + '">🗑️</button>';
    html += '</td></tr>';
  }
  if (filtered.length === 0) {
    html += '<tr><td colspan="10" style="text-align:center;color:#94a3b8;padding:24px;">' + t('noComptes') + '</td></tr>';
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

export function setTableFilterTypes(types) {
  tableFilterTypes = types;
  renderTableView();
}

export function setTableFilterPriorities(prios) {
  tableFilterPriorities = prios;
  renderTableView();
}
