export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export type Category = {
  id: string;
  name: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  categoryId: string;
  status: Status;
  dueDate: string | null;
  createdAt: number;
};

export type TaskDraft = {
  title: string;
  description: string;
  priority: Priority;
  categoryId: string;
  status: Status;
  dueDate: string;
};

export type DueFilter = "all" | "today" | "overdue" | "none";

export type Filters = {
  query: string;
  status: "all" | Status;
  priority: "all" | Priority;
  categoryId: "all" | string;
  due: DueFilter;
};

export type Notice = {
  kind: "error" | "info";
  text: string;
} | null;

export type TaskField = "title" | "description" | "categoryId" | "dueDate";
export type FieldErrors = Partial<Record<TaskField, string>>;
