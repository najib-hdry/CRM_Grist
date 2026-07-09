// CRUD sur CRM_Contacts (ajout, consentement RGPD, suppression, export/suppression RGPD).

import { isOwner, contacts } from '../state.js';
import { CONTACTS_TABLE } from '../config/tables.js';
import { setField } from '../config/column-mapping.js';
import { sanitizeFilename } from '../utils/format.js';
import { formatDate } from '../utils/dates.js';
import { getVal } from '../ui/dom.js';
import { loadAllData } from '../data/load.js';
import { getContactsForCompte, getCompteById } from '../data/relations.js';
import { showToast, openEditCompteModal, showConfirmModal } from '../app.js';

export async function addContact(compteId) {
  var name = getVal('new-contact-name', '').trim();
  if (!name) return;
  var record = { Compte_Id: compteId };
  setField(record, 'contacts', 'name', name);
  setField(record, 'contacts', 'email', getVal('new-contact-email', '').trim());
  setField(record, 'contacts', 'phone', getVal('new-contact-phone', '').trim());
  setField(record, 'contacts', 'role', getVal('new-contact-role', '').trim());
  setField(record, 'contacts', 'isPrimary', getContactsForCompte(compteId).length === 0);

  try {
    await grist.docApi.applyUserActions([['AddRecord', CONTACTS_TABLE, null, record]]);
    showToast('Contact ajouté', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error adding contact:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

export async function setContactConsent(contactId, compteId, checked) {
  var record = {};
  setField(record, 'contacts', 'consent', checked);
  setField(record, 'contacts', 'consentDate', checked ? Math.floor(Date.now() / 1000) : null);
  try {
    await grist.docApi.applyUserActions([['UpdateRecord', CONTACTS_TABLE, contactId, record]]);
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error setting consent:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

export async function deleteContact(contactId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal('Supprimer ce contact ?', 'Supprimer le contact');
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', CONTACTS_TABLE, contactId]]);
    showToast('Contact supprimé', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting contact:', e);
  }
}

// RGPD : export des données d'un contact (portabilité)
export function exportContactData(contactId) {
  var contact = contacts.find(function(c) { return c.id === contactId; });
  if (!contact) return;
  var compte = getCompteById(contact.Compte_Id);
  var data = {
    nom: contact.Name,
    email: contact.Email,
    telephone: contact.Phone,
    fonction: contact.Role,
    compte_associe: compte ? compte.Name : '',
    consentement_rgpd: contact.RGPD_Consent ? 'Oui' : 'Non',
    date_consentement: contact.RGPD_Consent_Date ? formatDate(contact.RGPD_Consent_Date) : '',
    date_export: new Date().toLocaleString('fr-FR')
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var blobUrl = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'contact_' + sanitizeFilename(contact.Name) + '_export.json';
  link.click();
  URL.revokeObjectURL(blobUrl);
  showToast('Données exportées', 'success');
}

// RGPD : suppression définitive (droit à l'oubli)
export async function rgpdDeleteContact(contactId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal(
    'Cette action est définitive et supprime toutes les données de ce contact (droit à l’oubli RGPD). Confirmer ?',
    'Suppression RGPD'
  );
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', CONTACTS_TABLE, contactId]]);
    showToast('Contact supprimé définitivement', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error RGPD delete:', e);
  }
}
