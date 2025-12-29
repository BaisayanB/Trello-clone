"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/lib/supabase/models";
import { Calendar } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical } from "lucide-react";
import { useState } from "react";

export default function SortableTask({
  task,
  onUpdateTask,
  onDeleteTask,
}: {
  task: Task;
  onUpdateTask: (
    taskId: string,
    updates: {
      title?: string;
      description?: string | null;
      priority?: "low" | "medium" | "high";
      dueDate?: string | null;
    }
  ) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}) {
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
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<Task["priority"]>(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ?? "");

  function openEdit() {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setDueDate(task.due_date ?? "");
    setIsEditOpen(true);
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={styles}
        {...listeners}
        {...attributes}
      >
        <Card className="cursor-pointer border-purple-300 hover:shadow-lg hover:shadow-purple-200 transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-purple-600 text-sm flex-1 min-w-0 pr-2">
                  {task.title}
                </h4>

                <Button
                  variant="ghost"
                  type="button"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit();
                  }}
                >
                  <MoreVertical className="h-4 w-4 text-purple-500" />
                </Button>
              </div>

              {task.description && (
                <p className="text-xs text-gray-600">{task.description}</p>
              )}

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
                  className={`w-3 h-3 mr-2 rounded-full shrink-0 ${
                    PRIORITY_COLOR_MAP[task.priority]
                  }`}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto border-2 border-purple-300 bg-purple-50 [&>button]:rounded-md">
          <DialogHeader>
            <DialogTitle className="text-purple-700">Edit Task</DialogTitle>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await onUpdateTask(task.id, {
                title: title.trim(),
                description: description.trim() || null,
                priority,
                dueDate: dueDate || null,
              });
              setIsEditOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label className="text-purple-600">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-purple-300 bg-white text-purple-600 placeholder:text-purple-500 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-purple-600">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-purple-300 bg-white text-purple-600 placeholder:text-purple-500 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-purple-600">Priority</Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value as Task["priority"])
                }
              >
                <SelectTrigger className="border-purple-300 bg-white text-purple-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-purple-300 bg-white">
                  {["low", "medium", "high"].map((priority) => (
                    <SelectItem
                      key={priority}
                      value={priority}
                      className="text-purple-600 focus:bg-purple-100 focus:text-purple-700"
                    >
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-purple-600">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border-purple-300 bg-white text-purple-600 focus-visible:ring-purple-200 focus-visible:border-purple-300"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  await onDeleteTask(task.id);
                  setIsEditOpen(false);
                }}
              >
                Delete
              </Button>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-purple-300 text-purple-500 bg-white hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
