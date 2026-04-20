'use client'
import { Question } from '@/lib/types'
import { closestCenter, DndContext, type DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import React, { useEffect, useState } from 'react'
import SortableQuestion from './SortableQuestion'

const SortableQuestionList = ({ questions,onReorder,onDelete,onEdit }: { questions: Question[], onReorder: (items: Question[]) => void, onDelete: (id: string) => void, onEdit: (question: Question) => void }) => {
    const [items, setItems] = useState<Question[]>(questions)


    // Update items when questions prop changes
    useEffect(() => {
        setItems(questions)
    }, [questions])
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Minimum distance required before activating
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) return

        const activeId = String(active.id)
        const overId = String(over.id)
        if (activeId === overId) return

        setItems((items) => {
            const oldIndex = items.findIndex((item) => String(item.id) === activeId)
            const newIndex = items.findIndex((item) => String(item.id) === overId)
            if (oldIndex < 0 || newIndex < 0) return items

            const reorderedItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
                ...item,
                order: index,
            }))

            queueMicrotask(() => onReorder(reorderedItems))

            return reorderedItems
        })
    }


    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(question => question.id)}>
                <div className="space-y-4">
                    {items.map((question, index) => (
                        <SortableQuestion key={question.id} question={question} index={index} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}

export default SortableQuestionList
