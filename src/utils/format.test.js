import { describe, it, expect } from 'vitest';
import { sanitize, formatAmount, escapeCsv, sanitizeFilename, capitalize, slugifyTypeKey, fillTemplate } from './format.js';

describe('sanitize', () => {
  it('escapes HTML special characters', () => {
    expect(sanitize('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  });

  it('returns an empty string for falsy input', () => {
    expect(sanitize(null)).toBe('');
    expect(sanitize(undefined)).toBe('');
  });
});

describe('formatAmount', () => {
  it('formats a number as euros', () => {
    // toLocaleString('fr-FR') uses a narrow no-break space (U+202F) as thousands separator.
    expect(formatAmount(18500)).toBe('18\u202f500 €');
  });

  it('returns a dash for empty values', () => {
    expect(formatAmount(null)).toBe('—');
    expect(formatAmount('')).toBe('—');
  });
});

describe('escapeCsv', () => {
  it('wraps values containing commas or quotes', () => {
    expect(escapeCsv('a,b')).toBe('"a,b"');
    expect(escapeCsv('say "hi"')).toBe('"say ""hi"""');
  });

  it('leaves plain values untouched', () => {
    expect(escapeCsv('plain')).toBe('plain');
  });
});

describe('sanitizeFilename', () => {
  it('replaces non-alphanumeric characters and lowercases', () => {
    expect(sanitizeFilename('Export Été 2026!')).toBe('export_t_2026_');
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter only', () => {
    expect(capitalize('prospect')).toBe('Prospect');
  });
});

describe('slugifyTypeKey', () => {
  it('produces a readable ascii slug', () => {
    expect(slugifyTypeKey('Ancien client')).toBe('ancien_client');
  });

  it('falls back to "type" for empty input', () => {
    expect(slugifyTypeKey('')).toBe('type');
  });
});

describe('fillTemplate', () => {
  it('replaces known variables', () => {
    expect(fillTemplate('Bonjour {contact}', { contact: 'Marie' })).toBe('Bonjour Marie');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(fillTemplate('Bonjour {inconnu}', {})).toBe('Bonjour {inconnu}');
  });
});
