"use client";

import { useParams, useRouter } from "next/navigation";
import { Typography, Button, Spin, Result, Card } from "antd";
import { ArrowLeftOutlined, HomeOutlined } from "@ant-design/icons";
// import { useQuiz } from "@/api/hooks/useQuiz";
// import { useQuizQuestions } from "@/api/hooks/useQuestions";
import QuizPreview from "@/app/componenets/QuizPreview";
import Link from "next/link";
import Image from "next/image";
import { getQuizById } from "@/app/api/quizzes";
import { getQuizQuestions } from "@/app/api/questions";
import { useQuery } from "@tanstack/react-query";

const { Title, Paragraph } = Typography;

export default function PublishedQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  // const { data: quiz, isLoading: isLoadingQuiz } = useQuiz(quizId, true);
//   const { data: questions = [], isLoading: isLoadingQuestions } =
//     // useQuizQuestions(quizId, true);
const { data: questions, isLoading: isLoadingQuestions } = useQuery({
  queryKey: ['questions', quizId],
  queryFn: () => getQuizQuestions(quizId),
});

const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
  queryKey: ['quiz', quizId],
  queryFn: () => getQuizById(quizId),
});

  if (isLoadingQuiz || isLoadingQuestions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center">
        <Result
          status="404"
          title="Quiz Not Found"
          subTitle="The quiz you're looking for doesn't exist or has been removed."
          extra={
            <Link href="/quizzes">
              <Button type="primary" icon={<HomeOutlined />} className="bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg">
                Back to Quizzes
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  if (!quiz.published) {
    return (
      <div className="text-center">
        <Result
          status="warning"
          title="Quiz Not Published"
          subTitle="This quiz has not been published yet."
          extra={
            <Link href="/quizzes">
              <Button type="primary" icon={<HomeOutlined />} className="bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg">
                Back to Quizzes
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/quizzes">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="h-10 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 rounded-lg shadow-sm"
            >
              <span className="ml-1">Back to Quizzes</span>
            </Button>
          </Link>
        </div>

        {/* Hero Section */}
        {quiz.cover_image ? (
          <Card className="mb-8 border-0 shadow-lg rounded-xl overflow-hidden bg-white">
            <div className="relative h-64 w-full">
              <Image
                src={quiz.cover_image || "/placeholder.svg"}
                alt={quiz.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="max-w-3xl">
                  <Title
                    level={2}
                    className="text-white mb-2 font-bold leading-tight"
                  >
                    {quiz.title}
                  </Title>
                  <Paragraph className="text-white/80 text-base mb-3">
                    {quiz.description}
                  </Paragraph>
                  <div className="flex items-center space-x-3 text-white/70">
                    <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-md text-xs font-medium">
                      {new Date(quiz.created_at).toLocaleDateString()}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/30 backdrop-blur-sm rounded-md text-xs font-medium text-emerald-200">
                      Published
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="mb-8 border-0 shadow-lg rounded-xl overflow-hidden bg-slate-800">
            <div className="p-10 text-center text-white">
              <Title
                level={2}
                className="text-white mb-4 font-bold"
              >
                {quiz.title}
              </Title>
              <Paragraph className="text-slate-300 text-base mb-4 max-w-2xl mx-auto">
                {quiz.description}
              </Paragraph>
              <div className="flex items-center justify-center space-x-3">
                <span className="px-3 py-1 bg-white/10 rounded-md text-xs font-medium text-slate-300">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 rounded-md text-xs font-medium text-emerald-300">
                  Published
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Quiz Content */}
        <QuizPreview quiz={quiz} questions={questions || []} />
      </div>
    </div>
  );
}
