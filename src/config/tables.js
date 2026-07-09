// Noms des tables Grist utilisées par le widget (personnalisables via mapping,
// cf. CRM_Configuration / GUIDE_MAPPING.md). Réaffectées par applyTableMapping()
// si l'utilisateur remappe une table dans CRM_Configuration.Nom_Table ; les
// constantes DEFAULT_*_TABLE gardent la valeur d'origine pour qu'ensureTables()
// puisse détecter si une table a été remappée (et donc ne pas la recréer).

export var COMPTES_TABLE = 'CRM_Comptes';
export var CONTACTS_TABLE = 'CRM_Contacts';
export var CONTRATS_TABLE = 'CRM_Contrats';
export var COMMENTAIRES_TABLE = 'CRM_Commentaires';
export var TACHES_TABLE = 'CRM_Taches';
export var EQUIPE_TABLE = 'CRM_Equipe';
export var CONFIG_TABLE = 'CRM_Configuration';
export var PARAMETRES_TABLE = 'CRM_Parametres';
export var JOURNAL_TABLE = 'CRM_JournalActivite';

export var DEFAULT_COMPTES_TABLE = 'CRM_Comptes';
export var DEFAULT_CONTACTS_TABLE = 'CRM_Contacts';
export var DEFAULT_CONTRATS_TABLE = 'CRM_Contrats';
export var DEFAULT_EQUIPE_TABLE = 'CRM_Equipe';

// Réaffecte les tables comptes/contacts/contrats/équipe d'après CRM_Configuration.Nom_Table
// (cf. GUIDE_MAPPING.md). Appelé par loadColumnMapping() avant toute décision de création
// dans ensureTables(), pour que la comparaison à DEFAULT_*_TABLE reflète le vrai mapping.
export function applyTableMapping(names) {
  if (names.comptes) COMPTES_TABLE = names.comptes;
  if (names.contacts) CONTACTS_TABLE = names.contacts;
  if (names.contrats) CONTRATS_TABLE = names.contrats;
  if (names.equipe) EQUIPE_TABLE = names.equipe;
}
