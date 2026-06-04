import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
    ...c,
    balance: c.transactions.reduce((acc, t) => {
      return t.type === "credit" ? acc + Number(t.amount) : acc - Number(t.amount)
    }, 0),
  }))

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()

  if (!body.name || body.name.trim() === "") {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
  }

  const customer = await prisma.customer.create({
    data: {
      name: body.name.trim(),
      phone: body.phone?.trim() || null,
    },
  })

  return NextResponse.json(customer, { status: 201 })
}
