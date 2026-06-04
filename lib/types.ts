export type TransactionType = "credit" | "payment"

export interface TransactionData {
  id: number
  type: TransactionType
  amount: number
  description: string | null
  date: string
  createdAt: string
}

export interface CustomerWithBalance {
  id: number
  name: string
  phone: string | null
  balance: number
  createdAt: string
}

export interface CustomerDetail extends CustomerWithBalance {
  transactions: TransactionData[]
}
