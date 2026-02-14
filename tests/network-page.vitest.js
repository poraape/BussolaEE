import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

import { renderRede } from '../components/views.js';

const rede = JSON.parse(fs.readFileSync(new URL('../data/rede.json', import.meta.url), 'utf8'));

describe('NetworkPage', () => {
  it('renderiza todos os marcadores esperados com base em rede.json', () => {
    const html = renderRede(rede, 'Todos', ['Saúde', 'Assistência', 'Justiça']);
    const markerEligible = rede.filter((contact) => typeof contact.lat === 'number' && typeof contact.lng === 'number').length;

    expect(html.includes('id="network-map"')).toBe(true);
    expect((html.match(/<article /g) || []).length).toBe(markerEligible);
  });
});
