// Règle métier : CRM_JournalActivite ne doit contenir QUE l'historique des commentaires et
// des tâches — toutes les autres actions (création/modification/suppression de compte,
// déplacement Kanban, conversion en client, suppression RGPD d'un contact) ne doivent plus
// y écrire de ligne.
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';
import { comptes, contacts } from '../state.js';

function journalRows() {
  return Array.from(globalThis.grist._tables.CRM_JournalActivite
    ? globalThis.grist._tables.CRM_JournalActivite.rows.values()
    : []);
}

describe('Journal d’activité — actions qui ne doivent PLUS être journalisées', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: {
        columns: ['Nom', 'Type', 'Statut', 'Priorite'],
        rows: [{ id: 10, Nom: 'Compte Test', Type: 'prospect', Statut: 'nouveau', Priorite: 'medium' }]
      },
      CRM_Contacts: {
        columns: ['Compte_Id', 'Nom', 'RGPD_Consentement'],
        rows: [{ id: 20, Compte_Id: 10, Nom: 'Contact Test' }]
      }
    });
    comptes.length = 0;
    comptes.push({ id: 10, Name: 'Compte Test', Type: 'prospect', Status: 'nouveau' });
    contacts.length = 0;
    contacts.push({ id: 20, Compte_Id: 10, Name: 'Contact Test' });
  });

  it('la création d’un compte ne journalise rien', async () => {
    var modal = await import('../modal/compte-modal.js');
    var comptesCrud = await import('../crud/comptes.js');
    modal.openNewCompteModal('prospect');
    document.getElementById('compte-name').value = 'Nouveau Compte';
    await comptesCrud.saveCompteFromModal(null);
    expect(journalRows()).toHaveLength(0);
  });

  it('la modification d’un compte ne journalise rien', async () => {
    var modal = await import('../modal/compte-modal.js');
    var comptesCrud = await import('../crud/comptes.js');
    modal.openEditCompteModal(10, false);
    modal.switchModalTab('info', 10);
    document.getElementById('compte-name').value = 'Compte Renommé';
    await comptesCrud.saveCompteFromModal(10);
    expect(journalRows()).toHaveLength(0);
  });

  it('la suppression d’un compte ne journalise rien', async () => {
    var state = await import('../state.js');
    state.setRole(true, false); // Owner requis pour deleteCompte
    var comptesCrud = await import('../crud/comptes.js');
    // showConfirmModal() attend un clic ; on répond "oui" immédiatement.
    var confirmPromise = comptesCrud.deleteCompte(10);
    document.getElementById('confirm-ok-btn').click();
    await confirmPromise;
    expect(journalRows()).toHaveLength(0);
  });

  it('la suppression RGPD d’un contact ne journalise rien', async () => {
    var state = await import('../state.js');
    state.setRole(true, false);
    var contactsCrud = await import('../crud/contacts.js');
    var confirmPromise = contactsCrud.rgpdDeleteContact(20, 10);
    document.getElementById('confirm-ok-btn').click();
    await confirmPromise;
    expect(journalRows()).toHaveLength(0);
  });
});

describe('Journal d’activité — commentaires et tâches restent journalisés', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Comptes: { columns: ['Nom'], rows: [{ id: 10, Nom: 'Compte Test' }] },
      CRM_Commentaires: { columns: ['Compte_Id', 'Auteur', 'Contenu', 'Cree_Le'], rows: [] },
      CRM_Taches: { columns: ['Compte_Id', 'Titre', 'Statut', 'Cree_Le'], rows: [] }
    });
    comptes.length = 0;
    comptes.push({ id: 10, Name: 'Compte Test' });
  });

  it('ajouter une note journalise "comment_added"', async () => {
    document.getElementById('modal-container').innerHTML = '<textarea id="new-comment-input">Une note</textarea>';
    var commentsCrud = await import('../crud/comments.js');
    await commentsCrud.addCrmComment(10);
    var actions = journalRows().map(function(r) { return r.Action; });
    expect(actions).toContain('comment_added');
  });

  it('ajouter une tâche journalise "task_added"', async () => {
    document.getElementById('modal-container').innerHTML = '<input id="new-task-title" value="Ma tâche">';
    var tasksCrud = await import('../crud/tasks.js');
    await tasksCrud.addCrmTask(10);
    var actions = journalRows().map(function(r) { return r.Action; });
    expect(actions).toContain('task_added');
  });

  it('cocher une tâche comme faite journalise "task_completed"', async () => {
    globalThis.grist._tables.CRM_Taches.rows.set(30, { id: 30, Compte_Id: 10, Titre: 'Ma tâche', Statut: 'a_faire' });
    var state = await import('../state.js');
    state.crmTasks.push({ id: 30, Compte_Id: 10, Title: 'Ma tâche', Status: 'a_faire' });
    var tasksCrud = await import('../crud/tasks.js');
    await tasksCrud.toggleCrmTask(30, 10, true);
    var actions = journalRows().map(function(r) { return r.Action; });
    expect(actions).toContain('task_completed');
  });
});
