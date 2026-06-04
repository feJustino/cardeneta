"use client"

import { useState, useEffect, useRef } from "react"

interface Customer {
  id: number
  name: string
  phone: string | null
  balance: number
}

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void
  placeholder?: string
}

export function CustomerSearch({ onSelect, placeholder = "Buscar cliente..." }: CustomerSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Customer[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Customer | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 1) return
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/customers?search=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data)
      setOpen(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(customer: Customer) {
    setSelected(customer)
    setQuery(customer.name)
    setOpen(false)
    onSelect(customer)
  }

  function handleClear() {
    setSelected(null)
    setQuery("")
    setResults([])
  }

  return (
    <div ref={ref} className="relative">
      {selected ? (
        <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 dark:border-emerald-700 dark:bg-emerald-950">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {selected.name}
            </p>
            <p className="text-xs text-zinc-500">
              Saldo: R$ {selected.balance.toFixed(2)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>
      ) : (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="block w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm shadow-sm placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      )}

      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {results.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => handleSelect(customer)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {customer.name}
              </span>
              <span
                className={`text-xs font-medium ${
                  customer.balance > 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                R$ {customer.balance.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
