import axios from 'axios'
import { useEffect, useState } from 'react'
import { DatabaseTestResponse } from '../types'

export function TestDbPage() {
  const [result, setResult] = useState<DatabaseTestResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const cardClass = 'bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur'
  const badgeBase = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'
  const buttonBase =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
  const secondaryButton = `${buttonBase} bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:outline-slate-300`

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get<DatabaseTestResponse>('/api/test/db')
      setResult(response.data)
    } catch (err) {
      console.error('Error verificando la base de datos', err)
      setResult(null)
      setError('No se pudo conectar a la base de datos o leer la tabla users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <section id="test-db" className="mx-auto max-w-5xl px-4 py-12">
      <div className={cardClass}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-400">Diagnóstico</p>
            <h2 className="text-2xl font-bold">Prueba de conexión a la base de datos</h2>
            <p className="text-sm text-slate-300">
              Esta página consulta la tabla <code>users</code> desde el frontend para confirmar que la API puede acceder a la base
              de datos.
            </p>
          </div>
          <div className="flex gap-3">
            <button className={secondaryButton} onClick={load} type="button">
              Reintentar
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Estado</p>
            {loading ? (
              <p className="mt-2 font-semibold text-slate-200">Cargando…</p>
            ) : error ? (
              <p className="mt-2 font-semibold text-rose-300">Error</p>
            ) : (
              <p className="mt-2 font-semibold text-emerald-300">{result?.status ?? 'Desconocido'}</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Usuarios encontrados</p>
            {loading ? (
              <p className="mt-2 font-semibold text-slate-200">Cargando…</p>
            ) : error ? (
              <p className="mt-2 font-semibold text-rose-300">—</p>
            ) : (
              <p className="mt-2 text-3xl font-bold text-emerald-300">{result?.user_count ?? 0}</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-400">Última actualización</p>
            <p className="mt-2 font-semibold text-slate-200">{new Date().toLocaleString()}</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
          <div className="flex items-center justify-between bg-slate-900/80 px-4 py-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-emerald-400">Tabla users</p>
              <h3 className="text-lg font-semibold">Registros obtenidos</h3>
            </div>
            <span
              className={`${badgeBase} ${
                result?.user_count
                  ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/40'
                  : 'bg-slate-700 text-slate-100'
              }`}
            >
              {loading ? 'Cargando' : `${result?.user_count ?? 0} usuarios`}
            </span>
          </div>
          <div className="divide-y divide-slate-800 bg-slate-950/60">
            {loading && <p className="p-4 text-sm text-slate-300">Obteniendo datos…</p>}
            {!loading && result?.users?.length === 0 && (
              <p className="p-4 text-sm text-slate-300">No se encontraron registros en la tabla users.</p>
            )}
            {!loading &&
              result?.users?.map((user) => (
                <div key={user.id} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-3 sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{user.display_name || user.username}</p>
                    <p className="text-xs text-slate-400">Usuario: {user.username}</p>
                  </div>
                  <p className="text-xs text-slate-400">ID: {user.id}</p>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span
                      className={`${badgeBase} ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-200 ring-1 ring-purple-400/40'
                          : user.role === 'ASESOR'
                            ? 'bg-blue-500/20 text-blue-200 ring-1 ring-blue-400/40'
                            : 'bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40'
                      }`}
                    >
                      {user.role === 'ADMIN'
                        ? 'Administrador'
                        : user.role === 'ASESOR'
                          ? 'Asesor'
                          : 'Matrizador'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <p>
            Si puedes ver los registros de la tabla <code>users</code> arriba, significa que la API está conectada a la base de
            datos y el frontend puede comunicarse correctamente con ella.
          </p>
        </div>
      </div>
    </section>
  )
}
