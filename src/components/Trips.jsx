import { useEffect, useState } from 'react'
import { listTrips, createTrip, deleteTrip } from '../storage.js'

export default function Trips() {
  const [trips, setTrips] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    listTrips().then(setTrips, (e) => setErro(e.message))
  }, [])

  async function nova() {
    const nome = prompt('Nome da nova viagem?')
    if (!nome?.trim()) return
    try {
      // Mudar o hash abre logo a viagem nova (ver App.jsx).
      location.hash = await createTrip(nome.trim())
    } catch (e) {
      setErro(e.message)
    }
  }

  async function apagar(t) {
    if (!confirm(`Apagar "${t.meta.title || 'Sem título'}" e todos os seus dias? Não dá para recuperar.`)) return
    try {
      await deleteTrip(t.id)
      setTrips((ts) => ts.filter((x) => x.id !== t.id))
    } catch (e) {
      setErro(e.message)
    }
  }

  if (erro) return <div className="estado">Erro: {erro}</div>
  if (!trips) return <div className="estado">A carregar…</div>

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <h1>As minhas viagens</h1>
            <span className="brand-sub">
              {trips.length} {trips.length === 1 ? 'viagem' : 'viagens'}
            </span>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="trips">
          {trips.map((t) => (
            <div key={t.id} className="trip-row">
              <a className="trip-card" href={'#' + t.id}>
                <span className="trip-title">{t.meta.title || 'Sem título'}</span>
                <span className="trip-meta">
                  {t.meta.subtitle ? t.meta.subtitle + ' · ' : ''}
                  {t.dias} {t.dias === 1 ? 'dia' : 'dias'}
                </span>
              </a>
              <button
                className="trip-del"
                onClick={() => apagar(t)}
                aria-label={`Apagar ${t.meta.title || 'viagem'}`}
              >
                ✕
              </button>
            </div>
          ))}
          {trips.length === 0 && <p className="footnote">Ainda não tens viagens.</p>}
          <button className="add-stop" onClick={nova}>+ Nova viagem</button>
        </div>
      </main>
    </div>
  )
}
