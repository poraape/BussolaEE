# Bússola EE

Aplicação web (Vite) para consulta de protocolos, fluxo de decisão e rede de apoio.

## Build e testes locais

> Requisitos: Node.js LTS e npm.

```bash
npm install
npm run build
npm run test
```

Comandos úteis:

```bash
npm run start   # desenvolvimento
npm run build   # build de produção em dist/
npm run test    # suíte de testes
```

## Deploy no Vercel

Este repositório já inclui `vercel.json` com:
- Detecção de framework Vite
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- Redirects 301 para rotas legadas
- Headers de cache para assets e JSON

### Passo a passo (Dashboard Vercel)

1. Acesse **Vercel → Add New Project**.
2. Importe este repositório GitHub.
3. Em **Build & Output Settings**, confirme:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Clique em **Deploy**.

## Integração GitHub → Vercel

A integração automática fica pronta ao conectar o repositório no painel do Vercel.
Para CI opcional via GitHub Actions, adicione os secrets no GitHub:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Depois, habilite o workflow `.github/workflows/vercel-deploy.yml`.

## Gerar QR code da URL final

Após deploy (ex: `https://bussola-ee.vercel.app`), gere QR no terminal:

```bash
npx qrcode-terminal https://bussola-ee.vercel.app
```

Alternativa (arquivo PNG):

```bash
npx qrcode https://bussola-ee.vercel.app -o bussola-ee.png
```
