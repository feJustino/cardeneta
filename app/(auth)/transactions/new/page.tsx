import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { TransactionForm } from "@/components/TransactionForm"

export default function NewTransactionPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Nova Compra no Fiado
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Registrar Compra</CardTitle>
        </CardHeader>
        <TransactionForm />
      </Card>
    </div>
  )
}
