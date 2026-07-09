(() => {
  // src/utils/dates.js
  function todayEpoch() {
    var d = /* @__PURE__ */ new Date();
    d.setHours(0, 0, 0, 0);
    return Math.floor(d.getTime() / 1e3);
  }
  function daysFromNow(epoch) {
    if (!epoch) return null;
    return Math.round((epoch - todayEpoch()) / 86400);
  }
  function toEpoch(dateStr) {
    if (!dateStr) return null;
    var d = /* @__PURE__ */ new Date(dateStr + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    return Math.floor(d.getTime() / 1e3);
  }
  function formatDate(epoch) {
    if (!epoch) return "";
    var d = new Date(epoch * 1e3);
    return d.toLocaleDateString("fr-FR");
  }
  function epochToInputDate(epoch) {
    if (!epoch) return "";
    var d = new Date(epoch * 1e3);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }
  function addDaysToDateInput(dateStr, days) {
    if (!dateStr) return "";
    var parts = dateStr.split("-").map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    d.setUTCDate(d.getUTCDate() + days);
    var y = d.getUTCFullYear();
    var m = String(d.getUTCMonth() + 1).padStart(2, "0");
    var day = String(d.getUTCDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  // src/utils/format.js
  function sanitize(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function formatAmount(n) {
    if (n === null || n === void 0 || n === "") return "\u2014";
    return Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " \u20AC";
  }
  function escapeCsv(val) {
    if (val === null || val === void 0) return "";
    var s = String(val);
    if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }
  function sanitizeFilename(s) {
    return String(s || "export").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
  }
  function capitalize(s) {
    if (!s) return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function slugifyTypeKey(label) {
    return (label || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "type";
  }

  // src/utils/geo.js
  var DEPARTEMENTS_FR = {
    "01": "Ain",
    "02": "Aisne",
    "03": "Allier",
    "04": "Alpes-de-Haute-Provence",
    "05": "Hautes-Alpes",
    "06": "Alpes-Maritimes",
    "07": "Ard\xE8che",
    "08": "Ardennes",
    "09": "Ari\xE8ge",
    "10": "Aube",
    "11": "Aude",
    "12": "Aveyron",
    "13": "Bouches-du-Rh\xF4ne",
    "14": "Calvados",
    "15": "Cantal",
    "16": "Charente",
    "17": "Charente-Maritime",
    "18": "Cher",
    "19": "Corr\xE8ze",
    "2A": "Corse-du-Sud",
    "2B": "Haute-Corse",
    "21": "C\xF4te-d\u2019Or",
    "22": "C\xF4tes-d\u2019Armor",
    "23": "Creuse",
    "24": "Dordogne",
    "25": "Doubs",
    "26": "Dr\xF4me",
    "27": "Eure",
    "28": "Eure-et-Loir",
    "29": "Finist\xE8re",
    "30": "Gard",
    "31": "Haute-Garonne",
    "32": "Gers",
    "33": "Gironde",
    "34": "H\xE9rault",
    "35": "Ille-et-Vilaine",
    "36": "Indre",
    "37": "Indre-et-Loire",
    "38": "Is\xE8re",
    "39": "Jura",
    "40": "Landes",
    "41": "Loir-et-Cher",
    "42": "Loire",
    "43": "Haute-Loire",
    "44": "Loire-Atlantique",
    "45": "Loiret",
    "46": "Lot",
    "47": "Lot-et-Garonne",
    "48": "Loz\xE8re",
    "49": "Maine-et-Loire",
    "50": "Manche",
    "51": "Marne",
    "52": "Haute-Marne",
    "53": "Mayenne",
    "54": "Meurthe-et-Moselle",
    "55": "Meuse",
    "56": "Morbihan",
    "57": "Moselle",
    "58": "Ni\xE8vre",
    "59": "Nord",
    "60": "Oise",
    "61": "Orne",
    "62": "Pas-de-Calais",
    "63": "Puy-de-D\xF4me",
    "64": "Pyr\xE9n\xE9es-Atlantiques",
    "65": "Hautes-Pyr\xE9n\xE9es",
    "66": "Pyr\xE9n\xE9es-Orientales",
    "67": "Bas-Rhin",
    "68": "Haut-Rhin",
    "69": "Rh\xF4ne",
    "70": "Haute-Sa\xF4ne",
    "71": "Sa\xF4ne-et-Loire",
    "72": "Sarthe",
    "73": "Savoie",
    "74": "Haute-Savoie",
    "75": "Paris",
    "76": "Seine-Maritime",
    "77": "Seine-et-Marne",
    "78": "Yvelines",
    "79": "Deux-S\xE8vres",
    "80": "Somme",
    "81": "Tarn",
    "82": "Tarn-et-Garonne",
    "83": "Var",
    "84": "Vaucluse",
    "85": "Vend\xE9e",
    "86": "Vienne",
    "87": "Haute-Vienne",
    "88": "Vosges",
    "89": "Yonne",
    "90": "Territoire de Belfort",
    "91": "Essonne",
    "92": "Hauts-de-Seine",
    "93": "Seine-Saint-Denis",
    "94": "Val-de-Marne",
    "95": "Val-d\u2019Oise",
    "971": "Guadeloupe",
    "972": "Martinique",
    "973": "Guyane",
    "974": "La R\xE9union",
    "976": "Mayotte"
  };
  function getDepartementFromZip(zip) {
    if (!zip) return null;
    zip = String(zip).trim();
    if (zip.length < 2) return null;
    if (zip.indexOf("97") === 0 || zip.indexOf("98") === 0) return zip.slice(0, 3);
    if (zip.indexOf("20") === 0) {
      var n = parseInt(zip, 10);
      return n >= 20200 ? "2B" : "2A";
    }
    return zip.slice(0, 2);
  }
  function getDepartementLabel(code) {
    return DEPARTEMENTS_FR[code] ? code + " \u2014 " + DEPARTEMENTS_FR[code] : code;
  }
  function getCompteDepartement(c) {
    return c.Departement || getDepartementFromZip(c.Address_Zip) || "";
  }

  // src/utils/colors.js
  function getTextColorForBackground(color) {
    var r, g, b;
    var rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(color);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1], 10);
      g = parseInt(rgbMatch[2], 10);
      b = parseInt(rgbMatch[3], 10);
    } else if (color && color.charAt(0) === "#") {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return "#1a1a1a";
    }
    var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum < 0.6 ? "#FFFFFF" : "#1a1a1a";
  }

  // src/state.js
  var comptes = [];
  var contacts = [];
  var contracts = [];
  var equipe = [];
  var crmComments = [];
  var crmTasks = [];
  var activityLog = [];
  var currentFilterType = null;
  var currentFilterPriority = null;
  var currentFilterCategory = null;
  var currentFilterTag = null;
  var kanbanSearch = "";
  var kanbanShowAll = false;
  var isOwner = false;
  var isEditor = false;
  var currentUserEmail = "";
  var currentTab = "kanban";
  function setRole(owner, editor) {
    isOwner = owner;
    isEditor = editor;
  }
  function setCurrentUserEmail(email) {
    currentUserEmail = email;
  }
  function setCurrentFilterType(value) {
    currentFilterType = value;
  }
  function setCurrentFilterCategory(value) {
    currentFilterCategory = value;
  }
  function setKanbanSearchState(value) {
    kanbanSearch = value;
  }
  function setKanbanShowAllState(value) {
    kanbanShowAll = value;
  }
  function setCurrentTab(tab) {
    currentTab = tab;
  }

  // src/config/tables.js
  var COMPTES_TABLE = "CRM_Comptes";
  var CONTACTS_TABLE = "CRM_Contacts";
  var CONTRATS_TABLE = "CRM_Contrats";
  var COMMENTAIRES_TABLE = "CRM_Commentaires";
  var TACHES_TABLE = "CRM_Taches";
  var EQUIPE_TABLE = "CRM_Equipe";
  var CONFIG_TABLE = "CRM_Configuration";
  var PARAMETRES_TABLE = "CRM_Parametres";
  var JOURNAL_TABLE = "CRM_JournalActivite";
  var DEFAULT_COMPTES_TABLE = "CRM_Comptes";
  var DEFAULT_CONTACTS_TABLE = "CRM_Contacts";
  var DEFAULT_CONTRATS_TABLE = "CRM_Contrats";
  var DEFAULT_EQUIPE_TABLE = "CRM_Equipe";
  function applyTableMapping(names) {
    if (names.comptes) COMPTES_TABLE = names.comptes;
    if (names.contacts) CONTACTS_TABLE = names.contacts;
    if (names.contrats) CONTRATS_TABLE = names.contrats;
    if (names.equipe) EQUIPE_TABLE = names.equipe;
  }

  // src/config/column-mapping.js
  var columnMapping = {
    comptes: {
      name: "Nom",
      type: "Type",
      status: "Statut",
      priority: "Priorite",
      responsible: "Responsable",
      amount: "Montant",
      contractsTotal: "Total_Contrats",
      nextAction: "Prochaine_Action",
      nextActionDate: "Date_Prochaine_Action",
      relanceDate: "Date_Relance",
      category: "Categorie",
      tag: "Tag",
      description: "Description",
      createdAt: "Cree_Le",
      website: "Site_Web",
      addressStreet: "Adresse_Rue",
      addressZip: "Adresse_Code_Postal",
      addressCity: "Adresse_Ville"
    },
    contacts: {
      name: "Nom",
      email: "Email",
      phone: "Telephone",
      role: "Fonction",
      isPrimary: "Principal",
      consent: "RGPD_Consentement",
      consentDate: "RGPD_Date_Consentement"
    },
    contrats: {
      label: "Intitule",
      amount: "Montant",
      status: "Statut",
      startDate: "Date_Debut",
      endDate: "Date_Fin"
    },
    equipe: {
      name: "Nom",
      email: "Email",
      role: "Role"
    }
  };
  async function loadColumnMapping() {
    try {
      var configData = await grist.docApi.fetchTable(CONFIG_TABLE);
      if (!configData || !configData.Cle_Config) return;
      var toCamel = function(s) {
        return s.replace(/_([a-z])/g, function(_, c) {
          return c.toUpperCase();
        });
      };
      var tableNames = {};
      for (var i = 0; i < configData.Cle_Config.length; i++) {
        var key = configData.Cle_Config[i];
        var columnName = configData.Nom_Colonne[i];
        var tableName = configData.Nom_Table ? configData.Nom_Table[i] : "";
        if (key.indexOf("compte_") === 0) {
          var field = toCamel(key.slice(7));
          if (columnMapping.comptes[field] !== void 0) columnMapping.comptes[field] = columnName;
          if (tableName) tableNames.comptes = tableName;
        } else if (key.indexOf("contact_") === 0) {
          var field2 = toCamel(key.slice(8));
          if (columnMapping.contacts[field2] !== void 0) columnMapping.contacts[field2] = columnName;
          if (tableName) tableNames.contacts = tableName;
        } else if (key.indexOf("contract_") === 0) {
          var field3 = toCamel(key.slice(9));
          if (columnMapping.contrats[field3] !== void 0) columnMapping.contrats[field3] = columnName;
          if (tableName) tableNames.contrats = tableName;
        } else if (key.indexOf("equipe_") === 0) {
          var field4 = toCamel(key.slice(7));
          if (columnMapping.equipe[field4] !== void 0) columnMapping.equipe[field4] = columnName;
          if (tableName) tableNames.equipe = tableName;
        }
      }
      applyTableMapping(tableNames);
    } catch (e) {
      console.log("[CRM] CRM_Configuration not available yet");
    }
  }
  function getColumnName(entity, field) {
    return columnMapping[entity] && columnMapping[entity][field] || field;
  }
  function setField(record, entity, field, value) {
    var col = getColumnName(entity, field);
    record[col] = value;
  }

  // src/data/schema.js
  async function syncChoiceColumnOptions(tableName, columnName, items) {
    try {
      var choices = items.map(function(it) {
        return it.key;
      });
      var choiceOptions = {};
      items.forEach(function(it) {
        choiceOptions[it.key] = { fillColor: it.color || "#CCCCCC", textColor: "#271A79" };
      });
      await grist.docApi.applyUserActions([
        ["ModifyColumn", tableName, columnName, { widgetOptions: JSON.stringify({ choices, choiceOptions }) }]
      ]);
    } catch (e) {
      console.error("[CRM] \xC9chec synchronisation des choix pour " + tableName + "." + columnName + " :", e.message);
    }
  }
  async function ensureTables() {
    try {
      var existingTables = await grist.docApi.listTables();
      if (existingTables.indexOf(CONFIG_TABLE) !== -1) {
        await loadColumnMapping();
      }
      if (EQUIPE_TABLE === DEFAULT_EQUIPE_TABLE && existingTables.indexOf(EQUIPE_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", EQUIPE_TABLE, [
            { id: "Nom", type: "Text" },
            { id: "Email", type: "Text" },
            { id: "Role", type: "Choice", widgetOptions: JSON.stringify({ choices: [] }) }
          ]]
        ]);
      }
      if (COMPTES_TABLE === DEFAULT_COMPTES_TABLE && existingTables.indexOf(COMPTES_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", COMPTES_TABLE, [
            { id: "Nom", type: "Text" },
            { id: "Type", type: "Choice", widgetOptions: JSON.stringify({ choices: ["client", "prospect", "ancien"], choiceOptions: {
              client: { fillColor: "#42B6C8", textColor: "#271A79" },
              prospect: { fillColor: "#B9FFB7", textColor: "#271A79" },
              ancien: { fillColor: "#EEFFEE", textColor: "#271A79" }
            } }) },
            { id: "Statut", type: "Choice", widgetOptions: JSON.stringify({ choices: ["premier_contact", "negociation", "signature", "signe"] }) },
            { id: "Priorite", type: "Choice", widgetOptions: JSON.stringify({ choices: ["high", "medium", "low"] }) },
            { id: "Responsable", type: "Ref:" + EQUIPE_TABLE },
            { id: "Montant", type: "Numeric" },
            { id: "Prochaine_Action", type: "Choice", widgetOptions: JSON.stringify({ choices: [] }) },
            { id: "Date_Prochaine_Action", type: "Date" },
            { id: "Date_Relance", type: "Date" },
            { id: "Categorie", type: "Choice", widgetOptions: JSON.stringify({ choices: [] }) },
            { id: "Tag", type: "Choice", widgetOptions: JSON.stringify({ choices: [] }) },
            { id: "Description", type: "Text" },
            { id: "Site_Web", type: "Text" },
            { id: "Adresse_Rue", type: "Text" },
            { id: "Adresse_Code_Postal", type: "Text" },
            { id: "Adresse_Ville", type: "Text" },
            { id: "Adresse_Lat", type: "Numeric" },
            { id: "Adresse_Lng", type: "Numeric" },
            { id: "Departement", type: "Text" },
            { id: "Cree_Le", type: "Date" },
            { id: "Client_Depuis", type: "Date" }
          ]]
        ]);
      }
      if (CONTACTS_TABLE === DEFAULT_CONTACTS_TABLE && existingTables.indexOf(CONTACTS_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", CONTACTS_TABLE, [
            { id: "Compte_Id", type: "Ref:" + COMPTES_TABLE },
            { id: "Nom", type: "Text" },
            { id: "Email", type: "Text" },
            { id: "Telephone", type: "Text" },
            { id: "Fonction", type: "Text" },
            { id: "Principal", type: "Bool" },
            { id: "RGPD_Consentement", type: "Bool" },
            { id: "RGPD_Date_Consentement", type: "Date" }
          ]]
        ]);
      }
      if (CONTRATS_TABLE === DEFAULT_CONTRATS_TABLE && existingTables.indexOf(CONTRATS_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", CONTRATS_TABLE, [
            { id: "Compte_Id", type: "Ref:" + COMPTES_TABLE },
            { id: "Intitule", type: "Text" },
            { id: "Montant", type: "Numeric" },
            { id: "Statut", type: "Choice", widgetOptions: JSON.stringify({ choices: ["en_cours", "signe", "termine", "annule"] }) },
            { id: "Date_Debut", type: "Date" },
            { id: "Date_Fin", type: "Date" },
            { id: "Fichier_Nom", type: "Text" },
            { id: "Fichier_Type", type: "Text" },
            { id: "Fichier_Data", type: "Text" }
          ]]
        ]);
      }
      if (existingTables.indexOf(COMMENTAIRES_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", COMMENTAIRES_TABLE, [
            { id: "Compte_Id", type: "Ref:" + COMPTES_TABLE },
            { id: "Auteur", type: "Text" },
            { id: "Contenu", type: "Text" },
            { id: "Cree_Le", type: "Date" }
          ]]
        ]);
      }
      if (existingTables.indexOf(TACHES_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", TACHES_TABLE, [
            { id: "Compte_Id", type: "Ref:" + COMPTES_TABLE },
            { id: "Titre", type: "Text" },
            { id: "Statut", type: "Choice", widgetOptions: JSON.stringify({ choices: ["a_faire", "fait"] }) },
            { id: "Date_Echeance", type: "Date" },
            { id: "Assigne_A", type: "Ref:" + EQUIPE_TABLE },
            { id: "Cree_Le", type: "Date" }
          ]]
        ]);
      }
      if (existingTables.indexOf(CONFIG_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", CONFIG_TABLE, [
            { id: "Cle_Config", type: "Text" },
            { id: "Nom_Table", type: "Text" },
            { id: "Nom_Colonne", type: "Text" },
            { id: "Libelle_Affiche", type: "Text" },
            { id: "Obligatoire", type: "Bool" },
            { id: "Valeur_Defaut", type: "Text" }
          ]]
        ]);
        var defaultConfig = [
          ["compte_name", COMPTES_TABLE, "Nom", "Nom", true, "Nom"],
          ["compte_type", COMPTES_TABLE, "Type", "Type", true, "Type"],
          ["compte_status", COMPTES_TABLE, "Statut", "Statut", false, "Statut"],
          ["compte_priority", COMPTES_TABLE, "Priorite", "Priorit\xE9", false, "Priorite"],
          ["compte_responsible", COMPTES_TABLE, "Responsable", "Responsable", false, "Responsable"],
          ["compte_amount", COMPTES_TABLE, "Montant", "Montant", false, "Montant"],
          ["compte_contracts_total", COMPTES_TABLE, "Total_Contrats", "Total contrats", false, "Total_Contrats"],
          ["compte_next_action", COMPTES_TABLE, "Prochaine_Action", "Prochaine action", false, "Prochaine_Action"],
          ["compte_next_action_date", COMPTES_TABLE, "Date_Prochaine_Action", "Date prochaine action", false, "Date_Prochaine_Action"],
          ["compte_relance_date", COMPTES_TABLE, "Date_Relance", "Date de relance", false, "Date_Relance"],
          ["compte_category", COMPTES_TABLE, "Categorie", "Cat\xE9gorie", false, "Categorie"],
          ["compte_tag", COMPTES_TABLE, "Tag", "Tag", false, "Tag"],
          ["compte_description", COMPTES_TABLE, "Description", "Notes", false, "Description"],
          ["compte_created_at", COMPTES_TABLE, "Cree_Le", "Cr\xE9\xE9 le", false, "Cree_Le"],
          ["compte_website", COMPTES_TABLE, "Site_Web", "Site web", false, "Site_Web"],
          ["compte_address_street", COMPTES_TABLE, "Adresse_Rue", "Adresse", false, "Adresse_Rue"],
          ["compte_address_zip", COMPTES_TABLE, "Adresse_Code_Postal", "Code postal", false, "Adresse_Code_Postal"],
          ["compte_address_city", COMPTES_TABLE, "Adresse_Ville", "Ville", false, "Adresse_Ville"],
          ["contact_name", CONTACTS_TABLE, "Nom", "Nom", true, "Nom"],
          ["contact_email", CONTACTS_TABLE, "Email", "Email", false, "Email"],
          ["contact_phone", CONTACTS_TABLE, "Telephone", "T\xE9l\xE9phone", false, "Telephone"],
          ["contact_role", CONTACTS_TABLE, "Fonction", "Fonction", false, "Fonction"],
          ["contact_is_primary", CONTACTS_TABLE, "Principal", "Contact principal", false, "Principal"],
          ["contact_consent", CONTACTS_TABLE, "RGPD_Consentement", "Consentement RGPD", false, "RGPD_Consentement"],
          ["contact_consent_date", CONTACTS_TABLE, "RGPD_Date_Consentement", "Date consentement", false, "RGPD_Date_Consentement"],
          ["contract_label", CONTRATS_TABLE, "Intitule", "Intitul\xE9", true, "Intitule"],
          ["contract_amount", CONTRATS_TABLE, "Montant", "Montant", false, "Montant"],
          ["contract_status", CONTRATS_TABLE, "Statut", "Statut", false, "Statut"],
          ["contract_start_date", CONTRATS_TABLE, "Date_Debut", "Date d\xE9but", false, "Date_Debut"],
          ["contract_end_date", CONTRATS_TABLE, "Date_Fin", "Date fin", false, "Date_Fin"],
          ["equipe_name", EQUIPE_TABLE, "Nom", "Nom", true, "Nom"],
          ["equipe_email", EQUIPE_TABLE, "Email", "Email", false, "Email"],
          ["equipe_role", EQUIPE_TABLE, "Role", "R\xF4le", false, "Role"]
        ];
        var configRecords = defaultConfig.map(function(c) {
          return { Cle_Config: c[0], Nom_Table: c[1], Nom_Colonne: c[2], Libelle_Affiche: c[3], Obligatoire: c[4], Valeur_Defaut: c[5] };
        });
        await grist.docApi.applyUserActions([
          ["BulkAddRecord", CONFIG_TABLE, configRecords.map(function() {
            return null;
          }), configRecords]
        ]);
      }
      if (existingTables.indexOf(PARAMETRES_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", PARAMETRES_TABLE, [
            { id: "Cle", type: "Text" },
            { id: "Valeur", type: "Text" }
          ]]
        ]);
      }
      if (existingTables.indexOf(JOURNAL_TABLE) === -1) {
        await grist.docApi.applyUserActions([
          ["AddTable", JOURNAL_TABLE, [
            { id: "Horodatage", type: "Date" },
            { id: "Email_Utilisateur", type: "Text" },
            { id: "Action", type: "Text" },
            { id: "Compte_Id", type: "Int" },
            { id: "Nom_Compte", type: "Text" },
            { id: "Details", type: "Text" }
          ]]
        ]);
      }
      try {
        var compteCols = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
        if (compteCols.indexOf("Total_Contrats") === -1) {
          await grist.docApi.applyUserActions([
            ["AddColumn", COMPTES_TABLE, "Total_Contrats", {
              type: "Numeric",
              isFormula: true,
              formula: "sum([c.Montant for c in " + CONTRATS_TABLE + '.lookupRecords(Compte_Id=$id) if c.Statut == "signe"])'
            }]
          ]);
          console.log("[CRM] Total_Contrats ajout\xE9 \xE0 " + COMPTES_TABLE);
        }
      } catch (e) {
        console.log("[CRM] Migration Total_Contrats ignor\xE9e :", e.message);
      }
      try {
        var compteColsAddr = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
        var addressFields = [
          ["Site_Web", "Text"],
          ["Adresse_Rue", "Text"],
          ["Adresse_Code_Postal", "Text"],
          ["Adresse_Ville", "Text"]
        ];
        for (var af = 0; af < addressFields.length; af++) {
          var fieldName = addressFields[af][0];
          var fieldType = addressFields[af][1];
          if (compteColsAddr.indexOf(fieldName) === -1) {
            await grist.docApi.applyUserActions([
              ["AddColumn", COMPTES_TABLE, fieldName, { type: fieldType }]
            ]);
            console.log("[CRM] " + fieldName + " ajout\xE9 \xE0 " + COMPTES_TABLE);
          }
        }
      } catch (e) {
        console.log("[CRM] Migration Site_Web/Adresse ignor\xE9e :", e.message);
      }
      try {
        var compteColsEmailCleanup = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
        var emailColsToRemove = ["Email_Status", "Email_Sujet", "Email_Corps", "Email_Destinataire"];
        for (var ec = 0; ec < emailColsToRemove.length; ec++) {
          if (compteColsEmailCleanup.indexOf(emailColsToRemove[ec]) !== -1) {
            await grist.docApi.applyUserActions([["RemoveColumn", COMPTES_TABLE, emailColsToRemove[ec]]]);
            console.log("[CRM] " + emailColsToRemove[ec] + " supprim\xE9e de " + COMPTES_TABLE);
          }
        }
      } catch (e) {
        console.error("[CRM] Nettoyage colonnes email ignor\xE9 :", e.message);
      }
      try {
        var paramsDataCleanup = await grist.docApi.fetchTable(PARAMETRES_TABLE);
        if (paramsDataCleanup && paramsDataCleanup.id) {
          var obsoleteSettingKeys = ["webhook_url", "email_templates", "kanban_hide_client_days"];
          var removeSettingActions = [];
          for (var ps = 0; ps < paramsDataCleanup.id.length; ps++) {
            if (obsoleteSettingKeys.indexOf(paramsDataCleanup.Cle[ps]) !== -1) {
              removeSettingActions.push(["RemoveRecord", PARAMETRES_TABLE, paramsDataCleanup.id[ps]]);
            }
          }
          if (removeSettingActions.length) await grist.docApi.applyUserActions(removeSettingActions);
        }
      } catch (e) {
        console.error("[CRM] Nettoyage r\xE9glages obsol\xE8tes ignor\xE9 :", e.message);
      }
      try {
        var compteColsClient = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
        if (compteColsClient.indexOf("Client_Depuis") === -1) {
          await grist.docApi.applyUserActions([["AddColumn", COMPTES_TABLE, "Client_Depuis", { type: "Date" }]]);
          console.log("[CRM] Client_Depuis ajout\xE9 \xE0 " + COMPTES_TABLE);
        }
      } catch (e) {
        console.error("[CRM] Migration Client_Depuis ignor\xE9e :", e.message);
      }
      try {
        var compteColsGeo = Object.keys(await grist.docApi.fetchTable(COMPTES_TABLE));
        if (compteColsGeo.indexOf("Adresse_Lat") === -1) {
          await grist.docApi.applyUserActions([["AddColumn", COMPTES_TABLE, "Adresse_Lat", { type: "Numeric" }]]);
        }
        if (compteColsGeo.indexOf("Adresse_Lng") === -1) {
          await grist.docApi.applyUserActions([["AddColumn", COMPTES_TABLE, "Adresse_Lng", { type: "Numeric" }]]);
        }
        if (compteColsGeo.indexOf("Departement") === -1) {
          await grist.docApi.applyUserActions([["AddColumn", COMPTES_TABLE, "Departement", { type: "Text" }]]);
          var compteDataBackfill = await grist.docApi.fetchTable(COMPTES_TABLE);
          if (compteDataBackfill && compteDataBackfill.id) {
            var backfillActions = [];
            for (var bf = 0; bf < compteDataBackfill.id.length; bf++) {
              var zipBf = compteDataBackfill.Adresse_Code_Postal ? compteDataBackfill.Adresse_Code_Postal[bf] : "";
              var deptBf = getDepartementFromZip(zipBf);
              if (deptBf) backfillActions.push(["UpdateRecord", COMPTES_TABLE, compteDataBackfill.id[bf], { Departement: deptBf }]);
            }
            if (backfillActions.length) await grist.docApi.applyUserActions(backfillActions);
          }
        }
      } catch (e) {
        console.error("[CRM] Migration Departement ignor\xE9e :", e.message);
      }
      try {
        await grist.docApi.applyUserActions([
          ["ModifyColumn", COMPTES_TABLE, "Prochaine_Action", { type: "Choice" }]
        ]);
      } catch (e) {
        console.error("[CRM] Migration Prochaine_Action (Choix) ignor\xE9e :", e.message);
      }
      try {
        await grist.docApi.applyUserActions([
          ["ModifyColumn", COMPTES_TABLE, "Tag", { type: "Choice" }]
        ]);
      } catch (e) {
        console.error("[CRM] Migration Tag (Choix) ignor\xE9e :", e.message);
      }
      try {
        var tablesForTagsCleanup = await grist.docApi.listTables();
        if (tablesForTagsCleanup.indexOf("CRM_Tags") !== -1) {
          await grist.docApi.applyUserActions([["RemoveTable", "CRM_Tags"]]);
          console.log("[CRM] Table CRM_Tags supprim\xE9e (remplac\xE9e par la liste de choix Tag)");
        }
      } catch (e) {
        console.error("[CRM] Suppression de CRM_Tags ignor\xE9e :", e.message);
      }
      try {
        await grist.docApi.applyUserActions([
          ["ModifyColumn", COMPTES_TABLE, "Categorie", { type: "Choice" }]
        ]);
      } catch (e) {
        console.error("[CRM] Migration Categorie (Choix) ignor\xE9e :", e.message);
      }
      try {
        var tablesForCategoriesCleanup = await grist.docApi.listTables();
        if (tablesForCategoriesCleanup.indexOf("CRM_Categories") !== -1) {
          await grist.docApi.applyUserActions([["RemoveTable", "CRM_Categories"]]);
          console.log("[CRM] Table CRM_Categories supprim\xE9e (remplac\xE9e par la liste de choix Categorie)");
        }
      } catch (e) {
        console.error("[CRM] Suppression de CRM_Categories ignor\xE9e :", e.message);
      }
      var finalTables = await grist.docApi.listTables();
      if (finalTables.length > existingTables.length) {
        showToast(t("tablesCreated"), "success");
      }
    } catch (e) {
      console.error("[CRM] Error ensuring tables:", e);
    }
  }

  // src/data/load.js
  async function loadAllData() {
    await loadColumnMapping();
    try {
      var equipeData = await grist.docApi.fetchTable(EQUIPE_TABLE);
      equipe.length = 0;
      if (equipeData && equipeData.id) {
        var eNameCol = getColumnName("equipe", "name");
        var eEmailCol = getColumnName("equipe", "email");
        var eRoleCol = getColumnName("equipe", "role");
        for (var z = 0; z < equipeData.id.length; z++) {
          equipe.push({
            id: equipeData.id[z],
            Nom: equipeData[eNameCol] ? equipeData[eNameCol][z] : "",
            Email: equipeData[eEmailCol] ? equipeData[eEmailCol][z] : "",
            Role: equipeData[eRoleCol] ? equipeData[eRoleCol][z] : ""
          });
        }
      }
    } catch (e) {
      equipe.length = 0;
    }
    try {
      var compteData = await grist.docApi.fetchTable(COMPTES_TABLE);
      comptes.length = 0;
      if (compteData && compteData.id) {
        var nameCol = getColumnName("comptes", "name");
        var typeCol = getColumnName("comptes", "type");
        var statusCol = getColumnName("comptes", "status");
        var priorityCol = getColumnName("comptes", "priority");
        var responsibleCol = getColumnName("comptes", "responsible");
        var amountCol = getColumnName("comptes", "amount");
        var contractsTotalCol = getColumnName("comptes", "contractsTotal");
        var nextActionCol = getColumnName("comptes", "nextAction");
        var nextActionDateCol = getColumnName("comptes", "nextActionDate");
        var relanceDateCol = getColumnName("comptes", "relanceDate");
        var categoryCol = getColumnName("comptes", "category");
        var tagCol = getColumnName("comptes", "tag");
        var descCol = getColumnName("comptes", "description");
        var createdAtCol = getColumnName("comptes", "createdAt");
        var websiteCol = getColumnName("comptes", "website");
        var addressStreetCol = getColumnName("comptes", "addressStreet");
        var addressZipCol = getColumnName("comptes", "addressZip");
        var addressCityCol = getColumnName("comptes", "addressCity");
        for (var i = 0; i < compteData.id.length; i++) {
          comptes.push({
            id: compteData.id[i],
            Name: compteData[nameCol] ? compteData[nameCol][i] : "",
            Type: compteData[typeCol] ? compteData[typeCol][i] : "prospect",
            Status: compteData[statusCol] ? compteData[statusCol][i] : "premier_contact",
            Priority: compteData[priorityCol] ? compteData[priorityCol][i] : "medium",
            Responsible: compteData[responsibleCol] ? compteData[responsibleCol][i] : 0,
            Amount: compteData[amountCol] ? compteData[amountCol][i] : 0,
            Contracts_Total: compteData[contractsTotalCol] ? compteData[contractsTotalCol][i] : 0,
            Next_Action: compteData[nextActionCol] ? compteData[nextActionCol][i] : "",
            Next_Action_Date: compteData[nextActionDateCol] ? compteData[nextActionDateCol][i] : null,
            Relance_Date: compteData[relanceDateCol] ? compteData[relanceDateCol][i] : null,
            Category: compteData[categoryCol] ? compteData[categoryCol][i] : "",
            Tag: compteData[tagCol] ? compteData[tagCol][i] : "",
            Description: compteData[descCol] ? compteData[descCol][i] : "",
            Created_At: compteData[createdAtCol] ? compteData[createdAtCol][i] : null,
            Website: compteData[websiteCol] ? compteData[websiteCol][i] : "",
            Address_Street: compteData[addressStreetCol] ? compteData[addressStreetCol][i] : "",
            Address_Zip: compteData[addressZipCol] ? compteData[addressZipCol][i] : "",
            Address_City: compteData[addressCityCol] ? compteData[addressCityCol][i] : "",
            Client_Depuis: compteData.Client_Depuis ? compteData.Client_Depuis[i] : null,
            Address_Lat: compteData.Adresse_Lat ? compteData.Adresse_Lat[i] : null,
            Address_Lng: compteData.Adresse_Lng ? compteData.Adresse_Lng[i] : null,
            Departement: compteData.Departement ? compteData.Departement[i] : ""
          });
        }
      }
    } catch (e) {
      console.warn("[CRM] Could not load comptes:", e);
      comptes.length = 0;
    }
    try {
      var contactData = await grist.docApi.fetchTable(CONTACTS_TABLE);
      contacts.length = 0;
      if (contactData && contactData.id) {
        var cNameCol = getColumnName("contacts", "name");
        var cEmailCol = getColumnName("contacts", "email");
        var cPhoneCol = getColumnName("contacts", "phone");
        var cRoleCol = getColumnName("contacts", "role");
        var cPrimaryCol = getColumnName("contacts", "isPrimary");
        var cConsentCol = getColumnName("contacts", "consent");
        var cConsentDateCol = getColumnName("contacts", "consentDate");
        for (var j = 0; j < contactData.id.length; j++) {
          contacts.push({
            id: contactData.id[j],
            Compte_Id: contactData.Compte_Id ? contactData.Compte_Id[j] : null,
            Name: contactData[cNameCol] ? contactData[cNameCol][j] : "",
            Email: contactData[cEmailCol] ? contactData[cEmailCol][j] : "",
            Phone: contactData[cPhoneCol] ? contactData[cPhoneCol][j] : "",
            Role: contactData[cRoleCol] ? contactData[cRoleCol][j] : "",
            Is_Primary: contactData[cPrimaryCol] ? !!contactData[cPrimaryCol][j] : false,
            RGPD_Consent: contactData[cConsentCol] ? !!contactData[cConsentCol][j] : false,
            RGPD_Consent_Date: contactData[cConsentDateCol] ? contactData[cConsentDateCol][j] : null
          });
        }
      }
    } catch (e) {
      contacts.length = 0;
    }
    try {
      var contractData = await grist.docApi.fetchTable(CONTRATS_TABLE);
      contracts.length = 0;
      if (contractData && contractData.id) {
        var lLabelCol = getColumnName("contrats", "label");
        var lAmountCol = getColumnName("contrats", "amount");
        var lStatusCol = getColumnName("contrats", "status");
        var lStartCol = getColumnName("contrats", "startDate");
        var lEndCol = getColumnName("contrats", "endDate");
        for (var k = 0; k < contractData.id.length; k++) {
          contracts.push({
            id: contractData.id[k],
            Compte_Id: contractData.Compte_Id ? contractData.Compte_Id[k] : null,
            Label: contractData[lLabelCol] ? contractData[lLabelCol][k] : "",
            Amount: contractData[lAmountCol] ? contractData[lAmountCol][k] : 0,
            Status: contractData[lStatusCol] ? contractData[lStatusCol][k] : "en_cours",
            Start_Date: contractData[lStartCol] ? contractData[lStartCol][k] : null,
            End_Date: contractData[lEndCol] ? contractData[lEndCol][k] : null,
            Fichier_Nom: contractData.Fichier_Nom ? contractData.Fichier_Nom[k] : "",
            Fichier_Type: contractData.Fichier_Type ? contractData.Fichier_Type[k] : "",
            Fichier_Data: contractData.Fichier_Data ? contractData.Fichier_Data[k] : ""
          });
        }
      }
    } catch (e) {
      contracts.length = 0;
    }
    try {
      var commentData = await grist.docApi.fetchTable(COMMENTAIRES_TABLE);
      crmComments.length = 0;
      if (commentData && commentData.id) {
        for (var m = 0; m < commentData.id.length; m++) {
          crmComments.push({
            id: commentData.id[m],
            Compte_Id: commentData.Compte_Id ? commentData.Compte_Id[m] : null,
            Author: commentData.Auteur ? commentData.Auteur[m] : "",
            Content: commentData.Contenu ? commentData.Contenu[m] : "",
            Created_At: commentData.Cree_Le ? commentData.Cree_Le[m] : null
          });
        }
      }
    } catch (e) {
      crmComments.length = 0;
    }
    try {
      var taskData = await grist.docApi.fetchTable(TACHES_TABLE);
      crmTasks.length = 0;
      if (taskData && taskData.id) {
        for (var n = 0; n < taskData.id.length; n++) {
          crmTasks.push({
            id: taskData.id[n],
            Compte_Id: taskData.Compte_Id ? taskData.Compte_Id[n] : null,
            Title: taskData.Titre ? taskData.Titre[n] : "",
            Status: taskData.Statut ? taskData.Statut[n] : "a_faire",
            Due_Date: taskData.Date_Echeance ? taskData.Date_Echeance[n] : null,
            Assignee: taskData.Assigne_A ? taskData.Assigne_A[n] : 0,
            Created_At: taskData.Cree_Le ? taskData.Cree_Le[n] : null
          });
        }
      }
    } catch (e) {
      crmTasks.length = 0;
    }
    try {
      var logData = await grist.docApi.fetchTable(JOURNAL_TABLE);
      activityLog.length = 0;
      if (logData && logData.id) {
        for (var r = 0; r < logData.id.length; r++) {
          activityLog.push({
            id: logData.id[r],
            Timestamp: logData.Horodatage ? logData.Horodatage[r] : null,
            User_Email: logData.Email_Utilisateur ? logData.Email_Utilisateur[r] : "",
            Action: logData.Action ? logData.Action[r] : "",
            Compte_Id: logData.Compte_Id ? logData.Compte_Id[r] : null,
            Compte_Name: logData.Nom_Compte ? logData.Nom_Compte[r] : "",
            Details: logData.Details ? logData.Details[r] : ""
          });
        }
      }
    } catch (e) {
      activityLog.length = 0;
    }
    refreshAllViews();
  }
  async function logActivity(action, compteId, compteName, details) {
    try {
      await grist.docApi.applyUserActions([
        ["AddRecord", JOURNAL_TABLE, null, {
          Horodatage: Math.floor(Date.now() / 1e3),
          Email_Utilisateur: currentUserEmail || "",
          Action: action,
          Compte_Id: compteId || 0,
          Nom_Compte: compteName || "",
          Details: details || ""
        }]
      ]);
    } catch (e) {
      console.log("[CRM] logActivity ignor\xE9 :", e.message);
    }
  }

  // src/data/relations.js
  function getContactsForCompte(compteId) {
    return contacts.filter(function(c) {
      return c.Compte_Id === compteId;
    });
  }
  function getContractsForCompte(compteId) {
    return contracts.filter(function(c) {
      return c.Compte_Id === compteId;
    });
  }
  function getCommentsForCompte(compteId) {
    return crmComments.filter(function(c) {
      return c.Compte_Id === compteId;
    }).sort(function(a, b) {
      return (b.Created_At || 0) - (a.Created_At || 0);
    });
  }
  function getTasksForCompte(compteId) {
    return crmTasks.filter(function(t2) {
      return t2.Compte_Id === compteId;
    });
  }
  function getCompteById(compteId) {
    return comptes.find(function(c) {
      return c.id === compteId;
    });
  }
  function getSignedContractsTotal(compteId) {
    return getContractsForCompte(compteId).filter(function(c) {
      return c.Status === "signe";
    }).reduce(function(sum, c) {
      return sum + (Number(c.Amount) || 0);
    }, 0);
  }
  function getPrimaryContact(compteId) {
    var cs = getContactsForCompte(compteId);
    return cs.find(function(c) {
      return c.Is_Primary;
    }) || cs[0] || null;
  }
  function getEquipeMemberById(id) {
    return equipe.find(function(e) {
      return e.id === id;
    }) || null;
  }
  function getEquipeMemberName(id) {
    var m = getEquipeMemberById(id);
    return m ? m.Nom : "";
  }
  function buildEquipeOptions(selectedId) {
    var html = '<option value="">\u2014 Non assign\xE9 \u2014</option>';
    equipe.forEach(function(m) {
      html += '<option value="' + m.id + '"' + (Number(selectedId) === m.id ? " selected" : "") + ">" + sanitize(m.Nom) + "</option>";
    });
    return html;
  }

  // src/data/filtering.js
  function getFilteredComptes() {
    return comptes.filter(function(c) {
      if (currentFilterType && c.Type !== currentFilterType) return false;
      if (currentFilterPriority && c.Priority !== currentFilterPriority) return false;
      if (currentFilterCategory && c.Category !== currentFilterCategory) return false;
      if (currentFilterTag && (c.Tag || "").indexOf(currentFilterTag) === -1) return false;
      if (kanbanSearch) {
        var search = kanbanSearch.toLowerCase();
        var primaryContact = getPrimaryContact(c.id);
        var text = [
          c.Name,
          getEquipeMemberName(c.Responsible),
          c.Next_Action,
          c.Category,
          c.Tag,
          primaryContact ? primaryContact.Name : "",
          primaryContact ? primaryContact.Email : ""
        ].join(" ").toLowerCase();
        if (text.indexOf(search) === -1) return false;
      }
      return true;
    });
  }
  function isStageStopFollowUp(statusKey) {
    var stage = getKanbanStatuses().find(function(s) {
      return s.key === statusKey;
    });
    return !!(stage && stage.stopFollowUp);
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
  function getRelanceComptes() {
    return comptes.filter(function(c) {
      return c.Relance_Date && !isStageStopFollowUp(c.Status);
    }).sort(function(a, b) {
      return (a.Relance_Date || 0) - (b.Relance_Date || 0);
    });
  }

  // src/ui/dom.js
  function getVal(id, fallback) {
    var el = document.getElementById(id);
    return el ? el.value : fallback;
  }

  // src/crud/comptes.js
  function createCompte(initialType) {
    openNewCompteModal(initialType || "prospect");
  }
  async function saveCompteFromModal(compteId) {
    var nameEl = document.getElementById("compte-name");
    var name = nameEl ? nameEl.value.trim() : "";
    if (!name) {
      showToast("Le nom est obligatoire", "error");
      return;
    }
    var isNew = compteId == null;
    var record = {};
    setField(record, "comptes", "name", name);
    setField(record, "comptes", "type", getVal("compte-type", "prospect"));
    setField(record, "comptes", "status", getVal("compte-status", getKanbanStatuses()[0].key));
    setField(record, "comptes", "priority", getVal("compte-priority", "medium"));
    setField(record, "comptes", "responsible", parseInt(getVal("compte-responsible", "0")) || 0);
    setField(record, "comptes", "amount", parseFloat(getVal("compte-amount", "0")) || 0);
    setField(record, "comptes", "nextAction", getVal("compte-next-action", ""));
    setField(record, "comptes", "nextActionDate", toEpoch(getVal("compte-next-action-date", "")));
    setField(record, "comptes", "relanceDate", toEpoch(getVal("compte-relance-date", "")));
    var categoryValue = getVal("compte-category", "");
    if (categoryValue === "__new__") {
      var newCategoryLabel = getVal("compte-category-custom", "").trim();
      if (newCategoryLabel) {
        var newCategory = await addCategoryValue(newCategoryLabel);
        categoryValue = newCategory.key;
      } else {
        categoryValue = "";
      }
    }
    setField(record, "comptes", "category", categoryValue);
    var tagValue = getVal("compte-tag", "");
    if (tagValue === "__new__") {
      var newTagLabel = getVal("compte-tag-custom", "").trim();
      if (newTagLabel) {
        var newTag = await addTagValue(newTagLabel);
        tagValue = newTag.key;
      } else {
        tagValue = "";
      }
    }
    setField(record, "comptes", "tag", tagValue);
    setField(record, "comptes", "description", getVal("compte-description", ""));
    setField(record, "comptes", "website", getVal("compte-website", ""));
    setField(record, "comptes", "addressStreet", getVal("compte-address-street", ""));
    setField(record, "comptes", "addressZip", getVal("compte-address-zip", ""));
    setField(record, "comptes", "addressCity", getVal("compte-address-city", ""));
    var addressLat = getVal("compte-address-lat", "");
    var addressLng = getVal("compte-address-lng", "");
    record.Adresse_Lat = addressLat ? parseFloat(addressLat) : null;
    record.Adresse_Lng = addressLng ? parseFloat(addressLng) : null;
    record.Departement = getDepartementFromZip(getVal("compte-address-zip", "")) || "";
    if (isNew) {
      setField(record, "comptes", "createdAt", Math.floor(Date.now() / 1e3));
      if (getVal("compte-type", "prospect") === "client") record.Client_Depuis = Math.floor(Date.now() / 1e3);
    }
    var contactName = getVal("compte-contact-name", "").trim();
    var contactEmail = getVal("compte-contact-email", "").trim();
    var contactPhone = getVal("compte-contact-phone", "").trim();
    try {
      var newId = compteId;
      if (isNew) {
        var res = await grist.docApi.applyUserActions([["AddRecord", COMPTES_TABLE, null, record]]);
        newId = res && res.retValues && res.retValues[0] || res;
      } else {
        await grist.docApi.applyUserActions([["UpdateRecord", COMPTES_TABLE, compteId, record]]);
      }
      if (contactName) {
        var existingPrimary = isNew ? null : getPrimaryContact(compteId);
        var contactRecord = {};
        setField(contactRecord, "contacts", "name", contactName);
        setField(contactRecord, "contacts", "email", contactEmail);
        setField(contactRecord, "contacts", "phone", contactPhone);
        if (existingPrimary) {
          await grist.docApi.applyUserActions([["UpdateRecord", CONTACTS_TABLE, existingPrimary.id, contactRecord]]);
        } else {
          setField(contactRecord, "contacts", "isPrimary", true);
          contactRecord.Compte_Id = newId;
          await grist.docApi.applyUserActions([["AddRecord", CONTACTS_TABLE, null, contactRecord]]);
        }
      }
      if (isNew) {
        showToast(t("compteCreated"), "success");
      } else {
        showToast(t("compteUpdated"), "success");
      }
      closeModal();
      clearEditModalDraft();
      await loadAllData();
    } catch (e) {
      console.error("[CRM] Error saving compte:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  async function deleteCompte(compteId) {
    if (!isOwner) return;
    var confirmed = await showConfirmModal(t("confirmDelete"), "Supprimer la fiche");
    if (!confirmed) return;
    try {
      var actions = [];
      getContactsForCompte(compteId).forEach(function(c) {
        actions.push(["RemoveRecord", CONTACTS_TABLE, c.id]);
      });
      getContractsForCompte(compteId).forEach(function(c) {
        actions.push(["RemoveRecord", CONTRATS_TABLE, c.id]);
      });
      getCommentsForCompte(compteId).forEach(function(c) {
        actions.push(["RemoveRecord", COMMENTAIRES_TABLE, c.id]);
      });
      getTasksForCompte(compteId).forEach(function(t2) {
        actions.push(["RemoveRecord", TACHES_TABLE, t2.id]);
      });
      actions.push(["RemoveRecord", COMPTES_TABLE, compteId]);
      await grist.docApi.applyUserActions(actions);
      showToast(t("compteDeleted"), "info");
      await loadAllData();
    } catch (e) {
      console.error("[CRM] Error deleting compte:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }

  // src/crud/contacts.js
  async function addContact(compteId) {
    var name = getVal("new-contact-name", "").trim();
    if (!name) return;
    var record = { Compte_Id: compteId };
    setField(record, "contacts", "name", name);
    setField(record, "contacts", "email", getVal("new-contact-email", "").trim());
    setField(record, "contacts", "phone", getVal("new-contact-phone", "").trim());
    setField(record, "contacts", "role", getVal("new-contact-role", "").trim());
    setField(record, "contacts", "isPrimary", getContactsForCompte(compteId).length === 0);
    try {
      await grist.docApi.applyUserActions([["AddRecord", CONTACTS_TABLE, null, record]]);
      showToast("Contact ajout\xE9", "success");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error adding contact:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  async function setContactConsent(contactId, compteId, checked) {
    var record = {};
    setField(record, "contacts", "consent", checked);
    setField(record, "contacts", "consentDate", checked ? Math.floor(Date.now() / 1e3) : null);
    try {
      await grist.docApi.applyUserActions([["UpdateRecord", CONTACTS_TABLE, contactId, record]]);
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error setting consent:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  async function deleteContact(contactId, compteId) {
    if (!isOwner) return;
    var confirmed = await showConfirmModal("Supprimer ce contact ?", "Supprimer le contact");
    if (!confirmed) return;
    try {
      await grist.docApi.applyUserActions([["RemoveRecord", CONTACTS_TABLE, contactId]]);
      showToast("Contact supprim\xE9", "info");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error deleting contact:", e);
    }
  }
  function exportContactData(contactId) {
    var contact = contacts.find(function(c) {
      return c.id === contactId;
    });
    if (!contact) return;
    var compte = getCompteById(contact.Compte_Id);
    var data = {
      nom: contact.Name,
      email: contact.Email,
      telephone: contact.Phone,
      fonction: contact.Role,
      compte_associe: compte ? compte.Name : "",
      consentement_rgpd: contact.RGPD_Consent ? "Oui" : "Non",
      date_consentement: contact.RGPD_Consent_Date ? formatDate(contact.RGPD_Consent_Date) : "",
      date_export: (/* @__PURE__ */ new Date()).toLocaleString("fr-FR")
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var blobUrl = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = blobUrl;
    link.download = "contact_" + sanitizeFilename(contact.Name) + "_export.json";
    link.click();
    URL.revokeObjectURL(blobUrl);
    showToast("Donn\xE9es export\xE9es", "success");
  }
  async function rgpdDeleteContact(contactId, compteId) {
    if (!isOwner) return;
    var confirmed = await showConfirmModal(
      "Cette action est d\xE9finitive et supprime toutes les donn\xE9es de ce contact (droit \xE0 l\u2019oubli RGPD). Confirmer ?",
      "Suppression RGPD"
    );
    if (!confirmed) return;
    try {
      await grist.docApi.applyUserActions([["RemoveRecord", CONTACTS_TABLE, contactId]]);
      showToast("Contact supprim\xE9 d\xE9finitivement", "info");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error RGPD delete:", e);
    }
  }

  // src/crud/contracts.js
  async function addContract(compteId) {
    var label = getVal("new-contract-label", "").trim();
    if (!label) {
      var el = document.getElementById("new-contract-label");
      if (el) {
        el.style.borderColor = "#ef4444";
        el.focus();
        setTimeout(function() {
          el.style.borderColor = "";
        }, 2e3);
      }
      showToast("L'intitul\xE9 est obligatoire", "error");
      return;
    }
    var record = { Compte_Id: compteId };
    setField(record, "contrats", "label", label);
    setField(record, "contrats", "amount", parseFloat(getVal("new-contract-amount", "0")) || 0);
    setField(record, "contrats", "status", getVal("new-contract-status", "en_cours"));
    setField(record, "contrats", "startDate", toEpoch(getVal("new-contract-start", "")));
    setField(record, "contrats", "endDate", toEpoch(getVal("new-contract-end", "")));
    var fileInput = document.getElementById("new-contract-file");
    var file = fileInput && fileInput.files && fileInput.files[0];
    try {
      if (file) {
        var fileData = await readFileAsBase64(file);
        record.Fichier_Nom = file.name;
        record.Fichier_Type = file.type;
        record.Fichier_Data = fileData;
      }
      await grist.docApi.applyUserActions([["AddRecord", CONTRATS_TABLE, null, record]]);
      showToast("Contrat ajout\xE9", "success");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error adding contract:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  function readFileAsBase64(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() {
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function downloadContractFile(contractId) {
    var contract = contracts.find(function(c) {
      return c.id === contractId;
    });
    if (!contract || !contract.Fichier_Data) return;
    var link = document.createElement("a");
    link.href = "data:" + (contract.Fichier_Type || "application/octet-stream") + ";base64," + contract.Fichier_Data;
    link.download = contract.Fichier_Nom || "contrat";
    link.click();
  }
  function updateFileLabel(input) {
    var label = input.closest("label");
    if (!label) return;
    var fileName = input.files && input.files[0] ? input.files[0].name : "";
    label.firstChild.textContent = fileName ? "\u{1F4CE} " + fileName : "\u{1F4CE} Joindre le contrat";
  }
  async function deleteContract(contractId, compteId) {
    if (!isOwner) return;
    var confirmed = await showConfirmModal("Supprimer ce contrat ?", "Supprimer le contrat");
    if (!confirmed) return;
    try {
      await grist.docApi.applyUserActions([["RemoveRecord", CONTRATS_TABLE, contractId]]);
      showToast("Contrat supprim\xE9", "info");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error deleting contract:", e);
    }
  }

  // src/crud/comments.js
  async function addCrmComment(compteId) {
    var textarea = document.getElementById("new-comment-input");
    var content = textarea ? textarea.value.trim() : "";
    if (!content) return;
    try {
      await grist.docApi.applyUserActions([
        ["AddRecord", COMMENTAIRES_TABLE, null, {
          Compte_Id: compteId,
          Auteur: currentUserEmail || "Utilisateur",
          Contenu: content,
          Cree_Le: Math.floor(Date.now() / 1e3)
        }]
      ]);
      var compte = getCompteById(compteId);
      logActivity("comment_added", compteId, compte ? compte.Name : "", content.substring(0, 80));
      showToast("Note ajout\xE9e", "success");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error adding comment:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  async function deleteCrmComment(commentId, compteId) {
    if (!isOwner) return;
    var confirmed = await showConfirmModal("Supprimer cette note ?", "Supprimer la note");
    if (!confirmed) return;
    try {
      var comment = crmComments.find(function(c) {
        return c.id === commentId;
      });
      var compte = getCompteById(compteId);
      await grist.docApi.applyUserActions([["RemoveRecord", COMMENTAIRES_TABLE, commentId]]);
      logActivity("comment_deleted", compteId, compte ? compte.Name : "", comment ? comment.Content.substring(0, 80) : "");
      showToast("Note supprim\xE9e", "info");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error deleting comment:", e);
    }
  }
  function editCrmComment(commentId, compteId) {
    var contentEl = document.getElementById("comment-content-" + commentId);
    var itemEl = document.getElementById("comment-item-" + commentId);
    if (!contentEl || !itemEl) return;
    var currentText = contentEl.textContent;
    var editArea = document.createElement("textarea");
    editArea.id = "comment-edit-" + commentId;
    editArea.style.cssText = "width:100%;min-height:60px;font-family:inherit;font-size:14px;padding:6px 8px;border:2px solid var(--color-primary);border-radius:8px;resize:vertical;margin-top:4px;";
    editArea.value = currentText;
    var btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:6px;margin-top:6px;";
    btnRow.innerHTML = '<button class="btn btn-primary" style="font-size:13px;padding:5px 12px;" onclick="saveCrmComment(' + commentId + "," + compteId + ')">\u2713 Enregistrer</button><button class="btn btn-secondary" style="font-size:13px;padding:5px 12px;" onclick="cancelCrmCommentEdit(' + commentId + ",'" + currentText.replace(/'/g, "\\'") + `')">\u2715 Annuler</button>`;
    contentEl.replaceWith(editArea);
    var actionsEl = itemEl.querySelector(".comment-actions");
    if (actionsEl) actionsEl.style.display = "none";
    itemEl.appendChild(btnRow);
    editArea.focus();
    editArea.setSelectionRange(editArea.value.length, editArea.value.length);
  }
  function cancelCrmCommentEdit(commentId, originalText) {
    var itemEl = document.getElementById("comment-item-" + commentId);
    if (!itemEl) return;
    var editArea = document.getElementById("comment-edit-" + commentId);
    if (editArea) {
      var contentEl = document.createElement("div");
      contentEl.className = "comment-content";
      contentEl.id = "comment-content-" + commentId;
      contentEl.textContent = originalText;
      editArea.replaceWith(contentEl);
    }
    var btnRow = itemEl.querySelector('div[style*="margin-top:6px"]');
    if (btnRow) btnRow.remove();
    var actionsEl = itemEl.querySelector(".comment-actions");
    if (actionsEl) actionsEl.style.display = "";
  }
  async function saveCrmComment(commentId, compteId) {
    var editArea = document.getElementById("comment-edit-" + commentId);
    if (!editArea) return;
    var newText = editArea.value.trim();
    if (!newText) {
      editArea.style.borderColor = "#ef4444";
      setTimeout(function() {
        editArea.style.borderColor = "var(--color-primary)";
      }, 2e3);
      return;
    }
    try {
      var record = { Contenu: newText };
      await grist.docApi.applyUserActions([["UpdateRecord", COMMENTAIRES_TABLE, commentId, record]]);
      var compte = getCompteById(compteId);
      logActivity("comment_edited", compteId, compte ? compte.Name : "", newText.substring(0, 80));
      showToast("Note mise \xE0 jour", "success");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error updating comment:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }

  // src/crud/tasks.js
  async function addCrmTask(compteId) {
    var title = getVal("new-task-title", "").trim();
    if (!title) return;
    var record = {
      Compte_Id: compteId,
      Titre: title,
      Statut: "a_faire",
      Date_Echeance: toEpoch(getVal("new-task-due", "")),
      Assigne_A: parseInt(getVal("new-task-assignee", "0")) || 0,
      Cree_Le: Math.floor(Date.now() / 1e3)
    };
    try {
      await grist.docApi.applyUserActions([["AddRecord", TACHES_TABLE, null, record]]);
      var compte = getCompteById(compteId);
      logActivity("task_added", compteId, compte ? compte.Name : "", title);
      showToast("T\xE2che ajout\xE9e", "success");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error adding task:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  async function clearRelance(compteId) {
    try {
      var record = {};
      setField(record, "comptes", "nextAction", "");
      setField(record, "comptes", "relanceDate", null);
      await grist.docApi.applyUserActions([["UpdateRecord", COMPTES_TABLE, compteId, record]]);
      showToast("Relance marqu\xE9e comme trait\xE9e", "success");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error clearing relance:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  async function toggleCrmTask(taskId, compteId, done) {
    try {
      await grist.docApi.applyUserActions([["UpdateRecord", TACHES_TABLE, taskId, { Statut: done ? "fait" : "a_faire" }]]);
      var task = crmTasks.find(function(tk) {
        return tk.id === taskId;
      });
      var compte = getCompteById(compteId);
      logActivity(done ? "task_completed" : "task_reopened", compteId, compte ? compte.Name : "", task ? task.Title : "");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error toggling task:", e);
    }
  }
  async function deleteCrmTask(taskId, compteId) {
    if (!isOwner) return;
    var confirmed = await showConfirmModal("Supprimer cette t\xE2che ?", "Supprimer la t\xE2che");
    if (!confirmed) return;
    try {
      var task = crmTasks.find(function(tk) {
        return tk.id === taskId;
      });
      var compte = getCompteById(compteId);
      await grist.docApi.applyUserActions([["RemoveRecord", TACHES_TABLE, taskId]]);
      logActivity("task_deleted", compteId, compte ? compte.Name : "", task ? task.Title : "");
      showToast("T\xE2che supprim\xE9e", "info");
      await loadAllData();
      openEditCompteModal(compteId, true);
    } catch (e) {
      console.error("[CRM] Error deleting task:", e);
    }
  }

  // src/crud/equipe.js
  function buildEquipeRoleOptions(selectedRole) {
    var html = '<option value="">\u2014 R\xF4le \u2014</option>';
    getEquipeRoles().forEach(function(r) {
      html += '<option value="' + sanitize(r) + '"' + (selectedRole === r ? " selected" : "") + ">" + sanitize(r) + "</option>";
    });
    html += '<option value="__new__">+ Cr\xE9er un nouveau r\xF4le...</option>';
    return html;
  }
  function handleEquipeRoleSelectChange(select) {
    var customInput = document.getElementById("new-equipe-role-custom");
    if (!customInput) return;
    if (select.value === "__new__") {
      customInput.classList.remove("hidden");
      customInput.focus();
    } else {
      customInput.classList.add("hidden");
      customInput.value = "";
    }
  }
  async function addEquipeMember() {
    var name = getVal("new-equipe-name", "").trim();
    if (!name) return;
    var roleSelectValue = getVal("new-equipe-role", "");
    var role = roleSelectValue;
    if (roleSelectValue === "__new__") {
      var newRole = getVal("new-equipe-role-custom", "").trim();
      if (!newRole) {
        showToast("Indiquez le nom du nouveau r\xF4le", "error");
        return;
      }
      await addEquipeRole(newRole);
      role = newRole;
    }
    var record = {};
    setField(record, "equipe", "name", name);
    setField(record, "equipe", "email", getVal("new-equipe-email", "").trim());
    setField(record, "equipe", "role", role);
    try {
      await grist.docApi.applyUserActions([["AddRecord", EQUIPE_TABLE, null, record]]);
      showToast("Membre ajout\xE9", "success");
      await loadAllData();
      renderSettingsView();
    } catch (e) {
      console.error("[CRM] Error adding equipe member:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }
  async function deleteEquipeMember(memberId) {
    if (!isOwner) return;
    var member = getEquipeMemberById(memberId);
    var usedAsResponsible = comptes.some(function(c) {
      return c.Responsible === memberId;
    });
    var usedAsAssignee = crmTasks.some(function(t2) {
      return t2.Assignee === memberId;
    });
    var warning = usedAsResponsible || usedAsAssignee ? " Ce membre est actuellement assign\xE9 \xE0 un ou plusieurs comptes/t\xE2ches." : "";
    var confirmed = await showConfirmModal(
      "Supprimer " + (member ? member.Nom : "ce membre") + " de l\u2019\xE9quipe ?" + warning,
      "Supprimer le membre"
    );
    if (!confirmed) return;
    try {
      await grist.docApi.applyUserActions([["RemoveRecord", EQUIPE_TABLE, memberId]]);
      showToast("Membre supprim\xE9", "info");
      await loadAllData();
      renderSettingsView();
    } catch (e) {
      console.error("[CRM] Error deleting equipe member:", e);
    }
  }

  // src/views/kanban.js
  var MAX_RECENT_CLIENTS = 15;
  function renderKanbanView() {
    var board = document.getElementById("kanban-board");
    if (!board) return;
    var statuses = getKanbanStatuses();
    var filtered = getFilteredComptes();
    var html = "";
    for (var s = 0; s < statuses.length; s++) {
      var col = statuses[s];
      var colComptes = filtered.filter(function(c) {
        return c.Status === col.key;
      });
      if (col.marksAsClient) {
        colComptes = colComptes.slice().sort(function(a, b) {
          return (b.Client_Depuis || b.Created_At || 0) - (a.Client_Depuis || a.Created_At || 0);
        });
        if (!kanbanShowAll) colComptes = colComptes.slice(0, MAX_RECENT_CLIENTS);
      }
      html += '<div class="kanban-column">';
      html += '<div class="kanban-col-header" style="--kanban-col-color:' + col.color + "; border-bottom-color:" + col.color + ';">';
      html += '<div class="kanban-col-header-left"><span>' + sanitize(col.label) + '</span></div><span class="kanban-count">' + colComptes.length + "</span>";
      html += "</div>";
      html += '<div class="kanban-cards" data-status="' + sanitize(col.key) + '" ondragover="onKanbanDragOver(event)" ondrop="onKanbanDrop(event)" ondragleave="onKanbanDragLeave(event)">';
      for (var i = 0; i < colComptes.length; i++) {
        html += renderCompteCard(colComptes[i]);
      }
      if (colComptes.length === 0) html += '<div class="kanban-empty">' + t("noComptes") + "</div>";
      html += "</div></div>";
    }
    board.innerHTML = html;
  }
  function renderCompteCard(compte) {
    var typeClass = "type-" + compte.Type;
    var prioClass = "dot-" + compte.Priority;
    var primaryContact = getPrimaryContact(compte.id);
    var relanceLate = isRelanceOverdue(compte);
    var relanceSoon = isRelanceUpcoming(compte);
    var relanceClass = relanceLate ? "relance-late" : relanceSoon ? "relance-soon" : "";
    var html = '<div class="compte-card ' + relanceClass + '" draggable="true" ondragstart="onKanbanDragStart(event, ' + compte.id + ')" onclick="openEditCompteModal(' + compte.id + ')">';
    html += '<div class="compte-card-top">';
    html += '<span class="type-badge ' + typeClass + '">' + getAccountTypeLabel(compte.Type) + "</span>";
    html += '<span class="priority-dot ' + prioClass + '"></span>';
    html += "</div>";
    html += '<div class="compte-card-name">' + sanitize(compte.Name) + "</div>";
    if (primaryContact) html += '<div class="compte-card-contact">\u{1F464} ' + sanitize(primaryContact.Name) + "</div>";
    if (compte.Amount) html += '<div class="compte-card-amount">' + formatAmount(compte.Amount) + "</div>";
    if (compte.Next_Action) html += '<div class="compte-card-next">\u2192 ' + sanitize(getNextActionLabel(compte.Type, compte.Next_Action)) + "</div>";
    if (compte.Relance_Date) {
      html += '<div class="compte-card-relance ' + relanceClass + '">\u{1F4C5} ' + formatDate(compte.Relance_Date) + (relanceLate ? " (" + t("overdue") + ")" : "") + "</div>";
    }
    html += "</div>";
    return html;
  }
  var draggedCompteId = null;
  function onKanbanDragStart(e, compteId) {
    draggedCompteId = compteId;
    e.dataTransfer.effectAllowed = "move";
  }
  function onKanbanDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  }
  function onKanbanDragLeave(e) {
    e.currentTarget.classList.remove("drag-over");
  }
  async function onKanbanDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    var newStatus = e.currentTarget.getAttribute("data-status");
    if (!draggedCompteId || !newStatus) return;
    var compte = getCompteById(draggedCompteId);
    if (!compte || compte.Status === newStatus) {
      draggedCompteId = null;
      return;
    }
    try {
      var statutCol = getColumnName("comptes", "status");
      var record = {};
      record[statutCol] = newStatus;
      var newStage = getKanbanStatuses().find(function(s) {
        return s.key === newStatus;
      });
      var converted = false;
      var reverted = false;
      if (newStage && newStage.marksAsClient && compte.Type === "prospect") {
        setField(record, "comptes", "type", "client");
        record.Client_Depuis = Math.floor(Date.now() / 1e3);
        converted = true;
      } else if (newStage && !newStage.marksAsClient && compte.Type === "client") {
        setField(record, "comptes", "type", "prospect");
        record.Client_Depuis = null;
        reverted = true;
      }
      await grist.docApi.applyUserActions([["UpdateRecord", COMPTES_TABLE, draggedCompteId, record]]);
      if (converted) {
        showToast(currentLang === "fr" ? "\u{1F91D} " + compte.Name + " est maintenant client !" : "\u{1F91D} " + compte.Name + " is now a client!", "success");
      } else if (reverted) {
        showToast(currentLang === "fr" ? compte.Name + " redevient prospect." : compte.Name + " is a prospect again.", "info");
      } else {
        showToast(t("compteMoved"), "success");
      }
      await loadAllData();
    } catch (err) {
      console.error("[CRM] Error moving compte:", err);
    }
    draggedCompteId = null;
  }
  function setKanbanSearch(value) {
    setKanbanSearchState(value);
    renderKanbanView();
  }
  function setKanbanShowAll(checked) {
    setKanbanShowAllState(checked);
    renderKanbanView();
  }
  function setFilterType(value) {
    setCurrentFilterType(value || null);
    refreshAllViews();
  }
  function setFilterCategory(value) {
    setCurrentFilterCategory(value || null);
    refreshAllViews();
  }

  // src/views/table.js
  var tableSortField = null;
  var tableSortAsc = true;
  var tableFilterTypes = [];
  var tableFilterPriorities = [];
  function sortTable(field) {
    if (tableSortField === field) {
      tableSortAsc = !tableSortAsc;
    } else {
      tableSortField = field;
      tableSortAsc = true;
    }
    renderTableView();
  }
  function populateTableFilterOptions() {
    var statusSelect = document.getElementById("table-filter-status");
    if (statusSelect) {
      var currentVal = statusSelect.value;
      var html = '<option value="">' + (currentLang === "fr" ? "Tous statuts" : "All statuses") + "</option>";
      getKanbanStatuses().forEach(function(s) {
        html += '<option value="' + sanitize(s.key) + '">' + sanitize(s.label) + "</option>";
      });
      statusSelect.innerHTML = html;
      statusSelect.value = currentVal;
    }
    var respSelect = document.getElementById("table-filter-responsible");
    if (respSelect) {
      var currentRespVal = respSelect.value;
      var html2 = '<option value="">' + (currentLang === "fr" ? "Tous responsables" : "All owners") + "</option>";
      equipe.forEach(function(m) {
        html2 += '<option value="' + m.id + '">' + sanitize(m.Nom) + "</option>";
      });
      respSelect.innerHTML = html2;
      respSelect.value = currentRespVal;
    }
  }
  function renderTableView() {
    var container = document.getElementById("table-view");
    if (!container) return;
    populateTableFilterOptions();
    var searchEl = document.getElementById("table-search");
    var search = searchEl ? searchEl.value.toLowerCase() : "";
    var typeFilterEl = document.getElementById("table-filter-type");
    var typeFilter = typeFilterEl ? typeFilterEl.value : "";
    var statusFilterEl = document.getElementById("table-filter-status");
    var statusFilter = statusFilterEl ? statusFilterEl.value : "";
    var respFilterEl = document.getElementById("table-filter-responsible");
    var respFilter = respFilterEl ? respFilterEl.value : "";
    var filtered = comptes.filter(function(c2) {
      if (tableFilterTypes.length && tableFilterTypes.indexOf(c2.Type) === -1) return false;
      if (tableFilterPriorities.length && tableFilterPriorities.indexOf(c2.Priority) === -1) return false;
      if (typeFilter && c2.Type !== typeFilter) return false;
      if (statusFilter && c2.Status !== statusFilter) return false;
      if (respFilter && String(c2.Responsible) !== respFilter) return false;
      if (search) {
        var primaryContact = getPrimaryContact(c2.id);
        var text = [c2.Name, getEquipeMemberName(c2.Responsible), c2.Category, c2.Tag, primaryContact ? primaryContact.Name : "", primaryContact ? primaryContact.Email : ""].join(" ").toLowerCase();
        if (text.indexOf(search) === -1) return false;
      }
      return true;
    });
    if (tableSortField) {
      var dir = tableSortAsc ? 1 : -1;
      filtered.sort(function(a, b) {
        var va, vb;
        switch (tableSortField) {
          case "Name":
            va = (a.Name || "").toLowerCase();
            vb = (b.Name || "").toLowerCase();
            break;
          case "Type":
            va = a.Type || "";
            vb = b.Type || "";
            break;
          case "Status":
            va = getStatusLabel(a.Status);
            vb = getStatusLabel(b.Status);
            break;
          case "Priority":
            var po = { high: 0, medium: 1, low: 2 };
            va = po[a.Priority] !== void 0 ? po[a.Priority] : 3;
            vb = po[b.Priority] !== void 0 ? po[b.Priority] : 3;
            break;
          case "Amount":
            va = Number(a.Amount) || 0;
            vb = Number(b.Amount) || 0;
            break;
          case "Relance_Date":
            va = a.Relance_Date || 0;
            vb = b.Relance_Date || 0;
            break;
          default:
            va = "";
            vb = "";
        }
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });
    }
    function sortIcon(field) {
      return tableSortField === field ? tableSortAsc ? " \u25B2" : " \u25BC" : " \u21C5";
    }
    var thStyle = "cursor:pointer;user-select:none;";
    var html = '<table class="data-table">';
    html += "<thead><tr>";
    html += '<th style="' + thStyle + `" onclick="sortTable('Name')">` + t("colName") + sortIcon("Name") + "</th>";
    html += '<th style="' + thStyle + `" onclick="sortTable('Type')">` + t("colType") + sortIcon("Type") + "</th>";
    html += '<th style="' + thStyle + `" onclick="sortTable('Status')">` + t("colStatus") + sortIcon("Status") + "</th>";
    html += '<th style="' + thStyle + `" onclick="sortTable('Priority')">` + t("colPriority") + sortIcon("Priority") + "</th>";
    html += "<th>" + t("colResponsible") + "</th>";
    html += '<th style="' + thStyle + `" onclick="sortTable('Amount')">` + t("colAmount") + sortIcon("Amount") + "</th>";
    html += "<th>" + t("colNextAction") + "</th>";
    html += "<th>" + (currentLang === "fr" ? "Date prochaine action" : "Next action date") + "</th>";
    html += '<th style="' + thStyle + `" onclick="sortTable('Relance_Date')">` + t("colRelance") + sortIcon("Relance_Date") + "</th>";
    html += "<th>" + t("colActions") + "</th>";
    html += "</tr></thead><tbody>";
    for (var i = 0; i < filtered.length; i++) {
      var c = filtered[i];
      var relanceLate = isRelanceOverdue(c);
      html += '<tr class="clickable-row">';
      html += '<td onclick="openEditCompteModal(' + c.id + ')"><strong>' + sanitize(c.Name) + "</strong></td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="type-badge type-' + c.Type + '">' + getAccountTypeLabel(c.Type) + "</span></td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="status-badge" style="background:' + getStatusColor(c.Status) + "22;color:" + getStatusColor(c.Status) + ';">\u25CF ' + sanitize(getStatusLabel(c.Status)) + "</span></td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')"><span class="priority-dot dot-' + c.Priority + '"></span> ' + t("priority" + capitalize(c.Priority)) + "</td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')">' + sanitize(getEquipeMemberName(c.Responsible)) + "</td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')">' + formatAmount(c.Amount) + "</td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')">' + sanitize(c.Next_Action) + "</td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')">' + (c.Next_Action_Date ? formatDate(c.Next_Action_Date) : t("noDate")) + "</td>";
      html += '<td onclick="openEditCompteModal(' + c.id + ')" style="' + (relanceLate ? "color:#dc2626;font-weight:700;" : "") + '">' + (c.Relance_Date ? formatDate(c.Relance_Date) : t("noDate")) + "</td>";
      html += '<td onclick="event.stopPropagation();">';
      if (isOwner) html += '<button class="btn-icon" onclick="deleteCompte(' + c.id + ')" title="' + t("delete") + '">\u{1F5D1}\uFE0F</button>';
      html += "</td></tr>";
    }
    if (filtered.length === 0) {
      html += '<tr><td colspan="10" style="text-align:center;color:#94a3b8;padding:24px;">' + t("noComptes") + "</td></tr>";
    }
    html += "</tbody></table>";
    container.innerHTML = html;
  }

  // src/views/relances.js
  function renderRelancesView() {
    var container = document.getElementById("relances-view");
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
    var html = "";
    html += renderRelanceGroup(currentLang === "fr" ? "\u{1F534} En retard" : "\u{1F534} Overdue", late, true);
    html += renderRelanceGroup(currentLang === "fr" ? "\u{1F7E1} Cette semaine" : "\u{1F7E1} This week", soon, false);
    html += renderRelanceGroup(currentLang === "fr" ? "\u26AA \xC0 venir" : "\u26AA Upcoming", later, false);
    if (late.length === 0 && soon.length === 0 && later.length === 0) {
      html = '<div class="empty-state">' + (currentLang === "fr" ? "Aucune relance programm\xE9e. Ajoutez une date de relance sur une fiche pour la voir appara\xEEtre ici." : "No reminders scheduled.") + "</div>";
    }
    container.innerHTML = html;
  }
  function renderRelanceGroup(title, list, isLate) {
    if (list.length === 0) return "";
    var html = '<div class="relance-group">';
    html += '<h3 class="relance-group-title">' + sanitize(title) + ' <span class="relance-group-count">' + list.length + "</span></h3>";
    html += '<div class="relance-list">';
    for (var i = 0; i < list.length; i++) {
      var c = list[i];
      var days = daysFromNow(c.Relance_Date);
      var daysLabel = days < 0 ? Math.abs(days) + (currentLang === "fr" ? " j de retard" : " days overdue") : days === 0 ? currentLang === "fr" ? "Aujourd\u2019hui" : "Today" : currentLang === "fr" ? "dans " + days + " j" : "in " + days + " d";
      html += '<div class="relance-item ' + (isLate ? "relance-item-late" : "") + '" onclick="openEditCompteModal(' + c.id + ')">';
      html += '<div class="relance-item-main">';
      html += '<span class="type-badge type-' + c.Type + '">' + getAccountTypeLabel(c.Type) + "</span>";
      html += "<strong>" + sanitize(c.Name) + "</strong>";
      if (c.Next_Action) html += '<span class="relance-item-action">' + sanitize(c.Next_Action) + "</span>";
      html += "</div>";
      html += '<div class="relance-item-date">' + formatDate(c.Relance_Date) + ' <span class="relance-days">(' + daysLabel + ")</span></div>";
      html += "</div>";
    }
    html += "</div></div>";
    return html;
  }

  // src/views/stats.js
  function renderStatsView() {
    var container = document.getElementById("stats-view");
    if (!container) return;
    var clients = comptes.filter(function(c) {
      return c.Type === "client";
    });
    var prospects = comptes.filter(function(c) {
      return c.Type === "prospect";
    });
    var anciens = comptes.filter(function(c) {
      return c.Type === "ancien";
    });
    var caTotal = clients.reduce(function(sum, c) {
      return sum + (Number(c.Amount) || getSignedContractsTotal(c.id));
    }, 0);
    var pipelineTotal = prospects.reduce(function(sum, c) {
      return sum + (Number(c.Amount) || 0);
    }, 0);
    var relanceLate = comptes.filter(isRelanceOverdue).length;
    var relancePending = getRelanceComptes().length;
    var html = '<div class="stats-grid">';
    html += statCard(t("statTotal"), comptes.length, "#64748b");
    html += statCard(t("statClients"), clients.length, "#22c55e");
    html += statCard(t("statProspects"), prospects.length, "#3b82f6");
    html += statCard(t("statAnciens"), anciens.length, "#94a3b8");
    html += statCard(t("statCA"), formatAmount(caTotal), "#16a34a");
    html += statCard(t("statPipeline"), formatAmount(pipelineTotal), "#2563eb");
    html += statCard(t("statRelances"), relancePending, "#f59e0b");
    html += statCard(t("statRelancesLate"), relanceLate, "#dc2626");
    html += "</div>";
    html += '<div class="stats-charts">';
    html += renderPipelineChart(comptes);
    html += renderPriorityChart();
    html += renderCAPipelinePieChart();
    html += "</div>";
    container.innerHTML = html;
    drawCAPipelinePieChart();
  }
  function statCard(label, value, color) {
    return '<div class="stat-card"><div class="stat-value" style="color:' + (color || "var(--color-accent-cyan)") + ';">' + value + '</div><div class="stat-label">' + sanitize(label) + "</div></div>";
  }
  function renderPipelineChart(prospects) {
    var statuses = getKanbanStatuses();
    var html = '<div class="chart-card"><h4>' + (currentLang === "fr" ? "R\xE9partition du pipeline" : "Pipeline breakdown") + "</h4>";
    var maxCount = Math.max(1, statuses.map(function(s) {
      return prospects.filter(function(p) {
        return p.Status === s.key;
      }).length;
    }).reduce(function(a, b) {
      return Math.max(a, b);
    }, 0));
    html += '<div class="bar-chart">';
    statuses.forEach(function(s) {
      var count = prospects.filter(function(p) {
        return p.Status === s.key;
      }).length;
      var pct = Math.round(count / maxCount * 100);
      html += '<div class="bar-row">';
      html += '<span class="bar-label">' + sanitize(s.label) + "</span>";
      html += '<div class="bar-track"><div class="bar-fill" style="width:' + pct + "%;background:" + s.color + ';"></div></div>';
      html += '<span class="bar-value">' + count + "</span>";
      html += "</div>";
    });
    html += "</div></div>";
    return html;
  }
  function renderPriorityChart() {
    var prios = [
      { key: "high", label: t("priorityHigh"), color: "#ef4444" },
      { key: "medium", label: t("priorityMedium"), color: "#f59e0b" },
      { key: "low", label: t("priorityLow"), color: "#22c55e" }
    ];
    var maxCount = Math.max(1, prios.map(function(p) {
      return comptes.filter(function(c) {
        return c.Priority === p.key;
      }).length;
    }).reduce(function(a, b) {
      return Math.max(a, b);
    }, 0));
    var html = '<div class="chart-card"><h4>' + (currentLang === "fr" ? "R\xE9partition par priorit\xE9" : "By priority") + "</h4>";
    html += '<div class="bar-chart">';
    prios.forEach(function(p) {
      var count = comptes.filter(function(c) {
        return c.Priority === p.key;
      }).length;
      var pct = Math.round(count / maxCount * 100);
      html += '<div class="bar-row">';
      html += '<span class="bar-label">' + sanitize(p.label) + "</span>";
      html += '<div class="bar-track"><div class="bar-fill" style="width:' + pct + "%;background:" + p.color + ';"></div></div>';
      html += '<span class="bar-value">' + count + "</span>";
      html += "</div>";
    });
    html += "</div></div>";
    return html;
  }
  function renderCAPipelinePieChart() {
    return '<div class="chart-card"><h4>' + (currentLang === "fr" ? "CA par \xE9tape du pipeline" : "Revenue by pipeline stage") + '</h4><div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;"><canvas id="ca-pie-chart" width="180" height="180" style="flex-shrink:0;"></canvas><div id="ca-pie-legend" style="display:flex;flex-direction:column;gap:7px;font-size:13px;"></div></div></div>';
  }
  function drawCAPipelinePieChart() {
    var canvas = document.getElementById("ca-pie-chart");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var statuses = getKanbanStatuses();
    var segments = statuses.map(function(s) {
      var total = comptes.filter(function(c) {
        return c.Status === s.key;
      }).reduce(function(sum, c) {
        return sum + (Number(c.Amount) || 0);
      }, 0);
      return { label: s.label, color: s.color, value: total };
    }).filter(function(s) {
      return s.value > 0;
    });
    var grandTotal = segments.reduce(function(sum, s) {
      return sum + s.value;
    }, 0);
    var legend = document.getElementById("ca-pie-legend");
    if (grandTotal === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "13px Barlow, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText(currentLang === "fr" ? "Aucune donn\xE9e" : "No data", 90, 95);
      return;
    }
    var cx = canvas.width / 2, cy = canvas.height / 2, r = 78, innerR = 38;
    var startAngle = -Math.PI / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    segments.forEach(function(s) {
      var slice = s.value / grandTotal * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      startAngle += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = "#271A79";
    ctx.font = "bold 12px Barlow, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(formatAmount(grandTotal), cx, cy);
    if (legend) {
      legend.innerHTML = segments.map(function(s) {
        var pct = Math.round(s.value / grandTotal * 100);
        return '<div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + s.color + ';flex-shrink:0;"></span><span style="color:#271A79;font-weight:600;">' + sanitize(s.label) + '</span><span style="color:#5C5A8A;margin-left:auto;padding-left:8px;">' + formatAmount(s.value) + " (" + pct + "%)</span></div>";
      }).join("");
    }
  }

  // src/views/carte.js
  var carteMap = null;
  var carteMarkersLayer = null;
  var carteFilterType = "";
  var carteFilterDepartement = "";
  var carteMode = "pins";
  var carteMetric = "count";
  var carteGeoJsonData = null;
  var carteGeoJsonLoading = null;
  var FRANCE_BOUNDS = [[41, -5.5], [51.5, 10]];
  function getCarteComptes() {
    return comptes.filter(function(c) {
      if (c.Address_Lat == null || c.Address_Lng == null) return false;
      var isEligibleType = c.Type === "client" || c.Type === "prospect" && !isStageStopFollowUp(c.Status);
      if (!isEligibleType) return false;
      if (carteFilterType && c.Type !== carteFilterType) return false;
      if (carteFilterDepartement && getCompteDepartement(c) !== carteFilterDepartement) return false;
      return true;
    });
  }
  function populateCarteDepartementSelect() {
    var sel = document.getElementById("carte-departement-select");
    if (!sel) return;
    var eligible = comptes.filter(function(c) {
      return c.Address_Lat != null && c.Address_Lng != null && (c.Type === "client" || c.Type === "prospect" && !isStageStopFollowUp(c.Status));
    });
    var codes = eligible.map(getCompteDepartement).filter(Boolean);
    var uniqueCodes = codes.filter(function(v, idx, arr) {
      return arr.indexOf(v) === idx;
    }).sort();
    var current = sel.value;
    var html = '<option value="">Tous d\xE9partements</option>';
    uniqueCodes.forEach(function(code) {
      html += '<option value="' + code + '"' + (code === current ? " selected" : "") + ">" + sanitize(getDepartementLabel(code)) + "</option>";
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
  function setCarteMode(value) {
    carteMode = value;
    var metricSel = document.getElementById("carte-metric-select");
    var deptSel = document.getElementById("carte-departement-select");
    if (metricSel) metricSel.classList.toggle("hidden", value !== "region");
    if (deptSel) deptSel.classList.toggle("hidden", value === "region");
    document.getElementById("carte-board").classList.toggle("hidden", value === "region");
    document.getElementById("carte-region-wrap").classList.toggle("hidden", value !== "region");
    document.getElementById("carte-domtom-chips").classList.toggle("hidden", value !== "region");
    renderCarteView();
  }
  function setCarteMetric(value) {
    carteMetric = value;
    renderCarteView();
  }
  function getOrCreateCarteMap(container) {
    if (!carteMap) {
      carteMap = L.map(container, { maxBounds: FRANCE_BOUNDS, maxBoundsViscosity: 0.8, minZoom: 5 }).setView([46.6, 2.2], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(carteMap);
      carteMarkersLayer = L.layerGroup().addTo(carteMap);
    } else {
      setTimeout(function() {
        carteMap.invalidateSize();
      }, 50);
    }
    return carteMap;
  }
  var DEPARTEMENT_TO_REGION_CODE = {
    "75": "11",
    "77": "11",
    "78": "11",
    "91": "11",
    "92": "11",
    "93": "11",
    "94": "11",
    "95": "11",
    "18": "24",
    "28": "24",
    "36": "24",
    "37": "24",
    "41": "24",
    "45": "24",
    "21": "27",
    "25": "27",
    "39": "27",
    "58": "27",
    "70": "27",
    "71": "27",
    "89": "27",
    "90": "27",
    "14": "28",
    "27": "28",
    "50": "28",
    "61": "28",
    "76": "28",
    "02": "32",
    "59": "32",
    "60": "32",
    "62": "32",
    "80": "32",
    "08": "44",
    "10": "44",
    "51": "44",
    "52": "44",
    "54": "44",
    "55": "44",
    "57": "44",
    "67": "44",
    "68": "44",
    "88": "44",
    "44": "52",
    "49": "52",
    "53": "52",
    "72": "52",
    "85": "52",
    "22": "53",
    "29": "53",
    "35": "53",
    "56": "53",
    "16": "75",
    "17": "75",
    "19": "75",
    "23": "75",
    "24": "75",
    "33": "75",
    "40": "75",
    "47": "75",
    "64": "75",
    "79": "75",
    "86": "75",
    "87": "75",
    "09": "76",
    "11": "76",
    "12": "76",
    "30": "76",
    "31": "76",
    "32": "76",
    "34": "76",
    "46": "76",
    "48": "76",
    "65": "76",
    "66": "76",
    "81": "76",
    "82": "76",
    "01": "84",
    "03": "84",
    "07": "84",
    "15": "84",
    "26": "84",
    "38": "84",
    "42": "84",
    "43": "84",
    "63": "84",
    "69": "84",
    "73": "84",
    "74": "84",
    "04": "93",
    "05": "93",
    "06": "93",
    "13": "93",
    "83": "93",
    "84": "93",
    "2A": "94",
    "2B": "94"
  };
  var DOM_REGIONS = [
    { code: "971", name: "Guadeloupe" },
    { code: "972", name: "Martinique" },
    { code: "973", name: "Guyane" },
    { code: "974", name: "La R\xE9union" },
    { code: "976", name: "Mayotte" }
  ];
  function loadCarteGeoJson(url, cacheKey) {
    carteGeoJsonData = carteGeoJsonData || {};
    carteGeoJsonLoading = carteGeoJsonLoading || {};
    if (carteGeoJsonData[cacheKey]) return Promise.resolve(carteGeoJsonData[cacheKey]);
    if (carteGeoJsonLoading[cacheKey]) return carteGeoJsonLoading[cacheKey];
    carteGeoJsonLoading[cacheKey] = fetch(url).then(function(r) {
      return r.json();
    }).then(function(data) {
      carteGeoJsonData[cacheKey] = data;
      return data;
    }).catch(function(e) {
      console.error("[CRM] Impossible de charger " + url + " :", e.message);
      carteGeoJsonLoading[cacheKey] = null;
      return null;
    });
    return carteGeoJsonLoading[cacheKey];
  }
  function computeRegionAggregates() {
    var eligible = comptes.filter(function(c) {
      var isEligibleType = c.Type === "client" || c.Type === "prospect" && !isStageStopFollowUp(c.Status);
      if (!isEligibleType) return false;
      if (carteFilterType && c.Type !== carteFilterType) return false;
      return true;
    });
    var regionAgg = {};
    var domAgg = {};
    eligible.forEach(function(c) {
      var deptCode = getCompteDepartement(c);
      if (!deptCode) return;
      var amount = Number(c.Amount) || 0;
      var domMatch = DOM_REGIONS.find(function(d) {
        return d.code === deptCode;
      });
      if (domMatch) {
        if (!domAgg[deptCode]) domAgg[deptCode] = { count: 0, ca: 0 };
        domAgg[deptCode].count += 1;
        domAgg[deptCode].ca += amount;
        return;
      }
      var regionCode = DEPARTEMENT_TO_REGION_CODE[deptCode];
      if (!regionCode) return;
      if (!regionAgg[regionCode]) regionAgg[regionCode] = { count: 0, ca: 0 };
      regionAgg[regionCode].count += 1;
      regionAgg[regionCode].ca += amount;
    });
    return { regionAgg, domAgg };
  }
  function renderCarteLegend(minValue, maxValue, metric) {
    var legendEl = document.getElementById("carte-legend");
    if (!legendEl) return;
    if (carteMode !== "region" || maxValue <= 0) {
      legendEl.classList.add("hidden");
      legendEl.innerHTML = "";
      return;
    }
    var fr = currentLang === "fr";
    var title = metric === "ca" ? fr ? "CA total" : "Total revenue" : fr ? "Nombre de comptes" : "Number of accounts";
    var steps = 5;
    var html = '<span class="carte-legend-title">' + sanitize(title) + " :</span>";
    for (var i = 0; i < steps; i++) {
      var ratio = i / (steps - 1);
      var color = d3.interpolateBlues(0.15 + ratio * 0.75);
      var stepValue = Math.round(minValue + ratio * (maxValue - minValue));
      html += '<span class="carte-legend-item"><span class="carte-legend-swatch" style="background:' + color + ';"></span>' + (metric === "ca" ? formatAmount(stepValue) : stepValue) + "</span>";
    }
    legendEl.innerHTML = html;
    legendEl.classList.remove("hidden");
  }
  function renderCarteView() {
    populateCarteDepartementSelect();
    if (carteMode === "region") {
      renderCarteRegionMap();
      return;
    }
    var container = document.getElementById("carte-board");
    if (!container) return;
    if (typeof L === "undefined") {
      console.error("[CRM] Leaflet (L) non charg\xE9 \u2014 la carte ne peut pas s\u2019afficher. V\xE9rifiez que vendor/leaflet/leaflet.js est bien accessible.");
      container.innerHTML = '<div class="empty-state">' + (currentLang === "fr" ? "Impossible de charger la biblioth\xE8que de carte (Leaflet)." : "Could not load the map library (Leaflet).") + "</div>";
      return;
    }
    getOrCreateCarteMap(container);
    renderCarteLegend(0, 0, carteMetric);
    var list = getCarteComptes();
    var countEl = document.getElementById("carte-count");
    if (countEl) countEl.textContent = list.length + (currentLang === "fr" ? " compte(s) sur la carte" : " account(s) on the map");
    renderCartePins(list);
  }
  function renderCartePins(list) {
    carteMarkersLayer.clearLayers();
    if (list.length === 0) return;
    var bounds = [];
    list.forEach(function(c) {
      var color = c.Type === "client" ? "#42B6C8" : "#22c55e";
      var marker = L.circleMarker([c.Address_Lat, c.Address_Lng], {
        radius: 8,
        fillColor: color,
        color: "#271A79",
        weight: 2,
        fillOpacity: 0.9
      });
      var popupHtml = '<div class="carte-popup-name">' + sanitize(c.Name) + "</div><div>" + sanitize(getAccountTypeLabel(c.Type)) + " \xB7 " + sanitize(c.Address_City || "") + '</div><a href="#" class="carte-popup-link" onclick="closeAllPopups(); openEditCompteModal(' + c.id + '); return false;">' + (currentLang === "fr" ? "Ouvrir la fiche \u2192" : "Open record \u2192") + "</a>";
      marker.bindPopup(popupHtml);
      marker.addTo(carteMarkersLayer);
      bounds.push([c.Address_Lat, c.Address_Lng]);
    });
    if (bounds.length > 0) {
      carteMap.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
    }
  }
  function renderCarteRegionMap() {
    var statusEl = document.getElementById("carte-region-status");
    var countEl = document.getElementById("carte-count");
    if (typeof d3 === "undefined") {
      console.error("[CRM] D3.js non charg\xE9 \u2014 la carte par r\xE9gion ne peut pas s\u2019afficher.");
      if (statusEl) statusEl.textContent = currentLang === "fr" ? "Biblioth\xE8que de carte (D3) indisponible." : "Map library (D3) unavailable.";
      return;
    }
    loadCarteGeoJson("vendor/geo/regions.geojson", "regions").then(function(geojson) {
      if (!geojson) {
        if (statusEl) statusEl.textContent = currentLang === "fr" ? "Contours des r\xE9gions indisponibles." : "Region boundaries unavailable.";
        return;
      }
      if (statusEl) statusEl.style.display = "none";
      var aggs = computeRegionAggregates();
      var regionAgg = aggs.regionAgg;
      var domAgg = aggs.domAgg;
      var metricOf = function(stats) {
        return carteMetric === "ca" ? stats.ca : stats.count;
      };
      var values = Object.keys(regionAgg).map(function(code) {
        return metricOf(regionAgg[code]);
      });
      var maxValue = values.length ? Math.max.apply(null, values) : 0;
      var minValue = 0;
      var totalCount = Object.keys(regionAgg).reduce(function(sum, code) {
        return sum + regionAgg[code].count;
      }, 0) + Object.keys(domAgg).reduce(function(sum, code) {
        return sum + domAgg[code].count;
      }, 0);
      if (countEl) countEl.textContent = totalCount + (currentLang === "fr" ? " compte(s) au total" : " account(s) total");
      var wrap = document.getElementById("carte-region-wrap");
      var width = wrap.clientWidth || 800;
      var height = wrap.clientHeight || 560;
      var svg = d3.select("#carte-region-svg");
      svg.selectAll("*").remove();
      svg.attr("viewBox", "0 0 " + width + " " + height);
      var projection = d3.geoConicConformal().parallels([44, 49]).rotate([-3, 0]);
      var path = d3.geoPath(projection);
      projection.fitSize([width - 20, height - 40], geojson);
      var colorScale = function(value) {
        if (!value || maxValue <= 0) return "#F3F3F3";
        return d3.interpolateBlues(0.15 + value / maxValue * 0.75);
      };
      var tooltip = d3.select("#carte-region-tooltip");
      var g = svg.append("g").attr("transform", "translate(10, 10)");
      g.selectAll("path.region-shape").data(geojson.features).join("path").attr("class", "region-shape").attr("d", path).attr("fill", function(d) {
        var stats = regionAgg[d.properties.code];
        return colorScale(stats ? metricOf(stats) : 0);
      }).on("mousemove", function(event, d) {
        var stats = regionAgg[d.properties.code] || { count: 0, ca: 0 };
        tooltip.style("display", "block").style("left", event.offsetX + 14 + "px").style("top", event.offsetY + 8 + "px").html("<strong>" + sanitize(d.properties.nom) + "</strong><br>" + (currentLang === "fr" ? "Comptes" : "Accounts") + " : " + stats.count + "<br>" + (currentLang === "fr" ? "CA" : "Revenue") + " : " + formatAmount(stats.ca));
      }).on("mouseleave", function() {
        tooltip.style("display", "none");
      });
      g.selectAll("text.region-label").data(geojson.features).join("text").attr("class", "region-label").attr("transform", function(d) {
        return "translate(" + path.centroid(d) + ")";
      }).attr("dy", "-0.3em").attr("fill", function(d) {
        var stats = regionAgg[d.properties.code];
        return getTextColorForBackground(colorScale(stats ? metricOf(stats) : 0));
      }).text(function(d) {
        return d.properties.nom;
      });
      g.selectAll("text.region-amount").data(geojson.features).join("text").attr("class", "region-amount").attr("transform", function(d) {
        return "translate(" + path.centroid(d) + ")";
      }).attr("dy", "0.9em").attr("fill", function(d) {
        var stats = regionAgg[d.properties.code];
        return getTextColorForBackground(colorScale(stats ? metricOf(stats) : 0));
      }).text(function(d) {
        var stats = regionAgg[d.properties.code] || { count: 0, ca: 0 };
        return carteMetric === "ca" ? formatAmount(stats.ca) : stats.count + (currentLang === "fr" ? " compte(s)" : " account(s)");
      });
      renderCarteLegend(minValue, maxValue, carteMetric);
      renderCarteDomtomChips(domAgg, maxValue);
    });
  }
  function renderCarteDomtomChips(domAgg, maxValue) {
    var chipsEl = document.getElementById("carte-domtom-chips");
    if (!chipsEl) return;
    var fr = currentLang === "fr";
    var html = DOM_REGIONS.map(function(d) {
      var stats = domAgg[d.code] || { count: 0, ca: 0 };
      var value = carteMetric === "ca" ? stats.ca : stats.count;
      var bg = value > 0 && maxValue > 0 ? d3.interpolateBlues(0.15 + Math.min(value / maxValue, 1) * 0.75) : "#F3F3F3";
      var textColor = getTextColorForBackground(bg);
      return '<div class="carte-domtom-chip" style="background:' + bg + ";color:" + textColor + ';"><div class="carte-domtom-chip-name">' + sanitize(d.name) + '</div><div class="carte-domtom-chip-value">' + (carteMetric === "ca" ? formatAmount(stats.ca) : stats.count + (fr ? " compte(s)" : " account(s)")) + "</div></div>";
    }).join("");
    chipsEl.innerHTML = html;
  }
  function closeAllPopups() {
    if (carteMap) carteMap.closePopup();
  }

  // src/modal/compte-modal.js
  var editModalActiveTab = "fiche";
  function setEditModalActiveTab(tab) {
    editModalActiveTab = tab;
  }
  var modalExpanded = true;
  var isNewCompteDraft = false;
  function toggleModalExpand(compteId) {
    captureInfoDraftIfPresent();
    modalExpanded = !modalExpanded;
    openEditCompteModal(compteId, true);
  }
  var editModalDraft = null;
  function clearEditModalDraft() {
    editModalDraft = null;
  }
  function captureInfoDraftIfPresent() {
    var nameEl = document.getElementById("compte-name");
    if (!nameEl) return;
    editModalDraft = {
      name: nameEl.value,
      type: getVal("compte-type", ""),
      status: getVal("compte-status", ""),
      priority: getVal("compte-priority", ""),
      responsible: getVal("compte-responsible", "0"),
      amount: getVal("compte-amount", ""),
      nextAction: getVal("compte-next-action", ""),
      nextActionDate: getVal("compte-next-action-date", ""),
      relanceDate: getVal("compte-relance-date", ""),
      category: getVal("compte-category", ""),
      categoryCustom: getVal("compte-category-custom", ""),
      tag: getVal("compte-tag", ""),
      tagCustom: getVal("compte-tag-custom", ""),
      description: getVal("compte-description", ""),
      website: getVal("compte-website", ""),
      addressStreet: getVal("compte-address-street", ""),
      addressZip: getVal("compte-address-zip", ""),
      addressCity: getVal("compte-address-city", ""),
      addressLat: getVal("compte-address-lat", ""),
      addressLng: getVal("compte-address-lng", ""),
      contactName: getVal("compte-contact-name", ""),
      contactEmail: getVal("compte-contact-email", ""),
      contactPhone: getVal("compte-contact-phone", "")
    };
  }
  function openEditCompteModal(compteId, keepTab) {
    var compte = getCompteById(compteId);
    if (!compte) return;
    isNewCompteDraft = false;
    if (!keepTab) {
      editModalActiveTab = "fiche";
      editModalDraft = null;
    }
    var modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = renderCompteModal(compte);
    modalContainer.classList.remove("hidden");
  }
  function openNewCompteModal(initialType) {
    isNewCompteDraft = true;
    editModalActiveTab = "info";
    editModalDraft = null;
    var type = initialType || "prospect";
    var statuses = getKanbanStatuses();
    var defaultStage = type === "client" ? statuses.find(function(s) {
      return s.marksAsClient;
    }) || statuses[0] : statuses[0];
    var draftCompte = {
      id: null,
      Name: "",
      Type: type,
      Status: defaultStage.key,
      Priority: "medium",
      Responsible: 0,
      Amount: 0,
      Next_Action: "",
      Next_Action_Date: null,
      Relance_Date: null,
      Category: "",
      Tag: "",
      Description: "",
      Website: "",
      Address_Street: "",
      Address_Zip: "",
      Address_City: "",
      Address_Lat: null,
      Address_Lng: null,
      Created_At: null
    };
    var modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = renderCompteModal(draftCompte);
    modalContainer.classList.remove("hidden");
  }
  function renderCompteModal(compte) {
    var isNew = compte.id == null;
    var html = '<div class="modal-overlay" onclick="if(event.target===this) closeModal()">';
    html += '<div class="modal modal-large' + (modalExpanded ? " modal-expanded" : "") + '">';
    html += '<div class="modal-header">';
    html += "<h2>" + sanitize(isNew ? t("modalNewCompte") : compte.Name || t("modalEditCompte")) + "</h2>";
    html += '<div class="modal-header-actions">';
    if (!isNew) {
      html += '<button class="modal-expand-btn" title="' + (currentLang === "fr" ? "Agrandir / r\xE9duire" : "Expand / collapse") + '" onclick="toggleModalExpand(' + compte.id + ')">' + (modalExpanded ? "\u2921" : "\u2922") + "</button>";
    }
    html += '<button class="modal-close" onclick="closeModal()">\u2715</button>';
    html += "</div>";
    html += "</div>";
    if (!isNew) {
      html += '<div class="modal-tabs">';
      ["fiche", "info", "contacts", "contrats", "comments", "tasks"].forEach(function(tab) {
        var labels = {
          fiche: currentLang === "fr" ? "Informations" : "Info",
          info: currentLang === "fr" ? "Modifier" : "Edit",
          contacts: t("contactsTitle"),
          contrats: t("contractsTitle"),
          comments: t("commentsTitle"),
          tasks: t("tasksTitle")
        };
        html += '<button class="modal-tab-btn ' + (editModalActiveTab === tab ? "active" : "") + `" onclick="switchModalTab('` + tab + "', " + compte.id + ')">' + labels[tab] + "</button>";
      });
      html += "</div>";
    }
    html += '<div class="modal-body">';
    if (isNew) html += renderInfoTab(compte);
    else if (editModalActiveTab === "fiche") html += renderFicheTab(compte);
    else if (editModalActiveTab === "info") html += renderInfoTab(compte);
    else if (editModalActiveTab === "contacts") html += renderContactsTab(compte);
    else if (editModalActiveTab === "contrats") html += renderContractsTab(compte);
    else if (editModalActiveTab === "comments") html += renderCommentsTab(compte);
    else if (editModalActiveTab === "tasks") html += renderTasksTab(compte);
    html += "</div>";
    if (isNew || editModalActiveTab === "info") {
      html += '<div class="modal-footer">';
      if (isOwner && !isNew) html += '<button class="btn btn-danger" onclick="deleteCompte(' + compte.id + ')">' + t("delete") + "</button>";
      html += '<div style="flex:1;"></div>';
      html += '<button class="btn btn-secondary" onclick="closeModal()">' + t("cancel") + "</button>";
      html += '<button class="btn btn-primary" onclick="saveCompteFromModal(' + compte.id + ')">' + t("save") + "</button>";
      html += "</div>";
    }
    html += "</div></div>";
    return html;
  }
  function switchModalTab(tab, compteId) {
    captureInfoDraftIfPresent();
    editModalActiveTab = tab;
    openEditCompteModal(compteId, true);
  }
  function buildStatusOptions(selectedKey) {
    return getKanbanStatuses().map(function(s) {
      return '<option value="' + s.key + '"' + (selectedKey === s.key ? " selected" : "") + ">" + sanitize(s.label) + "</option>";
    }).join("");
  }
  function buildCategoryOptions(selectedKey) {
    var html = '<option value="">' + (currentLang === "fr" ? "(aucune)" : "(none)") + "</option>";
    var found = !selectedKey;
    getCategoriesList().forEach(function(c) {
      if (c.key === selectedKey) found = true;
      html += '<option value="' + c.key + '"' + (selectedKey === c.key ? " selected" : "") + ">" + sanitize(c.label) + "</option>";
    });
    if (selectedKey && selectedKey !== "__new__" && !found) {
      html += '<option value="' + sanitize(selectedKey) + '" selected>' + sanitize(selectedKey) + "</option>";
    }
    html += '<option value="__new__"' + (selectedKey === "__new__" ? " selected" : "") + ">+ " + (currentLang === "fr" ? "Cr\xE9er une nouvelle cat\xE9gorie..." : "Create new category...") + "</option>";
    return html;
  }
  function handleCategorySelectChange(select) {
    var customInput = document.getElementById("compte-category-custom");
    if (!customInput) return;
    if (select.value === "__new__") {
      customInput.classList.remove("hidden");
      customInput.focus();
    } else {
      customInput.classList.add("hidden");
      customInput.value = "";
    }
  }
  function buildTagOptions(selectedKey) {
    var html = '<option value="">' + (currentLang === "fr" ? "(aucun)" : "(none)") + "</option>";
    var found = !selectedKey;
    getTagsList().forEach(function(tg) {
      if (tg.key === selectedKey) found = true;
      html += '<option value="' + tg.key + '"' + (selectedKey === tg.key ? " selected" : "") + ">" + sanitize(tg.label) + "</option>";
    });
    if (selectedKey && selectedKey !== "__new__" && !found) {
      html += '<option value="' + sanitize(selectedKey) + '" selected>' + sanitize(selectedKey) + "</option>";
    }
    html += '<option value="__new__"' + (selectedKey === "__new__" ? " selected" : "") + ">+ " + (currentLang === "fr" ? "Cr\xE9er un nouveau tag..." : "Create new tag...") + "</option>";
    return html;
  }
  function handleTagSelectChange(select) {
    var customInput = document.getElementById("compte-tag-custom");
    if (!customInput) return;
    if (select.value === "__new__") {
      customInput.classList.remove("hidden");
      customInput.focus();
    } else {
      customInput.classList.add("hidden");
      customInput.value = "";
    }
  }
  function ficheRow(label, value, isLink) {
    var display = value ? sanitize(value) : '<span class="fiche-row-empty">\u2014</span>';
    if (value && isLink === "web") {
      var href = value.indexOf("http") === 0 ? value : "https://" + value;
      display = '<a href="' + sanitize(href) + '" target="_blank" rel="noopener" class="fiche-link">\u{1F310} ' + sanitize(value) + "</a>";
    }
    return '<div class="fiche-row"><span class="fiche-row-label">' + sanitize(label) + '</span><span class="fiche-row-value">' + display + "</span></div>";
  }
  function ficheCard(icon, title, rowsHtml, extraClass) {
    return '<div class="fiche-card' + (extraClass ? " " + extraClass : "") + '"><h4 class="fiche-card-title">' + icon + " " + sanitize(title) + "</h4>" + rowsHtml + "</div>";
  }
  function renderFicheTab(compte) {
    var primaryContact = getPrimaryContact(compte.id);
    var initial = (compte.Name || "?").trim().charAt(0).toUpperCase();
    var fr = currentLang === "fr";
    var html = '<div class="fiche-header">';
    var typeColor = (getAccountTypes().find(function(tp) {
      return tp.key === compte.Type;
    }) || {}).color || "#42B6C8";
    html += '<div class="fiche-avatar" style="background:' + typeColor + ';">' + initial + "</div>";
    html += '<div class="fiche-header-main">';
    html += '<div class="fiche-header-name">' + sanitize(compte.Name || "\u2014") + "</div>";
    html += '<div class="fiche-header-badges">';
    html += '<span class="type-badge type-' + compte.Type + '">' + sanitize(getAccountTypeLabel(compte.Type)) + "</span>";
    html += '<span class="status-badge" style="background:' + getStatusColor(compte.Status) + "22;color:" + getStatusColor(compte.Status) + ';">\u25CF ' + sanitize(getStatusLabel(compte.Status)) + "</span>";
    html += '<span class="priority-dot dot-' + compte.Priority + '"></span> ' + sanitize(t("priority" + capitalize(compte.Priority)));
    html += "</div></div>";
    html += '<div class="fiche-header-actions">';
    html += `<button class="btn btn-primary" onclick="switchModalTab('info', ` + compte.id + ')">\u270F\uFE0F ' + (fr ? "Modifier" : "Edit") + "</button>";
    if (isOwner) html += '<button class="btn btn-danger" onclick="deleteCompte(' + compte.id + ')">\u{1F5D1}\uFE0F ' + t("delete") + "</button>";
    html += "</div>";
    html += "</div>";
    html += '<div class="fiche-cards-grid">';
    html += ficheCard(
      "\u{1F464}",
      fr ? "Contact principal" : "Primary contact",
      ficheRow(fr ? "Nom" : "Name", primaryContact ? primaryContact.Name : "") + ficheRow(fr ? "Email" : "Email", primaryContact ? primaryContact.Email : "") + ficheRow(fr ? "T\xE9l\xE9phone" : "Phone", primaryContact ? primaryContact.Phone : "") + ficheRow(t("fieldWebsite"), compte.Website, "web")
    );
    html += ficheCard(
      "\u{1F4BC}",
      fr ? "Informations commerciales" : "Business info",
      ficheRow(t("fieldStatus"), getStatusLabel(compte.Status)) + ficheRow(t("fieldResponsible"), getEquipeMemberName(compte.Responsible)) + ficheRow(t("fieldAmount"), formatAmount(compte.Amount)) + ficheRow(t("fieldContractsTotal"), formatAmount(getSignedContractsTotal(compte.id)))
    );
    html += ficheCard(
      "\u{1F4C5}",
      fr ? "Suivi & relances" : "Follow-up",
      ficheRow(t("fieldNextAction"), getNextActionLabel(compte.Type, compte.Next_Action)) + ficheRow(t("fieldNextActionDate"), compte.Next_Action_Date ? formatDate(compte.Next_Action_Date) : "") + ficheRow(t("fieldRelanceDate"), compte.Relance_Date ? formatDate(compte.Relance_Date) : "") + ficheRow(fr ? "Cr\xE9\xE9 le" : "Created on", compte.Created_At ? formatDate(compte.Created_At) : "")
    );
    var addressRowsHtml = ficheRow(t("fieldAddressStreet"), compte.Address_Street) + ficheRow(t("fieldAddressZip"), compte.Address_Zip) + ficheRow(t("fieldAddressCity"), compte.Address_City);
    html += ficheCard("\u{1F4CD}", fr ? "Adresse" : "Address", addressRowsHtml);
    html += ficheCard(
      "\u{1F3F7}\uFE0F",
      fr ? "Cat\xE9gorisation" : "Categorization",
      ficheRow(t("fieldCategory"), getCategoryLabel(compte.Category)) + ficheRow(t("fieldTag"), getTagLabel(compte.Tag))
    );
    html += "</div>";
    if (compte.Description) {
      html += ficheCard("\u{1F4DD}", t("fieldDescription"), '<div class="fiche-description">' + sanitize(compte.Description) + "</div>", "fiche-card-full");
    }
    return html;
  }
  function renderInfoTab(compte) {
    var d = editModalDraft;
    var vName = d ? d.name : compte.Name;
    var vType = d ? d.type : compte.Type;
    var vStatus = d ? d.status : compte.Status;
    var vPriority = d ? d.priority : compte.Priority;
    var vResponsible = d ? d.responsible : compte.Responsible;
    var vAmount = d ? d.amount : compte.Amount || 0;
    var vNextAction = d ? d.nextAction : compte.Next_Action;
    var vNextActionDate = d ? d.nextActionDate : epochToInputDate(compte.Next_Action_Date);
    var vRelanceDate = d ? d.relanceDate : epochToInputDate(compte.Relance_Date);
    var vCategory = d ? d.category : compte.Category;
    var vCategoryCustom = d ? d.categoryCustom : "";
    var vTag = d ? d.tag : compte.Tag;
    var vTagCustom = d ? d.tagCustom : "";
    var vDescription = d ? d.description : compte.Description;
    var vWebsite = d ? d.website : compte.Website;
    var vAddressStreet = d ? d.addressStreet : compte.Address_Street;
    var vAddressZip = d ? d.addressZip : compte.Address_Zip;
    var vAddressCity = d ? d.addressCity : compte.Address_City;
    var vAddressLat = d ? d.addressLat : compte.Address_Lat;
    var vAddressLng = d ? d.addressLng : compte.Address_Lng;
    var primaryContact = getPrimaryContact(compte.id);
    var vContactName = d ? d.contactName : primaryContact ? primaryContact.Name : "";
    var vContactEmail = d ? d.contactEmail : primaryContact ? primaryContact.Email : "";
    var vContactPhone = d ? d.contactPhone : primaryContact ? primaryContact.Phone : "";
    var fr2 = currentLang === "fr";
    var html = '<h4 class="form-section-title">' + (fr2 ? "Contact principal" : "Primary contact") + "</h4>";
    html += '<p class="settings-hint">' + (fr2 ? "Pour g\xE9rer plusieurs contacts ou changer lequel est principal, utilisez l\u2019onglet Contacts." : "To manage several contacts or change who is primary, use the Contacts tab.") + "</p>";
    html += '<div class="form-grid">';
    html += formField(fr2 ? "Nom du contact" : "Contact name", '<input id="compte-contact-name" type="text" value="' + sanitize(vContactName) + '">');
    html += formField(fr2 ? "Email du contact" : "Contact email", '<input id="compte-contact-email" type="email" value="' + sanitize(vContactEmail) + '">');
    html += formField(fr2 ? "T\xE9l\xE9phone du contact" : "Contact phone", '<input id="compte-contact-phone" type="text" value="' + sanitize(vContactPhone) + '">');
    html += "</div>";
    html += '<h4 class="form-section-title">' + (fr2 ? "Informations du compte" : "Account information") + "</h4>";
    html += '<div class="form-grid">';
    html += formField(t("fieldName"), '<input id="compte-name" type="text" value="' + sanitize(vName) + '">');
    html += formField(t("fieldType"), '<select id="compte-type" onchange="refreshNextActionOptions()">' + getAccountTypes().map(function(tp) {
      return '<option value="' + tp.key + '"' + (vType === tp.key ? " selected" : "") + ">" + sanitize(tp.label) + "</option>";
    }).join("") + "</select>");
    html += formField(t("fieldStatus"), '<select id="compte-status">' + buildStatusOptions(vStatus) + "</select>");
    html += formField(t("fieldPriority"), '<select id="compte-priority"><option value="high"' + (vPriority === "high" ? " selected" : "") + ">" + t("priorityHigh") + '</option><option value="medium"' + (vPriority === "medium" ? " selected" : "") + ">" + t("priorityMedium") + '</option><option value="low"' + (vPriority === "low" ? " selected" : "") + ">" + t("priorityLow") + "</option></select>");
    html += formField(t("fieldResponsible"), '<select id="compte-responsible">' + buildEquipeOptions(vResponsible) + "</select>");
    html += formField(t("fieldAmount"), '<input id="compte-amount" type="number" step="0.01" value="' + sanitize(vAmount) + '">');
    html += formField(t("fieldContractsTotal"), '<input type="text" value="' + formatAmount(getSignedContractsTotal(compte.id)) + '" disabled style="background:var(--bg-disabled,#f1f5f9);color:#64748b;">');
    html += formField(t("fieldNextAction"), '<select id="compte-next-action" onchange="recalcRelanceDate()">' + buildNextActionOptions(vType, vNextAction) + "</select>");
    html += formField(t("fieldNextActionDate"), '<input id="compte-next-action-date" type="date" value="' + sanitize(vNextActionDate) + '" onchange="recalcRelanceDate()">');
    html += formField(t("fieldRelanceDate"), '<input id="compte-relance-date" type="date" value="' + sanitize(vRelanceDate) + '">');
    html += formField(t("fieldCategory"), '<select id="compte-category" onchange="handleCategorySelectChange(this)">' + buildCategoryOptions(vCategory) + '</select><input id="compte-category-custom" type="text" class="' + (vCategory === "__new__" ? "" : "hidden") + '" value="' + sanitize(vCategoryCustom) + '" placeholder="' + (currentLang === "fr" ? "Nom de la nouvelle cat\xE9gorie" : "New category name") + '" style="margin-top:6px;">');
    html += formField(t("fieldTag"), '<select id="compte-tag" onchange="handleTagSelectChange(this)">' + buildTagOptions(vTag) + '</select><input id="compte-tag-custom" type="text" class="' + (vTag === "__new__" ? "" : "hidden") + '" value="' + sanitize(vTagCustom) + '" placeholder="' + (currentLang === "fr" ? "Nom du nouveau tag" : "New tag name") + '" style="margin-top:6px;">');
    html += formField(t("fieldWebsite"), '<input id="compte-website" type="text" placeholder="https://..." value="' + sanitize(vWebsite) + '">');
    html += '<div class="form-field form-field-address" style="position:relative;">';
    html += "<label>" + sanitize(t("fieldAddressStreet")) + "</label>";
    html += '<input id="compte-address-street" type="text" autocomplete="off" value="' + sanitize(vAddressStreet) + '" oninput="onAddressStreetInput(this.value)" onblur="setTimeout(hideAddressSuggestions, 200)" placeholder="' + (currentLang === "fr" ? "Commencez \xE0 taper pour rechercher..." : "Start typing to search...") + '">';
    html += '<input type="hidden" id="compte-address-lat" value="' + (vAddressLat != null ? vAddressLat : "") + '">';
    html += '<input type="hidden" id="compte-address-lng" value="' + (vAddressLng != null ? vAddressLng : "") + '">';
    html += '<div id="address-suggestions" class="address-suggestions hidden"></div>';
    html += "</div>";
    html += formField(t("fieldAddressZip"), '<input id="compte-address-zip" type="text" value="' + sanitize(vAddressZip) + '">');
    html += formField(t("fieldAddressCity"), '<input id="compte-address-city" type="text" value="' + sanitize(vAddressCity) + '">');
    html += "</div>";
    html += '<div class="form-field-full">' + formField(t("fieldDescription"), '<textarea id="compte-description" rows="3">' + sanitize(vDescription) + "</textarea>") + "</div>";
    return html;
  }
  function formField(label, inputHtml) {
    return '<div class="form-field"><label>' + sanitize(label) + "</label>" + inputHtml + "</div>";
  }
  var _addressAutocompleteTimer = null;
  var _addressSuggestions = [];
  function onAddressStreetInput(value) {
    setVal("compte-address-lat", "");
    setVal("compte-address-lng", "");
    if (_addressAutocompleteTimer) clearTimeout(_addressAutocompleteTimer);
    var query = value.trim();
    if (query.length < 3) {
      hideAddressSuggestions();
      return;
    }
    _addressAutocompleteTimer = setTimeout(function() {
      fetchAddressSuggestions(query);
    }, 300);
  }
  function fetchAddressSuggestions(query) {
    fetch("https://api-adresse.data.gouv.fr/search/?q=" + encodeURIComponent(query) + "&limit=5").then(function(r) {
      return r.json();
    }).then(function(data) {
      _addressSuggestions = (data.features || []).map(function(f) {
        return {
          label: f.properties.label,
          street: (f.properties.housenumber ? f.properties.housenumber + " " : "") + (f.properties.street || f.properties.name || ""),
          postcode: f.properties.postcode || "",
          city: f.properties.city || "",
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0]
        };
      });
      renderAddressSuggestions();
    }).catch(function(e) {
      console.log("[CRM] Address autocomplete failed:", e.message);
    });
  }
  function renderAddressSuggestions() {
    var box = document.getElementById("address-suggestions");
    if (!box) return;
    if (_addressSuggestions.length === 0) {
      hideAddressSuggestions();
      return;
    }
    var html = _addressSuggestions.map(function(s, idx) {
      return '<div class="address-suggestion-item" onclick="selectAddressSuggestion(' + idx + ')">' + sanitize(s.label) + "</div>";
    }).join("");
    box.innerHTML = html;
    box.classList.remove("hidden");
  }
  function hideAddressSuggestions() {
    var box = document.getElementById("address-suggestions");
    if (box) {
      box.innerHTML = "";
      box.classList.add("hidden");
    }
    _addressSuggestions = [];
  }
  function selectAddressSuggestion(idx) {
    var s = _addressSuggestions[idx];
    if (!s) return;
    setVal("compte-address-street", s.street);
    setVal("compte-address-zip", s.postcode);
    setVal("compte-address-city", s.city);
    setVal("compte-address-lat", s.lat);
    setVal("compte-address-lng", s.lng);
    hideAddressSuggestions();
  }
  function setVal(id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value;
  }
  function buildNextActionOptions(compteType, selectedKey) {
    var actions = getNextActions(compteType);
    var html = '<option value="">' + (currentLang === "fr" ? "(aucune)" : "(none)") + "</option>";
    var found = false;
    actions.forEach(function(a) {
      if (a.key === selectedKey) found = true;
      html += '<option value="' + a.key + '"' + (selectedKey === a.key ? " selected" : "") + ">" + sanitize(a.label) + "</option>";
    });
    if (selectedKey && !found) {
      html += '<option value="' + sanitize(selectedKey) + '" selected>' + sanitize(selectedKey) + "</option>";
    }
    return html;
  }
  function refreshNextActionOptions() {
    var type = getVal("compte-type", "prospect");
    var sel = document.getElementById("compte-next-action");
    if (!sel) return;
    sel.innerHTML = buildNextActionOptions(type, "");
    recalcRelanceDate();
  }
  function recalcRelanceDate() {
    var type = getVal("compte-type", "prospect");
    var actionKey = getVal("compte-next-action", "");
    var actionDate = getVal("compte-next-action-date", "");
    var relanceEl = document.getElementById("compte-relance-date");
    if (!relanceEl || !actionKey || !actionDate) return;
    var days = getNextActionReminderDays(type, actionKey);
    if (days == null) return;
    relanceEl.value = addDaysToDateInput(actionDate, days);
  }
  function renderContactsTab(compte) {
    var list = getContactsForCompte(compte.id);
    var html = '<div class="rgpd-notice">' + t("rgpdNotice") + "</div>";
    html += '<div class="sub-list">';
    list.forEach(function(c) {
      html += '<div class="sub-item">';
      html += '<div class="sub-item-main">';
      html += "<strong>" + sanitize(c.Name) + "</strong>";
      if (c.Is_Primary) html += ' <span class="badge-primary">' + (currentLang === "fr" ? "Principal" : "Primary") + "</span>";
      html += '<div class="sub-item-detail">' + [c.Role, c.Email, c.Phone].filter(Boolean).map(sanitize).join(" \xB7 ") + "</div>";
      html += '<label class="consent-check"><input type="checkbox" ' + (c.RGPD_Consent ? "checked" : "") + ' onchange="setContactConsent(' + c.id + ", " + compte.id + ', this.checked)"> ' + t("rgpdConsent");
      if (c.RGPD_Consent_Date) html += ' <span class="consent-date">(' + formatDate(c.RGPD_Consent_Date) + ")</span>";
      html += "</label>";
      html += '<div class="contact-rgpd-actions">';
      html += '<button class="link-btn" onclick="exportContactData(' + c.id + ')">' + (currentLang === "fr" ? "\u2B07\uFE0F T\xE9l\xE9charger les donn\xE9es de ce contact" : "\u2B07\uFE0F Download this contact\u2019s data") + "</button>";
      html += "</div>";
      html += "</div>";
      if (isOwner) {
        html += '<div class="sub-item-actions">';
        html += '<button class="btn-icon" title="' + (currentLang === "fr" ? "Retirer ce contact de la fiche" : "Remove this contact") + '" onclick="deleteContact(' + c.id + ", " + compte.id + ')">\u{1F5D1}\uFE0F</button>';
        html += '<button class="btn-icon" title="' + (currentLang === "fr" ? "Suppression RGPD d\xE9finitive (droit \xE0 l\u2019oubli)" : "Permanent GDPR deletion") + '" onclick="rgpdDeleteContact(' + c.id + ", " + compte.id + ')">\u26A0\uFE0F</button>';
        html += "</div>";
      }
      html += "</div>";
    });
    if (list.length === 0) html += '<div class="empty-state">' + (currentLang === "fr" ? "Aucun contact pour le moment" : "No contact yet") + "</div>";
    html += "</div>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "\u{1F5D1}\uFE0F retire le contact de cette fiche (r\xE9cup\xE9rable en le recr\xE9ant). \u26A0\uFE0F supprime d\xE9finitivement toutes ses donn\xE9es (droit \xE0 l\u2019oubli RGPD, irr\xE9versible)." : "\u{1F5D1}\uFE0F removes the contact from this record. \u26A0\uFE0F permanently erases all its data (GDPR right to erasure, irreversible).") + "</p>";
    html += '<div class="add-form">';
    html += '<input id="new-contact-name" type="text" placeholder="' + (currentLang === "fr" ? "Nom *" : "Name *") + '">';
    html += '<input id="new-contact-role" type="text" placeholder="' + (currentLang === "fr" ? "Fonction" : "Role") + '">';
    html += '<input id="new-contact-email" type="email" placeholder="Email">';
    html += '<input id="new-contact-phone" type="tel" placeholder="' + (currentLang === "fr" ? "T\xE9l\xE9phone" : "Phone") + '">';
    html += '<button class="btn btn-primary" onclick="addContact(' + compte.id + ')">' + t("addContact") + "</button>";
    html += "</div>";
    return html;
  }
  function renderContractsTab(compte) {
    var list = getContractsForCompte(compte.id);
    var statusLabels = { en_cours: currentLang === "fr" ? "En cours" : "In progress", signe: currentLang === "fr" ? "Sign\xE9" : "Signed", termine: currentLang === "fr" ? "Termin\xE9" : "Finished", annule: currentLang === "fr" ? "Annul\xE9" : "Cancelled" };
    var html = '<div class="sub-list">';
    list.forEach(function(c) {
      html += '<div class="sub-item">';
      html += '<div class="sub-item-main">';
      html += "<strong>" + sanitize(c.Label) + "</strong> \u2014 " + formatAmount(c.Amount);
      html += '<div class="sub-item-detail">' + (statusLabels[c.Status] || c.Status) + (c.Start_Date ? " \xB7 " + formatDate(c.Start_Date) : "") + (c.End_Date ? " \u2192 " + formatDate(c.End_Date) : "") + "</div>";
      if (c.Fichier_Nom) {
        html += '<div class="sub-item-file" onclick="downloadContractFile(' + c.id + ')">\u{1F4CE} ' + sanitize(c.Fichier_Nom) + "</div>";
      }
      html += "</div>";
      if (isOwner) html += '<div class="sub-item-actions"><button class="btn-icon" onclick="deleteContract(' + c.id + ", " + compte.id + ')" title="' + t("delete") + '">\u{1F5D1}\uFE0F</button></div>';
      html += "</div>";
    });
    if (list.length === 0) html += '<div class="empty-state">' + (currentLang === "fr" ? "Aucun contrat pour le moment" : "No contract yet") + "</div>";
    html += "</div>";
    html += '<div class="add-form">';
    html += '<input id="new-contract-label" type="text" placeholder="' + (currentLang === "fr" ? "Intitul\xE9 *" : "Label *") + '">';
    html += '<input id="new-contract-amount" type="number" step="0.01" placeholder="' + (currentLang === "fr" ? "Montant" : "Amount") + '">';
    html += '<select id="new-contract-status">';
    Object.keys(statusLabels).forEach(function(key) {
      html += '<option value="' + key + '">' + statusLabels[key] + "</option>";
    });
    html += "</select>";
    html += '<input id="new-contract-start" type="date" title="' + (currentLang === "fr" ? "Date d\xE9but" : "Start date") + '">';
    html += '<input id="new-contract-end" type="date" title="' + (currentLang === "fr" ? "Date fin" : "End date") + '">';
    html += '<label class="file-input-label">\u{1F4CE} ' + (currentLang === "fr" ? "Joindre le contrat" : "Attach file") + '<input id="new-contract-file" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style="display:none;" onchange="updateFileLabel(this)"></label>';
    html += '<button class="btn btn-primary" onclick="addContract(' + compte.id + ')">' + t("addContract") + "</button>";
    html += "</div>";
    return html;
  }
  function renderCommentsTab(compte) {
    var list = getCommentsForCompte(compte.id);
    var html = '<div class="add-form" style="margin-bottom:16px;">';
    html += '<textarea id="new-comment-input" rows="2" placeholder="' + (currentLang === "fr" ? "Ajouter une note..." : "Add a note...") + '" style="flex:1;"></textarea>';
    html += '<button class="btn btn-primary" onclick="addCrmComment(' + compte.id + ')">' + t("addComment") + "</button>";
    html += "</div>";
    html += '<div class="comment-list">';
    list.forEach(function(c) {
      html += '<div class="comment-item" id="comment-item-' + c.id + '">';
      html += '<div class="comment-meta"><strong>' + sanitize(c.Author) + "</strong> \xB7 " + formatDate(c.Created_At) + "</div>";
      html += '<div class="comment-content" id="comment-content-' + c.id + '">' + sanitize(c.Content) + "</div>";
      html += '<div class="comment-actions">';
      if (isOwner || isEditor) html += '<button class="btn-icon-small" title="' + (currentLang === "fr" ? "Modifier" : "Edit") + '" onclick="editCrmComment(' + c.id + ", " + compte.id + ')">\u270F\uFE0F</button>';
      if (isOwner) html += '<button class="btn-icon-small" onclick="deleteCrmComment(' + c.id + ", " + compte.id + ')">\u{1F5D1}\uFE0F</button>';
      html += "</div>";
      html += "</div>";
    });
    if (list.length === 0) html += '<div class="empty-state">' + (currentLang === "fr" ? "Aucune note pour le moment" : "No notes yet") + "</div>";
    html += "</div>";
    return html;
  }
  function renderTasksTab(compte) {
    var fr = currentLang === "fr";
    var html = "";
    if (isStageStopFollowUp(compte.Status)) {
      html += '<div class="relance-summary-card relance-summary-stopped">';
      html += '<div class="relance-summary-header">\u{1F6AB} ' + (fr ? "Sans suite" : "No follow-up") + "</div>";
      html += '<div class="relance-summary-body"><div class="relance-summary-action">' + (fr ? "Ce dossier est class\xE9 \xAB " + sanitize(getStatusLabel(compte.Status)) + " \xBB \u2014 aucune relance ni prochaine action n\u2019est propos\xE9e." : "This record is marked \u201C" + sanitize(getStatusLabel(compte.Status)) + "\u201D \u2014 no reminder or next action is suggested.") + "</div></div>";
      html += "</div>";
    } else if (compte.Relance_Date || compte.Next_Action) {
      var days = compte.Relance_Date ? daysFromNow(compte.Relance_Date) : null;
      var daysLabel = days === null ? "" : days < 0 ? Math.abs(days) + (fr ? " j de retard" : " days overdue") : days === 0 ? fr ? "aujourd\u2019hui" : "today" : fr ? "dans " + days + " j" : "in " + days + " d";
      html += '<div class="relance-summary-card' + (days !== null && days < 0 ? " relance-summary-late" : "") + '">';
      html += '<div class="relance-summary-header">\u{1F514} ' + (fr ? "Relance \xE0 traiter" : "Reminder to handle") + "</div>";
      html += '<div class="relance-summary-body">';
      html += '<div class="relance-summary-action">' + (compte.Next_Action ? sanitize(getNextActionLabel(compte.Type, compte.Next_Action)) : fr ? "(aucune action pr\xE9cis\xE9e)" : "(no action specified)") + "</div>";
      if (compte.Relance_Date) {
        html += '<div class="relance-summary-date">' + (fr ? "Pr\xE9vue le " : "Scheduled for ") + formatDate(compte.Relance_Date) + (daysLabel ? " (" + daysLabel + ")" : "") + "</div>";
      }
      html += "</div>";
      html += '<div class="relance-summary-actions">';
      html += `<button class="btn btn-secondary" onclick="switchModalTab('info', ` + compte.id + ')">\u270F\uFE0F ' + (fr ? "Modifier" : "Edit") + "</button>";
      html += '<button class="btn btn-primary" onclick="clearRelance(' + compte.id + ')">\u2713 ' + (fr ? "Marquer comme trait\xE9e" : "Mark as handled") + "</button>";
      html += "</div>";
      html += "</div>";
    }
    html += '<h4 class="form-section-title">' + (fr ? "T\xE2ches" : "Tasks") + "</h4>";
    var list = getTasksForCompte(compte.id).sort(function(a, b) {
      return (a.Due_Date || 0) - (b.Due_Date || 0);
    });
    html += '<div class="sub-list">';
    list.forEach(function(tsk) {
      html += '<div class="sub-item ' + (tsk.Status === "fait" ? "task-done" : "") + '">';
      html += '<div class="sub-item-main">';
      html += '<label class="task-check"><input type="checkbox" ' + (tsk.Status === "fait" ? "checked" : "") + ' onchange="toggleCrmTask(' + tsk.id + ", " + compte.id + ', this.checked)"> <span>' + sanitize(tsk.Title) + "</span></label>";
      html += '<div class="sub-item-detail">' + (tsk.Due_Date ? formatDate(tsk.Due_Date) : t("noDate")) + (tsk.Assignee ? " \xB7 " + sanitize(getEquipeMemberName(tsk.Assignee)) : "") + "</div>";
      html += "</div>";
      if (isOwner) html += '<div class="sub-item-actions"><button class="btn-icon" onclick="deleteCrmTask(' + tsk.id + ", " + compte.id + ')" title="' + t("delete") + '">\u{1F5D1}\uFE0F</button></div>';
      html += "</div>";
    });
    if (list.length === 0) html += '<div class="empty-state">' + (currentLang === "fr" ? "Aucune t\xE2che pour le moment" : "No task yet") + "</div>";
    html += "</div>";
    html += '<div class="add-form">';
    html += '<input id="new-task-title" type="text" placeholder="' + (currentLang === "fr" ? "Titre *" : "Title *") + '">';
    html += '<input id="new-task-due" type="date" title="' + (currentLang === "fr" ? "\xC9ch\xE9ance" : "Due date") + '">';
    html += '<select id="new-task-assignee">' + buildEquipeOptions(null) + "</select>";
    html += '<button class="btn btn-primary" onclick="addCrmTask(' + compte.id + ')">' + t("addTask") + "</button>";
    html += "</div>";
    return html;
  }
  function closeModal() {
    isNewCompteDraft = false;
    var modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = "";
    modalContainer.classList.add("hidden");
  }
  function showConfirmModal(message, title) {
    return new Promise(function(resolve) {
      var modalContainer = document.getElementById("modal-container");
      var html = '<div class="modal-overlay">';
      html += '<div class="modal modal-small">';
      html += '<div class="modal-header"><h2>' + sanitize(title || (currentLang === "fr" ? "Confirmation" : "Confirm")) + "</h2></div>";
      html += '<div class="modal-body"><p>' + sanitize(message) + "</p></div>";
      html += '<div class="modal-footer">';
      html += '<button class="btn btn-secondary" id="confirm-cancel-btn">' + t("cancel") + "</button>";
      html += '<button class="btn btn-danger" id="confirm-ok-btn">' + t("delete") + "</button>";
      html += "</div></div></div>";
      modalContainer.innerHTML = html;
      modalContainer.classList.remove("hidden");
      document.getElementById("confirm-cancel-btn").onclick = function() {
        closeModal();
        resolve(false);
      };
      document.getElementById("confirm-ok-btn").onclick = function() {
        closeModal();
        resolve(true);
      };
    });
  }

  // src/io/export.js
  function exportComptesToCsv() {
    var headers = ["Nom", "Type", "Statut", "Priorit\xE9", "Responsable", "Montant", "Total contrats sign\xE9s", "Prochaine action", "Date prochaine action", "Date de relance", "Cat\xE9gorie", "Tag", "Notes"];
    var rows = [headers.join(",")];
    comptes.forEach(function(c) {
      rows.push([
        escapeCsv(c.Name),
        escapeCsv(getAccountTypeLabel(c.Type)),
        escapeCsv(getStatusLabel(c.Status)),
        escapeCsv(t("priority" + capitalize(c.Priority))),
        escapeCsv(getEquipeMemberName(c.Responsible)),
        escapeCsv(c.Amount),
        escapeCsv(getSignedContractsTotal(c.id)),
        escapeCsv(c.Next_Action),
        escapeCsv(c.Next_Action_Date ? formatDate(c.Next_Action_Date) : ""),
        escapeCsv(c.Relance_Date ? formatDate(c.Relance_Date) : ""),
        escapeCsv(c.Category),
        escapeCsv(c.Tag),
        escapeCsv(c.Description)
      ].join(","));
    });
    var csv = "\uFEFF" + rows.join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "crm_export_" + (/* @__PURE__ */ new Date()).toISOString().split("T")[0] + ".csv";
    link.click();
    showToast(t("exportCsv") + " \u2713", "success");
  }

  // src/io/import.js
  function triggerCsvImport() {
    var input = document.getElementById("csv-import-input");
    if (input) input.click();
  }
  function triggerExcelImport() {
    var input = document.getElementById("excel-import-input");
    if (input) input.click();
  }
  function findEquipeIdByName(name) {
    if (!name) return 0;
    var n = String(name).trim().toLowerCase();
    var found = equipe.find(function(m) {
      return (m.Nom || "").toLowerCase() === n;
    });
    return found ? found.id : 0;
  }
  async function importComptesRows(rows) {
    if (rows.length < 2) {
      showToast(currentLang === "fr" ? "Fichier vide" : "Empty file", "error");
      return;
    }
    var headerRow = rows[0].map(function(h) {
      return String(h || "").trim().toLowerCase();
    });
    var nameIdx = headerRow.indexOf("nom") !== -1 ? headerRow.indexOf("nom") : headerRow.indexOf("name");
    if (nameIdx === -1) {
      showToast(currentLang === "fr" ? 'Colonne "Nom" introuvable' : 'Column "Name" not found', "error");
      return;
    }
    var typeIdx = headerRow.indexOf("type");
    var respIdx = headerRow.indexOf("responsable") !== -1 ? headerRow.indexOf("responsable") : headerRow.indexOf("responsible");
    var amountIdx = headerRow.indexOf("montant") !== -1 ? headerRow.indexOf("montant") : headerRow.indexOf("amount");
    var catIdx = headerRow.indexOf("cat\xE9gorie") !== -1 ? headerRow.indexOf("cat\xE9gorie") : headerRow.indexOf("categorie");
    var unmatchedResponsibles = [];
    var records = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!row[nameIdx]) continue;
      var rec = {};
      setField(rec, "comptes", "name", row[nameIdx]);
      setField(rec, "comptes", "type", typeIdx !== -1 ? normalizeType(row[typeIdx]) : "prospect");
      setField(rec, "comptes", "status", getKanbanStatuses()[0].key);
      setField(rec, "comptes", "priority", "medium");
      if (respIdx !== -1 && row[respIdx]) {
        var respId = findEquipeIdByName(row[respIdx]);
        if (!respId) unmatchedResponsibles.push(row[respIdx]);
        setField(rec, "comptes", "responsible", respId);
      }
      if (amountIdx !== -1) setField(rec, "comptes", "amount", parseFloat(row[amountIdx]) || 0);
      if (catIdx !== -1) setField(rec, "comptes", "category", row[catIdx]);
      setField(rec, "comptes", "createdAt", Math.floor(Date.now() / 1e3));
      records.push(rec);
    }
    if (records.length === 0) {
      showToast(currentLang === "fr" ? "Aucune ligne valide trouv\xE9e" : "No valid row found", "error");
      return;
    }
    await grist.docApi.applyUserActions([
      ["BulkAddRecord", COMPTES_TABLE, records.map(function() {
        return null;
      }), records]
    ]);
    var msg = records.length + (currentLang === "fr" ? " fiches import\xE9es \u2713" : " records imported \u2713");
    showToast(msg, "success");
    if (unmatchedResponsibles.length) {
      var uniqueNames = unmatchedResponsibles.filter(function(v, idx, arr) {
        return arr.indexOf(v) === idx;
      });
      showToast((currentLang === "fr" ? "Responsables non reconnus (ajoutez-les dans \xC9quipe) : " : "Unknown team members (add them in Team): ") + uniqueNames.join(", "), "info");
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
        console.error("[CRM] CSV import error:", err);
        showToast((currentLang === "fr" ? "Erreur import : " : "Import error: ") + err.message, "error");
      }
      fileInput.value = "";
    };
    reader.readAsText(file, "UTF-8");
  }
  function handleExcelImport(fileInput) {
    var file = fileInput.files[0];
    if (!file) return;
    if (typeof XLSX === "undefined") {
      showToast(currentLang === "fr" ? "Librairie Excel non charg\xE9e" : "Excel library not loaded", "error");
      fileInput.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = async function(e) {
      try {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false, defval: "" });
        await importComptesRows(rows);
      } catch (err) {
        console.error("[CRM] Excel import error:", err);
        showToast((currentLang === "fr" ? "Erreur import : " : "Import error: ") + err.message, "error");
      }
      fileInput.value = "";
    };
    reader.readAsArrayBuffer(file);
  }
  function normalizeType(v) {
    var s = (v || "").toLowerCase().trim();
    if (s.indexOf("client") === 0) return "client";
    if (s.indexOf("ancien") === 0) return "ancien";
    return "prospect";
  }
  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    text = text.replace(/^﻿/, "");
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQuotes) {
        if (ch === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += ch;
        }
      } else {
        if (ch === '"') inQuotes = true;
        else if (ch === ",") {
          row.push(field);
          field = "";
        } else if (ch === "\n") {
          row.push(field);
          rows.push(row);
          row = [];
          field = "";
        } else if (ch === "\r") {
        } else {
          field += ch;
        }
      }
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter(function(r) {
      return r.length > 1 || r.length === 1 && r[0] !== "";
    });
  }

  // src/settings/settings-domain.js
  var defaultAccountTypes = [
    { key: "client", label: "Client", color: "#42B6C8" },
    { key: "prospect", label: "Prospect", color: "#B9FFB7" },
    { key: "ancien", label: "Ancien client", color: "#EEFFEE" }
  ];
  var customAccountTypes = null;
  function getAccountTypes() {
    return customAccountTypes || defaultAccountTypes;
  }
  function getAccountTypeLabel(key) {
    var found = getAccountTypes().find(function(t2) {
      return t2.key === key;
    });
    return found ? found.label : key;
  }
  async function saveAccountTypes() {
    await saveSetting("account_types", JSON.stringify(customAccountTypes));
  }
  var draftAccountTypes = null;
  function renderAccountTypeList() {
    var list = draftAccountTypes || getAccountTypes();
    var html = "";
    if (!list.length) html += '<div class="empty-state">Aucun type</div>';
    list.forEach(function(type, idx) {
      var color = type.color || "#CCCCCC";
      html += '<div class="kanban-status-edit-row">';
      html += '<input type="color" value="' + color + '" title="Couleur du badge" onchange="updateAccountTypeDraftColor(' + idx + ', this.value)">';
      html += '<input type="text" value="' + sanitize(type.label) + '" oninput="updateAccountTypeDraftLabel(' + idx + ', this.value)">';
      html += '<button class="btn-icon" title="Supprimer" onclick="removeAccountTypeDraft(' + idx + ')">\u{1F5D1}\uFE0F</button>';
      html += "</div>";
    });
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="text" id="new-account-type-name" placeholder="' + (currentLang === "fr" ? "Nom du nouveau type" : "New type name") + '" style="flex:1;">';
    html += "</div>";
    return html;
  }
  function applyAccountTypeStyles() {
    var existing = document.getElementById("account-type-dynamic-styles");
    if (!existing) {
      existing = document.createElement("style");
      existing.id = "account-type-dynamic-styles";
      document.head.appendChild(existing);
    }
    var types = getAccountTypes();
    var css = types.map(function(t2) {
      var color = t2.color || "#CCCCCC";
      var r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
      var lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      var textColor = lum < 0.55 ? "white" : "var(--color-primary)";
      return ".type-" + t2.key + " { background: " + color + " !important; color: " + textColor + " !important; }";
    }).join("\n");
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
  function addAccountTypeDraft() {
    if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
    var label = getVal("new-account-type-name", "").trim();
    if (!label) {
      showToast(currentLang === "fr" ? "Indiquez un nom de type avant d\u2019ajouter" : "Enter a type name before adding", "error");
      return;
    }
    var slug = slugifyTypeKey(label);
    var existingKeys = draftAccountTypes.map(function(t2) {
      return t2.key;
    });
    var finalKey = slug, n = 2;
    while (existingKeys.indexOf(finalKey) !== -1) {
      finalKey = slug + "_" + n;
      n++;
    }
    draftAccountTypes.push({ key: finalKey, label, color: "#CCCCCC" });
    commitAccountTypes();
  }
  function removeAccountTypeDraft(idx) {
    if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
    draftAccountTypes.splice(idx, 1);
    document.getElementById("account-type-list").innerHTML = renderAccountTypeList();
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
      console.error("[CRM] \xC9chec sauvegarde types de comptes :", e);
      showToast((currentLang === "fr" ? "\xC9chec de l\u2019enregistrement : " : "Save failed: ") + e.message, "error", 8e3);
      return;
    }
    applyAccountTypeStyles();
    refreshTypeSelects();
    var listEl = document.getElementById("account-type-list");
    if (listEl) listEl.innerHTML = renderAccountTypeList();
    await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "type"), newTypes);
    showToast(currentLang === "fr" ? "Types de comptes enregistr\xE9s" : "Account types saved", "success");
  }
  function refreshTypeSelects() {
    var types = getAccountTypes();
    var kanbanSel = document.getElementById("kanban-type-select");
    if (kanbanSel) {
      var cur = kanbanSel.value;
      kanbanSel.innerHTML = '<option value="">' + t("allTypes") + "</option>" + types.map(function(tp) {
        return '<option value="' + tp.key + '"' + (cur === tp.key ? " selected" : "") + ">" + sanitize(tp.label) + "</option>";
      }).join("");
    }
    var tableSel = document.getElementById("table-filter-type");
    if (tableSel) {
      var cur2 = tableSel.value;
      tableSel.innerHTML = '<option value="">' + t("allTypes") + "</option>" + types.map(function(tp) {
        return '<option value="' + tp.key + '"' + (cur2 === tp.key ? " selected" : "") + ">" + sanitize(tp.label) + "</option>";
      }).join("");
    }
  }
  var defaultNextActionsProspect = [
    { key: "premier_appel", label: "Premier appel", reminderDays: 3 },
    { key: "envoi_devis", label: "Envoi devis", reminderDays: 5 },
    { key: "relance_devis", label: "Relance devis", reminderDays: 3 },
    { key: "rdv_decouverte", label: "RDV d\xE9couverte", reminderDays: 2 },
    { key: "envoi_contrat", label: "Envoi contrat", reminderDays: 3 }
  ];
  var defaultNextActionsClient = [
    { key: "renouvellement_contrat", label: "Renouvellement contrat", reminderDays: 7 },
    { key: "point_suivi", label: "Point de suivi", reminderDays: 5 },
    { key: "facture_a_envoyer", label: "Facture \xE0 envoyer", reminderDays: 3 },
    { key: "upsell", label: "Proposition compl\xE9mentaire", reminderDays: 5 }
  ];
  var customNextActionsProspect = null;
  var customNextActionsClient = null;
  function getNextActions(compteType) {
    if (compteType === "client" || compteType === "ancien") return customNextActionsClient || defaultNextActionsClient;
    return customNextActionsProspect || defaultNextActionsProspect;
  }
  function getNextActionLabel(compteType, key) {
    if (!key) return "";
    var all = (customNextActionsProspect || defaultNextActionsProspect).concat(customNextActionsClient || defaultNextActionsClient);
    var found = all.find(function(a) {
      return a.key === key;
    });
    return found ? found.label : key;
  }
  function getNextActionReminderDays(compteType, key) {
    var found = getNextActions(compteType).find(function(a) {
      return a.key === key;
    });
    return found ? found.reminderDays : null;
  }
  function getAllNextActionsMerged() {
    var seen = {};
    var merged = [];
    (customNextActionsProspect || defaultNextActionsProspect).concat(customNextActionsClient || defaultNextActionsClient).forEach(function(a) {
      if (!seen[a.key]) {
        seen[a.key] = true;
        merged.push(a);
      }
    });
    return merged;
  }
  async function saveNextActionsProspect() {
    await saveSetting("next_actions_prospect", JSON.stringify(customNextActionsProspect));
  }
  async function saveNextActionsClient() {
    await saveSetting("next_actions_client", JSON.stringify(customNextActionsClient));
  }
  var draftNextActionsProspect = null;
  var draftNextActionsClient = null;
  function renderNextActionsList(kind) {
    var isClient = kind === "client";
    var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
    var list = draftVar || getNextActions(isClient ? "client" : "prospect");
    var html = "";
    if (!list.length) html += '<div class="empty-state">Aucune action</div>';
    list.forEach(function(a, idx) {
      html += '<div class="kanban-status-edit-row">';
      html += '<input type="text" value="' + sanitize(a.label) + `" oninput="updateNextActionDraftLabel('` + kind + "', " + idx + ', this.value)">';
      html += '<input type="number" min="0" value="' + (a.reminderDays != null ? a.reminderDays : 3) + '" title="' + (currentLang === "fr" ? "Relancer apr\xE8s (jours)" : "Follow up after (days)") + `" style="width:60px;" onchange="updateNextActionDraftDays('` + kind + "', " + idx + ', this.value)">';
      html += '<span class="settings-hint" style="white-space:nowrap;">' + (currentLang === "fr" ? "j." : "d.") + "</span>";
      html += '<button class="btn-icon" title="' + (currentLang === "fr" ? "Supprimer" : "Delete") + `" onclick="removeNextActionDraft('` + kind + "', " + idx + ')">\u{1F5D1}\uFE0F</button>';
      html += "</div>";
    });
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="text" id="new-next-action-' + kind + '" placeholder="' + (currentLang === "fr" ? "Nom de la nouvelle action" : "New action name") + '" style="flex:1;">';
    html += "</div>";
    return html;
  }
  function updateNextActionDraftLabel(kind, idx, val) {
    var isClient = kind === "client";
    if (isClient) {
      if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions("client")));
      draftNextActionsClient[idx].label = val;
    } else {
      if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions("prospect")));
      draftNextActionsProspect[idx].label = val;
    }
  }
  function updateNextActionDraftDays(kind, idx, val) {
    var days = parseInt(val, 10) || 0;
    var isClient = kind === "client";
    if (isClient) {
      if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions("client")));
      draftNextActionsClient[idx].reminderDays = days;
    } else {
      if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions("prospect")));
      draftNextActionsProspect[idx].reminderDays = days;
    }
  }
  function addNextActionDraft(kind) {
    var isClient = kind === "client";
    var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
    if (!draftVar) {
      draftVar = JSON.parse(JSON.stringify(getNextActions(isClient ? "client" : "prospect")));
      if (isClient) draftNextActionsClient = draftVar;
      else draftNextActionsProspect = draftVar;
    }
    var label = getVal("new-next-action-" + kind, "").trim();
    if (!label) {
      showToast(currentLang === "fr" ? "Indiquez un nom d\u2019action avant d\u2019ajouter" : "Enter an action name before adding", "error");
      return;
    }
    var slug = slugifyTypeKey(label);
    var existingKeys = draftVar.map(function(a) {
      return a.key;
    });
    var finalKey = slug, n = 2;
    while (existingKeys.indexOf(finalKey) !== -1) {
      finalKey = slug + "_" + n;
      n++;
    }
    draftVar.push({ key: finalKey, label, reminderDays: 3 });
    commitNextActions(kind);
  }
  function removeNextActionDraft(kind, idx) {
    var isClient = kind === "client";
    if (isClient) {
      if (!draftNextActionsClient) draftNextActionsClient = JSON.parse(JSON.stringify(getNextActions("client")));
      draftNextActionsClient.splice(idx, 1);
    } else {
      if (!draftNextActionsProspect) draftNextActionsProspect = JSON.parse(JSON.stringify(getNextActions("prospect")));
      draftNextActionsProspect.splice(idx, 1);
    }
    commitNextActions(kind);
  }
  async function commitNextActions(kind) {
    var isClient = kind === "client";
    var draftVar = isClient ? draftNextActionsClient : draftNextActionsProspect;
    if (!draftVar) return;
    try {
      if (isClient) {
        customNextActionsClient = draftVar;
        draftNextActionsClient = null;
        await saveNextActionsClient();
      } else {
        customNextActionsProspect = draftVar;
        draftNextActionsProspect = null;
        await saveNextActionsProspect();
      }
    } catch (e) {
      console.error("[CRM] \xC9chec sauvegarde actions :", e);
      showToast((currentLang === "fr" ? "\xC9chec de l\u2019enregistrement : " : "Save failed: ") + e.message, "error", 8e3);
      return;
    }
    var listEl = document.getElementById("next-actions-list-" + kind);
    if (listEl) listEl.innerHTML = renderNextActionsList(kind);
    await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "nextAction"), getAllNextActionsMerged());
    showToast(currentLang === "fr" ? "Actions enregistr\xE9es" : "Actions saved", "success");
  }
  var defaultKanbanStatuses = [
    { key: "nouveau", label: "Nouveau", color: "#a855f7" },
    { key: "premier_contact", label: "Premier contact", color: "#3b82f6" },
    { key: "negociation", label: "En n\xE9gociation", color: "#f59e0b" },
    { key: "signature", label: "En signature", color: "#8b5cf6" },
    { key: "signe", label: "Contrat sign\xE9", color: "#22c55e", marksAsClient: true },
    { key: "perdu", label: "Perdu", color: "#94a3b8", stopFollowUp: true }
  ];
  var customKanbanStatuses = null;
  function getKanbanStatuses() {
    return customKanbanStatuses || defaultKanbanStatuses;
  }
  async function saveKanbanStatuses() {
    await saveSetting("kanban_statuses", JSON.stringify(customKanbanStatuses));
  }
  function getStatusLabel(key) {
    var statuses = getKanbanStatuses();
    var found = statuses.find(function(s) {
      return s.key === key;
    });
    return found ? found.label : key;
  }
  function getStatusColor(key) {
    var statuses = getKanbanStatuses();
    var found = statuses.find(function(s) {
      return s.key === key;
    });
    return found ? found.color : "#94a3b8";
  }
  var draftKanbanStatuses = null;
  function renderKanbanStatusList() {
    var html = "";
    draftKanbanStatuses.forEach(function(s, i) {
      html += '<div class="kanban-status-edit-row" draggable="true" data-index="' + i + '" ondragstart="onStatusDragStart(event, ' + i + ')" ondragover="onStatusDragOver(event)" ondrop="onStatusDrop(event, ' + i + ')" ondragend="onStatusDragEnd(event)">';
      html += '<span class="drag-handle" title="' + (currentLang === "fr" ? "Glisser pour r\xE9ordonner" : "Drag to reorder") + '">\u283F</span>';
      html += '<input type="color" value="' + s.color + '" onchange="updateKanbanStatusDraft(' + i + `, 'color', this.value)">`;
      html += '<input type="text" value="' + sanitize(s.label) + '" onchange="updateKanbanStatusDraft(' + i + `, 'label', this.value)">`;
      html += '<label class="stage-flag-check" title="' + (currentLang === "fr" ? "Convertit automatiquement le prospect en client" : "Automatically converts prospect to client") + '"><input type="checkbox" ' + (s.marksAsClient ? "checked" : "") + ' onchange="updateKanbanStatusFlag(' + i + `, 'marksAsClient', this.checked)"> \u{1F91D}</label>`;
      html += '<label class="stage-flag-check" title="' + (currentLang === "fr" ? "Sans suite : arr\xEAte les relances et prochaines actions" : "No follow-up: stops reminders and next actions") + '"><input type="checkbox" ' + (s.stopFollowUp ? "checked" : "") + ' onchange="updateKanbanStatusFlag(' + i + `, 'stopFollowUp', this.checked)"> \u{1F6AB}</label>`;
      html += '<button class="btn-icon" onclick="removeKanbanStatusDraft(' + i + ')">\u{1F5D1}\uFE0F</button>';
      html += "</div>";
    });
    return html;
  }
  var draggedStatusIndex = null;
  function onStatusDragStart(e, index) {
    draggedStatusIndex = index;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  }
  function onStatusDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over-row");
  }
  function onStatusDragEnd(e) {
    document.querySelectorAll(".kanban-status-edit-row").forEach(function(el) {
      el.classList.remove("dragging", "drag-over-row");
    });
  }
  function onStatusDrop(e, targetIndex) {
    e.preventDefault();
    document.querySelectorAll(".kanban-status-edit-row").forEach(function(el) {
      el.classList.remove("drag-over-row");
    });
    if (draggedStatusIndex === null || draggedStatusIndex === targetIndex) return;
    var moved = draftKanbanStatuses.splice(draggedStatusIndex, 1)[0];
    draftKanbanStatuses.splice(targetIndex, 0, moved);
    draggedStatusIndex = null;
    document.getElementById("kanban-status-list").innerHTML = renderKanbanStatusList();
  }
  function updateKanbanStatusDraft(index, field, value) {
    draftKanbanStatuses[index][field] = value;
    if (field === "label") {
      draftKanbanStatuses[index].key = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "stage_" + index;
    }
  }
  function updateKanbanStatusFlag(index, flag, checked) {
    draftKanbanStatuses[index][flag] = checked;
  }
  function addKanbanStatusDraft() {
    draftKanbanStatuses.push({ key: "stage_" + draftKanbanStatuses.length, label: currentLang === "fr" ? "Nouvelle \xE9tape" : "New stage", color: "#64748b" });
    document.getElementById("kanban-status-list").innerHTML = renderKanbanStatusList();
  }
  function removeKanbanStatusDraft(index) {
    draftKanbanStatuses.splice(index, 1);
    document.getElementById("kanban-status-list").innerHTML = renderKanbanStatusList();
  }
  async function commitKanbanStatuses() {
    customKanbanStatuses = draftKanbanStatuses;
    await saveKanbanStatuses();
    await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "status"), customKanbanStatuses);
    showToast(currentLang === "fr" ? "Pipeline mis \xE0 jour" : "Pipeline updated", "success");
    refreshAllViews();
  }
  var defaultTagsList = [];
  var customTagsList = null;
  function getTagsList() {
    return customTagsList || defaultTagsList;
  }
  function getTagLabel(key) {
    if (!key) return "";
    var found = getTagsList().find(function(tg) {
      return tg.key === key;
    });
    return found ? found.label : key;
  }
  async function saveTagsList() {
    await saveSetting("tags_list", JSON.stringify(customTagsList));
  }
  async function addTagValue(label) {
    var list = getTagsList().slice();
    var slug = slugifyTypeKey(label);
    var existingKeys = list.map(function(tg) {
      return tg.key;
    });
    var finalKey = slug, n = 2;
    while (existingKeys.indexOf(finalKey) !== -1) {
      finalKey = slug + "_" + n;
      n++;
    }
    var newTag = { key: finalKey, label, color: "#CCCCCC" };
    list.push(newTag);
    customTagsList = list;
    await saveTagsList();
    await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "tag"), customTagsList);
    return newTag;
  }
  var draftTagsList = null;
  function renderTagsList() {
    var list = draftTagsList || getTagsList();
    var html = "";
    if (!list.length) html += '<div class="empty-state">' + (currentLang === "fr" ? "Aucun tag" : "No tag") + "</div>";
    list.forEach(function(tg, idx) {
      html += '<div class="kanban-status-edit-row">';
      html += '<input type="color" value="' + (tg.color || "#CCCCCC") + '" title="' + (currentLang === "fr" ? "Couleur du badge" : "Badge color") + '" onchange="updateTagDraftColor(' + idx + ', this.value)">';
      html += '<input type="text" value="' + sanitize(tg.label) + '" oninput="updateTagDraftLabel(' + idx + ', this.value)">';
      html += '<button class="btn-icon" title="' + (currentLang === "fr" ? "Supprimer" : "Delete") + '" onclick="removeTagDraft(' + idx + ')">\u{1F5D1}\uFE0F</button>';
      html += "</div>";
    });
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="text" id="new-tag-name" placeholder="' + (currentLang === "fr" ? "Nom du nouveau tag" : "New tag name") + '" style="flex:1;">';
    html += "</div>";
    return html;
  }
  function updateTagDraftLabel(idx, val) {
    if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
    draftTagsList[idx].label = val;
  }
  function updateTagDraftColor(idx, val) {
    if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
    draftTagsList[idx].color = val;
  }
  function addTagDraft() {
    if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
    var label = getVal("new-tag-name", "").trim();
    if (!label) {
      showToast(currentLang === "fr" ? "Indiquez un nom de tag avant d\u2019ajouter" : "Enter a tag name before adding", "error");
      return;
    }
    var slug = slugifyTypeKey(label);
    var existingKeys = draftTagsList.map(function(tg) {
      return tg.key;
    });
    var finalKey = slug, n = 2;
    while (existingKeys.indexOf(finalKey) !== -1) {
      finalKey = slug + "_" + n;
      n++;
    }
    draftTagsList.push({ key: finalKey, label, color: "#CCCCCC" });
    commitTagsList();
  }
  function removeTagDraft(idx) {
    if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
    draftTagsList.splice(idx, 1);
    document.getElementById("tags-list").innerHTML = renderTagsList();
  }
  async function commitTagsList() {
    if (!draftTagsList) return;
    var previousTags = customTagsList;
    customTagsList = draftTagsList;
    draftTagsList = null;
    try {
      await saveTagsList();
    } catch (e) {
      customTagsList = previousTags;
      console.error("[CRM] \xC9chec sauvegarde des tags :", e);
      showToast((currentLang === "fr" ? "\xC9chec de l\u2019enregistrement : " : "Save failed: ") + e.message, "error", 8e3);
      return;
    }
    var listEl = document.getElementById("tags-list");
    if (listEl) listEl.innerHTML = renderTagsList();
    await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "tag"), customTagsList);
    showToast(currentLang === "fr" ? "Tags enregistr\xE9s" : "Tags saved", "success");
  }
  var defaultCategoriesList = [];
  var customCategoriesList = null;
  function getCategoriesList() {
    return customCategoriesList || defaultCategoriesList;
  }
  function getCategoryLabel(key) {
    if (!key) return "";
    var found = getCategoriesList().find(function(c) {
      return c.key === key;
    });
    return found ? found.label : key;
  }
  async function saveCategoriesList() {
    await saveSetting("categories_list", JSON.stringify(customCategoriesList));
  }
  async function addCategoryValue(label) {
    var list = getCategoriesList().slice();
    var slug = slugifyTypeKey(label);
    var existingKeys = list.map(function(c) {
      return c.key;
    });
    var finalKey = slug, n = 2;
    while (existingKeys.indexOf(finalKey) !== -1) {
      finalKey = slug + "_" + n;
      n++;
    }
    var newCategory = { key: finalKey, label, color: "#CCCCCC" };
    list.push(newCategory);
    customCategoriesList = list;
    await saveCategoriesList();
    await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "category"), customCategoriesList);
    refreshCategorySelects();
    return newCategory;
  }
  var draftCategoriesList = null;
  function renderCategoriesList() {
    var list = draftCategoriesList || getCategoriesList();
    var html = "";
    if (!list.length) html += '<div class="empty-state">' + (currentLang === "fr" ? "Aucune cat\xE9gorie" : "No category") + "</div>";
    list.forEach(function(c, idx) {
      html += '<div class="kanban-status-edit-row">';
      html += '<input type="color" value="' + (c.color || "#CCCCCC") + '" title="' + (currentLang === "fr" ? "Couleur du badge" : "Badge color") + '" onchange="updateCategoryDraftColor(' + idx + ', this.value)">';
      html += '<input type="text" value="' + sanitize(c.label) + '" oninput="updateCategoryDraftLabel(' + idx + ', this.value)">';
      html += '<button class="btn-icon" title="' + (currentLang === "fr" ? "Supprimer" : "Delete") + '" onclick="removeCategoryDraft(' + idx + ')">\u{1F5D1}\uFE0F</button>';
      html += "</div>";
    });
    html += '<div class="kanban-status-edit-row">';
    html += '<input type="text" id="new-category-name" placeholder="' + (currentLang === "fr" ? "Nom de la nouvelle cat\xE9gorie" : "New category name") + '" style="flex:1;">';
    html += "</div>";
    return html;
  }
  function updateCategoryDraftLabel(idx, val) {
    if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
    draftCategoriesList[idx].label = val;
  }
  function updateCategoryDraftColor(idx, val) {
    if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
    draftCategoriesList[idx].color = val;
  }
  function addCategoryDraft() {
    if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
    var label = getVal("new-category-name", "").trim();
    if (!label) {
      showToast(currentLang === "fr" ? "Indiquez un nom de cat\xE9gorie avant d\u2019ajouter" : "Enter a category name before adding", "error");
      return;
    }
    var slug = slugifyTypeKey(label);
    var existingKeys = draftCategoriesList.map(function(c) {
      return c.key;
    });
    var finalKey = slug, n = 2;
    while (existingKeys.indexOf(finalKey) !== -1) {
      finalKey = slug + "_" + n;
      n++;
    }
    draftCategoriesList.push({ key: finalKey, label, color: "#CCCCCC" });
    commitCategoriesList();
  }
  function removeCategoryDraft(idx) {
    if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
    draftCategoriesList.splice(idx, 1);
    document.getElementById("categories-list").innerHTML = renderCategoriesList();
  }
  async function commitCategoriesList() {
    if (!draftCategoriesList) return;
    var previousCategories = customCategoriesList;
    customCategoriesList = draftCategoriesList;
    draftCategoriesList = null;
    try {
      await saveCategoriesList();
    } catch (e) {
      customCategoriesList = previousCategories;
      console.error("[CRM] \xC9chec sauvegarde des cat\xE9gories :", e);
      showToast((currentLang === "fr" ? "\xC9chec de l\u2019enregistrement : " : "Save failed: ") + e.message, "error", 8e3);
      return;
    }
    var listEl = document.getElementById("categories-list");
    if (listEl) listEl.innerHTML = renderCategoriesList();
    await syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "category"), customCategoriesList);
    refreshCategorySelects();
    showToast(currentLang === "fr" ? "Cat\xE9gories enregistr\xE9es" : "Categories saved", "success");
  }
  function refreshCategorySelects() {
    var cats = getCategoriesList();
    var kanbanSel = document.getElementById("kanban-category-select");
    if (kanbanSel) {
      var cur = kanbanSel.value;
      kanbanSel.innerHTML = '<option value="">' + (currentLang === "fr" ? "Toutes cat\xE9gories" : "All categories") + "</option>" + cats.map(function(c) {
        return '<option value="' + c.key + '"' + (cur === c.key ? " selected" : "") + ">" + sanitize(c.label) + "</option>";
      }).join("");
    }
  }
  var defaultEquipeRoles = ["Commercial", "Manager", "Support", "Direction"];
  var customEquipeRoles = null;
  function getEquipeRoles() {
    return customEquipeRoles || defaultEquipeRoles;
  }
  async function saveEquipeRoles() {
    await saveSetting("equipe_roles", JSON.stringify(customEquipeRoles));
  }
  async function addEquipeRole(roleName) {
    var roles = getEquipeRoles().slice();
    if (roles.indexOf(roleName) === -1) {
      roles.push(roleName);
      customEquipeRoles = roles;
      await saveEquipeRoles();
    }
  }
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
        try {
          customKanbanStatuses = JSON.parse(_settingsCache.kanban_statuses.value);
        } catch (e) {
        }
      }
      if (customKanbanStatuses) {
        var hasMarksAsClient = customKanbanStatuses.some(function(s) {
          return s.marksAsClient;
        });
        var hasStopFollowUp = customKanbanStatuses.some(function(s) {
          return s.stopFollowUp;
        });
        var kanbanMigrated = false;
        if (!hasMarksAsClient) {
          var signeStage = customKanbanStatuses.find(function(s) {
            return s.key === "signe";
          });
          if (signeStage) {
            signeStage.marksAsClient = true;
            kanbanMigrated = true;
          }
        }
        if (!hasStopFollowUp) {
          customKanbanStatuses.push({ key: "perdu", label: currentLang === "fr" ? "Perdu" : "Lost", color: "#94a3b8", stopFollowUp: true });
          kanbanMigrated = true;
        }
        var hasNouveau = customKanbanStatuses.some(function(s) {
          return s.key === "nouveau";
        });
        if (!hasNouveau) {
          customKanbanStatuses.unshift({ key: "nouveau", label: currentLang === "fr" ? "Nouveau" : "New", color: "#a855f7" });
          kanbanMigrated = true;
        }
        if (kanbanMigrated) {
          saveSetting("kanban_statuses", JSON.stringify(customKanbanStatuses));
        }
      }
      if (_settingsCache.account_types) {
        try {
          customAccountTypes = JSON.parse(_settingsCache.account_types.value);
        } catch (e) {
        }
      }
      if (_settingsCache.tags_list) {
        try {
          customTagsList = JSON.parse(_settingsCache.tags_list.value);
        } catch (e) {
        }
      }
      if (_settingsCache.categories_list) {
        try {
          customCategoriesList = JSON.parse(_settingsCache.categories_list.value);
        } catch (e) {
        }
      }
      if (_settingsCache.next_actions_prospect) {
        try {
          customNextActionsProspect = JSON.parse(_settingsCache.next_actions_prospect.value);
        } catch (e) {
        }
      }
      if (_settingsCache.next_actions_client) {
        try {
          customNextActionsClient = JSON.parse(_settingsCache.next_actions_client.value);
        } catch (e) {
        }
      }
      applyAccountTypeStyles();
      syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "type"), getAccountTypes());
      syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "status"), getKanbanStatuses());
      syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "nextAction"), getAllNextActionsMerged());
      syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "tag"), getTagsList());
      syncChoiceColumnOptions(COMPTES_TABLE, getColumnName("comptes", "category"), getCategoriesList());
      if (_settingsCache.equipe_roles) {
        try {
          customEquipeRoles = JSON.parse(_settingsCache.equipe_roles.value);
        } catch (e) {
        }
      }
    } catch (e) {
      console.log("[CRM] CRM_Parametres not available yet");
    }
  }
  async function saveSetting(key, value) {
    try {
      if (_settingsCache[key]) {
        await grist.docApi.applyUserActions([["UpdateRecord", PARAMETRES_TABLE, _settingsCache[key].id, { Valeur: value }]]);
        _settingsCache[key].value = value;
      } else {
        var result = await grist.docApi.applyUserActions([["AddRecord", PARAMETRES_TABLE, null, { Cle: key, Valeur: value }]]);
        var newId = result && result.retValues && result.retValues[0] || result;
        _settingsCache[key] = { id: newId, value };
      }
    } catch (e) {
      console.error("[CRM] Error saving setting:", e);
      throw e;
    }
  }
  function renderSettingsView() {
    var container = document.getElementById("settings-view");
    if (!container) return;
    if (!draftKanbanStatuses) draftKanbanStatuses = JSON.parse(JSON.stringify(getKanbanStatuses()));
    var html = '<div class="settings-row-2col">';
    html += '<div class="settings-section">';
    html += "<h3>" + t("kanbanColumnsConfig") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Personnalisez les \xE9tapes de votre pipeline commercial (nom et couleur)." : "Customize your pipeline stages.") + "</p>";
    html += '<p class="settings-hint">\u{1F91D} = ' + (currentLang === "fr" ? "convertit le prospect en client" : "converts prospect to client") + " \xB7 \u{1F6AB} = " + (currentLang === "fr" ? "sans suite (arr\xEAte les relances)" : "no follow-up (stops reminders)") + "</p>";
    html += '<div id="kanban-status-list">' + renderKanbanStatusList() + "</div>";
    html += '<button class="btn btn-secondary" onclick="addKanbanStatusDraft()">+ ' + (currentLang === "fr" ? "Ajouter une \xE9tape" : "Add a stage") + "</button>";
    html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitKanbanStatuses()">' + t("save") + "</button>";
    html += "</div>";
    if (!draftAccountTypes) draftAccountTypes = JSON.parse(JSON.stringify(getAccountTypes()));
    html += '<div class="settings-section">';
    html += "<h3>" + (currentLang === "fr" ? "Types de comptes" : "Account types") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Renommez les types existants ou ajoutez-en de nouveaux. Les 3 types de base ne peuvent pas \xEAtre supprim\xE9s." : "Rename existing types or add new ones. The 3 base types cannot be deleted.") + "</p>";
    html += '<div id="account-type-list">' + renderAccountTypeList() + "</div>";
    html += '<button class="btn btn-secondary" onclick="addAccountTypeDraft()">+ ' + (currentLang === "fr" ? "Ajouter un type" : "Add a type") + "</button>";
    html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitAccountTypes()">' + t("save") + "</button>";
    html += "</div>";
    html += "</div>";
    if (!draftTagsList) draftTagsList = JSON.parse(JSON.stringify(getTagsList()));
    if (!draftCategoriesList) draftCategoriesList = JSON.parse(JSON.stringify(getCategoriesList()));
    html += '<div class="settings-row-2col">';
    html += '<div class="settings-section">';
    html += "<h3>" + (currentLang === "fr" ? "Tags" : "Tags") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Liste des tags disponibles sur une fiche compte (choix unique). Peuvent aussi \xEAtre cr\xE9\xE9s directement depuis la fiche." : "Available tags on an account record (single choice). Can also be created directly from the record.") + "</p>";
    html += '<div id="tags-list">' + renderTagsList() + "</div>";
    html += '<button class="btn btn-secondary" onclick="addTagDraft()">+ ' + (currentLang === "fr" ? "Ajouter un tag" : "Add a tag") + "</button>";
    html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitTagsList()">' + t("save") + "</button>";
    html += "</div>";
    html += '<div class="settings-section">';
    html += "<h3>" + (currentLang === "fr" ? "Cat\xE9gories" : "Categories") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Liste des cat\xE9gories disponibles sur une fiche compte (choix unique), utilis\xE9es aussi pour le filtre du Kanban. Peuvent aussi \xEAtre cr\xE9\xE9es directement depuis la fiche." : "Available categories on an account record (single choice), also used for the Kanban filter. Can also be created directly from the record.") + "</p>";
    html += '<div id="categories-list">' + renderCategoriesList() + "</div>";
    html += '<button class="btn btn-secondary" onclick="addCategoryDraft()">+ ' + (currentLang === "fr" ? "Ajouter une cat\xE9gorie" : "Add a category") + "</button>";
    html += '<button class="btn btn-primary" style="margin-left:8px;" onclick="commitCategoriesList()">' + t("save") + "</button>";
    html += "</div>";
    html += "</div>";
    html += '<div class="settings-row-2col">';
    html += '<div class="settings-section">';
    html += "<h3>" + (currentLang === "fr" ? "Actions \u2014 Prospects" : "Actions \u2014 Prospects") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Actions disponibles pour un prospect, avec d\xE9lai de relance (en jours) si aucune r\xE9ponse." : "Available actions for a prospect, with follow-up delay (days) if no response.") + "</p>";
    html += '<div id="next-actions-list-prospect">' + renderNextActionsList("prospect") + "</div>";
    html += `<button class="btn btn-secondary" onclick="addNextActionDraft('prospect')">+ ` + (currentLang === "fr" ? "Ajouter une action" : "Add an action") + "</button>";
    html += `<button class="btn btn-primary" style="margin-left:8px;" onclick="commitNextActions('prospect')">` + t("save") + "</button>";
    html += "</div>";
    html += '<div class="settings-section">';
    html += "<h3>" + (currentLang === "fr" ? "Actions \u2014 Clients" : "Actions \u2014 Clients") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Actions disponibles pour un client (ou ancien client), avec d\xE9lai de relance (en jours)." : "Available actions for a client (or former client), with follow-up delay (days).") + "</p>";
    html += '<div id="next-actions-list-client">' + renderNextActionsList("client") + "</div>";
    html += `<button class="btn btn-secondary" onclick="addNextActionDraft('client')">+ ` + (currentLang === "fr" ? "Ajouter une action" : "Add an action") + "</button>";
    html += `<button class="btn btn-primary" style="margin-left:8px;" onclick="commitNextActions('client')">` + t("save") + "</button>";
    html += "</div>";
    html += "</div>";
    html += '<div class="settings-section">';
    html += "<h3>" + (currentLang === "fr" ? "\xC9quipe" : "Team") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "G\xE9rez les membres pouvant \xEAtre Responsables d\u2019un compte ou assign\xE9s \xE0 une t\xE2che." : "Manage members who can be Account owners or task assignees.") + "</p>";
    html += '<div class="sub-list">';
    equipe.forEach(function(m) {
      html += '<div class="sub-item">';
      html += '<div class="sub-item-main"><strong>' + sanitize(m.Nom) + "</strong>";
      if (m.Role) html += ' <span class="badge-primary">' + sanitize(m.Role) + "</span>";
      if (m.Email) html += '<div class="sub-item-detail">' + sanitize(m.Email) + "</div>";
      html += "</div>";
      if (isOwner) html += '<div class="sub-item-actions"><button class="btn-icon" onclick="deleteEquipeMember(' + m.id + ')" title="' + t("delete") + '">\u{1F5D1}\uFE0F</button></div>';
      html += "</div>";
    });
    if (equipe.length === 0) html += '<div class="empty-state">' + (currentLang === "fr" ? "Aucun membre pour le moment" : "No member yet") + "</div>";
    html += "</div>";
    html += '<div class="add-form">';
    html += '<input id="new-equipe-name" type="text" placeholder="' + (currentLang === "fr" ? "Nom *" : "Name *") + '">';
    html += '<input id="new-equipe-email" type="email" placeholder="Email">';
    html += '<select id="new-equipe-role" onchange="handleEquipeRoleSelectChange(this)">' + buildEquipeRoleOptions(null) + "</select>";
    html += '<input id="new-equipe-role-custom" type="text" class="hidden" placeholder="' + (currentLang === "fr" ? "Nom du nouveau r\xF4le" : "New role name") + '">';
    html += '<button class="btn btn-primary" onclick="addEquipeMember()">+ ' + (currentLang === "fr" ? "Ajouter un membre" : "Add member") + "</button>";
    html += "</div>";
    html += "</div>";
    html += '<div class="settings-section">';
    html += "<h3>" + (currentLang === "fr" ? "Ajouter un champ personnalis\xE9" : "Add a custom field") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Ajoute une nouvelle colonne directement dans une table Grist du CRM." : "Adds a new column directly to a CRM Grist table.") + "</p>";
    html += '<div class="add-form">';
    html += '<select id="new-field-table">';
    html += '<option value="' + COMPTES_TABLE + '">' + (currentLang === "fr" ? "Comptes" : "Accounts") + "</option>";
    html += '<option value="' + CONTACTS_TABLE + '">' + (currentLang === "fr" ? "Contacts" : "Contacts") + "</option>";
    html += '<option value="' + CONTRATS_TABLE + '">' + (currentLang === "fr" ? "Contrats" : "Contracts") + "</option>";
    html += '<option value="' + TACHES_TABLE + '">' + (currentLang === "fr" ? "T\xE2ches" : "Tasks") + "</option>";
    html += "</select>";
    html += '<input id="new-field-name" type="text" placeholder="' + (currentLang === "fr" ? "Nom du champ" : "Field name") + '">';
    html += '<select id="new-field-type">';
    html += '<option value="Text">' + (currentLang === "fr" ? "Texte" : "Text") + "</option>";
    html += '<option value="Numeric">' + (currentLang === "fr" ? "Nombre" : "Number") + "</option>";
    html += '<option value="Date">Date</option>';
    html += '<option value="Bool">' + (currentLang === "fr" ? "Case \xE0 cocher" : "Checkbox") + "</option>";
    html += "</select>";
    html += '<button class="btn btn-primary" onclick="addCustomField()">+ ' + (currentLang === "fr" ? "Ajouter le champ" : "Add field") + "</button>";
    html += "</div>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "Le champ sera visible et modifiable directement dans la table Grist correspondante (le widget n\u2019affiche pour le moment que ses champs pr\xE9d\xE9finis)." : "The field will be visible and editable directly in the corresponding Grist table.") + "</p>";
    html += "</div>";
    html += '<div class="settings-section">';
    html += "<h3>" + t("mappingConfig") + "</h3>";
    html += '<p class="settings-hint">' + (currentLang === "fr" ? "La table CRM_Configuration d\xE9finit la correspondance entre les champs du widget et vos colonnes Grist. Modifiable directement dans cette table." : "Edit CRM_Configuration table directly to remap columns.") + "</p>";
    html += '<table class="data-table"><thead><tr><th>' + (currentLang === "fr" ? "Champ" : "Field") + "</th><th>" + (currentLang === "fr" ? "Table" : "Table") + "</th><th>" + (currentLang === "fr" ? "Colonne" : "Column") + "</th></tr></thead><tbody>";
    ["comptes", "contacts", "contrats", "equipe"].forEach(function(entity) {
      Object.keys(columnMapping[entity]).forEach(function(field) {
        var tableName = entity === "comptes" ? COMPTES_TABLE : entity === "contacts" ? CONTACTS_TABLE : entity === "contrats" ? CONTRATS_TABLE : EQUIPE_TABLE;
        html += "<tr><td>" + entity + "." + field + "</td><td>" + tableName + "</td><td>" + columnMapping[entity][field] + "</td></tr>";
      });
    });
    html += "</tbody></table>";
    html += "</div>";
    container.innerHTML = html;
  }
  async function addCustomField() {
    var tableName = getVal("new-field-table", COMPTES_TABLE);
    var fieldName = getVal("new-field-name", "").trim();
    var fieldType = getVal("new-field-type", "Text");
    if (!fieldName) {
      showToast(currentLang === "fr" ? "Indiquez un nom de champ" : "Enter a field name", "error");
      return;
    }
    var cleanName = fieldName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
    if (!cleanName) {
      showToast(currentLang === "fr" ? "Nom de champ invalide" : "Invalid field name", "error");
      return;
    }
    try {
      var existingCols = Object.keys(await grist.docApi.fetchTable(tableName));
      if (existingCols.indexOf(cleanName) !== -1) {
        showToast(currentLang === "fr" ? "Ce champ existe d\xE9j\xE0" : "This field already exists", "error");
        return;
      }
      await grist.docApi.applyUserActions([["AddColumn", tableName, cleanName, { type: fieldType, label: fieldName }]]);
      showToast(currentLang === "fr" ? 'Champ "' + fieldName + '" ajout\xE9 \xE0 ' + tableName : "Field added", "success");
      document.getElementById("new-field-name").value = "";
    } catch (e) {
      console.error("[CRM] Error adding custom field:", e);
      showToast("Erreur : " + e.message, "error");
    }
  }

  // src/app.js
  var currentLang = "fr";
  var i18n = {
    fr: {
      appTitle: "CRM",
      appSubtitle: "Suivez vos prospects, clients et contrats.",
      notInGrist: "Ce widget doit \xEAtre utilis\xE9 dans Grist.",
      tabKanban: "Pipeline",
      tabTable: "Liste",
      tabRelances: "\xC0 relancer",
      tabStats: "Statistiques",
      tabSettings: "Param\xE8tres",
      newCompte: "Nouveau",
      newCompteClient: "Nouveau client",
      newCompteProspect: "Nouveau prospect",
      statTotal: "Total",
      statClients: "Clients",
      statProspects: "Prospects",
      statAnciens: "Anciens clients",
      statCA: "CA clients (cumul\xE9)",
      statPipeline: "Pipeline prospects",
      statRelances: "Relances en attente",
      statRelancesLate: "Relances en retard",
      noComptes: "Aucune fiche",
      addCompte: "+ Ajouter une fiche",
      tableTitle: "Liste des comptes",
      tableSubtitle: "Tous vos clients et prospects, recherche et tri avanc\xE9s",
      searchPlaceholder: "Rechercher (nom, contact, email...)",
      allTypes: "Tous types",
      allStatuses: "Tous les statuts",
      allPriorities: "Toutes priorit\xE9s",
      colName: "Nom",
      colType: "Type",
      colStatus: "Statut",
      colPriority: "Priorit\xE9",
      colResponsible: "Responsable",
      colAmount: "Montant",
      colNextAction: "Prochaine action",
      colRelance: "Relance",
      colActions: "Supprimer",
      typeClient: "Client",
      typeProspect: "Prospect",
      typeAncien: "Ancien client",
      priorityHigh: "Haute",
      priorityMedium: "Moyenne",
      priorityLow: "Basse",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      confirmDelete: "Supprimer cette fiche ? Cette action supprimera aussi ses contacts, contrats, commentaires et t\xE2ches li\xE9s.",
      compteCreated: "Fiche cr\xE9\xE9e !",
      compteUpdated: "Fiche mise \xE0 jour !",
      compteDeleted: "Fiche supprim\xE9e.",
      compteMoved: "Fiche d\xE9plac\xE9e.",
      notDefined: "Non d\xE9fini",
      overdue: "en retard",
      noDate: "Aucune date",
      tablesCreated: "Tables cr\xE9\xE9es automatiquement.",
      exportCsv: "Export CSV",
      importCsv: "Importer CSV",
      statistics: "Statistiques",
      statsTitle: "Statistiques",
      statsSubtitle: "Vue d\u2019ensemble de votre activit\xE9 commerciale",
      modalNewCompte: "Nouvelle fiche",
      modalEditCompte: "Modifier la fiche",
      fieldName: "Nom *",
      fieldType: "Type *",
      fieldStatus: "Statut",
      fieldPriority: "Priorit\xE9",
      fieldResponsible: "Responsable",
      fieldAmount: "Montant (\u20AC)",
      fieldContractsTotal: "Total contrats actifs",
      fieldNextAction: "Prochaine action",
      fieldNextActionDate: "Date prochaine action",
      fieldRelanceDate: "Date de relance",
      fieldCategory: "Cat\xE9gorie",
      fieldTag: "Tag",
      fieldDescription: "Notes g\xE9n\xE9rales",
      fieldWebsite: "Site web",
      fieldAddressStreet: "Adresse",
      fieldAddressZip: "Code postal",
      fieldAddressCity: "Ville",
      contactsTitle: "Contacts",
      addContact: "+ Ajouter un contact",
      contractsTitle: "Contrats",
      addContract: "+ Ajouter un contrat",
      commentsTitle: "Historique / Commentaires",
      addComment: "Ajouter une note",
      tasksTitle: "T\xE2ches & relances",
      addTask: "+ Ajouter une t\xE2che",
      rgpdTitle: "RGPD",
      rgpdConsent: "Consentement contact obtenu",
      rgpdExport: "Exporter les donn\xE9es du contact",
      rgpdDelete: "Supprimer d\xE9finitivement ce contact",
      rgpdNotice: "Les donn\xE9es de contact (nom, email, t\xE9l\xE9phone) sont conserv\xE9es pour la gestion de la relation commerciale. Conform\xE9ment au RGPD, la personne concern\xE9e peut demander l\u2019acc\xE8s, la rectification ou la suppression de ses donn\xE9es.",
      settingsTitle: "Param\xE8tres",
      settingsSubtitle: "Personnalisez les colonnes du pipeline et le mapping des tables",
      kanbanColumnsConfig: "Colonnes du pipeline (Kanban)",
      mappingConfig: "Mapping des tables Grist"
    }
  };
  function t(key) {
    return i18n[currentLang] && i18n[currentLang][key] || key;
  }
  function isInsideGrist() {
    try {
      return window.frameElement !== null || window !== window.parent;
    } catch (e) {
      return true;
    }
  }
  function showToast(msg, type, duration) {
    var container = document.getElementById("toast-container");
    if (!container) return;
    var toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "info");
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(function() {
      toast.remove();
    }, duration || 3e3);
  }
  function switchTab(tab) {
    setCurrentTab(tab);
    document.querySelectorAll(".tab-btn").forEach(function(btn) {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
    });
    document.querySelectorAll(".tab-content").forEach(function(el) {
      el.classList.toggle("active", el.id === "tab-" + tab);
    });
    refreshAllViews();
    try {
      localStorage.setItem("crm-active-tab", tab);
    } catch (e) {
    }
  }
  function restoreActiveTab() {
    try {
      var saved = localStorage.getItem("crm-active-tab");
      if (saved) {
        setCurrentTab(saved);
        document.querySelectorAll(".tab-btn").forEach(function(btn) {
          btn.classList.toggle("active", btn.getAttribute("data-tab") === saved);
        });
        document.querySelectorAll(".tab-content").forEach(function(el) {
          el.classList.toggle("active", el.id === "tab-" + saved);
        });
      }
    } catch (e) {
    }
  }
  function refreshAllViews() {
    refreshTypeSelects();
    refreshCategorySelects();
    updateStatsBadges();
    if (currentTab === "kanban") renderKanbanView();
    else if (currentTab === "table") renderTableView();
    else if (currentTab === "relances") renderRelancesView();
    else if (currentTab === "stats") renderStatsView();
    else if (currentTab === "carte") renderCarteView();
    else if (currentTab === "settings") renderSettingsView();
  }
  function updateStatsBadges() {
    var relanceLateBadge = document.getElementById("relance-late-badge");
    var lateComptes = comptes.filter(isRelanceOverdue);
    if (relanceLateBadge) {
      var count = lateComptes.length;
      relanceLateBadge.textContent = count > 0 ? count : "";
      relanceLateBadge.classList.toggle("hidden", count === 0);
    }
    renderRelanceBanner(lateComptes);
  }
  function renderRelanceBanner(lateComptes) {
    var container = document.getElementById("relance-banner-container");
    if (!container) return;
    var soonComptes = comptes.filter(isRelanceUpcoming);
    if (lateComptes.length === 0 && soonComptes.length === 0) {
      container.innerHTML = "";
      return;
    }
    var isLate = lateComptes.length > 0;
    var list = isLate ? lateComptes : soonComptes;
    var names = list.slice(0, 3).map(function(c) {
      return c.Name;
    }).join(", ");
    var extra = list.length > 3 ? currentLang === "fr" ? " et " + (list.length - 3) + " autre(s)" : " and " + (list.length - 3) + " more" : "";
    var text = isLate ? currentLang === "fr" ? lateComptes.length + " relance" + (lateComptes.length > 1 ? "s" : "") + " en retard : " + names + extra : lateComptes.length + " overdue follow-up(s): " + names + extra : currentLang === "fr" ? soonComptes.length + " relance" + (soonComptes.length > 1 ? "s" : "") + " \xE0 venir cette semaine : " + names + extra : soonComptes.length + " upcoming follow-up(s) this week: " + names + extra;
    var html = '<div class="relance-banner ' + (isLate ? "late" : "") + `" onclick="switchTab('relances')">`;
    html += '<span class="relance-banner-icon">' + (isLate ? "\u{1F534}" : "\u{1F7E1}") + "</span>";
    html += '<span class="relance-banner-text">' + sanitize(text) + "</span>";
    html += '<span class="relance-banner-link">' + (currentLang === "fr" ? "Voir les relances \u2192" : "View follow-ups \u2192") + "</span>";
    html += "</div>";
    container.innerHTML = html;
  }
  if (!isInsideGrist()) {
    document.getElementById("not-in-grist").classList.remove("hidden");
    document.getElementById("main-content").classList.add("hidden");
  } else {
    (async function() {
      await grist.ready({ requiredAccess: "full" });
      var USER_INFO_TABLE = "CRM_UserInfo";
      var helperWriteSucceeded = false;
      try {
        var existingTabs = await grist.docApi.listTables();
        if (existingTabs.indexOf(USER_INFO_TABLE) === -1) {
          await grist.docApi.applyUserActions([
            ["AddTable", USER_INFO_TABLE, [{ id: "UserEmail", fields: { type: "Text", label: "UserEmail" } }]]
          ]);
          await grist.docApi.applyUserActions([
            ["ModifyColumn", USER_INFO_TABLE, "UserEmail", { isFormula: false, formula: "user.Email", recalcWhen: 2, recalcDeps: null }]
          ]);
        }
      } catch (e) {
        console.warn("[CRM] Could not create helper table:", e.message);
      }
      try {
        try {
          var existingData = await grist.docApi.fetchTable(USER_INFO_TABLE);
          var rowIds = existingData && existingData.id ? existingData.id : [];
          var actions = [];
          for (var r = 0; r < rowIds.length; r++) actions.push(["RemoveRecord", USER_INFO_TABLE, rowIds[r]]);
          actions.push(["AddRecord", USER_INFO_TABLE, null, {}]);
          await grist.docApi.applyUserActions(actions);
          helperWriteSucceeded = true;
        } catch (writeErr) {
          console.log("[CRM] Could not refresh row (read-only?):", writeErr.message);
        }
        var tokenInfo = await grist.docApi.getAccessToken({ readOnly: true });
        var tableResp = await fetch(tokenInfo.baseUrl + "/tables/" + USER_INFO_TABLE + "/records?auth=" + tokenInfo.token);
        if (tableResp.ok) {
          var tableData = await tableResp.json();
          if (tableData.records && tableData.records.length > 0) {
            setCurrentUserEmail(tableData.records[0].fields.UserEmail || "");
          }
        } else {
          var userInfoData = await grist.docApi.fetchTable(USER_INFO_TABLE);
          if (userInfoData && userInfoData.UserEmail && userInfoData.UserEmail.length > 0) {
            setCurrentUserEmail(userInfoData.UserEmail[0] || "");
          }
        }
      } catch (e) {
        console.warn("[CRM] Could not read helper table:", e.message);
      }
      var roleDetected = false;
      try {
        await grist.docApi.applyUserActions([
          ["ModifyColumn", USER_INFO_TABLE, "UserEmail", { isFormula: false, formula: "user.Email", recalcWhen: 2, recalcDeps: null }]
        ]);
        setRole(true, false);
        roleDetected = true;
      } catch (structErr) {
        if (helperWriteSucceeded) {
          setRole(false, true);
          roleDetected = true;
        } else {
          setRole(false, false);
          roleDetected = true;
        }
      }
      if (!roleDetected) {
        if (helperWriteSucceeded) {
          setRole(false, true);
        } else {
          setRole(false, false);
        }
      }
      console.log("[CRM] Role detection \u2014 isOwner:", isOwner, "isEditor:", isEditor, "email:", currentUserEmail);
      await ensureTables();
      await loadSettings();
      await loadAllData();
      restoreActiveTab();
      refreshAllViews();
      if (typeof grist.onRecords === "function") {
        var _liveReloadTimer = null;
        grist.onRecords(function() {
          if (_liveReloadTimer) clearTimeout(_liveReloadTimer);
          _liveReloadTimer = setTimeout(function() {
            var modal = document.getElementById("modal-container");
            if (modal && modal.innerHTML.trim() !== "") return;
            loadAllData();
          }, 500);
        });
      }
    })();
  }
  Object.assign(window, {
    addAccountTypeDraft,
    addCategoryDraft,
    addContact,
    addContract,
    addCrmComment,
    addCrmTask,
    addCustomField,
    addEquipeMember,
    addKanbanStatusDraft,
    addNextActionDraft,
    addTagDraft,
    cancelCrmCommentEdit,
    clearRelance,
    closeAllPopups,
    closeModal,
    commitAccountTypes,
    commitCategoriesList,
    commitKanbanStatuses,
    commitNextActions,
    commitTagsList,
    createCompte,
    deleteCompte,
    deleteContact,
    deleteContract,
    deleteCrmComment,
    deleteCrmTask,
    deleteEquipeMember,
    downloadContractFile,
    editCrmComment,
    exportComptesToCsv,
    exportContactData,
    handleCategorySelectChange,
    handleCsvImport,
    handleEquipeRoleSelectChange,
    handleExcelImport,
    handleTagSelectChange,
    hideAddressSuggestions,
    onAddressStreetInput,
    onKanbanDragLeave,
    onKanbanDragOver,
    onKanbanDragStart,
    onKanbanDrop,
    onStatusDragEnd,
    onStatusDragOver,
    onStatusDragStart,
    onStatusDrop,
    openEditCompteModal,
    recalcRelanceDate,
    refreshNextActionOptions,
    removeAccountTypeDraft,
    removeCategoryDraft,
    removeKanbanStatusDraft,
    removeNextActionDraft,
    removeTagDraft,
    renderTableView,
    rgpdDeleteContact,
    saveCompteFromModal,
    saveCrmComment,
    selectAddressSuggestion,
    setCarteFilterDepartement,
    setCarteFilterType,
    setCarteMetric,
    setCarteMode,
    setContactConsent,
    setFilterCategory,
    setFilterType,
    setKanbanSearch,
    setKanbanShowAll,
    sortTable,
    switchModalTab,
    switchTab,
    toggleCrmTask,
    toggleModalExpand,
    triggerCsvImport,
    triggerExcelImport,
    updateAccountTypeDraftColor,
    updateAccountTypeDraftLabel,
    updateCategoryDraftColor,
    updateCategoryDraftLabel,
    updateFileLabel,
    updateKanbanStatusDraft,
    updateKanbanStatusFlag,
    updateNextActionDraftDays,
    updateNextActionDraftLabel,
    updateTagDraftColor,
    updateTagDraftLabel
  });
})();
