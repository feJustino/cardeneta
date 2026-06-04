import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
    include: {
      transactions: { orderBy: { date: "desc" } },
    },
  })

  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  }

  const balance = customer.transactions.reduce((acc, t) => {
    return t.type === "credit" ? acc + Number(t.amount) : acc - Number(t.amount)
  }, 0)

  return NextResponse.json({ ...customer, balance })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await request.json()

  if (!body.name || body.name.trim() === "") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
  }

  const customer = await prisma.customer.update({
    where: { id: Number(id) },
    data: {
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
    },
  })

  return NextResponse.json(customer)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
    include: { transactions: true },
  })

  if (!customer) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  }

  const balance = customer.transactions.reduce((acc, t) => {
    return t.type === "credit" ? acc + Number(t.amount) : acc - Number(t.amount)
  }, 0)

  if (balance > 0) {
    return NextResponse.json(
      { error: "Cliente possui dívida ativa. Quite o saldo antes de excluir." },
      { status: 400 }
    )
  }

  await prisma.customer.delete({ where: { id: Number(id) } })

  return NextResponse.json({ message: "Cliente excluído" })
}
