export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'company_admin' | 'backend_team' | 'ship_worker'
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'company_admin' | 'backend_team' | 'ship_worker'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'company_admin' | 'backend_team' | 'ship_worker'
          created_at?: string
        }
      }
      room_types: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          max_occupancy: number
          size_sqm: number | null
          bed_type: string | null
          amenities: Json
          images: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          max_occupancy?: number
          size_sqm?: number | null
          bed_type?: string | null
          amenities?: Json
          images?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          max_occupancy?: number
          size_sqm?: number | null
          bed_type?: string | null
          amenities?: Json
          images?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          duration_days: number
          num_dives: number | null
          price_per_person: number
          charter_price: number | null
          features: Json
          is_popular: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          duration_days: number
          num_dives?: number | null
          price_per_person: number
          charter_price?: number | null
          features?: Json
          is_popular?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          duration_days?: number
          num_dives?: number | null
          price_per_person?: number
          charter_price?: number | null
          features?: Json
          is_popular?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      room_package_pricing: {
        Row: {
          id: string
          room_type_id: string
          package_id: string
          price_override: number | null
          is_available: boolean
        }
        Insert: {
          id?: string
          room_type_id: string
          package_id: string
          price_override?: number | null
          is_available?: boolean
        }
        Update: {
          id?: string
          room_type_id?: string
          package_id?: string
          price_override?: number | null
          is_available?: boolean
        }
      }
      add_on_options: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price?: number
          category?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string | null
          is_active?: boolean
        }
      }
      bookings: {
        Row: {
          id: string
          booking_ref: string
          status: 'pending_payment' | 'pending_verification' | 'confirmed' | 'cancelled'
          customer_name: string
          customer_email: string
          customer_phone: string | null
          room_type_id: string | null
          package_id: string | null
          check_in_date: string | null
          check_out_date: string | null
          num_guests: number
          certification_level: string | null
          logged_dives: number | null
          nitrox_required: boolean
          equipment_rental: boolean
          add_ons: Json
          special_requests: string | null
          payment_method: 'bank_transfer' | 'stripe' | null
          payment_receipt_url: string | null
          total_amount: number | null
          admin_notes: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_ref?: string
          status?: 'pending_payment' | 'pending_verification' | 'confirmed' | 'cancelled'
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          room_type_id?: string | null
          package_id?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          num_guests?: number
          certification_level?: string | null
          logged_dives?: number | null
          nitrox_required?: boolean
          equipment_rental?: boolean
          add_ons?: Json
          special_requests?: string | null
          payment_method?: 'bank_transfer' | 'stripe' | null
          payment_receipt_url?: string | null
          total_amount?: number | null
          admin_notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_ref?: string
          status?: 'pending_payment' | 'pending_verification' | 'confirmed' | 'cancelled'
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          room_type_id?: string | null
          package_id?: string | null
          check_in_date?: string | null
          check_out_date?: string | null
          num_guests?: number
          certification_level?: string | null
          logged_dives?: number | null
          nitrox_required?: boolean
          equipment_rental?: boolean
          add_ons?: Json
          special_requests?: string | null
          payment_method?: 'bank_transfer' | 'stripe' | null
          payment_receipt_url?: string | null
          total_amount?: number | null
          admin_notes?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      blocked_dates: {
        Row: {
          id: string
          room_type_id: string | null
          start_date: string
          end_date: string
          reason: string | null
          blocked_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          room_type_id?: string | null
          start_date: string
          end_date: string
          reason?: string | null
          blocked_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          room_type_id?: string | null
          start_date?: string
          end_date?: string
          reason?: string | null
          blocked_by?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type RoomType = Database['public']['Tables']['room_types']['Row']
export type Package = Database['public']['Tables']['packages']['Row']
export type RoomPackagePricing = Database['public']['Tables']['room_package_pricing']['Row']
export type AddOnOption = Database['public']['Tables']['add_on_options']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BlockedDate = Database['public']['Tables']['blocked_dates']['Row']
