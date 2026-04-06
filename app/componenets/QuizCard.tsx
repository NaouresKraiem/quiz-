"use client";

import type React from "react";
import { Card, Typography, Badge, Button } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  CalendarOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import type { Quiz } from "@/lib/types";
import { useAuth } from "@/lib/auth";

const { Title, Paragraph, Text } = Typography;

interface QuizCardProps {
  quiz: Quiz;
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const { user } = useAuth();
  const isOwner = user?.id === quiz.author_id;

  return (
    <div className="group">
      <Card
        hoverable
        className="h-full flex flex-col overflow-hidden rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 bg-white"
        cover={
          <div className="relative h-44 w-full overflow-hidden">
            <Image
              src={quiz.cover_image || "/placeholder.svg?height=200&width=400"}
              alt={quiz.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="absolute top-3 right-3">
              {quiz.published ? (
                <Badge.Ribbon
                  text="Published"
                  color="#10b981"
                />
              ) : (
                isOwner && <Badge.Ribbon text="Draft" color="#f59e0b" />
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
              <div className="flex space-x-2">
                {isOwner && (
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      className="bg-white/90 backdrop-blur-sm border-0 text-slate-700 hover:bg-white rounded-lg shadow-md"
                    >
                      Edit
                    </Button>
                  </Link>
                )}
                <Link
                  href={
                    quiz.published
                      ? `/quizzes/${quiz.id}/published`
                      : `/quizzes/${quiz.id}/preview`
                  }
                >
                  <Button
                    type="primary"
                    icon={
                      quiz.published ? <PlayCircleOutlined /> : <EyeOutlined />
                    }
                    className="bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg shadow-md"
                  >
                    {quiz.published ? "Take Quiz" : "Preview"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        }
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-5 flex flex-col h-full">
          <div className="grow">
            <Title
              level={5}
              className="mb-2 line-clamp-2 text-slate-800! group-hover:text-emerald-600! transition-colors duration-200"
            >
              {quiz.title}
            </Title>
            <Paragraph className="text-slate-500 mb-3 line-clamp-2 text-sm leading-relaxed">
              {quiz.description}
            </Paragraph>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <CalendarOutlined className="text-xs" />
              <Text className="text-xs">
                {new Date(quiz.created_at).toLocaleDateString()}
              </Text>
            </div>

            <div className="flex items-center space-x-2">
              {quiz.published && (
                <div className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-semibold">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QuizCard;
