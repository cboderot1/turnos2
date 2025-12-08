import { FormEvent, useState } from 'react'
import axios from 'axios'
import { Ticket, CLIENT_TYPES, SERVICE_TYPES } from '../types'

export function ClientePage() {
  const [form, setForm] = useState({
    client_name: '',
    client_identifier: '',
    motive: '',
    client_type: CLIENT_TYPES[0].value,
    service_type: SERVICE_TYPES[0].value,
  })
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const response = await axios.post<Ticket>('/api/tickets', form)
      setTicket(response.data)
    } catch (err) {
      setError('No se pudo crear el turno')
    }
  }

  return (
    <section id="cliente" className="mx-auto max-w-5xl px-4 py-12">
      <div className="card">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-400">Solicitar turno</p>
            <h2 className="text-2xl font-bold">Cliente</h2>
          </div>
        </header>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Identificación personal
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-base"
              required
              value={form.client_identifier}
              onChange={(e) => setForm({ ...form, client_identifier: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Nombre completo
            <input
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-base"
              required
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
            />
          </label>
          <label className="md:col-span-2 flex flex-col gap-2 text-sm font-medium text-slate-200">
            Motivo
            <textarea
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              rows={2}
              required
              value={form.motive}
              onChange={(e) => setForm({ ...form, motive: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Tipo de cliente
            <select
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              value={form.client_type}
              onChange={(e) => setForm({ ...form, client_type: e.target.value })}
            >
              {CLIENT_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
            Tipo de atención
            <select
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
              value={form.service_type}
              onChange={(e) => setForm({ ...form, service_type: e.target.value })}
            >
              {SERVICE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2 flex items-center gap-4">
            <button className="btn-primary" type="submit">
              Solicitar turno
            </button>
            {error && <span className="text-sm text-amber-400">{error}</span>}
          </div>
        </form>
        {ticket && (
          <div className="mt-6 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm">
            <p className="font-semibold text-emerald-200">Turno generado</p>
            <p className="text-emerald-100">#{ticket.id} • {ticket.service_type}</p>
          </div>
        )}
      </div>
    </section>
  )
}
