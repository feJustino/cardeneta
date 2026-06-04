/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CustomerDetailClient } from "./CustomerDetailClient"

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

  const balance = customer.transactions.reduce((acc: number, t: { type: string; amount: any }) => {
    return t.type === "credit" ? acc + Number(t.amount) : acc - Number(t.amount)
  }, 0)

  const initialData = {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    balance,
    createdAt: customer.createdAt.toISOString(),
    transactions: customer.transactions.map((t: { id: number; type: string; description: string | null; amount: any; date: { toISOString: () => any }; createdAt: { toISOString: () => any } }) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      createdAt: t.createdAt.toISOString(),
    })),
  }

  return <CustomerDetailClient customer={initialData} />
}
