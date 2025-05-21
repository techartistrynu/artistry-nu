export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          title: string
          description: string | null
          registration_start: string
          registration_end: string
          submission_deadline: string
          entry_fee: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          registration_start: string
          registration_end: string
          submission_deadline: string
          entry_fee: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          registration_start?: string
          registration_end?: string
          submission_deadline?: string
          entry_fee?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          user_id: string
          tournament_id: string
          title: string
          description: string | null
          status: string
          score: number | null
          rank: number | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tournament_id: string
          title: string
          description?: string | null
          status?: string
          score?: number | null
          rank?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tournament_id?: string
          title?: string
          description?: string | null
          status?: string
          score?: number | null
          rank?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      submission_files: {
        Row: {
          id: string
          submission_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          tournament_id: string
          amount: number
          status: string
          payment_date: string | null
          payment_method: string | null
          transaction_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tournament_id: string
          amount: number
          status: string
          payment_date?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tournament_id?: string
          amount?: number
          status?: string
          payment_date?: string | null
          payment_method?: string | null
          transaction_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          submission_id: string
          tournament_id: string
          certificate_number: string
          issue_date: string
          file_path: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          submission_id: string
          tournament_id: string
          certificate_number: string
          issue_date: string
          file_path?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          submission_id?: string
          tournament_id?: string
          certificate_number?: string
          issue_date?: string
          file_path?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
