// Lookups entre entités (compte -> contacts/contrats/commentaires/tâches, équipe...).

import { comptes, contacts, contracts, crmComments, crmTasks, equipe } from '../state.js';
import { sanitize } from '../utils/format.js';

export function getContactsForCompte(compteId) {
  return contacts.filter(function(c) { return c.Compte_Id === compteId; });
}

export function getContractsForCompte(compteId) {
  return contracts.filter(function(c) { return c.Compte_Id === compteId; });
}

export function getCommentsForCompte(compteId) {
  return crmComments.filter(function(c) { return c.Compte_Id === compteId; })
    .sort(function(a, b) { return (b.Created_At || 0) - (a.Created_At || 0); });
}

export function getTasksForCompte(compteId) {
  return crmTasks.filter(function(t2) { return t2.Compte_Id === compteId; });
}

export function getCompteById(compteId) {
  return comptes.find(function(c) { return c.id === compteId; });
}

export function getSignedContractsTotal(compteId) {
  return getContractsForCompte(compteId)
    .filter(function(c) { return c.Status === 'signe'; })
    .reduce(function(sum, c) { return sum + (Number(c.Amount) || 0); }, 0);
}

export function getPrimaryContact(compteId) {
  var cs = getContactsForCompte(compteId);
  return cs.find(function(c) { return c.Is_Primary; }) || cs[0] || null;
}

export function getEquipeMemberById(id) {
  return equipe.find(function(e) { return e.id === id; }) || null;
}

export function getEquipeMemberName(id) {
  var m = getEquipeMemberById(id);
  return m ? m.Nom : '';
}

export function buildEquipeOptions(selectedId) {
  var html = '<option value="">— Non assigné —</option>';
  equipe.forEach(function(m) {
    html += '<option value="' + m.id + '"' + (Number(selectedId) === m.id ? ' selected' : '') + '>' + sanitize(m.Nom) + '</option>';
  });
  return html;
}
