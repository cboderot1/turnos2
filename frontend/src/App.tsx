import { useState } from 'react'
import { ClientePage } from './pages/ClientePage'
import { MatrizadorPage } from './pages/MatrizadorPage'
import { AsesorPage } from './pages/AsesorPage'
import { AdminPage } from './pages/AdminPage'
import { PantallaPage } from './pages/PantallaPage'
import { NavBar } from './components/NavBar'
import { ModuleKey } from './types'

const moduleComponents: Record<ModuleKey, JSX.Element> = {
  cliente: <ClientePage />,
  matrizador: <MatrizadorPage />,
  asesor: <AsesorPage />,
  admin: <AdminPage />,
  pantalla: <PantallaPage />,
}

function App() {
  const [selectedModule, setSelectedModule] = useState<ModuleKey | null>(null)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <NavBar onSelect={setSelectedModule} selected={selectedModule} />
      <main className="flex flex-col items-center px-4 pb-16">
        {selectedModule ? (
          <div className="w-full">{moduleComponents[selectedModule]}</div>
        ) : (
          <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-10 py-16 text-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-wide text-emerald-400">Bienvenido</p>
              <h1 className="text-3xl font-bold sm:text-4xl">Gestiona los turnos desde un solo lugar</h1>
              <p className="text-base text-slate-200 sm:text-lg">
                Selecciona la opción que necesites para solicitar un nuevo turno o mostrar la pantalla de atención.
              </p>
            </div>
            <div className="grid w-full gap-6 sm:grid-cols-2">
              <button
                className="flex flex-col gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={() => setSelectedModule('cliente')}
                type="button"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Solicitar turno</p>
                <h2 className="text-2xl font-bold text-slate-50">Ingreso de cliente</h2>
                <p className="text-sm text-slate-200">
                  Captura los datos del cliente y genera un nuevo turno para la fila de atención.
                </p>
              </button>
              <button
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-left shadow-xl transition hover:-translate-y-1 hover:border-emerald-400 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={() => setSelectedModule('pantalla')}
                type="button"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-300">Mostrar pantalla únicamente</p>
                <h2 className="text-2xl font-bold text-slate-50">Panel de pantallas</h2>
                <p className="text-sm text-slate-200">
                  Visualiza en modo pantalla completa los turnos que están siendo atendidos.
                </p>
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
