import { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "" }: CardProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = "" }: CardProps) {
  return (
    <h2 className={`text-lg font-semibold text-zinc-900 dark:text-zinc-100 ${className}`}>
      {children}
    </h2>
  )
}
