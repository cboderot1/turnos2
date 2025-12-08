import { useEffect, useState } from 'react'
import axios from 'axios'
import { AgentState, Ticket } from '../types'

export function MatrizadorPage() {
  const [state, setState] = useState<AgentState | null>(null)
  const [ticket, setTicket] = useState<Ticket | null>(null)

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
    <section id="matrizador" className="mx-auto max-w-5xl px-4 py-12">
      <div className="card grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-400">Atender trámite</p>
          <h2 className="text-2xl font-bold">Matrizador</h2>
          <p className="mt-2 text-sm text-slate-300">
            Toma el siguiente turno de la cola de trámites. Cuando termines presiona “Fin de atención”.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className={`badge ${state?.status === 'BUSY' ? 'badge-priority' : 'badge-normal'}`}>
              {state?.status === 'BUSY' ? 'Ocupado' : 'Libre'}
            </span>
            <button className="btn-secondary" onClick={takeNext} disabled={state?.status === 'BUSY'}>
              Tomar siguiente turno
            </button>
            <button className="btn-primary" onClick={finish} disabled={!ticket}>
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
