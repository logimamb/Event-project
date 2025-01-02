import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { customAlphabet } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('default', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(date))
}

export function generateToken(length: number = 32) {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', length)
  return nanoid()
}

export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return ''
  
  try {
    const d = date instanceof Date ? date : new Date(date)
    if (isNaN(d.getTime())) return 'Invalid date'
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export function formatDateLong(date: Date | string | null | undefined) {
  if (!date) return ''
  
  // Ensure we have a valid date
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(parsedDate)
}

export function formatTime(date: Date | string | null | undefined) {
  if (!date) return ''
  
  // Ensure we have a valid date
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(parsedDate)
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return ''
  
  // Ensure we have a valid date
  const parsedDate = new Date(date)
  if (isNaN(parsedDate.getTime())) return ''

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(parsedDate)
}

export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

export function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null
  
  try {
    const d = date instanceof Date ? date : new Date(date)
    return isValidDate(d) ? d : null
  } catch {
    return null
  }
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

export const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`

export const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

export function generateShareableUrl(type: 'event' | 'activity', id: string, shareableSlug?: string | null): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const identifier = shareableSlug || id;
  const plural = type === 'activity' ? 'activities' : `${type}s`;
  return `${baseUrl}/${plural}/${identifier}/share`;
}
