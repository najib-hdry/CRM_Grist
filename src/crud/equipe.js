// CRUD sur CRM_Equipe (membres de l'équipe, gérés depuis Paramètres).

import { isOwner, comptes, crmTasks } from '../state.js';
import { EQUIPE_TABLE } from '../config/tables.js';
import { setField } from '../config/column-mapping.js';
import { sanitize } from '../utils/format.js';
import { getVal } from '../ui/dom.js';
import { loadAllData } from '../data/load.js';
import { getEquipeMemberById } from '../data/relations.js';
import { showToast, showConfirmModal, renderSettingsView, getEquipeRoles, addEquipeRole } from '../app.js';

export function buildEquipeRoleOptions(selectedRole) {
  var html = '<option value="">— Rôle —</option>';
  getEquipeRoles().forEach(function(r) {
    html += '<option value="' + sanitize(r) + '"' + (selectedRole === r ? ' selected' : '') + '>' + sanitize(r) + '</option>';
  });
  html += '<option value="__new__">+ Créer un nouveau rôle...</option>';
  return html;
}

export function handleEquipeRoleSelectChange(select) {
  var customInput = document.getElementById('new-equipe-role-custom');
  if (!customInput) return;
  if (select.value === '__new__') {
    customInput.classList.remove('hidden');
    customInput.focus();
  } else {
    customInput.classList.add('hidden');
    customInput.value = '';
  }
}

export async function addEquipeMember() {
  var name = getVal('new-equipe-name', '').trim();
  if (!name) return;

  var roleSelectValue = getVal('new-equipe-role', '');
  var role = roleSelectValue;
  if (roleSelectValue === '__new__') {
    var newRole = getVal('new-equipe-role-custom', '').trim();
    if (!newRole) { showToast('Indiquez le nom du nouveau rôle', 'error'); return; }
    await addEquipeRole(newRole);
    role = newRole;
  }

  var record = {};
  setField(record, 'equipe', 'name', name);
  setField(record, 'equipe', 'email', getVal('new-equipe-email', '').trim());
  setField(record, 'equipe', 'role', role);
  try {
    await grist.docApi.applyUserActions([['AddRecord', EQUIPE_TABLE, null, record]]);
    showToast('Membre ajouté', 'success');
    await loadAllData();
    renderSettingsView();
  } catch (e) {
    console.error('[CRM] Error adding equipe member:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

export async function deleteEquipeMember(memberId) {
  if (!isOwner) return;
  var member = getEquipeMemberById(memberId);
  var usedAsResponsible = comptes.some(function(c) { return c.Responsible === memberId; });
  var usedAsAssignee = crmTasks.some(function(t2) { return t2.Assignee === memberId; });
  var warning = (usedAsResponsible || usedAsAssignee)
    ? ' Ce membre est actuellement assigné à un ou plusieurs comptes/tâches.'
    : '';
  var confirmed = await showConfirmModal(
    'Supprimer ' + (member ? member.Nom : 'ce membre') + ' de l’équipe ?' + warning,
    'Supprimer le membre'
  );
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', EQUIPE_TABLE, memberId]]);
    showToast('Membre supprimé', 'info');
    await loadAllData();
    renderSettingsView();
  } catch (e) {
    console.error('[CRM] Error deleting equipe member:', e);
  }
}
