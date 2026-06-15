# Split & Mostar — itinerário

App de itinerário (React + Vite + Leaflet), pensada para usar no telemóvel.
Mostra o plano dia-a-dia e um mapa com marcadores e rotas por dia. Permite
editar tudo (paragens, horas, notas, coordenadas, hotéis) e guarda as
alterações no próprio telemóvel.

## Correr localmente

```bash
npm install
npm run dev
```

Abre o endereço que o Vite mostra (ex.: http://localhost:5173).

## Pôr no GitHub Pages

1. Cria um repositório no GitHub e envia este projeto:
   ```bash
   git init
   git add .
   git commit -m "Itinerário Split & Mostar"
   git branch -M main
   git remote add origin https://github.com/<utilizador>/<repo>.git
   git push -u origin main
   ```
2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `push` para `main` faz build e publica automaticamente (workflow em
   `.github/workflows/deploy.yml`). O endereço final é
   `https://<utilizador>.github.io/<repo>/`.

O `vite.config.js` usa `base: './'`, por isso funciona em qualquer subpasta do
Pages sem configuração extra.

## Adicionar ao ecrã do iPhone

No Safari, abre o site → botão Partilhar → **Adicionar ao ecrã principal**.
Fica em ecrã inteiro, como uma app.

## Dados e backup

- As edições são guardadas no `localStorage` do telemóvel (sem servidor).
- Menu **⋯ → Exportar** descarrega um `.json` de backup.
- Menu **⋯ → Importar** carrega um `.json` (também serve para passar o
  itinerário para outro dispositivo).
- Menu **⋯ → Repor original** volta ao plano de origem (`src/data.js`).

> Nota: o `localStorage` é por navegador/dispositivo. Para sincronizar entre o
> iPhone e outro aparelho, usa Exportar/Importar.

## Estrutura

```
src/
  data.js               Itinerário inicial, hotéis e cores por dia
  storage.js            localStorage + exportar/importar JSON
  App.jsx               Estado, cabeçalho, toggle Plano/Mapa, menu
  components/Plano.jsx   Lista de dias com edição
  components/Mapa.jsx    Mapa Leaflet (marcadores, rotas, filtros)
  index.css             Tema e layout mobile (safe-area iPhone)
```
