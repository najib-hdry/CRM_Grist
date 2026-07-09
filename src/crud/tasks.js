// CRUD sur CRM_Taches (ajout, bascule fait/à faire, suppression, gestion de la relance).

import { isOwner, crmTasks } from '../state.js';
import { TACHES_TABLE, COMPTES_TABLE } from '../config/tables.js';
import { setField } from '../config/column-mapping.js';
import { toEpoch } from '../utils/dates.js';
import { getVal } from '../ui/dom.js';
import { loadAllData, logActivity } from '../data/load.js';
import { getCompteById } from '../data/relations.js';
import { showToast, openEditCompteModal, showConfirmModal } from '../app.js';

export async function addCrmTask(compteId) {
  var title = getVal('new-task-title', '').trim();
  if (!title) return;
  var record = {
    Compte_Id: compteId,
    Titre: title,
    Statut: 'a_faire',
    Date_Echeance: toEpoch(getVal('new-task-due', '')),
    Assigne_A: parseInt(getVal('new-task-assignee', '0')) || 0,
    Cree_Le: Math.floor(Date.now() / 1000)
  };
  try {
    await grist.docApi.applyUserActions([['AddRecord', TACHES_TABLE, null, record]]);
    var compte = getCompteById(compteId);
    logActivity('task_added', compteId, compte ? compte.Name : '', title);
    showToast('Tâche ajoutée', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error adding task:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

export async function clearRelance(compteId) {
  try {
    var record = {};
    setField(record, 'comptes', 'nextAction', '');
    setField(record, 'comptes', 'relanceDate', null);
    await grist.docApi.applyUserActions([['UpdateRecord', COMPTES_TABLE, compteId, record]]);
    showToast('Relance marquée comme traitée', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error clearing relance:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

export async function toggleCrmTask(taskId, compteId, done) {
  try {
    await grist.docApi.applyUserActions([['UpdateRecord', TACHES_TABLE, taskId, { Statut: done ? 'fait' : 'a_faire' }]]);
    var task = crmTasks.find(function(tk) { return tk.id === taskId; });
    var compte = getCompteById(compteId);
    logActivity(done ? 'task_completed' : 'task_reopened', compteId, compte ? compte.Name : '', task ? task.Title : '');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error toggling task:', e);
  }
}

export async function deleteCrmTask(taskId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal('Supprimer cette tâche ?', 'Supprimer la tâche');
  if (!confirmed) return;
  try {
    var task = crmTasks.find(function(tk) { return tk.id === taskId; });
    var compte = getCompteById(compteId);
    await grist.docApi.applyUserActions([['RemoveRecord', TACHES_TABLE, taskId]]);
    logActivity('task_deleted', compteId, compte ? compte.Name : '', task ? task.Title : '');
    showToast('Tâche supprimée', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting task:', e);
  }
}
