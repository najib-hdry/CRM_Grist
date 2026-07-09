// Vue Carte : pins (Leaflet) pour prospects/clients géolocalisés, et choroplèthe
// par région (D3) avec agrégats DOM-TOM. L et d3 sont chargés globalement via
// <script> dans index.html (vendor/leaflet, vendor/d3).

import { comptes } from '../state.js';
import { sanitize, formatAmount } from '../utils/format.js';
import { getCompteDepartement, getDepartementLabel } from '../utils/geo.js';
import { getTextColorForBackground } from '../utils/colors.js';
import { isStageStopFollowUp } from '../data/filtering.js';
import { currentLang, getAccountTypeLabel } from '../app.js';

var carteMap = null;
var carteMarkersLayer = null;
var carteFilterType = '';
var carteFilterDepartement = '';
var carteMode = 'pins';
var carteMetric = 'count';
var carteGeoJsonData = null;
var carteGeoJsonLoading = null;

var FRANCE_BOUNDS = [[41.0, -5.5], [51.5, 10.0]];

function getCarteComptes() {
  return comptes.filter(function(c) {
    if (c.Address_Lat == null || c.Address_Lng == null) return false;
    var isEligibleType = c.Type === 'client' || (c.Type === 'prospect' && !isStageStopFollowUp(c.Status));
    if (!isEligibleType) return false;
    if (carteFilterType && c.Type !== carteFilterType) return false;
    if (carteFilterDepartement && getCompteDepartement(c) !== carteFilterDepartement) return false;
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
  var codes = eligible.map(getCompteDepartement).filter(Boolean);
  var uniqueCodes = codes.filter(function(v, idx, arr) { return arr.indexOf(v) === idx; }).sort();
  var current = sel.value;
  var html = '<option value="">Tous départements</option>';
  uniqueCodes.forEach(function(code) {
    html += '<option value="' + code + '"' + (code === current ? ' selected' : '') + '>' + sanitize(getDepartementLabel(code)) + '</option>';
  });
  sel.innerHTML = html;
}

export function setCarteFilterType(value) {
  carteFilterType = value;
  renderCarteView();
}

export function setCarteFilterDepartement(value) {
  carteFilterDepartement = value;
  renderCarteView();
}

export function setCarteMode(value) {
  carteMode = value;
  var metricSel = document.getElementById('carte-metric-select');
  var deptSel = document.getElementById('carte-departement-select');
  if (metricSel) metricSel.classList.toggle('hidden', value !== 'region');
  if (deptSel) deptSel.classList.toggle('hidden', value === 'region');
  document.getElementById('carte-board').classList.toggle('hidden', value === 'region');
  document.getElementById('carte-region-wrap').classList.toggle('hidden', value !== 'region');
  document.getElementById('carte-domtom-chips').classList.toggle('hidden', value !== 'region');
  renderCarteView();
}

export function setCarteMetric(value) {
  carteMetric = value;
  renderCarteView();
}

function getOrCreateCarteMap(container) {
  if (!carteMap) {
    carteMap = L.map(container, { maxBounds: FRANCE_BOUNDS, maxBoundsViscosity: 0.8, minZoom: 5 })
      .setView([46.6, 2.2], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(carteMap);
    carteMarkersLayer = L.layerGroup().addTo(carteMap);
  } else {
    setTimeout(function() { carteMap.invalidateSize(); }, 50);
  }
  return carteMap;
}

// Correspondance code département -> code région INSEE (regions.geojson, métropole + Corse)
var DEPARTEMENT_TO_REGION_CODE = {
  '75': '11', '77': '11', '78': '11', '91': '11', '92': '11', '93': '11', '94': '11', '95': '11',
  '18': '24', '28': '24', '36': '24', '37': '24', '41': '24', '45': '24',
  '21': '27', '25': '27', '39': '27', '58': '27', '70': '27', '71': '27', '89': '27', '90': '27',
  '14': '28', '27': '28', '50': '28', '61': '28', '76': '28',
  '02': '32', '59': '32', '60': '32', '62': '32', '80': '32',
  '08': '44', '10': '44', '51': '44', '52': '44', '54': '44', '55': '44', '57': '44', '67': '44', '68': '44', '88': '44',
  '44': '52', '49': '52', '53': '52', '72': '52', '85': '52',
  '22': '53', '29': '53', '35': '53', '56': '53',
  '16': '75', '17': '75', '19': '75', '23': '75', '24': '75', '33': '75', '40': '75', '47': '75', '64': '75', '79': '75', '86': '75', '87': '75',
  '09': '76', '11': '76', '12': '76', '30': '76', '31': '76', '32': '76', '34': '76', '46': '76', '48': '76', '65': '76', '66': '76', '81': '76', '82': '76',
  '01': '84', '03': '84', '07': '84', '15': '84', '26': '84', '38': '84', '42': '84', '43': '84', '63': '84', '69': '84', '73': '84', '74': '84',
  '04': '93', '05': '93', '06': '93', '13': '93', '83': '93', '84': '93',
  '2A': '94', '2B': '94'
};

var DOM_REGIONS = [
  { code: '971', name: 'Guadeloupe' },
  { code: '972', name: 'Martinique' },
  { code: '973', name: 'Guyane' },
  { code: '974', name: 'La Réunion' },
  { code: '976', name: 'Mayotte' }
];

function loadCarteGeoJson(url, cacheKey) {
  carteGeoJsonData = carteGeoJsonData || {};
  carteGeoJsonLoading = carteGeoJsonLoading || {};
  if (carteGeoJsonData[cacheKey]) return Promise.resolve(carteGeoJsonData[cacheKey]);
  if (carteGeoJsonLoading[cacheKey]) return carteGeoJsonLoading[cacheKey];
  carteGeoJsonLoading[cacheKey] = fetch(url)
    .then(function(r) { return r.json(); })
    .then(function(data) { carteGeoJsonData[cacheKey] = data; return data; })
    .catch(function(e) {
      console.error('[CRM] Impossible de charger ' + url + ' :', e.message);
      carteGeoJsonLoading[cacheKey] = null;
      return null;
    });
  return carteGeoJsonLoading[cacheKey];
}

// Agrège les comptes éligibles par région (métropole) et par DOM-TOM : { regionCode: { count, ca } }
export function computeRegionAggregates() {
  var eligible = comptes.filter(function(c) {
    var isEligibleType = c.Type === 'client' || (c.Type === 'prospect' && !isStageStopFollowUp(c.Status));
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
    var domMatch = DOM_REGIONS.find(function(d) { return d.code === deptCode; });
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
  return { regionAgg: regionAgg, domAgg: domAgg };
}

function renderCarteLegend(minValue, maxValue, metric) {
  var legendEl = document.getElementById('carte-legend');
  if (!legendEl) return;
  if (carteMode !== 'region' || maxValue <= 0) { legendEl.classList.add('hidden'); legendEl.innerHTML = ''; return; }
  var fr = currentLang === 'fr';
  var title = metric === 'ca' ? (fr ? 'CA total' : 'Total revenue') : (fr ? 'Nombre de comptes' : 'Number of accounts');
  var steps = 5;
  var html = '<span class="carte-legend-title">' + sanitize(title) + ' :</span>';
  for (var i = 0; i < steps; i++) {
    var ratio = i / (steps - 1);
    var color = d3.interpolateBlues(0.15 + ratio * 0.75);
    var stepValue = Math.round(minValue + ratio * (maxValue - minValue));
    html += '<span class="carte-legend-item"><span class="carte-legend-swatch" style="background:' + color + ';"></span>' +
      (metric === 'ca' ? formatAmount(stepValue) : stepValue) + '</span>';
  }
  legendEl.innerHTML = html;
  legendEl.classList.remove('hidden');
}

export function renderCarteView() {
  populateCarteDepartementSelect();

  if (carteMode === 'region') {
    renderCarteRegionMap();
    return;
  }

  var container = document.getElementById('carte-board');
  if (!container) return;

  if (typeof L === 'undefined') {
    console.error('[CRM] Leaflet (L) non chargé — la carte ne peut pas s’afficher. Vérifiez que vendor/leaflet/leaflet.js est bien accessible.');
    container.innerHTML = '<div class="empty-state">' + (currentLang === 'fr' ? 'Impossible de charger la bibliothèque de carte (Leaflet).' : 'Could not load the map library (Leaflet).') + '</div>';
    return;
  }

  getOrCreateCarteMap(container);
  renderCarteLegend(0, 0, carteMetric);
  var list = getCarteComptes();
  var countEl = document.getElementById('carte-count');
  if (countEl) countEl.textContent = list.length + (currentLang === 'fr' ? ' compte(s) sur la carte' : ' account(s) on the map');
  renderCartePins(list);
}

function renderCartePins(list) {
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

function renderCarteRegionMap() {
  var statusEl = document.getElementById('carte-region-status');
  var countEl = document.getElementById('carte-count');
  if (typeof d3 === 'undefined') {
    console.error('[CRM] D3.js non chargé — la carte par région ne peut pas s’afficher.');
    if (statusEl) statusEl.textContent = currentLang === 'fr' ? 'Bibliothèque de carte (D3) indisponible.' : 'Map library (D3) unavailable.';
    return;
  }

  loadCarteGeoJson('vendor/geo/regions.geojson', 'regions').then(function(geojson) {
    if (!geojson) {
      if (statusEl) statusEl.textContent = currentLang === 'fr' ? 'Contours des régions indisponibles.' : 'Region boundaries unavailable.';
      return;
    }
    if (statusEl) statusEl.style.display = 'none';

    var aggs = computeRegionAggregates();
    var regionAgg = aggs.regionAgg;
    var domAgg = aggs.domAgg;

    var metricOf = function(stats) { return carteMetric === 'ca' ? stats.ca : stats.count; };
    var values = Object.keys(regionAgg).map(function(code) { return metricOf(regionAgg[code]); });
    var maxValue = values.length ? Math.max.apply(null, values) : 0;
    var minValue = 0;

    var totalCount = Object.keys(regionAgg).reduce(function(sum, code) { return sum + regionAgg[code].count; }, 0) +
      Object.keys(domAgg).reduce(function(sum, code) { return sum + domAgg[code].count; }, 0);
    if (countEl) countEl.textContent = totalCount + (currentLang === 'fr' ? ' compte(s) au total' : ' account(s) total');

    var wrap = document.getElementById('carte-region-wrap');
    var width = wrap.clientWidth || 800;
    var height = wrap.clientHeight || 560;

    var svg = d3.select('#carte-region-svg');
    svg.selectAll('*').remove();
    svg.attr('viewBox', '0 0 ' + width + ' ' + height);

    var projection = d3.geoConicConformal().parallels([44, 49]).rotate([-3, 0]);
    var path = d3.geoPath(projection);
    projection.fitSize([width - 20, height - 40], geojson);

    var colorScale = function(value) {
      if (!value || maxValue <= 0) return '#F3F3F3';
      return d3.interpolateBlues(0.15 + (value / maxValue) * 0.75);
    };

    var tooltip = d3.select('#carte-region-tooltip');
    var g = svg.append('g').attr('transform', 'translate(10, 10)');

    g.selectAll('path.region-shape')
      .data(geojson.features)
      .join('path')
      .attr('class', 'region-shape')
      .attr('d', path)
      .attr('fill', function(d) {
        var stats = regionAgg[d.properties.code];
        return colorScale(stats ? metricOf(stats) : 0);
      })
      .on('mousemove', function(event, d) {
        var stats = regionAgg[d.properties.code] || { count: 0, ca: 0 };
        tooltip.style('display', 'block')
          .style('left', (event.offsetX + 14) + 'px')
          .style('top', (event.offsetY + 8) + 'px')
          .html('<strong>' + sanitize(d.properties.nom) + '</strong><br>' +
            (currentLang === 'fr' ? 'Comptes' : 'Accounts') + ' : ' + stats.count + '<br>' +
            (currentLang === 'fr' ? 'CA' : 'Revenue') + ' : ' + formatAmount(stats.ca));
      })
      .on('mouseleave', function() { tooltip.style('display', 'none'); });

    g.selectAll('text.region-label')
      .data(geojson.features)
      .join('text')
      .attr('class', 'region-label')
      .attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; })
      .attr('dy', '-0.3em')
      .attr('fill', function(d) {
        var stats = regionAgg[d.properties.code];
        return getTextColorForBackground(colorScale(stats ? metricOf(stats) : 0));
      })
      .text(function(d) { return d.properties.nom; });

    g.selectAll('text.region-amount')
      .data(geojson.features)
      .join('text')
      .attr('class', 'region-amount')
      .attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; })
      .attr('dy', '0.9em')
      .attr('fill', function(d) {
        var stats = regionAgg[d.properties.code];
        return getTextColorForBackground(colorScale(stats ? metricOf(stats) : 0));
      })
      .text(function(d) {
        var stats = regionAgg[d.properties.code] || { count: 0, ca: 0 };
        return carteMetric === 'ca' ? formatAmount(stats.ca) : stats.count + (currentLang === 'fr' ? ' compte(s)' : ' account(s)');
      });

    renderCarteLegend(minValue, maxValue, carteMetric);
    renderCarteDomtomChips(domAgg, maxValue);
  });
}

function renderCarteDomtomChips(domAgg, maxValue) {
  var chipsEl = document.getElementById('carte-domtom-chips');
  if (!chipsEl) return;
  var fr = currentLang === 'fr';
  var html = DOM_REGIONS.map(function(d) {
    var stats = domAgg[d.code] || { count: 0, ca: 0 };
    var value = carteMetric === 'ca' ? stats.ca : stats.count;
    var bg = value > 0 && maxValue > 0 ? d3.interpolateBlues(0.15 + Math.min(value / maxValue, 1) * 0.75) : '#F3F3F3';
    var textColor = getTextColorForBackground(bg);
    return '<div class="carte-domtom-chip" style="background:' + bg + ';color:' + textColor + ';">' +
      '<div class="carte-domtom-chip-name">' + sanitize(d.name) + '</div>' +
      '<div class="carte-domtom-chip-value">' + (carteMetric === 'ca' ? formatAmount(stats.ca) : stats.count + (fr ? ' compte(s)' : ' account(s)')) + '</div>' +
      '</div>';
  }).join('');
  chipsEl.innerHTML = html;
}

export function closeAllPopups() {
  if (carteMap) carteMap.closePopup();
}
