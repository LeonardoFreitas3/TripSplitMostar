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
create policy "so autenticados" on trips for all
  to authenticated using (true) with check (true);
```

Uma linha por viagem; o título e os dias vivem todos dentro do `data`. As
viagens criam-se na app (**+ Nova viagem**), não é preciso inserir nada à mão.

## Acesso (login obrigatório)

A app pede email e password. A password não é verificada no browser — é a
policy acima que exige sessão autenticada, por isso ir direto à API REST com a
chave publishable também não devolve nada.

No painel do Supabase:

1. **Authentication → Users → Add user**: cria o utilizador com email e
   password, com *Auto Confirm User* ligado.
2. **Authentication → Sign In / Providers → Email**: desliga **Allow new
   users to sign up**. Sem isto, qualquer pessoa cria uma conta e entra.

Para dar acesso a outra pessoa, cria-lhe um utilizador da mesma forma. Todos
os utilizadores autenticados veem todas as viagens — não há dono por viagem.

A sessão fica guardada no dispositivo, portanto o login não se repete a cada
visita. **⋯ → Terminar sessão** (ou **Sair**, na lista) fecha-a.

Depois copia `.env.example` para `.env` e preenche com o **Project URL** e a
**anon key** (Settings → API). Para o GitHub Pages, mete os mesmos dois valores
em **Settings → Secrets and variables → Actions**, com os mesmos nomes.

> A chave publishable vai no bundle — é suposto, foi feita para ser pública.
> Quem protege os dados são as policies: com `to authenticated`, a chave
> sozinha não lê nem escreve nada.

Sem as variáveis definidas a app não arranca — mostra o erro em vez de fingir
que guardou.

## Fotos das paragens

Ao abrir um ponto no mapa, aparece por baixo da descrição uma galeria com até
10 fotos do sítio, que se arrasta para o lado. Nada fica guardado na viagem:
procura-se ao abrir o popup e fica em memória até se recarregar a página. Por
isso uma paragem nova mostra fotos sem se lhe tocar.

**Com `VITE_GOOGLE_PLACES_KEY`** usa a Places API (New), procurando pelo lugar
que está nas coordenadas do pin (raio de 80 m). Cobre quase tudo: restaurantes,
hotéis, praias.

1. [Google Cloud Console](https://console.cloud.google.com/) → projeto novo e
   **ativa a faturação** (a Places API não funciona sem isso).
2. Ativa a **Places API (New)**. A antiga não serve, não tem CORS.
3. Cria a chave e **restringe-a**: *Websites* com
   `https://<utilizador>.github.io/*` e `http://localhost:5173/*`, e
   *API restrictions* só à Places API (New).
4. Põe a chave no `.env` e nos secrets do GitHub.
5. **Billing → Budgets & alerts**: põe um alerta baixo.

> O login da app **não** protege esta chave: o ficheiro JavaScript é servido
> publicamente pelo GitHub Pages e qualquer pessoa o descarrega sem entrar. A
> restrição por website é a única defesa.

Custos: uma pesquisa por popup aberto (Nearby Search Pro, 5.000 grátis/mês) e
um pedido por foto **efetivamente vista** (Place Photo, 1.000 grátis/mês). Só
a primeira imagem da galeria carrega de imediato; as outras esperam que se
arraste até elas, para não gastar 10 pedidos de cada vez que se abre um ponto.

**Sem chave** cai no Wikidata (OpenStreetMap → Wikidata P18 → Wikimedia
Commons): grátis e sem conta, mas só uma foto e só de sítios conhecidos. No
itinerário de exemplo acertava em 12 de 33 paragens.

O link **Abrir no Google Maps** usa só as coordenadas, nunca precisa de chave.

## Backup

- Menu **⋯ → Exportar** descarrega um `.json` da viagem aberta.
- Menu **⋯ → Importar** substitui a viagem aberta pelo conteúdo de um `.json`.

## Estrutura

```
src/
  data.js               Cores por dia
  supabase.js           Cliente Supabase (ou null, se faltarem env vars)
  storage.js            Listar/criar/ler/gravar viagens + exportar/importar JSON
  App.jsx               Sessão, rota no hash (lista vs viagem) e cabeçalho
  components/Login.jsx   Ecrã de entrada (Supabase Auth)
  components/Trips.jsx   Página inicial: lista de viagens + criar nova
  components/Plano.jsx   Lista de dias com edição
  components/Mapa.jsx    Mapa Leaflet (marcadores, rotas, filtros)
  index.css             Tema e layout mobile (safe-area iPhone)
```

Cada viagem tem o seu endereço: `.../#<id>`. Dá para guardar nos favoritos ou
partilhar.
