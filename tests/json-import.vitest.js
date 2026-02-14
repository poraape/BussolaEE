import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

const categorias = JSON.parse(fs.readFileSync(new URL('../data/categorias.json', import.meta.url), 'utf8'));
const flows = JSON.parse(fs.readFileSync(new URL('../data/flows.json', import.meta.url), 'utf8'));
const rede = JSON.parse(fs.readFileSync(new URL('../data/rede.json', import.meta.url), 'utf8'));

describe('Importação de JSONs de protocolo', () => {
  it('carrega categorias.json, flows.json e rede.json com estrutura válida', () => {
    expect(Array.isArray(categorias.categories)).toBe(true);
    expect(Array.isArray(flows)).toBe(true);
    expect(Array.isArray(rede)).toBe(true);
  });

  it('usa categorias.json como fonte para categoryId dos fluxos', () => {
    const categoryIds = new Set(categorias.categories.map((category) => category.id));
    flows.forEach((flow) => {
      expect(categoryIds.has(flow.categoryId)).toBe(true);
    });
  });
});
