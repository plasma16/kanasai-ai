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
      let coordinates = [0, 0]
      
      if (theft.location && typeof theft.location === 'string') {
        if (theft.location.startsWith('0101000020E6100000')) {
          const hex = theft.location.replace('0101000020E6100000', '')
          if (hex.length >= 32) {
            const lonHex = hex.substring(0, 16)
            const latHex = hex.substring(16, 32)
            
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
    
    // Validate submission (checks IP geolocation)
    const validation = await validateSubmission(body, request)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get user's IP address for moderation
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'

    const { latitude, longitude, item_stolen, description, occurred_at, occurred_time } = body

    // Validate required fields
    if (!latitude || !longitude || !item_stolen) {
      return NextResponse.json(
        { error: 'Missing required fields: latitude, longitude, item_stolen' },
        { status: 400 }
      )
    }

    // Insert into Supabase with IP address
    const { data, error } = await supabase
      .from('petty_thefts')
      .insert({
        location: `POINT(${longitude} ${latitude})`,
        item_stolen,
        description: description || null,
        occurred_at: occurred_at || null,
        occurred_time: occurred_time || null,
        ip_address: ipAddress
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
