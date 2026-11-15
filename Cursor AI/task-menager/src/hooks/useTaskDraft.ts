import { useEffect, useState, type FormEvent } from "react";
import { emptyDraft, taskToDraft } from "../domain.ts";
import type { Category, FieldErrors, Task, TaskDraft } from "../types.ts";

type UseTaskDraftArgs = {
  categories: Category[];
  editingTask: Task | null;
  onAdd: (draft: TaskDraft) => FieldErrors;
  onUpdate: (id: string, draft: TaskDraft) => FieldErrors;
  onCancel: () => void;
};

export function useTaskDraft({ categories, editingTask, onAdd, onUpdate, onCancel }: UseTaskDraftArgs) {
  const [draft, setDraft] = useState<TaskDraft>(() => emptyDraft(categories[0]?.id ?? ""));
  const [errors, setErrors] = useState<FieldErrors>({});

  const editingId = editingTask?.id ?? null;

  useEffect(() => {
    if (editingTask && editingId) {
      setDraft(taskToDraft(editingTask));
      setErrors({});
      document.getElementById("task-form")?.scrollIntoView({ block: "nearest" });
      return;
    }
    setDraft(emptyDraft(categories[0]?.id ?? ""));
    setErrors({});
    // The draft is reloaded only when the edited task changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  useEffect(() => {
    if (categories.length === 0) return;
    setErrors((current) => {
      if (current.categoryId !== "Najpierw dodaj kategorię.") return current;
      const next = { ...current };
      delete next.categoryId;
      return next;
    });
  }, [categories.length]);

  useEffect(() => {
    if (editingId) return;
    setDraft((current) => {
      if (current.categoryId && categories.some((category) => category.id === current.categoryId)) {
        return current;
      }
      return { ...current, categoryId: categories[0]?.id ?? "" };
    });
  }, [categories, editingId]);

  function update<K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (categories.length === 0) {
      setErrors({ categoryId: "Najpierw dodaj kategorię." });
      document.getElementById("category-name")?.focus();
      return;
    }
    const result = editingTask ? onUpdate(editingTask.id, draft) : onAdd(draft);
    setErrors(result);
    if (Object.keys(result).length === 0 && !editingTask) {
      setDraft(emptyDraft(categories[0]?.id ?? ""));
    }
  }

  function handleCancel() {
    onCancel();
    setDraft(emptyDraft(categories[0]?.id ?? ""));
    setErrors({});
  }

  return { draft, errors, update, handleSubmit, handleCancel };
}
