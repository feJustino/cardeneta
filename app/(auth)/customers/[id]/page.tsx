import { prisma } from "@/lib/prisma"
import { calculateBalance } from "@/lib/balance"
import { notFound } from "next/navigation"
import { CustomerDetailClient } from "./CustomerDetailClient"
import { TransactionData, TransactionType } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
    include: {
      transactions: { orderBy: { date: "desc" } },
    },
  })

  if (!customer) {
    notFound()
  }

  const transactions: TransactionData[] = customer.transactions.map((t) => ({
    id: t.id,
    type: t.type as TransactionType,
    description: t.description,
    amount: Number(t.amount),
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }))

  const initialData = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    createdAt: customer.createdAt.toISOString(),
    balance: calculateBalance(customer.transactions),
    transactions,
  }

  return <CustomerDetailClient customer={initialData} />
}
