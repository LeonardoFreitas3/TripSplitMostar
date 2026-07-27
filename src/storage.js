import { INITIAL_DATA } from './data.js'
import { supabase, TRIP_ID } from './supabase.js'

const KEY = 'itinerario-split-mostar-v1'

// A linha vem de uma tabela escrita com a chave anon — validar antes de confiar.
function valid(d) {
  return !!d && Array.isArray(d.days) && !!d.meta
}

export async function loadData() {
  if (!supabase) {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY))
      return valid(parsed) ? parsed : structuredClone(INITIAL_DATA)
    } catch {
      return structuredClone(INITIAL_DATA)
    }
  }
  const { data, error } = await supabase
    .from('trips')
    .select('data')
    .eq('id', TRIP_ID)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return valid(data?.data) ? data.data : structuredClone(INITIAL_DATA)
}

export async function saveData(data) {
  if (!supabase) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      // localStorage cheio ou indisponível — ignora silenciosamente.
    }
    return
  }
  const { error } = await supabase.from('trips').upsert({ id: TRIP_ID, data })
  if (error) throw new Error(error.message)
}

export async function resetData() {
  const fresh = structuredClone(INITIAL_DATA)
  await saveData(fresh)
  return fresh
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
