import { Bars3Icon } from '@heroicons/react/24/outline'
import { useState } from 'react'

const links = [
  { href: '#cliente', label: 'Cliente' },
  { href: '#matrizador', label: 'Matrizador' },
  { href: '#asesor', label: 'Asesor' },
  { href: '#admin', label: 'Administrador' },
  { href: '#pantalla', label: 'Pantalla' },
]

export function NavBar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
        <div className="text-lg font-bold tracking-tight text-emerald-400">Turnos Inteligentes</div>
        <button className="sm:hidden" onClick={() => setOpen((v) => !v)}>
          <Bars3Icon className="h-6 w-6" />
        </button>
        <nav className={`${open ? 'block' : 'hidden'} sm:block`}>
          <ul className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 text-sm font-medium">
            {links.map((link) => (
              <li key={link.href}>
                <a className="text-slate-100 hover:text-emerald-300" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
