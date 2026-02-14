import { describe, expect, it } from 'vitest';
import fs from 'node:fs';

import { createStepWizardEngine } from '../components/stepWizard.js';

const flows = JSON.parse(fs.readFileSync(new URL('../data/flows.json', import.meta.url), 'utf8'));

const findFlow = (id) => flows.find((flow) => flow.id === id);

describe('StepWizard com dados reais de flows.json', () => {
  it('executa passo a passo em múltiplos fluxos', () => {
    const flowA = findFlow('flow-sm-1');
    const flowB = findFlow('flow-vio-1');

    let currentA = flowA.initialStepId;
    ['sm1-step-1-sim', 'sm1-step-2-nao', 'sm1-step-3-sim'].forEach((optionId, index) => {
      const engine = createStepWizardEngine(flowA, currentA);
      const result = engine.chooseOption(optionId);
      expect(result.ok).toBe(true);
      if (index < 2) currentA = result.nextStepId;
      else expect(result.completed).toBe(true);
    });

    let currentB = flowB.initialStepId;
    ['vio1-step-1-nao', 'vio1-step-2-sim', 'vio1-step-3-nao'].forEach((optionId, index) => {
      const engine = createStepWizardEngine(flowB, currentB);
      const result = engine.chooseOption(optionId);
      expect(result.ok).toBe(true);
      if (index < 2) currentB = result.nextStepId;
      else expect(result.completed).toBe(true);
    });
  });

  it('trata comportamento de borda sem dados válidos e opção inválida', () => {
    const invalidFlow = {
      id: 'invalid',
      initialStepId: 'missing-step',
      steps: [],
      ui: { invalidOptionMessage: 'Opção inválida para este passo.' },
    };

    const invalidEngine = createStepWizardEngine(invalidFlow, invalidFlow.initialStepId);
    const invalidResult = invalidEngine.chooseOption('any');
    expect(invalidResult.ok).toBe(false);

    const validFlow = findFlow('flow-sm-1');
    const validEngine = createStepWizardEngine(validFlow, validFlow.initialStepId);
    const wrongOptionResult = validEngine.chooseOption('opcao-inexistente');
    expect(wrongOptionResult.ok).toBe(false);
    expect(wrongOptionResult.reason).toBe(validFlow.ui.invalidOptionMessage);
  });
});
