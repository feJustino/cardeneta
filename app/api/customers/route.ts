import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateBalance } from "@/lib/balance"
import { handleApiError, getSessionOrThrow, ValidationError } from "@/lib/api"

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
