import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// ponytail: sem as env vars a app cai para localStorage (dev local / deploy sem segredos).
export const supabase = url && key ? createClient(url, key) : null

// Uma viagem, uma linha. Se um dia houver várias viagens, isto vira parâmetro.
export const TRIP_ID = 'split-mostar'
