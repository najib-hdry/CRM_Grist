// Un client créé directement (bouton "+ Client") doit démarrer à l'étape "Contrat signé"
// du pipeline, pas à la première étape (réservée aux prospects).
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';
import { openNewCompteModal } from './compte-modal.js';

describe('openNewCompteModal — statut par défaut selon le type', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({});
  });

  it('un nouveau client démarre sur l’étape marquée "Contrat signé" (marksAsClient)', () => {
    openNewCompteModal('client');
    expect(document.getElementById('compte-status').value).toBe('signe');
  });

  it('un nouveau prospect démarre sur la première étape du pipeline', () => {
    openNewCompteModal('prospect');
    expect(document.getElementById('compte-status').value).toBe('nouveau');
  });
});

describe('openNewCompteModal — champ Tag (choix unique + création à la volée)', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({});
  });

  it('propose l’option "+ Créer un nouveau tag..." et masque le champ personnalisé par défaut', () => {
    openNewCompteModal('prospect');
    var select = document.getElementById('compte-tag');
    var customInput = document.getElementById('compte-tag-custom');
    var options = Array.from(select.options).map(function(o) { return o.value; });
    expect(options).toContain('__new__');
    expect(customInput.classList.contains('hidden')).toBe(true);
  });
});

describe('openNewCompteModal — champ Catégorie (choix unique + création à la volée)', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({});
  });

  it('propose l’option "+ Créer une nouvelle catégorie..." et masque le champ personnalisé par défaut', () => {
    openNewCompteModal('prospect');
    var select = document.getElementById('compte-category');
    var customInput = document.getElementById('compte-category-custom');
    var options = Array.from(select.options).map(function(o) { return o.value; });
    expect(options).toContain('__new__');
    expect(customInput.classList.contains('hidden')).toBe(true);
  });
});
