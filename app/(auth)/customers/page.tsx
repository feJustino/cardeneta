import { prisma } from "@/lib/prisma"
import { Card } from "@/components/ui/Card"
import Link from "next/link"
import { CustomerListClient } from "./CustomerListClient"

export const dynamic = "force-dynamic"

export default async function CustomersPage() {

  const customers = await prisma.customer.findMany({
    include: {
      transactions: {
        select: { amount: true, type: true },
      },
    },
    orderBy: { name: "asc" },
  })

  const customersWithBalance = customers.map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    balance: c.transactions.reduce((acc: number, t: { type: string; amount: any }) => {
      return t.type === "credit" ? acc + Number(t.amount) : acc - Number(t.amount)
    }, 0),
    createdAt: c.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Clientes
        </h1>
        <Link
          href="/customers/new"
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
        >
          Novo Cliente
        </Link>
      </div>

      <Card>
        <CustomerListClient customers={customersWithBalance} />
      </Card>
    </div>
  )
}
