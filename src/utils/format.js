// Formatage et échappement de texte (HTML, CSV, noms de fichiers, montants, gabarits).

export function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function formatAmount(n) {
  if (n === null || n === undefined || n === '') return '—';
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

export function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  var s = String(val);
  if (s.indexOf(',') !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function sanitizeFilename(s) {
  return String(s || 'export').replace(/[^a-z0-9]+/gi, '_').toLowerCase();
}

export function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Génère une clé technique lisible à partir d'un libellé (ex. types de comptes,
// étapes du pipeline personnalisées) : minuscules, sans accents, underscores.
export function slugifyTypeKey(label) {
  return (label || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'type';
}

// Remplace les variables {contact}, {compte}, {responsable}, {montant}... dans
// un modèle d'email par leurs valeurs réelles.
export function fillTemplate(str, vars) {
  return (str || '').replace(/\{(\w+)\}/g, function(match, key) {
    return vars.hasOwnProperty(key) ? (vars[key] || '') : match;
  });
}
