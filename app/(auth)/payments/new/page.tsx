import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { PaymentForm } from "@/components/PaymentForm"

export default function NewPaymentPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Novo Pagamento
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Registrar Pagamento</CardTitle>
        </CardHeader>
        <PaymentForm />
      </Card>
    </div>
  )
}
