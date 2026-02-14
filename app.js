import { renderFooterNav, renderHeader } from './components/layout.js';
import { renderBusca, renderDashboard, renderDecisor, renderRede } from './components/views.js';
import { createStepWizardEngine, renderStepWizard } from './components/stepWizard.js';
import { groupFuseResults } from './components/search.js';

// Estado: mantém dados JSON, warnings e posição atual de cada wizard por flowId.
const state = {
  currentView: 'dashboard',
  searchQuery: '',
  categoriasData: null,
  flows: [],
  rede: [],
  networkFilter: 'Todos',
  flowWarnings: [],
  wizardStepByFlow: {},
  wizardRuntimeWarningByFlow: {},
  searchStatus: 'idle',
  groupedSearchResults: { Categorias: [], Fluxos: [], Rede: [] },
};

const root = document.getElementById('app');
let leafletLib = null;
let mapInstance = null;
let markersLayer = null;
let fuseLib = null;
let fuseInstance = null;

// Lazy loader do Leaflet: só baixa CSS/JS quando usuário entra na página de rede.
const ensureLeafletLoaded = async () => {
  if (leafletLib) return leafletLib;

  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  await new Promise((resolve, reject) => {
    if (window.L) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Leaflet.'));
    document.body.appendChild(script);
  });

  leafletLib = window.L;
  return leafletLib;
};

// Lazy loader do Fuse.js: carrega busca fuzzy somente quando a página Busca é aberta.
const ensureFuseLoaded = async () => {
  if (fuseLib) return fuseLib;

  await new Promise((resolve, reject) => {
    if (window.Fuse) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Fuse.js.'));
    document.body.appendChild(script);
  });

  fuseLib = window.Fuse;
  return fuseLib;
};

const getFilteredNetwork = () =>
  state.networkFilter === 'Todos'
    ? state.rede
    : state.rede.filter((contact) => contact.type === state.networkFilter);

const getNetworkTypes = () => [...new Set(state.rede.map((contact) => contact.type))];

const buildSearchDocuments = () => {
  const categoryDocs = (state.categoriasData?.categories || []).map((category) => ({
    id: `categoria-${category.id}`,
    group: 'Categorias',
    title: category.title,
    description: category.description,
  }));

  const flowDocs = state.flows.map((flow) => ({
    id: `flow-${flow.id}`,
    group: 'Fluxos',
    title: flow.title,
    description: flow.summary,
  }));

  const networkDocs = state.rede.map((contact) => ({
    id: `rede-${contact.id}`,
    group: 'Rede',
    title: contact.name,
    description: contact.type,
  }));

  return [...categoryDocs, ...flowDocs, ...networkDocs];
};

const runSearch = () => {
  if (!fuseInstance || !state.searchQuery.trim()) {
    state.groupedSearchResults = { Categorias: [], Fluxos: [], Rede: [] };
    return;
  }

  const results = fuseInstance.search(state.searchQuery, { limit: 25 });
  state.groupedSearchResults = groupFuseResults(results);
};

const initFuseSearch = async () => {
  if (fuseInstance || state.searchStatus === 'loading') return;

  state.searchStatus = 'loading';
  render();

  const Fuse = await ensureFuseLoaded();
  const documents = buildSearchDocuments();

  // Configuração de alta relevância: threshold baixo e match mínimo para reduzir falso positivo.
  fuseInstance = new Fuse(documents, {
    includeScore: true,
    includeMatches: true,
    shouldSort: true,
    threshold: 0.22,
    ignoreLocation: true,
    minMatchCharLength: 2,
    distance: 60,
    keys: [
      { name: 'title', weight: 0.72 },
      { name: 'description', weight: 0.28 },
    ],
  });

  state.searchStatus = 'ready';
  runSearch();
  render();
};

const updateNetworkMapMarkers = (L) => {
  if (!mapInstance || !markersLayer) return;

  const filtered = getFilteredNetwork();
  markersLayer.clearLayers();

  filtered.forEach((contact) => {
    if (typeof contact.lat !== 'number' || typeof contact.lng !== 'number') return;

    const popup = `
      <div style="font-family: sans-serif; min-width: 190px;">
        <strong>${contact.name}</strong><br/>
        <span>${contact.type}</span><br/>
        <a href="tel:${contact.phone}">${contact.phone}</a><br/>
        <span>Horário: ${contact.hours}</span><br/>
        <span>${contact.notes}</span>
      </div>
    `;

    L.marker([contact.lat, contact.lng]).bindPopup(popup).addTo(markersLayer);
  });

  if (filtered.length) {
    const bounds = L.latLngBounds(filtered.map((contact) => [contact.lat, contact.lng]));
    mapInstance.fitBounds(bounds, { padding: [20, 20] });
  }
};

// Inicialização do mapa de rede: adiciona camada OSM com atribuição no rodapé do mapa.
const initNetworkMap = async () => {
  const mapContainer = document.getElementById('network-map');
  if (!mapContainer) return;

  const L = await ensureLeafletLoaded();

  if (!mapInstance) {
    mapInstance = L.map('network-map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);
    markersLayer = L.layerGroup().addTo(mapInstance);
  }

  updateNetworkMapMarkers(L);
  setTimeout(() => mapInstance.invalidateSize(), 0);
};

// Validação de fluxo: exige schema de steps/opções para manter decisão coerente com o JSON.
const validateFlows = (rawFlows) => {
  const warnings = [];
  const validFlows = rawFlows.filter((flow, index) => {
    const flowRef = flow?.id || `índice ${index}`;

    if (!flow || typeof flow !== 'object') {
      warnings.push(`Fluxo ${flowRef}: registro inválido (esperado objeto).`);
      return false;
    }

    const hasRequiredStrings =
      typeof flow.id === 'string' &&
      typeof flow.categoryId === 'string' &&
      typeof flow.title === 'string' &&
      typeof flow.summary === 'string' &&
      typeof flow.riskLevel === 'string' &&
      typeof flow.initialStepId === 'string';

    if (!hasRequiredStrings) {
      warnings.push(`Fluxo ${flowRef}: campos obrigatórios ausentes ou em tipo incorreto.`);
      return false;
    }

    if (!flow.ui || typeof flow.ui.progressTemplate !== 'string' || typeof flow.ui.invalidOptionMessage !== 'string') {
      warnings.push(`Fluxo ${flowRef}: bloco ui inválido ou incompleto.`);
      return false;
    }

    if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
      warnings.push(`Fluxo ${flowRef}: steps deve ser uma lista não vazia.`);
      return false;
    }

    const stepIds = new Set(flow.steps.map((step) => step.id));
    if (!stepIds.has(flow.initialStepId)) {
      warnings.push(`Fluxo ${flowRef}: initialStepId não encontrado em steps.`);
      return false;
    }

    for (const step of flow.steps) {
      const validStep =
        step &&
        typeof step.id === 'string' &&
        typeof step.title === 'string' &&
        typeof step.text === 'string' &&
        Array.isArray(step.options) &&
        step.options.length > 0;

      if (!validStep) {
        warnings.push(`Fluxo ${flowRef}: passo inválido detectado.`);
        return false;
      }

      for (const option of step.options) {
        const validOption =
          option &&
          typeof option.id === 'string' &&
          typeof option.label === 'string' &&
          typeof option.origin_ref === 'string' &&
          (typeof option.nextStepId === 'string' || option.nextStepId === null);

        if (!validOption) {
          warnings.push(`Fluxo ${flowRef}: opção inválida no passo ${step.title}.`);
          return false;
        }

        if (typeof option.nextStepId === 'string' && !stepIds.has(option.nextStepId)) {
          warnings.push(`Fluxo ${flowRef}: nextStepId inválido no passo ${step.title}.`);
          return false;
        }
      }
    }

    return true;
  });

  if (warnings.length) {
    warnings.forEach((warning) => console.warn(`[flows.json] ${warning}`));
  }

  return { validFlows, warnings };
};

const getWizardByCategory = () => {
  const grouped = new Map();

  state.flows.forEach((flow) => {
    const stepId = state.wizardStepByFlow[flow.id] || flow.initialStepId;
    const warning = state.wizardRuntimeWarningByFlow[flow.id] || '';
    const html = renderStepWizard(flow, stepId, warning);

    if (!grouped.has(flow.categoryId)) {
      grouped.set(flow.categoryId, []);
    }
    grouped.get(flow.categoryId).push(html);
  });

  return grouped;
};

const getViewMarkup = () => {
  if (!state.categoriasData) {
    return '<p class="text-sm text-slate-600">Carregando conteúdo...</p>';
  }

  if (state.currentView === 'dashboard') return renderDashboard(state.categoriasData.categories);
  if (state.currentView === 'decisor') {
    return renderDecisor(state.categoriasData.categories, state.flowWarnings, getWizardByCategory());
  }
  if (state.currentView === 'rede') {
    return renderRede(getFilteredNetwork(), state.networkFilter, getNetworkTypes());
  }
  return renderBusca(state.searchQuery, state.groupedSearchResults, state.searchStatus);
};

const bindWizardEvents = () => {
  document.querySelectorAll('.wizard-option').forEach((button) => {
    button.addEventListener('click', () => {
      const flowId = button.dataset.flowId;
      const optionId = button.dataset.optionId;
      const flow = state.flows.find((entry) => entry.id === flowId);
      if (!flow) return;

      const currentStepId = state.wizardStepByFlow[flow.id] || flow.initialStepId;
      const engine = createStepWizardEngine(flow, currentStepId);
      const result = engine.chooseOption(optionId);

      if (!result.ok) {
        state.wizardRuntimeWarningByFlow[flow.id] = result.reason;
        render();
        return;
      }

      if (result.completed) {
        state.wizardRuntimeWarningByFlow[flow.id] = flow.ui.completedMessage;
      } else {
        state.wizardStepByFlow[flow.id] = result.nextStepId;
        state.wizardRuntimeWarningByFlow[flow.id] = '';
      }

      render();
    });
  });
};

const bindNetworkEvents = () => {
  document.querySelectorAll('.network-filter').forEach((button) => {
    button.addEventListener('click', () => {
      state.networkFilter = button.dataset.networkFilter;
      render();
    });
  });
};

const bindSearchEvents = () => {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (event) => {
    state.searchQuery = event.target.value;
    runSearch();
    render();
  });
};

// Render principal: mantém layout responsivo e conecta interações das páginas.
const render = () => {
  if (!state.categoriasData) {
    root.innerHTML = '<main class="p-4">Carregando...</main>';
    return;
  }

  root.innerHTML = `
    ${renderHeader(state.categoriasData.app)}
    <main class="mx-auto min-h-[100dvh] w-full max-w-6xl px-4 pb-24 pt-24 sm:px-6 sm:pb-28">
      ${getViewMarkup()}
    </main>
    ${renderFooterNav(state.categoriasData.navigation, state.currentView)}
  `;

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.currentView = button.dataset.view;
      render();
    });
  });

  bindWizardEvents();

  if (state.currentView === 'rede') {
    bindNetworkEvents();
    initNetworkMap();
  }

  if (state.currentView === 'busca') {
    bindSearchEvents();
    initFuseSearch();
  }
};

// Bootstrap: carrega categorias.json, flows.json e rede.json sem dados estáticos no código.
const bootstrap = async () => {
  const [categoriasResponse, flowsResponse, redeResponse] = await Promise.all([
    fetch('./data/categorias.json'),
    fetch('./data/flows.json'),
    fetch('./data/rede.json'),
  ]);

  state.categoriasData = await categoriasResponse.json();
  state.rede = await redeResponse.json();

  const rawFlows = await flowsResponse.json();
  const { validFlows, warnings } = validateFlows(rawFlows);
  state.flows = validFlows;
  state.flowWarnings = warnings;

  render();
};

bootstrap();
