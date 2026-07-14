import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for rate limiting (resets on deployment)
const submissionLog: Map<string, number[]> = new Map()

const RATE_LIMIT_WINDOW = 10 * 60 * 1000 // 10 minutes
const MAX_SUBMISSIONS = 1 // Max 1 submission per window

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  if (cfIP) return cfIP
  return 'unknown'
}

function isWithinSingapore(lat: number, lng: number): boolean {
  return lat >= 1.20 && lat <= 1.48 && lng >= 103.60 && lng <= 104.05
}

// Cache for IP geolocation (avoid repeated API calls)
const geoCache: Map<string, { country: string; timestamp: number }> = new Map()
const GEO_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

async function isIPInSingapore(ip: string): Promise<boolean> {
  // Skip check for localhost/unknown (development)
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return true
  }

  // Check cache
  const cached = geoCache.get(ip)
  if (cached && (Date.now() - cached.timestamp) < GEO_CACHE_DURATION) {
    return cached.country === 'SG'
  }

  try {
    // Use free IP geolocation API
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    const data = await response.json()
    
    const country = data.country_code || 'Unknown'
    geoCache.set(ip, { country, timestamp: Date.now() })
    
    return country === 'SG'
  } catch (error) {
    console.error('Geolocation check failed:', error)
    // If geolocation fails, allow submission (fail open)
    return true
  }
}

export async function validateSubmission(body: any, request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  const { latitude, longitude, item_stolen, category } = body

  // Check required fields
  if (!latitude || !longitude || !item_stolen || !category) {
    return { valid: false, error: 'Missing required fields' }
  }

  // Validate location is in Singapore
  if (!isWithinSingapore(latitude, longitude)) {
    return { valid: false, error: 'Location must be within Singapore' }
  }

  // Check for spam patterns
  if (/(.)\1{10,}/.test(item_stolen)) {
    return { valid: false, error: 'Invalid input detected' }
  }

  // Validate item_stolen length
  if (item_stolen.length < 2 || item_stolen.length > 200) {
    return { valid: false, error: 'Item description must be 2-200 characters' }
  }

  // Check if user is in Singapore based on IP
  const ip = getClientIP(request)
  const isInSG = await isIPInSingapore(ip)
  if (!isInSG) {
    return { valid: false, error: 'Submissions are only allowed from Singapore' }
  }

  return { valid: true }
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const submissions = submissionLog.get(ip) || []
  const recentSubmissions = submissions.filter(time => now - time < RATE_LIMIT_WINDOW)

  if (recentSubmissions.length >= MAX_SUBMISSIONS) {
    const oldestSubmission = recentSubmissions[0]
    const retryAfter = Math.ceil((oldestSubmission + RATE_LIMIT_WINDOW - now) / 1000)
    return { allowed: false, retryAfter }
  }

  recentSubmissions.push(now)
  submissionLog.set(ip, recentSubmissions)

  return { allowed: true }
}
