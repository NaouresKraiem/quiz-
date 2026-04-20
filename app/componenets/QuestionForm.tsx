"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Form, Input, Select, Button, Card, Typography, Radio } from "antd";
import { useForm, Controller } from "react-hook-form";
import type { Question } from "@/lib/types";

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

type QuestionFormValues = {
  question_text: string;
  question_type: "two_choices" | "four_choices" | "input";
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

interface QuestionFormProps {
  initialData?: Question;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const baseDefaults = {
    question_text: "",
    question_type: "four_choices",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_answer: "",
  } satisfies QuestionFormValues;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuestionFormValues>({
    defaultValues: baseDefaults,
  });

  const questionType = watch("question_type");
  const [correctAnswer, setCorrectAnswer] = useState(
    initialData?.correct_answer || ""
  );

  useEffect(() => {
    const nextValues = {
      question_text: initialData?.question_text ?? "",
      question_type: initialData?.question_type ?? "four_choices",
      option_a: initialData?.options?.a ?? "",
      option_b: initialData?.options?.b ?? "",
      option_c: initialData?.options?.c ?? "",
      option_d: initialData?.options?.d ?? "",
      correct_answer: initialData?.correct_answer ?? "",
    };

    reset(nextValues);
    setCorrectAnswer(nextValues.correct_answer);
  }, [initialData, reset]);

  useEffect(() => {
    setValue("correct_answer", correctAnswer);
  }, [correctAnswer, setValue]);

  const handleFormSubmit = (data: any) => {
    const options: Record<string, string> = {};

    if (questionType === "two_choices") {
      options.a = data.option_a;
      options.b = data.option_b;
    } else if (questionType === "four_choices") {
      options.a = data.option_a;
      options.b = data.option_b;
      options.c = data.option_c;
      options.d = data.option_d;
    }

    const formattedData = {
      question_text: data.question_text,
      question_type: data.question_type,
      options: options,
      correct_answer: data.correct_answer,
    };

    onSubmit(formattedData);
  };

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white animate-fade-in-up">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <Title level={4} className="mb-1 text-slate-800">
          {initialData ? "Edit Question" : "Add New Question"}
        </Title>
        <Paragraph className="text-slate-500 mb-0 text-sm">
          Create engaging questions for your quiz
        </Paragraph>
      </div>

      <div className="p-6">
        <Form layout="vertical" onFinish={handleSubmit(handleFormSubmit)}>
          <div className="space-y-6">
            <Controller
              name="question_text"
              control={control}
              rules={{ required: "Question text is required" }}
              render={({ field, fieldState }) => (
                <Form.Item
                  label={
                    <span className="text-slate-700 font-medium">
                      Question Text
                    </span>
                  }
                  validateStatus={fieldState.error ? "error" : ""}
                  help={fieldState.error?.message}
                >
                  <TextArea
                    {...field}
                    rows={3}
                    placeholder="Enter your question here..."
                    className="border-slate-200 rounded-lg hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                  />
                </Form.Item>
              )}
            />

            <Controller
              name="question_type"
              control={control}
              rules={{ required: "Question type is required" }}
              render={({ field, fieldState }) => (
                <Form.Item
                  label={
                    <span className="text-slate-700 font-medium">
                      Question Type
                    </span>
                  }
                  validateStatus={fieldState.error ? "error" : ""}
                  help={fieldState.error?.message}
                >
                  <Select
                    {...field}
                    placeholder="Select question type"
                    size="large"
                    className="rounded-lg"
                    onChange={(value) => {
                      field.onChange(value);
                      setCorrectAnswer("");
                    }}
                  >
                    <Option value="two_choices">
                      <div className="flex items-center space-x-2 py-1">
                        <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>
                        <span className="font-medium">
                          Two Choices (Binary)
                        </span>
                      </div>
                    </Option>
                    <Option value="four_choices">
                      <div className="flex items-center space-x-2 py-1">
                        <div className="w-2.5 h-2.5 bg-violet-500 rounded-full"></div>
                        <span className="font-medium">
                          Four Choices (Multiple)
                        </span>
                      </div>
                    </Option>
                    <Option value="input">
                      <div className="flex items-center space-x-2 py-1">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                        <span className="font-medium">Text Input</span>
                      </div>
                    </Option>
                  </Select>
                </Form.Item>
              )}
            />

            {(questionType === "two_choices" ||
              questionType === "four_choices") && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Title level={5} className="mb-0 text-slate-700">
                    Answer Options
                  </Title>
                  <Paragraph className="text-xs text-slate-400 mb-0">
                    Select the correct answer below
                  </Paragraph>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="option_a"
                    control={control}
                    rules={{ required: "Option A is required" }}
                    render={({ field, fieldState }) => (
                      <Form.Item
                        validateStatus={fieldState.error ? "error" : ""}
                        help={fieldState.error?.message}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Radio
                              checked={correctAnswer === "a"}
                              onChange={() => setCorrectAnswer("a")}
                            />
                            <span className="font-medium text-slate-700 text-sm">
                              Option A
                            </span>
                          </div>
                          <Input
                            {...field}
                            placeholder="Enter option A"
                            size="large"
                            className="border-slate-200 rounded-lg hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                          />
                        </div>
                      </Form.Item>
                    )}
                  />

                  <Controller
                    name="option_b"
                    control={control}
                    rules={{ required: "Option B is required" }}
                    render={({ field, fieldState }) => (
                      <Form.Item
                        validateStatus={fieldState.error ? "error" : ""}
                        help={fieldState.error?.message}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Radio
                              checked={correctAnswer === "b"}
                              onChange={() => setCorrectAnswer("b")}
                            />
                            <span className="font-medium text-slate-700 text-sm">
                              Option B
                            </span>
                          </div>
                          <Input
                            {...field}
                            placeholder="Enter option B"
                            size="large"
                            className="border-slate-200 rounded-lg hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                          />
                        </div>
                      </Form.Item>
                    )}
                  />

                  {questionType === "four_choices" && (
                    <Controller
                      name="option_c"
                      control={control}
                      rules={{ required: "Option C is required" }}
                      render={({ field, fieldState }) => (
                        <Form.Item
                          validateStatus={fieldState.error ? "error" : ""}
                          help={fieldState.error?.message}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Radio
                                checked={correctAnswer === "c"}
                                onChange={() => setCorrectAnswer("c")}
                              />
                              <span className="font-medium text-slate-700 text-sm">
                                Option C
                              </span>
                            </div>
                            <Input
                              {...field}
                              placeholder="Enter option C"
                              size="large"
                              className="border-slate-200 rounded-lg hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                            />
                          </div>
                        </Form.Item>
                      )}
                    />
                  )}

                  {questionType === "four_choices" && (
                    <Controller
                      name="option_d"
                      control={control}
                      rules={{ required: "Option D is required" }}
                      render={({ field, fieldState }) => (
                        <Form.Item
                          validateStatus={fieldState.error ? "error" : ""}
                          help={fieldState.error?.message}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Radio
                                checked={correctAnswer === "d"}
                                onChange={() => setCorrectAnswer("d")}
                              />
                              <span className="font-medium text-slate-700 text-sm">
                                Option D
                              </span>
                            </div>
                            <Input
                              {...field}
                              placeholder="Enter option D"
                              size="large"
                              className="border-slate-200 rounded-lg hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                            />
                          </div>
                        </Form.Item>
                      )}
                    />
                  )}
                </div>

                <Controller
                  name="correct_answer"
                  control={control}
                  rules={{ required: "Please select the correct answer" }}
                  render={({ fieldState }) => (
                    <Form.Item
                      validateStatus={fieldState.error ? "error" : ""}
                      help={fieldState.error?.message}
                    >
                      <input type="hidden" value={correctAnswer} />
                    </Form.Item>
                  )}
                />
              </div>
            )}

            {questionType === "input" && (
              <Controller
                name="correct_answer"
                control={control}
                rules={{
                  required:
                    "Correct answer is required for text input questions",
                }}
                render={({ field, fieldState }) => (
                  <Form.Item
                    label={
                      <span className="text-slate-700 font-medium">
                        Correct Answer
                      </span>
                    }
                    validateStatus={fieldState.error ? "error" : ""}
                    help={fieldState.error?.message}
                  >
                    <Input
                      {...field}
                      placeholder="Enter the correct answer"
                      size="large"
                      className="border-slate-200 rounded-lg hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                    />
                  </Form.Item>
                )}
              />
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button
              onClick={onCancel}
              size="large"
              className="h-10 px-6 border-slate-200 hover:border-slate-300 transition-all duration-200 rounded-lg font-medium"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="h-10 px-6 bg-emerald-500 hover:bg-emerald-600 border-0 transition-all duration-200 rounded-lg font-semibold shadow-md shadow-emerald-500/20"
            >
              {initialData ? "Update Question" : "Add Question"}
            </Button>
          </div>
        </Form>
      </div>
    </Card>
  );
};

export default QuestionForm;
