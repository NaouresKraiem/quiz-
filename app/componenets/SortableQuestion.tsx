import { Question } from '@/lib/types'
import { Button, Card, Tag, Typography } from 'antd'
import React from 'react'
import {
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";


const SortableQuestion = ({ question, index, onEdit, onDelete }: { question: Question, index: number, onEdit: (question: Question) => void, onDelete: (id: string) => void }) => {

  const { Text, Title } = Typography;

  const { attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, } = useSortable({
      id: question.id,
    });
  // dnd-kit gives us a transform while dragging; we apply it to the row container
  // for smooth movement and to ensure the dragged item visually follows the pointer.
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };
  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "two_choices":
        return <Tag color="cyan">Two Choices</Tag>;
      case "four_choices":
        return <Tag color="purple">Four Choices</Tag>;
      case "input":
        return <Tag color="green">Text Input</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const getSortedOptions = (options: Record<string, string>) => {
    return Object.entries(options).sort((a, b) => a[0].localeCompare(b[0]));
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card
        className={`
                border border-slate-200 shadow-sm transition-all duration-200 rounded-xl overflow-hidden
                    
                bg-white
            `}
      >
        <div className="p-5">
          <div className="flex items-start space-x-3">
            <Button
              type="text"
              icon={<MenuOutlined />}
              className="cursor-grab hover:cursor-grabbing text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all duration-200 rounded-lg mt-0.5"
              {...attributes}
              {...listeners}
            />
            <div className="shrink-0 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-emerald-500/20">
              {index + 1}
            </div>

            <div className="flex justify-between mb-3  w-full">
              <div className="flex items-center space-x-2 mb-1">
                <Title
                  level={5}
                  className="mb-0 text-slate-800 line-clamp-2"
                >
                  {question.question_text}
                </Title>
                {getQuestionTypeLabel(question.question_type)}
              </div>

              <div className="flex space-x-1">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => onEdit(question)}
                  className="text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all duration-200 rounded-lg"
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(question.id)}
                  className="hover:bg-red-50 transition-all duration-200 rounded-lg"
                />
              </div>
            </div>

          </div>
          <div className="space-y-2">
            <Text className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Answer Options
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getSortedOptions(question.options).map(([key, value]) => (
                <div
                  key={key}
                  className={`
                        p-3 rounded-lg border transition-all duration-200
                        ${key === question.correct_answer
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                    }
                      `}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`
                          w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
                          ${key === question.correct_answer
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 text-slate-500"
                        }
                        `}
                    >
                      {key.toUpperCase()}
                    </div>
                    <span
                      className={`flex-1 text-sm ${key === question.correct_answer
                          ? "font-medium text-emerald-700"
                          : "text-slate-600"
                        }`}
                    >
                      {value}
                    </span>
                    {key === question.correct_answer && (
                      <CheckCircleOutlined className="text-emerald-500 text-sm" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SortableQuestion