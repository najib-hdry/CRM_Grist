// État global partagé du widget. Les tableaux sont mutés en place (jamais
// réaffectés — voir data/load.js une fois extrait) : les modules qui les
// importent voient toujours leur contenu à jour. Les primitives réaffectées
// (rôle utilisateur, filtres, onglet actif...) passent par des setters
// dédiés, seule façon correcte de partager une valeur mutable entre modules
// ES — un import ne peut jamais être réaffecté directement depuis l'extérieur
// du module qui le déclare.

export var comptes = [];
export var contacts = [];
export var contracts = [];
export var equipe = [];
export var crmComments = [];
export var crmTasks = [];
export var activityLog = [];

export var currentFilterType = null;       // null | 'client' | 'prospect' | 'ancien'
export var currentFilterPriority = null;
export var currentFilterCategory = null;
export var currentFilterTag = null;
export var kanbanSearch = '';
export var kanbanShowAll = false;

export var isOwner = false;
export var isEditor = false;
export var currentUserEmail = '';

export var currentTab = 'kanban';

export function setRole(owner, editor) {
  isOwner = owner;
  isEditor = editor;
}

export function setCurrentUserEmail(email) {
  currentUserEmail = email;
}

export function setCurrentFilterType(value) {
  currentFilterType = value;
}

export function setCurrentFilterCategory(value) {
  currentFilterCategory = value;
}

export function setKanbanSearchState(value) {
  kanbanSearch = value;
}

export function setKanbanShowAllState(value) {
  kanbanShowAll = value;
}

export function setCurrentTab(tab) {
  currentTab = tab;
}
