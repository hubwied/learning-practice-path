import { CATEGORY_MAX, DESCRIPTION_MAX, TITLE_MAX, isPriority, isStatus, isValidDateString } from "./domain.ts";
import type { Category, Task } from "./types.ts";

export const CATEGORIES_KEY = "task-manager.categories";
export const TASKS_KEY = "task-manager.tasks";

export type LoadStatus = "ok" | "corrupt" | "partial";

export type LoadResult<T> = {
  status: LoadStatus;
  data: T[];
};

export type SaveResult = { ok: true } | { ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    value.name.trim().length <= CATEGORY_MAX
  );
}

function isTask(value: unknown, categoryIds: ReadonlySet<string>): value is Task {
  if (!isRecord(value)) return false;
  const dueDate = value.dueDate;
  const dueOk = dueDate === null || (typeof dueDate === "string" && isValidDateString(dueDate));
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    value.title.trim().length <= TITLE_MAX &&
    typeof value.description === "string" &&
    value.description.trim().length <= DESCRIPTION_MAX &&
    isPriority(value.priority) &&
    typeof value.categoryId === "string" &&
    categoryIds.has(value.categoryId) &&
    isStatus(value.status) &&
    dueOk &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt)
  );
}

function readJson(key: string): { missing: true } | { corrupt: true } | { value: unknown } {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return { missing: true };
    return { value: JSON.parse(raw) as unknown };
  } catch {
    return { corrupt: true };
  }
}

export function loadCategories(): LoadResult<Category> {
  const read = readJson(CATEGORIES_KEY);
  if ("missing" in read) return { status: "ok", data: [] };
  if ("corrupt" in read) return { status: "corrupt", data: [] };
  if (!Array.isArray(read.value)) return { status: "corrupt", data: [] };

  const data: Category[] = [];
  const seen = new Set<string>();
  let dropped = false;
  for (const item of read.value) {
    if (!isCategory(item) || seen.has(item.id)) {
      dropped = true;
      continue;
    }
    seen.add(item.id);
    data.push({ id: item.id, name: item.name.trim() });
  }
  return { status: dropped ? "partial" : "ok", data };
}

export function loadTasks(categoryIds: ReadonlySet<string>): LoadResult<Task> {
  const read = readJson(TASKS_KEY);
  if ("missing" in read) return { status: "ok", data: [] };
  if ("corrupt" in read) return { status: "corrupt", data: [] };
  if (!Array.isArray(read.value)) return { status: "corrupt", data: [] };

  const data: Task[] = [];
  const seen = new Set<string>();
  let dropped = false;
  for (const item of read.value) {
    if (!isTask(item, categoryIds) || seen.has(item.id)) {
      dropped = true;
      continue;
    }
    seen.add(item.id);
    data.push({
      id: item.id,
      title: item.title.trim(),
      description: item.description.trim(),
      priority: item.priority,
      categoryId: item.categoryId,
      status: item.status,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
    });
  }
  return { status: dropped ? "partial" : "ok", data };
}

export function loadState(): { categories: LoadResult<Category>; tasks: LoadResult<Task> } {
  const categories = loadCategories();
  const categoryIds = new Set(categories.data.map((category) => category.id));
  return { categories, tasks: loadTasks(categoryIds) };
}

export function saveState(categories: Category[], tasks: Task[]): SaveResult {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
