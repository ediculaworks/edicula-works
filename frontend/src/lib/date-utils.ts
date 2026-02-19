import { 
  format, 
  formatISO, 
  parseISO, 
  isValid, 
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays 
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const TIMEZONE = 'America/Sao_Paulo'

export const Formats = {
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  ISO_DATE: 'yyyy-MM-dd',
  DATETIME_BR: "dd/MM/yyyy 'às' HH:mm:ss",
  DATE_BR: 'dd/MM/yyyy',
  TIME_BR: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
} as const

export function parseISODate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null
  const date = parseISO(dateString)
  return isValid(date) ? date : null
}

export function formatBR(date: Date | string | null | undefined, formatStr: string = Formats.DATETIME_BR): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return ''
  return format(dateObj, formatStr, { locale: ptBR })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatBR(date, Formats.DATETIME_BR)
}

export function formatDate(date: Date | string | null | undefined): string {
  return formatBR(date, Formats.DATE_BR)
}

export function formatTime(date: Date | string | null | undefined): string {
  return formatBR(date, Formats.TIME_BR)
}

export function toISOString(date: Date | string | null | undefined): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return ''
  return formatISO(dateObj)
}

export function now(): Date {
  return new Date()
}

export function diffDays(date1: Date, date2: Date): number {
  return differenceInDays(date1, date2)
}

export function diffHours(date1: Date, date2: Date): number {
  return differenceInHours(date1, date2)
}

export function diffMinutes(date1: Date, date2: Date): number {
  return differenceInMinutes(date1, date2)
}

export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days)
}

export function isOverdue(date: Date | string | null | undefined): boolean {
  if (!date) return false
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return false
  return dateObj < new Date()
}

export function formatRelative(date: Date | string | null | undefined): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!dateObj) return ''
  
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
  if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`
  
  return formatBR(dateObj, Formats.DATE_BR)
}
