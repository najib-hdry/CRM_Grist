// CRUD sur CRM_Comptes (créer, sauvegarder depuis la fiche, supprimer).

import { isOwner } from '../state.js';
import { COMPTES_TABLE, CONTACTS_TABLE, CONTRATS_TABLE, COMMENTAIRES_TABLE, TACHES_TABLE } from '../config/tables.js';
import { setField } from '../config/column-mapping.js';
import { toEpoch } from '../utils/dates.js';
import { getDepartementFromZip } from '../utils/geo.js';
import { getVal } from '../ui/dom.js';
import { loadAllData } from '../data/load.js';
import {
  getPrimaryContact, getContactsForCompte, getContractsForCompte,
  getCommentsForCompte, getTasksForCompte
} from '../data/relations.js';
import { showToast, t, getKanbanStatuses, openNewCompteModal, showConfirmModal, closeModal, clearEditModalDraft, addTagValue, addCategoryValue } from '../app.js';

// N'écrit rien dans Grist : ouvre juste le formulaire de saisie. La fiche n'est créée
// qu'au clic sur "Enregistrer" (cf. saveCompteFromModal) — fermer/annuler ne laisse donc
// plus de fiche vide fantôme.
export function createCompte(initialType) {
  openNewCompteModal(initialType || 'prospect');
}

export async function saveCompteFromModal(compteId) {
  var nameEl = document.getElementById('compte-name');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { showToast('Le nom est obligatoire', 'error'); return; }

  var isNew = compteId == null;

  var record = {};
  setField(record, 'comptes', 'name', name);
  setField(record, 'comptes', 'type', getVal('compte-type', 'prospect'));
  setField(record, 'comptes', 'status', getVal('compte-status', getKanbanStatuses()[0].key));
  setField(record, 'comptes', 'priority', getVal('compte-priority', 'medium'));
  setField(record, 'comptes', 'responsible', parseInt(getVal('compte-responsible', '0')) || 0);
  setField(record, 'comptes', 'amount', parseFloat(getVal('compte-amount', '0')) || 0);
  setField(record, 'comptes', 'nextAction', getVal('compte-next-action', ''));
  setField(record, 'comptes', 'nextActionDate', toEpoch(getVal('compte-next-action-date', '')));
  setField(record, 'comptes', 'relanceDate', toEpoch(getVal('compte-relance-date', '')));
  var categoryValue = getVal('compte-category', '');
  if (categoryValue === '__new__') {
    var newCategoryLabel = getVal('compte-category-custom', '').trim();
    if (newCategoryLabel) {
      var newCategory = await addCategoryValue(newCategoryLabel);
      categoryValue = newCategory.key;
    } else {
      categoryValue = '';
    }
  }
  setField(record, 'comptes', 'category', categoryValue);
  var tagValue = getVal('compte-tag', '');
  if (tagValue === '__new__') {
    var newTagLabel = getVal('compte-tag-custom', '').trim();
    if (newTagLabel) {
      var newTag = await addTagValue(newTagLabel);
      tagValue = newTag.key;
    } else {
      tagValue = '';
    }
  }
  setField(record, 'comptes', 'tag', tagValue);
  setField(record, 'comptes', 'description', getVal('compte-description', ''));
  setField(record, 'comptes', 'website', getVal('compte-website', ''));
  setField(record, 'comptes', 'addressStreet', getVal('compte-address-street', ''));
  setField(record, 'comptes', 'addressZip', getVal('compte-address-zip', ''));
  setField(record, 'comptes', 'addressCity', getVal('compte-address-city', ''));
  var addressLat = getVal('compte-address-lat', '');
  var addressLng = getVal('compte-address-lng', '');
  record.Adresse_Lat = addressLat ? parseFloat(addressLat) : null;
  record.Adresse_Lng = addressLng ? parseFloat(addressLng) : null;
  record.Departement = getDepartementFromZip(getVal('compte-address-zip', '')) || '';
  if (isNew) {
    setField(record, 'comptes', 'createdAt', Math.floor(Date.now() / 1000));
    // Un client créé directement (pas via conversion d'un prospect) est "client depuis" sa création.
    if (getVal('compte-type', 'prospect') === 'client') record.Client_Depuis = Math.floor(Date.now() / 1000);
  }

  var contactName = getVal('compte-contact-name', '').trim();
  var contactEmail = getVal('compte-contact-email', '').trim();
  var contactPhone = getVal('compte-contact-phone', '').trim();

  try {
    var newId = compteId;
    if (isNew) {
      var res = await grist.docApi.applyUserActions([['AddRecord', COMPTES_TABLE, null, record]]);
      newId = (res && res.retValues && res.retValues[0]) || res;
    } else {
      await grist.docApi.applyUserActions([['UpdateRecord', COMPTES_TABLE, compteId, record]]);
    }

    if (contactName) {
      var existingPrimary = isNew ? null : getPrimaryContact(compteId);
      var contactRecord = {};
      setField(contactRecord, 'contacts', 'name', contactName);
      setField(contactRecord, 'contacts', 'email', contactEmail);
      setField(contactRecord, 'contacts', 'phone', contactPhone);
      if (existingPrimary) {
        await grist.docApi.applyUserActions([['UpdateRecord', CONTACTS_TABLE, existingPrimary.id, contactRecord]]);
      } else {
        setField(contactRecord, 'contacts', 'isPrimary', true);
        contactRecord.Compte_Id = newId;
        await grist.docApi.applyUserActions([['AddRecord', CONTACTS_TABLE, null, contactRecord]]);
      }
    }

    if (isNew) {
      showToast(t('compteCreated'), 'success');
    } else {
      showToast(t('compteUpdated'), 'success');
    }
    closeModal();
    clearEditModalDraft();
    await loadAllData();
  } catch (e) {
    console.error('[CRM] Error saving compte:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

export async function deleteCompte(compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal(t('confirmDelete'), 'Supprimer la fiche');
  if (!confirmed) return;
  try {
    var actions = [];
    getContactsForCompte(compteId).forEach(function(c) { actions.push(['RemoveRecord', CONTACTS_TABLE, c.id]); });
    getContractsForCompte(compteId).forEach(function(c) { actions.push(['RemoveRecord', CONTRATS_TABLE, c.id]); });
    getCommentsForCompte(compteId).forEach(function(c) { actions.push(['RemoveRecord', COMMENTAIRES_TABLE, c.id]); });
    getTasksForCompte(compteId).forEach(function(t2) { actions.push(['RemoveRecord', TACHES_TABLE, t2.id]); });
    actions.push(['RemoveRecord', COMPTES_TABLE, compteId]);
    await grist.docApi.applyUserActions(actions);
    showToast(t('compteDeleted'), 'info');
    await loadAllData();
  } catch (e) {
    console.error('[CRM] Error deleting compte:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}
