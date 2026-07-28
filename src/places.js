// Fotos das paragens sem chave nem faturação: OpenStreetMap → Wikidata →
// Wikimedia Commons.
//
// A pesquisa do Nominatim que já fazíamos traz, com extratags=1, o id do
// Wikidata do sítio. O Wikidata diz qual é a imagem oficial (propriedade
// P18), e o Commons serve-a pelo nome do ficheiro. Tudo público.

// O parâmetro origin=* é o que faz a API do Wikidata devolver os cabeçalhos
// de CORS. Sem ele o browser bloqueia o pedido.
const WIKIDATA = 'https://www.wikidata.org/w/api.php?origin=*&format=json&action=wbgetentities&props=claims&ids='

// Nome do ficheiro da imagem de um id do Wikidata (ou null se não tiver).
export async function photoForWikidata(id) {
  if (!id) return null
  const res = await fetch(WIKIDATA + encodeURIComponent(id))
  if (!res.ok) throw new Error(`Wikidata respondeu ${res.status}`)
  const data = await res.json()
  return data.entities?.[id]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value || null
}

// O Nominatim público aceita no máximo 1 pedido por segundo — abrir vários
// pontos do mapa seguidos passava disso e apanhava 429. Fila simples.
let fila = Promise.resolve()
function emFila(fn) {
  const r = fila.then(fn)
  fila = r.catch(() => {}).then(() => new Promise((ok) => setTimeout(ok, 1100)))
  return r
}

// Os nomes das paragens são texto livre — "Salona (Solin) - ruínas romanas",
// "Krka - entrada Lozovac". Fica só o primeiro pedaço, que costuma ser o nome
// do sítio; o resto é anotação e só atrapalha a pesquisa.
function nomeDoSitio(n) {
  return (n || '').split(/[-–—+(,/:;]|→/)[0].trim()
}

// O OpenStreetMap tem os nomes em croata/bósnio. Um descritor português à
// frente ("Fortaleza de Klis" vs "Tvrđava Klis") impede sempre o match, por
// isso tenta-se também sem ele. Lista curta e fechada, só de tipos de sítio.
const TIPO_PT =
  /^(fortaleza|castelo|catedral|igreja|mosteiro|convento|museu|pal[áa]cio|praia|cascatas?|parque|ilha|ponte|necr[óo]pole|jardim|mercado|miradouro|ru[íi]nas|torre|forte|lago|rio|monte)$/i
const LIGACAO_PT = /^(a|o|as|os|de|da|do|das|dos|em|no|na)$/i

function semDescritor(q) {
  const p = q.split(/\s+/)
  let i = 0
  while (i < p.length && (TIPO_PT.test(p[i]) || LIGACAO_PT.test(p[i]))) i++
  return i > 0 && i < p.length ? p.slice(i).join(' ') : ''
}

async function idWikidata(q, lat, lng) {
  // limit=5 e não 1: o primeiro resultado é muitas vezes um café ou uma rua
  // com o mesmo nome, e o que interessa é o primeiro que tenha Wikidata.
  let url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&extratags=1&q=' +
    encodeURIComponent(q)
  // Com coordenadas, limita a procura à zona da paragem: impede que "Krka"
  // ou "Salona" venham parar a outro país.
  if (typeof lat === 'number' && typeof lng === 'number') {
    url += `&bounded=1&viewbox=${lng - 0.4},${lat + 0.4},${lng + 0.4},${lat - 0.4}`
  }
  const data = await emFila(async () => {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Nominatim respondeu ${res.status}`)
    return res.json()
  })
  return data.find((d) => d.extratags?.wikidata)?.extratags.wikidata || null
}

// Para paragens que já têm localização mas nunca passaram pela pesquisa.
export async function findPhoto(name, lat, lng) {
  const q = nomeDoSitio(name)
  if (!q) return null
  const curto = semDescritor(q)
  for (const tentativa of curto && curto !== q ? [q, curto] : [q]) {
    const id = await idWikidata(tentativa, lat, lng)
    if (id) return photoForWikidata(id)
  }
  return null
}

export function photoUrl(file, px = 400) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${px}`
}

// Link para o Google Maps. Não precisa de chave nenhuma.
export function mapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
