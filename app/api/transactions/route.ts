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
  })

  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  }

  const transaction = await prisma.transaction.create({
    data: {
      customerId: Number(body.customerId),
      type: "credit",
      amount: Number(body.amount),
      description: body.description || "Compras diversas",
      date: body.date ? new Date(body.date) : new Date(),
    },
  })

  return NextResponse.json(transaction, { status: 201 })
}
