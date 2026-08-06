"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "./ui/Input"
import { Button } from "./ui/Button"
import { toast } from "sonner"
import { isValidPhone, formatPhone } from "@/lib/charge"

interface CustomerFormProps {
  initialData?: { name: string; phone: string | null }
  customerId?: number
}

export function CustomerForm({ initialData, customerId }: CustomerFormProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData?.name || "")
  const [phone, setPhone] = useState(initialData?.phone ? formatPhone(initialData.phone) : "")
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState("")
  const [phoneError, setPhoneError] = useState("")

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    if (phoneError) setPhoneError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNameError("")
    setPhoneError("")

    let hasError = false

    if (!name.trim()) {
      setNameError("O nome é obrigatório")
      hasError = true
    }

    if (phone.trim() && !isValidPhone(phone)) {
      setPhoneError("Telefone inválido. Digite o DDD + número (10 ou 11 dígitos)")
      hasError = true
    }

    if (hasError) return

    setLoading(true)

    try {
      const url = customerId ? `/api/customers/${customerId}` : "/api/customers"
      const method = customerId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao salvar")
      }

      toast.success(customerId ? "Cliente atualizado!" : "Cliente cadastrado!")
      router.push("/customers")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nome completo"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (nameError) setNameError("")
        }}
        placeholder="Ex: José da Silva"
        error={nameError}
        required
      />
      <Input
        label="Telefone (opcional)"
        value={phone}
        onChange={handlePhoneChange}
        placeholder="Ex: (11) 99999-9999"
        type="tel"
        error={phoneError}
      />
      <div className="flex gap-3">
        <Button type="submit" isLoading={loading}>
          {customerId ? "Atualizar" : "Cadastrar"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

