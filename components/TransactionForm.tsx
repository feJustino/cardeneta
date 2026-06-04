"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { CustomerSearch } from "./CustomerSearch"
import { CustomerWithBalance } from "@/lib/types"
import { formatCurrency } from "@/lib/balance"
import { toast } from "sonner"

export function TransactionForm() {
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerWithBalance | null>(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  function validate(): string | null {
    if (!customer) return "Selecione um cliente"
    if (!amount || Number(amount) <= 0) return "Informe um valor válido"
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
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer!.id,
          amount: Number(amount),
          description: description.trim() || undefined,
          date: date || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao registrar compra")
      }

      toast.success(`Compra de ${formatCurrency(Number(amount))} registrada para ${customer!.name}!`)
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

      <Input
        label="Valor da compra (R$)"
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Ex: 50,00"
        required
      />

      <Input
        label="Data da compra"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <Input
        label="Descrição (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ex: Compras diversas"
      />

      <div className="flex gap-3">
        <Button type="submit" isLoading={loading}>
          Registrar Compra
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
