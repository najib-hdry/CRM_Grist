// Calculs de dates purs (aucune dépendance à l'état du widget ni au DOM).

export function todayEpoch() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

export function daysFromNow(epoch) {
  if (!epoch) return null;
  return Math.round((epoch - todayEpoch()) / 86400);
}

export function toEpoch(dateStr) {
  if (!dateStr) return null;
  var d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return null;
  return Math.floor(d.getTime() / 1000);
}

export function formatDate(epoch) {
  if (!epoch) return '';
  var d = new Date(epoch * 1000);
  return d.toLocaleDateString('fr-FR');
}

export function epochToInputDate(epoch) {
  if (!epoch) return '';
  var d = new Date(epoch * 1000);
  var y = d.getFullYear();
  var m = String(d.getMonth() + 1).padStart(2, '0');
  var day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

// Ajoute `days` jours à une date au format input HTML (YYYY-MM-DD),
// utilisé pour calculer automatiquement la date de relance.
// Calcul entièrement en UTC (Date.UTC + getters UTC) pour être indépendant
// du fuseau horaire d'exécution : en heure locale + toISOString(), un fuseau
// UTC+1/+2 (Europe/Paris) faisait reculer le résultat d'un jour.
export function addDaysToDateInput(dateStr, days) {
  if (!dateStr) return '';
  var parts = dateStr.split('-').map(Number);
  var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  d.setUTCDate(d.getUTCDate() + days);
  var y = d.getUTCFullYear();
  var m = String(d.getUTCMonth() + 1).padStart(2, '0');
  var day = String(d.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
