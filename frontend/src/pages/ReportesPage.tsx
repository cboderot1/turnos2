import { FormEvent, useState } from 'react'

type ReportFilter = {
  inicio: string
  fin: string
}

type ReportType = {
  id: string
  title: string
}

const defaultDate = new Date().toISOString().slice(0, 10)

const reports: ReportType[] = [
  { id: 'tra-int', title: 'Reportes TRA/INT' },
  { id: 'data', title: 'Reporte DATA' },
  { id: 'coincidencias', title: 'Reporte de Coincidencias' },
]

export function ReportesPage() {
  const [filters, setFilters] = useState<Record<string, ReportFilter>>(
    Object.fromEntries(reports.map((report) => [report.id, { inicio: defaultDate, fin: defaultDate }])),
  )

  const updateFilter = (reportId: string, key: keyof ReportFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [reportId]: {
        ...prev[reportId],
        [key]: value,
      },
    }))
  }

  const handleSubmit = (event: FormEvent, reportId: string) => {
    event.preventDefault()
    const selectedFilter = filters[reportId]
    if (!selectedFilter) return

    // Placeholder para futura integración de descarga.
    window.alert(`Descargando ${reportId}: ${selectedFilter.inicio} - ${selectedFilter.fin}`)
  }

  return (
    <section className="mx-auto w-full max-w-6xl py-10">
      <div className="space-y-4">
        {reports.map((report) => {
          const selectedFilter = filters[report.id]
          if (!selectedFilter) return null

          return (
            <article
              key={report.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg"
            >
              <h2 className="text-lg font-semibold text-slate-100">{report.title}</h2>

              <form
                className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_290px] md:items-end"
                onSubmit={(event) => handleSubmit(event, report.id)}
              >
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
                  Fecha Inicio
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                    type="date"
                    value={selectedFilter.inicio}
                    onChange={(event) => updateFilter(report.id, 'inicio', event.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
                  Fecha Fin
                  <input
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
                    type="date"
                    value={selectedFilter.fin}
                    onChange={(event) => updateFilter(report.id, 'fin', event.target.value)}
                  />
                </label>

                <div className="flex flex-col gap-2 text-sm font-medium text-slate-200">
                  Acción
                  <button
                    className="h-[42px] rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500"
                    type="submit"
                  >
                    Descargar
                  </button>
                </div>
              </form>

              <p className="mt-3 text-xs text-slate-400">* Selecciona las fechas de inicio y fin para el reporte.</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
