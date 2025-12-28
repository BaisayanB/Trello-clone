"use client";

import { useUser } from "@clerk/nextjs";
import {
  boardDataService,
  boardService,
  columnService,
  taskService,
} from "../services";
import { useEffect, useState } from "react";
import { Board, ColumnWithTasks, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";

// Fetches all boards for user and used in dashboard page
export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoards() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const data = await boardService.getBoards(supabase!, user.id);
        setBoards(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load boards.");
      } finally {
        setLoading(false);
      }
    }
    loadBoards();
  }, [user, supabase]);

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) throw new Error("User not authenticated");

    try {
      setError(null);
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase!,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create board.");
    }
  }

  async function updateBoard(
    boardId: string,
    updates: {
      title?: string;
      description?: string;
      color?: string;
    }
  ) {
    try {
      setError(null);
      const updatedBoard = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoards((prev) =>
        prev.map((board) => (board.id === boardId ? updatedBoard : board))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update board.");
    }
  }

  async function deleteBoard(boardId: string) {
    try {
      setError(null);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      await boardService.deleteBoard(supabase!, boardId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete board.");
    }
  }

  return { boards, loading, error, createBoard, updateBoard, deleteBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoard() {
      if (!boardId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await boardDataService.getBoardWithColumns(
          supabase!,
          boardId
        );
        setBoard(data.board);
        setColumns(data.columnsWithTasks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load boards.");
      } finally {
        setLoading(false);
      }
    }
    loadBoard();
  }, [boardId, supabase]);

  async function updateBoard(
    boardId: string,
    updates: {
      title?: string;
      description?: string;
      color?: string;
    }
  ) {
    try {
      const updated = await boardService.updateBoard(
        supabase!,
        boardId,
        updates
      );
      setBoard(updated);
      return updated;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the board."
      );
    }
  }

  async function createTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    }
  ) {
    try {
      const column = columns.find((c) => c.id === columnId);
      if (!column) throw new Error("Column not found");

      const newTask = await taskService.createTask(supabase!, {
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order: column.tasks.length,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task."
      );
    }
  }

  function reorderTask(columnId: string, fromIndex: number, toIndex: number) {
    setColumns((prev) =>
      prev.map((col) => {
        if (col.id !== columnId) return col;

        const tasks = [...col.tasks];
        const [moved] = tasks.splice(fromIndex, 1);
        tasks.splice(toIndex, 0, moved);

        return { ...col, tasks };
      })
    );
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    try {
      await taskService.moveTask(supabase!, taskId, newColumnId, newOrder);

      setColumns((prev) => {
        const next = structuredClone(prev);

        let movedTask: Task | null = null;
        for (const col of next) {
          const idx = col.tasks.findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            movedTask = col.tasks.splice(idx, 1)[0];
            break;
          }
        }

        if (movedTask) {
          const target = next.find((c) => c.id === newColumnId);
          if (target) {
            target.tasks.splice(newOrder, 0, movedTask);
          }
        }

        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task.");
    }
  }

  async function updateTask(
    taskId: string,
    updates: {
      title?: string;
      description?: string | null;
      dueDate?: string | null;
      priority?: "low" | "medium" | "high";
    }
  ): Promise<Task | undefined> {
    try {
      const updatedTask = await taskService.updateTask(supabase!, taskId, {
        title: updates.title,
        description: updates.description ?? null,
        priority: updates.priority,
        due_date: updates.dueDate ?? null,
      });

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === taskId ? updatedTask : task
          ),
        }))
      );
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task.");
    }
  }
  
  async function deleteTask(taskId: string) {
    try {
      await taskService.deleteTask(supabase!, taskId);

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== taskId),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    }
  }  

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");

    try {
      const newColumn = await columnService.createColumn(supabase!, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });

      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function updateColumn(columnId: string, title: string) {
    try {
      const updated = await columnService.updateColumnTitle(
        supabase!,
        columnId,
        title
      );

      setColumns((prev) =>
        prev.map((col) => (col.id === columnId ? { ...col, ...updated } : col))
      );

      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function deleteColumn(columnId: string) {
    try {
      await columnService.deleteColumn(supabase!, columnId);
      setColumns((prev) => prev.filter((col) => col.id !== columnId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete column.");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createTask,
    reorderTask,
    moveTask,
    updateTask,
    deleteTask,
    createColumn,
    updateColumn,
    deleteColumn,
  };
}