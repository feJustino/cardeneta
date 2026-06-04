"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/balance"
import { TRANSACTION_TYPE } from "@/lib/constants"
import { CustomerDetail, TransactionData } from "@/lib/types"
import { toast } from "sonner"

interface Props {
  customer: CustomerDetail
}

function getTransactionLabel(type: string): string {
  return type === TRANSACTION_TYPE.CREDIT ? "Compra no fiado" : "Pagamento"
}

function getTransactionSign(type: string): string {
  return type === TRANSACTION_TYPE.CREDIT ? "+" : "-"
}

function getTransactionColor(type: string): string {
  return type === TRANSACTION_TYPE.CREDIT ? "text-red-500" : "text-green-500"
}

export function CustomerDetailClient({ customer }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Tem certeza que deseja excluir "${customer.name}"?`)) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir")
      }

      toast.success("Cliente excluído!")
      router.push("/customers")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao excluir")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {customer.name}
          </h1>
          {customer.phone && (
            <p className="text-sm text-zinc-500">{customer.phone}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/customers/${customer.id}/edit`}>
            <Button variant="secondary">Editar</Button>
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleting}
          >
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>Saldo Atual</CardTitle>
          <p
            className={`mt-2 text-3xl font-bold ${
              customer.balance > 0
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {formatCurrency(customer.balance)}
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {customer.balance > 0
              ? "Cliente com débito pendente"
              : "Cliente com saldo quitado"}
          </p>
        </Card>
        <Card>
          <CardTitle>Cliente desde</CardTitle>
          <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {new Date(customer.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {customer.transactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              Nenhuma transação registrada.
            </p>
          ) : (
            customer.transactions.map((t: TransactionData) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {t.description || getTransactionLabel(t.type)}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(t.date).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${getTransactionColor(t.type)}`}>
                  {getTransactionSign(t.type)} {formatCurrency(t.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="flex gap-3">
        <Link href="/transactions/new">
          <Button>Nova Compra</Button>
        </Link>
        <Link href="/payments/new">
          <Button variant="secondary">Novo Pagamento</Button>
        </Link>
      </div>
    </div>
  )
}
