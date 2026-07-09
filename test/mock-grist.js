// Faux `window.grist` en mémoire pour les tests d'intégration : simule le sous-ensemble
// de grist.docApi réellement utilisé par le widget (fetchTable/applyUserActions/listTables),
// sans navigateur ni document Grist réel. Couvre les verbes d'action présents dans le code :
// AddTable, RemoveTable, AddColumn, RemoveColumn, ModifyColumn, AddRecord, BulkAddRecord,
// UpdateRecord, RemoveRecord.

function ensureTable(tables, name) {
  if (!tables[name]) tables[name] = { columns: [], columnTypes: {}, rows: new Map(), nextId: 1 };
  return tables[name];
}

function trackColumns(table, record) {
  Object.keys(record || {}).forEach(function(k) {
    if (k !== 'id' && table.columns.indexOf(k) === -1) table.columns.push(k);
  });
}

function bumpNextId(table, id) {
  if (typeof id === 'number' && id >= table.nextId) table.nextId = id + 1;
}

function applyOne(tables, action) {
  var verb = action[0];
  switch (verb) {
    case 'AddTable': {
      var t = ensureTable(tables, action[1]);
      (action[2] || []).forEach(function(c) {
        if (t.columns.indexOf(c.id) === -1) t.columns.push(c.id);
        if (c.type) t.columnTypes[c.id] = c.type;
      });
      return null;
    }
    case 'AddColumn': {
      var t2 = ensureTable(tables, action[1]);
      if (t2.columns.indexOf(action[2]) === -1) t2.columns.push(action[2]);
      if (action[3] && action[3].type) t2.columnTypes[action[2]] = action[3].type;
      return null;
    }
    case 'RemoveTable': {
      delete tables[action[1]];
      return null;
    }
    case 'RemoveColumn': {
      var t3 = ensureTable(tables, action[1]);
      t3.columns = t3.columns.filter(function(c) { return c !== action[2]; });
      delete t3.columnTypes[action[2]];
      t3.rows.forEach(function(row) { delete row[action[2]]; });
      return null;
    }
    case 'ModifyColumn': {
      var t4 = ensureTable(tables, action[1]);
      if (t4.columns.indexOf(action[2]) === -1) t4.columns.push(action[2]);
      if (action[3] && action[3].type) t4.columnTypes[action[2]] = action[3].type;
      return null;
    }
    case 'AddRecord': {
      var t5 = ensureTable(tables, action[1]);
      var id = action[2] != null ? action[2] : t5.nextId++;
      bumpNextId(t5, id);
      var rec = Object.assign({ id: id }, action[3]);
      t5.rows.set(id, rec);
      trackColumns(t5, action[3]);
      return id;
    }
    case 'BulkAddRecord': {
      var t6 = ensureTable(tables, action[1]);
      var idsArg = action[2] || [];
      var recordsArg = action[3] || [];
      return recordsArg.map(function(rec, i) {
        var id = idsArg[i] != null ? idsArg[i] : t6.nextId++;
        bumpNextId(t6, id);
        t6.rows.set(id, Object.assign({ id: id }, rec));
        trackColumns(t6, rec);
        return id;
      });
    }
    case 'UpdateRecord': {
      var t7 = ensureTable(tables, action[1]);
      var row = t7.rows.get(action[2]);
      if (row) Object.assign(row, action[3]);
      trackColumns(t7, action[3]);
      return null;
    }
    case 'RemoveRecord': {
      var t8 = ensureTable(tables, action[1]);
      t8.rows.delete(action[2]);
      return null;
    }
    default:
      throw new Error('mock-grist: action non supportée : ' + verb);
  }
}

// seed: { TableName: { columns: ['Col1', ...], rows: [{id, ...}, ...] } }
export function createMockGrist(seed) {
  var tables = {};
  Object.keys(seed || {}).forEach(function(name) {
    var t = ensureTable(tables, name);
    (seed[name].columns || []).forEach(function(c) { if (t.columns.indexOf(c) === -1) t.columns.push(c); });
    (seed[name].rows || []).forEach(function(r) {
      var id = r.id != null ? r.id : t.nextId++;
      bumpNextId(t, id);
      t.rows.set(id, Object.assign({}, r, { id: id }));
      trackColumns(t, r);
    });
  });

  return {
    ready: function() { return Promise.resolve(); },
    onRecords: function() {},
    docApi: {
      listTables: function() { return Promise.resolve(Object.keys(tables)); },
      fetchTable: function(name) {
        var t = ensureTable(tables, name);
        var out = { id: [] };
        t.columns.forEach(function(c) { out[c] = []; });
        Array.from(t.rows.values()).forEach(function(row) {
          out.id.push(row.id);
          t.columns.forEach(function(c) { out[c].push(row[c] !== undefined ? row[c] : null); });
        });
        return Promise.resolve(out);
      },
      applyUserActions: function(actions) {
        var retValues = actions.map(function(a) { return applyOne(tables, a); });
        return Promise.resolve({ retValues: retValues });
      },
      getAccessToken: function() { return Promise.resolve({ baseUrl: 'http://mock', token: 'mock' }); }
    },
    // Accès direct au store pour les assertions dans les tests.
    _tables: tables
  };
}
