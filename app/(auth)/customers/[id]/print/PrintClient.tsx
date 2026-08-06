"use client"

import { useEffect } from "react"
import { formatCurrency } from "@/lib/balance"
import { TRANSACTION_TYPE } from "@/lib/constants"
import { formatDateBR } from "@/lib/date"

interface TransactionItem {
  id: number
  type: string
  description: string | null
  amount: number
  date: string
}

interface Props {
  customer: {
    id: number
    name: string
    phone: string | null
    currentBalance: number
  }
  startDate: string
  endDate: string
  transactions: TransactionItem[]
  periodCredits: number
  periodPayments: number
}

export function PrintClient({
  customer,
  startDate,
  endDate,
  transactions,
  periodCredits,
  periodPayments,
}: Props) {
  useEffect(() => {
    // Aciona a janela de impressão automaticamente ao carregar
    const timer = setTimeout(() => {
      window.print()
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 text-zinc-900 print:p-0 print:max-w-full print:text-black">
      {/* Botões de Ação (Ocultados ao imprimir) */}
      <div className="mb-6 flex items-center justify-between border-b pb-4 print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800">
            Visualização de Impressão / Salvar PDF
          </h2>
          <p className="text-xs text-zinc-500">
            Use o botão abaixo para imprimir ou salvar como PDF no seu navegador.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Imprimir / Salvar PDF
          </button>
          <button
            onClick={() => window.close()}
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Cabeçalho do Extrato */}
      <div className="border-b border-zinc-300 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-700">Empório Justino</h1>
            <p className="text-sm text-zinc-500">Extrato de Conta Pendente (Fiado)</p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p>Data de Emissão: {formatDateBR(new Date())}</p>
          </div>
        </div>
      </div>

      {/* Dados do Cliente e Período */}
      <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-zinc-50 p-4 border border-zinc-200 print:bg-transparent print:border-zinc-300">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Cliente
          </p>
          <p className="text-base font-bold text-zinc-900">{customer.name}</p>
          {customer.phone && (
            <p className="text-sm text-zinc-600">Tel: {customer.phone}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Período Filtrado
          </p>
          <p className="text-sm font-semibold text-zinc-800">
            {formatDateBR(startDate)} até {formatDateBR(endDate)}
          </p>
        </div>
      </div>

      {/* Resumo do Período */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/50 print:bg-transparent">
          <p className="text-xs text-zinc-500">Compras no Período</p>
          <p className="mt-1 text-lg font-bold text-red-600">
            {formatCurrency(periodCredits)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/50 print:bg-transparent">
          <p className="text-xs text-zinc-500">Pagamentos no Período</p>
          <p className="mt-1 text-lg font-bold text-green-600">
            {formatCurrency(periodPayments)}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-3 bg-zinc-50/50 print:bg-transparent">
          <p className="text-xs text-zinc-500">Saldo Devedor Atual</p>
          <p
            className={`mt-1 text-lg font-bold ${
              customer.currentBalance > 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {formatCurrency(customer.currentBalance)}
          </p>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="mt-6">
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-zinc-700">
          Detalhamento de Transações
        </h3>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500 border rounded-lg border-dashed">
            Nenhuma transação registrada neste período.
          </p>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-zinc-300 bg-zinc-100 text-xs font-semibold text-zinc-700 uppercase print:bg-zinc-200">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Descrição</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {transactions.map((t) => {
                const isCredit = t.type === TRANSACTION_TYPE.CREDIT
                return (
                  <tr key={t.id} className="hover:bg-zinc-50">
                    <td className="py-2 px-3 whitespace-nowrap">
                      {formatDateBR(t.date)}
                    </td>
                    <td className="py-2 px-3">
                      {t.description || (isCredit ? "Compra no fiado" : "Pagamento")}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap font-medium">
                      <span
                        className={isCredit ? "text-red-600" : "text-green-600"}
                      >
                        {isCredit ? "Compra (+)" : "Pagamento (-)"}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-semibold whitespace-nowrap ${
                        isCredit ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {isCredit ? "+" : "-"} {formatCurrency(t.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Rodapé */}
      <div className="mt-8 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400">
        <p>Empório Justino — Sistema de Controle de Contas Pendentes</p>
      </div>
    </div>
  )
}
