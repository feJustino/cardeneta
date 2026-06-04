"use client"

import { useState } from "react"
import Link from "next/link"
import { CustomerWithBalance } from "@/lib/types"
import { formatCurrency } from "@/lib/balance"

interface Props {
  customers: CustomerWithBalance[]
}

export function CustomerListClient({ customers }: Props) {
  const [search, setSearch] = useState("")

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          className="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm shadow-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {filtered.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="flex items-center justify-between py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {customer.name}
              </p>
              <p className="text-sm text-zinc-500">
                {customer.phone || "Sem telefone"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-sm font-semibold ${
                  customer.balance > 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {formatCurrency(customer.balance)}
              </p>
              <p className="text-xs text-zinc-400">
                {customer.balance > 0 ? "em débito" : "quitado"}
              </p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-zinc-500">
            {search ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
          </p>
        )}
      </div>
    </div>
  )
}
