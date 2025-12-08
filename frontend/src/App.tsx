import { ClientePage } from './pages/ClientePage'
import { MatrizadorPage } from './pages/MatrizadorPage'
import { AsesorPage } from './pages/AsesorPage'
import { AdminPage } from './pages/AdminPage'
import { PantallaPage } from './pages/PantallaPage'
import { NavBar } from './components/NavBar'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <NavBar />
      <main className="space-y-10 pb-16">
        <ClientePage />
        <MatrizadorPage />
        <AsesorPage />
        <AdminPage />
        <PantallaPage />
      </main>
    </div>
  )
}

export default App
