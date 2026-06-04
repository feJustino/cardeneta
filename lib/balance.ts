import { TRANSACTION_TYPE } from "./constants"

interface TransactionSummary {
  type: string
  amount: number | { toNumber?: () => number }
}

function normalizeAmount(amount: unknown): number {
  if (typeof amount === "number") return amount
  if (amount && typeof amount === "object" && "toNumber" in (amount as object)) {
    return (amount as { toNumber: () => number }).toNumber()
  }
  return Number(amount)
}

export function calculateBalance(transactions: TransactionSummary[]): number {
  return transactions.reduce((acc, t) => {
    const amount = normalizeAmount(t.amount)
    return t.type === TRANSACTION_TYPE.CREDIT ? acc + amount : acc - amount
  }, 0)
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2)}`
}
