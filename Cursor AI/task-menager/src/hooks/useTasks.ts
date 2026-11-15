import { useMemo, useState } from "react";
import { emptyFilters, taskFieldsFromDraft, todayString, validateCategoryName, validateTask, visibleTasks } from "../domain.ts";
import { loadState, saveState } from "../storage.ts";
import type { Category, FieldErrors, Filters, Notice, Status, Task, TaskDraft } from "../types.ts";

const CORRUPT_NOTICE: Notice = {
  kind: "error",
  text: "Zapis w przeglądarce był uszkodzony. Zaczynam od pustej listy.",
};

const PARTIAL_NOTICE: Notice = {
  kind: "info",
  text: "Część zapisanych danych była niepoprawna i została pominięta.",
};

const SAVE_NOTICE: Notice = {
  kind: "error",
  text: "Nie udało się zapisać danych w tej przeglądarce. Zmiany są tylko do odświeżenia strony.",
};

const CATEGORY_IN_USE_NOTICE: Notice = {
  kind: "error",
  text: "Najpierw przepnij albo usuń zadania z tej kategorii.",
};

function noticeFromLoad(categoriesStatus: string, tasksStatus: string): Notice {
  if (categoriesStatus === "corrupt" || tasksStatus === "corrupt") return CORRUPT_NOTICE;
  if (categoriesStatus === "partial" || tasksStatus === "partial") return PARTIAL_NOTICE;
  return null;
}

function initialState(): { categories: Category[]; tasks: Task[]; notice: Notice } {
  const loaded = loadState();
  return {
    categories: loaded.categories.data,
    tasks: loaded.tasks.data,
    notice: noticeFromLoad(loaded.categories.status, loaded.tasks.status),
  };
}

export function useTasks() {
  const [stored] = useState(initialState);
  const [categories, setCategories] = useState<Category[]>(stored.categories);
  const [tasks, setTasks] = useState<Task[]>(stored.tasks);
  const [filters, setFiltersState] = useState<Filters>(emptyFilters);
  const [notice, setNotice] = useState<Notice>(stored.notice);
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = todayString();

  const visible = useMemo(
    () => visibleTasks(tasks, filters, today),
    [tasks, filters, today],
  );

  const categoryNameById = useMemo(() => {
    const names = new Map<string, string>();
    for (const category of categories) names.set(category.id, category.name);
    return names;
  }, [categories]);

  const todoCount = tasks.filter((task) => task.status === "todo").length;
  const inProgressCount = tasks.filter((task) => task.status === "in_progress").length;
  const editingTask = tasks.find((task) => task.id === editingId) ?? null;

  function persist(nextCategories: Category[], nextTasks: Task[]) {
    const result = saveState(nextCategories, nextTasks);
    if (!result.ok) setNotice(SAVE_NOTICE);
  }

  function commitCategories(next: Category[]) {
    setCategories(next);
    persist(next, tasks);
  }

  function commitTasks(next: Task[]) {
    setTasks(next);
    persist(categories, next);
  }

  function applyDraft(
    draft: TaskDraft,
  ): { ok: false; errors: FieldErrors } | { ok: true; fields: Omit<Task, "id" | "createdAt"> } {
    const errors = validateTask(draft, categories);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, fields: taskFieldsFromDraft(draft) };
  }

  function addCategory(name: string): string | null {
    const error = validateCategoryName(name, categories);
    if (error) return error;
    commitCategories([...categories, { id: crypto.randomUUID(), name: name.trim() }]);
    return null;
  }

  function renameCategory(id: string, name: string): string | null {
    const error = validateCategoryName(name, categories, id);
    if (error) return error;
    commitCategories(
      categories.map((category) => (category.id === id ? { ...category, name: name.trim() } : category)),
    );
    return null;
  }

  function deleteCategory(id: string) {
    if (tasks.some((task) => task.categoryId === id)) {
      setNotice(CATEGORY_IN_USE_NOTICE);
      return;
    }
    commitCategories(categories.filter((category) => category.id !== id));
    setFiltersState((current) =>
      current.categoryId === id ? { ...current, categoryId: "all" } : current,
    );
  }

  function addTask(draft: TaskDraft): FieldErrors {
    const applied = applyDraft(draft);
    if (!applied.ok) return applied.errors;
    commitTasks([{ id: crypto.randomUUID(), createdAt: Date.now(), ...applied.fields }, ...tasks]);
    return {};
  }

  function updateTask(id: string, draft: TaskDraft): FieldErrors {
    const applied = applyDraft(draft);
    if (!applied.ok) return applied.errors;
    commitTasks(tasks.map((task) => (task.id === id ? { ...task, ...applied.fields } : task)));
    setEditingId(null);
    return {};
  }

  function setStatus(id: string, status: Status) {
    commitTasks(tasks.map((task) => (task.id === id ? { ...task, status } : task)));
  }

  function deleteTask(id: string) {
    commitTasks(tasks.filter((task) => task.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function setFilters(patch: Partial<Filters>) {
    setFiltersState((current) => ({ ...current, ...patch }));
  }

  function startEdit(id: string) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function dismissNotice() {
    setNotice(null);
  }

  return {
    categories,
    tasks,
    visibleTasks: visible,
    filters,
    notice,
    editingTask,
    today,
    todoCount,
    inProgressCount,
    categoryNameById,
    addCategory,
    renameCategory,
    deleteCategory,
    addTask,
    updateTask,
    setStatus,
    deleteTask,
    setFilters,
    startEdit,
    cancelEdit,
    dismissNotice,
  };
}
