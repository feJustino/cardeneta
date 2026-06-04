import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateBalance } from "@/lib/balance"
import {
  handleApiError,
  getSessionOrThrow,
  ValidationError,
  NotFoundError,
} from "@/lib/api"

async function getCustomerOrThrow(id: number) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { transactions: true },
  })
  if (!customer) throw new NotFoundError("Cliente")
  return customer
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getSessionOrThrow()

    const { id } = await params
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        transactions: { orderBy: { date: "desc" } },
      },
    })

    if (!customer) throw new NotFoundError("Cliente")

    return NextResponse.json({
      ...customer,
      balance: calculateBalance(customer.transactions),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getSessionOrThrow()

    const { id } = await params
    const body = await request.json()

    if (!body.name || body.name.trim() === "") {
      throw new ValidationError("Nome é obrigatório")
    }

    const customer = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getSessionOrThrow()

    const { id } = await params
    const customer = await getCustomerOrThrow(Number(id))

    const balance = calculateBalance(customer.transactions)
    if (balance > 0) {
      return NextResponse.json(
        { error: "Cliente possui dívida ativa. Quite o saldo antes de excluir." },
        { status: 400 }
      )
    }

    await prisma.customer.delete({ where: { id: Number(id) } })

    return NextResponse.json({ message: "Cliente excluído" })
  } catch (error) {
    return handleApiError(error)
  }
}
