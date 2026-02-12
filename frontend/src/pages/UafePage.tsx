import { FormEvent, useState } from 'react'

type UafeForm = {
  nombres: string
  primerApellido: string
  segundoApellido: string
  sinSegundoApellido: boolean
  fechaNacimiento: string
  estadoCivil: string
  sexo: string
  nacionalidad: string
  domicilio: string
  telefono: string
  correoElectronico: string
  profesion: string
  sector: string
  cargo: string
  entidadTrabajo: string
  ingresoMensual: string
}

const initialForm: UafeForm = {
  nombres: '',
  primerApellido: '',
  segundoApellido: '',
  sinSegundoApellido: false,
  fechaNacimiento: '',
  estadoCivil: '',
  sexo: '',
  nacionalidad: '',
  domicilio: '',
  telefono: '',
  correoElectronico: '',
  profesion: '',
  sector: '',
  cargo: '',
  entidadTrabajo: '',
  ingresoMensual: '',
}

export function UafePage() {
  const [form, setForm] = useState<UafeForm>(initialForm)
  const [reportVisible, setReportVisible] = useState(false)

  const inputClass = 'rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-base text-slate-100'
  const labelClass = 'flex flex-col gap-2 text-sm font-medium text-slate-200'

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setReportVisible(true)
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 shadow-xl sm:p-6">
        <form className="space-y-8" onSubmit={submit}>
          <button
            className="rounded-xl bg-emerald-500 px-5 py-3 text-lg font-bold text-emerald-950 transition hover:bg-emerald-400"
            type="submit"
          >
            Mostrar reporte
          </button>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-emerald-400">1. Información personal</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <label className={labelClass}>
                Nombres
                <input
                  className={inputClass}
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Primer Apellido
                <input
                  className={inputClass}
                  value={form.primerApellido}
                  onChange={(e) => setForm({ ...form, primerApellido: e.target.value })}
                />
              </label>
              <div className="space-y-2">
                <label className={labelClass}>
                  Segundo Apellido
                  <input
                    className={inputClass}
                    disabled={form.sinSegundoApellido}
                    value={form.segundoApellido}
                    onChange={(e) => setForm({ ...form, segundoApellido: e.target.value })}
                  />
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <input
                    checked={form.sinSegundoApellido}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sinSegundoApellido: e.target.checked,
                        segundoApellido: e.target.checked ? '' : form.segundoApellido,
                      })
                    }
                    type="checkbox"
                  />
                  Sin segundo apellido
                </label>
              </div>
              <label className={labelClass}>
                Fecha Nacimiento
                <input
                  className={inputClass}
                  placeholder="mm/dd/yyyy"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Estado Civil
                <input
                  className={inputClass}
                  value={form.estadoCivil}
                  onChange={(e) => setForm({ ...form, estadoCivil: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Sexo
                <input
                  className={inputClass}
                  value={form.sexo}
                  onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                />
              </label>
              <label className={`${labelClass} md:col-span-1`}>
                Nacionalidad
                <input
                  className={inputClass}
                  value={form.nacionalidad}
                  onChange={(e) => setForm({ ...form, nacionalidad: e.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-emerald-400">2. Información de contacto y residencia</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <label className={`${labelClass} md:col-span-2`}>
                Domicilio
                <input
                  className={inputClass}
                  value={form.domicilio}
                  onChange={(e) => setForm({ ...form, domicilio: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Teléfono
                <input
                  className={inputClass}
                  value={form.telefono}
                  onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Correo Electrónico
                <input
                  className={inputClass}
                  type="email"
                  value={form.correoElectronico}
                  onChange={(e) => setForm({ ...form, correoElectronico: e.target.value })}
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-emerald-400">3. Información laboral y económica</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <label className={labelClass}>
                Profesión u ocupación
                <input
                  className={inputClass}
                  value={form.profesion}
                  onChange={(e) => setForm({ ...form, profesion: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Sector
                <input
                  className={inputClass}
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Cargo
                <input
                  className={inputClass}
                  value={form.cargo}
                  onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Entidad en donde trabaja
                <input
                  className={inputClass}
                  value={form.entidadTrabajo}
                  onChange={(e) => setForm({ ...form, entidadTrabajo: e.target.value })}
                />
              </label>
              <label className={labelClass}>
                Ingreso Mensual
                <input
                  className={inputClass}
                  value={form.ingresoMensual}
                  onChange={(e) => setForm({ ...form, ingresoMensual: e.target.value })}
                />
              </label>
            </div>
          </div>
        </form>

        {reportVisible && (
          <p className="mt-4 text-sm text-emerald-300">Reporte listo para mostrarse con la información ingresada.</p>
        )}
      </div>
    </section>
  )
}
