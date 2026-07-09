// Filtrage des comptes (recherche Kanban/Liste, filtres actifs) et détection
// des relances en retard / à venir.

import {
  comptes, currentFilterType, currentFilterPriority, currentFilterCategory, currentFilterTag, kanbanSearch
} from '../state.js';
import { daysFromNow } from '../utils/dates.js';
import { getPrimaryContact, getEquipeMemberName } from './relations.js';
import { getKanbanStatuses } from '../app.js';

export function getFilteredComptes() {
  return comptes.filter(function(c) {
    if (currentFilterType && c.Type !== currentFilterType) return false;
    if (currentFilterPriority && c.Priority !== currentFilterPriority) return false;
    if (currentFilterCategory && c.Category !== currentFilterCategory) return false;
    if (currentFilterTag && (c.Tag || '').indexOf(currentFilterTag) === -1) return false;
    if (kanbanSearch) {
      var search = kanbanSearch.toLowerCase();
      var primaryContact = getPrimaryContact(c.id);
      var text = [
        c.Name, getEquipeMemberName(c.Responsible), c.Next_Action, c.Category, c.Tag,
        primaryContact ? primaryContact.Name : '',
        primaryContact ? primaryContact.Email : ''
      ].join(' ').toLowerCase();
      if (text.indexOf(search) === -1) return false;
    }
    return true;
  });
}

export function isStageStopFollowUp(statusKey) {
  var stage = getKanbanStatuses().find(function(s) { return s.key === statusKey; });
  return !!(stage && stage.stopFollowUp);
}

export function isRelanceOverdue(compte) {
  if (!compte.Relance_Date || isStageStopFollowUp(compte.Status)) return false;
  return daysFromNow(compte.Relance_Date) < 0;
}

export function isRelanceUpcoming(compte) {
  if (!compte.Relance_Date || isStageStopFollowUp(compte.Status)) return false;
  var d = daysFromNow(compte.Relance_Date);
  return d >= 0 && d <= 7;
}

export function getRelanceComptes() {
  return comptes
    .filter(function(c) { return c.Relance_Date && !isStageStopFollowUp(c.Status); })
    .sort(function(a, b) { return (a.Relance_Date || 0) - (b.Relance_Date || 0); });
}
