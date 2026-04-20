"use client"
import * as yup from 'yup'
import { Button, Card, Form, Input, Modal, Tooltip, Typography, Upload, UploadProps } from 'antd'
import { yupResolver } from '@hookform/resolvers/yup'
import { useParams, useRouter } from 'next/navigation'
import {
    PlusOutlined,
    EyeOutlined,
    CheckOutlined,
    InboxOutlined,
    StopOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createQuestion, getQuizById, updateQuiz } from '@/app/api/quizzes'
import { deleteQuestion, getQuizQuestions, reorderQuestions } from '@/app/api/questions'
import { Controller, useForm } from 'react-hook-form'
import { NewQuizFormValues, type Question, type Quiz } from '@/lib/types'
import Image from 'next/image'
import Dragger from 'antd/es/upload/Dragger'
import { useEffect, useState } from 'react'
import { useAntdApp } from '@/lib/useAntdApp'
import { uploadCoverImage } from '@/lib/storage'
import { useAuth } from '@/lib/auth'
import SortableQuestionList from '@/app/componenets/SortableQuestionList'
import QuestionForm from '@/app/componenets/QuestionForm'
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
    const [deleteQuestionModalVisible, setDeleteQuestionModalVisible] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
    const [showQuestionForm, setShowQuestionForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [shareUrl, setShareUrl] = useState("");

    const { isLoading, error, data: quiz } = useQuery<Quiz | null>({
        queryKey: ['quiz', id],
        queryFn: () => getQuizById(id),
        enabled: !!id
    })
    console.log('quiz:', quiz)
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

    const createQuestionMutation = useMutation({
        mutationFn: (newQuestion: Partial<Question>) => createQuestion(newQuestion),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["questions", id] })
            queryClient.invalidateQueries({ queryKey: ["quiz", id] })
            message.success("Question added successfully")
        },
        onError: () => {
            message.error("Failed to add question")
        },
    })
    const onSubmit = async (values: NewQuizFormValues) => {

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

    ////drag and drop questions

    const reorderQuestionsMutation = useMutation({
        mutationFn: (questionIds: string[]) => reorderQuestions(id, questionIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions', id] })
            message.success("Questions reordered successfully")
        },
        onError: () => {
            message.error("Failed to reorder questions")
        },
    })

    const handleReorderQuestions = (reorderedQuestions: Question[]) => {
        const ids = reorderedQuestions.map((q) => q.id)
        reorderQuestionsMutation.mutate(ids)
    }

    const handleDeleteQuestion = (questionId: string) => {
        setQuestionToDelete(questionId);
        setDeleteQuestionModalVisible(true)
    }
    const deleteQuestionMutation = useMutation({
        mutationFn: (questionId: string) => deleteQuestion(questionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions', id] })
            message.success("Question deleted successfully")
        },
        onError: () => {
            message.error("Failed to delete question")
        },
    })

    const handleDeleteQuestionConfirm = () => {
        if (!questionToDelete) return;

        try {
            deleteQuestionMutation.mutate(questionToDelete);
            message.success("Question deleted successfully");
            setDeleteQuestionModalVisible(false);
            setQuestionToDelete(null);
        } catch (error) {
            message.error("Failed to delete question");
        }
    };

    const handleDeleteQuestionCancel = () => {
        setDeleteQuestionModalVisible(false);
        setQuestionToDelete(null);
    };
    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);w
        setShowQuestionForm(true);
    };

    const handleAddQuestion = () => {
        // setEditingQuestion(null);
        setShowQuestionForm(true);
    };


    const handleQuestionSubmit = (data: any) => {
        try {
            if (editingQuestion) {
                // await updateQuestionMutation.mutateAsync({
                //   id: editingQuestion.id,
                //   updates: data,
                // });
                message.success("Question updated successfully");
            } else {
                createQuestionMutation.mutate({
                    ...data,
                    quiz_id: id,
                    order: questions?.length ?? 0 + 1,
                });
                message.success("Question added successfully");
            }
            setShowQuestionForm(false);
        } catch (error) {
            message.error("Failed to save question");
        }
    };
    if (!quiz) {
        return (
            <div className="text-center py-16">
                <Title level={4} className="text-red-500">
                    Quiz not found
                </Title>
                <Paragraph className="text-slate-500">
                    The quiz you're looking for doesn't exist or has been removed.
                </Paragraph>
                <Button type="primary" onClick={() => router.push("/quizzes")} className="bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg">
                    Back to Quizzes
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 py-8 g-5">

                {/* header section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
                    <div className="flex  lg:flex-row lg:items-center lg:justify-between gap-4">

                        <div>
                            <Title level={2} className="text-slate-800 mb-1">Edit Quiz
                            </Title>
                            <Paragraph className="text-base text-slate-500 mb-0 max-w-xl">Customize your quiz and manage questions</Paragraph>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
              {quiz.published && (
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-sm text-emerald-700 font-medium">
                    Share:
                  </span>
                  <CopyToClipboard
                    text={shareUrl}
                    onCopy={() => message.success("Link copied to clipboard!")}
                  >
                    <Tooltip title="Copy link">
                      <Button
                        icon={<LinkOutlined />}
                        size="small"
                        className="border-emerald-300 text-emerald-600 hover:bg-emerald-100"
                      />
                    </Tooltip>
                  </CopyToClipboard>
                </div>
              )}

              <Button
                icon={<EyeOutlined />}
                onClick={() =>
                  router.push(
                    `/quizzes/${quizId}/${quiz.published ? "published" : "preview"
                    }`
                  )
                }
                className="border-slate-200 hover:border-slate-300 transition-all duration-200"
                size="large"
              >
                {quiz.published ? "View Live" : "Preview"}
              </Button>

              <Button
                type={quiz.published ? "default" : "primary"}
                icon={quiz.published ? <StopOutlined /> : <CheckOutlined />}
                danger={quiz.published}
                onClick={handleTogglePublish}
                disabled={!quiz.published && questions.length === 0}
                size="large"
                className={`transition-all duration-200 ${quiz.published
                    ? ""
                    : "bg-emerald-500 hover:bg-emerald-600 border-0 shadow-md shadow-emerald-500/20"
                  }`}
              >
                {quiz.published ? "Unpublish" : "Publish Quiz"}
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteQuizClick}
                size="large"
                className="transition-all duration-200"
              >
                Delete Quiz
              </Button>
            </div>
                    </div>
                </div>

                {/* quiz details card */}
                <Card style={{ marginBottom: '2rem' }}>
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
                <Card>
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <Title level={4} className="mb-1 text-slate-800">
                                    Questions ({questions?.length ?? ''})
                                </Title>
                                <Paragraph className="text-slate-500 mb-0 text-sm">
                                    Drag questions to reorder them
                                </Paragraph>
                            </div>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddQuestion}
                                size="large"
                                className="bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg shadow-md shadow-emerald-500/20 transition-all duration-200"
                            >
                                Add Question
                            </Button>
                        </div>
                    </div>
                    <div className="p-6">

                        {showQuestionForm && (
                            <div className="mb-6">
                                <QuestionForm
                                    initialData={editingQuestion || undefined}
                                    onSubmit={handleQuestionSubmit}
                                    onCancel={() => setShowQuestionForm(false)}
                                />
                            </div>
                        )}

                        <SortableQuestionList
                            onEdit={handleEditQuestion}
                            onDelete={handleDeleteQuestion} questions={questions ?? []} onReorder={handleReorderQuestions} />
                    </div>
                </Card>

                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <ExclamationCircleOutlined className="text-red-500" />
                            <span>Delete Question</span>
                        </div>
                    }
                    open={deleteQuestionModalVisible}
                    onOk={handleDeleteQuestionConfirm}
                    onCancel={handleDeleteQuestionCancel}
                    okText="Delete"
                    cancelText="Cancel"
                    okType="danger"
                    confirmLoading={deleteQuestionMutation.isPending}
                >
                    <p>Are you sure you want to delete this question?</p>
                    <p className="text-slate-500">This action cannot be undone.</p>
                </Modal>
            </div>
            <div>
            </div>
        </div>
    )
}

export default EditQuizPage

