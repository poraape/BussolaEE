// Componente de layout: recebe metadados de categorias.json para evitar textos fixos no cabeçalho.
export const renderHeader = (appData) => `
  <header class="fixed inset-x-0 top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-sm">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div>
        <h1 class="text-base font-extrabold text-slate-900 sm:text-lg">${appData.name}</h1>
        <p class="text-xs text-slate-500 sm:text-sm">${appData.subtitle}</p>
      </div>
      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">${appData.badge}</span>
    </div>
  </header>
`;

// Navegação fixa: continua acessível em qualquer resolução com itens vindos de JSON.
export const renderFooterNav = (navigation, currentView) => `
  <footer class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-sm">
    <nav class="mx-auto grid w-full max-w-6xl grid-cols-4 gap-1 px-2 py-2 sm:px-4" aria-label="Navegação principal">
      ${navigation
        .map(
          (item) => `
          <button
            data-view="${item.id}"
            class="nav-btn flex min-h-14 flex-col items-center justify-center rounded-2xl px-2 py-1 text-xs font-semibold transition ${
              currentView === item.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }"
          >
            <span class="text-base" aria-hidden="true">${item.icon}</span>
            <span>${item.label}</span>
          </button>
      `,
        )
        .join('')}
    </nav>
  </footer>
`;
