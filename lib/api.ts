import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

export async function getSessionOrThrow() {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new AuthError()
  }
  return session
}

export class AuthError extends Error {
  constructor() {
    super("Unauthorized")
    this.name = "AuthError"
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class NotFoundError extends Error {
  constructor(resource = "Registro") {
    super(`${resource} não encontrado`)
    this.name = "NotFoundError"
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  console.error("API Error:", error)
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
}
