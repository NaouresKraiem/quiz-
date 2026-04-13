"use client"
import * as yup from 'yup'
import { Button, Card, Form, Input, Typography, Upload, UploadProps } from 'antd'
import { yupResolver } from '@hookform/resolvers/yup'
import { useParams, useRouter } from 'next/navigation'
import {
    PlusOutlined,
    EyeOutlined,
    CheckOutlined,
    InboxOutlined,
    StopOutlined,
    DeleteOutlined,
} from "@ant-design/icons"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getQuizById, updateQuiz } from '@/app/api/quizzes'
import { getQuizQuestions } from '@/app/api/questions'
import { Controller, useForm } from 'react-hook-form'
import { NewQuizFormValues, type Quiz } from '@/lib/types'
import Image from 'next/image'
import Dragger from 'antd/es/upload/Dragger'
import { useEffect, useState } from 'react'
import { useAntdApp } from '@/lib/useAntdApp'
import { uploadCoverImage } from '@/lib/storage'
import { useAuth } from '@/lib/auth'
const newQuizSchema: yup.ObjectSchema<NewQuizFormValues> = yup.object({
    title: yup.string().required('Please enter a title').trim().min(3, 'Title must be at least 3 caracters').max(120, 'Title must be at most 120 caracters'),
    description: yup
        .string()
        .required("Please enter a description")
        .trim()
        .min(10, "Description must be at least 10 characters")
        .max(2000, "Description must be at most 2000 characters"),
    coverImage: yup
        .mixed<File>()
        .nullable()
        .default(null),
})
const EditQuizPage = () => {
    // const { id } = useParams() 
    const { user } = useAuth()
    const queryClient = useQueryClient();
    const { id } = useParams() as { id: string }

    const router = useRouter()
    const { message } = useAntdApp()
    const { Title, Paragraph } = Typography
    const { control, reset, setValue, handleSubmit, formState: { errors, dirtyFields } } = useForm<NewQuizFormValues>({ resolver: yupResolver(newQuizSchema) })
    const [previewImage, setPreviewImage] = useState<string | null>(null)

    const { isLoading, error, data: quiz } = useQuery<Quiz | null>({
        queryKey: ['quiz', id],
        queryFn: () => getQuizById(id),
        enabled: !!id
    })

    const { isLoading: loadingQuestions, error: errorQuestions, data: questions } = useQuery({
        queryKey: ['questions', id],
        queryFn: () => getQuizQuestions(id),
        enabled: !!id
    })

    useEffect(() => {
        return () => {
            if (previewImage?.startsWith("blob:")) {
                URL.revokeObjectURL(previewImage)
            }
        }
    }, [previewImage])

    useEffect(() => {
        if (quiz) {
            // `coverImage` is a File (new upload), not the existing URL string.
            reset({ title: quiz.title, description: quiz.description, coverImage: null })
            setPreviewImage(quiz.cover_image ?? null)
        }
    }, [quiz, reset]);



    const updateQuizMutation = useMutation({
        mutationFn: (uodatedQuiz: Partial<Quiz>) => updateQuiz(id, uodatedQuiz),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quiz', id] })
            queryClient.invalidateQueries({ queryKey: ['quizzes'] })
            router.push(`/quizzes`)
            message.success('Quiz updated successfully')
        },
        onError: () => {
            message.error('Failed to update quiz')
        },
    })

    const onSubmit = async (values: NewQuizFormValues) => {
        console.log('values:', values)
        const payload: Partial<Quiz> = {}

        if (dirtyFields.title) payload.title = values.title
        if (dirtyFields.description) payload.description = values.description


        if (values.coverImage && user) {
            const coverImageUrl = await uploadCoverImage(values.coverImage, user.id)
            if (!coverImageUrl) {
                message.error('failed to upload cover image')
                return
            }
            payload.cover_image = coverImageUrl
        }

        if (Object.keys(payload).length === 0) {
            message.info('No changes to save')
            return
        }

        updateQuizMutation.mutate(payload)


    }
    const props: UploadProps = {
        name: 'file',
        multiple: false,
        accept: 'image/*',
        customRequest: ({ onSuccess }: any) => {
            setTimeout(() => {
                onSuccess("ok", null);
            }, 0);
        },
        beforeUpload: (file: File) => {

            const isImage = file.type.startsWith('image/')
            if (!isImage) {
                message.error('You can only upload image files!')
            }
            const isLt2M = file.size / 1024 / 1024 < 5

            if (!isLt2M) {
                message.error('Image must be smaller than 2 MB!')
            }
            return isImage && isLt2M ? false : Upload.LIST_IGNORE
        },
        onChange: (info: any) => {
            const file = info.file
            if (!file) return
            setValue('coverImage', file, { shouldValidate: true })
            setPreviewImage((prev) => {
                if (prev?.startsWith('blob')) URL.revokeObjectURL(prev) //cotè memoire 
                return URL.createObjectURL(file)
            })
        }
    }
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8">

                {/* header section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
                    <div className="flex  lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>
                            <Title level={2} className="text-slate-800 mb-1">Edit Quiz
                            </Title>
                            <Paragraph className="text-base text-slate-500 mb-0 max-w-xl">Customize your quiz and manage questions</Paragraph>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button icon={<EyeOutlined />} onClick={() => router.push(`/quizzes/${id}/preview`)}
                                className="border-slate-200 hover:border-slate-300 transition-all duration-200"
                                size="large"
                            >
                                Preview
                            </Button>
                            <Button
                                icon={quiz?.published ? <StopOutlined /> : <CheckOutlined />}

                                onClick={() => router.push(`/quizzes/${id}/preview`)}
                                className={`transition-all duration-200 ${quiz?.published
                                    ? ""
                                    : "bg-emerald-500 hover:bg-emerald-600 border-0 shadow-md shadow-emerald-500/20"
                                    }`}

                                disabled={!quiz?.published && questions?.length === 0}
                                size="large"
                            >
                                {'Publish Quiz'}
                            </Button>

                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                // onClick={handleDeleteQuizClick}
                                size="large"
                                className="transition-all duration-200"
                            >
                                Delete Quiz
                            </Button>
                        </div>
                    </div>
                </div>

                {/* quiz details card */}
                <Card className="mb-6 border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <Title level={4} className="mb-1 text-slate-800">
                            Quiz Details
                        </Title>
                        <Paragraph className="text-slate-500 mb-0 text-sm">
                            Update your quiz information and cover image
                        </Paragraph>
                    </div>
                    <div className="p-6">

                        <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className='flex gap-6'>
                            <div style={{ width: '50%' }}>

                                <Form.Item help={errors.title?.message} validateStatus={errors.title ? "error" : undefined} className="mb-6" label={<span className="text-slate-700 font-medium">Title</span>}>
                                    <Controller
                                        name="title"
                                        control={control}

                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder='Quiz Title'
                                                className="rounded-lg h-10"
                                            />
                                        )}
                                    />

                                </Form.Item>
                                <Form.Item
                                    help={errors.description?.message} validateStatus={errors.description ? "error" : undefined} className="mb-6" label={<span className="text-slate-700 font-medium">Description</span>}
                                >
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <Input.TextArea
                                                {...field}
                                                placeholder='Quiz description'
                                                className="rounded-lg h-10"
                                                rows={4}
                                            />
                                        )}
                                    />
                                </Form.Item>
                                <Form.Item>

                                    <Button type='primary' htmlType='submit' className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg font-semibold shadow-md shadow-emerald-500/20"
                                    >
                                        Update Quiz Details

                                    </Button>
                                </Form.Item>
                            </div>

                            <div style={{ width: '50%' }}>
                                <Form.Item help={errors.coverImage?.message} validateStatus={errors.coverImage ? "error" : undefined} className="mb-6" label={<span className="text-slate-700 font-medium">Cover image</span>}
                                >
                                    <Controller
                                        name="coverImage"
                                        control={control}
                                        render={({ field }) => (

                                            <>
                                                {previewImage ?

                                                    <div>
                                                        <div className='relative overflow-hidden border-slate-200 border rounded-lg h-48 '>
                                                            <Image
                                                                src={previewImage}
                                                                alt='cover image'
                                                                fill
                                                                className='object-cover'
                                                            />
                                                        </div>
                                                        <Button
                                                            icon={<PlusOutlined />}
                                                            className="border-slate-300 hover:border-emerald-400 mt-3"
                                                            onClick={() => {
                                                                if (previewImage?.startsWith('blob')) {
                                                                    URL.revokeObjectURL(previewImage)
                                                                }
                                                                setPreviewImage(null)
                                                                setValue('coverImage', null, { shouldValidate: true })
                                                            }}
                                                        >
                                                            Clear Image
                                                        </Button>
                                                    </div>

                                                    : <Dragger {...props}>
                                                        <p className="ant-upload-drag-icon">
                                                            <InboxOutlined />
                                                        </p>
                                                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                                                        <p className="ant-upload-hint">
                                                            Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                                                            banned files.
                                                        </p>
                                                    </Dragger>
                                                }

                                            </>

                                        )}
                                    />
                                </Form.Item>

                            </div>



                        </Form>
                    </div>
                </Card>
  {/* Questions Section */}

            </div>
            <div>
            </div>
        </div>
    )
}

export default EditQuizPage

