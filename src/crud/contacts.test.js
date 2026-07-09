// Test de non-régression pour le bug RGPD : setContactConsent() écrivait autrefois sur
// RGPD_Consent/RGPD_Consent_Date (noms de champs internes), pas sur les colonnes Grist
// réellement mappées (RGPD_Consentement/RGPD_Date_Consentement) — la case à cocher avait
// l'air de fonctionner mais rien n'était jamais persisté.
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockGrist } from '../../test/mock-grist.js';
import { setContactConsent } from './contacts.js';

describe('setContactConsent (RGPD)', () => {
  beforeEach(() => {
    globalThis.grist = createMockGrist({
      CRM_Contacts: {
        columns: ['Compte_Id', 'Nom', 'Email', 'Telephone', 'RGPD_Consentement', 'RGPD_Date_Consentement'],
        rows: [{ id: 1, Compte_Id: 10, Nom: 'Jean Dupont', RGPD_Consentement: false, RGPD_Date_Consentement: null }]
      }
    });
  });

  it('écrit sur les colonnes Grist mappées quand on coche le consentement', async () => {
    await setContactConsent(1, 10, true);
    var row = globalThis.grist._tables.CRM_Contacts.rows.get(1);
    expect(row.RGPD_Consentement).toBe(true);
    expect(typeof row.RGPD_Date_Consentement).toBe('number');
  });

  it('ne recrée jamais les anciens noms de champs internes (régression)', async () => {
    await setContactConsent(1, 10, true);
    var row = globalThis.grist._tables.CRM_Contacts.rows.get(1);
    expect(row.RGPD_Consent).toBeUndefined();
    expect(row.RGPD_Consent_Date).toBeUndefined();
  });

  it('efface la date de consentement quand on décoche', async () => {
    await setContactConsent(1, 10, true);
    await setContactConsent(1, 10, false);
    var row = globalThis.grist._tables.CRM_Contacts.rows.get(1);
    expect(row.RGPD_Consentement).toBe(false);
    expect(row.RGPD_Date_Consentement).toBeNull();
  });
});
