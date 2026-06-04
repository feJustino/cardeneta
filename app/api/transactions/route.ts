import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { TRANSACTION_TYPE, DEFAULT_DESCRIPTION } from "@/lib/constants"
import {
  handleApiError,
  getSessionOrThrow,
  ValidationError,
  NotFoundError,
} from "@/lib/api"

export async function POST(request: Request) {
  try {
    await getSessionOrThrow()

    const body = await request.json()

    if (!body.customerId || !body.amount || Number(body.amount) <= 0) {
      throw new ValidationError("Cliente e valor válido são obrigatórios")
    }

    const customer = await prisma.customer.findUnique({
      where: { id: Number(body.customerId) },
    })

    if (!customer) throw new NotFoundError("Cliente")

    const transaction = await prisma.transaction.create({
      data: {
        customerId: Number(body.customerId),
        type: TRANSACTION_TYPE.CREDIT,
        amount: Number(body.amount),
        description: body.description?.trim() || DEFAULT_DESCRIPTION,
        date: body.date ? new Date(body.date) : new Date(),
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
