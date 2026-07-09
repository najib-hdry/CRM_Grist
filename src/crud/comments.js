// CRUD sur CRM_Commentaires (fil d'historique), avec édition inline.

import { isOwner, currentUserEmail, crmComments } from '../state.js';
import { COMMENTAIRES_TABLE } from '../config/tables.js';
import { loadAllData, logActivity } from '../data/load.js';
import { getCompteById } from '../data/relations.js';
import { showToast, openEditCompteModal, showConfirmModal } from '../app.js';

export async function addCrmComment(compteId) {
  var textarea = document.getElementById('new-comment-input');
  var content = textarea ? textarea.value.trim() : '';
  if (!content) return;
  try {
    await grist.docApi.applyUserActions([
      ['AddRecord', COMMENTAIRES_TABLE, null, {
        Compte_Id: compteId,
        Auteur: currentUserEmail || 'Utilisateur',
        Contenu: content,
        Cree_Le: Math.floor(Date.now() / 1000)
      }]
    ]);
    var compte = getCompteById(compteId);
    logActivity('comment_added', compteId, compte ? compte.Name : '', content.substring(0, 80));
    showToast('Note ajoutée', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error adding comment:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

export async function deleteCrmComment(commentId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal('Supprimer cette note ?', 'Supprimer la note');
  if (!confirmed) return;
  try {
    var comment = crmComments.find(function(c) { return c.id === commentId; });
    var compte = getCompteById(compteId);
    await grist.docApi.applyUserActions([['RemoveRecord', COMMENTAIRES_TABLE, commentId]]);
    logActivity('comment_deleted', compteId, compte ? compte.Name : '', comment ? comment.Content.substring(0, 80) : '');
    showToast('Note supprimée', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting comment:', e);
  }
}

export function editCrmComment(commentId, compteId) {
  var contentEl = document.getElementById('comment-content-' + commentId);
  var itemEl = document.getElementById('comment-item-' + commentId);
  if (!contentEl || !itemEl) return;

  var currentText = contentEl.textContent;
  var editArea = document.createElement('textarea');
  editArea.id = 'comment-edit-' + commentId;
  editArea.style.cssText = 'width:100%;min-height:60px;font-family:inherit;font-size:14px;padding:6px 8px;border:2px solid var(--color-primary);border-radius:8px;resize:vertical;margin-top:4px;';
  editArea.value = currentText;

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:6px;margin-top:6px;';
  btnRow.innerHTML =
    '<button class="btn btn-primary" style="font-size:13px;padding:5px 12px;" onclick="saveCrmComment(' + commentId + ',' + compteId + ')">✓ Enregistrer</button>' +
    '<button class="btn btn-secondary" style="font-size:13px;padding:5px 12px;" onclick="cancelCrmCommentEdit(' + commentId + ',\'' + currentText.replace(/'/g, "\\'") + '\')">✕ Annuler</button>';

  contentEl.replaceWith(editArea);
  var actionsEl = itemEl.querySelector('.comment-actions');
  if (actionsEl) actionsEl.style.display = 'none';
  itemEl.appendChild(btnRow);
  editArea.focus();
  editArea.setSelectionRange(editArea.value.length, editArea.value.length);
}

export function cancelCrmCommentEdit(commentId, originalText) {
  var itemEl = document.getElementById('comment-item-' + commentId);
  if (!itemEl) return;
  var editArea = document.getElementById('comment-edit-' + commentId);
  if (editArea) {
    var contentEl = document.createElement('div');
    contentEl.className = 'comment-content';
    contentEl.id = 'comment-content-' + commentId;
    contentEl.textContent = originalText;
    editArea.replaceWith(contentEl);
  }
  var btnRow = itemEl.querySelector('div[style*="margin-top:6px"]');
  if (btnRow) btnRow.remove();
  var actionsEl = itemEl.querySelector('.comment-actions');
  if (actionsEl) actionsEl.style.display = '';
}

export async function saveCrmComment(commentId, compteId) {
  var editArea = document.getElementById('comment-edit-' + commentId);
  if (!editArea) return;
  var newText = editArea.value.trim();
  if (!newText) {
    editArea.style.borderColor = '#ef4444';
    setTimeout(function() { editArea.style.borderColor = 'var(--color-primary)'; }, 2000);
    return;
  }
  try {
    var record = { Contenu: newText };
    await grist.docApi.applyUserActions([['UpdateRecord', COMMENTAIRES_TABLE, commentId, record]]);
    var compte = getCompteById(compteId);
    logActivity('comment_edited', compteId, compte ? compte.Name : '', newText.substring(0, 80));
    showToast('Note mise à jour', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error updating comment:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}
