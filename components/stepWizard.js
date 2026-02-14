// Engine do StepWizard: executa exatamente a navegação declarada no JSON, sem lógica inventada.
export const createStepWizardEngine = (flow, currentStepId) => {
  const steps = Array.isArray(flow?.steps) ? flow.steps : [];
  const stepMap = new Map(steps.map((step) => [step.id, step]));
  const effectiveStepId = currentStepId || flow.initialStepId || steps[0]?.id;
  const currentStep = stepMap.get(effectiveStepId);

  const getStepIndex = (stepId) => steps.findIndex((step) => step.id === stepId);

  const chooseOption = (optionId) => {
    if (!currentStep) {
      return { ok: false, reason: flow?.ui?.invalidOptionMessage || '' };
    }

    const option = (currentStep.options || []).find((entry) => entry.id === optionId);
    if (!option) {
      return { ok: false, reason: flow?.ui?.invalidOptionMessage || '' };
    }

    if (option.nextStepId === null) {
      return { ok: true, nextStepId: null, completed: true };
    }

    if (!stepMap.has(option.nextStepId)) {
      return { ok: false, reason: flow?.ui?.invalidOptionMessage || '' };
    }

    return { ok: true, nextStepId: option.nextStepId, completed: false };
  };

  return {
    currentStep,
    currentIndex: getStepIndex(effectiveStepId),
    totalSteps: steps.length,
    chooseOption,
  };
};

// Renderização do StepWizard: texto e opções exibidos exclusivamente a partir do flows.json.
export const renderStepWizard = (flow, currentStepId, runtimeWarning = '') => {
  const engine = createStepWizardEngine(flow, currentStepId);
  const progress = (flow.ui?.progressTemplate || '')
    .replace('{current}', String(engine.currentIndex + 1))
    .replace('{total}', String(engine.totalSteps));

  if (!engine.currentStep) {
    return `
      <article class="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p>${flow.ui?.invalidOptionMessage || ''}</p>
      </article>
    `;
  }

  return `
    <article class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">${flow.riskLevel}</p>
      <h4 class="mt-1 text-lg font-bold text-slate-900">${flow.title}</h4>
      <p class="mt-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">${progress}</p>
      <p class="mt-3 text-sm font-bold text-slate-900">${engine.currentStep.title}</p>
      <p class="mt-1 text-sm text-slate-700">${engine.currentStep.text}</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        ${(engine.currentStep.options || [])
          .map(
            (option) => `
          <button class="wizard-option rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100" data-flow-id="${flow.id}" data-option-id="${option.id}">
            ${option.label}
          </button>
        `,
          )
          .join('')}
      </div>
      <div class="mt-3 space-y-1 text-xs text-slate-500">
        ${(engine.currentStep.options || [])
          .map((option) => `<p>${option.label}: ${option.origin_ref}</p>`)
          .join('')}
      </div>
      ${runtimeWarning ? `<p class="mt-3 text-xs font-semibold text-amber-700">${runtimeWarning}</p>` : ''}
    </article>
  `;
};
