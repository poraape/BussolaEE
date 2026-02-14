import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { createStepWizardEngine } from '../components/stepWizard.js';

const flows = JSON.parse(fs.readFileSync(new URL('../data/flows.json', import.meta.url), 'utf8'));

const getFlow = (id) => flows.find((flow) => flow.id === id);

test('wizard caminha conforme o JSON até conclusão', () => {
  const flow = getFlow('flow-sm-1');
  assert.ok(flow, 'flow-sm-1 deve existir no JSON');

  let stepId = flow.initialStepId;
  const optionOrder = ['sm1-step-1-nao', 'sm1-step-2-sim', 'sm1-step-3-sim'];

  optionOrder.forEach((optionId, index) => {
    const engine = createStepWizardEngine(flow, stepId);
    const result = engine.chooseOption(optionId);
    assert.equal(result.ok, true, `opção ${optionId} deve ser válida`);

    if (index < optionOrder.length - 1) {
      assert.equal(result.completed, false);
      stepId = result.nextStepId;
    } else {
      assert.equal(result.completed, true);
      assert.equal(result.nextStepId, null);
    }
  });
});

test('opção inválida não quebra o sistema e mantém estado navegável', () => {
  const flow = getFlow('flow-vio-1');
  assert.ok(flow, 'flow-vio-1 deve existir no JSON');

  const initialStepId = flow.initialStepId;
  const engine = createStepWizardEngine(flow, initialStepId);
  const result = engine.chooseOption('opcao-inexistente');

  assert.equal(result.ok, false);
  assert.equal(typeof result.reason, 'string');

  const retryEngine = createStepWizardEngine(flow, initialStepId);
  const retry = retryEngine.chooseOption('vio1-step-1-sim');
  assert.equal(retry.ok, true);
  assert.equal(retry.completed, false);
});
