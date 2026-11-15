import { PRIORITY_CHOICES, STATUS_CHOICES } from "../choices.ts";
import { ChoiceSelect } from "./ChoiceSelect.tsx";
import { useTaskDraft } from "../hooks/useTaskDraft.ts";
import type { Category, FieldErrors, Task, TaskDraft } from "../types.ts";

type TaskFormProps = {
  categories: Category[];
  editingTask: Task | null;
  onAdd: (draft: TaskDraft) => FieldErrors;
  onUpdate: (id: string, draft: TaskDraft) => FieldErrors;
  onCancel: () => void;
};

export function TaskForm({ categories, editingTask, onAdd, onUpdate, onCancel }: TaskFormProps) {
  const { draft, errors, update, handleSubmit, handleCancel } = useTaskDraft({
    categories,
    editingTask,
    onAdd,
    onUpdate,
    onCancel,
  });

  const noCategories = categories.length === 0;
  const categoryOptions = noCategories
    ? [{ value: "", label: "Brak kategorii" }]
    : categories.map((category) => ({ value: category.id, label: category.name }));

  return (
    <section className="panel" aria-labelledby="task-form-heading">
      <h2 id="task-form-heading">{editingTask ? "Edycja zadania" : "Nowe zadanie"}</h2>
      {noCategories ? <p className="hint">Najpierw dodaj kategorię.</p> : null}
      <form id="task-form" className="task-form" onSubmit={handleSubmit}>
        <label htmlFor="task-title">Nazwa</label>
        <input
          id="task-title"
          value={draft.title}
          onChange={(event) => update("title", event.target.value)}
          autoComplete="off"
        />
        {errors.title ? <p className="field-error">{errors.title}</p> : null}

        <label htmlFor="task-description">Opis</label>
        <textarea
          id="task-description"
          value={draft.description}
          onChange={(event) => update("description", event.target.value)}
          rows={3}
        />
        {errors.description ? <p className="field-error">{errors.description}</p> : null}

        <div className="form-grid">
          <div>
            <ChoiceSelect
              id="task-priority"
              label="Priorytet"
              value={draft.priority}
              options={PRIORITY_CHOICES}
              onChange={(priority) => update("priority", priority)}
            />
          </div>
          <div>
            <ChoiceSelect
              id="task-category"
              label="Kategoria"
              value={draft.categoryId}
              options={categoryOptions}
              disabled={noCategories}
              onChange={(categoryId) => update("categoryId", categoryId)}
            />
            {errors.categoryId ? <p className="field-error">{errors.categoryId}</p> : null}
          </div>
          <div>
            <ChoiceSelect
              id="task-status"
              label="Status"
              value={draft.status}
              options={STATUS_CHOICES}
              onChange={(status) => update("status", status)}
            />
          </div>
          <div>
            <label htmlFor="task-due">Termin</label>
            <input
              id="task-due"
              type="date"
              value={draft.dueDate}
              onChange={(event) => update("dueDate", event.target.value)}
            />
            {errors.dueDate ? <p className="field-error">{errors.dueDate}</p> : null}
          </div>
        </div>

        {noCategories && errors.categoryId ? <p className="field-error">{errors.categoryId}</p> : null}
        <div className="form-actions">
          <button type="submit">{editingTask ? "Zapisz" : "Dodaj zadanie"}</button>
          {editingTask ? (
            <button type="button" className="secondary" onClick={handleCancel}>
              Anuluj
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
