import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function formatCrypto(amount: number, currency: string): string {
  if (currency === 'BTC') return `${amount.toFixed(8)} BTC`
  if (currency === 'LTC') return `${amount.toFixed(8)} LTC`
  if (currency === 'DOGE') return `${amount.toFixed(4)} DOGE`
  return `${amount} ${currency}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getXpForNextLevel(level: number): number {
  return level * 100
}

export function calculateLevel(xp: number): number {
  let level = 1
  let xpRequired = 100
  while (xp >= xpRequired) {
    xp -= xpRequired
    level++
    xpRequired = level * 100
  }
  return level
}
