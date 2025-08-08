import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Enhanced security configuration for client-side
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'san-pedro-beach-resort'
    }
  }
})

// Server-side client for admin operations (more secure)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for server operations')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (will be generated from Supabase)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'employee' | 'manager' | 'guest'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          phone?: string | null
          role: 'admin' | 'employee' | 'manager' | 'guest'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'employee' | 'manager' | 'guest'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          booking_number: string
          guest_id: string
          unit_id: string
          check_in_date: string
          check_out_date: string
          actual_check_in: string | null
          actual_check_out: string | null
          number_of_guests: number
          total_amount: number
          deposit_amount: number
          status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
          special_requests: string | null
          created_by: string
          checked_in_by: string | null
          checked_out_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_number?: string
          guest_id: string
          unit_id: string
          check_in_date: string
          check_out_date: string
          actual_check_in?: string | null
          actual_check_out?: string | null
          number_of_guests?: number
          total_amount: number
          deposit_amount?: number
          status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
          special_requests?: string | null
          created_by: string
          checked_in_by?: string | null
          checked_out_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_number?: string
          guest_id?: string
          unit_id?: string
          check_in_date?: string
          check_out_date?: string
          actual_check_in?: string | null
          actual_check_out?: string | null
          number_of_guests?: number
          total_amount?: number
          deposit_amount?: number
          status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show'
          special_requests?: string | null
          created_by?: string
          checked_in_by?: string | null
          checked_out_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string
          id_number: string | null
          id_type: string | null
          address: string | null
          nationality: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          id_number?: string | null
          id_type?: string | null
          address?: string | null
          nationality?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          id_number?: string | null
          id_type?: string | null
          address?: string | null
          nationality?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          unit_type_id: string
          unit_number: string
          status: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order'
          last_maintenance: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_type_id: string
          unit_number: string
          status?: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order'
          last_maintenance?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_type_id?: string
          unit_number?: string
          status?: 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order'
          last_maintenance?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: number
          category: string
          product_name: string
          stock: number
          size: string | null
          units: string | null
          price: number
          min_level: number | null
          supplier: string | null
          barcode: string | null
          barcode_type: string | null
          notes: string | null
          tags: string | null
          restock_price: number | null
          value: number | null
          photo1: string | null
          photo2: string | null
          photo3: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          category: string
          product_name: string
          stock?: number
          size?: string | null
          units?: string | null
          price?: number
          min_level?: number | null
          supplier?: string | null
          barcode?: string | null
          barcode_type?: string | null
          notes?: string | null
          tags?: string | null
          restock_price?: number | null
          value?: number | null
          photo1?: string | null
          photo2?: string | null
          photo3?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          category?: string
          product_name?: string
          stock?: number
          size?: string | null
          units?: string | null
          price?: number
          min_level?: number | null
          supplier?: string | null
          barcode?: string | null
          barcode_type?: string | null
          notes?: string | null
          tags?: string | null
          restock_price?: number | null
          value?: number | null
          photo1?: string | null
          photo2?: string | null
          photo3?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          payment_method: 'cash' | 'gcash' | 'bank_transfer' | 'credit_card' | 'debit_card'
          payment_type: 'deposit' | 'full_payment' | 'partial_payment' | 'refund'
          reference_number: string | null
          receipt_number: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          processed_by: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          payment_method: 'cash' | 'gcash' | 'bank_transfer' | 'credit_card' | 'debit_card'
          payment_type: 'deposit' | 'full_payment' | 'partial_payment' | 'refund'
          reference_number?: string | null
          receipt_number?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          processed_by: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          payment_method?: 'cash' | 'gcash' | 'bank_transfer' | 'credit_card' | 'debit_card'
          payment_type?: 'deposit' | 'full_payment' | 'partial_payment' | 'refund'
          reference_number?: string | null
          receipt_number?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          processed_by?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_name: string
          customer_phone: string
          customer_email: string
          items: Record<string, unknown>
          total_amount: number
          payment_method: string
          payment_status: string
          pickup_status: string
          pickup_time: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          customer_name: string
          customer_phone: string
          customer_email: string
          items: Record<string, unknown>
          total_amount: number
          payment_method: string
          payment_status?: string
          pickup_status?: string
          pickup_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          items?: Record<string, unknown>
          total_amount?: number
          payment_method?: string
          payment_status?: string
          pickup_status?: string
          pickup_time?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 