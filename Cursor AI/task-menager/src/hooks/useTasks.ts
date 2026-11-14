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

  function addCategory(name: string): string | null {
    const error = validateCategoryName(name, categories);
    if (error) return error;
    const next = [...categories, { id: crypto.randomUUID(), name: name.trim() }];
    setCategories(next);
    persist(next, tasks);
    return null;
  }

  function renameCategory(id: string, name: string): string | null {
    const error = validateCategoryName(name, categories, id);
    if (error) return error;
    const next = categories.map((category) =>
      category.id === id ? { ...category, name: name.trim() } : category,
    );
    setCategories(next);
    persist(next, tasks);
    return null;
  }

  function deleteCategory(id: string) {
    if (tasks.some((task) => task.categoryId === id)) {
      setNotice(CATEGORY_IN_USE_NOTICE);
      return;
    }
    const next = categories.filter((category) => category.id !== id);
    setCategories(next);
    setFiltersState((current) =>
      current.categoryId === id ? { ...current, categoryId: "all" } : current,
    );
    persist(next, tasks);
  }

  function addTask(draft: TaskDraft): FieldErrors {
    const errors = validateTask(draft, categories);
    if (Object.keys(errors).length > 0) return errors;
    const next = [
      { id: crypto.randomUUID(), createdAt: Date.now(), ...taskFieldsFromDraft(draft) },
      ...tasks,
    ];
    setTasks(next);
    persist(categories, next);
    return {};
  }

  function updateTask(id: string, draft: TaskDraft): FieldErrors {
    const errors = validateTask(draft, categories);
    if (Object.keys(errors).length > 0) return errors;
    const fields = taskFieldsFromDraft(draft);
    const next = tasks.map((task) => (task.id === id ? { ...task, ...fields } : task));
    setTasks(next);
    setEditingId(null);
    persist(categories, next);
    return {};
  }

  function setStatus(id: string, status: Status) {
    const next = tasks.map((task) => (task.id === id ? { ...task, status } : task));
    setTasks(next);
    persist(categories, next);
  }

  function deleteTask(id: string) {
    const next = tasks.filter((task) => task.id !== id);
    setTasks(next);
    if (editingId === id) setEditingId(null);
    persist(categories, next);
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
