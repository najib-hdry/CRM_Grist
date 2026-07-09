// Vérifie le remapping de table promis par GUIDE_MAPPING.md : CRM_Configuration.Nom_Table
// n'était historiquement jamais relu (seules les colonnes étaient remappées). Chaque test
// réinitialise le graphe de modules car tables.js/column-mapping.js portent un état module
// mutable partagé (COMPTES_TABLE, columnMapping) — sans reset, un test contaminerait le suivant.
import { describe, it, expect, beforeEach } from 'vitest';
import { vi } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';

beforeEach(() => {
  vi.resetModules();
});

describe('loadColumnMapping / applyTableMapping', () => {
  it('remappe COMPTES_TABLE quand Nom_Table pointe vers une table existante différente', async () => {
    globalThis.grist = createMockGrist({
      CRM_Configuration: {
        columns: ['Cle_Config', 'Nom_Table', 'Nom_Colonne'],
        rows: [
          { id: 1, Cle_Config: 'compte_name', Nom_Table: 'Clients', Nom_Colonne: 'Raison_Sociale' },
          { id: 2, Cle_Config: 'compte_type', Nom_Table: 'Clients', Nom_Colonne: 'Categorie_Client' }
        ]
      }
    });
    var columnMapping = await import('./column-mapping.js');
    var tables = await import('./tables.js');
    await columnMapping.loadColumnMapping();

    expect(tables.COMPTES_TABLE).toBe('Clients');
    expect(columnMapping.getColumnName('comptes', 'name')).toBe('Raison_Sociale');
    expect(columnMapping.getColumnName('comptes', 'type')).toBe('Categorie_Client');
  });

  it('garde les tables par défaut quand CRM_Configuration ne remappe rien', async () => {
    globalThis.grist = createMockGrist({
      CRM_Configuration: {
        columns: ['Cle_Config', 'Nom_Table', 'Nom_Colonne'],
        rows: [{ id: 1, Cle_Config: 'compte_name', Nom_Table: 'CRM_Comptes', Nom_Colonne: 'Nom' }]
      }
    });
    var columnMapping = await import('./column-mapping.js');
    var tables = await import('./tables.js');
    await columnMapping.loadColumnMapping();

    expect(tables.COMPTES_TABLE).toBe(tables.DEFAULT_COMPTES_TABLE);
  });

  it('ne remappe que l’entité concernée (contacts) et laisse les autres tables intactes', async () => {
    globalThis.grist = createMockGrist({
      CRM_Configuration: {
        columns: ['Cle_Config', 'Nom_Table', 'Nom_Colonne'],
        rows: [{ id: 1, Cle_Config: 'contact_email', Nom_Table: 'Interlocuteurs', Nom_Colonne: 'Mail' }]
      }
    });
    var columnMapping = await import('./column-mapping.js');
    var tables = await import('./tables.js');
    await columnMapping.loadColumnMapping();

    expect(tables.CONTACTS_TABLE).toBe('Interlocuteurs');
    expect(columnMapping.getColumnName('contacts', 'email')).toBe('Mail');
    expect(tables.COMPTES_TABLE).toBe(tables.DEFAULT_COMPTES_TABLE);
  });
});
