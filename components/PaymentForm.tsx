"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { CustomerSearch } from "./CustomerSearch"
import { CustomerWithBalance } from "@/lib/types"
import { formatCurrency } from "@/lib/balance"
import { toast } from "sonner"

export function PaymentForm() {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null)
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!customer) return "Selecione um cliente"
    if (!amount || Number(amount) <= 0) return "Informe um valor válido"
    if (Number(amount) > customer.balance) {
      return `Valor (${formatCurrency(Number(amount))}) excede o saldo devedor (${formatCurrency(customer.balance)})`
    }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer!.id,
          amount: Number(amount),
          date: date || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar pagamento")
      }

      toast.success(`Pagamento de ${formatCurrency(Number(amount))} registrado para ${customer!.name}!`)
      router.push(`/customers/${customer!.id}`)
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
          Saldo devedor atual: <strong>{formatCurrency(customer.balance)}</strong>
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
