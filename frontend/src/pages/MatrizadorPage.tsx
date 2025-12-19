import { useEffect, useState } from 'react'
import axios from 'axios'
import { AgentState, Ticket, User } from '../types'

type MatrizadorPageProps = {
  user: User | null
}

export function MatrizadorPage({ user }: MatrizadorPageProps) {
  const [state, setState] = useState<AgentState | null>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)

  const cardClass = 'bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur'
  const buttonBase =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
  const primaryButton = `${buttonBase} bg-emerald-500 text-emerald-950 hover:bg-emerald-400 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-70`
  const secondaryButton = `${buttonBase} bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-70`
  const badgeBase = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'

  const loadState = async () => {
    if (!user) return
    const res = await axios.get<AgentState>('/api/agents/me')
    setState(res.data)
    if (res.data.current_ticket_id) {
      const ticketRes = await axios.get<Ticket>(`/api/tickets/${res.data.current_ticket_id}`)
      setTicket(ticketRes.data)
    } else {
      setTicket(null)
    }
  }

  useEffect(() => {
    loadState()
  }, [user])

  const takeNext = async () => {
    if (!state?.user_id) return
    const res = await axios.post<Ticket>(`/api/agents/${state.user_id}/next`)
    setTicket(res.data)
    await loadState()
  }

  const finish = async () => {
    if (!ticket) return
    await axios.post(`/api/tickets/${ticket.id}/complete`)
    await loadState()
  }

  if (!user) {
    return (
      <section id="matrizador" className="mx-auto max-w-5xl px-4 py-12">
        <div className={`${cardClass} text-center`}>
          <p className="text-sm uppercase tracking-wide text-emerald-400">Acceso restringido</p>
          <h2 className="text-2xl font-bold">Inicia sesión para continuar</h2>
          <p className="mt-2 text-sm text-slate-300">
            Selecciona de nuevo el módulo Matrizador e ingresa tus credenciales para ver tus turnos asignados.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="matrizador" className="mx-auto max-w-5xl px-4 py-12">
      <div className={`${cardClass} grid gap-6 md:grid-cols-2`}>
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-400">Atender trámite</p>
          <h2 className="text-2xl font-bold">Matrizador</h2>
          <p className="mt-2 text-sm text-slate-300">
            Toma el siguiente turno de la cola de trámites. Cuando termines presiona “Fin de atención”.
          </p>
          <p className="mt-2 text-sm text-slate-200">Sesión iniciada como {user.display_name} ({user.username}).</p>
          <div className="mt-4 flex items-center gap-3">
            <span
              className={
                state?.status === 'BUSY'
                  ? `${badgeBase} bg-amber-400 text-amber-900`
                  : `${badgeBase} bg-slate-700 text-slate-100`
              }
            >
              {state?.status === 'BUSY' ? 'Ocupado' : 'Libre'}
            </span>
            <button
              className={secondaryButton}
              onClick={takeNext}
              disabled={!state || state.status === 'BUSY'}
            >
              Tomar siguiente turno
            </button>
            <button className={primaryButton} onClick={finish} disabled={!ticket}>
              Fin de atención
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <h3 className="font-semibold text-lg">Turno actual</h3>
          {ticket ? (
            <div className="mt-3 space-y-1 text-sm text-slate-200">
              <p className="text-xl font-bold text-emerald-300">#{ticket.id}</p>
              <p>Cliente: {ticket.client_name}</p>
              <p>Identificación: {ticket.client_identifier}</p>
              <p>Motivo: {ticket.motive}</p>
              <p>Tipo: {ticket.client_type}</p>
              <p className="text-emerald-200">Atendido por: {user.display_name}</p>
            </div>
          ) : state?.current_ticket_id ? (
            <p className="mt-3 text-sm text-slate-400">
              Cargando detalles del turno #{state.current_ticket_id}...
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No hay turno asignado.</p>
          )}
        </div>
      </div>
    </section>
  )
}
