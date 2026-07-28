import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { findPhotos, mapsUrl } from '../places.js'

// Nada é guardado na viagem: as fotos procuram-se ao abrir o popup e ficam
// aqui até se recarregar a página. Assim uma paragem nova mostra fotos sem
// ter de se lhe tocar, e uma paragem que muda de sítio muda de fotos.
const fotos = new Map() // "nome|lat" -> array de URLs

// Só a primeira imagem carrega de imediato; as outras esperam que se lá
// chegue a arrastar. Cada imagem vista é um pedido faturável ao Google.
function galeria(urls) {
  if (!urls.length) return ''
  const imgs = urls
    .map((u, i) => `<img src="${escapeHtml(u)}" alt=""${i ? ' loading="lazy"' : ''}>`)
    .join('')
  return `<div class="pop-galeria">${imgs}</div>`
}

// O conteúdo é montado aqui porque o popup tem de ser reconstruído quando as
// fotos chegam: mexer no DOM à mão não serve, o Leaflet reescreve o popup a
// partir do conteúdo que guardou.
function popupHtml(stop, dayNum, base, urls) {
  return (
    `<strong>${escapeHtml(stop.name)}</strong>` +
    `<div class="pop-meta">Dia ${dayNum} · ${escapeHtml(BASE_LABEL[base] || base)}` +
    (stop.time ? ` · ${escapeHtml(stop.time)}` : '') +
    `</div>` +
    (stop.notes ? `<div class="pop-notes">${escapeHtml(stop.notes)}</div>` : '') +
    galeria(urls) +
    `<a class="pop-link" href="${escapeHtml(mapsUrl(stop.lat, stop.lng))}" target="_blank" rel="noopener noreferrer">Abrir no Google Maps ↗</a>`
  )
}

async function encherFotos(stop, dayNum, base, popup) {
  const chave = `${stop.name}|${stop.lat}`
  let urls = fotos.get(chave)
  if (urls === undefined) {
    try {
      urls = await findPhotos(stop.name, stop.lat, stop.lng)
    } catch {
      return // Falha de rede não é "não tem fotos": não guarda, tenta na próxima.
    }
    fotos.set(chave, urls)
  }
  if (urls.length) popup.setContent(popupHtml(stop, dayNum, base, urls))
}

const BASE_LABEL = { split: 'Split', mostar: 'Mostar', travel: 'Viagem' }

export default function Mapa({ data, colors }) {
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)
  // null = todos os dias. Carregar num dia isola-o; carregar outra vez volta a todos.
  const [only, setOnly] = useState(null)

  const dayColor = useMemo(() => {
    const m = {}
    data.days.forEach((d, i) => (m[d.id] = colors[i % colors.length]))
    return m
  }, [data.days, colors])

  // Inicializa o mapa uma única vez.
  useEffect(() => {
    if (mapRef.current || !mapEl.current) return
    const map = L.map(mapEl.current, { zoomControl: true, attributionControl: true })
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }
    ).addTo(map)
    map.setView([43.4, 16.9], 8)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    // Corrige o tamanho caso o contentor ainda estivesse a renderizar.
    setTimeout(() => map.invalidateSize(), 60)
    const onResize = () => map.invalidateSize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Redesenha marcadores e rotas quando muda algo.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer) return
    layer.clearLayers()

    const allPts = []
    const hotelsSeen = new Set()

    data.days.forEach((day) => {
      if (only && day.id !== only) return
      const color = dayColor[day.id]
      const dayNum = data.days.indexOf(day) + 1
      const pts = []

      day.stops.forEach((stop) => {
        if (typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return
        const latlng = [stop.lat, stop.lng]
        pts.push(latlng)
        allPts.push(latlng)
        const marker = L.marker(latlng, { icon: stopIcon(color, dayNum) })
          .bindPopup(popupHtml(stop, dayNum, day.base, fotos.get(`${stop.name}|${stop.lat}`) || []))
          .addTo(layer)
        marker.on('popupopen', (e) => encherFotos(stop, dayNum, day.base, e.popup))
      })

      // Rota tracejada ligando as paragens do dia, pela ordem.
      if (pts.length > 1) {
        L.polyline(pts, { color, weight: 3, opacity: 0.7, dashArray: '6 7' }).addTo(layer)
      }

      // Hotel (sem duplicar).
      if (day.hotel && typeof day.hotel.lat === 'number' && typeof day.hotel.lng === 'number') {
        const key = day.hotel.name + day.hotel.lat
        if (!hotelsSeen.has(key)) {
          hotelsSeen.add(key)
          const ll = [day.hotel.lat, day.hotel.lng]
          allPts.push(ll)
          L.marker(ll, { icon: hotelIcon() })
            .bindPopup(`<strong>${escapeHtml(day.hotel.name)}</strong><div class="pop-meta">Alojamento</div>`)
            .addTo(layer)
        }
      }
    })

    if (allPts.length === 1) {
      map.setView(allPts[0], 13)
    } else if (allPts.length > 1) {
      map.fitBounds(L.latLngBounds(allPts), { padding: [40, 40] })
    }
  }, [data, only, dayColor])

  return (
    <div className="mapa">
      <div className="chips" role="group" aria-label="Filtrar dias">
        {data.days.map((day, i) => (
          <button
            key={day.id}
            className={!only || only === day.id ? 'chip on' : 'chip'}
            style={{ '--chip-color': colors[i % colors.length] }}
            onClick={() => setOnly((o) => (o === day.id ? null : day.id))}
            aria-pressed={only === day.id}
          >
            <span className="chip-dot" />
            D{i + 1}
          </button>
        ))}
      </div>
      <div ref={mapEl} className="map-canvas" />
    </div>
  )
}

function stopIcon(color, num) {
  return L.divIcon({
    className: 'pin-wrap',
    html: `<span class="pin" style="background:${color}">${num}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

function hotelIcon() {
  return L.divIcon({
    className: 'pin-wrap',
    html: `<span class="pin hotel-pin">⌂</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -15],
  })
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
