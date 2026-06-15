import { useState } from 'react'
import LocationPicker from './LocationPicker.jsx'

const BASE_LABEL = { split: 'Split', mostar: 'Mostar', travel: 'Viagem' }

export default function Plano({
  data, colors, onUpdateDay, onUpdateStop, onAddStop, onRemoveStop, onMoveStop,
}) {
  return (
    <div className="plano">
      {data.days.map((day, i) => (
        <DayCard
          key={day.id}
          day={day}
          index={i}
          color={colors[i % colors.length]}
          onUpdateDay={onUpdateDay}
          onUpdateStop={onUpdateStop}
          onAddStop={onAddStop}
          onRemoveStop={onRemoveStop}
          onMoveStop={onMoveStop}
        />
      ))}
      <p className="footnote">
        As alterações são guardadas automaticamente neste telemóvel. Usa o menu (⋯) para exportar um backup.
      </p>
    </div>
  )
}

function DayCard({ day, index, color, onUpdateDay, onUpdateStop, onAddStop, onRemoveStop, onMoveStop }) {
  const [editingDay, setEditingDay] = useState(false)
  const [openStop, setOpenStop] = useState(null)
  const dateShort = formatDate(day.date)

  return (
    <section className="day" style={{ '--day-color': color }}>
      <div className="day-spine" aria-hidden="true">
        <span className="day-node">{index + 1}</span>
      </div>

      <div className="day-body">
        <div className="day-head">
          <div className="day-when">
            <span className="day-weekday">{day.weekday}</span>
            <span className="day-date">{dateShort}</span>
            <span className="day-base">{BASE_LABEL[day.base] || day.base}</span>
          </div>
          <button
            className="link-btn"
            onClick={() => setEditingDay((v) => !v)}
            aria-pressed={editingDay}
          >
            {editingDay ? 'Concluir' : 'Editar'}
          </button>
        </div>

        {editingDay ? (
          <div className="day-edit">
            <label className="field">
              <span>Título do dia</span>
              <input
                value={day.title}
                onChange={(e) => onUpdateDay(day.id, { title: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Notas do dia</span>
              <textarea
                rows={3}
                value={day.narrative}
                onChange={(e) => onUpdateDay(day.id, { narrative: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Hotel</span>
              <input
                value={day.hotel?.name || ''}
                placeholder="Sem alojamento"
                onChange={(e) =>
                  onUpdateDay(day.id, {
                    hotel: e.target.value
                      ? { ...(day.hotel || {}), name: e.target.value }
                      : null,
                  })
                }
              />
            </label>
          </div>
        ) : (
          <>
            <h2 className="day-title">{day.title}</h2>
            {day.hotel?.name && (
              <div className="hotel">
                <span className="hotel-ico" aria-hidden="true">⌂</span>
                {day.hotel.name}
              </div>
            )}
            {day.narrative && <p className="day-note">{day.narrative}</p>}
          </>
        )}

        <ul className="stops">
          {day.stops.map((stop, si) => (
            <li key={stop.id} className="stop">
              <button
                className="stop-main"
                onClick={() => setOpenStop(openStop === stop.id ? null : stop.id)}
                aria-expanded={openStop === stop.id}
              >
                <span className="stop-time">{stop.time || '—'}</span>
                <span className="stop-text">
                  <span className="stop-name">{stop.name}</span>
                  {stop.durationMin ? (
                    <span className="stop-dur">{formatDuration(stop.durationMin)}</span>
                  ) : null}
                  {stop.notes && openStop !== stop.id && (
                    <span className="stop-notes-preview">{stop.notes}</span>
                  )}
                </span>
                <span className="stop-caret" aria-hidden="true">
                  {openStop === stop.id ? '▾' : '›'}
                </span>
              </button>

              {openStop === stop.id && (
                <div className="stop-edit">
                  <label className="field">
                    <span>Nome</span>
                    <input
                      value={stop.name}
                      onChange={(e) => onUpdateStop(day.id, stop.id, { name: e.target.value })}
                    />
                  </label>
                  <div className="field-row">
                    <label className="field">
                      <span>Hora</span>
                      <input
                        type="time"
                        value={stop.time || ''}
                        onChange={(e) => onUpdateStop(day.id, stop.id, { time: e.target.value })}
                      />
                    </label>
                    <label className="field">
                      <span>Duração (min)</span>
                      <input
                        type="number"
                        min="0"
                        step="15"
                        value={stop.durationMin ?? ''}
                        onChange={(e) =>
                          onUpdateStop(day.id, stop.id, {
                            durationMin: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span>Notas</span>
                    <textarea
                      rows={3}
                      value={stop.notes || ''}
                      onChange={(e) => onUpdateStop(day.id, stop.id, { notes: e.target.value })}
                    />
                  </label>
                  <LocationPicker
                    lat={stop.lat}
                    lng={stop.lng}
                    onPick={(patch) => {
                      const next = { lat: patch.lat, lng: patch.lng }
                      if (patch.name && (!stop.name || stop.name === 'Nova paragem')) {
                        next.name = patch.name
                      }
                      onUpdateStop(day.id, stop.id, next)
                    }}
                    onClear={() => onUpdateStop(day.id, stop.id, { lat: null, lng: null })}
                  />

                  <div className="stop-actions">
                    <div className="reorder">
                      <button onClick={() => onMoveStop(day.id, stop.id, -1)} disabled={si === 0} aria-label="Mover para cima">↑</button>
                      <button onClick={() => onMoveStop(day.id, stop.id, 1)} disabled={si === day.stops.length - 1} aria-label="Mover para baixo">↓</button>
                    </div>
                    <button
                      className="danger-btn"
                      onClick={() => {
                        if (confirm(`Apagar "${stop.name}"?`)) {
                          onRemoveStop(day.id, stop.id)
                          setOpenStop(null)
                        }
                      }}
                    >
                      Apagar paragem
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <button
          className="add-stop"
          onClick={() => {
            const id = onAddStop(day.id)
            setOpenStop(id)
          }}
        >
          + Adicionar paragem
        </button>
      </div>
    </section>
  )
}

function formatDate(iso) {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${meses[m - 1]}`
}

function formatDuration(min) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const r = min % 60
  return r ? `${h}h${String(r).padStart(2, '0')}` : `${h}h`
}
