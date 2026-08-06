import { formatCurrency } from "@/lib/balance"

export const DEFAULT_CHARGE_MESSAGE =
  "Olá, {nome}! Você possui um saldo pendente de {valor} no Empório Justino. Por favor, entre em contato para regularizar. Obrigado!"

export const CHARGE_MESSAGE_KEY = "charge_message"

/**
 * Substitui as variáveis {nome} e {valor} na mensagem template.
 */
export function buildChargeMessage(
  template: string,
  name: string,
  balance: number
): string {
  return template
    .replace(/\{nome\}/g, name)
    .replace(/\{valor\}/g, formatCurrency(balance))
}

/**
 * Remove caracteres não-numéricos e adiciona DDI 55 (Brasil) se ausente.
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.startsWith("55") ? digits : `55${digits}`
}

/**
 * Monta o link wa.me com a mensagem codificada.
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`
}
