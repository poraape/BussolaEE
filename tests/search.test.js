import test from 'node:test';
import assert from 'node:assert/strict';

import { groupFuseResults, highlightTextByMatches } from '../components/search.js';

test('highlightTextByMatches marca apenas intervalos informados', () => {
  const html = highlightTextByMatches('Conselho Tutelar', [[0, 7], [9, 11]]);
  assert.equal(html.includes('<mark'), true);
  assert.equal(html.includes('Conselho'), true);
});

test('groupFuseResults agrupa por tipo esperado', () => {
  const grouped = groupFuseResults([
    {
      item: { id: 'categoria-1', group: 'Categorias', title: 'Violência', description: 'Proteção' },
      matches: [{ key: 'title', indices: [[0, 3]] }],
    },
    {
      item: { id: 'flow-1', group: 'Fluxos', title: 'Ideação suicida', description: 'Urgência' },
      matches: [{ key: 'description', indices: [[0, 3]] }],
    },
    {
      item: { id: 'rede-1', group: 'Rede', title: 'SAMU', description: 'Saúde' },
      matches: [],
    },
  ]);

  assert.equal(grouped.Categorias.length, 1);
  assert.equal(grouped.Fluxos.length, 1);
  assert.equal(grouped.Rede.length, 1);
});
