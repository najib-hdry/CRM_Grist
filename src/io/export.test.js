// Flux critique : export CSV (le seul canal d'export restant depuis le retrait du PDF).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';
import { comptes } from '../state.js';
import { exportComptesToCsv } from './export.js';

describe('exportComptesToCsv', () => {
  var capturedBlob;

  beforeEach(() => {
    globalThis.grist = createMockGrist({});
    comptes.length = 0;
    comptes.push({
      id: 1, Name: 'Acme, Inc.', Type: 'prospect', Status: 'nouveau', Priority: 'high',
      Responsible: 0, Amount: 1000, Next_Action: '', Next_Action_Date: null, Relance_Date: null,
      Category: 'BTP', Tag: 'urgent', Description: 'Ligne 1\nLigne 2'
    });
    capturedBlob = null;
    vi.spyOn(URL, 'createObjectURL').mockImplementation(function(blob) {
      capturedBlob = blob;
      return 'blob:mock';
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function() {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    comptes.length = 0;
  });

  it('génère un CSV avec une ligne par compte', async () => {
    exportComptesToCsv();
    expect(capturedBlob).toBeTruthy();
    var text = await capturedBlob.text();
    var lines = text.replace(/^﻿/, '').split('\n');
    expect(lines[0]).toContain('Nom');
    expect(lines[1]).toContain('"Acme, Inc."');
  });

  it('échappe correctement les virgules et retours à la ligne (injection CSV de base)', async () => {
    exportComptesToCsv();
    var text = await capturedBlob.text();
    expect(text).toContain('"Acme, Inc."');
    expect(text).toContain('"Ligne 1\nLigne 2"');
  });
});
