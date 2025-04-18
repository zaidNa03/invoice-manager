export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      business_info: {
        Row: {
          id: string
          user_id: string
          business_name: string
          address: string | null
          tax_number: string | null
          phone: string | null
          email: string | null
          logo_url: string | null
          default_currency: string | null
          tax_rate: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          address?: string | null
          tax_number?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          default_currency?: string | null
          tax_rate?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          address?: string | null
          tax_number?: string | null
          phone?: string | null
          email?: string | null
          logo_url?: string | null
          default_currency?: string | null
          tax_rate?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      currencies: {
        Row: {
          code: string
          symbol: string
          name: string
        }
        Insert: {
          code: string
          symbol: string
          name: string
        }
        Update: {
          code?: string
          symbol?: string
          name?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          product_id: string | null
          description: string
          quantity: number
          unit_price: number
          currency_code: string
          subtotal: number
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id?: string | null
          description: string
          quantity?: number
          unit_price: number
          currency_code: string
          subtotal: number
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          currency_code?: string
          subtotal?: number
          created_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          invoice_number: string
          customer_name: string
          customer_email: string | null
          issue_date: string | null
          due_date: string | null
          notes: string | null
          subtotal: number
          tax_rate: number | null
          tax_amount: number | null
          total: number
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          invoice_number: string
          customer_name: string
          customer_email?: string | null
          issue_date?: string | null
          due_date?: string | null
          notes?: string | null
          subtotal?: number
          tax_rate?: number | null
          tax_amount?: number | null
          total?: number
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          invoice_number?: string
          customer_name?: string
          customer_email?: string | null
          issue_date?: string | null
          due_date?: string | null
          notes?: string | null
          subtotal?: number
          tax_rate?: number | null
          tax_amount?: number | null
          total?: number
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          image_url: string | null
          price: number
          currency_code: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          image_url?: string | null
          price: number
          currency_code: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          price?: number
          currency_code?: string
          created_at?: string | null
          updated_at?: string | null
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