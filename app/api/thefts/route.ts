import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateSubmission, checkRateLimit } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let query = supabase
      .from('petty_thefts')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (dateFrom) {
      query = query.gte('occurred_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('occurred_at', dateTo)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform the data to include proper coordinates
    const transformedData = data?.map(theft => {
      // Parse the PostGIS hex string to get coordinates
      // The hex string is in EWKB format, we need to extract longitude and latitude
      let coordinates = [0, 0]
      
      if (theft.location && typeof theft.location === 'string') {
        // If it's a hex string from PostGIS
        if (theft.location.startsWith('0101000020E6100000')) {
          // This is a Point geometry in EWKB format
          // Extract the coordinates from the hex string
          const hex = theft.location.replace('0101000020E6100000', '')
          if (hex.length >= 32) {
            const lonHex = hex.substring(0, 16)
            const latHex = hex.substring(16, 32)
            
            // Convert hex to float64
            const lonBuffer = Buffer.from(lonHex, 'hex')
            const latBuffer = Buffer.from(latHex, 'hex')
            
            const lon = lonBuffer.readDoubleLE(0)
            const lat = latBuffer.readDoubleLE(0)
            
            coordinates = [lon, lat]
          }
        }
      }

      return {
        ...theft,
        location: {
          type: 'Point',
          coordinates: coordinates
        }
      }
    }) || []

    return NextResponse.json({ data: transformedData })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate submission (now async because it checks IP geolocation)
    const validation = await validateSubmission(body, request)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check rate limit
    const ip = getClientIP(request)
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${rateLimit.retryAfter} seconds.` },
        { status: 429 }
      )
    }

    const { latitude, longitude, item_stolen, description, occurred_at } = body

    // Insert into Supabase
    const { data, error } = await supabase
      .from('petty_thefts')
      .insert({
        location: `POINT(${longitude} ${latitude})`,
        item_stolen,
        description: description || null,
        occurred_at: occurred_at || null
      })
      .select()
      .single()

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) return forwarded.split(',')[0].trim()
  if (realIP) return realIP
  return 'unknown'
}
