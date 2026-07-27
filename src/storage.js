import { supabase } from './supabase.js'

// A linha vem de uma tabela escrita com a chave publishable — validar antes de confiar.
function valid(d) {
  return !!d && !!d.meta && Array.isArray(d.days)
}

function db() {
  if (!supabase) {
    throw new Error('Supabase não configurado: falta VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.')
  }
  return supabase.from('trips')
}

export async function listTrips() {
  const { data, error } = await db().select('id, data').order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data || [])
    .filter((r) => valid(r.data))
    .map((r) => ({ id: r.id, meta: r.data.meta, dias: r.data.days.length }))
}

export async function createTrip(title) {
  const id = uid()
  const data = { meta: { title, subtitle: '', start: '', end: '' }, days: [] }
  const { error } = await db().insert({ id, data })
  if (error) throw new Error(error.message)
  return id
}

export async function loadData(id) {
  const { data, error } = await db().select('data').eq('id', id).maybeSingle()
  if (error) throw new Error(error.message)
  if (!valid(data?.data)) throw new Error('Viagem não encontrada.')
  return data.data
}

export async function saveData(id, data) {
  const { error } = await db().upsert({ id, data, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
}

// Descarrega o itinerário como ficheiro .json (backup).
export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `itinerario-${data.meta?.start || 'viagem'}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Lê um ficheiro .json e devolve o objeto do itinerário (ou lança erro).
export function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!valid(parsed)) {
          reject(new Error('Ficheiro inválido: não tem dias.'))
          return
        }
        resolve(parsed)
      } catch {
        reject(new Error('Não foi possível ler o ficheiro JSON.'))
      }
    }
    reader.onerror = () => reject(new Error('Falha a abrir o ficheiro.'))
    reader.readAsText(file)
  })
}

export function uid() {
  return 'x' + Math.random().toString(36).slice(2, 9)
}
