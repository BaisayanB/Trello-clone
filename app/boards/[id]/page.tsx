"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableTask from "./SortableTask";
import TaskOverlay from "./TaskOverlay";
import DroppableColumn from "./DroppableColumn";

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    columns,
    createColumn,
    updateBoard,
    createTask,
    reorderTask,
    moveTask,
    updateColumn,
    updateTask,
    deleteColumn,
    deleteTask,
  } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
    null
  );

  const [filters, setFilters] = useState({
    priority: [] as string[],
    dueDate: null as string | null,
  });

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 12,
      },
    })
  );

  function handleFilterChange(
    type: "priority" | "dueDate",
    value: string | string[] | null
  ) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      priority: [] as string[],
      dueDate: null as string | null,
    });
  }

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
      });
      setIsEditingTitle(false);
    } catch {}
  }

  async function handleCreateTask(
    columnId: string,
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority:
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (!taskData.title.trim()) return;
    await createTask(columnId, taskData);
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );

    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );

    if (!sourceColumn || !targetColumn) return;
    if (sourceColumn.id !== targetColumn.id) return;

    const fromIndex = sourceColumn.tasks.findIndex(
      (task) => task.id === activeId
    );

    const toIndex = targetColumn.tasks.findIndex((task) => task.id === overId);

    if (fromIndex !== toIndex) {
      reorderTask(sourceColumn.id, fromIndex, toIndex);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const overId = over.id as string;

    // Source column
    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === taskId)
    );
    if (!sourceColumn) return;

    // Dropped on column
    const targetColumnById = columns.find((col) => col.id === overId);
    if (targetColumnById && sourceColumn.id !== targetColumnById.id) {
      await moveTask(
        taskId,
        targetColumnById.id,
        targetColumnById.tasks.length
      );
      return;
    }

    // Dropped on task
    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );

    if (!targetColumn) return;
    const oldIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
    const newIndex = targetColumn.tasks.findIndex((task) => task.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    await moveTask(taskId, targetColumn.id, newIndex);
  }

  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    await createColumn(newColumnTitle.trim());
    setNewColumnTitle("");
    setIsCreatingColumn(false);
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!editingColumnTitle.trim() || !editingColumn) return;
    await updateColumn(editingColumn.id, editingColumnTitle.trim());
    setEditingColumnTitle("");
    setIsEditingColumn(false);
    setEditingColumn(null);
  }

  async function handleDeleteColumn() {
    if (!editingColumn) return;

    await deleteColumn(editingColumn.id);

    setIsEditingColumn(false);
    setEditingColumn(null);
    setEditingColumnTitle("");
  }
  
  function handleEditColumn(column: ColumnWithTasks) {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      // Filter by priority
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      // Filter by due date
      if (filters.dueDate && task.due_date) {
        const taskDate = new Date(task.due_date).toDateString();
        const filterDate = new Date(filters.dueDate).toDateString();

        if (taskDate !== filterDate) {
          return false;
        }
      }

      return true;
    }),
  }));

  return (
    <>
      <div className="min-h-screen bg-fixed bg-radial from-white to-purple-50">
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? "");
            setIsEditingTitle(true);
          }}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) =>
              count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
            0
          )}
        />

        {/* Board Content */}
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
          {/* Stats and add column button */}
          <div className="flex flex-row items-center justify-between mb-6">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="text-sm text-purple-600">
                <span className="font-medium">Total Tasks: </span>
                {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="border-2 bg-white border-purple-500 text-purple-500 hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
              onClick={() => setIsCreatingColumn(true)}
            >
              <Plus />
              <span className="font-semibold">Add new List</span>
            </Button>
          </div>

          {/* Columns */}
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex flex-col gap-4 md:gap-6 md:items-center lg:items-start lg:flex-row lg:gap-6 lg:overflow-x-auto lg:pb-6 lg:px-2 lg:-mx-2 
              lg:[&::-webkit-scrollbar]:h-2 lg:[&::-webkit-scrollbar-track]:bg-white lg:[&::-webkit-scrollbar-thumb]:bg-purple-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full"
            >
              {filteredColumns.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  onCreateTask={handleCreateTask}
                  onEditColumn={handleEditColumn}
                >
                  <SortableContext
                    items={column.tasks.map((task) => task.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {column.tasks.map((task) => (
                        <SortableTask task={task} key={task.id} />
                      ))}
                    </div>
                  </SortableContext>
                </DroppableColumn>
              ))}

              <DragOverlay>
                {activeTask ? <TaskOverlay task={activeTask} /> : null}
              </DragOverlay>
            </div>
          </DndContext>
        </main>
      </div>

      <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
        <DialogContent className="w-[90vw] max-w-[425px] mx-auto border-2 border-purple-300 bg-purple-50 [&>button]:rounded-md">
          <DialogHeader>
            <DialogTitle className="text-purple-700">Edit Board</DialogTitle>
            <p className="text-sm text-purple-600">
              Change the current board title.
            </p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUpdateBoard}>
            <div className="space-y-2">
              <Label className="text-purple-600">Board Title</Label>
              <Input
                id="boardTitle"
                value={newTitle}
                className="border-purple-300 bg-white text-purple-600 placeholder:text-purple-500 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter board title..."
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end pt-4 gap-2">
              <Button
                type="button"
                variant="ghost"
                className="border border-purple-300 text-purple-500 bg-white hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                onClick={() => setIsEditingTitle(false)}
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
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto border-2 border-purple-300 bg-purple-50 [&>button]:rounded-md">
          <DialogHeader>
            <DialogTitle className="text-purple-700">Filter Tasks</DialogTitle>
            <p className="text-sm text-purple-600">
              Filter tasks by priority or due date
            </p>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsFilterOpen(false);
            }}
          >
            <div className="space-y-3">
              <Label className="text-purple-600">Priority</Label>
              <div className="flex flex-wrap gap-2">
                {(["low", "medium", "high"] as const).map((priority) => {
                  const isActive = filters.priority.includes(priority);
                  return (
                    <Button
                      key={priority}
                      type="button"
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      className={
                        isActive
                          ? "bg-purple-500 hover:bg-purple-600"
                          : "border-purple-300 text-purple-500 bg-white hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                      }
                      onClick={() =>
                        handleFilterChange(
                          "priority",
                          isActive
                            ? filters.priority.filter((p) => p !== priority)
                            : [...filters.priority, priority]
                        )
                      }
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-purple-600">Due Date</Label>
              <Input
                type="date"
                value={filters.dueDate || ""}
                className="border-purple-300 bg-white text-purple-600 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                onChange={(e) =>
                  handleFilterChange("dueDate", e.target.value || null)
                }
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end pt-4 gap-2">
              <Button
                type="button"
                variant="ghost"
                className="border border-purple-300 text-purple-500 bg-white hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
              <Button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600"
              >
                Apply Filters
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto border-2 border-purple-300 bg-purple-50 [&>button]:rounded-md">
          <DialogHeader>
            <DialogTitle className="text-purple-700">
              Create New Column
            </DialogTitle>
            <p className="text-sm text-purple-600">
              Add new column to organize your tasks
            </p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateColumn}>
            <div className="space-y-2">
              <Label className="text-purple-600">Column Title</Label>
              <Input
                id="columnTitle"
                value={newColumnTitle}
                className="border-purple-300 bg-white text-purple-600 placeholder:text-purple-500 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Enter column title..."
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end pt-4 gap-2">
              <Button
                type="button"
                onClick={() => setIsCreatingColumn(false)}
                variant="ghost"
                className="border border-purple-300 text-purple-500 bg-white hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600"
              >
                Create Column
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto border-2 border-purple-300 bg-purple-50 [&>button]:rounded-md">
          <DialogHeader>
            <DialogTitle className="text-purple-700">Edit Column</DialogTitle>
            <p className="text-sm text-purple-600">
              Update the title of your column
            </p>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleUpdateColumn}>
            <div className="space-y-2">
              <Label className="text-purple-600">Column Title</Label>
              <Input
                id="columnTitle"
                value={editingColumnTitle}
                onChange={(e) => setEditingColumnTitle(e.target.value)}
                className="border-purple-300 bg-white text-purple-600 placeholder:text-purple-500 focus-visible:ring-purple-200 focus-visible:border-purple-300"
                placeholder="Enter column title..."
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between pt-4 gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteColumn}
              >
                Delete Column
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsEditingColumn(false);
                    setEditingColumnTitle("");
                    setEditingColumn(null);
                  }}
                  variant="ghost"
                  className="border border-purple-300 text-purple-500 bg-white hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Edit Column
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}