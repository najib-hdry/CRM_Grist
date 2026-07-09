// Flux critique : gestion des listes de tags et catégories (CRM_Comptes.Tag/Categorie,
// colonnes Choix unique) — création à la volée depuis addTagValue()/addCategoryValue()
// (utilisées par la fiche compte), persistance dans CRM_Parametres, et synchronisation de la
// liste de choix native sur la colonne Grist.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';

beforeEach(() => {
  vi.resetModules();
});

describe('addTagValue — création de tag à la volée', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom', 'Tag'], rows: [] }
    });
  });

  it('ajoute le tag à la liste, le persiste dans CRM_Parametres et le synchronise sur la colonne Tag', async () => {
    var settings = await import('./settings-domain.js');
    var newTag = await settings.addTagValue('Grand compte');

    expect(newTag.key).toBe('grand_compte');
    expect(settings.getTagsList().map(function(t) { return t.key; })).toContain('grand_compte');
    expect(settings.getTagLabel('grand_compte')).toBe('Grand compte');

    var paramRows = Array.from(globalThis.grist._tables.CRM_Parametres.rows.values());
    var tagsSetting = paramRows.find(function(r) { return r.Cle === 'tags_list'; });
    expect(JSON.parse(tagsSetting.Valeur).some(function(t) { return t.key === 'grand_compte'; })).toBe(true);
  });

  it('évite les doublons de clé si deux tags ont un nom proche', async () => {
    var settings = await import('./settings-domain.js');
    await settings.addTagValue('Urgent');
    var second = await settings.addTagValue('Urgent');
    expect(second.key).not.toBe('urgent');
    expect(second.key).toBe('urgent_2');
  });
});

describe('addCategoryValue — création de catégorie à la volée', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom', 'Categorie'], rows: [] }
    });
  });

  it('ajoute la catégorie à la liste, la persiste dans CRM_Parametres et la synchronise sur la colonne Categorie', async () => {
    var settings = await import('./settings-domain.js');
    var newCategory = await settings.addCategoryValue('Artisanat');

    expect(newCategory.key).toBe('artisanat');
    expect(settings.getCategoriesList().map(function(c) { return c.key; })).toContain('artisanat');
    expect(settings.getCategoryLabel('artisanat')).toBe('Artisanat');

    var paramRows = Array.from(globalThis.grist._tables.CRM_Parametres.rows.values());
    var categoriesSetting = paramRows.find(function(r) { return r.Cle === 'categories_list'; });
    expect(JSON.parse(categoriesSetting.Valeur).some(function(c) { return c.key === 'artisanat'; })).toBe(true);
  });

  it('évite les doublons de clé si deux catégories ont un nom proche', async () => {
    var settings = await import('./settings-domain.js');
    await settings.addCategoryValue('Commerce');
    var second = await settings.addCategoryValue('Commerce');
    expect(second.key).not.toBe('commerce');
    expect(second.key).toBe('commerce_2');
  });
});
