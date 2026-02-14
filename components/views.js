// Dashboard: lista categorias vindas de categorias.json em grade responsiva mobile-first.
export const renderDashboard = (categories) => `
  <section class="space-y-4 sm:space-y-6">
    <article class="rounded-3xl bg-slate-900 p-5 text-white sm:p-8">
      <h2 class="text-2xl font-black leading-tight sm:text-3xl">Central de protocolos</h2>
      <p class="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">Acompanhe as categorias institucionais e acesse fluxos validados.</p>
    </article>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      ${categories
        .map(
          (category) => `
          <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-2xl" aria-hidden="true">${category.icon}</p>
            <p class="mt-2 text-base font-bold text-slate-900">${category.title}</p>
            <p class="text-sm text-slate-500">${category.description}</p>
          </article>
      `,
        )
        .join('')}
    </div>
  </section>
`;

// Decisor: recebe blocos de wizard já derivados do JSON para cada categoria.
export const renderDecisor = (categories, flowWarnings, wizardByCategory) => `
  <section class="space-y-4 sm:space-y-6">
    <header>
      <h2 class="text-2xl font-black text-slate-900 sm:text-3xl">Decisor de risco</h2>
      <p class="mt-2 text-sm text-slate-600 sm:text-base">Fluxos exibidos exclusivamente a partir de flows.json.</p>
    </header>

    ${
      flowWarnings.length
        ? `<aside class="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p class="font-bold">Avisos de validação de fluxo</p>
            <ul class="mt-2 list-disc space-y-1 pl-5">${flowWarnings.map((warning) => `<li>${warning}</li>`).join('')}</ul>
          </aside>`
        : ''
    }

    <div class="space-y-4">
      ${categories
        .map((category) => {
          const wizardBlocks = wizardByCategory.get(category.id) || [];
          const content = wizardBlocks.length
            ? wizardBlocks.join('')
            : '<p class="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Nenhum fluxo válido para esta categoria.</p>';

          return `
            <section class="space-y-2">
              <h3 class="text-lg font-bold text-slate-900">${category.icon} ${category.title}</h3>
              <div class="space-y-3">${content}</div>
            </section>
          `;
        })
        .join('')}
    </div>
  </section>
`;

// Rede: renderiza filtro por tipo e container do mapa, mantendo lista de apoio responsiva.
export const renderRede = (contacts, selectedType, availableTypes) => `
  <section class="space-y-4">
    <h2 class="text-2xl font-black text-slate-900 sm:text-3xl">Rede de proteção</h2>
    <div class="flex flex-wrap gap-2">
      <button class="network-filter rounded-full px-4 py-2 text-xs font-semibold ${selectedType === 'Todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}" data-network-filter="Todos">Todos</button>
      ${availableTypes
        .map(
          (type) => `<button class="network-filter rounded-full px-4 py-2 text-xs font-semibold ${selectedType === type ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}" data-network-filter="${type}">${type}</button>`,
        )
        .join('')}
    </div>
    <div id="network-map" class="h-[45vh] min-h-[18rem] w-full rounded-2xl border border-slate-200"></div>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      ${contacts
        .map(
          (contact) => `
          <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-sm font-semibold text-blue-700">${contact.type}</p>
            <h3 class="text-lg font-bold text-slate-900">${contact.name}</h3>
            <p class="mt-1 text-sm text-slate-600">${contact.address}</p>
            <p class="mt-1 text-sm text-slate-600">Horário: ${contact.hours}</p>
            <p class="mt-1 text-sm text-slate-600">Obs: ${contact.notes}</p>
            <a href="tel:${contact.phone}" class="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">${contact.phone}</a>
          </article>
      `,
        )
        .join('')}
    </div>
  </section>
`;

// Busca: usa resultados Fuse.js agrupados por tipo e destaca trechos de alta relevância.
export const renderBusca = (query, groupedResults, status) => {
  const sectionOrder = ['Categorias', 'Fluxos', 'Rede'];
  const hasResults = sectionOrder.some((section) => (groupedResults[section] || []).length > 0);

  return `
    <section class="space-y-4">
      <h2 class="text-2xl font-black text-slate-900 sm:text-3xl">Busca de recursos</h2>
      <label class="block">
        <span class="sr-only">Busca</span>
        <input id="search-input" value="${query}" class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-blue-500 focus:ring" placeholder="Pesquisar categoria, fluxo ou serviço" />
      </label>
      ${
        status === 'loading'
          ? '<p class="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Carregando busca inteligente...</p>'
          : ''
      }
      ${
        status === 'ready' && query.trim() && !hasResults
          ? '<p class="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">Não consta no protocolo</p>'
          : ''
      }
      <div class="space-y-4">
        ${sectionOrder
          .map((section) => {
            const entries = groupedResults[section] || [];
            if (!entries.length) return '';

            return `
              <section class="space-y-2">
                <h3 class="text-xs font-black uppercase tracking-wide text-slate-500">${section}</h3>
                ${entries
                  .map(
                    (entry) => `
                    <article class="rounded-xl border border-slate-200 bg-white p-3">
                      <p class="text-sm font-semibold text-slate-900">${entry.title}</p>
                      <p class="text-sm text-slate-600">${entry.description}</p>
                    </article>
                  `,
                  )
                  .join('')}
              </section>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
};
