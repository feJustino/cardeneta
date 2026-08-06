"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { buildChargeMessage, CHARGE_MESSAGE_KEY } from "@/lib/charge"

const PREVIEW_NAME = "Cliente Exemplo"
const PREVIEW_BALANCE = 120.0

interface Props {
  initialMessage: string
}

export function SettingsClient({ initialMessage }: Props) {
  const [message, setMessage] = useState(initialMessage)
  const [saving, setSaving] = useState(false)

  const preview = buildChargeMessage(message, PREVIEW_NAME, PREVIEW_BALANCE)

  async function handleSave() {
    if (!message.trim()) {
      toast.error("A mensagem não pode estar vazia")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: CHARGE_MESSAGE_KEY, value: message }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar")
      }

      toast.success("Mensagem salva com sucesso!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Configurações
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Mensagem de Cobrança</CardTitle>
        </CardHeader>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="charge-message"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Mensagem padrão
            </label>
            <textarea
              id="charge-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Digite a mensagem de cobrança..."
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              Variáveis disponíveis:{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {"{nome}"}
              </code>{" "}
              e{" "}
              <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {"{valor}"}
              </code>
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Preview
            </p>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
              {preview || (
                <span className="italic text-zinc-400">
                  Digite uma mensagem para ver o preview
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Preview com: nome = &quot;{PREVIEW_NAME}&quot;, valor = R$ {PREVIEW_BALANCE.toFixed(2)}
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} isLoading={saving}>
              Salvar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
