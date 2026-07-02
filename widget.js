// =============================================================================
// GRIST CRM WIDGET — Gestion Prospects / Clients
// =============================================================================

// =============================================================================
// I18N (FR uniquement pour cette version — structure prête pour EN plus tard)
// =============================================================================

var currentLang = 'fr';

var i18n = {
  fr: {
    appTitle: 'CRM',
    appSubtitle: 'Suivez vos prospects, clients et contrats.',
    notInGrist: 'Ce widget doit être utilisé dans Grist.',
    tabKanban: 'Pipeline',
    tabTable: 'Liste',
    tabRelances: 'À relancer',
    tabStats: 'Statistiques',
    tabSettings: 'Paramètres',
    newCompte: 'Nouveau',
    newCompteClient: 'Nouveau client',
    newCompteProspect: 'Nouveau prospect',
    statTotal: 'Total',
    statClients: 'Clients',
    statProspects: 'Prospects',
    statAnciens: 'Anciens clients',
    statCA: 'CA clients (cumulé)',
    statPipeline: 'Pipeline prospects',
    statRelances: 'Relances en attente',
    statRelancesLate: 'Relances en retard',
    noComptes: 'Aucune fiche',
    addCompte: '+ Ajouter une fiche',
    tableTitle: 'Liste des comptes',
    tableSubtitle: 'Tous vos clients et prospects, recherche et tri avancés',
    searchPlaceholder: 'Rechercher (nom, contact, email...)',
    allTypes: 'Tous types',
    allStatuses: 'Tous les statuts',
    allPriorities: 'Toutes priorités',
    colName: 'Nom',
    colType: 'Type',
    colStatus: 'Statut',
    colPriority: 'Priorité',
    colResponsible: 'Responsable',
    colAmount: 'Montant',
    colNextAction: 'Prochaine action',
    colRelance: 'Relance',
    colActions: 'Supprimer',
    typeClient: 'Client',
    typeProspect: 'Prospect',
    typeAncien: 'Ancien client',
    priorityHigh: 'Haute',
    priorityMedium: 'Moyenne',
    priorityLow: 'Basse',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    confirmDelete: 'Supprimer cette fiche ? Cette action supprimera aussi ses contacts, contrats, commentaires et tâches liés.',
    compteCreated: 'Fiche créée !',
    compteUpdated: 'Fiche mise à jour !',
    compteDeleted: 'Fiche supprimée.',
    compteMoved: 'Fiche déplacée.',
    notDefined: 'Non défini',
    overdue: 'en retard',
    noDate: 'Aucune date',
    tablesCreated: 'Tables créées automatiquement.',
    exportCsv: 'Export CSV',
    exportPdf: 'Export PDF',
    importCsv: 'Importer CSV',
    statistics: 'Statistiques',
    statsTitle: 'Statistiques',
    statsSubtitle: 'Vue d\u2019ensemble de votre activité commerciale',
    modalNewCompte: 'Nouvelle fiche',
    modalEditCompte: 'Modifier la fiche',
    fieldName: 'Nom *',
    fieldType: 'Type *',
    fieldStatus: 'Statut',
    fieldPriority: 'Priorité',
    fieldResponsible: 'Responsable',
    fieldAmount: 'Montant (€)',
    fieldContractsTotal: 'Total contrats actifs',
    fieldNextAction: 'Prochaine action',
    fieldNextActionDate: 'Date prochaine action',
    fieldRelanceDate: 'Date de relance',
    fieldCategory: 'Catégorie',
    fieldTag: 'Tag',
    fieldDescription: 'Notes générales',
    fieldWebsite: 'Site web',
    fieldAddressStreet: 'Adresse',
    fieldAddressZip: 'Code postal',
    fieldAddressCity: 'Ville',
    contactsTitle: 'Contacts',
    addContact: '+ Ajouter un contact',
    contractsTitle: 'Contrats',
    addContract: '+ Ajouter un contrat',
    commentsTitle: 'Historique / Commentaires',
    addComment: 'Ajouter une note',
    tasksTitle: 'Tâches & relances',
    addTask: '+ Ajouter une tâche',
    rgpdTitle: 'RGPD',
    rgpdConsent: 'Consentement contact obtenu',
    rgpdExport: 'Exporter les données du contact',
    rgpdDelete: 'Supprimer définitivement ce contact',
    rgpdNotice: 'Les données de contact (nom, email, téléphone) sont conservées pour la gestion de la relation commerciale. Conformément au RGPD, la personne concernée peut demander l\u2019accès, la rectification ou la suppression de ses données.',
    actionCall: 'Appeler',
    actionEmail: 'Envoyer un email',
    actionContract: 'Envoyer le contrat',
    actionRelance: 'Relancer',
    noContact: 'Aucun contact enregistré sur cette fiche. Ajoutez un contact dans l\u2019onglet Contacts.',
    noPhone: 'Ce contact n\u2019a pas de numéro de téléphone renseigné.',
    noEmail: 'Ce contact n\u2019a pas d\u2019adresse email renseignée.',
    chooseContact: 'Choisir un contact',
    actionLogged: 'Action enregistrée dans l\u2019historique.',
    settingsTitle: 'Paramètres',
    settingsSubtitle: 'Personnalisez les colonnes du pipeline et le mapping des tables',
    kanbanColumnsConfig: 'Colonnes du pipeline (Kanban)',
    mappingConfig: 'Mapping des tables Grist',
  }
};

function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || key;
}

// =============================================================================
// STATE
// =============================================================================

var comptes = [];
var contacts = [];
var contracts = [];
var equipe = [];
var crmComments = [];
var crmTasks = [];
var categories = [];
var tags = [];
var activityLog = [];

var currentFilterType = null;       // null | 'client' | 'prospect' | 'ancien'
var currentFilterPriority = null;
var currentFilterCategory = null;
var currentFilterTag = null;
var kanbanSearch = '';
var kanbanShowAll = false;

var isOwner = false;
var isEditor = false;
var currentUserEmail = '';

// =============================================================================
// TABLE NAMES (defaults — overridable via mapping, see CRM_Config)
// =============================================================================

var COMPTES_TABLE = 'CRM_Comptes';
var CONTACTS_TABLE = 'CRM_Contacts';
var CONTRATS_TABLE = 'CRM_Contrats';
var COMMENTAIRES_TABLE = 'CRM_Commentaires';
var TACHES_TABLE = 'CRM_Taches';
var EQUIPE_TABLE = 'CRM_Equipe';
var CATEGORIES_TABLE = 'CRM_Categories';
var TAGS_TABLE = 'CRM_Tags';
var CONFIG_TABLE = 'CRM_Configuration';
var PARAMETRES_TABLE = 'CRM_Parametres';
var JOURNAL_TABLE = 'CRM_JournalActivite';

var DEFAULT_COMPTES_TABLE = 'CRM_Comptes';
var DEFAULT_CONTACTS_TABLE = 'CRM_Contacts';
var DEFAULT_CONTRATS_TABLE = 'CRM_Contrats';
var DEFAULT_EQUIPE_TABLE = 'CRM_Equipe';

// =============================================================================
// COLUMN MAPPING (cf. GUIDE_MAPPING.md)
// =============================================================================

var columnMapping = {
  comptes: {
    name: 'Nom',
    type: 'Type',
    status: 'Statut',
    priority: 'Priorite',
    responsible: 'Responsable',
    amount: 'Montant',
    contractsTotal: 'Total_Contrats',
    nextAction: 'Prochaine_Action',
    nextActionDate: 'Date_Prochaine_Action',
    relanceDate: 'Date_Relance',
    category: 'Categorie',
    tag: 'Tag',
    description: 'Description',
    createdAt: 'Cree_Le',
    website: 'Site_Web',
    addressStreet: 'Adresse_Rue',
    addressZip: 'Adresse_Code_Postal',
    addressCity: 'Adresse_Ville'
  },
  contacts: {
    name: 'Nom',
    email: 'Email',
    phone: 'Telephone',
    role: 'Fonction',
    isPrimary: 'Principal',
    consent: 'RGPD_Consentement',
    consentDate: 'RGPD_Date_Consentement'
  },
  contrats: {
    label: 'Intitule',
    amount: 'Montant',
    status: 'Statut',
    startDate: 'Date_Debut',
    endDate: 'Date_Fin'
  },
  equipe: {
    name: 'Nom',
    email: 'Email',
    role: 'Role'
  }
};

// =============================================================================
// KANBAN STATUSES (personnalisables — comme le widget PM)
// =============================================================================

// =============================================================================
// ACCOUNT TYPES (personnalisables — client / prospect / ancien + custom)
// =============================================================================

var defaultAccountTypes = [
  { key: 'client',   label: 'Client',        color: '#42B6C8' },
  { key: 'prospect', label: 'Prospect',      color: '#B9FFB7' },
  { key: 'ancien',   label: 'Ancien client', color: '#EEFFEE' }
];
var customAccountTypes = null;

function getAccountTypes() {
  return customAccountTypes || defaultAccountTypes;
}
function getAccountTypeLabel(key) {
  var found = getAccountTypes().find(function(t) { return t.key === key; });
  return found ? found.label : key;
}
async function saveAccountTypes() {
  await saveSetting('account_types', JSON.stringify(customAccountTypes));
}

// draft pour l'éditeur dans Paramètres
var draftAccountTypes = null;

function renderAccountTypeList() {
  var list = draftAccountTypes || getAccountTypes();
  var html = '';
  if (!list.length) html += '<div class="empty-state">Aucun type</div>';
  list.forEach(function(type, idx) {
    var color = type.color || '#CCCCCC';
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="color" value="' + color + '" title="Couleur du badge" onchange="updateAccountTypeDraftColor(' + idx + ', this.value)">';
    html += '<input type="text" value="' + sanitize(type.label) + '" oninput="updateAccountTypeDraftLabel(' + idx + ', this.value)">';
    html += '<button class="btn-icon" title="Supprimer" onclick="removeAccountTypeDraft(' + idx + ')">🗑️</button>';
    html += '</div>';
  });
  html += '<div class="kanban-status-edit-row">';
  html += '<input type="text" id="new-account-type-name" placeholder="' + (currentLang === 'fr' ? 'Nom du nouveau type' : 'New type name') + '" style="flex:1;">';
  html += '</div>';
  return html;
}

function applyAccountTypeStyles() {
  var existing = document.getElementById('account-type-dynamic-styles');
  if (!existing) {
    existing = document.createElement('style');
    existing.id = 'account-type-dynamic-styles';
    document.head.appendChild(existing);
  }
  var types = getAccountTypes();
  var css = types.map(function(t) {
    var color = t.color || '#CCCCCC';
    // texte blanc si couleur foncée, sinon primaire
    var r = parseInt(color.slice(1,3),16), g = parseInt(color.slice(3,5),16), b = parseInt(color.slice(5,7),16);
    var lum = (0.299*r + 0.587*g + 0.114*b) / 255;
    var textColor = lum < 0.55 ? 'white' : 'var(--color-primary)';
    return '.type-' + t.key + ' { background: ' + color + ' !important; color: ' + textColor + ' !important; }';
  }).join('\n');
  existing.textContent = css;
}

function updateAccountTypeDraftLabel(idx, val) {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  draftAccountTypes[idx].label = val;
}

function updateAccountTypeDraftColor(idx, val) {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  draftAccountTypes[idx].color = val;
}

function slugifyTypeKey(label) {
  return (label || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'type';
}

function addAccountTypeDraft() {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  var label = getVal('new-account-type-name', '').trim();
  if (!label) {
    showToast(currentLang === 'fr' ? 'Indiquez un nom de type avant d’ajouter' : 'Enter a type name before adding', 'error');
    return;
  }
  var slug = slugifyTypeKey(label);
  var existingKeys = draftAccountTypes.map(function(t) { return t.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  draftAccountTypes.push({ key: finalKey, label: label, color: '#CCCCCC' });
  commitAccountTypes();
}

function removeAccountTypeDraft(idx) {
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  draftAccountTypes.splice(idx, 1);
  document.getElementById('account-type-list').innerHTML = renderAccountTypeList();
}

async function commitAccountTypes() {
  if (!draftAccountTypes) return;
  var previousTypes = customAccountTypes;
  var newTypes = draftAccountTypes;
  customAccountTypes = newTypes;
  draftAccountTypes = null;
  try {
    await saveAccountTypes();
  } catch (e) {
    customAccountTypes = previousTypes;
    console.error('[CRM] Échec sauvegarde types de comptes :', e);
    showToast((currentLang === 'fr' ? 'Échec de l’enregistrement : ' : 'Save failed: ') + e.message, 'error', 8000);
    return;
  }
  applyAccountTypeStyles();
  refreshTypeSelects();
  var listEl = document.getElementById('account-type-list');
  if (listEl) listEl.innerHTML = renderAccountTypeList();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'type'), newTypes);
  showToast(currentLang === 'fr' ? 'Types de comptes enregistrés' : 'Account types saved', 'success');
}

function refreshTypeSelects() {
  var types = getAccountTypes();
  // Kanban toolbar
  var kanbanSel = document.getElementById('kanban-type-select');
  if (kanbanSel) {
    var cur = kanbanSel.value;
    kanbanSel.innerHTML = '<option value="">' + t('allTypes') + '</option>' +
      types.map(function(tp) { return '<option value="' + tp.key + '"' + (cur === tp.key ? ' selected' : '') + '>' + sanitize(tp.label) + '</option>'; }).join('');
  }
  // Table filter
  var tableSel = document.getElementById('table-filter-type');
  if (tableSel) {
    var cur2 = tableSel.value;
    tableSel.innerHTML = '<option value="">' + t('allTypes') + '</option>' +
      types.map(function(tp) { return '<option value="' + tp.key + '"' + (cur2 === tp.key ? ' selected' : '') + '>' + sanitize(tp.label) + '</option>'; }).join('');
  }
}

// =============================================================================

// PROCHAINE ACTION (personnalisable par type — prospect / client) — chaque action a un
// délai de relance (en jours) utilisé pour calculer automatiquement la date de relance.
var defaultNextActionsProspect = [
  { key: 'premier_appel',    label: 'Premier appel',       reminderDays: 3 },
  { key: 'envoi_devis',      label: 'Envoi devis',         reminderDays: 5 },
  { key: 'relance_devis',    label: 'Relance devis',       reminderDays: 3 },
  { key: 'rdv_decouverte',   label: 'RDV découverte',      reminderDays: 2 },
  { key: 'envoi_contrat',    label: 'Envoi contrat',       reminderDays: 3 }
];
var defaultNextActionsClient = [
  { key: 'renouvellement_contrat', label: 'Renouvellement contrat',         reminderDays: 7 },
  { key: 'point_suivi',            label: 'Point de suivi',                 reminderDays: 5 },
  { key: 'facture_a_envoyer',      label: 'Facture à envoyer',              reminderDays: 3 },
  { key: 'upsell',                 label: 'Proposition complémentaire',     reminderDays: 5 }
];
var customNextActionsProspect = null;
var customNextActionsClient = null;

function getNextActions(compteType) {
  if (compteType === 'client' || compteType === 'ancien') return customNextActionsClient || defaultNextActionsClient;
  return customNextActionsProspect || defaultNextActionsProspect;
}
function getNextActionLabel(compteType, key) {
  if (!key) return '';
  var all = (customNextActionsProspect || defaultNextActionsProspect).concat(customNextActionsClient || defaultNextActionsClient);
  var found = all.find(function(a) { return a.key === key; });
  return found ? found.label : key;
}
function getNextActionReminderDays(compteType, key) {
  var found = getNextActions(compteType).find(function(a) { return a.key === key; });
  return found ? found.reminderDays : null;
}
async function saveNextActionsProspect() {
  await saveSetting('next_actions_prospect', JSON.stringify(customNextActionsProspect));
}
async function saveNextActionsClient() {
  await saveSetting('next_actions_client', JSON.stringify(customNextActionsClient));
}

var draftNextActionsProspect = null;
var draftNextActionsClient = null;

function renderNextActionsList(kind) {
  var isClient = kind === 'client';
  var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
  var list = draftVar || getNextActions(isClient ? 'client' : 'prospect');
  var html = '';
  if (!list.length) html += '<div class="empty-state">Aucune action</div>';
  list.forEach(function(a, idx) {
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="text" value="' + sanitize(a.label) + '" oninput="updateNextActionDraftLabel(\'' + kind + '\', ' + idx + ', this.value)">';
    html += '<input type="number" min="0" value="' + (a.reminderDays != null ? a.reminderDays : 3) + '" title="' + (currentLang === 'fr' ? 'Relancer après (jours)' : 'Follow up after (days)') + '" style="width:60px;" onchange="updateNextActionDraftDays(\'' + kind + '\', ' + idx + ', this.value)">';
    html += '<span class="settings-hint" style="white-space:nowrap;">' + (currentLang === 'fr' ? 'j.' : 'd.') + '</span>';
    html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Supprimer' : 'Delete') + '" onclick="removeNextActionDraft(\'' + kind + '\', ' + idx + ')">🗑️</button>';
    html += '</div>';
  });
  html += '<div class="kanban-status-edit-row">';
  html += '<input type="text" id="new-next-action-' + kind + '" placeholder="' + (currentLang === 'fr' ? 'Nom de la nouvelle action' : 'New action name') + '" style="flex:1;">';
  html += '</div>';
  return html;
}

function updateNextActionDraftLabel(kind, idx, val) {
  var isClient = kind === 'client';
  if (isClient) { if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions('client'))); draftNextActionsClient[idx].label = val; }
  else { if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions('prospect'))); draftNextActionsProspect[idx].label = val; }
}

function updateNextActionDraftDays(kind, idx, val) {
  var days = parseInt(val, 10) || 0;
  var isClient = kind === 'client';
  if (isClient) { if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions('client'))); draftNextActionsClient[idx].reminderDays = days; }
  else { if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions('prospect'))); draftNextActionsProspect[idx].reminderDays = days; }
}

function addNextActionDraft(kind) {
  var isClient = kind === 'client';
  var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
  if (!draftVar) { draftVar = JSON.parse(JSON.stringify(getNextActions(isClient ? 'client' : 'prospect'))); if (isClient) draftNextActionsClient = draftVar; else draftNextActionsProspect = draftVar; }
  var label = getVal('new-next-action-' + kind, '').trim();
  if (!label) {
    showToast(currentLang === 'fr' ? 'Indiquez un nom d’action avant d’ajouter' : 'Enter an action name before adding', 'error');
    return;
  }
  var slug = slugifyTypeKey(label);
  var existingKeys = draftVar.map(function(a) { return a.key; });
  var finalKey = slug, n = 2;
  while (existingKeys.indexOf(finalKey) !== -1) { finalKey = slug + '_' + n; n++; }
  draftVar.push({ key: finalKey, label: label, reminderDays: 3 });
  commitNextActions(kind);
}

function removeNextActionDraft(kind, idx) {
  var isClient = kind === 'client';
  if (isClient) { if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions('client'))); draftNextActionsClient.splice(idx, 1); }
  else { if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions('prospect'))); draftNextActionsProspect.splice(idx, 1); }
  commitNextActions(kind);
}

async function commitNextActions(kind) {
  var isClient = kind === 'client';
  var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
  if (!draftVar) return;
  try {
    if (isClient) { customNextActionsClient = draftVar; draftNextActionsClient = null; await saveNextActionsClient(); }
    else { customNextActionsProspect = draftVar; draftNextActionsProspect = null; await saveNextActionsProspect(); }
  } catch (e) {
    console.error('[CRM] Échec sauvegarde actions :', e);
    showToast((currentLang === 'fr' ? 'Échec de l’enregistrement : ' : 'Save failed: ') + e.message, 'error', 8000);
    return;
  }
  var listEl = document.getElementById('next-actions-list-' + kind);
  if (listEl) listEl.innerHTML = renderNextActionsList(kind);
  showToast(currentLang === 'fr' ? 'Actions enregistrées' : 'Actions saved', 'success');
}

var defaultKanbanStatuses = [
  { key: 'nouveau',         label: 'Nouveau',         color: '#a855f7' },
  { key: 'premier_contact', label: 'Premier contact', color: '#3b82f6' },
  { key: 'negociation',     label: 'En négociation',  color: '#f59e0b' },
  { key: 'signature',       label: 'En signature',    color: '#8b5cf6' },
  { key: 'signe',           label: 'Contrat signé',   color: '#22c55e', marksAsClient: true },
  { key: 'perdu',           label: 'Perdu',           color: '#94a3b8', stopFollowUp: true }
];
var customKanbanStatuses = null;
function getKanbanStatuses() {
  return customKanbanStatuses || defaultKanbanStatuses;
}
async function saveKanbanStatuses() {
  await saveSetting('kanban_statuses', JSON.stringify(customKanbanStatuses));
}
function getStatusLabel(key) {
  var statuses = getKanbanStatuses();
  var found = statuses.find(function(s) { return s.key === key; });
  return found ? found.label : key;
}
function getStatusColor(key) {
  var statuses = getKanbanStatuses();
  var found = statuses.find(function(s) { return s.key === key; });
  return found ? found.color : '#94a3b8';
}

// =============================================================================
// EQUIPE ROLES (single-select avec création de rôles à la volée)
// =============================================================================

var defaultEquipeRoles = ['Commercial', 'Manager', 'Support', 'Direction'];
var customEquipeRoles = null;
function getEquipeRoles() {
  return customEquipeRoles || defaultEquipeRoles;
}
async function saveEquipeRoles() {
  await saveSetting('equipe_roles', JSON.stringify(customEquipeRoles));
}
async function addEquipeRole(roleName) {
  var roles = getEquipeRoles().slice();
  if (roles.indexOf(roleName) === -1) {
    roles.push(roleName);
    customEquipeRoles = roles;
    await saveEquipeRoles();
  }
}

// =============================================================================
// EMAIL TEMPLATES (relance, contrat, générique — personnalisables dans Paramètres)
// =============================================================================
// Variables disponibles dans les modèles : {contact}, {compte}, {responsable}, {montant}

var defaultEmailTemplates = {
  relance: {
    subject: 'Suivi de notre échange — {compte}',
    body: 'Bonjour {contact},\n\nJe me permets de revenir vers vous au sujet de {compte}.\nN\u2019hésitez pas à me faire savoir si vous avez des questions.\n\nBien cordialement,\n{responsable}'
  },
  contrat: {
    subject: 'Votre contrat — {compte}',
    body: 'Bonjour {contact},\n\nVeuillez trouver ci-joint le contrat pour {compte}.\nJe reste disponible pour toute question.\n\nBien cordialement,\n{responsable}'
  },
  generique: {
    subject: '{compte}',
    body: 'Bonjour {contact},\n\n\n\nBien cordialement,\n{responsable}'
  },
  prospection: {
    subject: 'Présentation — {compte}',
    body: 'Bonjour {contact},\n\nJe me permets de vous présenter notre offre, qui pourrait intéresser {compte}.\nN’hésitez pas à me faire savoir si vous souhaitez échanger.\n\nBien cordialement,\n{responsable}'
  }
};

var customEmailTemplates = null;
function getEmailTemplates() {
  return customEmailTemplates || defaultEmailTemplates;
}
async function saveEmailTemplates() {
  await saveSetting('email_templates', JSON.stringify(customEmailTemplates));
}

function fillTemplate(str, vars) {
  return (str || '').replace(/\{(\w+)\}/g, function(match, key) {
    return vars.hasOwnProperty(key) ? (vars[key] || '') : match;
  });
}

function getWebhookUrl() {
  return (_settingsCache.webhook_url && _settingsCache.webhook_url.value) || '';
}
async function saveWebhookUrl(url) {
  await saveSetting('webhook_url', url);
}

function getKanbanHideClientDays() {
  var v = _settingsCache.kanban_hide_client_days && _settingsCache.kanban_hide_client_days.value;
  var n = parseInt(v, 10);
  return isNaN(n) ? 7 : n;
}
async function saveKanbanHideClientDays(days) {
  await saveSetting('kanban_hide_client_days', String(days));
}
async function commitKanbanHideClientDays() {
  var days = parseInt(getVal('kanban-hide-client-days-input', '7'), 10);
  if (isNaN(days) || days < 0) days = 7;
  await saveKanbanHideClientDays(days);
  showToast(currentLang === 'fr' ? 'Délai enregistré' : 'Delay saved', 'success');
  renderKanbanView();
}

// =============================================================================
// SETTINGS HELPERS (CRM_Settings — table clé/valeur)
// =============================================================================

var _settingsCache = {};

async function loadSettings() {
  try {
    var data = await grist.docApi.fetchTable(PARAMETRES_TABLE);
    _settingsCache = {};
    if (data && data.id) {
      for (var i = 0; i < data.id.length; i++) {
        _settingsCache[data.Cle[i]] = { id: data.id[i], value: data.Valeur[i] };
      }
    }
    if (_settingsCache.kanban_statuses) {
      try { customKanbanStatuses = JSON.parse(_settingsCache.kanban_statuses.value); } catch (e) {}
    }
    // Migration : les pipelines déjà personnalisés avant l'ajout des étapes "Contrat signé"
    // (conversion auto en client) et "Perdu" (arrêt des relances) n'ont pas ces marqueurs —
    // on les complète une fois, sans écraser les personnalisations existantes.
    if (customKanbanStatuses) {
      var hasMarksAsClient = customKanbanStatuses.some(function(s) { return s.marksAsClient; });
      var hasStopFollowUp = customKanbanStatuses.some(function(s) { return s.stopFollowUp; });
      var kanbanMigrated = false;
      if (!hasMarksAsClient) {
        var signeStage = customKanbanStatuses.find(function(s) { return s.key === 'signe'; });
        if (signeStage) { signeStage.marksAsClient = true; kanbanMigrated = true; }
      }
      if (!hasStopFollowUp) {
        customKanbanStatuses.push({ key: 'perdu', label: currentLang === 'fr' ? 'Perdu' : 'Lost', color: '#94a3b8', stopFollowUp: true });
        kanbanMigrated = true;
      }
      var hasNouveau = customKanbanStatuses.some(function(s) { return s.key === 'nouveau'; });
      if (!hasNouveau) {
        customKanbanStatuses.unshift({ key: 'nouveau', label: currentLang === 'fr' ? 'Nouveau' : 'New', color: '#a855f7' });
        kanbanMigrated = true;
      }
      if (kanbanMigrated) { saveSetting('kanban_statuses', JSON.stringify(customKanbanStatuses)); }
    }
    if (_settingsCache.account_types) {
      try { customAccountTypes = JSON.parse(_settingsCache.account_types.value); } catch (e) {}
    }
    if (_settingsCache.next_actions_prospect) {
      try { customNextActionsProspect = JSON.parse(_settingsCache.next_actions_prospect.value); } catch (e) {}
    }
    if (_settingsCache.next_actions_client) {
      try { customNextActionsClient = JSON.parse(_settingsCache.next_actions_client.value); } catch (e) {}
    }
    applyAccountTypeStyles();
    // Re-synchronise les listes de choix Grist (Type, Statut) avec les valeurs personnalisées
    // enregistrées, au cas où l'ajout précédent n'aurait pas mis à jour la colonne native.
    syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'type'), getAccountTypes());
    syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'status'), getKanbanStatuses());
    if (_settingsCache.equipe_roles) {
      try { customEquipeRoles = JSON.parse(_settingsCache.equipe_roles.value); } catch (e) {}
    }
    if (_settingsCache.email_templates) {
      try { customEmailTemplates = JSON.parse(_settingsCache.email_templates.value); } catch (e) {}
    }
  } catch (e) {
    console.log('[CRM] CRM_Parametres not available yet');
  }
}

async function saveSetting(key, value) {
  try {
    if (_settingsCache[key]) {
      await grist.docApi.applyUserActions([['UpdateRecord', PARAMETRES_TABLE, _settingsCache[key].id, { Valeur: value }]]);
      _settingsCache[key].value = value;
    } else {
      var result = await grist.docApi.applyUserActions([['AddRecord', PARAMETRES_TABLE, null, { Cle: key, Valeur: value }]]);
      var newId = (result && result.retValues && result.retValues[0]) || result;
      _settingsCache[key] = { id: newId, value: value };
    }
  } catch (e) {
    console.error('[CRM] Error saving setting:', e);
    throw e;
  }
}

// =============================================================================
// UTILS
// =============================================================================

function isInsideGrist() {
  try { return window.frameElement !== null || window !== window.parent; }
  catch (e) { return true; }
}

function showToast(msg, type, duration) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'info');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, duration || 3000);
}

function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toEpoch(dateStr) {
  if (!dateStr) return null;
  var d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return Math.floor(d.getTime() / 1000);
}

function formatDate(epoch) {
  if (!epoch) return '';
  var d = new Date(epoch * 1000);
  return d.toLocaleDateString('fr-FR');
}

function epochToInputDate(epoch) {
  if (!epoch) return '';
  var d = new Date(epoch * 1000);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function formatAmount(n) {
  if (n === null || n === undefined || n === '') return '—';
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

function todayEpoch() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

function daysFromNow(epoch) {
  if (!epoch) return null;
  return Math.round((epoch - todayEpoch()) / 86400);
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  var s = String(val);
  if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// =============================================================================
// COLUMN MAPPING UTILITIES (cf. GUIDE_MAPPING.md)
// =============================================================================

async function loadColumnMapping() {
  try {
    var configData = await grist.docApi.fetchTable(CONFIG_TABLE);
    if (!configData || !configData.Cle_Config) return;

    var toCamel = function(s) { return s.replace(/_([a-z])/g, function(_, c) { return c.toUpperCase(); }); };

    for (var i = 0; i < configData.Cle_Config.length; i++) {
      var key = configData.Cle_Config[i];
      var columnName = configData.Nom_Colonne[i];

      if (key.indexOf('compte_') === 0) {
        var field = toCamel(key.slice(7));
        if (columnMapping.comptes[field] !== undefined) columnMapping.comptes[field] = columnName;
      } else if (key.indexOf('contact_') === 0) {
        var field2 = toCamel(key.slice(8));
        if (columnMapping.contacts[field2] !== undefined) columnMapping.contacts[field2] = columnName;
      } else if (key.indexOf('contract_') === 0) {
        var field3 = toCamel(key.slice(9));
        if (columnMapping.contrats[field3] !== undefined) columnMapping.contrats[field3] = columnName;
      } else if (key.indexOf('equipe_') === 0) {
        var field4 = toCamel(key.slice(7));
        if (columnMapping.equipe[field4] !== undefined) columnMapping.equipe[field4] = columnName;
      }
    }
  } catch (e) {
    console.log('[CRM] CRM_Configuration not available yet');
  }
}

function getColumnName(entity, field) {
  return (columnMapping[entity] && columnMapping[entity][field]) || field;
}

function setField(record, entity, field, value) {
  var col = getColumnName(entity, field);
  record[col] = value;
}

// =============================================================================
// INIT — CREATE TABLES IF NEEDED
// =============================================================================

// Synchronise la liste de choix (widgetOptions.choices) d'une colonne Grist de type Choice,
// pour que les valeurs personnalisées (types de comptes, étapes du pipeline) apparaissent
// dans le menu déroulant natif de Grist, et pas seulement comme texte libre.
async function syncChoiceColumnOptions(tableName, columnName, items) {
  try {
    var choices = items.map(function(it) { return it.key; });
    var choiceOptions = {};
    items.forEach(function(it) {
      choiceOptions[it.key] = { fillColor: it.color || '#CCCCCC', textColor: '#271A79' };
    });
    await grist.docApi.applyUserActions([
      ['ModifyColumn', tableName, columnName, { widgetOptions: JSON.stringify({ choices: choices, choiceOptions: choiceOptions }) }]
    ]);
  } catch (e) {
    console.error('[CRM] Échec synchronisation des choix pour ' + tableName + '.' + columnName + ' :', e.message);
  }
}

// Ajoute les colonnes Email_Status/Email_Sujet/Email_Corps/Email_Destinataire sur CRM_Comptes
// si elles n'existent pas encore (documents créés avant cette fonctionnalité).
// Retourne un résumé { added: [...], failed: [{field, error}], alreadyPresent: [...] } pour affichage.
async function migrateEmailQueueColumns() {
  var result = { added: [], failed: [], alreadyPresent: [] };
  var fields = ['Email_Status', 'Email_Sujet', 'Email_Corps', 'Email_Destinataire'];
  try {
    var compteColsEmail = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
    console.log('[CRM] Colonnes ' + COMPTES_TABLE + ' existantes :', compteColsEmail);
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (compteColsEmail.indexOf(field) !== -1) {
        result.alreadyPresent.push(field);
        continue;
      }
      try {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, field, { type: 'Text' }]]);
        console.log('[CRM] ' + field + ' ajouté à ' + COMPTES_TABLE);
        result.added.push(field);
      } catch (eField) {
        console.error('[CRM] Échec ajout ' + field + ' :', eField.message);
        result.failed.push({ field: field, error: eField.message });
      }
    }
  } catch (e) {
    console.error('[CRM] Migration file d’attente email ignorée (fetchTable a échoué) :', e.message);
    result.failed.push({ field: 'fetchTable', error: e.message });
  }
  return result;
}

async function retryEmailQueueMigration() {
  var result = await migrateEmailQueueColumns();
  if (result.failed.length > 0) {
    showToast(
      (currentLang === 'fr' ? 'Échec pour : ' : 'Failed for: ') + result.failed.map(function(f) { return f.field + ' (' + f.error + ')'; }).join(', '),
      'error', 8000
    );
  } else if (result.added.length > 0) {
    showToast(
      (currentLang === 'fr' ? 'Colonnes ajoutées : ' : 'Columns added: ') + result.added.join(', '),
      'success'
    );
    await loadAllData();
  } else {
    showToast(currentLang === 'fr' ? 'Toutes les colonnes existent déjà.' : 'All columns already exist.', 'info');
  }
}

async function ensureTables() {
  try {
    var existingTables = await grist.docApi.listTables();

    // Si CRM_Configuration existe déjà, charger le mapping AVANT de décider quoi créer
    // (sinon on risquerait de recréer une table par défaut alors qu'elle a été remappée)
    if (existingTables.indexOf(CONFIG_TABLE) !== -1) {
      await loadColumnMapping();
    }

    // --- CRM_Equipe (membres de l'équipe — pour Responsable et Assigné à) ---
    if (EQUIPE_TABLE === DEFAULT_EQUIPE_TABLE && existingTables.indexOf(EQUIPE_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', EQUIPE_TABLE, [
          { id: 'Nom', type: 'Text' },
          { id: 'Email', type: 'Text' },
          { id: 'Role', type: 'Choice', widgetOptions: JSON.stringify({ choices: [] }) }
        ]]
      ]);
    }

    // --- CRM_Comptes (table principale : clients / prospects / anciens clients) ---
    if (COMPTES_TABLE === DEFAULT_COMPTES_TABLE && existingTables.indexOf(COMPTES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', COMPTES_TABLE, [
          { id: 'Nom', type: 'Text' },
          { id: 'Type', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['client', 'prospect', 'ancien'], choiceOptions: {
            client: { fillColor: '#42B6C8', textColor: '#271A79' },
            prospect: { fillColor: '#B9FFB7', textColor: '#271A79' },
            ancien: { fillColor: '#EEFFEE', textColor: '#271A79' }
          } }) },
          { id: 'Statut', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['premier_contact', 'negociation', 'signature', 'signe'] }) },
          { id: 'Priorite', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['high', 'medium', 'low'] }) },
          { id: 'Responsable', type: 'Ref:' + EQUIPE_TABLE },
          { id: 'Montant', type: 'Numeric' },
          { id: 'Prochaine_Action', type: 'Text' },
          { id: 'Date_Prochaine_Action', type: 'Date' },
          { id: 'Date_Relance', type: 'Date' },
          { id: 'Categorie', type: 'Text' },
          { id: 'Tag', type: 'Text' },
          { id: 'Description', type: 'Text' },
          { id: 'Site_Web', type: 'Text' },
          { id: 'Adresse_Rue', type: 'Text' },
          { id: 'Adresse_Code_Postal', type: 'Text' },
          { id: 'Adresse_Ville', type: 'Text' },
          { id: 'Adresse_Lat', type: 'Numeric' },
          { id: 'Adresse_Lng', type: 'Numeric' },
          { id: 'Cree_Le', type: 'Date' },
          { id: 'Email_Status', type: 'Text' },
          { id: 'Email_Sujet', type: 'Text' },
          { id: 'Email_Corps', type: 'Text' },
          { id: 'Email_Destinataire', type: 'Text' },
          { id: 'Client_Depuis', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Contacts (1-N : interlocuteurs d'un compte) ---
    if (CONTACTS_TABLE === DEFAULT_CONTACTS_TABLE && existingTables.indexOf(CONTACTS_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', CONTACTS_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Nom', type: 'Text' },
          { id: 'Email', type: 'Text' },
          { id: 'Telephone', type: 'Text' },
          { id: 'Fonction', type: 'Text' },
          { id: 'Principal', type: 'Bool' },
          { id: 'RGPD_Consentement', type: 'Bool' },
          { id: 'RGPD_Date_Consentement', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Contrats (1-N : contrats liés à un compte, avec pièce jointe) ---
    if (CONTRATS_TABLE === DEFAULT_CONTRATS_TABLE && existingTables.indexOf(CONTRATS_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', CONTRATS_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Intitule', type: 'Text' },
          { id: 'Montant', type: 'Numeric' },
          { id: 'Statut', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['en_cours', 'signe', 'termine', 'annule'] }) },
          { id: 'Date_Debut', type: 'Date' },
          { id: 'Date_Fin', type: 'Date' },
          { id: 'Fichier_Nom', type: 'Text' },
          { id: 'Fichier_Type', type: 'Text' },
          { id: 'Fichier_Data', type: 'Text' }
        ]]
      ]);
    }

    // --- CRM_Commentaires (fil d'historique / notes horodatées par compte) ---
    if (existingTables.indexOf(COMMENTAIRES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', COMMENTAIRES_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Auteur', type: 'Text' },
          { id: 'Contenu', type: 'Text' },
          { id: 'Cree_Le', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Taches (tâches / relances liées à un compte — propre au CRM) ---
    if (existingTables.indexOf(TACHES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', TACHES_TABLE, [
          { id: 'Compte_Id', type: 'Ref:' + COMPTES_TABLE },
          { id: 'Titre', type: 'Text' },
          { id: 'Statut', type: 'Choice', widgetOptions: JSON.stringify({ choices: ['a_faire', 'fait'] }) },
          { id: 'Date_Echeance', type: 'Date' },
          { id: 'Assigne_A', type: 'Ref:' + EQUIPE_TABLE },
          { id: 'Cree_Le', type: 'Date' }
        ]]
      ]);
    }

    // --- CRM_Categories / CRM_Tags (filtres transverses, optionnels) ---
    if (existingTables.indexOf(CATEGORIES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', CATEGORIES_TABLE, [
          { id: 'Nom', type: 'Text' },
          { id: 'Couleur', type: 'Text' },
          { id: 'Ordre', type: 'Int' }
        ]]
      ]);
    }

    if (existingTables.indexOf(TAGS_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', TAGS_TABLE, [
          { id: 'Nom', type: 'Text' },
          { id: 'Couleur', type: 'Text' }
        ]]
      ]);
    }

    // --- CRM_Configuration (mapping des colonnes — cf. GUIDE_MAPPING.md) ---
    if (existingTables.indexOf(CONFIG_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', CONFIG_TABLE, [
          { id: 'Cle_Config', type: 'Text' },
          { id: 'Nom_Table', type: 'Text' },
          { id: 'Nom_Colonne', type: 'Text' },
          { id: 'Libelle_Affiche', type: 'Text' },
          { id: 'Obligatoire', type: 'Bool' },
          { id: 'Valeur_Defaut', type: 'Text' }
        ]]
      ]);

      var defaultConfig = [
        ['compte_name', COMPTES_TABLE, 'Nom', 'Nom', true, 'Nom'],
        ['compte_type', COMPTES_TABLE, 'Type', 'Type', true, 'Type'],
        ['compte_status', COMPTES_TABLE, 'Statut', 'Statut', false, 'Statut'],
        ['compte_priority', COMPTES_TABLE, 'Priorite', 'Priorité', false, 'Priorite'],
        ['compte_responsible', COMPTES_TABLE, 'Responsable', 'Responsable', false, 'Responsable'],
        ['compte_amount', COMPTES_TABLE, 'Montant', 'Montant', false, 'Montant'],
        ['compte_contracts_total', COMPTES_TABLE, 'Total_Contrats', 'Total contrats', false, 'Total_Contrats'],
        ['compte_next_action', COMPTES_TABLE, 'Prochaine_Action', 'Prochaine action', false, 'Prochaine_Action'],
        ['compte_next_action_date', COMPTES_TABLE, 'Date_Prochaine_Action', 'Date prochaine action', false, 'Date_Prochaine_Action'],
        ['compte_relance_date', COMPTES_TABLE, 'Date_Relance', 'Date de relance', false, 'Date_Relance'],
        ['compte_category', COMPTES_TABLE, 'Categorie', 'Catégorie', false, 'Categorie'],
        ['compte_tag', COMPTES_TABLE, 'Tag', 'Tag', false, 'Tag'],
        ['compte_description', COMPTES_TABLE, 'Description', 'Notes', false, 'Description'],
        ['compte_created_at', COMPTES_TABLE, 'Cree_Le', 'Créé le', false, 'Cree_Le'],
        ['compte_website', COMPTES_TABLE, 'Site_Web', 'Site web', false, 'Site_Web'],
        ['compte_address_street', COMPTES_TABLE, 'Adresse_Rue', 'Adresse', false, 'Adresse_Rue'],
        ['compte_address_zip', COMPTES_TABLE, 'Adresse_Code_Postal', 'Code postal', false, 'Adresse_Code_Postal'],
        ['compte_address_city', COMPTES_TABLE, 'Adresse_Ville', 'Ville', false, 'Adresse_Ville'],
        ['contact_name', CONTACTS_TABLE, 'Nom', 'Nom', true, 'Nom'],
        ['contact_email', CONTACTS_TABLE, 'Email', 'Email', false, 'Email'],
        ['contact_phone', CONTACTS_TABLE, 'Telephone', 'Téléphone', false, 'Telephone'],
        ['contact_role', CONTACTS_TABLE, 'Fonction', 'Fonction', false, 'Fonction'],
        ['contact_is_primary', CONTACTS_TABLE, 'Principal', 'Contact principal', false, 'Principal'],
        ['contact_consent', CONTACTS_TABLE, 'RGPD_Consentement', 'Consentement RGPD', false, 'RGPD_Consentement'],
        ['contact_consent_date', CONTACTS_TABLE, 'RGPD_Date_Consentement', 'Date consentement', false, 'RGPD_Date_Consentement'],
        ['contract_label', CONTRATS_TABLE, 'Intitule', 'Intitulé', true, 'Intitule'],
        ['contract_amount', CONTRATS_TABLE, 'Montant', 'Montant', false, 'Montant'],
        ['contract_status', CONTRATS_TABLE, 'Statut', 'Statut', false, 'Statut'],
        ['contract_start_date', CONTRATS_TABLE, 'Date_Debut', 'Date début', false, 'Date_Debut'],
        ['contract_end_date', CONTRATS_TABLE, 'Date_Fin', 'Date fin', false, 'Date_Fin'],
        ['equipe_name', EQUIPE_TABLE, 'Nom', 'Nom', true, 'Nom'],
        ['equipe_email', EQUIPE_TABLE, 'Email', 'Email', false, 'Email'],
        ['equipe_role', EQUIPE_TABLE, 'Role', 'Rôle', false, 'Role']
      ];

      var configRecords = defaultConfig.map(function(c) {
        return { Cle_Config: c[0], Nom_Table: c[1], Nom_Colonne: c[2], Libelle_Affiche: c[3], Obligatoire: c[4], Valeur_Defaut: c[5] };
      });

      await grist.docApi.applyUserActions([
        ['BulkAddRecord', CONFIG_TABLE, configRecords.map(function() { return null; }), configRecords]
      ]);
    }

    // --- CRM_Parametres (préférences widget : statuts Kanban personnalisés, etc.) ---
    if (existingTables.indexOf(PARAMETRES_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', PARAMETRES_TABLE, [
          { id: 'Cle', type: 'Text' },
          { id: 'Valeur', type: 'Text' }
        ]]
      ]);
    }

    // --- CRM_JournalActivite (traçabilité — utile aussi pour le RGPD) ---
    if (existingTables.indexOf(JOURNAL_TABLE) === -1) {
      await grist.docApi.applyUserActions([
        ['AddTable', JOURNAL_TABLE, [
          { id: 'Horodatage', type: 'Date' },
          { id: 'Email_Utilisateur', type: 'Text' },
          { id: 'Action', type: 'Text' },
          { id: 'Compte_Id', type: 'Int' },
          { id: 'Nom_Compte', type: 'Text' },
          { id: 'Details', type: 'Text' }
        ]]
      ]);
    }

    // Migration : ajouter la colonne calculée Total_Contrats sur CRM_Comptes
    // (créée après coup car la formule référence CRM_Contrats, qui doit déjà exister)
    try {
      var compteCols = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      if (compteCols.indexOf('Total_Contrats') === -1) {
        await grist.docApi.applyUserActions([
          ['AddColumn', COMPTES_TABLE, 'Total_Contrats', {
            type: 'Numeric',
            isFormula: true,
            formula: 'sum([c.Montant for c in ' + CONTRATS_TABLE + '.lookupRecords(Compte_Id=$id) if c.Statut == "signe"])'
          }]
        ]);
        console.log('[CRM] Total_Contrats ajouté à ' + COMPTES_TABLE);
      }
    } catch (e) {
      console.log('[CRM] Migration Total_Contrats ignorée :', e.message);
    }

    // Migration : ajouter Site_Web et les champs d'adresse sur CRM_Comptes
    // (pour les documents créés avant l'introduction de ces champs)
    try {
      var compteColsAddr = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      var addressFields = [
        ['Site_Web', 'Text'],
        ['Adresse_Rue', 'Text'],
        ['Adresse_Code_Postal', 'Text'],
        ['Adresse_Ville', 'Text']
      ];
      for (var af = 0; af < addressFields.length; af++) {
        var fieldName = addressFields[af][0];
        var fieldType = addressFields[af][1];
        if (compteColsAddr.indexOf(fieldName) === -1) {
          await grist.docApi.applyUserActions([
            ['AddColumn', COMPTES_TABLE, fieldName, { type: fieldType }]
          ]);
          console.log('[CRM] ' + fieldName + ' ajouté à ' + COMPTES_TABLE);
        }
      }
    } catch (e) {
      console.log('[CRM] Migration Site_Web/Adresse ignorée :', e.message);
    }

    await migrateEmailQueueColumns();

    try {
      var compteColsClient = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      if (compteColsClient.indexOf('Client_Depuis') === -1) {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, 'Client_Depuis', { type: 'Date' }]]);
        console.log('[CRM] Client_Depuis ajouté à ' + COMPTES_TABLE);
      }
    } catch (e) {
      console.error('[CRM] Migration Client_Depuis ignorée :', e.message);
    }

    try {
      var compteColsGeo = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
      if (compteColsGeo.indexOf('Adresse_Lat') === -1) {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, 'Adresse_Lat', { type: 'Numeric' }]]);
      }
      if (compteColsGeo.indexOf('Adresse_Lng') === -1) {
        await grist.docApi.applyUserActions([['AddColumn', COMPTES_TABLE, 'Adresse_Lng', { type: 'Numeric' }]]);
      }
    } catch (e) {
      console.error('[CRM] Migration Adresse_Lat/Lng ignorée :', e.message);
    }

    showToast(t('tablesCreated'), 'success');
  } catch (e) {
    console.error('[CRM] Error ensuring tables:', e);
  }
}

// =============================================================================
// LOAD DATA
// =============================================================================

async function loadAllData() {
  await loadColumnMapping();

  // --- CRM_Equipe ---
  try {
    var equipeData = await grist.docApi.fetchTable(EQUIPE_TABLE);
    equipe = [];
    if (equipeData && equipeData.id) {
      var eNameCol = getColumnName('equipe', 'name');
      var eEmailCol = getColumnName('equipe', 'email');
      var eRoleCol = getColumnName('equipe', 'role');
      for (var z = 0; z < equipeData.id.length; z++) {
        equipe.push({
          id: equipeData.id[z],
          Nom: equipeData[eNameCol] ? equipeData[eNameCol][z] : '',
          Email: equipeData[eEmailCol] ? equipeData[eEmailCol][z] : '',
          Role: equipeData[eRoleCol] ? equipeData[eRoleCol][z] : ''
        });
      }
    }
  } catch (e) {
    equipe = [];
  }

  // --- CRM_Comptes ---
  try {
    var compteData = await grist.docApi.fetchTable(COMPTES_TABLE);
    comptes = [];
    if (compteData && compteData.id) {
      var nameCol = getColumnName('comptes', 'name');
      var typeCol = getColumnName('comptes', 'type');
      var statusCol = getColumnName('comptes', 'status');
      var priorityCol = getColumnName('comptes', 'priority');
      var responsibleCol = getColumnName('comptes', 'responsible');
      var amountCol = getColumnName('comptes', 'amount');
      var contractsTotalCol = getColumnName('comptes', 'contractsTotal');
      var nextActionCol = getColumnName('comptes', 'nextAction');
      var nextActionDateCol = getColumnName('comptes', 'nextActionDate');
      var relanceDateCol = getColumnName('comptes', 'relanceDate');
      var categoryCol = getColumnName('comptes', 'category');
      var tagCol = getColumnName('comptes', 'tag');
      var descCol = getColumnName('comptes', 'description');
      var createdAtCol = getColumnName('comptes', 'createdAt');
      var websiteCol = getColumnName('comptes', 'website');
      var addressStreetCol = getColumnName('comptes', 'addressStreet');
      var addressZipCol = getColumnName('comptes', 'addressZip');
      var addressCityCol = getColumnName('comptes', 'addressCity');

      for (var i = 0; i < compteData.id.length; i++) {
        comptes.push({
          id: compteData.id[i],
          Name: compteData[nameCol] ? compteData[nameCol][i] : '',
          Type: compteData[typeCol] ? compteData[typeCol][i] : 'prospect',
          Status: compteData[statusCol] ? compteData[statusCol][i] : 'premier_contact',
          Priority: compteData[priorityCol] ? compteData[priorityCol][i] : 'medium',
          Responsible: compteData[responsibleCol] ? compteData[responsibleCol][i] : 0,
          Amount: compteData[amountCol] ? compteData[amountCol][i] : 0,
          Contracts_Total: compteData[contractsTotalCol] ? compteData[contractsTotalCol][i] : 0,
          Next_Action: compteData[nextActionCol] ? compteData[nextActionCol][i] : '',
          Next_Action_Date: compteData[nextActionDateCol] ? compteData[nextActionDateCol][i] : null,
          Relance_Date: compteData[relanceDateCol] ? compteData[relanceDateCol][i] : null,
          Category: compteData[categoryCol] ? compteData[categoryCol][i] : '',
          Tag: compteData[tagCol] ? compteData[tagCol][i] : '',
          Description: compteData[descCol] ? compteData[descCol][i] : '',
          Created_At: compteData[createdAtCol] ? compteData[createdAtCol][i] : null,
          Website: compteData[websiteCol] ? compteData[websiteCol][i] : '',
          Address_Street: compteData[addressStreetCol] ? compteData[addressStreetCol][i] : '',
          Address_Zip: compteData[addressZipCol] ? compteData[addressZipCol][i] : '',
          Address_City: compteData[addressCityCol] ? compteData[addressCityCol][i] : '',
          Email_Status: compteData.Email_Status ? compteData.Email_Status[i] : 'brouillon',
          Client_Depuis: compteData.Client_Depuis ? compteData.Client_Depuis[i] : null,
          Address_Lat: compteData.Adresse_Lat ? compteData.Adresse_Lat[i] : null,
          Address_Lng: compteData.Adresse_Lng ? compteData.Adresse_Lng[i] : null
        });
      }
    }
  } catch (e) {
    console.warn('[CRM] Could not load comptes:', e);
    comptes = [];
  }

  // --- CRM_Contacts ---
  try {
    var contactData = await grist.docApi.fetchTable(CONTACTS_TABLE);
    contacts = [];
    if (contactData && contactData.id) {
      var cNameCol = getColumnName('contacts', 'name');
      var cEmailCol = getColumnName('contacts', 'email');
      var cPhoneCol = getColumnName('contacts', 'phone');
      var cRoleCol = getColumnName('contacts', 'role');
      var cPrimaryCol = getColumnName('contacts', 'isPrimary');
      var cConsentCol = getColumnName('contacts', 'consent');
      var cConsentDateCol = getColumnName('contacts', 'consentDate');

      for (var j = 0; j < contactData.id.length; j++) {
        contacts.push({
          id: contactData.id[j],
          Compte_Id: contactData.Compte_Id ? contactData.Compte_Id[j] : null,
          Name: contactData[cNameCol] ? contactData[cNameCol][j] : '',
          Email: contactData[cEmailCol] ? contactData[cEmailCol][j] : '',
          Phone: contactData[cPhoneCol] ? contactData[cPhoneCol][j] : '',
          Role: contactData[cRoleCol] ? contactData[cRoleCol][j] : '',
          Is_Primary: contactData[cPrimaryCol] ? !!contactData[cPrimaryCol][j] : false,
          RGPD_Consent: contactData[cConsentCol] ? !!contactData[cConsentCol][j] : false,
          RGPD_Consent_Date: contactData[cConsentDateCol] ? contactData[cConsentDateCol][j] : null
        });
      }
    }
  } catch (e) {
    contacts = [];
  }

  // --- CRM_Contrats ---
  try {
    var contractData = await grist.docApi.fetchTable(CONTRATS_TABLE);
    contracts = [];
    if (contractData && contractData.id) {
      var lLabelCol = getColumnName('contrats', 'label');
      var lAmountCol = getColumnName('contrats', 'amount');
      var lStatusCol = getColumnName('contrats', 'status');
      var lStartCol = getColumnName('contrats', 'startDate');
      var lEndCol = getColumnName('contrats', 'endDate');

      for (var k = 0; k < contractData.id.length; k++) {
        contracts.push({
          id: contractData.id[k],
          Compte_Id: contractData.Compte_Id ? contractData.Compte_Id[k] : null,
          Label: contractData[lLabelCol] ? contractData[lLabelCol][k] : '',
          Amount: contractData[lAmountCol] ? contractData[lAmountCol][k] : 0,
          Status: contractData[lStatusCol] ? contractData[lStatusCol][k] : 'en_cours',
          Start_Date: contractData[lStartCol] ? contractData[lStartCol][k] : null,
          End_Date: contractData[lEndCol] ? contractData[lEndCol][k] : null,
          Fichier_Nom: contractData.Fichier_Nom ? contractData.Fichier_Nom[k] : '',
          Fichier_Type: contractData.Fichier_Type ? contractData.Fichier_Type[k] : '',
          Fichier_Data: contractData.Fichier_Data ? contractData.Fichier_Data[k] : ''
        });
      }
    }
  } catch (e) {
    contracts = [];
  }

  // --- CRM_Commentaires ---
  try {
    var commentData = await grist.docApi.fetchTable(COMMENTAIRES_TABLE);
    crmComments = [];
    if (commentData && commentData.id) {
      for (var m = 0; m < commentData.id.length; m++) {
        crmComments.push({
          id: commentData.id[m],
          Compte_Id: commentData.Compte_Id ? commentData.Compte_Id[m] : null,
          Author: commentData.Auteur ? commentData.Auteur[m] : '',
          Content: commentData.Contenu ? commentData.Contenu[m] : '',
          Created_At: commentData.Cree_Le ? commentData.Cree_Le[m] : null
        });
      }
    }
  } catch (e) {
    crmComments = [];
  }

  // --- CRM_Taches ---
  try {
    var taskData = await grist.docApi.fetchTable(TACHES_TABLE);
    crmTasks = [];
    if (taskData && taskData.id) {
      for (var n = 0; n < taskData.id.length; n++) {
        crmTasks.push({
          id: taskData.id[n],
          Compte_Id: taskData.Compte_Id ? taskData.Compte_Id[n] : null,
          Title: taskData.Titre ? taskData.Titre[n] : '',
          Status: taskData.Statut ? taskData.Statut[n] : 'a_faire',
          Due_Date: taskData.Date_Echeance ? taskData.Date_Echeance[n] : null,
          Assignee: taskData.Assigne_A ? taskData.Assigne_A[n] : 0,
          Created_At: taskData.Cree_Le ? taskData.Cree_Le[n] : null
        });
      }
    }
  } catch (e) {
    crmTasks = [];
  }

  // --- CRM_Categories ---
  try {
    var catData = await grist.docApi.fetchTable(CATEGORIES_TABLE);
    categories = [];
    if (catData && catData.id) {
      for (var p = 0; p < catData.id.length; p++) {
        categories.push({ id: catData.id[p], Name: catData.Nom ? catData.Nom[p] : '', Color: catData.Couleur ? catData.Couleur[p] : '', Order: catData.Ordre ? catData.Ordre[p] : 0 });
      }
    }
  } catch (e) {
    categories = [];
  }

  // --- CRM_Tags ---
  try {
    var tagData = await grist.docApi.fetchTable(TAGS_TABLE);
    tags = [];
    if (tagData && tagData.id) {
      for (var q = 0; q < tagData.id.length; q++) {
        tags.push({ id: tagData.id[q], Name: tagData.Nom ? tagData.Nom[q] : '', Color: tagData.Couleur ? tagData.Couleur[q] : '' });
      }
    }
  } catch (e) {
    tags = [];
  }

  // --- CRM_JournalActivite ---
  try {
    var logData = await grist.docApi.fetchTable(JOURNAL_TABLE);
    activityLog = [];
    if (logData && logData.id) {
      for (var r = 0; r < logData.id.length; r++) {
        activityLog.push({
          id: logData.id[r],
          Timestamp: logData.Horodatage ? logData.Horodatage[r] : null,
          User_Email: logData.Email_Utilisateur ? logData.Email_Utilisateur[r] : '',
          Action: logData.Action ? logData.Action[r] : '',
          Compte_Id: logData.Compte_Id ? logData.Compte_Id[r] : null,
          Compte_Name: logData.Nom_Compte ? logData.Nom_Compte[r] : '',
          Details: logData.Details ? logData.Details[r] : ''
        });
      }
    }
  } catch (e) {
    activityLog = [];
  }

  refreshAllViews();
}

async function logActivity(action, compteId, compteName, details) {
  try {
    await grist.docApi.applyUserActions([
      ['AddRecord', JOURNAL_TABLE, null, {
        Horodatage: Math.floor(Date.now() / 1000),
        Email_Utilisateur: currentUserEmail || '',
        Action: action,
        Compte_Id: compteId || 0,
        Nom_Compte: compteName || '',
        Details: details || ''
      }]
    ]);
  } catch (e) {
    console.log('[CRM] logActivity ignoré :', e.message);
  }
}

// =============================================================================
// RELATION HELPERS
// =============================================================================

function getContactsForCompte(compteId) {
  return contacts.filter(function(c) { return c.Compte_Id === compteId; });
}

function getContractsForCompte(compteId) {
  return contracts.filter(function(c) { return c.Compte_Id === compteId; });
}

function getCommentsForCompte(compteId) {
  return crmComments.filter(function(c) { return c.Compte_Id === compteId; })
    .sort(function(a, b) { return (b.Created_At || 0) - (a.Created_At || 0); });
}

function getTasksForCompte(compteId) {
  return crmTasks.filter(function(t2) { return t2.Compte_Id === compteId; });
}

function getCompteById(compteId) {
  return comptes.find(function(c) { return c.id === compteId; });
}

function getSignedContractsTotal(compteId) {
  return getContractsForCompte(compteId)
    .filter(function(c) { return c.Status === 'signe'; })
    .reduce(function(sum, c) { return sum + (Number(c.Amount) || 0); }, 0);
}

function getPrimaryContact(compteId) {
  var cs = getContactsForCompte(compteId);
  return cs.find(function(c) { return c.Is_Primary; }) || cs[0] || null;
}

function getEquipeMemberById(id) {
  return equipe.find(function(e) { return e.id === id; }) || null;
}

function getEquipeMemberName(id) {
  var m = getEquipeMemberById(id);
  return m ? m.Nom : '';
}

function buildEquipeOptions(selectedId) {
  var html = '<option value="">' + (currentLang === 'fr' ? '— Non assigné —' : '— Unassigned —') + '</option>';
  equipe.forEach(function(m) {
    html += '<option value="' + m.id + '"' + (Number(selectedId) === m.id ? ' selected' : '') + '>' + sanitize(m.Nom) + '</option>';
  });
  return html;
}

// =============================================================================
// FILTERING
// =============================================================================

function getFilteredComptes() {
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

function isRelanceOverdue(compte) {
  if (!compte.Relance_Date || isStageStopFollowUp(compte.Status)) return false;
  return daysFromNow(compte.Relance_Date) < 0;
}

function isRelanceUpcoming(compte) {
  if (!compte.Relance_Date || isStageStopFollowUp(compte.Status)) return false;
  var d = daysFromNow(compte.Relance_Date);
  return d >= 0 && d <= 7;
}

function isStageStopFollowUp(statusKey) {
  var stage = getKanbanStatuses().find(function(s) { return s.key === statusKey; });
  return !!(stage && stage.stopFollowUp);
}

function getRelanceComptes() {
  return comptes
    .filter(function(c) { return c.Relance_Date && !isStageStopFollowUp(c.Status); })
    .sort(function(a, b) { return (a.Relance_Date || 0) - (b.Relance_Date || 0); });
}

// =============================================================================
// COMPTES CRUD
// =============================================================================

async function createCompte(initialType) {
  var record = {};
  setField(record, 'comptes', 'name', '');
  setField(record, 'comptes', 'type', initialType || 'prospect');
  setField(record, 'comptes', 'status', getKanbanStatuses()[0].key);
  setField(record, 'comptes', 'priority', 'medium');
  setField(record, 'comptes', 'createdAt', Math.floor(Date.now() / 1000));
  record.Email_Status = 'brouillon';

  try {
    var res = await grist.docApi.applyUserActions([['AddRecord', COMPTES_TABLE, null, record]]);
    var newId = (res && res.retValues && res.retValues[0]) || res;
    showToast(t('compteCreated'), 'success');
    logActivity('compte_created', newId, '', '');
    await loadAllData();
    editModalActiveTab = 'info';
    openEditCompteModal(newId, true);
  } catch (e) {
    console.error('[CRM] Error creating compte:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

async function saveCompteFromModal(compteId) {
  var nameEl = document.getElementById('compte-name');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { showToast(currentLang === 'fr' ? 'Le nom est obligatoire' : 'Name is required', 'error'); return; }

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
  setField(record, 'comptes', 'category', getVal('compte-category', ''));
  setField(record, 'comptes', 'tag', getVal('compte-tag', ''));
  setField(record, 'comptes', 'description', getVal('compte-description', ''));
  setField(record, 'comptes', 'website', getVal('compte-website', ''));
  setField(record, 'comptes', 'addressStreet', getVal('compte-address-street', ''));
  setField(record, 'comptes', 'addressZip', getVal('compte-address-zip', ''));
  setField(record, 'comptes', 'addressCity', getVal('compte-address-city', ''));
  var addressLat = getVal('compte-address-lat', '');
  var addressLng = getVal('compte-address-lng', '');
  record.Adresse_Lat = addressLat ? parseFloat(addressLat) : null;
  record.Adresse_Lng = addressLng ? parseFloat(addressLng) : null;

  var contactName = getVal('compte-contact-name', '').trim();
  var contactEmail = getVal('compte-contact-email', '').trim();
  var contactPhone = getVal('compte-contact-phone', '').trim();

  try {
    var oldCompte = getCompteById(compteId);
    await grist.docApi.applyUserActions([['UpdateRecord', COMPTES_TABLE, compteId, record]]);

    if (contactName) {
      var existingPrimary = getPrimaryContact(compteId);
      var contactRecord = {};
      setField(contactRecord, 'contacts', 'name', contactName);
      setField(contactRecord, 'contacts', 'email', contactEmail);
      setField(contactRecord, 'contacts', 'phone', contactPhone);
      if (existingPrimary) {
        await grist.docApi.applyUserActions([['UpdateRecord', CONTACTS_TABLE, existingPrimary.id, contactRecord]]);
      } else {
        setField(contactRecord, 'contacts', 'isPrimary', true);
        contactRecord.Compte_Id = compteId;
        await grist.docApi.applyUserActions([['AddRecord', CONTACTS_TABLE, null, contactRecord]]);
      }
    }

    showToast(t('compteUpdated'), 'success');
    var changes = [];
    if (oldCompte && oldCompte.Status !== record[getColumnName('comptes', 'status')]) {
      changes.push(getStatusLabel(oldCompte.Status) + ' → ' + getStatusLabel(record[getColumnName('comptes', 'status')]));
    }
    logActivity('compte_updated', compteId, name, changes.join(', '));
    closeModal();
    editModalDraft = null;
    await loadAllData();
  } catch (e) {
    console.error('[CRM] Error updating compte:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

async function deleteCompte(compteId) {
  if (!isOwner) return;
  var compte = getCompteById(compteId);
  var confirmed = await showConfirmModal(t('confirmDelete'), currentLang === 'fr' ? 'Supprimer la fiche' : 'Delete record');
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
    logActivity('compte_deleted', compteId, compte ? compte.Name : '', '');
    await loadAllData();
  } catch (e) {
    console.error('[CRM] Error deleting compte:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

function getVal(id, fallback) {
  var el = document.getElementById(id);
  return el ? el.value : fallback;
}

// =============================================================================
// CONTACTS CRUD
// =============================================================================

async function addContact(compteId) {
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
    showToast(currentLang === 'fr' ? 'Contact ajouté' : 'Contact added', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error adding contact:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

async function setContactConsent(contactId, compteId, checked) {
  try {
    await grist.docApi.applyUserActions([
      ['UpdateRecord', CONTACTS_TABLE, contactId, {
        RGPD_Consent: checked,
        RGPD_Consent_Date: checked ? Math.floor(Date.now() / 1000) : null
      }]
    ]);
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error setting consent:', e);
  }
}

async function deleteContact(contactId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal(
    currentLang === 'fr' ? 'Supprimer ce contact ?' : 'Delete this contact?',
    currentLang === 'fr' ? 'Supprimer le contact' : 'Delete contact'
  );
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', CONTACTS_TABLE, contactId]]);
    showToast(currentLang === 'fr' ? 'Contact supprimé' : 'Contact deleted', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting contact:', e);
  }
}

// RGPD : export des données d'un contact (portabilité)
function exportContactData(contactId) {
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
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'contact_' + sanitizeFilename(contact.Name) + '_export.json';
  link.click();
  showToast(currentLang === 'fr' ? 'Données exportées' : 'Data exported', 'success');
}

// RGPD : suppression définitive (droit à l'oubli)
async function rgpdDeleteContact(contactId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal(
    currentLang === 'fr' ? 'Cette action est définitive et supprime toutes les données de ce contact (droit à l\u2019oubli RGPD). Confirmer ?' : 'This is permanent and erases all contact data (GDPR right to erasure). Confirm?',
    currentLang === 'fr' ? 'Suppression RGPD' : 'GDPR deletion'
  );
  if (!confirmed) return;
  var contact = contacts.find(function(c) { return c.id === contactId; });
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', CONTACTS_TABLE, contactId]]);
    logActivity('rgpd_delete_contact', compteId, contact ? contact.Name : '', 'Suppression RGPD définitive');
    showToast(currentLang === 'fr' ? 'Contact supprimé définitivement' : 'Contact permanently deleted', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error RGPD delete:', e);
  }
}

function sanitizeFilename(s) {
  return String(s || 'export').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
}

// =============================================================================
// CONTRACTS CRUD
// =============================================================================

async function addContract(compteId) {
  var label = getVal('new-contract-label', '').trim();
  if (!label) {
    var el = document.getElementById('new-contract-label');
    if (el) { el.style.borderColor = '#ef4444'; el.focus(); setTimeout(function() { el.style.borderColor = ''; }, 2000); }
    showToast(currentLang === 'fr' ? 'L\'intitulé est obligatoire' : 'Label is required', 'error');
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
    showToast(currentLang === 'fr' ? 'Contrat ajouté' : 'Contract added', 'success');
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

function downloadContractFile(contractId) {
  var contract = contracts.find(function(c) { return c.id === contractId; });
  if (!contract || !contract.Fichier_Data) return;
  var link = document.createElement('a');
  link.href = 'data:' + (contract.Fichier_Type || 'application/octet-stream') + ';base64,' + contract.Fichier_Data;
  link.download = contract.Fichier_Nom || 'contrat';
  link.click();
}

function updateFileLabel(input) {
  var label = input.closest('label');
  if (!label) return;
  var fileName = input.files && input.files[0] ? input.files[0].name : '';
  label.firstChild.textContent = fileName ? ('📎 ' + fileName) : ('📎 ' + (currentLang === 'fr' ? 'Joindre le contrat' : 'Attach file'));
}

async function deleteContract(contractId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal(
    currentLang === 'fr' ? 'Supprimer ce contrat ?' : 'Delete this contract?',
    currentLang === 'fr' ? 'Supprimer le contrat' : 'Delete contract'
  );
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', CONTRATS_TABLE, contractId]]);
    showToast(currentLang === 'fr' ? 'Contrat supprimé' : 'Contract deleted', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting contract:', e);
  }
}

// =============================================================================
// COMMENTS CRUD (fil d'historique)
// =============================================================================

async function addCrmComment(compteId) {
  var textarea = document.getElementById('new-comment-input');
  var content = textarea ? textarea.value.trim() : '';
  if (!content) return;
  try {
    await grist.docApi.applyUserActions([
      ['AddRecord', COMMENTAIRES_TABLE, null, {
        Compte_Id: compteId,
        Auteur: currentUserEmail || (currentLang === 'fr' ? 'Utilisateur' : 'User'),
        Contenu: content,
        Cree_Le: Math.floor(Date.now() / 1000)
      }]
    ]);
    var compte = getCompteById(compteId);
    logActivity('comment_added', compteId, compte ? compte.Name : '', content.substring(0, 80));
    showToast(currentLang === 'fr' ? 'Note ajoutée' : 'Note added', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error adding comment:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

async function deleteCrmComment(commentId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal(
    currentLang === 'fr' ? 'Supprimer cette note ?' : 'Delete this note?',
    currentLang === 'fr' ? 'Supprimer la note' : 'Delete note'
  );
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', COMMENTAIRES_TABLE, commentId]]);
    showToast(currentLang === 'fr' ? 'Note supprimée' : 'Note deleted', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting comment:', e);
  }
}

function editCrmComment(commentId, compteId) {
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
    '<button class="btn btn-primary" style="font-size:13px;padding:5px 12px;" onclick="saveCrmComment(' + commentId + ',' + compteId + ')">✓ ' + (currentLang === 'fr' ? 'Enregistrer' : 'Save') + '</button>' +
    '<button class="btn btn-secondary" style="font-size:13px;padding:5px 12px;" onclick="cancelCrmCommentEdit(' + commentId + ',\'' + currentText.replace(/'/g, "\\'") + '\')">✕ ' + (currentLang === 'fr' ? 'Annuler' : 'Cancel') + '</button>';

  contentEl.replaceWith(editArea);
  var actionsEl = itemEl.querySelector('.comment-actions');
  if (actionsEl) actionsEl.style.display = 'none';
  itemEl.appendChild(btnRow);
  editArea.focus();
  editArea.setSelectionRange(editArea.value.length, editArea.value.length);
}

function cancelCrmCommentEdit(commentId, originalText) {
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

async function saveCrmComment(commentId, compteId) {
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
    showToast(currentLang === 'fr' ? 'Note mise à jour' : 'Note updated', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error updating comment:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

// =============================================================================
// TASKS CRUD (relances / actions liées à un compte)
// =============================================================================

async function addCrmTask(compteId) {
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
    showToast(currentLang === 'fr' ? 'Tâche ajoutée' : 'Task added', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error adding task:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

async function clearRelance(compteId) {
  try {
    var record = {};
    setField(record, 'comptes', 'nextAction', '');
    setField(record, 'comptes', 'relanceDate', null);
    await grist.docApi.applyUserActions([['UpdateRecord', COMPTES_TABLE, compteId, record]]);
    var compte = getCompteById(compteId);
    logActivity('relance_handled', compteId, compte ? compte.Name : '', '');
    showToast(currentLang === 'fr' ? 'Relance marquée comme traitée' : 'Reminder marked as handled', 'success');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error clearing relance:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

async function toggleCrmTask(taskId, compteId, done) {
  try {
    await grist.docApi.applyUserActions([['UpdateRecord', TACHES_TABLE, taskId, { Statut: done ? 'fait' : 'a_faire' }]]);
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error toggling task:', e);
  }
}

async function deleteCrmTask(taskId, compteId) {
  if (!isOwner) return;
  var confirmed = await showConfirmModal(
    currentLang === 'fr' ? 'Supprimer cette tâche ?' : 'Delete this task?',
    currentLang === 'fr' ? 'Supprimer la tâche' : 'Delete task'
  );
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', TACHES_TABLE, taskId]]);
    showToast(currentLang === 'fr' ? 'Tâche supprimée' : 'Task deleted', 'info');
    await loadAllData();
    openEditCompteModal(compteId, true);
  } catch (e) {
    console.error('[CRM] Error deleting task:', e);
  }
}

// =============================================================================
// EQUIPE CRUD (gestion des membres — Paramètres)
// =============================================================================

function buildEquipeRoleOptions(selectedRole) {
  var html = '<option value="">' + (currentLang === 'fr' ? '— Rôle —' : '— Role —') + '</option>';
  getEquipeRoles().forEach(function(r) {
    html += '<option value="' + sanitize(r) + '"' + (selectedRole === r ? ' selected' : '') + '>' + sanitize(r) + '</option>';
  });
  html += '<option value="__new__">+ ' + (currentLang === 'fr' ? 'Créer un nouveau rôle...' : 'Create a new role...') + '</option>';
  return html;
}

function handleEquipeRoleSelectChange(select) {
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

async function addEquipeMember() {
  var name = getVal('new-equipe-name', '').trim();
  if (!name) return;

  var roleSelectValue = getVal('new-equipe-role', '');
  var role = roleSelectValue;
  if (roleSelectValue === '__new__') {
    var newRole = getVal('new-equipe-role-custom', '').trim();
    if (!newRole) { showToast(currentLang === 'fr' ? 'Indiquez le nom du nouveau rôle' : 'Enter the new role name', 'error'); return; }
    await addEquipeRole(newRole);
    role = newRole;
  }

  var record = {};
  setField(record, 'equipe', 'name', name);
  setField(record, 'equipe', 'email', getVal('new-equipe-email', '').trim());
  setField(record, 'equipe', 'role', role);
  try {
    await grist.docApi.applyUserActions([['AddRecord', EQUIPE_TABLE, null, record]]);
    showToast(currentLang === 'fr' ? 'Membre ajouté' : 'Member added', 'success');
    await loadAllData();
    renderSettingsView();
  } catch (e) {
    console.error('[CRM] Error adding equipe member:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

async function deleteEquipeMember(memberId) {
  if (!isOwner) return;
  var member = getEquipeMemberById(memberId);
  var usedAsResponsible = comptes.some(function(c) { return c.Responsible === memberId; });
  var usedAsAssignee = crmTasks.some(function(t2) { return t2.Assignee === memberId; });
  var warning = (usedAsResponsible || usedAsAssignee)
    ? (currentLang === 'fr' ? ' Ce membre est actuellement assigné à un ou plusieurs comptes/tâches.' : ' This member is currently assigned to one or more accounts/tasks.')
    : '';
  var confirmed = await showConfirmModal(
    (currentLang === 'fr' ? 'Supprimer ' + (member ? member.Nom : 'ce membre') + ' de l\u2019équipe ?' : 'Remove ' + (member ? member.Nom : 'this member') + ' from the team?') + warning,
    currentLang === 'fr' ? 'Supprimer le membre' : 'Delete member'
  );
  if (!confirmed) return;
  try {
    await grist.docApi.applyUserActions([['RemoveRecord', EQUIPE_TABLE, memberId]]);
    showToast(currentLang === 'fr' ? 'Membre supprimé' : 'Member deleted', 'info');
    await loadAllData();
    renderSettingsView();
  } catch (e) {
    console.error('[CRM] Error deleting equipe member:', e);
  }
}

// =============================================================================
// ACTIONS — Appeler / Envoyer email / Envoyer contrat / Relancer
// =============================================================================

// Lance une action de contact (call/email/contract/relance) sur un compte.
// Si plusieurs contacts existent, ouvre une mini-modale de choix avant de poursuivre.
// Ouvre un lien mailto:/tel: de façon fiable même dans un contexte de widget embarqué (iframe Grist).
// Un <a> cliqué par programmation est plus largement supporté que window.location.href dans ces contextes.
function openExternalLink(url) {
  var link = document.createElement('a');
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function triggerContactAction(compteId, actionType) {
  var compteContacts = getContactsForCompte(compteId);
  if (compteContacts.length === 0) {
    showToast(t('noContact'), 'error');
    return;
  }
  if (compteContacts.length === 1) {
    executeContactAction(compteId, compteContacts[0].id, actionType);
    return;
  }
  openChooseContactModal(compteId, actionType, compteContacts);
}

function openChooseContactModal(compteId, actionType, compteContacts) {
  var modalContainer = document.getElementById('modal-container');
  var html = '<div class="modal-overlay" onclick="if(event.target===this) closeModal()">';
  html += '<div class="modal modal-small">';
  html += '<div class="modal-header"><h2>' + t('chooseContact') + '</h2><button class="modal-close" onclick="closeModal()">✕</button></div>';
  html += '<div class="modal-body"><div class="sub-list">';
  compteContacts.forEach(function(c) {
    html += '<div class="sub-item contact-choice-item" onclick="closeModal(); executeContactAction(' + compteId + ', ' + c.id + ', \'' + actionType + '\')">';
    html += '<div class="sub-item-main"><strong>' + sanitize(c.Name) + '</strong>';
    if (c.Is_Primary) html += ' <span class="badge-primary">' + (currentLang === 'fr' ? 'Principal' : 'Primary') + '</span>';
    html += '<div class="sub-item-detail">' + [c.Role, c.Email, c.Phone].filter(Boolean).map(sanitize).join(' · ') + '</div></div>';
    html += '</div>';
  });
  html += '</div></div></div></div>';
  modalContainer.innerHTML = html;
  modalContainer.classList.remove('hidden');
}

function executeContactAction(compteId, contactId, actionType) {
  var compte = getCompteById(compteId);
  var contact = contacts.find(function(c) { return c.id === contactId; });
  if (!compte || !contact) return;

  if (actionType === 'call') {
    if (!contact.Phone) { showToast(t('noPhone'), 'error'); return; }
    openExternalLink('tel:' + contact.Phone.replace(/\s+/g, ''));
    logActivity('action_call', compteId, compte.Name, contact.Name);
    showToast(t('actionLogged'), 'success');
    return;
  }

  if (!contact.Email) { showToast(t('noEmail'), 'error'); return; }

  var templateKey = actionType === 'contract' ? 'contrat' : (actionType === 'relance' ? 'relance' : (actionType === 'prospection' ? 'prospection' : 'generique'));
  var template = getEmailTemplates()[templateKey];
  var vars = {
    contact: contact.Name || '',
    compte: compte.Name || '',
    responsable: getEquipeMemberName(compte.Responsible) || '',
    montant: formatAmount(compte.Amount)
  };
  var subject = fillTemplate(template.subject, vars);
  var body = fillTemplate(template.body, vars);

  // Trouver le fichier contrat attaché (priorité : signé > en_cours, puis plus récent)
  var contractFile = null;
  if (actionType === 'contract') {
    var compteContracts = getContractsForCompte(compteId).filter(function(c) { return c.Fichier_Nom && c.Fichier_Data; });
    if (compteContracts.length > 0) {
      contractFile = compteContracts.find(function(c) { return c.Status === 'signe'; }) || compteContracts[compteContracts.length - 1];
    }
  }

  var mailtoUrl = 'mailto:' + encodeURIComponent(contact.Email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  openExternalLink(mailtoUrl);

  // Télécharger le fichier automatiquement si présent (mailto ne peut pas attacher de fichiers)
  if (contractFile) {
    var link = document.createElement('a');
    link.href = 'data:' + (contractFile.Fichier_Type || 'application/octet-stream') + ';base64,' + contractFile.Fichier_Data;
    link.download = contractFile.Fichier_Nom;
    link.click();
    showToast(
      currentLang === 'fr'
        ? '📎 Fichier téléchargé : ' + contractFile.Fichier_Nom + ' — pensez à l\'attacher dans votre messagerie'
        : '📎 File downloaded: ' + contractFile.Fichier_Nom + ' — remember to attach it in your mail client',
      'info', 6000
    );
  }

  var actionLabel = actionType === 'contract' ? 'action_send_contract' : (actionType === 'relance' ? 'action_relance' : (actionType === 'prospection' ? 'action_prospection' : 'action_email'));
  logActivity(actionLabel, compteId, compte.Name, contact.Name);
  if (!contractFile) showToast(t('actionLogged'), 'success');

  // Webhook optionnel (envoi automatisé via service externe — voir Paramètres)
  var webhookUrl = getWebhookUrl();
  if (webhookUrl) {
    var webhookPayload = {
      type: actionLabel,
      compte: compte.Name,
      contact: contact.Name,
      email: contact.Email,
      subject: subject,
      body: body
    };
    if (contractFile) {
      webhookPayload.attachment_name = contractFile.Fichier_Nom;
      webhookPayload.attachment_type = contractFile.Fichier_Type;
      webhookPayload.attachment_data = contractFile.Fichier_Data;
    }
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload)
    }).catch(function(e) { console.log('[CRM] Webhook call failed:', e.message); });
  }
}

// =============================================================================
// BULK ACTIONS — Email groupé / Relance groupée (sélection multiple en Liste)
// =============================================================================

// Détermine, pour chaque compte sélectionné, le contact à utiliser (principal, ou premier contact).
// Les comptes sans email valide sont écartés (avec message récapitulatif).
function resolveBulkRecipients(compteIds) {
  var recipients = [];
  var skipped = [];
  compteIds.forEach(function(compteId) {
    var compte = getCompteById(compteId);
    if (!compte) return;
    var contact = getPrimaryContact(compteId);
    if (!contact || !contact.Email) {
      skipped.push(compte.Name);
      return;
    }
    recipients.push({ compte: compte, contact: contact });
  });
  return { recipients: recipients, skipped: skipped };
}

function triggerBulkAction(actionType) {
  if (selectedCompteIds.length === 0) return;
  var resolved = resolveBulkRecipients(selectedCompteIds);

  if (resolved.recipients.length === 0) {
    showToast(currentLang === 'fr' ? 'Aucun contact avec email parmi la sélection.' : 'No contact with an email in the selection.', 'error');
    return;
  }
  if (resolved.skipped.length > 0) {
    showToast(
      (currentLang === 'fr' ? 'Ignoré (pas de contact/email) : ' : 'Skipped (no contact/email): ') + resolved.skipped.join(', '),
      'info'
    );
  }

  openBulkActionModal(actionType, resolved.recipients);
}

function openBulkActionModal(actionType, recipients) {
  var webhookConfigured = !!getWebhookUrl();
  var modalContainer = document.getElementById('modal-container');
  var actionLabelText = actionType === 'relance' ? (currentLang === 'fr' ? 'Relance groupée' : 'Bulk follow-up') : (currentLang === 'fr' ? 'Email groupé' : 'Bulk email');
  var defaultTemplateKey = actionType === 'relance' ? 'relance' : 'generique';
  var templateLabels = {
    relance: currentLang === 'fr' ? 'Relance' : 'Follow-up',
    generique: currentLang === 'fr' ? 'Email générique' : 'Generic email',
    prospection: currentLang === 'fr' ? 'Prospection' : 'Prospecting'
  };

  var html = '<div class="modal-overlay" onclick="if(event.target===this) closeModal()">';
  html += '<div class="modal modal-small">';
  html += '<div class="modal-header"><h2>' + sanitize(actionLabelText) + '</h2><button class="modal-close" onclick="closeModal()">✕</button></div>';
  html += '<div class="modal-body">';
  html += '<p style="margin-bottom:12px;">' + recipients.length + ' ' + (currentLang === 'fr' ? 'destinataire(s) :' : 'recipient(s):') + ' ' + recipients.map(function(r) { return sanitize(r.contact.Name); }).join(', ') + '</p>';

  html += '<label class="form-field"><span>' + (currentLang === 'fr' ? 'Modèle d’email' : 'Email template') + '</span>';
  html += '<select id="bulk-template-select">';
  ['relance', 'generique', 'prospection'].forEach(function(key) {
    html += '<option value="' + key + '"' + (key === defaultTemplateKey ? ' selected' : '') + '>' + templateLabels[key] + '</option>';
  });
  html += '</select></label>';

  html += '<div class="rgpd-notice" style="background:#EAF6F8;color:#1B5C66;margin-top:10px;">' + (currentLang === 'fr'
    ? '✓ En validant, ces comptes seront marqués « À envoyer » (champ Email_Status). Votre automatisation (n8n) détecte ce statut, envoie l’email personnalisé, puis repasse le compte à « Envoyé ».'
    : '✓ Confirming will mark these accounts as “To send” (Email_Status field). Your automation (n8n) picks up that status, sends the personalized email, then sets the account back to “Sent”.') + '</div>';

  if (!webhookConfigured) {
    html += '<p class="settings-hint" style="margin-top:10px;">' + (currentLang === 'fr'
      ? 'Pas d’automatisation ? Vous pouvez aussi ouvrir un brouillon dans votre messagerie (tous les destinataires en copie cachée).'
      : 'No automation? You can also open a draft in your mail client (all recipients in Bcc).') + ' <a href="#" onclick="event.preventDefault(); confirmBulkAction(\'' + actionType + '\');">' + (currentLang === 'fr' ? 'Ouvrir un brouillon' : 'Open a draft') + '</a></p>';
  }

  html += '</div>';
  html += '<div class="modal-footer">';
  html += '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancel') + '</button>';
  html += '<button class="btn btn-primary" onclick="confirmBulkQueue(\'' + actionType + '\')">' + (currentLang === 'fr' ? 'Mettre en file d’attente' : 'Queue for sending') + '</button>';
  html += '</div></div></div>';

  modalContainer.innerHTML = html;
  modalContainer.classList.remove('hidden');

  // stocke temporairement les destinataires résolus pour la confirmation
  window.__pendingBulkRecipients = recipients;
}

async function confirmBulkQueue(actionType) {
  var recipients = window.__pendingBulkRecipients || [];
  var templateKey = getVal('bulk-template-select', actionType === 'relance' ? 'relance' : 'generique');
  closeModal();
  if (recipients.length === 0) return;

  var template = getEmailTemplates()[templateKey];
  var actions = recipients.map(function(r) {
    var vars = {
      contact: r.contact.Name || '',
      compte: r.compte.Name || '',
      responsable: getEquipeMemberName(r.compte.Responsible) || '',
      montant: formatAmount(r.compte.Amount)
    };
    return ['UpdateRecord', COMPTES_TABLE, r.compte.id, {
      Email_Status: 'a_envoyer',
      Email_Sujet: fillTemplate(template.subject, vars),
      Email_Corps: fillTemplate(template.body, vars),
      Email_Destinataire: r.contact.Email
    }];
  });

  try {
    await grist.docApi.applyUserActions(actions);
    showToast(
      (currentLang === 'fr' ? recipients.length + ' compte(s) marqué(s) « À envoyer »' : recipients.length + ' account(s) marked “To send”'),
      'success'
    );
  } catch (e) {
    console.error('[CRM] Bulk queue error:', e);
    showToast(currentLang === 'fr' ? 'Erreur lors de la mise en file d’attente.' : 'Error queueing accounts.', 'error');
  }

  recipients.forEach(function(r) {
    logActivity(actionType === 'relance' ? 'action_bulk_relance' : 'action_bulk_email', r.compte.id, r.compte.Name, r.contact.Name);
  });

  window.__pendingBulkRecipients = null;
  selectedCompteIds = [];
  await loadAllData();
  renderTableView();
}

function confirmBulkAction(actionType) {
  var recipients = window.__pendingBulkRecipients || [];
  closeModal();
  if (recipients.length === 0) return;

  var webhookUrl = getWebhookUrl();
  var templateKey = actionType === 'relance' ? 'relance' : 'generique';
  var template = getEmailTemplates()[templateKey];

  if (webhookUrl) {
    // Voie n8n / Power Automate : un seul POST avec la liste complète, personnalisation côté serveur
    var payloadRecipients = recipients.map(function(r) {
      var vars = {
        contact: r.contact.Name || '',
        compte: r.compte.Name || '',
        responsable: getEquipeMemberName(r.compte.Responsible) || '',
        montant: formatAmount(r.compte.Amount)
      };
      return {
        email: r.contact.Email,
        contact: r.contact.Name,
        compte: r.compte.Name,
        subject: fillTemplate(template.subject, vars),
        body: fillTemplate(template.body, vars)
      };
    });

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: actionType === 'relance' ? 'bulk_relance' : 'bulk_email',
        recipients: payloadRecipients
      })
    }).then(function() {
      showToast((currentLang === 'fr' ? 'Envoi groupé transmis à n8n (' : 'Bulk send forwarded to n8n (') + recipients.length + (currentLang === 'fr' ? ' destinataires)' : ' recipients)'), 'success');
    }).catch(function(e) {
      console.error('[CRM] Bulk webhook call failed:', e);
      showToast(currentLang === 'fr' ? 'Erreur lors de l\u2019envoi au webhook.' : 'Webhook call failed.', 'error');
    });
  } else {
    // Fallback mailto groupé en Bcc : un seul message générique, destinataires invisibles entre eux
    var vars = { contact: '', compte: '', responsable: currentUserEmail || '', montant: '' };
    var subject = fillTemplate(template.subject, vars);
    var body = fillTemplate(template.body, vars);
    var bccList = recipients.map(function(r) { return r.contact.Email; }).join(',');
    var mailtoUrl = 'mailto:?bcc=' + encodeURIComponent(bccList) + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    openExternalLink(mailtoUrl);
    showToast(t('actionLogged'), 'success');
  }

  recipients.forEach(function(r) {
    logActivity(actionType === 'relance' ? 'action_bulk_relance' : 'action_bulk_email', r.compte.id, r.compte.Name, r.contact.Name);
  });

  window.__pendingBulkRecipients = null;
  selectedCompteIds = [];
  renderTableView();
}

// =============================================================================
// KANBAN VIEW
// =============================================================================

function renderKanbanView() {
  var board = document.getElementById('kanban-board');
  if (!board) return;
  var statuses = getKanbanStatuses();
  var filtered = getFilteredComptes();
  var hideClientDays = getKanbanHideClientDays();

  var html = '';
  for (var s = 0; s < statuses.length; s++) {
    var col = statuses[s];
    var colComptes = filtered.filter(function(c) {
      if (c.Status !== col.key) return false;
      if (col.marksAsClient && !kanbanShowAll) {
        var since = c.Client_Depuis || c.Created_At;
        if (since && daysFromNow(since) < -hideClientDays) return false;
      }
      return true;
    });
    html += '<div class="kanban-column">';
    html += '<div class="kanban-col-header" style="--kanban-col-color:' + col.color + '; border-bottom-color:' + col.color + ';">';
    html += '<div class="kanban-col-header-left"><span>' + sanitize(col.label) + '</span></div><span class="kanban-count">' + colComptes.length + '</span>';
    html += '</div>';
    html += '<div class="kanban-cards" data-status="' + sanitize(col.key) + '" ondragover="onKanbanDragOver(event)" ondrop="onKanbanDrop(event)" ondragleave="onKanbanDragLeave(event)">';
    for (var i = 0; i < colComptes.length; i++) {
      html += renderCompteCard(colComptes[i]);
    }
    if (colComptes.length === 0) html += '<div class="kanban-empty">' + t('noComptes') + '</div>';
    html += '</div></div>';
  }
  board.innerHTML = html;
}

function renderCompteCard(compte) {
  var typeClass = 'type-' + compte.Type;
  var prioClass = 'dot-' + compte.Priority;
  var primaryContact = getPrimaryContact(compte.id);
  var relanceLate = isRelanceOverdue(compte);
  var relanceSoon = isRelanceUpcoming(compte);
  var relanceClass = relanceLate ? 'relance-late' : (relanceSoon ? 'relance-soon' : '');

  var html = '<div class="compte-card ' + relanceClass + '" draggable="true" ondragstart="onKanbanDragStart(event, ' + compte.id + ')" onclick="openEditCompteModal(' + compte.id + ')">';
  html += '<div class="compte-card-top">';
  html += '<span class="type-badge ' + typeClass + '">' + getAccountTypeLabel(compte.Type) + '</span>';
  html += '<span class="priority-dot ' + prioClass + '"></span>';
  html += '</div>';
  html += '<div class="compte-card-name">' + sanitize(compte.Name) + '</div>';
  if (primaryContact) html += '<div class="compte-card-contact">👤 ' + sanitize(primaryContact.Name) + '</div>';
  if (compte.Amount) html += '<div class="compte-card-amount">' + formatAmount(compte.Amount) + '</div>';
  if (compte.Next_Action) html += '<div class="compte-card-next">→ ' + sanitize(getNextActionLabel(compte.Type, compte.Next_Action)) + '</div>';
  if (compte.Relance_Date) {
    html += '<div class="compte-card-relance ' + relanceClass + '">📅 ' + formatDate(compte.Relance_Date) + (relanceLate ? ' (' + t('overdue') + ')' : '') + '</div>';
  }
  html += '</div>';
  return html;
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Drag & Drop ---
var draggedCompteId = null;

function onKanbanDragStart(e, compteId) {
  draggedCompteId = compteId;
  e.dataTransfer.effectAllowed = 'move';
}

function onKanbanDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function onKanbanDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

async function onKanbanDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  var newStatus = e.currentTarget.getAttribute('data-status');
  if (!draggedCompteId || !newStatus) return;
  var compte = getCompteById(draggedCompteId);
  if (!compte || compte.Status === newStatus) { draggedCompteId = null; return; }
  try {
    var statutCol = getColumnName('comptes', 'status');
    var record = {};
    record[statutCol] = newStatus;

    var newStage = getKanbanStatuses().find(function(s) { return s.key === newStatus; });
    var converted = false;
    if (newStage && newStage.marksAsClient && compte.Type === 'prospect') {
      setField(record, 'comptes', 'type', 'client');
      record.Client_Depuis = Math.floor(Date.now() / 1000);
      converted = true;
    }

    await grist.docApi.applyUserActions([['UpdateRecord', COMPTES_TABLE, draggedCompteId, record]]);
    logActivity('status_changed', draggedCompteId, compte.Name, getStatusLabel(compte.Status) + ' → ' + getStatusLabel(newStatus));
    if (converted) {
      logActivity('compte_converted_to_client', draggedCompteId, compte.Name, '');
      showToast(currentLang === 'fr' ? '🤝 ' + compte.Name + ' est maintenant client !' : '🤝 ' + compte.Name + ' is now a client!', 'success');
    } else {
      showToast(t('compteMoved'), 'success');
    }
    await loadAllData();
  } catch (err) {
    console.error('[CRM] Error moving compte:', err);
  }
  draggedCompteId = null;
}

function setKanbanSearch(value) {
  kanbanSearch = value;
  renderKanbanView();
}

function setKanbanShowAll(checked) {
  kanbanShowAll = checked;
  renderKanbanView();
}

function setFilterType(value) {
  currentFilterType = value || null;
  refreshAllViews();
}

// =============================================================================
// TABLE VIEW (liste avec recherche, tri, filtres avancés, sélection multiple)
// =============================================================================

var tableSortField = null;
var tableSortAsc = true;
var tableFilterTypes = [];
var tableFilterPriorities = [];
var selectedCompteIds = [];

function sortTable(field) {
  if (tableSortField === field) { tableSortAsc = !tableSortAsc; }
  else { tableSortField = field; tableSortAsc = true; }
  renderTableView();
}

// Remplit les <select> Statut et Responsable avec les valeurs réellement disponibles
function populateTableFilterOptions() {
  var statusSelect = document.getElementById('table-filter-status');
  if (statusSelect) {
    var currentVal = statusSelect.value;
    var html = '<option value="">' + (currentLang === 'fr' ? 'Tous statuts' : 'All statuses') + '</option>';
    getKanbanStatuses().forEach(function(s) {
      html += '<option value="' + sanitize(s.key) + '">' + sanitize(s.label) + '</option>';
    });
    statusSelect.innerHTML = html;
    statusSelect.value = currentVal;
  }
  var respSelect = document.getElementById('table-filter-responsible');
  if (respSelect) {
    var currentRespVal = respSelect.value;
    var html2 = '<option value="">' + (currentLang === 'fr' ? 'Tous responsables' : 'All owners') + '</option>';
    equipe.forEach(function(m) {
      html2 += '<option value="' + m.id + '">' + sanitize(m.Nom) + '</option>';
    });
    respSelect.innerHTML = html2;
    respSelect.value = currentRespVal;
  }
}

function toggleCompteSelection(compteId, checked) {
  var idx = selectedCompteIds.indexOf(compteId);
  if (checked && idx === -1) selectedCompteIds.push(compteId);
  else if (!checked && idx !== -1) selectedCompteIds.splice(idx, 1);
  renderBulkActionsBar();
  updateSelectAllCheckboxState();
}

function toggleSelectAllComptes(checked, visibleIds) {
  if (checked) {
    visibleIds.forEach(function(id) { if (selectedCompteIds.indexOf(id) === -1) selectedCompteIds.push(id); });
  } else {
    selectedCompteIds = selectedCompteIds.filter(function(id) { return visibleIds.indexOf(id) === -1; });
  }
  renderTableView();
}

function updateSelectAllCheckboxState() {
  var selectAllCb = document.getElementById('select-all-comptes');
  if (!selectAllCb) return;
  var rowCbs = document.querySelectorAll('.compte-row-checkbox');
  var allChecked = rowCbs.length > 0 && Array.prototype.every.call(rowCbs, function(cb) { return cb.checked; });
  selectAllCb.checked = allChecked;
}

function renderBulkActionsBar() {
  var bar = document.getElementById('table-bulk-bar');
  if (!bar) return;
  if (selectedCompteIds.length === 0) { bar.innerHTML = ''; bar.classList.add('hidden'); return; }
  bar.classList.remove('hidden');
  var count = selectedCompteIds.length;
  var html = '<div class="bulk-bar">';
  html += '<span class="bulk-bar-count">' + count + ' ' + (currentLang === 'fr' ? (count > 1 ? 'fiches sélectionnées' : 'fiche sélectionnée') : (count > 1 ? 'records selected' : 'record selected')) + '</span>';
  html += '<button class="btn-action" onclick="triggerBulkAction(\'email\')">✉️ ' + (currentLang === 'fr' ? 'Envoyer un email groupé' : 'Send bulk email') + '</button>';
  html += '<button class="btn-action" onclick="triggerBulkAction(\'relance\')">⏰ ' + (currentLang === 'fr' ? 'Relancer en masse' : 'Bulk follow-up') + '</button>';
  html += '<button class="link-btn" onclick="selectedCompteIds = []; renderTableView();">' + (currentLang === 'fr' ? 'Annuler la sélection' : 'Clear selection') + '</button>';
  html += '</div>';
  bar.innerHTML = html;
}

function renderTableView() {
  var container = document.getElementById('table-view');
  if (!container) return;

  populateTableFilterOptions();

  var searchEl = document.getElementById('table-search');
  var search = searchEl ? searchEl.value.toLowerCase() : '';
  var typeFilterEl = document.getElementById('table-filter-type');
  var typeFilter = typeFilterEl ? typeFilterEl.value : '';
  var statusFilterEl = document.getElementById('table-filter-status');
  var statusFilter = statusFilterEl ? statusFilterEl.value : '';
  var respFilterEl = document.getElementById('table-filter-responsible');
  var respFilter = respFilterEl ? respFilterEl.value : '';

  var filtered = comptes.filter(function(c) {
    if (tableFilterTypes.length && tableFilterTypes.indexOf(c.Type) === -1) return false;
    if (tableFilterPriorities.length && tableFilterPriorities.indexOf(c.Priority) === -1) return false;
    if (typeFilter && c.Type !== typeFilter) return false;
    if (statusFilter && c.Status !== statusFilter) return false;
    if (respFilter && String(c.Responsible) !== respFilter) return false;
    if (search) {
      var primaryContact = getPrimaryContact(c.id);
      var text = [c.Name, getEquipeMemberName(c.Responsible), c.Category, c.Tag, primaryContact ? primaryContact.Name : '', primaryContact ? primaryContact.Email : ''].join(' ').toLowerCase();
      if (text.indexOf(search) === -1) return false;
    }
    return true;
  });

  if (tableSortField) {
    var dir = tableSortAsc ? 1 : -1;
    filtered.sort(function(a, b) {
      var va, vb;
      switch (tableSortField) {
        case 'Name': va = (a.Name || '').toLowerCase(); vb = (b.Name || '').toLowerCase(); break;
        case 'Type': va = a.Type || ''; vb = b.Type || ''; break;
        case 'Status': va = getStatusLabel(a.Status); vb = getStatusLabel(b.Status); break;
        case 'Priority': var po = { high: 0, medium: 1, low: 2 }; va = po[a.Priority] !== undefined ? po[a.Priority] : 3; vb = po[b.Priority] !== undefined ? po[b.Priority] : 3; break;
        case 'Amount': va = Number(a.Amount) || 0; vb = Number(b.Amount) || 0; break;
        case 'Relance_Date': va = a.Relance_Date || 0; vb = b.Relance_Date || 0; break;
        default: va = ''; vb = '';
      }
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  function sortIcon(field) { return tableSortField === field ? (tableSortAsc ? ' ▲' : ' ▼') : ' ⇅'; }
  var thStyle = 'cursor:pointer;user-select:none;';
  var visibleIds = filtered.map(function(c) { return c.id; });
  var allVisibleSelected = visibleIds.length > 0 && visibleIds.every(function(id) { return selectedCompteIds.indexOf(id) !== -1; });

  var html = '<table class="data-table">';
  html += '<thead><tr>';
  html += '<th style="width:32px;"><input type="checkbox" id="select-all-comptes" ' + (allVisibleSelected ? 'checked' : '') + ' onchange="toggleSelectAllComptes(this.checked, ' + JSON.stringify(visibleIds) + ')"></th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Name\')">' + t('colName') + sortIcon('Name') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Type\')">' + t('colType') + sortIcon('Type') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Status\')">' + t('colStatus') + sortIcon('Status') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Priority\')">' + t('colPriority') + sortIcon('Priority') + '</th>';
  html += '<th>' + t('colResponsible') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Amount\')">' + t('colAmount') + sortIcon('Amount') + '</th>';
  html += '<th>' + t('colNextAction') + '</th>';
  html += '<th>' + (currentLang === 'fr' ? 'Date prochaine action' : 'Next action date') + '</th>';
  html += '<th style="' + thStyle + '" onclick="sortTable(\'Relance_Date\')">' + t('colRelance') + sortIcon('Relance_Date') + '</th>';
  html += '<th>' + t('colActions') + '</th>';
  html += '</tr></thead><tbody>';

  for (var i = 0; i < filtered.length; i++) {
    var c = filtered[i];
    var relanceLate = isRelanceOverdue(c);
    var isChecked = selectedCompteIds.indexOf(c.id) !== -1;
    html += '<tr class="clickable-row ' + (isChecked ? 'row-selected' : '') + '">';
    html += '<td onclick="event.stopPropagation();"><input type="checkbox" class="compte-row-checkbox" ' + (isChecked ? 'checked' : '') + ' onchange="toggleCompteSelection(' + c.id + ', this.checked)"></td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><strong>' + sanitize(c.Name) + '</strong></td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="type-badge type-' + c.Type + '">' + getAccountTypeLabel(c.Type) + '</span></td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="status-badge" style="background:' + getStatusColor(c.Status) + '22;color:' + getStatusColor(c.Status) + ';">● ' + sanitize(getStatusLabel(c.Status)) + '</span></td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="priority-dot dot-' + c.Priority + '"></span> ' + t('priority' + capitalize(c.Priority)) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + sanitize(getEquipeMemberName(c.Responsible)) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + formatAmount(c.Amount) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + sanitize(c.Next_Action) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')">' + (c.Next_Action_Date ? formatDate(c.Next_Action_Date) : t('noDate')) + '</td>';
    html += '<td onclick="openEditCompteModal(' + c.id + ')" style="' + (relanceLate ? 'color:#dc2626;font-weight:700;' : '') + '">' + (c.Relance_Date ? formatDate(c.Relance_Date) : t('noDate')) + '</td>';
    html += '<td onclick="event.stopPropagation();">';
    if (isOwner) html += '<button class="btn-icon" onclick="deleteCompte(' + c.id + ')" title="' + t('delete') + '">🗑️</button>';
    html += '</td></tr>';
  }
  if (filtered.length === 0) {
    html += '<tr><td colspan="11" style="text-align:center;color:#94a3b8;padding:24px;">' + t('noComptes') + '</td></tr>';
  }
  html += '</tbody></table>';
  container.innerHTML = html;

  renderBulkActionsBar();
}

function setTableFilterTypes(types) {
  tableFilterTypes = types;
  renderTableView();
}

function setTableFilterPriorities(prios) {
  tableFilterPriorities = prios;
  renderTableView();
}

// =============================================================================
// RELANCES VIEW (onglet dédié)
// =============================================================================

function renderRelancesView() {
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
      : (days === 0 ? (currentLang === 'fr' ? 'Aujourd\u2019hui' : 'Today') : (currentLang === 'fr' ? 'dans ' + days + ' j' : 'in ' + days + ' d'));
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

// =============================================================================
// STATS VIEW (micro-stats / compteurs)
// =============================================================================

function renderStatsView() {
  var container = document.getElementById('stats-view');
  if (!container) return;

  var clients = comptes.filter(function(c) { return c.Type === 'client'; });
  var prospects = comptes.filter(function(c) { return c.Type === 'prospect'; });
  var anciens = comptes.filter(function(c) { return c.Type === 'ancien'; });

  var caTotal = clients.reduce(function(sum, c) { return sum + (Number(c.Amount) || getSignedContractsTotal(c.id)); }, 0);
  var pipelineTotal = prospects.reduce(function(sum, c) { return sum + (Number(c.Amount) || 0); }, 0);

  var relanceLate = comptes.filter(isRelanceOverdue).length;
  var relancePending = getRelanceComptes().length;

  var html = '<div class="stats-grid">';
  html += statCard(t('statTotal'), comptes.length, '#64748b');
  html += statCard(t('statClients'), clients.length, '#22c55e');
  html += statCard(t('statProspects'), prospects.length, '#3b82f6');
  html += statCard(t('statAnciens'), anciens.length, '#94a3b8');
  html += statCard(t('statCA'), formatAmount(caTotal), '#16a34a');
  html += statCard(t('statPipeline'), formatAmount(pipelineTotal), '#2563eb');
  html += statCard(t('statRelances'), relancePending, '#f59e0b');
  html += statCard(t('statRelancesLate'), relanceLate, '#dc2626');
  html += '</div>';

  html += '<div class="stats-charts">';
  html += renderPipelineChart(comptes);
  html += renderPriorityChart();
  html += renderCAPipelinePieChart();
  html += '</div>';

  container.innerHTML = html;
  drawCAPipelinePieChart();
}

function statCard(label, value, color) {
  return '<div class="stat-card">' +
    '<div class="stat-value" style="color:' + (color || 'var(--color-accent-cyan)') + ';">' + value + '</div>' +
    '<div class="stat-label">' + sanitize(label) + '</div></div>';
}

function renderPipelineChart(prospects) {
  var statuses = getKanbanStatuses();
  var html = '<div class="chart-card"><h4>' + (currentLang === 'fr' ? 'Répartition du pipeline' : 'Pipeline breakdown') + '</h4>';
  var maxCount = Math.max(1, statuses.map(function(s) { return prospects.filter(function(p) { return p.Status === s.key; }).length; }).reduce(function(a, b) { return Math.max(a, b); }, 0));
  html += '<div class="bar-chart">';
  statuses.forEach(function(s) {
    var count = prospects.filter(function(p) { return p.Status === s.key; }).length;
    var pct = Math.round((count / maxCount) * 100);
    html += '<div class="bar-row">';
    html += '<span class="bar-label">' + sanitize(s.label) + '</span>';
    html += '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + s.color + ';"></div></div>';
    html += '<span class="bar-value">' + count + '</span>';
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function renderPriorityChart() {
  var prios = [
    { key: 'high', label: t('priorityHigh'), color: '#ef4444' },
    { key: 'medium', label: t('priorityMedium'), color: '#f59e0b' },
    { key: 'low', label: t('priorityLow'), color: '#22c55e' }
  ];
  var maxCount = Math.max(1, prios.map(function(p) { return comptes.filter(function(c) { return c.Priority === p.key; }).length; }).reduce(function(a, b) { return Math.max(a, b); }, 0));
  var html = '<div class="chart-card"><h4>' + (currentLang === 'fr' ? 'Répartition par priorité' : 'By priority') + '</h4>';
  html += '<div class="bar-chart">';
  prios.forEach(function(p) {
    var count = comptes.filter(function(c) { return c.Priority === p.key; }).length;
    var pct = Math.round((count / maxCount) * 100);
    html += '<div class="bar-row">';
    html += '<span class="bar-label">' + sanitize(p.label) + '</span>';
    html += '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + p.color + ';"></div></div>';
    html += '<span class="bar-value">' + count + '</span>';
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function renderCAPipelinePieChart() {
  return '<div class="chart-card"><h4>' + (currentLang === 'fr' ? 'CA par étape du pipeline' : 'Revenue by pipeline stage') + '</h4>' +
    '<div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">' +
    '<canvas id="ca-pie-chart" width="180" height="180" style="flex-shrink:0;"></canvas>' +
    '<div id="ca-pie-legend" style="display:flex;flex-direction:column;gap:7px;font-size:13px;"></div>' +
    '</div></div>';
}

function drawCAPipelinePieChart() {
  var canvas = document.getElementById('ca-pie-chart');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var statuses = getKanbanStatuses();

  var segments = statuses.map(function(s) {
    var total = comptes
      .filter(function(c) { return c.Status === s.key; })
      .reduce(function(sum, c) { return sum + (Number(c.Amount) || 0); }, 0);
    return { label: s.label, color: s.color, value: total };
  }).filter(function(s) { return s.value > 0; });

  var grandTotal = segments.reduce(function(sum, s) { return sum + s.value; }, 0);

  var legend = document.getElementById('ca-pie-legend');
  if (grandTotal === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '13px Barlow, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(currentLang === 'fr' ? 'Aucune donnée' : 'No data', 90, 95);
    return;
  }

  var cx = canvas.width / 2, cy = canvas.height / 2, r = 78, innerR = 38;
  var startAngle = -Math.PI / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  segments.forEach(function(s) {
    var slice = (s.value / grandTotal) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = s.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    startAngle += slice;
  });

  // trou central (donut)
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // total au centre
  ctx.fillStyle = '#271A79';
  ctx.font = 'bold 12px Barlow, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(formatAmount(grandTotal), cx, cy);

  // légende
  if (legend) {
    legend.innerHTML = segments.map(function(s) {
      var pct = Math.round((s.value / grandTotal) * 100);
      return '<div style="display:flex;align-items:center;gap:6px;">' +
        '<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + s.color + ';flex-shrink:0;"></span>' +
        '<span style="color:#271A79;font-weight:600;">' + sanitize(s.label) + '</span>' +
        '<span style="color:#5C5A8A;margin-left:auto;padding-left:8px;">' + formatAmount(s.value) + ' (' + pct + '%)</span>' +
        '</div>';
    }).join('');
  }
}

// =============================================================================
// MODAL — FICHE COMPTE (édition complète : infos, contacts, contrats, notes, tâches)
// =============================================================================

var editModalActiveTab = 'fiche';
var modalExpanded = true;

function toggleModalExpand(compteId) {
  captureInfoDraftIfPresent();
  modalExpanded = !modalExpanded;
  openEditCompteModal(compteId, true);
}
var editModalDraft = null; // capture les champs du formulaire "info" lors d'un changement d'onglet, pour ne pas perdre la saisie

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
    tag: getVal('compte-tag', ''),
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

function openEditCompteModal(compteId, keepTab) {
  var compte = getCompteById(compteId);
  if (!compte) return;
  if (!keepTab) { editModalActiveTab = 'fiche'; editModalDraft = null; }

  var modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = renderCompteModal(compte);
  modalContainer.classList.remove('hidden');

  if (editModalActiveTab === 'fiche' && compte.Address_Lat != null && compte.Address_Lng != null) {
    initFicheMap(compte);
  }
}

function initFicheMap(compte) {
  var mapEl = document.getElementById('fiche-map-' + compte.id);
  if (!mapEl || typeof L === 'undefined') return;
  setTimeout(function() {
    var map = L.map(mapEl, { attributionControl: false }).setView([compte.Address_Lat, compte.Address_Lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([compte.Address_Lat, compte.Address_Lng]).addTo(map);
  }, 50);
}

// =============================================================================
// CARTE VIEW — Prospects (hors "Perdu") et Clients géolocalisés, filtrables par département
// =============================================================================

var carteMap = null;
var carteMarkersLayer = null;
var carteFilterType = '';
var carteFilterDepartement = '';

var DEPARTEMENTS_FR = {
  '01': 'Ain', '02': 'Aisne', '03': 'Allier', '04': 'Alpes-de-Haute-Provence', '05': 'Hautes-Alpes',
  '06': 'Alpes-Maritimes', '07': 'Ardèche', '08': 'Ardennes', '09': 'Ariège', '10': 'Aube',
  '11': 'Aude', '12': 'Aveyron', '13': 'Bouches-du-Rhône', '14': 'Calvados', '15': 'Cantal',
  '16': 'Charente', '17': 'Charente-Maritime', '18': 'Cher', '19': 'Corrèze', '2A': 'Corse-du-Sud',
  '2B': 'Haute-Corse', '21': 'Côte-d’Or', '22': 'Côtes-d’Armor', '23': 'Creuse', '24': 'Dordogne',
  '25': 'Doubs', '26': 'Drôme', '27': 'Eure', '28': 'Eure-et-Loir', '29': 'Finistère',
  '30': 'Gard', '31': 'Haute-Garonne', '32': 'Gers', '33': 'Gironde', '34': 'Hérault',
  '35': 'Ille-et-Vilaine', '36': 'Indre', '37': 'Indre-et-Loire', '38': 'Isère', '39': 'Jura',
  '40': 'Landes', '41': 'Loir-et-Cher', '42': 'Loire', '43': 'Haute-Loire', '44': 'Loire-Atlantique',
  '45': 'Loiret', '46': 'Lot', '47': 'Lot-et-Garonne', '48': 'Lozère', '49': 'Maine-et-Loire',
  '50': 'Manche', '51': 'Marne', '52': 'Haute-Marne', '53': 'Mayenne', '54': 'Meurthe-et-Moselle',
  '55': 'Meuse', '56': 'Morbihan', '57': 'Moselle', '58': 'Nièvre', '59': 'Nord',
  '60': 'Oise', '61': 'Orne', '62': 'Pas-de-Calais', '63': 'Puy-de-Dôme', '64': 'Pyrénées-Atlantiques',
  '65': 'Hautes-Pyrénées', '66': 'Pyrénées-Orientales', '67': 'Bas-Rhin', '68': 'Haut-Rhin', '69': 'Rhône',
  '70': 'Haute-Saône', '71': 'Saône-et-Loire', '72': 'Sarthe', '73': 'Savoie', '74': 'Haute-Savoie',
  '75': 'Paris', '76': 'Seine-Maritime', '77': 'Seine-et-Marne', '78': 'Yvelines', '79': 'Deux-Sèvres',
  '80': 'Somme', '81': 'Tarn', '82': 'Tarn-et-Garonne', '83': 'Var', '84': 'Vaucluse',
  '85': 'Vendée', '86': 'Vienne', '87': 'Haute-Vienne', '88': 'Vosges', '89': 'Yonne',
  '90': 'Territoire de Belfort', '91': 'Essonne', '92': 'Hauts-de-Seine', '93': 'Seine-Saint-Denis',
  '94': 'Val-de-Marne', '95': 'Val-d’Oise',
  '971': 'Guadeloupe', '972': 'Martinique', '973': 'Guyane', '974': 'La Réunion', '976': 'Mayotte'
};

function getDepartementFromZip(zip) {
  if (!zip) return null;
  zip = String(zip).trim();
  if (zip.length < 2) return null;
  if (zip.indexOf('97') === 0 || zip.indexOf('98') === 0) return zip.slice(0, 3);
  if (zip.indexOf('20') === 0) {
    var n = parseInt(zip, 10);
    return n >= 20200 ? '2B' : '2A';
  }
  return zip.slice(0, 2);
}

function getDepartementLabel(code) {
  return DEPARTEMENTS_FR[code] ? code + ' — ' + DEPARTEMENTS_FR[code] : code;
}

function getCarteComptes() {
  return comptes.filter(function(c) {
    if (c.Address_Lat == null || c.Address_Lng == null) return false;
    var isEligibleType = c.Type === 'client' || (c.Type === 'prospect' && !isStageStopFollowUp(c.Status));
    if (!isEligibleType) return false;
    if (carteFilterType && c.Type !== carteFilterType) return false;
    if (carteFilterDepartement && getDepartementFromZip(c.Address_Zip) !== carteFilterDepartement) return false;
    return true;
  });
}

function populateCarteDepartementSelect() {
  var sel = document.getElementById('carte-departement-select');
  if (!sel) return;
  var eligible = comptes.filter(function(c) {
    return c.Address_Lat != null && c.Address_Lng != null &&
      (c.Type === 'client' || (c.Type === 'prospect' && !isStageStopFollowUp(c.Status)));
  });
  var codes = eligible.map(function(c) { return getDepartementFromZip(c.Address_Zip); }).filter(Boolean);
  var uniqueCodes = codes.filter(function(v, idx, arr) { return arr.indexOf(v) === idx; }).sort();
  var current = sel.value;
  var html = '<option value="">Tous départements</option>';
  uniqueCodes.forEach(function(code) {
    html += '<option value="' + code + '"' + (code === current ? ' selected' : '') + '>' + sanitize(getDepartementLabel(code)) + '</option>';
  });
  sel.innerHTML = html;
}

function setCarteFilterType(value) {
  carteFilterType = value;
  renderCarteView();
}

function setCarteFilterDepartement(value) {
  carteFilterDepartement = value;
  renderCarteView();
}

function renderCarteView() {
  var container = document.getElementById('carte-board');
  if (!container || typeof L === 'undefined') return;

  populateCarteDepartementSelect();
  var list = getCarteComptes();

  var countEl = document.getElementById('carte-count');
  if (countEl) countEl.textContent = list.length + (currentLang === 'fr' ? ' compte(s) sur la carte' : ' account(s) on the map');

  if (!carteMap) {
    carteMap = L.map(container).setView([46.6, 2.5], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(carteMap);
    carteMarkersLayer = L.layerGroup().addTo(carteMap);
  } else {
    setTimeout(function() { carteMap.invalidateSize(); }, 50);
  }

  carteMarkersLayer.clearLayers();

  if (list.length === 0) return;

  var bounds = [];
  list.forEach(function(c) {
    var color = c.Type === 'client' ? '#42B6C8' : '#22c55e';
    var marker = L.circleMarker([c.Address_Lat, c.Address_Lng], {
      radius: 8, fillColor: color, color: '#271A79', weight: 2, fillOpacity: 0.9
    });
    var popupHtml = '<div class="carte-popup-name">' + sanitize(c.Name) + '</div>' +
      '<div>' + sanitize(getAccountTypeLabel(c.Type)) + ' · ' + sanitize(c.Address_City || '') + '</div>' +
      '<a href="#" class="carte-popup-link" onclick="closeAllPopups(); openEditCompteModal(' + c.id + '); return false;">' +
      (currentLang === 'fr' ? 'Ouvrir la fiche →' : 'Open record →') + '</a>';
    marker.bindPopup(popupHtml);
    marker.addTo(carteMarkersLayer);
    bounds.push([c.Address_Lat, c.Address_Lng]);
  });

  if (bounds.length > 0) {
    carteMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
  }
}

function closeAllPopups() {
  if (carteMap) carteMap.closePopup();
}

function renderCompteModal(compte) {
  var html = '<div class="modal-overlay" onclick="if(event.target===this) closeModal()">';
  html += '<div class="modal modal-large' + (modalExpanded ? ' modal-expanded' : '') + '">';
  html += '<div class="modal-header">';
  html += '<h2>' + sanitize(compte.Name || t('modalEditCompte')) + '</h2>';
  html += '<div class="modal-header-actions">';
  html += '<button class="modal-expand-btn" title="' + (currentLang === 'fr' ? 'Agrandir / réduire' : 'Expand / collapse') + '" onclick="toggleModalExpand(' + compte.id + ')">' + (modalExpanded ? '⤡' : '⤢') + '</button>';
  html += '<button class="modal-close" onclick="closeModal()">✕</button>';
  html += '</div>';
  html += '</div>';

  html += '<div class="modal-actions-bar">';
  html += '<button class="btn-action" onclick="triggerContactAction(' + compte.id + ', \'call\')">📞 ' + t('actionCall') + '</button>';
  html += '<button class="btn-action" onclick="triggerContactAction(' + compte.id + ', \'email\')">✉️ ' + t('actionEmail') + '</button>';
  html += '<button class="btn-action" onclick="triggerContactAction(' + compte.id + ', \'contract\')">📄 ' + t('actionContract') + '</button>';
  html += '<button class="btn-action" onclick="triggerContactAction(' + compte.id + ', \'relance\')">⏰ ' + t('actionRelance') + '</button>';
  if (compte.Type === 'prospect') {
    html += '<button class="btn-action" onclick="triggerContactAction(' + compte.id + ', \'prospection\')">📣 ' + (currentLang === 'fr' ? 'Envoyer la présentation' : 'Send presentation') + '</button>';
  }
  html += '</div>';

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

  html += '<div class="modal-body">';
  if (editModalActiveTab === 'fiche') html += renderFicheTab(compte);
  else if (editModalActiveTab === 'info') html += renderInfoTab(compte);
  else if (editModalActiveTab === 'contacts') html += renderContactsTab(compte);
  else if (editModalActiveTab === 'contrats') html += renderContractsTab(compte);
  else if (editModalActiveTab === 'comments') html += renderCommentsTab(compte);
  else if (editModalActiveTab === 'tasks') html += renderTasksTab(compte);
  html += '</div>';

  if (editModalActiveTab === 'info') {
    html += '<div class="modal-footer">';
    if (isOwner) html += '<button class="btn btn-danger" onclick="deleteCompte(' + compte.id + ')">' + t('delete') + '</button>';
    html += '<div style="flex:1;"></div>';
    html += '<button class="btn btn-secondary" onclick="closeModal()">' + t('cancel') + '</button>';
    html += '<button class="btn btn-primary" onclick="saveCompteFromModal(' + compte.id + ')">' + t('save') + '</button>';
    html += '</div>';
  }

  html += '</div></div>';
  return html;
}

function switchModalTab(tab, compteId) {
  captureInfoDraftIfPresent();
  editModalActiveTab = tab;
  openEditCompteModal(compteId, true);
}

function buildStatusOptions(selectedKey) {
  return getKanbanStatuses().map(function(s) {
    return '<option value="' + s.key + '"' + (selectedKey === s.key ? ' selected' : '') + '>' + sanitize(s.label) + '</option>';
  }).join('');
}

// --- Fiche (lecture seule) ---
function ficheRow(label, value, isLink) {
  var display = value ? sanitize(value) : '<span class="fiche-row-empty">—</span>';
  if (value && isLink === 'tel') display = '<a href="tel:' + sanitize(value.replace(/\s+/g, '')) + '" class="fiche-link">📞 ' + sanitize(value) + '</a>';
  else if (value && isLink === 'mail') display = '<a href="mailto:' + sanitize(value) + '" class="fiche-link">✉️ ' + sanitize(value) + '</a>';
  else if (value && isLink === 'web') {
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
    ficheRow(fr ? 'Email' : 'Email', primaryContact ? primaryContact.Email : '', 'mail') +
    ficheRow(fr ? 'Téléphone' : 'Phone', primaryContact ? primaryContact.Phone : '', 'tel') +
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
  if (compte.Address_Lat != null && compte.Address_Lng != null) {
    addressRowsHtml += '<div id="fiche-map-' + compte.id + '" class="fiche-map"></div>';
  }
  html += ficheCard('📍', fr ? 'Adresse' : 'Address', addressRowsHtml);

  html += ficheCard('🏷️', fr ? 'Catégorisation' : 'Categorization',
    ficheRow(t('fieldCategory'), compte.Category) +
    ficheRow(t('fieldTag'), compte.Tag)
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
  var vTag = d ? d.tag : compte.Tag;
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
  html += formField(t('fieldCategory'), '<input id="compte-category" type="text" value="' + sanitize(vCategory) + '">');
  html += formField(t('fieldTag'), '<input id="compte-tag" type="text" value="' + sanitize(vTag) + '">');
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

function onAddressStreetInput(value) {
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

function hideAddressSuggestions() {
  var box = document.getElementById('address-suggestions');
  if (box) { box.innerHTML = ''; box.classList.add('hidden'); }
  _addressSuggestions = [];
}

function selectAddressSuggestion(idx) {
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

function refreshNextActionOptions() {
  var type = getVal('compte-type', 'prospect');
  var sel = document.getElementById('compte-next-action');
  if (!sel) return;
  sel.innerHTML = buildNextActionOptions(type, '');
  recalcRelanceDate();
}

function addDaysToDateInput(dateStr, days) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function recalcRelanceDate() {
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
    html += '<button class="link-btn" onclick="exportContactData(' + c.id + ')">' + (currentLang === 'fr' ? '⬇️ Télécharger les données de ce contact' : '⬇️ Download this contact\u2019s data') + '</button>';
    html += '</div>';
    html += '</div>';
    if (isOwner) {
      html += '<div class="sub-item-actions">';
      html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Retirer ce contact de la fiche' : 'Remove this contact') + '" onclick="deleteContact(' + c.id + ', ' + compte.id + ')">🗑️</button>';
      html += '<button class="btn-icon" title="' + (currentLang === 'fr' ? 'Suppression RGPD définitive (droit à l\u2019oubli)' : 'Permanent GDPR deletion') + '" onclick="rgpdDeleteContact(' + c.id + ', ' + compte.id + ')">⚠️</button>';
      html += '</div>';
    }
    html += '</div>';
  });
  if (list.length === 0) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucun contact pour le moment' : 'No contact yet') + '</div>';
  html += '</div>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? '🗑️ retire le contact de cette fiche (récupérable en le recréant). ⚠️ supprime définitivement toutes ses données (droit à l\u2019oubli RGPD, irréversible).'
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
    html += '<div class="task-mini-actions">';
    html += '<button class="btn-action-mini" title="' + t('actionCall') + '" onclick="triggerContactAction(' + compte.id + ', \'call\')">📞</button>';
    html += '<button class="btn-action-mini" title="' + t('actionEmail') + '" onclick="triggerContactAction(' + compte.id + ', \'email\')">✉️</button>';
    html += '<button class="btn-action-mini" title="' + t('actionContract') + '" onclick="triggerContactAction(' + compte.id + ', \'contract\')">📄</button>';
    html += '<button class="btn-action-mini" title="' + t('actionRelance') + '" onclick="triggerContactAction(' + compte.id + ', \'relance\')">⏰</button>';
    html += '</div>';
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

function closeModal() {
  var modalContainer = document.getElementById('modal-container');
  modalContainer.innerHTML = '';
  modalContainer.classList.add('hidden');
}

// --- Confirm modal (générique) ---
function showConfirmModal(message, title) {
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

// =============================================================================
// EXPORT CSV / PDF
// =============================================================================

function exportComptesToCsv() {
  var headers = ['Nom', 'Type', 'Statut', 'Priorité', 'Responsable', 'Montant', 'Total contrats signés', 'Prochaine action', 'Date prochaine action', 'Date de relance', 'Catégorie', 'Tag', 'Notes'];
  var rows = [headers.join(',')];
  comptes.forEach(function(c) {
    rows.push([
      escapeCsv(c.Name), escapeCsv(getAccountTypeLabel(c.Type)), escapeCsv(getStatusLabel(c.Status)), escapeCsv(t('priority' + capitalize(c.Priority))),
      escapeCsv(getEquipeMemberName(c.Responsible)), escapeCsv(c.Amount), escapeCsv(getSignedContractsTotal(c.id)),
      escapeCsv(c.Next_Action), escapeCsv(c.Next_Action_Date ? formatDate(c.Next_Action_Date) : ''),
      escapeCsv(c.Relance_Date ? formatDate(c.Relance_Date) : ''), escapeCsv(c.Category), escapeCsv(c.Tag), escapeCsv(c.Description)
    ].join(','));
  });
  var csv = '\uFEFF' + rows.join('\n');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'crm_export_' + new Date().toISOString().split('T')[0] + '.csv';
  link.click();
  showToast(t('exportCsv') + ' ✓', 'success');
}

function exportComptesToPdf() {
  if (!window.jspdf) {
    showToast(currentLang === 'fr' ? 'Librairie PDF non chargée' : 'PDF library not loaded', 'error');
    return;
  }
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  var pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.text(currentLang === 'fr' ? 'Export CRM — Comptes' : 'CRM Export — Accounts', 40, 36);
  doc.setFontSize(9);
  doc.text((currentLang === 'fr' ? 'Généré le ' : 'Generated on ') + new Date().toLocaleDateString('fr-FR'), 40, 52);

  var headers = ['Nom', 'Type', 'Statut', 'Priorité', 'Responsable', 'Montant', 'Prochaine action', 'Relance'];
  var colWidths = [140, 70, 100, 70, 110, 80, 200, 80];
  var startX = 40;
  var y = 80;
  var rowHeight = 18;

  function drawRow(values, isHeader) {
    var x = startX;
    doc.setFontSize(8);
    doc.setFont(undefined, isHeader ? 'bold' : 'normal');
    if (isHeader) { doc.setFillColor(241, 245, 249); doc.rect(startX, y - 12, colWidths.reduce(function(a, b) { return a + b; }, 0), rowHeight, 'F'); }
    values.forEach(function(v, i) {
      doc.text(String(v || ''), x + 4, y);
      x += colWidths[i];
    });
    y += rowHeight;
  }

  drawRow(headers, true);
  comptes.forEach(function(c) {
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 50; drawRow(headers, true); }
    drawRow([
      c.Name, getAccountTypeLabel(c.Type), getStatusLabel(c.Status), t('priority' + capitalize(c.Priority)),
      getEquipeMemberName(c.Responsible), formatAmount(c.Amount), c.Next_Action, c.Relance_Date ? formatDate(c.Relance_Date) : ''
    ], false);
  });

  doc.save('crm_export_' + new Date().toISOString().split('T')[0] + '.pdf');
  showToast(t('exportPdf') + ' ✓', 'success');
}

// =============================================================================
// IMPORT CSV
// =============================================================================

function triggerCsvImport() {
  var input = document.getElementById('csv-import-input');
  if (input) input.click();
}

function triggerExcelImport() {
  var input = document.getElementById('excel-import-input');
  if (input) input.click();
}

// Retrouve un membre d'équipe par nom (insensible à la casse), ou null si absent.
// Ne crée jamais de membre automatiquement : un import ne doit pas peupler l'équipe en silence.
function findEquipeIdByName(name) {
  if (!name) return 0;
  var n = String(name).trim().toLowerCase();
  var found = equipe.find(function(m) { return (m.Nom || '').toLowerCase() === n; });
  return found ? found.id : 0;
}

async function importComptesRows(rows) {
  if (rows.length < 2) { showToast(currentLang === 'fr' ? 'Fichier vide' : 'Empty file', 'error'); return; }
  var headerRow = rows[0].map(function(h) { return String(h || '').trim().toLowerCase(); });
  var nameIdx = headerRow.indexOf('nom') !== -1 ? headerRow.indexOf('nom') : headerRow.indexOf('name');
  if (nameIdx === -1) { showToast(currentLang === 'fr' ? 'Colonne "Nom" introuvable' : 'Column "Name" not found', 'error'); return; }

  var typeIdx = headerRow.indexOf('type');
  var respIdx = headerRow.indexOf('responsable') !== -1 ? headerRow.indexOf('responsable') : headerRow.indexOf('responsible');
  var amountIdx = headerRow.indexOf('montant') !== -1 ? headerRow.indexOf('montant') : headerRow.indexOf('amount');
  var catIdx = headerRow.indexOf('catégorie') !== -1 ? headerRow.indexOf('catégorie') : headerRow.indexOf('categorie');

  var unmatchedResponsibles = [];
  var records = [];
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (!row[nameIdx]) continue;
    var rec = {};
    setField(rec, 'comptes', 'name', row[nameIdx]);
    setField(rec, 'comptes', 'type', typeIdx !== -1 ? normalizeType(row[typeIdx]) : 'prospect');
    setField(rec, 'comptes', 'status', getKanbanStatuses()[0].key);
    setField(rec, 'comptes', 'priority', 'medium');
    if (respIdx !== -1 && row[respIdx]) {
      var respId = findEquipeIdByName(row[respIdx]);
      if (!respId) unmatchedResponsibles.push(row[respIdx]);
      setField(rec, 'comptes', 'responsible', respId);
    }
    if (amountIdx !== -1) setField(rec, 'comptes', 'amount', parseFloat(row[amountIdx]) || 0);
    if (catIdx !== -1) setField(rec, 'comptes', 'category', row[catIdx]);
    setField(rec, 'comptes', 'createdAt', Math.floor(Date.now() / 1000));
    rec.Email_Status = 'brouillon';
    records.push(rec);
  }

  if (records.length === 0) { showToast(currentLang === 'fr' ? 'Aucune ligne valide trouvée' : 'No valid row found', 'error'); return; }

  await grist.docApi.applyUserActions([
    ['BulkAddRecord', COMPTES_TABLE, records.map(function() { return null; }), records]
  ]);
  var msg = records.length + (currentLang === 'fr' ? ' fiches importées ✓' : ' records imported ✓');
  showToast(msg, 'success');
  if (unmatchedResponsibles.length) {
    var uniqueNames = unmatchedResponsibles.filter(function(v, idx, arr) { return arr.indexOf(v) === idx; });
    showToast((currentLang === 'fr' ? 'Responsables non reconnus (ajoutez-les dans Équipe) : ' : 'Unknown team members (add them in Team): ') + uniqueNames.join(', '), 'info');
  }
  await loadAllData();
}

function handleCsvImport(fileInput) {
  var file = fileInput.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = async function(e) {
    try {
      var rows = parseCsv(e.target.result);
      await importComptesRows(rows);
    } catch (err) {
      console.error('[CRM] CSV import error:', err);
      showToast((currentLang === 'fr' ? 'Erreur import : ' : 'Import error: ') + err.message, 'error');
    }
    fileInput.value = '';
  };
  reader.readAsText(file, 'UTF-8');
}

function handleExcelImport(fileInput) {
  var file = fileInput.files[0];
  if (!file) return;
  if (typeof XLSX === 'undefined') {
    showToast(currentLang === 'fr' ? 'Librairie Excel non chargée' : 'Excel library not loaded', 'error');
    fileInput.value = '';
    return;
  }
  var reader = new FileReader();
  reader.onload = async function(e) {
    try {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: 'array' });
      var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      var rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: '' });
      await importComptesRows(rows);
    } catch (err) {
      console.error('[CRM] Excel import error:', err);
      showToast((currentLang === 'fr' ? 'Erreur import : ' : 'Import error: ') + err.message, 'error');
    }
    fileInput.value = '';
  };
  reader.readAsArrayBuffer(file);
}

function normalizeType(v) {
  var s = (v || '').toLowerCase().trim();
  if (s.indexOf('client') === 0) return 'client';
  if (s.indexOf('ancien') === 0) return 'ancien';
  return 'prospect';
}

function parseCsv(text) {
  var rows = [];
  var row = [];
  var field = '';
  var inQuotes = false;
  text = text.replace(/^\uFEFF/, '');
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else { field += ch; }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch === '\r') { /* skip */ }
      else { field += ch; }
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(function(r) { return r.length > 1 || (r.length === 1 && r[0] !== ''); });
}

// =============================================================================
// SETTINGS VIEW — colonnes Kanban personnalisables + mapping
// =============================================================================

var draftKanbanStatuses = null;

function renderSettingsView() {
  var container = document.getElementById('settings-view');
  if (!container) return;
  if (!draftKanbanStatuses) draftKanbanStatuses = JSON.parse(JSON.stringify(getKanbanStatuses()));

  var html = '<div class="settings-row-2col">';

  // Bloc 1 — Colonnes du pipeline
  html += '<div class="settings-section">';
  html += '<h3>' + t('kanbanColumnsConfig') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Personnalisez les étapes de votre pipeline commercial (nom et couleur).' : 'Customize your pipeline stages.') + '</p>';
  html += '<p class="settings-hint">🤝 = ' + (currentLang === 'fr' ? 'convertit le prospect en client' : 'converts prospect to client') + ' · 🚫 = ' + (currentLang === 'fr' ? 'sans suite (arrête les relances)' : 'no follow-up (stops reminders)') + '</p>';
  html += '<div id="kanban-status-list">' + renderKanbanStatusList() + '</div>';
  html += '<button class="btn btn-secondary" onclick="addKanbanStatusDraft()">+ ' + (currentLang === 'fr' ? 'Ajouter une étape' : 'Add a stage') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitKanbanStatuses()">' + t('save') + '</button>';
  html += '<div class="add-form" style="margin-top:14px;padding-top:12px;border-top:2px solid var(--color-bg-soft);">';
  html += '<label class="form-field" style="flex:1;"><span>' + (currentLang === 'fr'
    ? 'Masquer du Kanban les clients convertis depuis plus de (jours)'
    : 'Hide converted clients from Kanban after (days)') + '</span>';
  html += '<input id="kanban-hide-client-days-input" type="number" min="0" value="' + getKanbanHideClientDays() + '" style="width:100px;"></label>';
  html += '<button class="btn btn-primary" onclick="commitKanbanHideClientDays()">' + t('save') + '</button>';
  html += '</div>';
  html += '</div>';

  // Bloc 2 — Types de comptes
  if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Types de comptes' : 'Account types') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Renommez les types existants ou ajoutez-en de nouveaux. Les 3 types de base ne peuvent pas être supprimés.'
    : 'Rename existing types or add new ones. The 3 base types cannot be deleted.') + '</p>';
  html += '<div id="account-type-list">' + renderAccountTypeList() + '</div>';
  html += '<button class="btn btn-secondary" onclick="addAccountTypeDraft()">+ ' + (currentLang === 'fr' ? 'Ajouter un type' : 'Add a type') + '</button>';
  html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitAccountTypes()">' + t('save') + '</button>';
  html += '</div>';

  html += '</div>'; // fin .settings-row-2col

  html += '<div class="settings-row-2col">';

  // Bloc 3 — Prochaines actions Prospect
  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Actions — Prospects' : 'Actions — Prospects') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Actions disponibles pour un prospect, avec délai de relance (en jours) si aucune réponse.'
    : 'Available actions for a prospect, with follow-up delay (days) if no response.') + '</p>';
  html += '<div id="next-actions-list-prospect">' + renderNextActionsList('prospect') + '</div>';
  html += '<button class="btn btn-primary" onclick="addNextActionDraft(\'prospect\')">+ ' + (currentLang === 'fr' ? 'Ajouter une action' : 'Add an action') + '</button>';
  html += '</div>';

  // Bloc 4 — Prochaines actions Client
  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Actions — Clients' : 'Actions — Clients') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Actions disponibles pour un client (ou ancien client), avec délai de relance (en jours).'
    : 'Available actions for a client (or former client), with follow-up delay (days).') + '</p>';
  html += '<div id="next-actions-list-client">' + renderNextActionsList('client') + '</div>';
  html += '<button class="btn btn-primary" onclick="addNextActionDraft(\'client\')">+ ' + (currentLang === 'fr' ? 'Ajouter une action' : 'Add an action') + '</button>';
  html += '</div>';

  html += '</div>'; // fin .settings-row-2col

  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Équipe' : 'Team') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Gérez les membres pouvant être Responsables d\u2019un compte ou assignés à une tâche.' : 'Manage members who can be Account owners or task assignees.') + '</p>';
  html += '<div class="sub-list">';
  equipe.forEach(function(m) {
    html += '<div class="sub-item">';
    html += '<div class="sub-item-main"><strong>' + sanitize(m.Nom) + '</strong>';
    if (m.Role) html += ' <span class="badge-primary">' + sanitize(m.Role) + '</span>';
    if (m.Email) html += '<div class="sub-item-detail">' + sanitize(m.Email) + '</div>';
    html += '</div>';
    if (isOwner) html += '<div class="sub-item-actions"><button class="btn-icon" onclick="deleteEquipeMember(' + m.id + ')" title="' + t('delete') + '">🗑️</button></div>';
    html += '</div>';
  });
  if (equipe.length === 0) html += '<div class="empty-state">' + (currentLang === 'fr' ? 'Aucun membre pour le moment' : 'No member yet') + '</div>';
  html += '</div>';
  html += '<div class="add-form">';
  html += '<input id="new-equipe-name" type="text" placeholder="' + (currentLang === 'fr' ? 'Nom *' : 'Name *') + '">';
  html += '<input id="new-equipe-email" type="email" placeholder="Email">';
  html += '<select id="new-equipe-role" onchange="handleEquipeRoleSelectChange(this)">' + buildEquipeRoleOptions(null) + '</select>';
  html += '<input id="new-equipe-role-custom" type="text" class="hidden" placeholder="' + (currentLang === 'fr' ? 'Nom du nouveau rôle' : 'New role name') + '">';
  html += '<button class="btn btn-primary" onclick="addEquipeMember()">+ ' + (currentLang === 'fr' ? 'Ajouter un membre' : 'Add member') + '</button>';
  html += '</div>';
  html += '</div>';

  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Ajouter un champ personnalisé' : 'Add a custom field') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Ajoute une nouvelle colonne directement dans une table Grist du CRM.' : 'Adds a new column directly to a CRM Grist table.') + '</p>';
  html += '<div class="add-form">';
  html += '<select id="new-field-table">';
  html += '<option value="' + COMPTES_TABLE + '">' + (currentLang === 'fr' ? 'Comptes' : 'Accounts') + '</option>';
  html += '<option value="' + CONTACTS_TABLE + '">' + (currentLang === 'fr' ? 'Contacts' : 'Contacts') + '</option>';
  html += '<option value="' + CONTRATS_TABLE + '">' + (currentLang === 'fr' ? 'Contrats' : 'Contracts') + '</option>';
  html += '<option value="' + TACHES_TABLE + '">' + (currentLang === 'fr' ? 'Tâches' : 'Tasks') + '</option>';
  html += '</select>';
  html += '<input id="new-field-name" type="text" placeholder="' + (currentLang === 'fr' ? 'Nom du champ' : 'Field name') + '">';
  html += '<select id="new-field-type">';
  html += '<option value="Text">' + (currentLang === 'fr' ? 'Texte' : 'Text') + '</option>';
  html += '<option value="Numeric">' + (currentLang === 'fr' ? 'Nombre' : 'Number') + '</option>';
  html += '<option value="Date">Date</option>';
  html += '<option value="Bool">' + (currentLang === 'fr' ? 'Case à cocher' : 'Checkbox') + '</option>';
  html += '</select>';
  html += '<button class="btn btn-primary" onclick="addCustomField()">+ ' + (currentLang === 'fr' ? 'Ajouter le champ' : 'Add field') + '</button>';
  html += '</div>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'Le champ sera visible et modifiable directement dans la table Grist correspondante (le widget n\u2019affiche pour le moment que ses champs prédéfinis).' : 'The field will be visible and editable directly in the corresponding Grist table.') + '</p>';
  html += '</div>';

  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Modèles d\u2019email' : 'Email templates') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Personnalisez le sujet et le corps des emails ouverts par les boutons d\u2019action. Variables disponibles : <code>{contact}</code>, <code>{compte}</code>, <code>{responsable}</code>, <code>{montant}</code>.'
    : 'Customize the subject and body opened by the action buttons. Available variables: <code>{contact}</code>, <code>{compte}</code>, <code>{responsable}</code>, <code>{montant}</code>.') + '</p>';
  html += renderEmailTemplateEditor('relance', currentLang === 'fr' ? 'Relance' : 'Follow-up');
  html += renderEmailTemplateEditor('contrat', currentLang === 'fr' ? 'Envoi de contrat' : 'Send contract');
  html += renderEmailTemplateEditor('generique', currentLang === 'fr' ? 'Email générique' : 'Generic email');
  html += renderEmailTemplateEditor('prospection', currentLang === 'fr' ? 'Prospection' : 'Prospecting');
  html += '<button class="btn btn-primary" onclick="commitEmailTemplates()">' + t('save') + '</button>';
  html += '</div>';

  html += '<div class="settings-section">';
  html += '<h3>' + (currentLang === 'fr' ? 'Automatisation (avancé)' : 'Automation (advanced)') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr'
    ? 'Optionnel : envoyez automatiquement chaque action (email, relance, contrat) vers un service externe (ex. n8n, Power Automate) qui se chargera de l\u2019envoi réel. Laissez vide pour continuer à utiliser uniquement votre client mail (mailto).'
    : 'Optional: forward each action to an external service (e.g. n8n, Power Automate) that handles real sending. Leave empty to keep using your mail client only (mailto).') + '</p>';
  html += '<div class="add-form">';
  html += '<input id="webhook-url-input" type="text" placeholder="https://votre-service.exemple.com/webhook" value="' + sanitize(getWebhookUrl()) + '" style="flex:1;min-width:300px;">';
  html += '<button class="btn btn-primary" onclick="commitWebhookUrl()">' + t('save') + '</button>';
  html += '</div>';
  html += '<p class="settings-hint" style="margin-top:10px;">' + (currentLang === 'fr'
    ? 'Colonnes de file d’attente (Email_Status, Email_Sujet, Email_Corps, Email_Destinataire) absentes sur CRM_Comptes ? Forcez leur création :'
    : 'Queue columns (Email_Status, Email_Sujet, Email_Corps, Email_Destinataire) missing on CRM_Comptes? Force creation:') + '</p>';
  html += '<button class="btn btn-secondary" onclick="retryEmailQueueMigration()">' + (currentLang === 'fr' ? 'Vérifier / créer les colonnes' : 'Check / create columns') + '</button>';
  html += '</div>';

  html += '<div class="settings-section">';
  html += '<h3>' + t('mappingConfig') + '</h3>';
  html += '<p class="settings-hint">' + (currentLang === 'fr' ? 'La table CRM_Configuration définit la correspondance entre les champs du widget et vos colonnes Grist. Modifiable directement dans cette table.' : 'Edit CRM_Configuration table directly to remap columns.') + '</p>';
  html += '<table class="data-table"><thead><tr><th>' + (currentLang === 'fr' ? 'Champ' : 'Field') + '</th><th>' + (currentLang === 'fr' ? 'Table' : 'Table') + '</th><th>' + (currentLang === 'fr' ? 'Colonne' : 'Column') + '</th></tr></thead><tbody>';
  ['comptes', 'contacts', 'contrats', 'equipe'].forEach(function(entity) {
    Object.keys(columnMapping[entity]).forEach(function(field) {
      var tableName = entity === 'comptes' ? COMPTES_TABLE : (entity === 'contacts' ? CONTACTS_TABLE : (entity === 'contrats' ? CONTRATS_TABLE : EQUIPE_TABLE));
      html += '<tr><td>' + entity + '.' + field + '</td><td>' + tableName + '</td><td>' + columnMapping[entity][field] + '</td></tr>';
    });
  });
  html += '</tbody></table>';
  html += '</div>';

  container.innerHTML = html;
}

async function addCustomField() {
  var tableName = getVal('new-field-table', COMPTES_TABLE);
  var fieldName = getVal('new-field-name', '').trim();
  var fieldType = getVal('new-field-type', 'Text');
  if (!fieldName) { showToast(currentLang === 'fr' ? 'Indiquez un nom de champ' : 'Enter a field name', 'error'); return; }

  var cleanName = fieldName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
  if (!cleanName) { showToast(currentLang === 'fr' ? 'Nom de champ invalide' : 'Invalid field name', 'error'); return; }

  try {
    var existingCols = Object.keys(await grist.docApi.fetchTable(tableName));
    if (existingCols.indexOf(cleanName) !== -1) {
      showToast(currentLang === 'fr' ? 'Ce champ existe déjà' : 'This field already exists', 'error');
      return;
    }
    await grist.docApi.applyUserActions([['AddColumn', tableName, cleanName, { type: fieldType, label: fieldName }]]);
    showToast((currentLang === 'fr' ? 'Champ "' + fieldName + '" ajouté à ' + tableName : 'Field added'), 'success');
    document.getElementById('new-field-name').value = '';
  } catch (e) {
    console.error('[CRM] Error adding custom field:', e);
    showToast('Erreur : ' + e.message, 'error');
  }
}

// =============================================================================
// EMAIL TEMPLATES EDITOR (Paramètres)
// =============================================================================

var draftEmailTemplates = null;

function renderEmailTemplateEditor(key, label) {
  if (!draftEmailTemplates) draftEmailTemplates = JSON.parse(JSON.stringify(getEmailTemplates()));
  var tpl = draftEmailTemplates[key];
  var html = '<div class="email-template-block">';
  html += '<h4>' + sanitize(label) + '</h4>';
  html += '<label class="form-field"><span>' + (currentLang === 'fr' ? 'Sujet' : 'Subject') + '</span>';
  html += '<input type="text" value="' + sanitize(tpl.subject) + '" onchange="updateEmailTemplateDraft(\'' + key + '\', \'subject\', this.value)"></label>';
  html += '<label class="form-field"><span>' + (currentLang === 'fr' ? 'Corps du message' : 'Body') + '</span>';
  html += '<textarea rows="4" onchange="updateEmailTemplateDraft(\'' + key + '\', \'body\', this.value)">' + sanitize(tpl.body) + '</textarea></label>';
  html += '</div>';
  return html;
}

function updateEmailTemplateDraft(key, field, value) {
  if (!draftEmailTemplates) draftEmailTemplates = JSON.parse(JSON.stringify(getEmailTemplates()));
  draftEmailTemplates[key][field] = value;
}

async function commitEmailTemplates() {
  if (!draftEmailTemplates) return;
  customEmailTemplates = draftEmailTemplates;
  await saveEmailTemplates();
  showToast(currentLang === 'fr' ? 'Modèles enregistrés' : 'Templates saved', 'success');
}

async function commitWebhookUrl() {
  var url = getVal('webhook-url-input', '').trim();
  await saveWebhookUrl(url);
  showToast(currentLang === 'fr' ? 'Webhook enregistré' : 'Webhook saved', 'success');
}

function renderKanbanStatusList() {
  var html = '';
  draftKanbanStatuses.forEach(function(s, i) {
    html += '<div class="kanban-status-edit-row" draggable="true" data-index="' + i + '" ondragstart="onStatusDragStart(event, ' + i + ')" ondragover="onStatusDragOver(event)" ondrop="onStatusDrop(event, ' + i + ')" ondragend="onStatusDragEnd(event)">';
    html += '<span class="drag-handle" title="' + (currentLang === 'fr' ? 'Glisser pour réordonner' : 'Drag to reorder') + '">⠿</span>';
    html += '<input type="color" value="' + s.color + '" onchange="updateKanbanStatusDraft(' + i + ', \'color\', this.value)">';
    html += '<input type="text" value="' + sanitize(s.label) + '" onchange="updateKanbanStatusDraft(' + i + ', \'label\', this.value)">';
    html += '<label class="stage-flag-check" title="' + (currentLang === 'fr' ? 'Convertit automatiquement le prospect en client' : 'Automatically converts prospect to client') + '"><input type="checkbox" ' + (s.marksAsClient ? 'checked' : '') + ' onchange="updateKanbanStatusFlag(' + i + ', \'marksAsClient\', this.checked)"> 🤝</label>';
    html += '<label class="stage-flag-check" title="' + (currentLang === 'fr' ? 'Sans suite : arrête les relances et prochaines actions' : 'No follow-up: stops reminders and next actions') + '"><input type="checkbox" ' + (s.stopFollowUp ? 'checked' : '') + ' onchange="updateKanbanStatusFlag(' + i + ', \'stopFollowUp\', this.checked)"> 🚫</label>';
    html += '<button class="btn-icon" onclick="removeKanbanStatusDraft(' + i + ')">🗑️</button>';
    html += '</div>';
  });
  return html;
}

var draggedStatusIndex = null;

function onStatusDragStart(e, index) {
  draggedStatusIndex = index;
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
}

function onStatusDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over-row');
}

function onStatusDragEnd(e) {
  document.querySelectorAll('.kanban-status-edit-row').forEach(function(el) {
    el.classList.remove('dragging', 'drag-over-row');
  });
}

function onStatusDrop(e, targetIndex) {
  e.preventDefault();
  document.querySelectorAll('.kanban-status-edit-row').forEach(function(el) { el.classList.remove('drag-over-row'); });
  if (draggedStatusIndex === null || draggedStatusIndex === targetIndex) return;

  var moved = draftKanbanStatuses.splice(draggedStatusIndex, 1)[0];
  draftKanbanStatuses.splice(targetIndex, 0, moved);
  draggedStatusIndex = null;

  document.getElementById('kanban-status-list').innerHTML = renderKanbanStatusList();
}

function updateKanbanStatusDraft(index, field, value) {
  draftKanbanStatuses[index][field] = value;
  if (field === 'label') {
    draftKanbanStatuses[index].key = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || ('stage_' + index);
  }
}

function updateKanbanStatusFlag(index, flag, checked) {
  draftKanbanStatuses[index][flag] = checked;
}

function addKanbanStatusDraft() {
  draftKanbanStatuses.push({ key: 'stage_' + draftKanbanStatuses.length, label: currentLang === 'fr' ? 'Nouvelle étape' : 'New stage', color: '#64748b' });
  document.getElementById('kanban-status-list').innerHTML = renderKanbanStatusList();
}

function removeKanbanStatusDraft(index) {
  draftKanbanStatuses.splice(index, 1);
  document.getElementById('kanban-status-list').innerHTML = renderKanbanStatusList();
}

async function commitKanbanStatuses() {
  customKanbanStatuses = draftKanbanStatuses;
  await saveKanbanStatuses();
  await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName('comptes', 'status'), customKanbanStatuses);
  showToast(currentLang === 'fr' ? 'Pipeline mis à jour' : 'Pipeline updated', 'success');
  refreshAllViews();
}

// =============================================================================
// VIEW SWITCHING
// =============================================================================

var currentTab = 'kanban';

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
  });
  document.querySelectorAll('.tab-content').forEach(function(el) {
    el.classList.toggle('active', el.id === 'tab-' + tab);
  });
  refreshAllViews();
  try { localStorage.setItem('crm-active-tab', tab); } catch (e) {}
}

function restoreActiveTab() {
  try {
    var saved = localStorage.getItem('crm-active-tab');
    if (saved) {
      currentTab = saved;
      document.querySelectorAll('.tab-btn').forEach(function(btn) { btn.classList.toggle('active', btn.getAttribute('data-tab') === saved); });
      document.querySelectorAll('.tab-content').forEach(function(el) { el.classList.toggle('active', el.id === 'tab-' + saved); });
    }
  } catch (e) {}
}

function refreshAllViews() {
  refreshTypeSelects();
  updateStatsBadges();
  if (currentTab === 'kanban') renderKanbanView();
  else if (currentTab === 'table') renderTableView();
  else if (currentTab === 'relances') renderRelancesView();
  else if (currentTab === 'stats') renderStatsView();
  else if (currentTab === 'carte') renderCarteView();
  else if (currentTab === 'settings') renderSettingsView();
}

function updateStatsBadges() {
  var relanceLateBadge = document.getElementById('relance-late-badge');
  var lateComptes = comptes.filter(isRelanceOverdue);
  if (relanceLateBadge) {
    var count = lateComptes.length;
    relanceLateBadge.textContent = count > 0 ? count : '';
    relanceLateBadge.classList.toggle('hidden', count === 0);
  }
  renderRelanceBanner(lateComptes);
}

function renderRelanceBanner(lateComptes) {
  var container = document.getElementById('relance-banner-container');
  if (!container) return;

  var soonComptes = comptes.filter(isRelanceUpcoming);

  if (lateComptes.length === 0 && soonComptes.length === 0) {
    container.innerHTML = '';
    return;
  }

  var isLate = lateComptes.length > 0;
  var list = isLate ? lateComptes : soonComptes;
  var names = list.slice(0, 3).map(function(c) { return c.Name; }).join(', ');
  var extra = list.length > 3 ? (currentLang === 'fr' ? ' et ' + (list.length - 3) + ' autre(s)' : ' and ' + (list.length - 3) + ' more') : '';

  var text = isLate
    ? (currentLang === 'fr'
        ? lateComptes.length + ' relance' + (lateComptes.length > 1 ? 's' : '') + ' en retard : ' + names + extra
        : lateComptes.length + ' overdue follow-up(s): ' + names + extra)
    : (currentLang === 'fr'
        ? soonComptes.length + ' relance' + (soonComptes.length > 1 ? 's' : '') + ' à venir cette semaine : ' + names + extra
        : soonComptes.length + ' upcoming follow-up(s) this week: ' + names + extra);

  var html = '<div class="relance-banner ' + (isLate ? 'late' : '') + '" onclick="switchTab(\'relances\')">';
  html += '<span class="relance-banner-icon">' + (isLate ? '🔴' : '🟡') + '</span>';
  html += '<span class="relance-banner-text">' + sanitize(text) + '</span>';
  html += '<span class="relance-banner-link">' + (currentLang === 'fr' ? 'Voir les relances →' : 'View follow-ups →') + '</span>';
  html += '</div>';
  container.innerHTML = html;
}

// =============================================================================
// INIT
// =============================================================================

if (!isInsideGrist()) {
  document.getElementById('not-in-grist').classList.remove('hidden');
  document.getElementById('main-content').classList.add('hidden');
} else {
  (async function() {
    await grist.ready({ requiredAccess: 'full' });

    // --- Role detection (Owner / Editor / Viewer), même méthode que le widget PM ---
    var USER_INFO_TABLE = 'CRM_UserInfo';
    var helperWriteSucceeded = false;

    try {
      var existingTabs = await grist.docApi.listTables();
      if (existingTabs.indexOf(USER_INFO_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ['AddTable', USER_INFO_TABLE, [{ id: 'UserEmail', fields: { type: 'Text', label: 'UserEmail' } }]]
        ]);
        await grist.docApi.applyUserActions([
          ['ModifyColumn', USER_INFO_TABLE, 'UserEmail', { isFormula: false, formula: 'user.Email', recalcWhen: 2, recalcDeps: null }]
        ]);
      }
    } catch (e) {
      console.warn('[CRM] Could not create helper table:', e.message);
    }

    try {
      try {
        var existingData = await grist.docApi.fetchTable(USER_INFO_TABLE);
        var rowIds = (existingData && existingData.id) ? existingData.id : [];
        var actions = [];
        for (var r = 0; r < rowIds.length; r++) actions.push(['RemoveRecord', USER_INFO_TABLE, rowIds[r]]);
        actions.push(['AddRecord', USER_INFO_TABLE, null, {}]);
        await grist.docApi.applyUserActions(actions);
        helperWriteSucceeded = true;
      } catch (writeErr) {
        console.log('[CRM] Could not refresh row (read-only?):', writeErr.message);
      }

      var tokenInfo = await grist.docApi.getAccessToken({ readOnly: true });
      var tableResp = await fetch(tokenInfo.baseUrl + '/tables/' + USER_INFO_TABLE + '/records?auth=' + tokenInfo.token);
      if (tableResp.ok) {
        var tableData = await tableResp.json();
        if (tableData.records && tableData.records.length > 0) {
          currentUserEmail = tableData.records[0].fields.UserEmail || '';
        }
      } else {
        var userInfoData = await grist.docApi.fetchTable(USER_INFO_TABLE);
        if (userInfoData && userInfoData.UserEmail && userInfoData.UserEmail.length > 0) {
          currentUserEmail = userInfoData.UserEmail[0] || '';
        }
      }
    } catch (e) {
      console.warn('[CRM] Could not read helper table:', e.message);
    }

    var roleDetected = false;
    try {
      await grist.docApi.applyUserActions([
        ['ModifyColumn', USER_INFO_TABLE, 'UserEmail', { isFormula: false, formula: 'user.Email', recalcWhen: 2, recalcDeps: null }]
      ]);
      isOwner = true; isEditor = false; roleDetected = true;
    } catch (structErr) {
      if (helperWriteSucceeded) { isOwner = false; isEditor = true; roleDetected = true; }
      else { isOwner = false; isEditor = false; roleDetected = true; }
    }
    if (!roleDetected) {
      if (helperWriteSucceeded) { isOwner = false; isEditor = true; }
      else { isOwner = false; isEditor = false; }
    }
    console.log('[CRM] Role detection — isOwner:', isOwner, 'isEditor:', isEditor, 'email:', currentUserEmail);

    await ensureTables();
    await loadSettings();
    await loadAllData();
    restoreActiveTab();

    // Synchro live : recharge si la table change ailleurs (autre utilisateur, édition directe Grist)
    if (typeof grist.onRecords === 'function') {
      var _liveReloadTimer = null;
      grist.onRecords(function() {
        if (_liveReloadTimer) clearTimeout(_liveReloadTimer);
        _liveReloadTimer = setTimeout(function() {
          var modal = document.getElementById('modal-container');
          if (modal && modal.innerHTML.trim() !== '') return;
          loadAllData();
        }, 500);
      });
    }
  })();
}
