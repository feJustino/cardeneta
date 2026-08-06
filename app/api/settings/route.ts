import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { handleApiError, getSessionOrThrow, ValidationError } from "@/lib/api"

export async function GET(request: Request) {
  try {
    await getSessionOrThrow()

    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) throw new ValidationError("Chave obrigatória")

    const setting = await prisma.setting.findUnique({ where: { key } })

    return NextResponse.json({ value: setting?.value ?? null })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request) {
  try {
    await getSessionOrThrow()

    const body = await request.json()
    const { key, value } = body

    if (!key || !value?.trim()) {
      throw new ValidationError("Chave e valor são obrigatórios")
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: value.trim() },
      create: { key, value: value.trim() },
    })

    return NextResponse.json(setting)
  } catch (error) {
    return handleApiError(error)
  }
}
