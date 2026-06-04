import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateBalance, formatCurrency } from "@/lib/balance"
import { TRANSACTION_TYPE, PAYMENT_DESCRIPTION } from "@/lib/constants"
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
      include: {
        transactions: {
          select: { amount: true, type: true },
        },
      },
    })

    if (!customer) throw new NotFoundError("Cliente")

    const currentBalance = calculateBalance(customer.transactions)
    const paymentAmount = Number(body.amount)

    if (paymentAmount > currentBalance) {
      return NextResponse.json(
        {
          error: `Valor do pagamento (${formatCurrency(paymentAmount)}) excede o saldo devedor (${formatCurrency(currentBalance)})`,
        },
        { status: 400 }
      )
    }

    const payment = await prisma.transaction.create({
      data: {
        customerId: Number(body.customerId),
        type: TRANSACTION_TYPE.PAYMENT,
        amount: paymentAmount,
        description: PAYMENT_DESCRIPTION,
        date: body.date ? new Date(body.date) : new Date(),
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
