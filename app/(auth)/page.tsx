import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateBalance, formatCurrency } from "@/lib/balance"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  const customers = await prisma.customer.findMany({
    include: {
      transactions: {
        select: { amount: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const customersWithBalance = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    createdAt: c.createdAt.toISOString(),
    balance: calculateBalance(c.transactions),
  }))

  const totalDebt = customersWithBalance.reduce(
    (acc, c) => acc + Math.max(0, c.balance),
    0
  )

  const activeDebtors = customersWithBalance.filter((c) => c.balance > 0).length
  const totalCustomers = customers.length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Olá, {session?.user?.name}
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>Total a Receber</CardTitle>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(totalDebt)}
          </p>
        </Card>
        <Card>
          <CardTitle>Clientes com Dívida</CardTitle>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {activeDebtors}
          </p>
        </Card>
        <Card>
          <CardTitle>Total de Clientes</CardTitle>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {totalCustomers}
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Recentes</CardTitle>
        </CardHeader>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {customersWithBalance.slice(0, 10).map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="flex items-center justify-between py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {customer.name}
                </p>
                {customer.phone && (
                  <p className="text-sm text-zinc-500">{customer.phone}</p>
                )}
              </div>
              <span
                className={`text-sm font-semibold ${
                  customer.balance > 0
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {formatCurrency(customer.balance)}
              </span>
            </Link>
          ))}
          {customersWithBalance.length === 0 && (
            <p className="py-6 text-center text-sm text-zinc-500">
              Nenhum cliente cadastrado ainda.{" "}
              <Link href="/customers/new" className="text-emerald-600 hover:underline">
                Cadastrar primeiro cliente
              </Link>
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
