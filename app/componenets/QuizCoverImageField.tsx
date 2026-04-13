"use client"

import { Button, Form, UploadProps } from "antd"
import Dragger from "antd/es/upload/Dragger"
import { PlusOutlined, InboxOutlined } from "@ant-design/icons"
import Image from "next/image"
import { Control, Controller, FieldError } from "react-hook-form"
import type { NewQuizFormValues } from "@/lib/types"

type Props = {
    control: Control<NewQuizFormValues>
    error?: FieldError
    previewImage: string | null
    draggerProps: UploadProps
    onClear: () => void
}

export function QuizCoverImageField({ control, error, previewImage, draggerProps, onClear }: Props) {
    return (
        <Form.Item
            help={error?.message}
            validateStatus={error ? "error" : undefined}
            className="mb-6"
            label={<span className="text-slate-700 font-medium">Cover image</span>}
        >
            <Controller
                name="coverImage"
                control={control}
                render={() => (
                    <>
                        {previewImage ? (
                            <div>
                                <div className="relative overflow-hidden border-slate-200 border rounded-lg h-48 ">
                                    <Image src={previewImage} alt="cover image" fill className="object-cover" />
                                </div>
                                <Button
                                    icon={<PlusOutlined />}
                                    className="border-slate-300 hover:border-emerald-400 mt-3"
                                    onClick={onClear}
                                >
                                    Clear Image
                                </Button>
                            </div>
                        ) : (
                            <Dragger {...draggerProps}>
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined />
                                </p>
                                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                <p className="ant-upload-hint">
                                    Support for a single upload. Strictly prohibited from uploading company data or
                                    other banned files.
                                </p>
                            </Dragger>
                        )}
                    </>
                )}
            />
        </Form.Item>
    )
}
