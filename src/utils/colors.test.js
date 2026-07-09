import { describe, it, expect } from 'vitest';
import { getTextColorForBackground } from './colors.js';

// Régression : d3.interpolateBlues() renvoie des couleurs au format rgb(r, g, b),
// pas #RRGGBB — un bug de cette nature avait rendu le texte de la carte par
// région illisible sur les valeurs les plus fortes (toujours noir, calcul
// silencieusement en échec faute de gérer ce format).
describe('getTextColorForBackground', () => {
  it('returns white text on a dark rgb() background', () => {
    expect(getTextColorForBackground('rgb(8, 48, 107)')).toBe('#FFFFFF');
  });

  it('returns dark text on a light rgb() background', () => {
    expect(getTextColorForBackground('rgb(222, 235, 247)')).toBe('#1a1a1a');
  });

  it('supports hex colors too', () => {
    expect(getTextColorForBackground('#271A79')).toBe('#FFFFFF');
    expect(getTextColorForBackground('#EEFFEE')).toBe('#1a1a1a');
  });

  it('falls back to dark text for an unrecognized format', () => {
    expect(getTextColorForBackground('not-a-color')).toBe('#1a1a1a');
  });
});
