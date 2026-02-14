import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

import { renderFooterNav } from '../components/layout.js';
import { renderBusca, renderDashboard, renderDecisor, renderRede } from '../components/views.js';

const categorias = JSON.parse(fs.readFileSync(new URL('../data/categorias.json', import.meta.url), 'utf8'));
const flows = JSON.parse(fs.readFileSync(new URL('../data/flows.json', import.meta.url), 'utf8'));
const rede = JSON.parse(fs.readFileSync(new URL('../data/rede.json', import.meta.url), 'utf8'));

describe('Smoke de navegação e páginas principais', () => {
  it('renderiza nav com todas as páginas de categorias.json', () => {
    const html = renderFooterNav(categorias.navigation, 'dashboard');
    categorias.navigation.forEach((item) => {
      expect(html.includes(`data-view="${item.id}"`)).toBe(true);
    });
  });

  it('renderiza conteúdo-base de Dashboard, Decisor, Rede e Busca', () => {
    const dashboardHtml = renderDashboard(categorias.categories);
    expect(dashboardHtml.includes(categorias.categories[0].title)).toBe(true);

    const mapByCategory = new Map();
    categorias.categories.forEach((category) => mapByCategory.set(category.id, []));
    const decisorHtml = renderDecisor(categorias.categories, [], mapByCategory);
    expect(decisorHtml.includes('Decisor de risco')).toBe(true);

    const redeHtml = renderRede(rede, 'Todos', ['Saúde', 'Assistência', 'Justiça']);
    expect(redeHtml.includes('Rede de proteção')).toBe(true);

    const buscaHtml = renderBusca('samu', { Categorias: [], Fluxos: [], Rede: [] }, 'ready');
    expect(buscaHtml.includes('Busca de recursos')).toBe(true);
  });

  it('usa dados de flows.json como base de fluxo para páginas', () => {
    expect(flows.length).toBeGreaterThan(0);
    expect(typeof flows[0].title).toBe('string');
    expect(typeof flows[0].summary).toBe('string');
  });
});
