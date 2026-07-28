import { useState } from 'react'
import { supabase } from '../supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState(null)
  const [aEntrar, setAEntrar] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro(null)
    setAEntrar(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    // Mensagem igual para email errado e password errada: não vale a pena
    // dizer a quem tenta se a conta existe.
    if (error) setErro('Email ou password errados.')
    setAEntrar(false)
  }

  return (
    <div className="app">
      <main className="content">
        <form className="login" onSubmit={entrar}>
          <h1>Viagens</h1>
          <p className="login-sub">Entra para veres os teus itinerários.</p>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(ev) => setEmail(ev.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              required
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </label>

          {erro && <p className="login-erro">{erro}</p>}

          <button className="login-btn" type="submit" disabled={aEntrar}>
            {aEntrar ? 'A entrar…' : 'Entrar'}
          </button>
        </form>
      </main>
    </div>
  )
}
