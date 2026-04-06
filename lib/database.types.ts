export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      quizzes: {
        Row: {
          id: string
          title: string
          description: string
          created_at: string
          updated_at: string
          published: boolean
          cover_image: string | null
          author_id: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          created_at?: string
          updated_at?: string
          published?: boolean
          cover_image?: string | null
          author_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          created_at?: string
          updated_at?: string
          published?: boolean
          cover_image?: string | null
          author_id?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          question_type: "two_choices" | "four_choices" | "input"
          options: Json
          correct_answer: string
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question_text: string
          question_type: "two_choices" | "four_choices" | "input"
          options: Json
          correct_answer: string
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question_text?: string
          question_type?: "two_choices" | "four_choices" | "input"
          options?: Json
          correct_answer?: string
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
