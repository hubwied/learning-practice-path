import type {
  Category,
  DueFilter,
  FieldErrors,
  Filters,
  Priority,
  Status,
  Task,
  TaskDraft,
} from "./types.ts";

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 500;
export const CATEGORY_MAX = 40;

export const PRIORITIES: Priority[] = ["low", "medium", "high"];
export const STATUSES: Status[] = ["todo", "in_progress", "done"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "niski",
  medium: "średni",
  high: "wysoki",
};

export const STATUS_LABEL: Record<Status, string> = {
  todo: "do zrobienia",
  in_progress: "w trakcie",
  done: "ukończone",
};

export const DUE_FILTER_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: "all", label: "wszystkie" },
  { value: "today", label: "na dzisiaj" },
  { value: "overdue", label: "przeterminowane" },
  { value: "none", label: "bez terminu" },
];

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function emptyFilters(): Filters {
  return {
    query: "",
    status: "all",
    priority: "all",
    categoryId: "all",
    due: "all",
  };
}

export function emptyDraft(categoryId: string): TaskDraft {
  return {
    title: "",
    description: "",
    priority: "medium",
    categoryId,
    status: "todo",
    dueDate: "",
  };
}

export function taskToDraft(task: Task): TaskDraft {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    categoryId: task.categoryId,
    status: task.status,
    dueDate: task.dueDate ?? "",
  };
}

export function todayString(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isValidDateString(value: string): boolean {
  const match = DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isPriority(value: unknown): value is Priority {
  return value === "low" || value === "medium" || value === "high";
}

export function isStatus(value: unknown): value is Status {
  return value === "todo" || value === "in_progress" || value === "done";
}

export function isOverdue(task: Pick<Task, "dueDate" | "status">, today: string): boolean {
  return task.dueDate !== null && task.dueDate < today && task.status !== "done";
}

export function matchesDue(task: Task, due: DueFilter, today: string): boolean {
  switch (due) {
    case "all":
      return true;
    case "today":
      return task.dueDate === today;
    case "overdue":
      return isOverdue(task, today);
    case "none":
      return task.dueDate === null;
    default:
      return true;
  }
}

export function formatDueDate(dueDate: string): string {
  const match = DATE_PATTERN.exec(dueDate);
  if (!match) return dueDate;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return new Date(year, month - 1, day).toLocaleDateString("pl-PL");
}

export function validateCategoryName(
  name: string,
  categories: Category[],
  exceptId?: string,
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Podaj nazwę kategorii.";
  if (trimmed.length > CATEGORY_MAX) return `Maksymalnie ${CATEGORY_MAX} znaków.`;
  const key = trimmed.toLocaleLowerCase("pl");
  const duplicate = categories.some(
    (category) =>
      category.id !== exceptId && category.name.trim().toLocaleLowerCase("pl") === key,
  );
  if (duplicate) return "Taka kategoria już istnieje.";
  return null;
}

export function validateTask(draft: TaskDraft, categories: Category[]): FieldErrors {
  const errors: FieldErrors = {};
  const title = draft.title.trim();
  if (!title) errors.title = "Podaj nazwę zadania.";
  else if (title.length > TITLE_MAX) errors.title = `Maksymalnie ${TITLE_MAX} znaków.`;

  if (draft.description.trim().length > DESCRIPTION_MAX) {
    errors.description = `Maksymalnie ${DESCRIPTION_MAX} znaków.`;
  }

  if (!categories.some((category) => category.id === draft.categoryId)) {
    errors.categoryId = "Wybierz kategorię.";
  }

  if (draft.dueDate !== "" && !isValidDateString(draft.dueDate)) {
    errors.dueDate = "Podaj poprawną datę.";
  }

  return errors;
}

export function taskFieldsFromDraft(draft: TaskDraft): Omit<Task, "id" | "createdAt"> {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    priority: draft.priority,
    categoryId: draft.categoryId,
    status: draft.status,
    dueDate: draft.dueDate === "" ? null : draft.dueDate,
  };
}

export type TaskCounts = {
  total: number;
  active: number;
  done: number;
};

export function summarizeTasks(tasks: readonly Task[]): TaskCounts {
  const done = tasks.filter((task) => task.status === "done").length;
  return {
    total: tasks.length,
    active: tasks.length - done,
    done,
  };
}

export function visibleTasks(tasks: Task[], filters: Filters, today: string): Task[] {
  const query = filters.query.trim().toLocaleLowerCase("pl");
  return tasks
    .filter((task) => {
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.priority !== "all" && task.priority !== filters.priority) return false;
      if (filters.categoryId !== "all" && task.categoryId !== filters.categoryId) return false;
      if (!matchesDue(task, filters.due, today)) return false;
      if (query.length > 0 && !task.title.toLocaleLowerCase("pl").includes(query)) return false;
      return true;
    })
    .sort((left, right) => right.createdAt - left.createdAt);
}
