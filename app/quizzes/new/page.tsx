'use client'
import * as yup from 'yup'
import { Card, Form, Typography, Input, UploadProps, Button, Upload } from "antd"
import Dragger from "antd/es/upload/Dragger"
import { Controller, useForm } from "react-hook-form"
import { InboxOutlined, PlusOutlined } from "@ant-design/icons"
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { createQuiz } from '@/app/api/quizzes'
import { useAuth } from '@/lib/auth'
import { useAntdApp } from '@/lib/useAntdApp'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { uploadCoverImage } from '@/lib/storage'
import { useRouter } from 'next/navigation'
import { NewQuizFormValues } from '@/lib/types'


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


const NewQuizPage = () => {
  const { user } = useAuth()
  const { message } = useAntdApp()
  const router = useRouter()
  const { Title, Paragraph } = Typography
  const { control, setValue, handleSubmit, formState: { errors } } = useForm<NewQuizFormValues>({ resolver: yupResolver(newQuizSchema) })
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);


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
      const file = info.file.originFileObj
      if (!file) return
      setCoverImage(file)
      setValue('coverImage', file)
      setPreviewImage((prev) => {
        if (prev?.startsWith('blob')) URL.revokeObjectURL(prev) //cotè memoire 
        return URL.createObjectURL(file)
      })
    }
  }
  const createQuizMutation = useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      message.success('Quiz created successfully')
      router.push('/quizzes')
    },
    onError: () => {
      message.error('Failed to create quiz')
    }
  })

  const onSubmit = async (values: NewQuizFormValues) => {

    let coverImageUrl = null

    if (values.coverImage && user) {

      coverImageUrl = await uploadCoverImage(values.coverImage, user.id)

      if (!coverImageUrl) {
        message.error('failed to upload cover image')
        return
      }
    }
    const quiz = {
      title: values.title,
      description: values.description,
      cover_image: coverImageUrl,
      author_id: user?.id
    }
    createQuizMutation.mutate(quiz)
  }


  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      <div className="mb-8">
        <Title level={2} className="text-slate-800 mb-1">Create New Quiz</Title>
        <Paragraph className="text-base text-slate-500 mb-0 max-w-xl">Create a new quiz to test your knowledge and challenge your friends
        </Paragraph>
      </div>
      <Card className="border border-slate-200 shadow-sm rounded-xl" >

        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
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
                          setCoverImage(null)
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
          <Form.Item>

            <Button type='primary' htmlType='submit' className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg font-semibold shadow-md shadow-emerald-500/20"
            >
              Create Quiz
            </Button>
          </Form.Item>

        </Form>
      </Card>
    </div>
  )
}

export default NewQuizPage
