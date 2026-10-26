# CLAUDE.md

> Ficheiro de contexto do projeto. Lido no início de cada sessão de trabalho com o Claude.
> Atualizado no fim de cada sessão. Nunca colocar aqui passwords, tokens, chaves de API ou connection strings reais.

---

## 1. Visão geral

- **Nome:** Viagens (repo `TripSplitMostar`, package `itinerario-split-mostar`)
- **O que é:** App web pessoal de itinerários de viagem. Mostra o plano dia-a-dia
  e um mapa com marcadores e rotas por dia, tudo editável (dias, paragens, horas,
  duração, notas, coordenadas, hotéis), guardado no Supabase. Nasceu para uma
  viagem Split–Mostar e passou a multi-viagem. Pensada sobretudo para telemóvel
  (iPhone, adicionada ao ecrã principal), mas com layout de duas colunas no PC.
- **Estado:** Em produção e em uso. Funcional e estável; evolui por pedidos pontuais.
- **URL produção:** `https://leonardofreitas3.github.io/TripSplitMostar/`
  (GitHub Pages; confirmar em Settings → Pages se o endereço mudou)
- **URL staging/teste:** Não existe. O teste é local (`npm run dev`, http://localhost:5173).
- **Repo:** https://github.com/LeonardoFreitas3/TripSplitMostar — branch único `main`.

**Idioma:** todo o projeto é em português de Portugal — UI, comentários de código,
mensagens de commit, nomes de variáveis em zonas de domínio (`dias`, `paragem`,
`sessao`, `erro`, `fila`). Manter assim. Os commits são curtos, em frase, no
infinitivo/imperativo, e **sem acentos** (ex.: `Setas para percorrer as fotos no PC`).

## 2. Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | React (JSX, sem TypeScript) | ^18.3.1 |
| Build / dev server | Vite + @vitejs/plugin-react | ^5.4.10 / ^4.3.4 |
| Mapa | Leaflet (API imperativa, sem react-leaflet) | ^1.9.4 |
| Tiles do mapa | CARTO Voyager raster (`basemaps.cartocdn.com`) | — |
| Backend | Nenhum servidor próprio. Supabase direto do browser | — |
| Base de dados | Supabase (Postgres), tabela única `trips` com coluna `jsonb` | — |
| Autenticação | Supabase Auth, email + password | @supabase/supabase-js ^2.110.8 |
| Alojamento / deploy | GitHub Pages via GitHub Actions | — |
| Armazenamento de ficheiros | Nenhum. Backup é export/import de `.json` pelo browser | — |
| Serviços externos / APIs | Google Places API (New) para fotos; Nominatim (OpenStreetMap) para pesquisa de locais; Wikidata + Wikimedia Commons como alternativa sem chave; Google Fonts (Inter) | — |

Não há TypeScript, nem ESLint/Prettier, nem framework de testes, nem router
(a navegação é pelo `hash`), nem gestor de estado (tudo `useState` no `App.jsx`).
**Não introduzir nada disto sem o pedirem.**

## 3. Estrutura do repositório

```
/
├── .claude/launch.json          Config do dev server para o Claude Code (npm run dev, porta 5173)
├── .github/workflows/deploy.yml Build + publish no GitHub Pages a cada push para main
├── .env.example                 Nomes das variáveis de ambiente (valores de exemplo)
├── .gitignore                   node_modules, dist, .env, .DS_Store, *.local
├── CLAUDE.md                    Este ficheiro
├── README.md                    Documentação para humanos: setup, SQL do Supabase, custos das APIs
├── index.html                   Entrada do Vite; metas de PWA/iPhone, fonte Inter, título "Viagens"
├── package.json                 Scripts: dev / build / preview
├── vite.config.js               plugin react + base: './' (caminhos relativos, para o Pages)
└── src/
    ├── main.jsx                 Monta o React, importa o CSS do Leaflet e o index.css
    ├── App.jsx                  (283 l.) Sessão, rota no hash, estado da viagem, auto-save, menu ⋯
    ├── data.js                  (12 l.) DAY_COLORS: 7 pastéis dessaturados, um por dia
    ├── supabase.js              (6 l.) Cliente Supabase, ou `null` se faltarem as env vars
    ├── storage.js               (84 l.) CRUD das viagens no Supabase + export/import JSON + uid()
    ├── places.js                (132 l.) Fotos das paragens (Google Places ou Wikidata) + mapsUrl()
    ├── index.css                (827 l.) Tema, layout mobile-first, safe-area iPhone, 2 colunas no PC
    └── components/
        ├── Login.jsx            (59 l.) Ecrã de entrada (email + password)
        ├── Trips.jsx            (79 l.) Página inicial: lista de viagens, criar, apagar
        ├── Plano.jsx            (246 l.) Lista de dias e paragens, com edição inline
        ├── Mapa.jsx             (218 l.) Mapa Leaflet: pins, rotas tracejadas, chips de filtro, popups
        └── LocationPicker.jsx   (154 l.) Procurar local / colar coordenadas ou link do Google Maps
```

**Fluxo de dados:** `App.jsx` é o dono de tudo. Carrega a viagem com
`loadData(id)`, guarda o objeto inteiro em `data`, e passa callbacks
(`onUpdateDay`, `onAddStop`, `onMoveStop`, …) ao `Plano` e ao `Mapa`. Qualquer
alteração reescreve `data` por imutabilidade e dispara o auto-save. Os
componentes não falam com o Supabase — só o `storage.js` fala.

## 4. Como correr localmente

```bash
# instalar dependências
npm install

# variáveis de ambiente necessárias (copiar .env.example para .env)
#   VITE_SUPABASE_URL        obrigatória  — Project URL do Supabase (Settings → API)
#   VITE_SUPABASE_ANON_KEY   obrigatória  — anon/publishable key do Supabase
#   VITE_GOOGLE_PLACES_KEY   opcional     — chave da Google Places API (New); sem ela usa Wikidata

# correr
npm run dev          # http://localhost:5173

# build de produção e pré-visualização
npm run build
npm run preview

# testes
# Não existem. Não há test runner instalado.
```

Sem `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` a app arranca mas mostra
"Supabase não configurado (falta o .env)" — é deliberado, não finge que guardou.

### SQL da base de dados (uma vez, no SQL Editor do Supabase)

```sql
create table trips (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);

alter table trips enable row level security;

create policy "so autenticados" on trips for all
  to authenticated using (true) with check (true);
```

### Contas de acesso

No painel do Supabase: **Authentication → Users → Add user** (com *Auto Confirm
User* ligado) e **Authentication → Sign In / Providers → Email** com **Allow new
users to sign up desligado** — sem isso qualquer pessoa cria conta e entra.
Todos os utilizadores autenticados veem todas as viagens; não há dono por viagem.

## 5. Deploy

- **Como é feito:** CI/CD. Cada `push` para `main` dispara
  `.github/workflows/deploy.yml`, que faz build e publica no GitHub Pages.
  Também corre à mão por `workflow_dispatch`.
- **Pipeline:** `actions/checkout@v4` → `actions/setup-node@v4` (Node 20) →
  `npm install` → `npm run build` (com as três `VITE_*` injetadas a partir dos
  **Secrets** do repo) → `actions/upload-pages-artifact@v3` (pasta `dist`) →
  job `deploy` com `actions/deploy-pages@v4`.
- **Cuidados:**
  - As variáveis têm de existir em **Settings → Secrets and variables → Actions**
    com exatamente os mesmos nomes do `.env`. Sem elas o build passa mas a app
    publicada não arranca.
  - As `VITE_*` entram no bundle público. A anon key do Supabase é para ser
    pública (quem protege são as policies). **A chave do Google Places não** —
    tem de ser restringida por website no Google Cloud Console.
  - Não há migrações de base de dados: o schema é uma tabela só e o resto é JSON.
    Mudar o formato do JSON **não** migra as viagens já gravadas — ver secção 12.
  - `base: './'` no `vite.config.js` é o que faz funcionar na subpasta do Pages.
    Não mudar para `/`.

## 6. Modelo de dados

A base de dados tem **uma tabela**. Tudo o que é itinerário vive dentro do `jsonb`.

| Entidade | Campos principais | Relações |
|---|---|---|
| `trips` (tabela Postgres) | `id text primary key`, `data jsonb not null`, `updated_at timestamptz` | Uma linha por viagem. O `id` é gerado por `uid()` em `storage.js` (`'x'` + 7 caracteres base36) e é também o fragmento do URL (`#<id>`) |
| `data.meta` | `title`, `subtitle`, `start`, `end` (strings; datas em `YYYY-MM-DD`) | Cabeçalho da viagem |
| `data.days[]` | `id`, `date` (`YYYY-MM-DD`), `weekday` (nome em PT), `title`, `base`, `narrative`, `hotel`, `stops[]` | Ordem do array = ordem dos dias. O número do dia e a cor vêm do índice |
| `data.days[].hotel` | `{ name, lat?, lng? }` ou `null` | Só aparece no mapa se tiver `lat`/`lng`. Hotéis repetidos em dias seguidos são desenhados uma vez só (chave `name + lat`) |
| `data.days[].stops[]` | `id`, `name`, `time` (`HH:MM` ou vazio), `durationMin` (número ou `null`), `notes`, `lat`, `lng` (números ou `null`), `photos` (array de referências ou `null`) | Ordem do array = ordem no dia e ordem da rota tracejada no mapa |

Forma completa de uma viagem:

```jsonc
{
  "meta": { "title": "Split & Mostar", "subtitle": "9 dias", "start": "2026-07-01", "end": "2026-07-09" },
  "days": [
    {
      "id": "xab12cd",
      "date": "2026-07-01",
      "weekday": "Quarta",
      "title": "Chegada a Split",
      "base": "split",              // 'split' | 'mostar' | 'travel' | texto livre
      "narrative": "Notas do dia.",
      "hotel": { "name": "Hotel X", "lat": 43.5, "lng": 16.44 },
      "stops": [
        {
          "id": "xef34gh",
          "name": "Palácio de Diocleciano",
          "time": "10:00",
          "durationMin": 90,
          "notes": "Entrada pelo Peristilo.",
          "lat": 43.5081,
          "lng": 16.4402,
          "photos": ["places/ChIJ.../photos/Aap_..."]   // ou ["Ficheiro.jpg"] do Commons, ou [] ou null
        }
      ]
    }
  ]
}
```

Notas importantes sobre o JSON:

- **`valid(d)` em `storage.js`** é a única validação: exige `d.meta` e
  `Array.isArray(d.days)`. Linhas inválidas são ignoradas na lista e o `loadData`
  rejeita com "Viagem não encontrada.". Isto existe porque a tabela é escrita com
  uma chave pública — não confiar cegamente no que lá está.
- **`photos: null`** significa "ainda não se procurou". **`photos: []`** significa
  "procurou-se e não há" — é o que impede perguntar outra vez. Mudar as
  coordenadas de uma paragem põe `photos: null` de propósito (as fotos eram do
  sítio antigo).
- As referências de foto do Google começam por `places/`; as outras são nomes de
  ficheiro do Wikimedia Commons. `photoSrc()` distingue pelo prefixo. Guarda-se a
  **referência** e não o URL, porque o URL do Google leva a chave lá dentro.
- `base` só tem rótulos bonitos para `split`/`mostar`/`travel` (`BASE_LABEL`, em
  `Plano.jsx` e `Mapa.jsx`); qualquer outro valor é mostrado tal e qual.

## 7. Convenções e regras

- **Nomes:** componentes em PascalCase, um ficheiro por componente
  (`src/components/Nome.jsx`); módulos de lógica em minúsculas (`storage.js`,
  `places.js`, `data.js`). Dentro do código, domínio em português.
- **Organização do código:** `App.jsx` tem o estado e as operações; os
  componentes recebem `data` + callbacks e não guardam o que é da viagem (só UI
  local: que paragem está aberta, que dia está a ser editado, filtro do mapa).
  O acesso à rede está isolado: Supabase só em `storage.js`/`supabase.js`,
  APIs de fotos e geocoding só em `places.js` e `LocationPicker.jsx`.
- **Estilo / UI:**
  - CSS único em `src/index.css`, com variáveis em `:root`. Sem Tailwind,
    sem CSS-in-JS, sem biblioteca de componentes.
  - Paleta neutra quente: `--bg #faf9f7`, `--surface #ffffff`, `--ink #1c1b19`,
    `--muted #767068` (4.9:1 sobre branco — **não clarear mais, falha o AA**),
    `--accent #4f6472`, `--danger #a8503f`.
  - A cor entra só pelos dias: `DAY_COLORS` em `data.js`, 7 pastéis
    dessaturados com luminosidade parecida, escuros q.b. para texto preto por
    cima. Viagens com mais de 7 dias voltam ao início da lista.
  - **Preferência explícita do utilizador: pastéis dessaturados e tipografia
    leve. Saturado e pesado é descrito como "infantil" e é rejeitado.**
  - Tipografia Inter (Google Fonts), pesos 400/450/500/600.
  - Mobile-first, largura máxima 560px; a partir de 1000px passa a duas colunas
    (plano à esquerda com `clamp(340px, 30%, 440px)`, mapa a ocupar o resto).
  - Um só anel de foco (`:focus-visible` com `--accent`), e
    `prefers-reduced-motion` desliga todas as transições.
  - Respeitar a safe-area do iPhone (`env(safe-area-inset-*)`), já tratada no
    cabeçalho e no conteúdo.
- **Regras a respeitar sempre:**
  - Escrever UI, comentários e commits em português de Portugal; commits sem acentos.
  - Comentários explicam **porquê**, não o quê, e nunca registam o histórico da
    alteração ("antes era assim", "corrigido em…"). O código existente segue
    isto à risca — manter.
  - Escapar sempre o que vai para HTML de popups do Leaflet (`escapeHtml` em
    `Mapa.jsx`). Os popups são strings de HTML, não JSX.
  - Guardar referências de fotos, nunca URLs com chave lá dentro.
  - Qualquer pedido novo ao Nominatim passa pela fila de 1.1 s (`emFila` em
    `places.js`) — o serviço público corta a 1 pedido/segundo.
  - Ao mexer no `Mapa.jsx`, respeitar o `desenho` (`useMemo` com a assinatura só
    do que é desenhado). Sem ele, guardar fotos muda `data`, o efeito volta a
    correr e o popup fecha-se no instante em que as fotos chegam.
  - Mudanças de formato do JSON têm de aguentar viagens antigas sem esse campo.
  - Soluções pequenas e diretas. A app é deliberadamente simples.
- **Coisas a NÃO fazer:**
  - Não acrescentar dependências para o que meia dúzia de linhas resolve.
  - Não introduzir TypeScript, router, Redux/Zustand, Tailwind ou react-leaflet.
  - Não mudar `base: './'` no `vite.config.js`.
  - Não pôr valores reais de `.env`, chaves ou emails no repo.
  - Não alargar a policy do Supabase para `anon` — a app ficaria aberta a toda a gente.
  - Não carregar as 10 fotos de uma paragem de uma vez: só a primeira é
    imediata, as outras são `loading="lazy"`. Cada foto vista é um pedido faturável.
  - Não procurar fotos pelo nome da paragem quando há coordenadas: os nomes são
    texto livre em português e o que interessa é o lugar onde o pin está.

## 8. Decisões tomadas

| Data | Decisão | Motivo |
|---|---|---|
| 2026-06-15 | React + Vite + Leaflet, sem backend próprio | App pessoal; GitHub Pages serve estático de graça |
| 2026-06-15 | `base: './'` no Vite | Funciona em qualquer subpasta do GitHub Pages sem configurar nada |
| 2026-07-27 | Persistência no Supabase em vez de `localStorage` | Para o itinerário ser o mesmo no telemóvel e no PC |
| 2026-07-27 | Uma tabela `trips` com `jsonb`, em vez de tabelas normalizadas | O itinerário é lido e gravado sempre inteiro; não há queries por paragem |
| 2026-07-27 | Multi-viagem com rota no `hash` (`#<id>`) | Cada viagem tem endereço próprio para favoritos/partilha, sem router nem servidor |
| 2026-07-27 | Plano e mapa lado a lado a partir de 1000px | No PC havia espaço desperdiçado; no telemóvel mantêm-se os separadores |
| 2026-07-27 | Chips de dia no mapa: carregar isola o dia, carregar outra vez volta a todos | Filtro sem menus nem estado complicado |
| 2026-07-27 | Layout neutro, cor só pelos dias | Preferência do utilizador: pastéis dessaturados, nada de saturado |
| 2026-07-28 | Auto-save com debounce de 700 ms | Agrupa edições seguidas numa só escrita; não há botão "Guardar" |
| 2026-07-28 | Fotos das paragens no popup do mapa | Dá contexto visual sem sair da app |
| 2026-07-28 | Google Places API (New), com Wikidata como alternativa sem chave | A Places API antiga não tem CORS; o Wikidata é grátis mas só acerta em sítios conhecidos (12 de 33 paragens no itinerário de exemplo) |
| 2026-07-28 | Login obrigatório + policy `to authenticated` | Sem isso, qualquer pessoa com o URL (ou com a anon key) lia e editava tudo |
| 2026-07-28 | Mensagem de erro igual para email e password errados | Não revelar se a conta existe |
| 2026-07-28 | Guardar as referências das fotos na paragem (`photos`), incluindo `[]` | Evita repetir a pesquisa — e o custo — sempre que se abre o popup |
| 2026-07-28 | Setas de navegação na galeria, além do arrastar | No PC não há gesto de arrastar confortável |
| 2026-07-28 | Ler `!3d…!4d…` antes de `@…` nos links do Google Maps | O `@` é o centro do mapa e pode estar dezenas de metros ao lado, trazendo as fotos do vizinho |
| 2026-10-26 | `package-lock.json` versionado | Builds reproduzíveis no CI |

## 9. Estado atual

Tudo o que está abaixo está feito, em `main`, e publicado.

- [x] Login por email/password (Supabase Auth), com sessão guardada no dispositivo
- [x] Lista de viagens: criar (`+ Nova viagem`), abrir, apagar com confirmação
- [x] Rota no hash: sem hash → lista; `#<id>` → viagem
- [x] Plano dia-a-dia com cartões, numeração, cor por dia, hotel e notas
- [x] Editar dia (título, notas, hotel) e apagar dia
- [x] Paragens: adicionar, editar (nome, hora, duração, notas, localização),
      reordenar com ↑/↓, apagar
- [x] `LocationPicker`: procurar no Nominatim, ou colar coordenadas / link
      completo do Google Maps (com aviso explícito para links curtos `goo.gl`)
- [x] Mapa Leaflet: pins numerados por dia, pin de hotel, rota tracejada pela
      ordem das paragens, `fitBounds` automático, chips para isolar um dia
- [x] Popup com nome, dia, base, hora, notas, galeria de até 10 fotos e link
      "Abrir no Google Maps"
- [x] Fotos via Google Places (New) por coordenadas, ou Wikidata sem chave,
      guardadas na paragem e invalidadas quando as coordenadas mudam
- [x] Auto-save com debounce + toast de erro quando a gravação falha
- [x] Exportar / importar `.json` pelo menu ⋯
- [x] Layout de duas colunas no PC; separadores Plano/Mapa no telemóvel
- [x] Safe-area do iPhone, `apple-mobile-web-app-capable`, tema claro
- [x] Deploy automático para GitHub Pages a cada push

## 10. Em curso

- **Tarefa:** Nada a meio. A árvore de trabalho está limpa e `main` está
  sincronizado com `origin/main`.
- **Ficheiros envolvidos:** —
- **Falta:** —

## 11. Próximos passos

Nenhum destes foi pedido — são as lacunas visíveis, por ordem de utilidade.
**Confirmar com o utilizador antes de avançar com qualquer um.**

1. Deixar de depender de `prompt()`/`confirm()` do browser para criar e apagar
   viagens (o `prompt()` é bloqueado em alguns contextos e destoa do resto da UI).
2. Edição das datas e do `meta` da viagem pela UI — hoje `title` e `subtitle` só
   se definem na criação, e `start`/`end` nunca se editam.
3. Dar coordenadas ao hotel pela UI: o modelo suporta `hotel.lat/lng` e o mapa
   desenha-o, mas o `Plano.jsx` só deixa escrever o nome.
4. Tornar os rótulos de `base` genéricos (hoje `split`/`mostar`/`travel` estão
   escritos no código, resquício da primeira viagem).

## 12. Problemas conhecidos / dívida técnica

| Problema | Onde | Prioridade |
|---|---|---|
| Última escrita ganha: o auto-save faz `upsert` do objeto inteiro. Dois dispositivos a editar a mesma viagem perdem alterações, sem aviso | `src/storage.js` (`saveData`), `src/App.jsx` | Alta |
| `hotel.lat`/`hotel.lng` só existem se forem postos à mão no JSON; a UI não os edita | `src/components/Plano.jsx` | Média |
| `base` com rótulos `split`/`mostar`/`travel` escritos no código | `Plano.jsx` e `Mapa.jsx` (`BASE_LABEL`) | Média |
| Sem testes nem linter. Qualquer alteração só se valida a correr a app | — | Média |
| Listener de `click` global registado no topo do módulo, nunca removido, para as setas da galeria | `src/components/Mapa.jsx` | Baixa |
| HTML dos popups montado com concatenação de strings; a segurança depende de não esquecer o `escapeHtml` | `src/components/Mapa.jsx` | Baixa |
| Referências de foto do Google guardadas podem expirar com o tempo; nada as revalida | `src/places.js`, campo `photos` | Baixa |
| Sem chave do Google, cada paragem nova espera na fila de 1.1 s do Nominatim — abrir vários pins seguidos é lento | `src/places.js` (`emFila`) | Baixa |
| Todos os utilizadores autenticados veem e editam todas as viagens; não há dono | Policy do Supabase | Baixa (é intencional, mas limita partilhar) |
| `prompt()`/`confirm()` nativos para criar e apagar | `src/components/Trips.jsx` | Baixa |
| Sem service worker: adicionada ao ecrã do iPhone, não funciona offline | — | Baixa |
| `package.json` ainda se chama `itinerario-split-mostar`, apesar de ser multi-viagem | `package.json` | Cosmética |

## 13. Registo de sessões

| Data | Resumo |
|---|---|
| 2026-10-26 | Verificado que `main` estava sincronizado com o GitHub; `package-lock.json` passou a ser versionado; criado este `CLAUDE.md`; corrigido o comentário do SQL no `README.md`, que dizia o contrário da policy |
| 2026-07-28 | Fotos por coordenadas em vez de centro do mapa; setas na galeria; fotos apagadas ao mudar de sítio; fotos guardadas na paragem; galeria de 10 fotos do Google; login obrigatório |
| 2026-07-27 | Layout neutro; apagar viagens; multi-viagem no Supabase; filtro de dia no mapa; plano e mapa lado a lado no PC |
| 2026-06-15 | Versão inicial: itinerário Split & Mostar estático com React + Vite + Leaflet |
