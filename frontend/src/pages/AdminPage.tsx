import { useEffect, useState } from 'react'
import axios from 'axios'
import { AgentState, Ticket } from '../types'

export function AdminPage() {
  const [report, setReport] = useState<Ticket[]>([])
  const [agents, setAgents] = useState<AgentState[]>([])

  const load = async () => {
    const [reportRes, queueRes] = await Promise.all([
      axios.get<Ticket[]>('/api/reports'),
      axios.get<{ attending: AgentState[] }>('/api/tickets/queue'),
    ])
    setReport(reportRes.data)
    setAgents(queueRes.data.attending)
  }

  useEffect(() => {
    load()
  }, [])

  const toggle = async (agent: AgentState) => {
    const nextState = agent.status === 'BUSY' ? 'FREE' : 'BUSY'
    await axios.post(`/api/agents/${agent.user_id}/status`, null, { params: { status: nextState } })
    load()
  }

  return (
    <section id="admin" className="mx-auto max-w-6xl px-4 py-12">
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-400">Control total</p>
            <h2 className="text-2xl font-bold">Administrador</h2>
          </div>
          <button className="btn-secondary" onClick={load}>
            Actualizar
          </button>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold">Estados de agentes</h3>
            <ul className="mt-3 space-y-3">
              {agents.map((agent) => (
                <li key={agent.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">Agente #{agent.user_id}</p>
                    <p className="text-xs text-slate-400">Estado: {agent.status}</p>
                  </div>
                  <button className="btn-primary" onClick={() => toggle(agent)}>
                    Cambiar a {agent.status === 'BUSY' ? 'Libre' : 'Ocupado'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Reporte de atenciones</h3>
            <div className="mt-3 space-y-3">
              {report.map((item) => (
                <article key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-emerald-300 font-bold">Turno #{item.id}</p>
                    <span className="badge {item.priority ? 'badge-priority' : 'badge-normal'}">
                      {item.service_type}
                    </span>
                  </div>
                  <p className="text-slate-200">{item.client_name} — {item.client_identifier}</p>
                  <p className="text-slate-400">{item.motive}</p>
                </article>
              ))}
              {report.length === 0 && <p className="text-slate-400">Sin atenciones finalizadas.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
