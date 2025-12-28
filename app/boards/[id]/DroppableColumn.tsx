"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { ColumnWithTasks } from "@/lib/supabase/models";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { MoreHorizontal, Plus } from "lucide-react";

export default function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (
    columnId: string,
    e: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={`w-full md:max-w-xl lg:mx-0 lg:shrink-0 lg:w-80 ${
        isOver ? "bg-purple-100 rounded-lg" : ""
      }`}
    >
      <div
        className={`bg-white rounded-lg shadow-md shadow-purple-200 border border-purple-300 ${
          isOver ? "ring-2 ring-purple-300" : ""
        }`}
      >
        {/* Column Header */}
        <div className="p-4 border-b border-purple-300 shadow-sm shadow-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="font-semibold text-purple-700 text-base sm:text-lg truncate">
                {column.title}
              </h3>
              <Badge
                variant="secondary"
                className="text-xs text-purple-600 bg-purple-100 shrink-0"
              >
                {column.tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 hover:bg-purple-100"
              onClick={() => onEditColumn(column)}
            >
              <MoreHorizontal className="text-purple-600" />
            </Button>
          </div>
        </div>

        {/* column content */}
        <div className="p-3">
          {children}
          <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full mt-3 text-purple-500 hover:bg-purple-100 hover:text-purple-600"
                onClick={() => setIsCreateTaskOpen(true)}
              >
                <Plus />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto border-2 border-purple-300 bg-purple-50 [&>button]:rounded-md">
              <DialogHeader>
                <DialogTitle className="text-purple-700">
                  Create New Task
                </DialogTitle>
                <p className="text-sm text-purple-600">
                  Add a task to the board
                </p>
              </DialogHeader>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  await onCreateTask(column.id, e);
                  setIsCreateTaskOpen(false);
                }}
              >
                <div className="space-y-2">
                  <Label className="text-purple-600">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    className="border-purple-300 bg-white text-purple-600 placeholder:text-purple-500 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                    placeholder="Enter task title"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-600">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="border-purple-300 bg-white text-purple-600 placeholder:text-purple-500 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-600">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger className="border-purple-300 bg-white text-purple-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-purple-300 bg-white">
                      {["low", "medium", "high"].map((priority, key) => (
                        <SelectItem
                          key={key}
                          value={priority}
                          className="text-purple-600 focus:bg-purple-100 focus:text-purple-700"
                        >
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-600">Due Date</Label>
                  <Input
                    type="date"
                    className="border-purple-300 bg-white text-purple-600 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                    id="dueDate"
                    name="dueDate"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end">
                  <Button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-600"
                    disabled={!column}
                  >
                    Create Task
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
