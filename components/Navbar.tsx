"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/customers", label: "Clientes" },
  { href: "/transactions/new", label: "Nova Compra" },
  { href: "/payments/new", label: "Novo Pagamento" },
  { href: "/settings", label: "Configurações" },
] as const

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  const base = "rounded-lg px-3 py-2 text-sm font-medium transition-colors"
  const activeClass = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
  const inactiveClass = "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"

  return (
    <Link
      href={href}
      className={`${base} ${isActive ? activeClass : inactiveClass}`}
    >
      {label}
    </Link>
  )
}

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-emerald-600">
          Empório Justino
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={pathname === link.href}
            />
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-500 sm:block">
            {session.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            Sair
          </button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto px-4 pb-3 sm:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.href}
            href={link.href}
            label={link.label}
            isActive={pathname === link.href}
          />
        ))}
      </div>
    </nav>
  )
}
