import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { CustomerForm } from "@/components/CustomerForm"

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id: Number(id) },
  })

  if (!customer) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Editar Cliente
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CustomerForm
          initialData={{ name: customer.name, phone: customer.phone }}
          customerId={customer.id}
        />
      </Card>
    </div>
  )
}
