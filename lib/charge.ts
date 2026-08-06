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
 * Valida se o telefone (caso informado) possui uma quantidade válida de dígitos.
 * Aceita números com DDD (10 ou 11 dígitos) ou com DDI 55 (12 ou 13 dígitos).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || !phone.trim()) return true
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return true
  }
  return digits.length === 10 || digits.length === 11
}

/**
 * Formata uma string de telefone no padrão brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length === 0) return ""
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
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

