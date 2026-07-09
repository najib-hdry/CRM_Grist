// CRUD sur CRM_Contrats (ajout avec pièce jointe, téléchargement, suppression).

import { isOwner, contracts } from '../state.js';
import { CONTRATS_TABLE } from '../config/tables.js';
import { setField } from '../config/column-mapping.js';
import { toEpoch } from '../utils/dates.js';
import { getVal } from '../ui/dom.js';
import { loadAllData } from '../data/load.js';
import { showToast, openEditCompteModal, showConfirmModal } from '../app.js';

export async function addContract(compteId) {
  var label = getVal('new-contract-label', '').trim();
  if (!label) {
    var el = document.getElementById('new-contract-label');
    if (el) { el.style.borderColor = '#ef4444'; el.focus(); setTimeout(function() { el.style.borderColor = ''; }, 2000); }
    showToast('L\'intitulé est obligatoire', 'error');
    return;
  }
  var record = { Compte_Id: compteId };
  setField(record, 'contrats', 'label', label);
  setField(record, 'contrats', 'amount', parseFloat(getVal('new-contract-amount', '0')) || 0);
  setField(record, 'contrats', 'status', getVal('new-contract-status', 'en_cours'));
  setField(record, 'contrats', 'startDate', toEpoch(getVal('new-contract-start', '')));
  setField(record, 'contrats', 'endDate', toEpoch(getVal('new-contract-end', '')));

  var fileInput = document.getElementById('new-contract-file');
  var file = fileInput && fileInput.files && fileInput.files[0];

  try {
    if (file) {
      var fileData = await readFileAsBase64(file);
      record.Fichier_Nom = file.name;
      record.Fichier_Type = file.type;
      record.Fichier_Data = fileData;
    }
    await grist.docApi.applyUserActions([['AddRecord', CONTRATS_TABLE, null, record]]);
    showToast('Contrat ajouté', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error adding contract:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

function readFileAsBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result.split(',')[1]); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadContractFile(contractId) {
  var contract = contracts.find(function(c) { return c.id === contractId; });
  if (!contract || !contract.Fichier_Data) return;
  var link = document.createElement('a');
  link.href = 'data:' + (contract.Fichier_Type || 'application/octet-stream') + ';base64,' + contract.Fichier_Data;
  link.download = contract.Fichier_Nom || 'contrat';
  link.click();
}

export function updateFileLabel(input) {
  var label = input.closest('label');
  if (!label) return;
  var fileName = input.files && input.files[0] ? input.files[0].name : '';
  label.firstChild.textContent = fileName ? ('📎 ' + fileName) : '📎 Joindre le contrat';
}

export async function deleteContract(contractId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal('Supprimer ce contrat ?', 'Supprimer le contrat');
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', CONTRATS_TABLE, contractId]]);
    showToast('Contrat supprimé', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting contract:', e);
  }
}
