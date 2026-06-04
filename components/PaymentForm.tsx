"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { CustomerSearch } from "./CustomerSearch"
import { toast } from "sonner"

interface Customer {
  id: number
  name: string
  phone: string | null
  balance: number
}

export function PaymentForm() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!customer) {
      toast.error("Selecione um cliente")
      return
    }

    if (!amount || Number(amount) <= 0) {
      toast.error("Informe um valor válido")
      return
    }

    if (Number(amount) > customer.balance) {
      toast.error(
        `Valor (R$ ${Number(amount).toFixed(2)}) excede o saldo devedor (R$ ${customer.balance.toFixed(2)})`
      )
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          amount: Number(amount),
          date: date || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar pagamento")
      }

      toast.success(`Pagamento de R$ ${Number(amount).toFixed(2)} registrado para ${customer.name}!`)
      router.push(`/customers/${customer.id}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cliente
        </label>
        <CustomerSearch onSelect={setCustomer} placeholder="Buscar cliente..." />
      </div>

      {customer && customer.balance > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          Saldo devedor atual: <strong>R$ {customer.balance.toFixed(2)}</strong>
        </div>
      )}

      <Input
        label="Valor do pagamento (R$)"
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Ex: 50,00"
        required
      />

      <Input
        label="Data do pagamento"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="flex gap-3">
        <Button type="submit" isLoading={loading}>
          Registrar Pagamento
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
