import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  if (!body.customerId || !body.amount || Number(body.amount) <= 0) {
    return NextResponse.json(
      { error: "Cliente e valor válido são obrigatórios" },
      { status: 400 }
    )
  }

  const customer = await prisma.customer.findUnique({
    where: { id: Number(body.customerId) },
    include: {
      transactions: {
        select: { amount: true, type: true },
      },
    },
  })

  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  }

  const currentBalance = customer.transactions.reduce((acc, t) => {
    return t.type === "credit" ? acc + Number(t.amount) : acc - Number(t.amount)
  }, 0)

  if (Number(body.amount) > currentBalance) {
    return NextResponse.json(
      {
        error: `Valor do pagamento (R$ ${Number(body.amount).toFixed(2)}) excede o saldo devedor (R$ ${currentBalance.toFixed(2)})`,
      },
      { status: 400 }
    )
  }

  const payment = await prisma.transaction.create({
    data: {
      customerId: Number(body.customerId),
      type: "payment",
      amount: Number(body.amount),
      description: "Pagamento",
      date: body.date ? new Date(body.date) : new Date(),
    },
  })

  return NextResponse.json(payment, { status: 201 })
}
