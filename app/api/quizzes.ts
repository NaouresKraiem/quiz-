import { supabase } from "@/lib/supabase";
import type { Quiz } from "@/lib/types";



export const getQuizzes = async (
    page = 1,
    limit = 6,
    searchTerm: string
): Promise<{ data: Quiz[]; total: number }> => {

    const from = (page - 1) * limit
    const to = from + limit - 1
    try {
        let dataQuery = supabase.from('quizzes').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to)
        if (searchTerm) {
            dataQuery = dataQuery.ilike('title', `%${searchTerm}%`)
        }
        const { data, error, count } = await dataQuery
        console.log('count:', count)

        if (error) {
            throw error;
        }
        return { data: data || [], total: count || 0 }
    } catch (error) {
        console.log('error in get quizzes:', error)
        return { data: [], total: 0 }
    }
}

export const getQuizById = async (id: string): Promise<Quiz | null> => {
    try {
        let { data, error } = await supabase.from('quizzes').select('*').eq('id', id).single()

        console.log('data:', data)
        if (error) {
            console.log('error in get one quizzes:', error)
            throw error;
        }
        return data
    } catch (error) {
        console.log('error:', error)
        return null
    }
}
export const createQuiz = async (quiz: any) => {
    console.log('quiz:', quiz)
    const { data, error } = await supabase.from('quizzes').insert(quiz).select().single()
    if (error) {
        throw error;
    }
    return data
}


export const updateQuiz = async (id: string, quiz: Partial<Quiz>) => {


    const { data, error } = await (supabase as any)
        .from('quizzes')
        .update(quiz as any)
        .eq('id', id)
        .select()
        .single()
    if (error) {
        throw error;
    }
    return data
}

