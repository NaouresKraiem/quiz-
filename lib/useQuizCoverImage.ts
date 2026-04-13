import { Upload, type UploadProps } from "antd"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { UseFormSetValue } from "react-hook-form"
import type { NewQuizFormValues } from "@/lib/types"

const MAX_MB = 5

type MessageApi = { error: (content: string) => void }

export type UseQuizCoverImageOptions = {
    /** Runs after a valid file is chosen (e.g. reset “remove cover” flag on edit). */
    onAfterSelectFile?: () => void
    /** Runs after clear (after form field is cleared). */
    onAfterClear?: () => void
}

export function useQuizCoverImage(
    setValue: UseFormSetValue<NewQuizFormValues>,
    message: MessageApi,
    options?: UseQuizCoverImageOptions
) {
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const onAfterSelectFileRef = useRef(options?.onAfterSelectFile)
    const onAfterClearRef = useRef(options?.onAfterClear)

    useEffect(() => {
        onAfterSelectFileRef.current = options?.onAfterSelectFile
        onAfterClearRef.current = options?.onAfterClear
    })

    useEffect(() => {
        return () => {
            if (previewImage?.startsWith("blob:")) {
                URL.revokeObjectURL(previewImage)
            }
        }
    }, [previewImage])

    const uploadProps = useMemo<UploadProps>(
        () => ({
            name: "file",
            multiple: false,
            accept: "image/*",
            customRequest: ({ onSuccess }) => {
                setTimeout(() => onSuccess?.("ok"), 0)
            },
            beforeUpload: (file: File) => {
                const isImage = file.type.startsWith("image/")
                if (!isImage) {
                    message.error("You can only upload image files!")
                }
                const okSize = file.size / 1024 / 1024 < MAX_MB
                if (!okSize) {
                    message.error(`Image must be smaller than ${MAX_MB} MB!`)
                }
                return isImage && okSize ? false : Upload.LIST_IGNORE
            },
            onChange: (info) => {
                const file = info.file?.originFileObj as File | undefined
                if (!file) return
                onAfterSelectFileRef.current?.()
                setValue("coverImage", file, { shouldValidate: true })
                setPreviewImage((prev) => {
                    if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
                    return URL.createObjectURL(file)
                })
            },
        }),
        [message, setValue]
    )

    const clearCoverImage = useCallback(() => {
        setPreviewImage((prev) => {
            if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev)
            return null
        })
        setValue("coverImage", null, { shouldValidate: true })
        onAfterClearRef.current?.()
    }, [setValue])

    return { previewImage, setPreviewImage, uploadProps, clearCoverImage }
}
