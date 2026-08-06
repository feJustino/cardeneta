import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateBalance } from "@/lib/balance"
import { handleApiError, getSessionOrThrow, ValidationError } from "@/lib/api"
import { isValidPhone } from "@/lib/charge"

export async function GET(request: Request) {
  try {
    await getSessionOrThrow()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    const customers = await prisma.customer.findMany({
      where: {
        name: { contains: search, mode: "insensitive" },
      },
      include: {
        transactions: {
          select: { amount: true, type: true },
        },
      },
      orderBy: { name: "asc" },
    })

    const data = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      createdAt: c.createdAt,
      balance: calculateBalance(c.transactions),
    }))

    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await getSessionOrThrow()

    const body = await request.json()

    if (!body.name || body.name.trim() === "") {
      throw new ValidationError("Nome é obrigatório")
    }

    if (body.phone && body.phone.trim() !== "" && !isValidPhone(body.phone)) {
      throw new ValidationError("Telefone inválido. Deve conter DDD + número (10 ou 11 dígitos)")
    }

    const customer = await prisma.customer.create({
      data: {
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
