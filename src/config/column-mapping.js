// Mapping champ logique -> nom de colonne Grist réel (cf. GUIDE_MAPPING.md).
// Mutée en place (columnMapping.comptes.name = 'AutreColonne') par
// loadColumnMapping() lorsque CRM_Configuration remappe des colonnes —
// jamais réaffectée dans son ensemble, donc sûre à partager entre modules.

import { CONFIG_TABLE, applyTableMapping } from './tables.js';

export var columnMapping = {
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

// Recharge le mapping depuis CRM_Configuration (permet à l'utilisateur de
// remapper le widget sur des tables/colonnes Grist existantes — cf. GUIDE_MAPPING.md).
export async function loadColumnMapping() {
  try {
    var configData = await grist.docApi.fetchTable(CONFIG_TABLE);
    if (!configData || !configData.Cle_Config) return;

    var toCamel = function(s) { return s.replace(/_([a-z])/g, function(_, c) { return c.toUpperCase(); }); };
    var tableNames = {};

    for (var i = 0; i < configData.Cle_Config.length; i++) {
      var key = configData.Cle_Config[i];
      var columnName = configData.Nom_Colonne[i];
      var tableName = configData.Nom_Table ? configData.Nom_Table[i] : '';

      if (key.indexOf('compte_') === 0) {
        var field = toCamel(key.slice(7));
        if (columnMapping.comptes[field] !== undefined) columnMapping.comptes[field] = columnName;
        if (tableName) tableNames.comptes = tableName;
      } else if (key.indexOf('contact_') === 0) {
        var field2 = toCamel(key.slice(8));
        if (columnMapping.contacts[field2] !== undefined) columnMapping.contacts[field2] = columnName;
        if (tableName) tableNames.contacts = tableName;
      } else if (key.indexOf('contract_') === 0) {
        var field3 = toCamel(key.slice(9));
        if (columnMapping.contrats[field3] !== undefined) columnMapping.contrats[field3] = columnName;
        if (tableName) tableNames.contrats = tableName;
      } else if (key.indexOf('equipe_') === 0) {
        var field4 = toCamel(key.slice(7));
        if (columnMapping.equipe[field4] !== undefined) columnMapping.equipe[field4] = columnName;
        if (tableName) tableNames.equipe = tableName;
      }
    }

    applyTableMapping(tableNames);
  } catch (e) {
    console.log('[CRM] CRM_Configuration not available yet');
  }
}

export function getColumnName(entity, field) {
  return (columnMapping[entity] && columnMapping[entity][field]) || field;
}

export function setField(record, entity, field, value) {
  var col = getColumnName(entity, field);
  record[col] = value;
}
