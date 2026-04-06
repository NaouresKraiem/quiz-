export type QuestionType = "two_choices" | "four_choices" | "input"

export interface Question {
  id: string
  quiz_id: string
  question_text: string
  question_type: QuestionType
  options: any
  correct_answer: string
  order: number
  created_at: string
  updated_at: string
}

export interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  published: boolean
  cover_image: string | null
  author_id: string
  questions?: Question[]
}
