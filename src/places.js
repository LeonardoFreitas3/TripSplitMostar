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

// Para paragens que já têm localização mas nunca passaram pela pesquisa:
// procura o sítio pelo nome e segue o mesmo caminho.
export async function findPhoto(name) {
  if (!name?.trim()) return null
  const url =
    'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&extratags=1&q=' +
    encodeURIComponent(name.trim())
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`Nominatim respondeu ${res.status}`)
  const data = await res.json()
  return photoForWikidata(data[0]?.extratags?.wikidata)
}

export function photoUrl(file, px = 400) {
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${px}`
}

// Link para o Google Maps. Não precisa de chave nenhuma.
export function mapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
