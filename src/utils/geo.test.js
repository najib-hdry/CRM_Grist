import { describe, it, expect } from 'vitest';
import { getDepartementFromZip, getDepartementLabel, getCompteDepartement } from './geo.js';

describe('getDepartementFromZip', () => {
  it('returns the first two digits for a standard metropolitan zip', () => {
    expect(getDepartementFromZip('44000')).toBe('44');
    expect(getDepartementFromZip('75001')).toBe('75');
  });

  it('splits Corse into 2A/2B based on the full code', () => {
    expect(getDepartementFromZip('20000')).toBe('2A'); // Ajaccio
    expect(getDepartementFromZip('20600')).toBe('2B'); // Bastia
  });

  it('returns 3-digit codes for DOM-TOM', () => {
    expect(getDepartementFromZip('97100')).toBe('971'); // Guadeloupe
    expect(getDepartementFromZip('98800')).toBe('988');
  });

  it('returns null for missing or too-short input', () => {
    expect(getDepartementFromZip('')).toBeNull();
    expect(getDepartementFromZip(null)).toBeNull();
    expect(getDepartementFromZip('4')).toBeNull();
  });
});

describe('getDepartementLabel', () => {
  it('includes the department name when known', () => {
    expect(getDepartementLabel('93')).toBe('93 — Seine-Saint-Denis');
  });

  it('falls back to the bare code when unknown', () => {
    expect(getDepartementLabel('999')).toBe('999');
  });
});

describe('getCompteDepartement', () => {
  it('prefers the stored Departement column', () => {
    expect(getCompteDepartement({ Departement: '44', Address_Zip: '75000' })).toBe('44');
  });

  it('falls back to computing from the zip code', () => {
    expect(getCompteDepartement({ Departement: '', Address_Zip: '35000' })).toBe('35');
  });

  it('returns an empty string when nothing is available', () => {
    expect(getCompteDepartement({ Departement: '', Address_Zip: '' })).toBe('');
  });
});
