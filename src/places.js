// Google Places API (New) — a versão antiga não serve, não tem CORS e as
// chamadas do browser são bloqueadas.
//
// A chave fica no bundle, como todas as VITE_*. Restringe-a na consola do
// Google Cloud (referrer HTTP + só a Places API), senão qualquer pessoa que
// abra o site a pode usar à tua custa.
const KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY

export const hasPlaces = !!KEY

// Procura o sítio pelo nome, enviesado para as coordenadas da paragem, e
// devolve o nome do recurso da primeira foto (ou null se não houver).
export async function findPhoto(name, lat, lng) {
  if (!KEY || !name?.trim()) return null
  const body = { textQuery: name.trim(), maxResultCount: 1 }
  if (typeof lat === 'number' && typeof lng === 'number') {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 500 } }
  }
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.photos',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Places respondeu ${res.status}`)
  const data = await res.json()
  return data.places?.[0]?.photos?.[0]?.name || null
}

// O endpoint devolve um redirect para a imagem, por isso serve num <img src>.
export function photoUrl(photo, px = 400) {
  return `https://places.googleapis.com/v1/${photo}/media?maxHeightPx=${px}&key=${KEY}`
}

// Link para o Google Maps. Não precisa de chave nenhuma.
export function mapsUrl(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
