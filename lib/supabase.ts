import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type Flyer = {
  id: string
  week_start: string
  week_end: string
  image_url: string
  created_at: string
}

export type Product = {
  id: string
  flyer_id: string
  name: string
  original_price: number | null
  sale_price: number
  discount_rate: number | null
  category: string | null
  image_url: string | null
  created_at: string
  // New fields for enhanced flyer data
  special_price?: number | null
  special_discount_text?: string | null
  unit?: string | null
}
