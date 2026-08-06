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
import {
  buildChargeMessage,
  buildWhatsAppUrl,
  DEFAULT_CHARGE_MESSAGE,
  CHARGE_MESSAGE_KEY,
} from "@/lib/charge"
import {
  getDefaultStartDate,
  getDefaultEndDate,
  validateDateRange,
} from "@/lib/date"

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
  const [sending, setSending] = useState(false)

  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(getDefaultEndDate())

  const dateError = validateDateRange(startDate, endDate)

  const hasPhone = Boolean(customer.phone)
  const hasDebt = customer.balance > 0

  const filteredTransactions = customer.transactions.filter((t) => {
    if (dateError) return true
    const tDate = t.date.slice(0, 10)
    return tDate >= startDate && tDate <= endDate
  })

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

  async function handleSendCharge() {
    if (!hasPhone) return
    setSending(true)
    try {
      const res = await fetch(`/api/settings?key=${CHARGE_MESSAGE_KEY}`)
      const { value } = await res.json()
      const template = value || DEFAULT_CHARGE_MESSAGE
      const message = buildChargeMessage(template, customer.name, customer.balance)
      const url = buildWhatsAppUrl(customer.phone!, message)
      window.open(url, "_blank")
    } catch {
      toast.error("Erro ao preparar mensagem de cobrança")
    } finally {
      setSending(false)
    }
  }

  function handlePrint() {
    const err = validateDateRange(startDate, endDate)
    if (err) {
      toast.error(err)
      return
    }
    window.open(
      `/customers/${customer.id}/print?startDate=${startDate}&endDate=${endDate}`,
      "_blank"
    )
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
          {hasDebt && (
            <Button
              variant="secondary"
              onClick={handleSendCharge}
              isLoading={sending}
              disabled={!hasPhone}
              title={!hasPhone ? "Cadastre um telefone para enviar cobrança" : undefined}
            >
              Enviar cobrança
            </Button>
          )}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Histórico de Transações</CardTitle>
            <Button
              variant="secondary"
              onClick={handlePrint}
              disabled={Boolean(dateError)}
            >
              Imprimir PDF
            </Button>
          </div>
        </CardHeader>

        <div className="mb-4 rounded-lg bg-zinc-50 p-3.5 dark:bg-zinc-800/50">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
          {dateError ? (
            <p className="mt-2 text-xs font-medium text-red-500">
              {dateError}
            </p>
          ) : (
            <p className="mt-2 text-xs text-zinc-400">
              Período de filtro máximo de 3 meses para a geração do relatório em PDF.
            </p>
          )}
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredTransactions.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-500">
              Nenhuma transação registrada no período selecionado.
            </p>
          ) : (
            filteredTransactions.map((t: TransactionData) => (
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

