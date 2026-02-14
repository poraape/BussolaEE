# AGENTS.md — Guia de operação do Codex no projeto Bússola

Este arquivo define como o Codex deve operar neste repositório para manter consistência técnica, previsibilidade e segurança nas mudanças.

## 1) Modo de operação do Codex

- Trabalhe com mudanças pequenas, rastreáveis e focadas no objetivo solicitado.
- Antes de alterar arquivos, revise o contexto mínimo necessário do repositório.
- Sempre valide localmente (lint, testes e build) antes de concluir.
- Nunca quebre contratos públicos sem explicitar no resumo da alteração.
- Prefira nomenclatura clara e código legível sobre “atalhos” difíceis de manter.
- Evite adicionar dependências sem justificar o ganho técnico.

## 2) Padrões de código (lint e formatação)

### JavaScript / React
- Use ESLint para qualidade estática.
- Use Prettier para padronização de formato.
- Indentação: 2 espaços.
- Strings: aspas simples, salvo quando a ferramenta de formatação decidir diferente.
- Sempre remover código morto e imports não utilizados.

### Tailwind / CSS
- Evite estilos inline quando classes utilitárias resolverem com clareza.
- Em componentes React, manter classes organizadas por estrutura, espaçamento e estado.

## 3) Comandos de desenvolvimento local

> Requer Node.js LTS (recomendado >= 20) e npm >= 10.

- Instalar dependências:
  - `npm install`
- Subir app em modo de desenvolvimento:
  - `npm run start`
- Gerar build de produção:
  - `npm run build`
- Rodar testes:
  - `npm run test`
- Rodar lint:
  - `npm run lint`
- Formatar código:
  - `npm run format`

## 4) Consumo de dados JSON no app

Para manter previsibilidade em dev/prod:

- Armazene JSON estático em `public/data/*.json`.
- Consuma no front-end via caminho absoluto relativo à raiz pública:
  - Exemplo: `fetch('/data/exemplo.json')`.
- Trate falhas de carregamento com `try/catch` no fluxo assíncrono da chamada (não em imports).
- Valide presença de campos obrigatórios antes de renderizar.
- Se necessário, centralize a leitura em um módulo de serviço (ex.: `src/services/dataClient.ts`) para reutilização e testes.

## 5) Checklist mínimo antes de entregar alterações

- `npm run lint` sem erros.
- `npm run test` sem falhas.
- `npm run build` concluído.
- Atualização de documentação (quando houver mudança de comportamento).

Seguir este guia torna o ambiente previsível para manutenção contínua e evolução da Bússola.
