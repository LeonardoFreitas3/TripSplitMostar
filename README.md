# Split & Mostar — itinerário

App de itinerário (React + Vite + Leaflet), pensada para usar no telemóvel.
Mostra o plano dia-a-dia e um mapa com marcadores e rotas por dia. Permite
editar tudo (paragens, horas, notas, coordenadas, hotéis) e guarda as
alterações no Supabase. No telemóvel alterna entre Plano e Mapa; no PC ficam
lado a lado, com o mapa a ocupar a maior parte do ecrã.

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

## Base de dados (Supabase)

No SQL Editor do Supabase:

```sql
create table trips (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table trips enable row level security;

-- Sem login: qualquer pessoa com o URL da app pode ler e editar o itinerário.
create policy "acesso publico" on trips for all using (true) with check (true);

insert into trips (id, data) values ('split-mostar', '{}'::jsonb);
```

Depois copia `.env.example` para `.env` e preenche com o **Project URL** e a
**anon key** (Settings → API). Para o GitHub Pages, mete os mesmos dois valores
em **Settings → Secrets and variables → Actions**, com os mesmos nomes.

> A chave anon vai no bundle e a policy acima é aberta: quem souber o endereço
> da app pode editar o itinerário. Para uma viagem entre amigos chega; se
> quiseres travar, ativa Auth no Supabase e troca a policy por `auth.uid() is
> not null`.

Sem as variáveis definidas, a app volta a guardar em `localStorage` — dá para
desenvolver localmente sem Supabase nenhum.

## Backup

- Menu **⋯ → Exportar** descarrega um `.json` de backup.
- Menu **⋯ → Importar** carrega um `.json`.
- Menu **⋯ → Repor original** volta ao plano de origem (`src/data.js`).

## Estrutura

```
src/
  data.js               Itinerário inicial, hotéis e cores por dia
  supabase.js           Cliente Supabase (ou null, se faltarem env vars)
  storage.js            Ler/gravar na BD + exportar/importar JSON
  App.jsx               Estado, cabeçalho, toggle Plano/Mapa, menu
  components/Plano.jsx   Lista de dias com edição
  components/Mapa.jsx    Mapa Leaflet (marcadores, rotas, filtros)
  index.css             Tema e layout mobile (safe-area iPhone)
```
