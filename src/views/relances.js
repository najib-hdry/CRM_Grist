// Vue Relances (onglet dédié) : liste des comptes groupés en retard / cette semaine / à venir.

import { sanitize } from '../utils/format.js';
import { daysFromNow, formatDate } from '../utils/dates.js';
import { getRelanceComptes } from '../data/filtering.js';
import { currentLang, getAccountTypeLabel } from '../app.js';

export function renderRelancesView() {
  var container = document.getElementById('relances-view');
  if (!container) return;

  var late = [];
  var soon = [];
  var later = [];

  getRelanceComptes().forEach(function(c) {
    var d = daysFromNow(c.Relance_Date);
    if (d < 0) late.push(c);
    else if (d <= 7) soon.push(c);
    else later.push(c);
  });

  var html = '';
  html += renderRelanceGroup(currentLang === 'fr' ? '🔴 En retard' : '🔴 Overdue', late, true);
  html += renderRelanceGroup(currentLang === 'fr' ? '🟡 Cette semaine' : '🟡 This week', soon, false);
  html += renderRelanceGroup(currentLang === 'fr' ? '⚪ À venir' : '⚪ Upcoming', later, false);

  if (late.length === 0 && soon.length === 0 && later.length === 0) {
    html = '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucune relance programmée. Ajoutez une date de relance sur une fiche pour la voir apparaître ici.' : 'No reminders scheduled.') + '</div>';
  }

  container.innerHTML = html;
}

function renderRelanceGroup(title, list, isLate) {
  if (list.length === 0) return '';
  var html = '<div class="relance-group">';
  html += '<h3 class="relance-group-title">' + sanitize(title) + ' <span class="relance-group-count">' + list.length + '</span></h3>';
  html += '<div class="relance-list">';
  for (var i = 0; i < list.length; i++) {
    var c = list[i];
    var days = daysFromNow(c.Relance_Date);
    var daysLabel = days < 0
      ? Math.abs(days) + (currentLang === 'fr' ? ' j de retard' : ' days overdue')
      : (days === 0 ? (currentLang === 'fr' ? 'Aujourd’hui' : 'Today') : (currentLang === 'fr' ? 'dans ' + days + ' j' : 'in ' + days + ' d'));
    html += '<div class="relance-item ' + (isLate ? 'relance-item-late' : '') + '" onclick="openEditCompteModal(' + c.id + ')">';
    html += '<div class="relance-item-main">';
    html += '<span class="type-badge type-' + c.Type + '">' + getAccountTypeLabel(c.Type) + '</span>';
    html += '<strong>' + sanitize(c.Name) + '</strong>';
    if (c.Next_Action) html += '<span class="relance-item-action">' + sanitize(c.Next_Action) + '</span>';
    html += '</div>';
    html += '<div class="relance-item-date">' + formatDate(c.Relance_Date) + ' <span class="relance-days">(' + daysLabel + ')</span></div>';
    html += '</div>';
  }
  html += '</div></div>';
  return html;
}
