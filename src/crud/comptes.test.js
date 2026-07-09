// Flux critique : création d'un compte. Depuis la correction de la fiche fantôme, cliquer
// sur "+ Client"/"+ Prospect" ne doit plus rien écrire dans Grist tant que l'utilisateur n'a
// pas cliqué sur Enregistrer (createCompte n'ouvre que le formulaire ; c'est
// saveCompteFromModal(null) qui crée réellement la fiche).
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';
import { createCompte, saveCompteFromModal } from './comptes.js';
import { openNewCompteModal, closeModal } from '../modal/compte-modal.js';

describe('createCompte (ouverture du formulaire, sans écriture Grist)', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom', 'Type', 'Statut', 'Priorite', 'Cree_Le'], rows: [] }
    });
  });

  it('ne crée aucune fiche dans Grist tant que Enregistrer n’a pas été cliqué', async () => {
    createCompte('prospect');
    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows).toHaveLength(0);
  });

  it('ouvre bien le formulaire (modal visible avec le champ nom)', async () => {
    createCompte('client');
    expect(document.getElementById('compte-name')).not.toBeNull();
    expect(document.getElementById('modal-container').classList.contains('hidden')).toBe(false);
  });

  it('fermer (X/Annuler) après ouverture ne laisse aucune fiche fantôme (régression)', async () => {
    createCompte('prospect');
    closeModal();
    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows).toHaveLength(0);
    expect(document.getElementById('modal-container').classList.contains('hidden')).toBe(true);
  });
});

describe('saveCompteFromModal(null) — création réelle au clic sur Enregistrer', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom', 'Type', 'Statut', 'Priorite', 'Cree_Le'], rows: [] }
    });
    openNewCompteModal('prospect');
  });

  it('crée la fiche avec les valeurs du formulaire quand le nom est renseigné', async () => {
    document.getElementById('compte-name').value = 'Nouveau Client SARL';
    await saveCompteFromModal(null);

    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows).toHaveLength(1);
    expect(rows[0].Nom).toBe('Nouveau Client SARL');
    expect(rows[0].Type).toBe('prospect');
    expect(typeof rows[0].Cree_Le).toBe('number');
  });

  it('ferme la modale après création', async () => {
    document.getElementById('compte-name').value = 'Nouveau Client SARL';
    await saveCompteFromModal(null);
    expect(document.getElementById('modal-container').classList.contains('hidden')).toBe(true);
  });

  it('refuse de créer une fiche sans nom', async () => {
    document.getElementById('compte-name').value = '   ';
    await saveCompteFromModal(null);
    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows).toHaveLength(0);
  });

  it('ne pose plus de colonne Email_Status (retrait des fonctionnalités email)', async () => {
    document.getElementById('compte-name').value = 'Nouveau Client SARL';
    await saveCompteFromModal(null);
    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows[0].Email_Status).toBeUndefined();
  });
});

describe('saveCompteFromModal(null) — un client créé directement est "client depuis" sa création', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom', 'Type', 'Statut', 'Priorite', 'Cree_Le', 'Client_Depuis'], rows: [] }
    });
    openNewCompteModal('client');
  });

  it('renseigne Client_Depuis à la création', async () => {
    document.getElementById('compte-name').value = 'Client Direct SARL';
    await saveCompteFromModal(null);
    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows[0].Type).toBe('client');
    expect(typeof rows[0].Client_Depuis).toBe('number');
  });
});

describe('saveCompteFromModal(null) — création d’un nouveau tag depuis la fiche', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom', 'Type', 'Statut', 'Priorite', 'Cree_Le', 'Tag'], rows: [] }
    });
    openNewCompteModal('prospect');
  });

  it('crée le tag choisi ("+ Créer un nouveau tag...") et l’assigne à la fiche', async () => {
    document.getElementById('compte-name').value = 'Prospect avec nouveau tag';
    document.getElementById('compte-tag').value = '__new__';
    document.getElementById('compte-tag-custom').value = 'Grand compte';
    await saveCompteFromModal(null);

    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows[0].Tag).toBe('grand_compte');

    var paramRows = Array.from(globalThis.grist._tables.CRM_Parametres.rows.values());
    var tagsSetting = paramRows.find(function(r) { return r.Cle === 'tags_list'; });
    expect(JSON.parse(tagsSetting.Valeur).some(function(t) { return t.key === 'grand_compte' && t.label === 'Grand compte'; })).toBe(true);
  });

  it('n’assigne aucun tag si "Créer un nouveau tag" est choisi sans saisir de nom', async () => {
    document.getElementById('compte-name').value = 'Prospect sans tag';
    document.getElementById('compte-tag').value = '__new__';
    document.getElementById('compte-tag-custom').value = '   ';
    await saveCompteFromModal(null);

    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows[0].Tag).toBe('');
  });
});

describe('saveCompteFromModal(null) — création d’une nouvelle catégorie depuis la fiche', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom', 'Type', 'Statut', 'Priorite', 'Cree_Le', 'Categorie'], rows: [] }
    });
    openNewCompteModal('prospect');
  });

  it('crée la catégorie choisie ("+ Créer une nouvelle catégorie...") et l’assigne à la fiche', async () => {
    document.getElementById('compte-name').value = 'Prospect avec nouvelle catégorie';
    document.getElementById('compte-category').value = '__new__';
    document.getElementById('compte-category-custom').value = 'Artisanat';
    await saveCompteFromModal(null);

    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows[0].Categorie).toBe('artisanat');

    var paramRows = Array.from(globalThis.grist._tables.CRM_Parametres.rows.values());
    var categoriesSetting = paramRows.find(function(r) { return r.Cle === 'categories_list'; });
    expect(JSON.parse(categoriesSetting.Valeur).some(function(c) { return c.key === 'artisanat' && c.label === 'Artisanat'; })).toBe(true);
  });

  it('n’assigne aucune catégorie si "Créer une nouvelle catégorie" est choisi sans saisir de nom', async () => {
    document.getElementById('compte-name').value = 'Prospect sans catégorie';
    document.getElementById('compte-category').value = '__new__';
    document.getElementById('compte-category-custom').value = '   ';
    await saveCompteFromModal(null);

    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows[0].Categorie).toBe('');
  });
});

describe('saveCompteFromModal(id) — mise à jour d’une fiche existante', () => {
  beforeEach(async () => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: {
        columns: ['Nom', 'Type', 'Statut', 'Priorite', 'Montant'],
        rows: [{ id: 42, Nom: 'Ancien Nom', Type: 'prospect', Statut: 'nouveau', Priorite: 'medium', Montant: 500 }]
      }
    });
    var load = await import('../data/load.js');
    await load.loadAllData();
    var modal = await import('../modal/compte-modal.js');
    modal.openEditCompteModal(42, false);
    modal.switchModalTab('info', 42);
  });

  it('modifie la fiche existante (UpdateRecord) sans en créer une nouvelle', async () => {
    document.getElementById('compte-name').value = 'Nouveau Nom';
    await saveCompteFromModal(42);
    var rows = Array.from(globalThis.grist._tables.CRM_Comptes.rows.values());
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(42);
    expect(rows[0].Nom).toBe('Nouveau Nom');
  });

  it('ferme la modale après la mise à jour', async () => {
    document.getElementById('compte-name').value = 'Nouveau Nom';
    await saveCompteFromModal(42);
    expect(document.getElementById('modal-container').classList.contains('hidden')).toBe(true);
  });
});
