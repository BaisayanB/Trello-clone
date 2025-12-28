"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/supabase/models";
import { Calendar } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const PRIORITY_COLOR_MAP: Record<Task["priority"], string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-red-500",
  };
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <div ref={setNodeRef} style={styles} {...listeners} {...attributes}>
      <Card className="cursor-pointer border-purple-300 hover:shadow-lg hover:shadow-purple-200 transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Task Header */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-purple-600 text-sm flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
            </div>

            {/* Task Description */}
            {task.description && (
              <p className="text-xs text-gray-600">{task.description}</p>
            )}

            {/* Task Meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar
                      className={`h-3 w-3 ${
                        isOverdue ? "text-red-500 font-medium" : ""
                      }`}
                    />
                    <span
                      className={`truncate ${
                        isOverdue ? "text-red-500 font-medium" : ""
                      }`}
                    >
                      {task.due_date}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`w-3 h-3 mr-3 rounded-full shrink-0 ${
                  PRIORITY_COLOR_MAP[task.priority]
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
