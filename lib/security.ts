import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for rate limiting (resets on deployment)
// For production, use Upstash Redis or similar
const submissionLog: Map<string, number[]> = new Map()

const RATE_LIMIT_WINDOW = 10 * 60 * 1000 // 10 minutes
const MAX_SUBMISSIONS = 1 // Max 1 submission per window

function getClientIP(request: NextRequest): string {
  // Check various headers for real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (cfIP) return cfIP
  return 'unknown'
}

function isWithinSingapore(lat: number, lng: number): boolean {
  // Singapore bounds (approximate)
  return lat >= 1.20 && lat <= 1.48 && lng >= 103.60 && lng <= 104.05
}

export function validateSubmission(body: any): { valid: boolean; error?: string } {
  const { latitude, longitude, item_stolen, category } = body

  // Check required fields
  if (!latitude || !longitude || !item_stolen || !category) {
    return { valid: false, error: 'Missing required fields' }
  }

  // Validate location is in Singapore
  if (!isWithinSingapore(latitude, longitude)) {
    return { valid: false, error: 'Location must be within Singapore' }
  }

  // Validate item_stolen length
  if (item_stolen.length < 2 || item_stolen.length > 200) {
    return { valid: false, error: 'Item description must be 2-200 characters' }
  }

  // Check for spam patterns (repeated characters, etc.)
  if (/(.)\1{10,}/.test(item_stolen)) {
    return { valid: false, error: 'Invalid input detected' }
  }

  return { valid: true }
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const submissions = submissionLog.get(ip) || []

  // Remove old entries
  const recentSubmissions = submissions.filter(time => now - time < RATE_LIMIT_WINDOW)

  if (recentSubmissions.length >= MAX_SUBMISSIONS) {
    const oldestSubmission = recentSubmissions[0]
    const retryAfter = Math.ceil((oldestSubmission + RATE_LIMIT_WINDOW - now) / 1000)
    return { allowed: false, retryAfter }
  }

  // Log this submission
  recentSubmissions.push(now)
  submissionLog.set(ip, recentSubmissions)

  return { allowed: true }
}
