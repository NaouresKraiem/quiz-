import * as yup from "yup"
import type { NewQuizFormValues } from "@/lib/types"

export const newQuizFormSchema: yup.ObjectSchema<NewQuizFormValues> = yup.object({
    title: yup
        .string()
        .required("Please enter a title")
        .trim()
        .min(3, "Title must be at least 3 caracters")
        .max(120, "Title must be at most 120 caracters"),
    description: yup
        .string()
        .required("Please enter a description")
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description must be at most 2000 characters"),
    coverImage: yup.mixed<File>().nullable().default(null),
})
