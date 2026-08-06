import { prisma } from "@/lib/prisma"
import { calculateBalance } from "@/lib/balance"
import { notFound } from "next/navigation"
import { PrintClient } from "./PrintClient"
import { TRANSACTION_TYPE } from "@/lib/constants"
import { validateDateRange, getDefaultStartDate, getDefaultEndDate } from "@/lib/date"

export const dynamic = "force-dynamic"

export default async function PrintCustomerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}) {
  const { id } = await params
  const { startDate: reqStartDate, endDate: reqEndDate } = await searchParams

  const startDate = reqStartDate || getDefaultStartDate()
  const endDate = reqEndDate || getDefaultEndDate()

  const validationError = validateDateRange(startDate, endDate)
  if (validationError) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <h1 className="text-xl font-bold text-red-600">Período inválido</h1>
        <p className="mt-2 text-zinc-600">{validationError}</p>
      </div>
    )
  }

  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
    include: {
      transactions: {
        where: {
          date: {
            gte: new Date(startDate + "T00:00:00"),
            lte: new Date(endDate + "T23:59:59"),
          },
        },
        orderBy: { date: "asc" },
      },
    },
  })

  if (!customer) {
    notFound()
  }

  // Buscar todas as transações para calcular o saldo total acumulado do cliente
  const allTransactions = await prisma.transaction.findMany({
    where: { customerId: customer.id },
    select: { amount: true, type: true },
  })

  const currentBalance = calculateBalance(allTransactions)

  const filteredTransactions = customer.transactions.map((t) => ({
    id: t.id,
    type: t.type,
    description: t.description,
    amount: Number(t.amount),
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }))

  const periodCredits = filteredTransactions
    .filter((t) => t.type === TRANSACTION_TYPE.CREDIT)
    .reduce((acc, t) => acc + t.amount, 0)

  const periodPayments = filteredTransactions
    .filter((t) => t.type === TRANSACTION_TYPE.PAYMENT)
    .reduce((acc, t) => acc + t.amount, 0)

  return (
    <PrintClient
      customer={{
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        currentBalance,
      }}
      startDate={startDate}
      endDate={endDate}
      transactions={filteredTransactions}
      periodCredits={periodCredits}
      periodPayments={periodPayments}
    />
  )
}
