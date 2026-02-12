import { useState } from 'react'
import axios from 'axios'
import { ClientePage } from './pages/ClientePage'
import { MatrizadorPage } from './pages/MatrizadorPage'
import { AsesorPage } from './pages/AsesorPage'
import { AdminPage } from './pages/AdminPage'
import { PantallaPage } from './pages/PantallaPage'
import { TestDbPage } from './pages/TestDbPage'
import { UafePage } from './pages/UafePage'
import { ReportesPage } from './pages/ReportesPage'
import { NavBar } from './components/NavBar'
import { AdminAuthModal } from './components/AdminAuthModal'
import { ModuleKey, User } from './types'

function App() {
  const [selectedModule, setSelectedModule] = useState<ModuleKey | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingModule, setPendingModule] = useState<ModuleKey | null>(null)
  const [allowedRoles, setAllowedRoles] = useState<User['role'][]>([])
  const [authUser, setAuthUser] = useState<User | null>(null)

  const handleSelect = (module: ModuleKey | null) => {
    if (!module) {
      setSelectedModule(null)
      return
    }

    const authConfig: Partial<Record<ModuleKey, User['role'][]>> = {
      admin: ['ADMIN'],
      test: ['ADMIN'],
      matrizador: ['ADMIN', 'MATRIZADOR', 'ASESOR'],
    }

    const requiresAuth = authConfig[module]

    if (requiresAuth && (!authUser || !requiresAuth.includes(authUser.role))) {
      setPendingModule(module)
      setAllowedRoles(requiresAuth)
      setShowAuthModal(true)
      return
    }

    setSelectedModule(module)
  }

  const handleAuthSuccess = (user: User, token: string) => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
    setAuthUser(user)
    setSelectedModule(pendingModule ?? 'admin')
    setPendingModule(null)
    setShowAuthModal(false)
  }

  const renderSelectedModule = () => {
    if (!selectedModule) return null

    switch (selectedModule) {
      case 'cliente':
        return <ClientePage />
      case 'matrizador':
        return <MatrizadorPage user={authUser} />
      case 'asesor':
        return <AsesorPage />
      case 'admin':
        return <AdminPage />
      case 'pantalla':
        return <PantallaPage />
      case 'reportes':
        return <ReportesPage />
      case 'uafe':
        return <UafePage />
      case 'test':
        return <TestDbPage />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <NavBar onSelect={handleSelect} selected={selectedModule} />
      <main className="flex flex-col items-center px-4 pb-16">
        {selectedModule ? (
          <div className="w-full">{renderSelectedModule()}</div>
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
                onClick={() => handleSelect('cliente')}
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
                onClick={() => handleSelect('pantalla')}
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
      <AdminAuthModal
        isOpen={showAuthModal}
        allowedRoles={allowedRoles}
        title={pendingModule === 'matrizador' ? 'Ingreso a módulo Matrizador' : 'Administrador'}
        description={
          pendingModule === 'matrizador'
            ? 'Ingresa tus credenciales para continuar con el módulo Matrizador.'
            : 'Ingresa tus credenciales para confirmar que tienes permisos de administrador.'
        }
        onClose={() => {
          setShowAuthModal(false)
          setPendingModule(null)
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  )
}

export default App
