import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export const uploadCoverImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Create a unique file name
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`

    // Use a simpler path structure that doesn't rely on parsing the userId as UUID
    const filePath = `${userId}/${fileName}`

    // Upload the file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("quiz-assets")
      .upload(filePath, file, { cacheControl: "3600", upsert: false })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      throw uploadError
    }

    // Get the public URL
    const { data } = supabase.storage.from("quiz-assets").getPublicUrl(filePath)
    console.log('data:', data)
    return data.publicUrl
  } catch (error) {
    console.error("Error in uploadCoverImage:", error)
    return null
  }
}
