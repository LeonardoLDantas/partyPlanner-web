# Party Planner Web

Aplicacao web PWA em React para o ecossistema Party Planner, separada do projeto mobile Android.

## Stack

- React 19 + TypeScript
- Vite
- PWA com `vite-plugin-pwa`
- React Query
- React Hook Form + Zod
- Lucide React
- Clean architecture

## Estrutura

- `src/domain`: entidades e contratos
- `src/application`: casos de uso
- `src/infrastructure`: adapters HTTP, storage e container
- `src/presentation`: paginas, componentes, hooks e shell
- `src/shared`: configuracao, utilitarios e bootstrap do PWA

## Como rodar

```bash
npm install
npm run dev
```

Por padrao o frontend aponta para `http://localhost:5112` em desenvolvimento.

Para sobrescrever a API:

```powershell
$env:VITE_API_URL="https://SUA-API"
npm run dev
```

## Build

```bash
npm run build
```
