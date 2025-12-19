import { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { User } from '../types'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  allowedRoles: User['role'][]
  title: string
  description?: string
  onSuccess: (user: User, token: string) => void
}

const ROLE_LABELS: Record<User['role'], string> = {
  ADMIN: 'Administrador',
  ASESOR: 'Asesor',
  MATRIZADOR: 'Matrizador',
}

export function AdminAuthModal({
  isOpen,
  onClose,
  allowedRoles,
  title,
  description,
  onSuccess,
}: AuthModalProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const allowedLabel = useMemo(() => {
    if (allowedRoles.length === 0) return 'usuarios autorizados'
    if (allowedRoles.length === 1) return ROLE_LABELS[allowedRoles[0]]
    if (allowedRoles.length === 2) return `${ROLE_LABELS[allowedRoles[0]]} o ${ROLE_LABELS[allowedRoles[1]]}`
    const [first, ...rest] = allowedRoles
    return `${ROLE_LABELS[first]}, ${rest
      .slice(0, -1)
      .map((role) => ROLE_LABELS[role])
      .join(', ')} o ${ROLE_LABELS[rest[rest.length - 1]]}`
  }, [allowedRoles])

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

      if (!allowedRoles.includes(meResponse.data.role)) {
        setError(`Solo los usuarios con rol ${allowedLabel} pueden ingresar a este módulo.`)
        return
      }

      onSuccess(meResponse.data, token)
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
            <h2 className="text-xl font-bold text-slate-50">{title}</h2>
            <p className="mt-1 text-sm text-slate-300">
              {description ?? 'Ingresa tus credenciales para continuar.'}
            </p>
            <p className="mt-1 text-xs text-slate-400">Roles permitidos: {allowedLabel}</p>
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
