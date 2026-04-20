"use client";

import type React from "react";
import { useState } from "react";
import { Card, Typography, Radio, Input, Button, Progress, Result } from "antd";
import type { Quiz, Question } from "@/lib/types";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  MehOutlined,
  SmileOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

interface QuizPreviewProps {
  quiz: Quiz;
  questions: Question[];
  readOnly?: boolean;
}

const QuizPreview: React.FC<QuizPreviewProps> = ({
  quiz,
  questions,
  readOnly = false,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setIsSubmitting(true);
      setTimeout(() => {
        setShowResults(true);
        setIsSubmitting(false);
      }, 1000);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const calculateScore = () => {
    let correctAnswers = 0;

    questions.forEach((question) => {
      if (answers[question.id] === question.correct_answer) {
        correctAnswers++;
      }
    });

    return {
      score: correctAnswers,
      total: questions.length,
      percentage: Math.round((correctAnswers / questions.length) * 100),
    };
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
  };

  const getSortedOptions = (options: Record<string, string>) => {
    return Object.entries(options).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const getResultIcon = (percentage: number) => {
    if (percentage >= 80)
      return <TrophyOutlined className="text-5xl text-amber-500" />;
    if (percentage >= 60)
      return <SmileOutlined className="text-5xl text-emerald-500" />;
    return <MehOutlined className="text-5xl text-orange-500" />;
  };

  const getResultMessage = (percentage: number) => {
    if (percentage >= 80)
      return {
        title: "Outstanding!",
        subtitle: "You're a quiz master!",
        color: "text-amber-600",
      };
    if (percentage >= 60)
      return {
        title: "Great Job!",
        subtitle: "Well done, keep it up!",
        color: "text-emerald-600",
      };
    return {
      title: "Keep Practicing!",
      subtitle: "You'll get better with practice!",
      color: "text-orange-600",
    };
  };

  if (questions.length === 0) {
    return (
      <Result
        status="warning"
        title="No Questions"
        subTitle="This quiz doesn't have any questions yet."
      />
    );
  }

  if (showResults) {
    const { score, total, percentage } = calculateScore();
    const resultMessage = getResultMessage(percentage);

    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto">
          {/* Results Header */}
          <Card className="mb-6 border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <div className="text-center py-10">
              <div className="animate-bounce mb-5">
                {getResultIcon(percentage)}
              </div>

              <Title level={2} className={`mb-2 ${resultMessage.color}`}>
                {resultMessage.title}
              </Title>

              <Paragraph className="text-base text-slate-500 mb-6">
                {resultMessage.subtitle}
              </Paragraph>

              <div className="flex justify-center items-center space-x-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {score}
                  </div>
                  <div className="text-slate-400 text-sm">Correct</div>
                </div>
                <div className="text-4xl text-slate-200 font-light">/</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-600 mb-1">
                    {total}
                  </div>
                  <div className="text-slate-400 text-sm">Total</div>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <div className="relative w-28 h-28">
                  <Progress
                    type="circle"
                    percent={percentage}
                    size={112}
                    strokeColor={{
                      "0%": "#10b981",
                      "100%": "#0d9488",
                    }}
                    strokeWidth={8}
                  />
                </div>
              </div>

              <Button
                type="primary"
                onClick={resetQuiz}
                size="large"
                className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg font-semibold shadow-md shadow-emerald-500/20 transition-all duration-200"
              >
                Try Again
              </Button>
            </div>
          </Card>

          {/* Question Review */}
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <Title level={4} className="mb-1 text-slate-800">
                Question Review
              </Title>
              <Paragraph className="text-slate-500 mb-0 text-sm">
                See how you performed on each question
              </Paragraph>
            </div>

            <div className="p-5 space-y-4">
              {questions.map((question, index) => {
                const isCorrect =
                  answers[question.id] === question.correct_answer;
                return (
                  <Card
                    key={question.id}
                    className={`border rounded-xl transition-all duration-200 ${
                      isCorrect
                        ? "border-emerald-200 bg-emerald-50/50"
                        : "border-red-200 bg-red-50/50"
                    } shadow-sm`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm ${
                          isCorrect
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CloseCircleOutlined />
                        )}
                      </div>

                      <div className="grow">
                        <div className="flex items-center space-x-2 mb-2">
                          <Title level={5} className="mb-0 text-slate-700">
                            Question {index + 1}
                          </Title>
                          <div
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                              isCorrect
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isCorrect ? "Correct" : "Incorrect"}
                          </div>
                        </div>

                        <Paragraph className="text-slate-600 mb-3">
                          {question.question_text}
                        </Paragraph>

                        {(question.question_type === "two_choices" ||
                          question.question_type === "four_choices") && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {getSortedOptions(question.options).map(
                              ([key, value]) => (
                                <div
                                  key={key}
                                  className={`p-3 rounded-lg border transition-all duration-200 ${
                                    key === question.correct_answer
                                      ? "border-emerald-300 bg-emerald-50"
                                      : key === answers[question.id] &&
                                        key !== question.correct_answer
                                      ? "border-red-300 bg-red-50"
                                      : "border-slate-200 bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                                        key === question.correct_answer
                                          ? "bg-emerald-500 text-white"
                                          : key === answers[question.id] &&
                                            key !== question.correct_answer
                                          ? "bg-red-500 text-white"
                                          : "bg-slate-200 text-slate-500"
                                      }`}
                                    >
                                      {key.toUpperCase()}
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-slate-700">
                                      {value}
                                    </span>
                                    {key === question.correct_answer && (
                                      <CheckCircleOutlined className="text-emerald-500" />
                                    )}
                                    {key === answers[question.id] &&
                                      key !== question.correct_answer && (
                                        <CloseCircleOutlined className="text-red-500" />
                                      )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                        {question.question_type === "input" && (
                          <div className="space-y-2">
                            <div className="p-3 bg-slate-100 rounded-lg">
                              <Text className="text-slate-600 text-sm">
                                Your answer:{" "}
                              </Text>
                              <Text
                                className={`font-bold text-sm ${
                                  isCorrect ? "text-emerald-600" : "text-red-600"
                                }`}
                              >
                                {answers[question.id] || "No answer provided"}
                              </Text>
                            </div>
                            {!isCorrect && (
                              <div className="p-3 bg-emerald-50 rounded-lg">
                                <Text className="text-emerald-700 text-sm">
                                  Correct answer:{" "}
                                </Text>
                                <Text className="text-emerald-800 font-bold text-sm">
                                  {question.correct_answer}
                                </Text>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Card */}
        <Card className="mb-6 border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <span className="text-white font-bold text-xl">
                    {currentQuestionIndex + 1}
                  </span>
                </div>
                <div>
                  <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                    Progress
                  </Text>
                  <div className="text-lg font-bold text-slate-800">
                    {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Text className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                  Completion
                </Text>
                <div className="text-lg font-bold text-emerald-600">
                  {Math.round(
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  )}
                  %
                </div>
              </div>
            </div>

            <Progress
              percent={Math.round(
                ((currentQuestionIndex + 1) / questions.length) * 100
              )}
              showInfo={false}
              status="active"
              strokeColor={{
                "0%": "#10b981",
                "100%": "#0d9488",
              }}
              railColor="#f1f5f9"
              size={[-1, 8]}
              className="mb-0"
            />
          </div>
        </Card>

        {/* Question Card */}
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white animate-fade-in-up">
          <div className="bg-slate-800 p-6 text-white">
            <h2 className="text-white text-xl font-semibold mb-3 leading-snug animate-slide-in">
              {currentQuestion.question_text}
            </h2>
            <div className="flex items-center space-x-2 opacity-80">
              <span className="px-3 py-1 bg-white/10 rounded-md text-xs font-medium">
                {currentQuestion.question_type === "two_choices" &&
                  "Binary Choice"}
                {currentQuestion.question_type === "four_choices" &&
                  "Multiple Choice"}
                {currentQuestion.question_type === "input" && "Text Answer"}
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-md text-xs font-medium">
                Q{currentQuestionIndex + 1}
              </span>
            </div>
          </div>

          <div className="p-6">
            {(currentQuestion.question_type === "two_choices" ||
              currentQuestion.question_type === "four_choices") && (
              <Radio.Group
                onChange={(e) => handleAnswer(e.target.value)}
                value={answers[currentQuestion.id]}
                className="w-full"
                disabled={readOnly}
              >
                <div className="space-y-3">
                  {getSortedOptions(currentQuestion.options).map(
                    ([key, value], index) => (
                      <div
                        key={key}
                        className="group animate-slide-in"
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <Radio value={key} className="w-full p-0 m-0">
                          <div
                            className={`
                          w-full p-4 border rounded-xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5
                          ${
                            answers[currentQuestion.id] === key
                              ? "border-emerald-400 bg-emerald-50 shadow-sm shadow-emerald-100"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }
                          ${
                            readOnly && key === currentQuestion.correct_answer
                              ? "border-emerald-400 bg-emerald-50"
                              : ""
                          }
                        `}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`
                              w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200
                              ${
                                answers[currentQuestion.id] === key
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                              }
                              ${
                                readOnly &&
                                key === currentQuestion.correct_answer
                                  ? "bg-emerald-500 text-white"
                                  : ""
                              }
                            `}
                              >
                                {key.toUpperCase()}
                              </div>
                              <span className="text-base text-slate-700 flex-1 font-medium">
                                {value}
                              </span>
                              {readOnly &&
                                key === currentQuestion.correct_answer && (
                                  <CheckCircleOutlined className="text-emerald-500 text-lg" />
                                )}
                            </div>
                          </div>
                        </Radio>
                      </div>
                    )
                  )}
                </div>
              </Radio.Group>
            )}

            {currentQuestion.question_type === "input" && (
              <div className="space-y-3 animate-fade-in">
                <Input
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  disabled={readOnly}
                  className="h-12 text-base border-slate-200 rounded-xl hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                  size="large"
                />
                {readOnly && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl animate-slide-in">
                    <Text className="text-emerald-700 font-medium">
                      Correct answer: {currentQuestion.correct_answer}
                    </Text>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 pb-6">
            <div className="flex justify-between items-center">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                size="large"
                className="h-11 px-6 border border-slate-200 hover:border-slate-300 transition-all duration-200 rounded-lg font-medium disabled:opacity-50"
              >
                <span className="flex items-center space-x-2">
                  <span>←</span>
                  <span>Previous</span>
                </span>
              </Button>

              <Button
                type="primary"
                onClick={handleNext}
                disabled={!readOnly && !answers[currentQuestion.id]}
                loading={isSubmitting}
                size="large"
                className="h-11 px-6 bg-emerald-500 hover:bg-emerald-600 border-0 transition-all duration-200 rounded-lg font-semibold shadow-md shadow-emerald-500/20"
              >
                <span className="flex items-center space-x-2">
                  <span>{isLastQuestion ? "Finish Quiz" : "Next"}</span>
                  <span>{isLastQuestion ? "" : "→"}</span>
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QuizPreview;
