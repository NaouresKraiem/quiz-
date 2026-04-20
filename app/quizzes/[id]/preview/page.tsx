"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Typography, Button, Spin, Space, message, Card } from "antd"
import { EditOutlined, CheckOutlined, StopOutlined } from "@ant-design/icons"
import QuizPreview from "@/app/componenets/QuizPreview"
import { useAuth } from "@/lib/auth"
import Image from "next/image"
import { getQuizQuestions } from "@/app/api/questions"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getQuizById, publishQuiz, unpublishQuiz } from "@/app/api/quizzes"

const { Title, Paragraph } = Typography

export default function PreviewQuizPage() {
  const params = useParams()
  const router = useRouter()
  const quizId = params.id as string
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId),
  });
  const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['questions', quizId],
    queryFn: () => getQuizQuestions(quizId),
  });
  
  const togglePublishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      publish ? publishQuiz(id) : unpublishQuiz(id),
    onSuccess: (_, { publish }) => {
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] })
      queryClient.invalidateQueries({ queryKey: ["quizzes"] })
      if (publish) {
        message.success("Quiz published successfully")
        router.push(`/quizzes/${quizId}/published`)
      } else {
        message.success("Quiz unpublished")
      }
    },
    onError: () => {
      message.error("Failed to update publish status")
    },
  })

  useEffect(() => {
    if (quiz && user && quiz.author_id !== user.id) {
      message.error("You don't have permission to preview this quiz")
      router.push("/quizzes")
    }
  }, [quiz, user, router])

  const handleTogglePublish = async () => {
    if (!quiz) return
    const willPublish = !quiz.published
    if (willPublish && questions.length === 0) {
      message.error("Cannot publish a quiz with no questions")
      return
    }

    await togglePublishMutation.mutateAsync({
      id: quizId,
      publish: willPublish,
    })
  }

  if (isLoadingQuiz || isLoadingQuestions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-16">
        <Title level={4} className="text-red-500">
          Quiz not found
        </Title>
        <Paragraph className="text-slate-500">The quiz you're looking for doesn't exist or has been removed.</Paragraph>
        <Button type="primary" onClick={() => router.push("/quizzes")} className="bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg">
          Back to Quizzes
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="text-slate-800 mb-0">Preview Quiz</Title>
          <Space>
            <Button icon={<EditOutlined />} onClick={() => router.push(`/quizzes/${quizId}`)} className="border-slate-200 hover:border-slate-300">
              Edit
            </Button>
            <Button
              type={quiz.published ? "default" : "primary"}
              danger={quiz.published}
              icon={quiz.published ? <StopOutlined /> : <CheckOutlined />}
              onClick={handleTogglePublish}
              disabled={!quiz.published && questions.length === 0}
              loading={togglePublishMutation.isPending}
              className={
                quiz.published
                  ? ""
                  : "bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg shadow-md shadow-emerald-500/20"
              }
            >
              {quiz.published ? "Unpublish" : "Publish"}
            </Button>
          </Space>
        </div>

        {quiz.cover_image && (
          <Card className="mb-6 overflow-hidden border border-slate-200 shadow-sm rounded-xl">
            <div className="relative h-48 w-full">
              <Image
                src={quiz.cover_image || "/placeholder.svg"}
                alt={quiz.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div className="mt-4">
              <Title level={3} className="text-slate-800">{quiz.title}</Title>
              <Paragraph className="text-slate-500">{quiz.description}</Paragraph>
            </div>
          </Card>
        )}

        <QuizPreview quiz={quiz} questions={questions} readOnly={true} />
      </div>
    </div>
  )
}
