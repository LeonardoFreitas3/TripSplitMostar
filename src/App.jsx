import { useEffect, useRef, useState } from 'react'
import { DAY_COLORS } from './data.js'
import { loadData, saveData, exportData, importData, uid } from './storage.js'
import Plano from './components/Plano.jsx'
import Mapa from './components/Mapa.jsx'
import Trips from './components/Trips.jsx'
import Login from './components/Login.jsx'
import { supabase } from './supabase.js'

// Rota no hash: sem hash é a lista de viagens, #<id> abre essa viagem.
export default function App() {
  const [tripId, setTripId] = useState(() => location.hash.slice(1))
  const [sessao, setSessao] = useState() // undefined = ainda não se sabe

  useEffect(() => {
    const on = () => setTripId(location.hash.slice(1))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => data.subscription.unsubscribe()
  }, [])

  if (!supabase) {
    return <div className="estado">Supabase não configurado (falta o .env).</div>
  }
  // O ecrã de login é só a porta: quem protege os dados são as policies da
  // base de dados, que exigem sessão autenticada.
  if (sessao === undefined) return <div className="estado">A carregar…</div>
  if (!sessao) return <Login />

  return tripId ? <Trip key={tripId} id={tripId} /> : <Trips />
}

function Trip({ id }) {
  const [data, setData] = useState(null)
  const [erro, setErro] = useState(null)
  const [view, setView] = useState('plano') // 'plano' | 'mapa' (só quando estreito)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)
  const wide = useWide()

  useEffect(() => {
    loadData(id).then(setData, (e) => setErro(e.message))
  }, [id])

  // Guarda automaticamente, agrupando edições seguidas numa só escrita.
  useEffect(() => {
    if (!data) return
    const t = setTimeout(() => {
      saveData(id, data).catch((e) => showToast('Não foi possível guardar: ' + e.message))
    }, 700)
    return () => clearTimeout(t)
  }, [id, data])

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

  function addDay() {
    setData((d) => {
      const date = nextDate(d.days[d.days.length - 1]?.date || d.meta.start)
      return {
        ...d,
        days: [
          ...d.days,
          {
            id: uid(),
            date,
            weekday: WEEKDAYS[new Date(date + 'T12:00').getDay()],
            title: 'Novo dia',
            base: '',
            narrative: '',
            hotel: null,
            stops: [],
          },
        ],
      }
    })
  }

  function removeDay(dayId) {
    setData((d) => ({ ...d, days: d.days.filter((day) => day.id !== dayId) }))
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

  // ---- Menu (exportar / importar) ----
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

  if (erro) return <div className="estado">Erro a carregar: {erro} <a href="#">Voltar</a></div>
  if (!data) return <div className="estado">A carregar…</div>

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-row">
          <a className="icon-btn back" href="#" aria-label="Voltar às viagens">‹</a>
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

        {!wide && (
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
        )}

        {menuOpen && (
          <>
            <div className="menu-scrim" onClick={() => setMenuOpen(false)} />
            <div className="menu" role="menu">
              <button role="menuitem" onClick={handleExport}>Exportar (.json)</button>
              <button role="menuitem" onClick={handleImportClick}>Importar (.json)</button>
              <button role="menuitem" onClick={() => supabase.auth.signOut()}>Terminar sessão</button>
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
        {(wide || view === 'plano') && (
          <Plano
            data={data}
            colors={DAY_COLORS}
            onUpdateDay={updateDay}
            onAddDay={addDay}
            onRemoveDay={removeDay}
            onUpdateStop={updateStop}
            onAddStop={addStop}
            onRemoveStop={removeStop}
            onMoveStop={moveStop}
          />
        )}
        {(wide || view === 'mapa') && (
          <Mapa
            data={data}
            colors={DAY_COLORS}
            onPhotos={(dayId, stopId, photos) => updateStop(dayId, stopId, { photos })}
          />
        )}
      </main>

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Dia seguinte ao último (ou hoje, se a viagem ainda não tem datas).
function nextDate(prev) {
  const d = prev ? new Date(prev + 'T12:00') : new Date()
  if (prev) d.setDate(d.getDate() + 1)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${String(d.getDate()).padStart(2, '0')}`
}

// No PC mostra plano e mapa lado a lado; no telemóvel mantém os separadores.
function useWide() {
  const mq = () => window.matchMedia('(min-width: 1000px)')
  const [wide, setWide] = useState(() => mq().matches)
  useEffect(() => {
    const m = mq()
    const on = (e) => setWide(e.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return wide
}
