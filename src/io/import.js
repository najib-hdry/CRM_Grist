// Import de comptes depuis un fichier CSV ou Excel (XLSX, chargé globalement via vendor).

import { equipe } from '../state.js';
import { COMPTES_TABLE } from '../config/tables.js';
import { setField } from '../config/column-mapping.js';
import { loadAllData } from '../data/load.js';
import { showToast, currentLang, getKanbanStatuses } from '../app.js';

export function triggerCsvImport() {
  var input = document.getElementById('csv-import-input');
  if (input) input.click();
}

export function triggerExcelImport() {
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

export function handleCsvImport(fileInput) {
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

export function handleExcelImport(fileInput) {
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
  text = text.replace(/^﻿/, '');
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
