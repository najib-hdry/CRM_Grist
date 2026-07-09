// Flux critiques : création des tables sur un document neuf, et migrations sur un document
// existant — colonne Prochaine_Action en Choix unique, colonnes Tag et Categorie en Choix
// unique + suppression des tables CRM_Tags/CRM_Categories devenues inutiles, et nettoyage
// complet de l'ancienne file d'attente email (colonnes + réglages webhook_url/email_templates).
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';

beforeEach(() => {
  vi.resetModules();
});

describe('ensureTables — document neuf', () => {
  it('crée Prochaine_Action en type Choice (pas Texte libre)', async () => {
    globalThis.grist = createMockGrist({});
    var schema = await import('./schema.js');
    await schema.ensureTables();
    var comptesTable = globalThis.grist._tables.CRM_Comptes;
    expect(comptesTable.columnTypes.Prochaine_Action).toBe('Choice');
  });

  it('ne crée plus les colonnes de file d’attente email', async () => {
    globalThis.grist = createMockGrist({});
    var schema = await import('./schema.js');
    await schema.ensureTables();
    var cols = globalThis.grist._tables.CRM_Comptes.columns;
    expect(cols).not.toContain('Email_Status');
    expect(cols).not.toContain('Email_Sujet');
  });

  it('crée Tag en type Choice (pas Texte libre) et ne crée plus la table CRM_Tags', async () => {
    globalThis.grist = createMockGrist({});
    var schema = await import('./schema.js');
    await schema.ensureTables();
    expect(globalThis.grist._tables.CRM_Comptes.columnTypes.Tag).toBe('Choice');
    expect(Object.keys(globalThis.grist._tables)).not.toContain('CRM_Tags');
  });

  it('crée Categorie en type Choice (pas Texte libre) et ne crée plus la table CRM_Categories', async () => {
    globalThis.grist = createMockGrist({});
    var schema = await import('./schema.js');
    await schema.ensureTables();
    expect(globalThis.grist._tables.CRM_Comptes.columnTypes.Categorie).toBe('Choice');
    expect(Object.keys(globalThis.grist._tables)).not.toContain('CRM_Categories');
  });
});

describe('ensureTables — document existant avec CRM_Tags et Tag en Texte libre', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: {
        columns: ['Nom', 'Tag'],
        rows: [{ id: 1, Nom: 'Client historique', Tag: 'fidèle' }]
      },
      CRM_Tags: {
        columns: ['Nom', 'Couleur'],
        rows: [{ id: 1, Nom: 'fidèle', Couleur: '#22c55e' }]
      }
    });
  });

  it('supprime la table CRM_Tags et convertit Tag en Choix unique sans perdre les données', async () => {
    var schema = await import('./schema.js');
    await schema.ensureTables();
    expect(Object.keys(globalThis.grist._tables)).not.toContain('CRM_Tags');
    expect(globalThis.grist._tables.CRM_Comptes.columnTypes.Tag).toBe('Choice');
    expect(globalThis.grist._tables.CRM_Comptes.rows.get(1).Tag).toBe('fidèle');
  });
});

describe('ensureTables — document existant avec CRM_Categories et Categorie en Texte libre', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: {
        columns: ['Nom', 'Categorie'],
        rows: [{ id: 1, Nom: 'Client historique', Categorie: 'Artisanat' }]
      },
      CRM_Categories: {
        columns: ['Nom', 'Couleur', 'Ordre'],
        rows: [{ id: 1, Nom: 'Artisanat', Couleur: '#22c55e', Ordre: 1 }]
      }
    });
  });

  it('supprime la table CRM_Categories et convertit Categorie en Choix unique sans perdre les données', async () => {
    var schema = await import('./schema.js');
    await schema.ensureTables();
    expect(Object.keys(globalThis.grist._tables)).not.toContain('CRM_Categories');
    expect(globalThis.grist._tables.CRM_Comptes.columnTypes.Categorie).toBe('Choice');
    expect(globalThis.grist._tables.CRM_Comptes.rows.get(1).Categorie).toBe('Artisanat');
  });
});

describe('ensureTables — document existant créé avant le retrait des emails', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: {
        columns: ['Nom', 'Type', 'Email_Status', 'Email_Sujet', 'Email_Corps', 'Email_Destinataire'],
        rows: [{ id: 1, Nom: 'Client historique', Email_Status: 'envoye' }]
      },
      CRM_Parametres: {
        columns: ['Cle', 'Valeur'],
        rows: [
          { id: 1, Cle: 'webhook_url', Valeur: 'https://old-n8n.example.com/hook' },
          { id: 2, Cle: 'email_templates', Valeur: '{}' },
          { id: 3, Cle: 'kanban_statuses', Valeur: '[]' }
        ]
      }
    });
  });

  it('supprime les colonnes email de CRM_Comptes sans toucher aux autres données', async () => {
    var schema = await import('./schema.js');
    await schema.ensureTables();
    var comptesTable = globalThis.grist._tables.CRM_Comptes;
    expect(comptesTable.columns).not.toContain('Email_Status');
    expect(comptesTable.columns).not.toContain('Email_Sujet');
    expect(comptesTable.columns).not.toContain('Email_Corps');
    expect(comptesTable.columns).not.toContain('Email_Destinataire');
    expect(comptesTable.rows.get(1).Nom).toBe('Client historique');
  });

  it('supprime les réglages webhook_url/email_templates mais garde les autres', async () => {
    var schema = await import('./schema.js');
    await schema.ensureTables();
    var paramRows = Array.from(globalThis.grist._tables.CRM_Parametres.rows.values());
    var keys = paramRows.map(function(r) { return r.Cle; });
    expect(keys).not.toContain('webhook_url');
    expect(keys).not.toContain('email_templates');
    expect(keys).toContain('kanban_statuses');
  });
});
