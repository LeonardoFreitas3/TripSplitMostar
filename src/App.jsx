import { useEffect, useRef, useState } from 'react'
import { DAY_COLORS } from './data.js'
import {
  loadData, saveData, resetData, exportData, importData, uid,
} from './storage.js'
import Plano from './components/Plano.jsx'
import Mapa from './components/Mapa.jsx'

export default function App() {
  const [data, setData] = useState(loadData)
  const [view, setView] = useState('plano') // 'plano' | 'mapa'
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)

  // Guarda automaticamente sempre que algo muda.
  useEffect(() => {
    saveData(data)
  }, [data])

  function showToast(msg) {
    setToast(msg)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(null), 2200)
  }

  // ---- Operações sobre os dados ----
  function updateDay(dayId, patch) {
    setData((d) => ({
      ...d,
      days: d.days.map((day) => (day.id === dayId ? { ...day, ...patch } : day)),
    }))
  }

  function updateStop(dayId, stopId, patch) {
    setData((d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId
          ? day
          : { ...day, stops: day.stops.map((s) => (s.id === stopId ? { ...s, ...patch } : s)) }
      ),
    }))
  }

  function addStop(dayId) {
    const novo = { id: uid(), name: 'Nova paragem', time: '', durationMin: 60, notes: '', lat: null, lng: null }
    setData((d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id === dayId ? { ...day, stops: [...day.stops, novo] } : day
      ),
    }))
    return novo.id
  }

  function removeStop(dayId, stopId) {
    setData((d) => ({
      ...d,
      days: d.days.map((day) =>
        day.id !== dayId ? day : { ...day, stops: day.stops.filter((s) => s.id !== stopId) }
      ),
    }))
  }

  function moveStop(dayId, stopId, dir) {
    setData((d) => ({
      ...d,
      days: d.days.map((day) => {
        if (day.id !== dayId) return day
        const i = day.stops.findIndex((s) => s.id === stopId)
        const j = i + dir
        if (i < 0 || j < 0 || j >= day.stops.length) return day
        const stops = [...day.stops]
        ;[stops[i], stops[j]] = [stops[j], stops[i]]
        return { ...day, stops }
      }),
    }))
  }

  // ---- Menu (exportar / importar / repor) ----
  function handleExport() {
    exportData(data)
    setMenuOpen(false)
    showToast('Itinerário exportado')
  }

  function handleImportClick() {
    fileRef.current?.click()
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const imported = await importData(file)
      setData(imported)
      setMenuOpen(false)
      showToast('Itinerário importado')
    } catch (err) {
      showToast(err.message)
    }
  }

  function handleReset() {
    if (confirm('Repor o itinerário original? As tuas alterações serão perdidas.')) {
      setData(resetData())
      setMenuOpen(false)
      showToast('Itinerário reposto')
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <h1>{data.meta.title}</h1>
            <span className="brand-sub">{data.meta.subtitle}</span>
          </div>
          <button
            className="icon-btn"
            aria-label="Mais opções"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="dots">⋯</span>
          </button>
        </div>

        <div className="segmented" role="tablist" aria-label="Vista">
          <button
            role="tab"
            aria-selected={view === 'plano'}
            className={view === 'plano' ? 'seg active' : 'seg'}
            onClick={() => setView('plano')}
          >
            Plano
          </button>
          <button
            role="tab"
            aria-selected={view === 'mapa'}
            className={view === 'mapa' ? 'seg active' : 'seg'}
            onClick={() => setView('mapa')}
          >
            Mapa
          </button>
        </div>

        {menuOpen && (
          <>
            <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
            <div className="menu" role="menu">
              <button role="menuitem" onClick={handleExport}>Exportar (.json)</button>
              <button role="menuitem" onClick={handleImportClick}>Importar (.json)</button>
              <button role="menuitem" className="danger" onClick={handleReset}>Repor original</button>
            </div>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          hidden
        />
      </header>

      <main className="content">
        {view === 'plano' ? (
          <Plano
            data={data}
            colors={DAY_COLORS}
            onUpdateDay={updateDay}
            onUpdateStop={updateStop}
            onAddStop={addStop}
            onRemoveStop={removeStop}
            onMoveStop={moveStop}
          />
        ) : (
          <Mapa data={data} colors={DAY_COLORS} />
        )}
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}
