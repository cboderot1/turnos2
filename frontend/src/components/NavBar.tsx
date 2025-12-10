import { Bars3Icon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { ModuleKey } from '../types'

type NavLink = {
  key: ModuleKey | 'inicio'
  label: string
}

type NavBarProps = {
  selected: ModuleKey | null
  onSelect: (value: ModuleKey | null) => void
}

const links: NavLink[] = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'matrizador', label: 'Matrizador' },
  { key: 'asesor', label: 'Asesor' },
  { key: 'admin', label: 'Administrador' },
  { key: 'pantalla', label: 'Pantalla' },
]

export function NavBar({ onSelect, selected }: NavBarProps) {
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
            {links.map((link) => {
              const isActive =
                link.key === 'inicio' ? selected === null : link.key === selected
              return (
                <li key={link.key}>
                  <button
                    className={`rounded-lg px-2 py-1 transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                      isActive ? 'text-emerald-300' : 'text-slate-100'
                    }`}
                    onClick={() => {
                      const nextValue = link.key === 'inicio' ? null : link.key
                      onSelect(nextValue)
                      setOpen(false)
                    }}
                    type="button"
                  >
                    {link.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
