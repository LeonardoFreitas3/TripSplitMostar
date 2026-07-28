import { useState } from 'react'
import { mapsUrl } from '../places.js'

// Extrai coordenadas de uma colagem: "43.5, 16.4", um link do Google Maps
// com @lat,lng, ou o formato !3dLAT!4dLNG. Devolve {lat,lng} ou null.
function parseCoords(text) {
  const candidates = [
    /@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/, // .../@43.50,16.44,15z
    /!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/, // ...!3d43.50!4d16.44
    /(-?\d{1,3}\.\d+)[ ,]+(-?\d{1,3}\.\d+)/, // 43.50, 16.44
  ]
  for (const re of candidates) {
    const m = text.match(re)
    if (m) {
      const lat = Number(m[1])
      const lng = Number(m[2])
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng }
    }
  }
  return null
}

export default function LocationPicker({ lat, lng, onPick, onClear }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | empty | error
  const hasCoords = typeof lat === 'number' && typeof lng === 'number'

  async function search() {
    const text = q.trim()
    if (!text) return

    // 1) Coordenadas ou link colado — resolve sem rede. As fotos não são
    // procuradas aqui: quem as vai buscar é o mapa, ao abrir o popup.
    const direct = parseCoords(text)
    if (direct) {
      onPick(direct)
      setResults([])
      setStatus('idle')
      setQ('')
      return
    }

    // 2) Pesquisa por nome no OpenStreetMap.
    setStatus('loading')
    setResults([])
    try {
      // extratags=1 traz o id do Wikidata já nesta resposta, o que poupa um
      // pedido ao Nominatim quando se escolhe um resultado.
      const url =
        'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&extratags=1&q=' +
        encodeURIComponent(text)
      const res = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error('http')
      const data = await res.json()
      if (!data.length) {
        setStatus('empty')
        return
      }
      setResults(data)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  function choose(r) {
    const escolhido = (r.name && r.name.trim()) || r.display_name.split(',')[0].trim()
    const la = Number(r.lat)
    const ln = Number(r.lon)
    onPick({ lat: la, lng: ln, name: escolhido })
    setResults([])
    setStatus('idle')
    setQ('')
  }

  return (
    <div className="locpick">
      <span className="field-label">Localização no mapa</span>

      {hasCoords && (
        <div className="loc-current">
          <span className="loc-pin" aria-hidden="true">📍</span>
          <span className="loc-coords">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
          <a className="loc-maps" href={mapsUrl(lat, lng)} target="_blank" rel="noopener noreferrer">
            Google Maps ↗
          </a>
          <button type="button" className="loc-clear" onClick={onClear}>
            remover
          </button>
        </div>
      )}

      <div className="loc-search">
        <input
          value={q}
          placeholder="Procurar local, ou colar link/coordenadas"
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              search()
            }
          }}
        />
        <button type="button" className="loc-go" onClick={search} disabled={status === 'loading'}>
          {status === 'loading' ? '…' : 'Procurar'}
        </button>
      </div>

      {status === 'empty' && <p className="hint">Sem resultados. Tenta outro nome.</p>}
      {status === 'error' && (
        <p className="hint">Sem ligação ou limite atingido. Tenta de novo, ou cola as coordenadas.</p>
      )}

      {results.length > 0 && (
        <ul className="loc-results">
          {results.map((r) => (
            <li key={r.place_id}>
              <button type="button" onClick={() => choose(r)}>
                <span className="loc-name">
                  {(r.name && r.name.trim()) || r.display_name.split(',')[0]}
                </span>
                <span className="loc-addr">{r.display_name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="hint">
        Dica: também podes colar coordenadas (43.5083, 16.4402) ou um link completo do Google Maps.
        Sem localização, a paragem não aparece no mapa.
      </p>
    </div>
  )
}
