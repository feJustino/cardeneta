import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { CustomerForm } from "@/components/CustomerForm"

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Novo Cliente
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CustomerForm />
      </Card>
    </div>
  )
}
