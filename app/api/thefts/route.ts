import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateSubmission, checkRateLimit } from '@/lib/security'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let query = supabase
      .from('petty_thefts')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
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

    return NextResponse.json({ data })
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

    const { latitude, longitude, item_stolen, category, description, occurred_at } = body

    // Insert into Supabase (handle missing category column gracefully)
    const insertData: any = {
      location: `POINT(${longitude} ${latitude})`,
      item_stolen,
      description: description || null,
      occurred_at: occurred_at || null
    }
    
    // Only add category if provided (for backward compatibility)
    if (category) {
      insertData.category = category
    }

    const { data, error } = await supabase
      .from('petty_thefts')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      // If error is about missing column, try without category
      if (error.message.includes('column') && error.message.includes('category')) {
        delete insertData.category
        const { data: retryData, error: retryError } = await supabase
          .from('petty_thefts')
          .insert(insertData)
          .select()
          .single()
        
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 })
        }
        return NextResponse.json({ data: retryData }, { status: 201 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

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
