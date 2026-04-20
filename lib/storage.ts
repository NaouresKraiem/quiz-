import { supabase } from "@/lib/supabase"

export const uploadCoverImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`

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
    return data.publicUrl
  } catch (error) {
    console.error("Error in uploadCoverImage:", error)
    return null
  }
}
