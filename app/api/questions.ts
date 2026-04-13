import { supabase } from "@/lib/supabase"

export const getQuizQuestions = async (quizId: string) => {
    const { data, error } = await supabase.from('questions').select('*').eq('quiz_id', quizId).order('order', { ascending: true })
    if (error) {
        throw error
    }
    return data || []

}