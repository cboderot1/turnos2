import { useEffect, useState } from 'react'
import axios from 'axios'
import { AgentState, Ticket } from '../types'

export function AsesorPage() {
  const [state, setState] = useState<AgentState | null>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)

  const cardClass = 'bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur'
  const buttonBase =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
  const primaryButton = `${buttonBase} bg-emerald-500 text-emerald-950 hover:bg-emerald-400 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-70`
  const secondaryButton = `${buttonBase} bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-70`
  const badgeBase = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide'

  useEffect(() => {
    const load = async () => {
      const res = await axios.get<AgentState>('/api/agents/me')
      setState(res.data)
      if (res.data.current_ticket_id) {
        const ticketRes = await axios.get<Ticket>(`/api/tickets/${res.data.current_ticket_id}`)
        setTicket(ticketRes.data)
      }
    }
    load()
  }, [])

  const takeNext = async () => {
    const res = await axios.post<Ticket>(`/api/agents/${state?.user_id}/next`)
    setTicket(res.data)
    setState({ ...(state as AgentState), status: 'BUSY', current_ticket_id: res.data.id })
  }

  const finish = async () => {
    if (!ticket) return
    await axios.post(`/api/tickets/${ticket.id}/complete`)
    setTicket(null)
    setState({ ...(state as AgentState), status: 'FREE', current_ticket_id: undefined })
  }

  return (
    <section id="asesor" className="mx-auto max-w-5xl px-4 py-12">
      <div className={`${cardClass} grid gap-6 md:grid-cols-2`}>
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-400">Atender asesoría</p>
          <h2 className="text-2xl font-bold">Asesor</h2>
          <p className="mt-2 text-sm text-slate-300">Gestiona la cola de asesorías con prioridad para adultos mayores y personas con discapacidad.</p>
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
            <button className={secondaryButton} onClick={takeNext} disabled={state?.status === 'BUSY'}>
              Tomar asesoría
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
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No hay turno asignado.</p>
          )}
        </div>
      </div>
    </section>
  )
}
