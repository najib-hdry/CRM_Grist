// Modal fiche compte : lecture (fiche), édition (info + autocomplétion adresse),
// et sous-onglets contacts/contrats/notes/tâches. Modale de confirmation générique.

import { isOwner, isEditor } from '../state.js';
import { sanitize, formatAmount, capitalize } from '../utils/format.js';
import { formatDate, epochToInputDate, daysFromNow, addDaysToDateInput } from '../utils/dates.js';
import { getVal } from '../ui/dom.js';
import {
  getCompteById, getPrimaryContact, getEquipeMemberName, getSignedContractsTotal,
  getContactsForCompte, getContractsForCompte, getCommentsForCompte, getTasksForCompte,
  buildEquipeOptions
} from '../data/relations.js';
import { isStageStopFollowUp } from '../data/filtering.js';
import {
  t, currentLang, getAccountTypeLabel, getAccountTypes, getStatusColor, getStatusLabel,
  getKanbanStatuses, getNextActions, getNextActionReminderDays, getNextActionLabel,
  getTagsList, getTagLabel, getCategoriesList, getCategoryLabel
} from '../app.js';

export var editModalActiveTab = 'fiche';
export function setEditModalActiveTab(tab) { editModalActiveTab = tab; }
var modalExpanded = true;
// Fiche en cours de création (aucun enregistrement Grist tant que l'utilisateur n'a pas
// cliqué sur Enregistrer) — cf. openNewCompteModal().
var isNewCompteDraft = false;

export function toggleModalExpand(compteId) {
  captureInfoDraftIfPresent();
  modalExpanded = !modalExpanded;
  openEditCompteModal(compteId, true);
}
export var editModalDraft = null; // capture les champs du formulaire "info" lors d'un changement d'onglet, pour ne pas perdre la saisie
export function clearEditModalDraft() { editModalDraft = null; }

function captureInfoDraftIfPresent() {
  var nameEl = document.getElementById('compte-name');
  if (!nameEl) return; // l'onglet "info" n'est pas affiché, rien à capturer
  editModalDraft = {
    name: nameEl.value,
    type: getVal('compte-type', ''),
    status: getVal('compte-status', ''),
    priority: getVal('compte-priority', ''),
    responsible: getVal('compte-responsible', '0'),
    amount: getVal('compte-amount', ''),
    nextAction: getVal('compte-next-action', ''),
    nextActionDate: getVal('compte-next-action-date', ''),
    relanceDate: getVal('compte-relance-date', ''),
    category: getVal('compte-category', ''),
    categoryCustom: getVal('compte-category-custom', ''),
    tag: getVal('compte-tag', ''),
    tagCustom: getVal('compte-tag-custom', ''),
    description: getVal('compte-description', ''),
    website: getVal('compte-website', ''),
    addressStreet: getVal('compte-address-street', ''),
    addressZip: getVal('compte-address-zip', ''),
    addressCity: getVal('compte-address-city', ''),
    addressLat: getVal('compte-address-lat', ''),
    addressLng: getVal('compte-address-lng', ''),
    contactName: getVal('compte-contact-name', ''),
    contactEmail: getVal('compte-contact-email', ''),
    contactPhone: getVal('compte-contact-phone', '')
  };
}

export function openEditCompteModal(compteId, keepTab) {
  var compte = getCompteById(compteId);
  if (!compte) return;
  isNewCompteDraft = false;
  if (!keepTab) { editModalActiveTab = 'fiche'; editModalDraft = null; }

  var modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = renderCompteModal(compte);
  modalContainer.classList.remove('hidden');
}

// Ouvre le formulaire pour une nouvelle fiche sans rien créer dans Grist : l'enregistrement
// n'a lieu que lorsque l'utilisateur clique sur "Enregistrer" (cf. saveCompteFromModal).
export function openNewCompteModal(initialType) {
  isNewCompteDraft = true;
  editModalActiveTab = 'info';
  editModalDraft = null;

  var type = initialType || 'prospect';
  var statuses = getKanbanStatuses();
  // Un client créé directement démarre à l'étape "Contrat signé" (marksAsClient),
  // pas à la première étape du pipeline (réservée aux prospects).
  var defaultStage = type === 'client' ? (statuses.find(function(s) { return s.marksAsClient; }) || statuses[0]) : statuses[0];

  var draftCompte = {
    id: null,
    Name: '', Type: type, Status: defaultStage.key, Priority: 'medium',
    Responsible: 0, Amount: 0, Next_Action: '', Next_Action_Date: null, Relance_Date: null,
    Category: '', Tag: '', Description: '', Website: '',
    Address_Street: '', Address_Zip: '', Address_City: '', Address_Lat: null, Address_Lng: null,
    Created_At: null
  };

  var modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = renderCompteModal(draftCompte);
  modalContainer.classList.remove('hidden');
}

function renderCompteModal(compte) {
  var isNew = compte.id == null;
  var html = '<div class="modal-overlay" onclick="if(event.target===this) closeModal()">';
  html += '<div class="modal modal-large' + (modalExpanded ? ' modal-expanded' : '') + '">';
  html += '<div class="modal-header">';
  html += '<h2>' + sanitize(isNew ? t('modalNewCompte') : (compte.Name || t('modalEditCompte'))) + '</h2>';
  html += '<div class="modal-header-actions">';
  if (!isNew) {
    html += '<button class="modal-expand-btn" title="' + (currentLang === 'fr' ? 'Agrandir / réduire' : 'Expand / collapse') + '" onclick="toggleModalExpand(' + compte.id + ')">' + (modalExpanded ? '⤡' : '⤢') + '</button>';
  }
  html += '<button class="modal-close" onclick="closeModal()">✕</button>';
  html += '</div>';
  html += '</div>';

  if (!isNew) {
    html += '<div class="modal-tabs">';
    ['fiche', 'info', 'contacts', 'contrats', 'comments', 'tasks'].forEach(function(tab) {
      var labels = {
        fiche: currentLang === 'fr' ? 'Informations' : 'Info',
        info: currentLang === 'fr' ? 'Modifier' : 'Edit',
        contacts: t('contactsTitle'), contrats: t('contractsTitle'), comments: t('commentsTitle'), tasks: t('tasksTitle')
      };
      html += '<button class="modal-tab-btn ' + (editModalActiveTab === tab ? 'active' : '') + '" onclick="switchModalTab(\'' + tab + '\', ' + compte.id + ')">' + labels[tab] + '</button>';
    });
    html += '</div>';
  }

  html += '<div class="modal-body">';
  if (isNew) html += renderInfoTab(compte);
  else if (editModalActiveTab === 'fiche') html += renderFicheTab(compte);
  else if (editModalActiveTab === 'info') html += renderInfoTab(compte);
  else if (editModalActiveTab === 'contacts') html += renderContactsTab(compte);
  else if (editModalActiveTab === 'contrats') html += renderContractsTab(compte);
  else if (editModalActiveTab === 'comments') html += renderCommentsTab(compte);
  else if (editModalActiveTab === 'tasks') html += renderTasksTab(compte);
  html += '</div>';

  if (isNew || editModalActiveTab === 'info') {
    html += '<div class="modal-footer">';
    if (isOwner && !isNew) html += '<button class="btn btn-danger" onclick="deleteCompte(' + compte.id + ')">' + t('delete') + '</button>';
    html += '<div style="flex:1;"></div>';
    html += '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancel') + '</button>';
    html += '<button class="btn btn-primary" onclick="saveCompteFromModal(' + compte.id + ')">' + t('save') + '</button>';
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}

export function switchModalTab(tab, compteId) {
  captureInfoDraftIfPresent();
  editModalActiveTab = tab;
  openEditCompteModal(compteId, true);
}

function buildStatusOptions(selectedKey) {
  return getKanbanStatuses().map(function(s) {
    return '<option value="' + s.key + '"' + (selectedKey === s.key ? ' selected' : '') + '>' + sanitize(s.label) + '</option>';
  }).join('');
}

function buildCategoryOptions(selectedKey) {
  var html = '<option value="">' + (currentLang === 'fr' ? '(aucune)' : '(none)') + '</option>';
  var found = !selectedKey;
  getCategoriesList().forEach(function(c) {
    if (c.key === selectedKey) found = true;
    html += '<option value="' + c.key + '"' + (selectedKey === c.key ? ' selected' : '') + '>' + sanitize(c.label) + '</option>';
  });
  // Valeur existante (migrée depuis l'ancien champ texte libre) qui ne correspond à aucune
  // catégorie connue : on l'ajoute quand même comme option pour ne pas la perdre silencieusement.
  if (selectedKey && selectedKey !== '__new__' && !found) {
    html += '<option value="' + sanitize(selectedKey) + '" selected>' + sanitize(selectedKey) + '</option>';
  }
  html += '<option value="__new__"' + (selectedKey === '__new__' ? ' selected' : '') + '>+ ' + (currentLang === 'fr' ? 'Créer une nouvelle catégorie...' : 'Create new category...') + '</option>';
  return html;
}

export function handleCategorySelectChange(select) {
  var customInput = document.getElementById('compte-category-custom');
  if (!customInput) return;
  if (select.value === '__new__') {
    customInput.classList.remove('hidden');
    customInput.focus();
  } else {
    customInput.classList.add('hidden');
    customInput.value = '';
  }
}

function buildTagOptions(selectedKey) {
  var html = '<option value="">' + (currentLang === 'fr' ? '(aucun)' : '(none)') + '</option>';
  var found = !selectedKey;
  getTagsList().forEach(function(tg) {
    if (tg.key === selectedKey) found = true;
    html += '<option value="' + tg.key + '"' + (selectedKey === tg.key ? ' selected' : '') + '>' + sanitize(tg.label) + '</option>';
  });
  // Valeur existante (migrée depuis l'ancien champ texte libre) qui ne correspond à aucun tag
  // connu : on l'ajoute quand même comme option pour ne pas la perdre silencieusement.
  if (selectedKey && selectedKey !== '__new__' && !found) {
    html += '<option value="' + sanitize(selectedKey) + '" selected>' + sanitize(selectedKey) + '</option>';
  }
  html += '<option value="__new__"' + (selectedKey === '__new__' ? ' selected' : '') + '>+ ' + (currentLang === 'fr' ? 'Créer un nouveau tag...' : 'Create new tag...') + '</option>';
  return html;
}

export function handleTagSelectChange(select) {
  var customInput = document.getElementById('compte-tag-custom');
  if (!customInput) return;
  if (select.value === '__new__') {
    customInput.classList.remove('hidden');
    customInput.focus();
  } else {
    customInput.classList.add('hidden');
    customInput.value = '';
  }
}

// --- Fiche (lecture seule) ---
function ficheRow(label, value, isLink) {
  var display = value ? sanitize(value) : '<span class="fiche-row-empty">—</span>';
  if (value && isLink === 'web') {
    var href = value.indexOf('http') === 0 ? value : 'https://' + value;
    display = '<a href="' + sanitize(href) + '" target="_blank" rel="noopener" class="fiche-link">🌐 ' + sanitize(value) + '</a>';
  }
  return '<div class="fiche-row"><span class="fiche-row-label">' + sanitize(label) + '</span><span class="fiche-row-value">' + display + '</span></div>';
}

function ficheCard(icon, title, rowsHtml, extraClass) {
  return '<div class="fiche-card' + (extraClass ? ' ' + extraClass : '') + '"><h4 class="fiche-card-title">' + icon + ' ' + sanitize(title) + '</h4>' + rowsHtml + '</div>';
}

function renderFicheTab(compte) {
  var primaryContact = getPrimaryContact(compte.id);
  var initial = (compte.Name || '?').trim().charAt(0).toUpperCase();
  var fr = currentLang === 'fr';

  var html = '<div class="fiche-header">';
  var typeColor = ((getAccountTypes().find(function(tp) { return tp.key === compte.Type; }) || {}).color) || '#42B6C8';
  html += '<div class="fiche-avatar" style="background:' + typeColor + ';">' + initial + '</div>';
  html += '<div class="fiche-header-main">';
  html += '<div class="fiche-header-name">' + sanitize(compte.Name || '—') + '</div>';
  html += '<div class="fiche-header-badges">';
  html += '<span class="type-badge type-' + compte.Type + '">' + sanitize(getAccountTypeLabel(compte.Type)) + '</span>';
  html += '<span class="status-badge" style="background:' + getStatusColor(compte.Status) + '22;color:' + getStatusColor(compte.Status) + ';">● ' + sanitize(getStatusLabel(compte.Status)) + '</span>';
  html += '<span class="priority-dot dot-' + compte.Priority + '"></span> ' + sanitize(t('priority' + capitalize(compte.Priority)));
  html += '</div></div>';
  html += '<div class="fiche-header-actions">';
  html += '<button class="btn btn-primary" onclick="switchModalTab(\'info\', ' + compte.id + ')">✏️ ' + (fr ? 'Modifier' : 'Edit') + '</button>';
  if (isOwner) html += '<button class="btn btn-danger" onclick="deleteCompte(' + compte.id + ')">🗑️ ' + t('delete') + '</button>';
  html += '</div>';
  html += '</div>';

  html += '<div class="fiche-cards-grid">';

  html += ficheCard('👤', fr ? 'Contact principal' : 'Primary contact',
    ficheRow(fr ? 'Nom' : 'Name', primaryContact ? primaryContact.Name : '') +
    ficheRow(fr ? 'Email' : 'Email', primaryContact ? primaryContact.Email : '') +
    ficheRow(fr ? 'Téléphone' : 'Phone', primaryContact ? primaryContact.Phone : '') +
    ficheRow(t('fieldWebsite'), compte.Website, 'web')
  );

  html += ficheCard('💼', fr ? 'Informations commerciales' : 'Business info',
    ficheRow(t('fieldStatus'), getStatusLabel(compte.Status)) +
    ficheRow(t('fieldResponsible'), getEquipeMemberName(compte.Responsible)) +
    ficheRow(t('fieldAmount'), formatAmount(compte.Amount)) +
    ficheRow(t('fieldContractsTotal'), formatAmount(getSignedContractsTotal(compte.id)))
  );

  html += ficheCard('📅', fr ? 'Suivi & relances' : 'Follow-up',
    ficheRow(t('fieldNextAction'), getNextActionLabel(compte.Type, compte.Next_Action)) +
    ficheRow(t('fieldNextActionDate'), compte.Next_Action_Date ? formatDate(compte.Next_Action_Date) : '') +
    ficheRow(t('fieldRelanceDate'), compte.Relance_Date ? formatDate(compte.Relance_Date) : '') +
    ficheRow(fr ? 'Créé le' : 'Created on', compte.Created_At ? formatDate(compte.Created_At) : '')
  );

  var addressRowsHtml = ficheRow(t('fieldAddressStreet'), compte.Address_Street) +
    ficheRow(t('fieldAddressZip'), compte.Address_Zip) +
    ficheRow(t('fieldAddressCity'), compte.Address_City);
  html += ficheCard('📍', fr ? 'Adresse' : 'Address', addressRowsHtml);

  html += ficheCard('🏷️', fr ? 'Catégorisation' : 'Categorization',
    ficheRow(t('fieldCategory'), getCategoryLabel(compte.Category)) +
    ficheRow(t('fieldTag'), getTagLabel(compte.Tag))
  );

  html += '</div>';

  if (compte.Description) {
    html += ficheCard('📝', t('fieldDescription'), '<div class="fiche-description">' + sanitize(compte.Description) + '</div>', 'fiche-card-full');
  }
  return html;
}

function renderInfoTab(compte) {
  var d = editModalDraft; // brouillon non sauvegardé (changement d'onglet), prioritaire sur les données serveur
  var vName = d ? d.name : compte.Name;
  var vType = d ? d.type : compte.Type;
  var vStatus = d ? d.status : compte.Status;
  var vPriority = d ? d.priority : compte.Priority;
  var vResponsible = d ? d.responsible : compte.Responsible;
  var vAmount = d ? d.amount : (compte.Amount || 0);
  var vNextAction = d ? d.nextAction : compte.Next_Action;
  var vNextActionDate = d ? d.nextActionDate : epochToInputDate(compte.Next_Action_Date);
  var vRelanceDate = d ? d.relanceDate : epochToInputDate(compte.Relance_Date);
  var vCategory = d ? d.category : compte.Category;
  var vCategoryCustom = d ? d.categoryCustom : '';
  var vTag = d ? d.tag : compte.Tag;
  var vTagCustom = d ? d.tagCustom : '';
  var vDescription = d ? d.description : compte.Description;
  var vWebsite = d ? d.website : compte.Website;
  var vAddressStreet = d ? d.addressStreet : compte.Address_Street;
  var vAddressZip = d ? d.addressZip : compte.Address_Zip;
  var vAddressCity = d ? d.addressCity : compte.Address_City;
  var vAddressLat = d ? d.addressLat : compte.Address_Lat;
  var vAddressLng = d ? d.addressLng : compte.Address_Lng;
  var primaryContact = getPrimaryContact(compte.id);
  var vContactName = d ? d.contactName : (primaryContact ? primaryContact.Name : '');
  var vContactEmail = d ? d.contactEmail : (primaryContact ? primaryContact.Email : '');
  var vContactPhone = d ? d.contactPhone : (primaryContact ? primaryContact.Phone : '');
  var fr2 = currentLang === 'fr';

  var html = '<h4 class="form-section-title">' + (fr2 ? 'Contact principal' : 'Primary contact') + '</h4>';
  html += '<p class="settings-hint">' + (fr2
    ? 'Pour gérer plusieurs contacts ou changer lequel est principal, utilisez l’onglet Contacts.'
    : 'To manage several contacts or change who is primary, use the Contacts tab.') + '</p>';
  html += '<div class="form-grid">';
  html += formField(fr2 ? 'Nom du contact' : 'Contact name', '<input id="compte-contact-name" type="text" value="' + sanitize(vContactName) + '">');
  html += formField(fr2 ? 'Email du contact' : 'Contact email', '<input id="compte-contact-email" type="email" value="' + sanitize(vContactEmail) + '">');
  html += formField(fr2 ? 'Téléphone du contact' : 'Contact phone', '<input id="compte-contact-phone" type="text" value="' + sanitize(vContactPhone) + '">');
  html += '</div>';

  html += '<h4 class="form-section-title">' + (fr2 ? 'Informations du compte' : 'Account information') + '</h4>';
  html += '<div class="form-grid">';
  html += formField(t('fieldName'), '<input id="compte-name" type="text" value="' + sanitize(vName) + '">');
  html += formField(t('fieldType'), '<select id="compte-type" onchange="refreshNextActionOptions()">' +
    getAccountTypes().map(function(tp) { return '<option value="' + tp.key + '"' + (vType === tp.key ? ' selected' : '') + '>' + sanitize(tp.label) + '</option>'; }).join('') +
    '</select>');
  html += formField(t('fieldStatus'), '<select id="compte-status">' + buildStatusOptions(vStatus) + '</select>');
  html += formField(t('fieldPriority'), '<select id="compte-priority">' +
    '<option value="high"' + (vPriority === 'high' ? ' selected' : '') + '>' + t('priorityHigh') + '</option>' +
    '<option value="medium"' + (vPriority === 'medium' ? ' selected' : '') + '>' + t('priorityMedium') + '</option>' +
    '<option value="low"' + (vPriority === 'low' ? ' selected' : '') + '>' + t('priorityLow') + '</option>' +
    '</select>');
  html += formField(t('fieldResponsible'), '<select id="compte-responsible">' + buildEquipeOptions(vResponsible) + '</select>');
  html += formField(t('fieldAmount'), '<input id="compte-amount" type="number" step="0.01" value="' + sanitize(vAmount) + '">');
  html += formField(t('fieldContractsTotal'), '<input type="text" value="' + formatAmount(getSignedContractsTotal(compte.id)) + '" disabled style="background:var(--bg-disabled,#f1f5f9);color:#64748b;">');
  html += formField(t('fieldNextAction'), '<select id="compte-next-action" onchange="recalcRelanceDate()">' + buildNextActionOptions(vType, vNextAction) + '</select>');
  html += formField(t('fieldNextActionDate'), '<input id="compte-next-action-date" type="date" value="' + sanitize(vNextActionDate) + '" onchange="recalcRelanceDate()">');
  html += formField(t('fieldRelanceDate'), '<input id="compte-relance-date" type="date" value="' + sanitize(vRelanceDate) + '">');
  html += formField(t('fieldCategory'), '<select id="compte-category" onchange="handleCategorySelectChange(this)">' + buildCategoryOptions(vCategory) + '</select>' +
    '<input id="compte-category-custom" type="text" class="' + (vCategory === '__new__' ? '' : 'hidden') + '" value="' + sanitize(vCategoryCustom) + '" placeholder="' + (currentLang === 'fr' ? 'Nom de la nouvelle catégorie' : 'New category name') + '" style="margin-top:6px;">');
  html += formField(t('fieldTag'), '<select id="compte-tag" onchange="handleTagSelectChange(this)">' + buildTagOptions(vTag) + '</select>' +
    '<input id="compte-tag-custom" type="text" class="' + (vTag === '__new__' ? '' : 'hidden') + '" value="' + sanitize(vTagCustom) + '" placeholder="' + (currentLang === 'fr' ? 'Nom du nouveau tag' : 'New tag name') + '" style="margin-top:6px;">');
  html += formField(t('fieldWebsite'), '<input id="compte-website" type="text" placeholder="https://..." value="' + sanitize(vWebsite) + '">');
  html += '<div class="form-field form-field-address" style="position:relative;">';
  html += '<label>' + sanitize(t('fieldAddressStreet')) + '</label>';
  html += '<input id="compte-address-street" type="text" autocomplete="off" value="' + sanitize(vAddressStreet) + '" oninput="onAddressStreetInput(this.value)" onblur="setTimeout(hideAddressSuggestions, 200)" placeholder="' + (currentLang === 'fr' ? 'Commencez à taper pour rechercher...' : 'Start typing to search...') + '">';
  html += '<input type="hidden" id="compte-address-lat" value="' + (vAddressLat != null ? vAddressLat : '') + '">';
  html += '<input type="hidden" id="compte-address-lng" value="' + (vAddressLng != null ? vAddressLng : '') + '">';
  html += '<div id="address-suggestions" class="address-suggestions hidden"></div>';
  html += '</div>';
  html += formField(t('fieldAddressZip'), '<input id="compte-address-zip" type="text" value="' + sanitize(vAddressZip) + '">');
  html += formField(t('fieldAddressCity'), '<input id="compte-address-city" type="text" value="' + sanitize(vAddressCity) + '">');
  html += '</div>';
  html += '<div class="form-field-full">' + formField(t('fieldDescription'), '<textarea id="compte-description" rows="3">' + sanitize(vDescription) + '</textarea>') + '</div>';
  return html;
}

function formField(label, inputHtml) {
  return '<div class="form-field"><label>' + sanitize(label) + '</label>' + inputHtml + '</div>';
}

// --- Autocomplétion d'adresse (API Adresse gouv.fr — gratuite, sans clé) ---
var _addressAutocompleteTimer = null;
var _addressSuggestions = [];

export function onAddressStreetInput(value) {
  // l'utilisateur retape manuellement : on invalide les coordonnées tant qu'il ne resélectionne pas une suggestion
  setVal('compte-address-lat', '');
  setVal('compte-address-lng', '');
  if (_addressAutocompleteTimer) clearTimeout(_addressAutocompleteTimer);
  var query = value.trim();
  if (query.length < 3) {
    hideAddressSuggestions();
    return;
  }
  _addressAutocompleteTimer = setTimeout(function() { fetchAddressSuggestions(query); }, 300);
}

function fetchAddressSuggestions(query) {
  fetch('https://api-adresse.data.gouv.fr/search/?q=' + encodeURIComponent(query) + '&limit=5')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      _addressSuggestions = (data.features || []).map(function(f) {
        return {
          label: f.properties.label,
          street: (f.properties.housenumber ? f.properties.housenumber + ' ' : '') + (f.properties.street || f.properties.name || ''),
          postcode: f.properties.postcode || '',
          city: f.properties.city || '',
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0]
        };
      });
      renderAddressSuggestions();
    })
    .catch(function(e) { console.log('[CRM] Address autocomplete failed:', e.message); });
}

function renderAddressSuggestions() {
  var box = document.getElementById('address-suggestions');
  if (!box) return;
  if (_addressSuggestions.length === 0) { hideAddressSuggestions(); return; }
  var html = _addressSuggestions.map(function(s, idx) {
    return '<div class="address-suggestion-item" onclick="selectAddressSuggestion(' + idx + ')">' + sanitize(s.label) + '</div>';
  }).join('');
  box.innerHTML = html;
  box.classList.remove('hidden');
}

export function hideAddressSuggestions() {
  var box = document.getElementById('address-suggestions');
  if (box) { box.innerHTML = ''; box.classList.add('hidden'); }
  _addressSuggestions = [];
}

export function selectAddressSuggestion(idx) {
  var s = _addressSuggestions[idx];
  if (!s) return;
  setVal('compte-address-street', s.street);
  setVal('compte-address-zip', s.postcode);
  setVal('compte-address-city', s.city);
  setVal('compte-address-lat', s.lat);
  setVal('compte-address-lng', s.lng);
  hideAddressSuggestions();
}

function setVal(id, value) {
  var el = document.getElementById(id);
  if (el) el.value = value;
}

function buildNextActionOptions(compteType, selectedKey) {
  var actions = getNextActions(compteType);
  var html = '<option value="">' + (currentLang === 'fr' ? '(aucune)' : '(none)') + '</option>';
  var found = false;
  actions.forEach(function(a) {
    if (a.key === selectedKey) found = true;
    html += '<option value="' + a.key + '"' + (selectedKey === a.key ? ' selected' : '') + '>' + sanitize(a.label) + '</option>';
  });
  if (selectedKey && !found) {
    html += '<option value="' + sanitize(selectedKey) + '" selected>' + sanitize(selectedKey) + '</option>';
  }
  return html;
}

export function refreshNextActionOptions() {
  var type = getVal('compte-type', 'prospect');
  var sel = document.getElementById('compte-next-action');
  if (!sel) return;
  sel.innerHTML = buildNextActionOptions(type, '');
  recalcRelanceDate();
}

export function recalcRelanceDate() {
  var type = getVal('compte-type', 'prospect');
  var actionKey = getVal('compte-next-action', '');
  var actionDate = getVal('compte-next-action-date', '');
  var relanceEl = document.getElementById('compte-relance-date');
  if (!relanceEl || !actionKey || !actionDate) return;
  var days = getNextActionReminderDays(type, actionKey);
  if (days == null) return;
  relanceEl.value = addDaysToDateInput(actionDate, days);
}

// --- Contacts tab ---
function renderContactsTab(compte) {
  var list = getContactsForCompte(compte.id);
  var html = '<div class="rgpd-notice">' + t('rgpdNotice') + '</div>';
  html += '<div class="sub-list">';
  list.forEach(function(c) {
    html += '<div class="sub-item">';
    html += '<div class="sub-item-main">';
    html += '<strong>' + sanitize(c.Name) + '</strong>';
    if (c.Is_Primary) html += ' <span class="badge-primary">' + (currentLang === 'fr' ? 'Principal' : 'Primary') + '</span>';
    html += '<div class="sub-item-detail">' + [c.Role, c.Email, c.Phone].filter(Boolean).map(sanitize).join(' · ') + '</div>';
    html += '<label class="consent-check"><input type="checkbox" ' + (c.RGPD_Consent ? 'checked' : '') + ' onchange="setContactConsent(' + c.id + ', ' + compte.id + ', this.checked)"> ' + t('rgpdConsent');
    if (c.RGPD_Consent_Date) html += ' <span class="consent-date">(' + formatDate(c.RGPD_Consent_Date) + ')</span>';
    html += '</label>';
    html += '<div class="contact-rgpd-actions">';
    html += '<button class="link-btn" onclick="exportContactData(' + c.id + ')">' + (currentLang === 'fr' ? '⬇️ Télécharger les données de ce contact' : '⬇️ Download this contact’s data') + '</button>';
    html += '</div>';
    html += '</div>';
    if (isOwner) {
      html += '<div class="sub-item-actions">';
      html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Retirer ce contact de la fiche' : 'Remove this contact') + '" onclick="deleteContact(' + c.id + ', ' + compte.id + ')">🗑️</button>';
      html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Suppression RGPD définitive (droit à l’oubli)' : 'Permanent GDPR deletion') + '" onclick="rgpdDeleteContact(' + c.id + ', ' + compte.id + ')">⚠️</button>';
      html += '</div>';
    }
    html += '</div>';
  });
  if (list.length === 0) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucun contact pour le moment' : 'No contact yet') + '</div>';
  html += '</div>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? '🗑️ retire le contact de cette fiche (récupérable en le recréant). ⚠️ supprime définitivement toutes ses données (droit à l’oubli RGPD, irréversible).'
    : '🗑️ removes the contact from this record. ⚠️ permanently erases all its data (GDPR right to erasure, irreversible).') + '</p>';

  html += '<div class="add-form">';
  html += '<input id="new-contact-name" type="text" placeholder="' + (currentLang === 'fr' ? 'Nom *' : 'Name *') + '">';
  html += '<input id="new-contact-role" type="text" placeholder="' + (currentLang === 'fr' ? 'Fonction' : 'Role') + '">';
  html += '<input id="new-contact-email" type="email" placeholder="Email">';
  html += '<input id="new-contact-phone" type="tel" placeholder="' + (currentLang === 'fr' ? 'Téléphone' : 'Phone') + '">';
  html += '<button class="btn btn-primary" onclick="addContact(' + compte.id + ')">' + t('addContact') + '</button>';
  html += '</div>';
  return html;
}

// --- Contracts tab ---
function renderContractsTab(compte) {
  var list = getContractsForCompte(compte.id);
  var statusLabels = { en_cours: currentLang === 'fr' ? 'En cours' : 'In progress', signe: currentLang === 'fr' ? 'Signé' : 'Signed', termine: currentLang === 'fr' ? 'Terminé' : 'Finished', annule: currentLang === 'fr' ? 'Annulé' : 'Cancelled' };

  var html = '<div class="sub-list">';
  list.forEach(function(c) {
    html += '<div class="sub-item">';
    html += '<div class="sub-item-main">';
    html += '<strong>' + sanitize(c.Label) + '</strong> — ' + formatAmount(c.Amount);
    html += '<div class="sub-item-detail">' + (statusLabels[c.Status] || c.Status) + (c.Start_Date ? ' · ' + formatDate(c.Start_Date) : '') + (c.End_Date ? ' → ' + formatDate(c.End_Date) : '') + '</div>';
    if (c.Fichier_Nom) {
      html += '<div class="sub-item-file" onclick="downloadContractFile(' + c.id + ')">📎 ' + sanitize(c.Fichier_Nom) + '</div>';
    }
    html += '</div>';
    if (isOwner) html += '<div class="sub-item-actions"><button class="btn-icon" onclick="deleteContract(' + c.id + ', ' + compte.id + ')" title="' + t('delete') + '">🗑️</button></div>';
    html += '</div>';
  });
  if (list.length === 0) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucun contrat pour le moment' : 'No contract yet') + '</div>';
  html += '</div>';

  html += '<div class="add-form">';
  html += '<input id="new-contract-label" type="text" placeholder="' + (currentLang === 'fr' ? 'Intitulé *' : 'Label *') + '">';
  html += '<input id="new-contract-amount" type="number" step="0.01" placeholder="' + (currentLang === 'fr' ? 'Montant' : 'Amount') + '">';
  html += '<select id="new-contract-status">';
  Object.keys(statusLabels).forEach(function(key) { html += '<option value="' + key + '">' + statusLabels[key] + '</option>'; });
  html += '</select>';
  html += '<input id="new-contract-start" type="date" title="' + (currentLang === 'fr' ? 'Date début' : 'Start date') + '">';
  html += '<input id="new-contract-end" type="date" title="' + (currentLang === 'fr' ? 'Date fin' : 'End date') + '">';
  html += '<label class="file-input-label">📎 ' + (currentLang === 'fr' ? 'Joindre le contrat' : 'Attach file') + '<input id="new-contract-file" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style="display:none;" onchange="updateFileLabel(this)"></label>';
  html += '<button class="btn btn-primary" onclick="addContract(' + compte.id + ')">' + t('addContract') + '</button>';
  html += '</div>';
  return html;
}

// --- Comments tab ---
function renderCommentsTab(compte) {
  var list = getCommentsForCompte(compte.id);
  var html = '<div class="add-form" style="margin-bottom:16px;">';
  html += '<textarea id="new-comment-input" rows="2" placeholder="' + (currentLang === 'fr' ? 'Ajouter une note...' : 'Add a note...') + '" style="flex:1;"></textarea>';
  html += '<button class="btn btn-primary" onclick="addCrmComment(' + compte.id + ')">' + t('addComment') + '</button>';
  html += '</div>';

  html += '<div class="comment-list">';
  list.forEach(function(c) {
    html += '<div class="comment-item" id="comment-item-' + c.id + '">';
    html += '<div class="comment-meta"><strong>' + sanitize(c.Author) + '</strong> · ' + formatDate(c.Created_At) + '</div>';
    html += '<div class="comment-content" id="comment-content-' + c.id + '">' + sanitize(c.Content) + '</div>';
    html += '<div class="comment-actions">';
    if (isOwner || isEditor) html += '<button class="btn-icon-small" title="' + (currentLang === 'fr' ? 'Modifier' : 'Edit') + '" onclick="editCrmComment(' + c.id + ', ' + compte.id + ')">✏️</button>';
    if (isOwner) html += '<button class="btn-icon-small" onclick="deleteCrmComment(' + c.id + ', ' + compte.id + ')">🗑️</button>';
    html += '</div>';
    html += '</div>';
  });
  if (list.length === 0) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucune note pour le moment' : 'No notes yet') + '</div>';
  html += '</div>';
  return html;
}

// --- Tasks tab ---
function renderTasksTab(compte) {
  var fr = currentLang === 'fr';
  var html = '';

  if (isStageStopFollowUp(compte.Status)) {
    html += '<div class="relance-summary-card relance-summary-stopped">';
    html += '<div class="relance-summary-header">🚫 ' + (fr ? 'Sans suite' : 'No follow-up') + '</div>';
    html += '<div class="relance-summary-body"><div class="relance-summary-action">' + (fr
      ? 'Ce dossier est classé « ' + sanitize(getStatusLabel(compte.Status)) + ' » — aucune relance ni prochaine action n’est proposée.'
      : 'This record is marked “' + sanitize(getStatusLabel(compte.Status)) + '” — no reminder or next action is suggested.') + '</div></div>';
    html += '</div>';
  } else if (compte.Relance_Date || compte.Next_Action) {
    var days = compte.Relance_Date ? daysFromNow(compte.Relance_Date) : null;
    var daysLabel = days === null ? '' : (days < 0
      ? Math.abs(days) + (fr ? ' j de retard' : ' days overdue')
      : (days === 0 ? (fr ? 'aujourd’hui' : 'today') : (fr ? 'dans ' + days + ' j' : 'in ' + days + ' d')));
    html += '<div class="relance-summary-card' + (days !== null && days < 0 ? ' relance-summary-late' : '') + '">';
    html += '<div class="relance-summary-header">🔔 ' + (fr ? 'Relance à traiter' : 'Reminder to handle') + '</div>';
    html += '<div class="relance-summary-body">';
    html += '<div class="relance-summary-action">' + (compte.Next_Action ? sanitize(getNextActionLabel(compte.Type, compte.Next_Action)) : (fr ? '(aucune action précisée)' : '(no action specified)')) + '</div>';
    if (compte.Relance_Date) {
      html += '<div class="relance-summary-date">' + (fr ? 'Prévue le ' : 'Scheduled for ') + formatDate(compte.Relance_Date) + (daysLabel ? ' (' + daysLabel + ')' : '') + '</div>';
    }
    html += '</div>';
    html += '<div class="relance-summary-actions">';
    html += '<button class="btn btn-secondary" onclick="switchModalTab(\'info\', ' + compte.id + ')">✏️ ' + (fr ? 'Modifier' : 'Edit') + '</button>';
    html += '<button class="btn btn-primary" onclick="clearRelance(' + compte.id + ')">✓ ' + (fr ? 'Marquer comme traitée' : 'Mark as handled') + '</button>';
    html += '</div>';
    html += '</div>';
  }

  html += '<h4 class="form-section-title">' + (fr ? 'Tâches' : 'Tasks') + '</h4>';

  var list = getTasksForCompte(compte.id).sort(function(a, b) { return (a.Due_Date || 0) - (b.Due_Date || 0); });
  html += '<div class="sub-list">';
  list.forEach(function(tsk) {
    html += '<div class="sub-item ' + (tsk.Status === 'fait' ? 'task-done' : '') + '">';
    html += '<div class="sub-item-main">';
    html += '<label class="task-check"><input type="checkbox" ' + (tsk.Status === 'fait' ? 'checked' : '') + ' onchange="toggleCrmTask(' + tsk.id + ', ' + compte.id + ', this.checked)"> <span>' + sanitize(tsk.Title) + '</span></label>';
    html += '<div class="sub-item-detail">' + (tsk.Due_Date ? formatDate(tsk.Due_Date) : t('noDate')) + (tsk.Assignee ? ' · ' + sanitize(getEquipeMemberName(tsk.Assignee)) : '') + '</div>';
    html += '</div>';
    if (isOwner) html += '<div class="sub-item-actions"><button class="btn-icon" onclick="deleteCrmTask(' + tsk.id + ', ' + compte.id + ')" title="' + t('delete') + '">🗑️</button></div>';
    html += '</div>';
  });
  if (list.length === 0) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucune tâche pour le moment' : 'No task yet') + '</div>';
  html += '</div>';

  html += '<div class="add-form">';
  html += '<input id="new-task-title" type="text" placeholder="' + (currentLang === 'fr' ? 'Titre *' : 'Title *') + '">';
  html += '<input id="new-task-due" type="date" title="' + (currentLang === 'fr' ? 'Échéance' : 'Due date') + '">';
  html += '<select id="new-task-assignee">' + buildEquipeOptions(null) + '</select>';
  html += '<button class="btn btn-primary" onclick="addCrmTask(' + compte.id + ')">' + t('addTask') + '</button>';
  html += '</div>';
  return html;
}

export function closeModal() {
  isNewCompteDraft = false;
  var modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = '';
  modalContainer.classList.add('hidden');
}

// --- Confirm modal (générique) ---
export function showConfirmModal(message, title) {
  return new Promise(function(resolve) {
    var modalContainer = document.getElementById('modal-container');
    var html = '<div class="modal-overlay">';
    html += '<div class="modal modal-small">';
    html += '<div class="modal-header"><h2>' + sanitize(title || (currentLang === 'fr' ? 'Confirmation' : 'Confirm')) + '</h2></div>';
    html += '<div class="modal-body"><p>' + sanitize(message) + '</p></div>';
    html += '<div class="modal-footer">';
    html += '<button class="btn btn-secondary" id="confirm-cancel-btn">' + t('cancel') + '</button>';
    html += '<button class="btn btn-danger" id="confirm-ok-btn">' + t('delete') + '</button>';
    html += '</div></div></div>';
    modalContainer.innerHTML = html;
    modalContainer.classList.remove('hidden');

    document.getElementById('confirm-cancel-btn').onclick = function() { closeModal(); resolve(false); };
    document.getElementById('confirm-ok-btn').onclick = function() { closeModal(); resolve(true); };
  });
}
