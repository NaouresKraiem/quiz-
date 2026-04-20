import { supabase } from "@/lib/supabase"

export const getQuizQuestions = async (quizId: string) => {
    const { data, error } = await supabase.from('questions').select('*').eq('quiz_id', quizId).order('order', { ascending: true })
    if (error) {
        throw error
    }
    return data || []
}


export const reorderQuestions = async (
    quizId: string,
    questionIds: string[]
): Promise<void> => {
    try {
        for (let index = 0; index < questionIds.length; index++) {
            const id = questionIds[index];
            const { error } = await supabase
                .from("questions")
                .update({ order: index + 1 } as never)
                .eq("id", id)
                .eq("quiz_id", quizId);

            if (error) {
                console.error(`Failed to update order for question ${id}:`, error);
                throw error;
            }
        }
    } catch (error) {
        console.error(`Error in reorderQuestions for quiz ${quizId}:`, error);
        throw error;
    }
};


// Delete a question
export const deleteQuestion = async (id: string): Promise<void> => {
    const { error } = await supabase.from("questions").delete().eq("id", id);

    if (error) {
        console.error(`Error deleting question with ID ${id}:`, error);
        throw error;
    }
};
