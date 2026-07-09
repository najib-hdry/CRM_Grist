// Export des comptes en CSV.

import { comptes } from '../state.js';
import { escapeCsv, capitalize } from '../utils/format.js';
import { formatDate } from '../utils/dates.js';
import { getEquipeMemberName, getSignedContractsTotal } from '../data/relations.js';
import { showToast, t, getAccountTypeLabel, getStatusLabel } from '../app.js';

export function exportComptesToCsv() {
  var headers = ['Nom', 'Type', 'Statut', 'Priorité', 'Responsable', 'Montant', 'Total contrats signés', 'Prochaine action', 'Date prochaine action', 'Date de relance', 'Catégorie', 'Tag', 'Notes'];
  var rows = [headers.join(',')];
  comptes.forEach(function(c) {
    rows.push([
      escapeCsv(c.Name), escapeCsv(getAccountTypeLabel(c.Type)), escapeCsv(getStatusLabel(c.Status)), escapeCsv(t('priority' + capitalize(c.Priority))),
      escapeCsv(getEquipeMemberName(c.Responsible)), escapeCsv(c.Amount), escapeCsv(getSignedContractsTotal(c.id)),
      escapeCsv(c.Next_Action), escapeCsv(c.Next_Action_Date ? formatDate(c.Next_Action_Date) : ''),
      escapeCsv(c.Relance_Date ? formatDate(c.Relance_Date) : ''), escapeCsv(c.Category), escapeCsv(c.Tag), escapeCsv(c.Description)
    ].join(','));
  });
  var csv = '﻿' + rows.join('\n');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'crm_export_' + new Date().toISOString().split('T')[0] + '.csv';
  link.click();
  showToast(t('exportCsv') + ' ✓', 'success');
}
