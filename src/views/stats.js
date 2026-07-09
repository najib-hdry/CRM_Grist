// Vue Statistiques : micro-stats, graphiques pipeline/priorité, donut CA par étape.

import { comptes } from '../state.js';
import { sanitize, formatAmount } from '../utils/format.js';
import { getSignedContractsTotal } from '../data/relations.js';
import { isRelanceOverdue, getRelanceComptes } from '../data/filtering.js';
import { t, currentLang, getKanbanStatuses } from '../app.js';

export function renderStatsView() {
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
