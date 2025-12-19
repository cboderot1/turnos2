import { useEffect, useState } from 'react'
import axios from 'axios'
import { Ticket, AgentState } from '../types'

export function PantallaPage() {
  const [matrizadores, setMatrizadores] = useState<Ticket[]>([])
  const [asesorias, setAsesorias] = useState<Ticket[]>([])
  const [attending, setAttending] = useState<AgentState[]>([])

  const load = async () => {
    try {
      const res = await axios.get<{ matrizador_queue?: Ticket[]; asesor_queue?: Ticket[]; attending?: AgentState[] }>(
        '/api/tickets/queue'
      )
      const pendingTramites = (res.data.matrizador_queue ?? []).filter((ticket) => !ticket.assigned_to)
      const pendingAsesorias = (res.data.asesor_queue ?? []).filter((ticket) => !ticket.assigned_to)

      setMatrizadores(pendingTramites)
      setAsesorias(pendingAsesorias)
      setAttending(res.data.attending ?? [])
    } catch (error) {
      console.error('Error cargando colas de tickets', error)
      setMatrizadores([])
      setAsesorias([])
      setAttending([])
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section id="pantalla" className="bg-gradient-to-br from-emerald-500/20 via-slate-900 to-slate-950 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Pantalla pública</p>
          <h2 className="text-4xl font-black text-white drop-shadow-lg">Turnos en vivo</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-slate-950/70 p-6 shadow-2xl border border-emerald-500/30">
            <h3 className="text-2xl font-semibold text-emerald-300">Atendiendo</h3>
            <ul className="mt-4 space-y-3 text-lg">
              {attending.map((agent) => (
                <li key={agent.id} className="flex items-center justify-between rounded-xl bg-slate-900/70 px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">{agent.user?.display_name ?? `Agente #${agent.user_id}`}</span>
                    <span className="text-xs uppercase tracking-wide text-emerald-200">
                      {agent.user?.role === 'MATRIZADOR'
                        ? 'Matrizador'
                        : agent.user?.role === 'ASESOR'
                        ? 'Asesor'
                        : 'Agente'}
                    </span>
                  </div>
                  <div className="text-right">
                    {agent.status === 'BUSY' && agent.current_ticket_id ? (
                      <>
                        <p className="text-emerald-300 text-sm">Atendiendo</p>
                        <p className="text-lg font-bold text-white">Turno #{agent.current_ticket_id}</p>
                      </>
                    ) : (
                      <p className="text-slate-300">Libre</p>
                    )}
                  </div>
                </li>
              ))}
              {attending.length === 0 && <p className="text-slate-300">Sin agentes activos.</p>}
            </ul>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-6 shadow-2xl border border-emerald-500/30">
            <h3 className="text-2xl font-semibold text-white">Cola Trámites</h3>
            <ul className="mt-4 space-y-3 text-lg">
              {matrizadores.map((ticket) => (
                <li key={ticket.id} className="flex items-center justify-between rounded-xl bg-slate-900/70 px-4 py-3">
                  <span className="font-bold text-emerald-200">#{ticket.id}</span>
                  <span className="text-slate-200">{ticket.client_name}</span>
                  <span className="text-sm uppercase text-amber-300">{ticket.client_type}</span>
                </li>
              ))}
              {matrizadores.length === 0 && <p className="text-slate-300">Sin turnos pendientes.</p>}
            </ul>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-6 shadow-2xl border border-emerald-500/30">
            <h3 className="text-2xl font-semibold text-white">Cola Asesorías</h3>
            <ul className="mt-4 space-y-3 text-lg">
              {asesorias.map((ticket) => (
                <li key={ticket.id} className="flex items-center justify-between rounded-xl bg-slate-900/70 px-4 py-3">
                  <span className="font-bold text-emerald-200">#{ticket.id}</span>
                  <span className="text-slate-200">{ticket.client_name}</span>
                  <span className="text-sm uppercase text-amber-300">{ticket.client_type}</span>
                </li>
              ))}
              {asesorias.length === 0 && <p className="text-slate-300">Sin turnos pendientes.</p>}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
