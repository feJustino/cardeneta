/**
 * Retorna a data no formato YYYY-MM-DD.
 */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Retorna a data de 3 meses atrás no formato YYYY-MM-DD.
 */
export function getDefaultStartDate(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return formatDateInput(d)
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD.
 */
export function getDefaultEndDate(): string {
  return formatDateInput(new Date())
}

/**
 * Valida se o intervalo de datas é válido e não excede o limite máximo de 3 meses.
 */
export function validateDateRange(startDateStr: string, endDateStr: string): string | null {
  if (!startDateStr || !endDateStr) {
    return "Informe as datas de início e fim."
  }

  const start = new Date(startDateStr + "T00:00:00")
  const end = new Date(endDateStr + "T23:59:59")

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "Data inválida."
  }

  if (start > end) {
    return "A data inicial não pode ser posterior à data final."
  }

  const maxEnd = new Date(start)
  maxEnd.setMonth(maxEnd.getMonth() + 3)
  maxEnd.setDate(maxEnd.getDate() + 1)

  if (end > maxEnd) {
    return "O período máximo permitido para o relatório é de 3 meses."
  }

  return null
}

/**
 * Formata data ISO para string legível pt-BR (DD/MM/YYYY).
 */
export function formatDateBR(dateStr: string | Date): string {
  const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr
  return d.toLocaleDateString("pt-BR")
}
