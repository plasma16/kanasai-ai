import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('petty_thefts')
      .select('*')
      .order('created_at', { ascending: false })

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
    const { latitude, longitude, item_stolen, description, occurred_at } = body

    // Validation
    if (!latitude || !longitude || !item_stolen) {
      return NextResponse.json(
        { error: 'Missing required fields: latitude, longitude, item_stolen' },
        { status: 400 }
      )
    }

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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
