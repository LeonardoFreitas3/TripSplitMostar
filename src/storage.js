import { INITIAL_DATA } from './data.js'

const KEY = 'itinerario-split-mostar-v1'

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(INITIAL_DATA)
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.days)) return structuredClone(INITIAL_DATA)
    return parsed
  } catch {
    return structuredClone(INITIAL_DATA)
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // localStorage cheio ou indisponível — ignora silenciosamente.
  }
}

export function resetData() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
  return structuredClone(INITIAL_DATA)
}

// Descarrega o itinerário como ficheiro .json (backup / passar para outro telemóvel).
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
        if (!parsed || !Array.isArray(parsed.days)) {
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
