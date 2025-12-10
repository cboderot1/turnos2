import { FormEvent, useState } from 'react'
import axios from 'axios'
import { User } from '../types'

type AdminAuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void
}

export function AdminAuthModal({ isOpen, onClose, onSuccess }: AdminAuthModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setError(null)
    setUsername('')
    setPassword('')
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const loginResponse = await axios.post<{ access_token: string }>(
        '/api/auth/login',
        new URLSearchParams({ username, password }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      )

      const token = loginResponse.data.access_token
      const authHeader = `Bearer ${token}`

      const meResponse = await axios.get<User>('/api/auth/me', {
        headers: { Authorization: authHeader },
      })

      if (meResponse.data.role !== 'ADMIN') {
        setError('Solo los usuarios con rol Administrador pueden ingresar a este módulo.')
        return
      }

      axios.defaults.headers.common.Authorization = authHeader
      onSuccess(meResponse.data)
    } catch (err) {
      setError('No se pudo iniciar sesión. Verifica las credenciales e inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-400">Acceso restringido</p>
            <h2 className="text-xl font-bold text-slate-50">Administrador</h2>
            <p className="mt-1 text-sm text-slate-300">
              Ingresa tus credenciales para confirmar que tienes permisos de administrador.
            </p>
          </div>
          <button
            className="text-slate-400 transition hover:text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            onClick={handleClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200" htmlFor="admin-username">
              Usuario
            </label>
            <input
              id="admin-username"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200" htmlFor="admin-password">
              Contraseña
            </label>
            <input
              id="admin-password"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 shadow-inner focus:border-emerald-400 focus:outline-none"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-amber-400">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-100 transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              onClick={handleClose}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Validando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
