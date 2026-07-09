// Flux critique : gestion automatique du statut Client/Prospect au fil du pipeline Kanban,
// affichage des clients les plus récents (limite de 15, "Afficher tous les clients"), et
// filtre par Catégorie.
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';
import { comptes } from '../state.js';

function ensureBoard() {
  var board = document.getElementById('kanban-board');
  if (!board) {
    board = document.createElement('div');
    board.id = 'kanban-board';
    document.body.appendChild(board);
  }
  board.innerHTML = '';
  return board;
}

function fakeDropTarget(statusKey) {
  return {
    getAttribute: function() { return statusKey; },
    classList: { add: function() {}, remove: function() {} }
  };
}

describe('Kanban — conversion automatique prospect ↔ client', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: {
        columns: ['Nom', 'Type', 'Statut'],
        rows: [{ id: 1, Nom: 'Acme', Type: 'prospect', Statut: 'negociation' }]
      }
    });
    comptes.length = 0;
    comptes.push({ id: 1, Name: 'Acme', Type: 'prospect', Status: 'negociation' });
  });

  it('un prospect déplacé vers "Contrat signé" devient client (Client_Depuis renseigné)', async () => {
    var kanban = await import('./kanban.js');
    kanban.onKanbanDragStart({ dataTransfer: {} }, 1);
    await kanban.onKanbanDrop({ preventDefault: function() {}, currentTarget: fakeDropTarget('signe') });
    var row = globalThis.grist._tables.CRM_Comptes.rows.get(1);
    expect(row.Type).toBe('client');
    expect(typeof row.Client_Depuis).toBe('number');
  });

  it('un client déplacé en arrière (hors "Contrat signé") redevient prospect (Client_Depuis effacé)', async () => {
    comptes[0].Type = 'client';
    comptes[0].Status = 'signe';
    globalThis.grist._tables.CRM_Comptes.rows.set(1, { id: 1, Nom: 'Acme', Type: 'client', Statut: 'signe', Client_Depuis: 123 });
    var kanban = await import('./kanban.js');
    kanban.onKanbanDragStart({ dataTransfer: {} }, 1);
    await kanban.onKanbanDrop({ preventDefault: function() {}, currentTarget: fakeDropTarget('negociation') });
    var row = globalThis.grist._tables.CRM_Comptes.rows.get(1);
    expect(row.Type).toBe('prospect');
    expect(row.Client_Depuis).toBeNull();
  });

  it('déplacer un prospect entre deux étapes qui ne convertissent pas ne change pas le type', async () => {
    var kanban = await import('./kanban.js');
    kanban.onKanbanDragStart({ dataTransfer: {} }, 1);
    await kanban.onKanbanDrop({ preventDefault: function() {}, currentTarget: fakeDropTarget('signature') });
    var row = globalThis.grist._tables.CRM_Comptes.rows.get(1);
    expect(row.Type).toBe('prospect'); // inchangé
  });
});

describe('Kanban — affichage des clients récents (colonne "Contrat signé")', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({});
    comptes.length = 0;
    // 20 clients, Client_Depuis croissant (client-1 = le plus ancien, client-20 = le plus récent).
    for (var i = 1; i <= 20; i++) {
      comptes.push({ id: i, Name: 'client-' + i, Type: 'client', Status: 'signe', Client_Depuis: 1000 + i });
    }
    ensureBoard();
  });

  function signeColumnIds() {
    var container = document.querySelector('.kanban-cards[data-status="signe"]');
    var html = container.innerHTML;
    var matches = html.match(/openEditCompteModal\((\d+)\)/g) || [];
    return matches.map(function(m) { return parseInt(m.match(/\d+/)[0], 10); });
  }

  it('n’affiche que les 15 clients les plus récents par défaut, triés du plus récent au plus ancien', async () => {
    var state = await import('../state.js');
    state.setKanbanShowAllState(false);
    var kanban = await import('./kanban.js');
    kanban.renderKanbanView();
    var ids = signeColumnIds();
    expect(ids).toHaveLength(15);
    expect(ids[0]).toBe(20); // le plus récent en premier
    expect(ids[14]).toBe(6); // le 15e plus récent
  });

  it('"Afficher tous les clients" fait apparaître les 20 clients', async () => {
    var state = await import('../state.js');
    state.setKanbanShowAllState(true);
    var kanban = await import('./kanban.js');
    kanban.renderKanbanView();
    var ids = signeColumnIds();
    expect(ids).toHaveLength(20);
    expect(ids[0]).toBe(20);
    state.setKanbanShowAllState(false); // ne pas polluer les autres tests du fichier
  });
});

describe('Kanban — filtre par Catégorie', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({});
    comptes.length = 0;
    comptes.push({ id: 1, Name: 'Boulangerie', Type: 'prospect', Status: 'nouveau', Category: 'commerce' });
    comptes.push({ id: 2, Name: 'Cabinet Archi', Type: 'prospect', Status: 'nouveau', Category: 'architecture' });
    ensureBoard();
  });

  function nouveauColumnIds() {
    var container = document.querySelector('.kanban-cards[data-status="nouveau"]');
    var html = container.innerHTML;
    var matches = html.match(/openEditCompteModal\((\d+)\)/g) || [];
    return matches.map(function(m) { return parseInt(m.match(/\d+/)[0], 10); });
  }

  it('setFilterCategory ne garde que les comptes de la catégorie choisie', async () => {
    var kanban = await import('./kanban.js');
    kanban.setFilterCategory('commerce');
    expect(nouveauColumnIds()).toEqual([1]);
    kanban.setFilterCategory(''); // ne pas polluer les autres tests du fichier
  });

  it('setFilterCategory(\'\') réaffiche tous les comptes (toutes catégories)', async () => {
    var kanban = await import('./kanban.js');
    kanban.setFilterCategory('architecture');
    kanban.setFilterCategory('');
    expect(nouveauColumnIds().sort()).toEqual([1, 2]);
  });
});
