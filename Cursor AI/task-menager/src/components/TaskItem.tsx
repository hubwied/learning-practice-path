import { useState } from "react";
import { PRIORITY_LABEL, formatDueDate, isOverdue } from "../domain.ts";
import type { Status, Task } from "../types.ts";
import { STATUS_CHOICES } from "../choices.ts";
import { ChoiceSelect } from "./ChoiceSelect.tsx";

type TaskItemProps = {
  task: Task;
  categoryName: string;
  today: string;
  isEditing: boolean;
  onStatus: (id: string, status: Status) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TaskItem({ task, categoryName, today, isEditing, onStatus, onEdit, onDelete }: TaskItemProps) {
  const [confirming, setConfirming] = useState(false);
  const overdue = isOverdue(task, today);
  return (
    <article className={`task${task.status === "done" ? " task-done" : ""}`}>
      <div className="task-top">
        <ChoiceSelect
          id={`status-${task.id}`}
          label="Status"
          labelClassName="status-field"
          wrapLabel
          value={task.status}
          options={STATUS_CHOICES}
          disabled={isEditing}
          onChange={(status) => onStatus(task.id, status)}
        />
        <h3 className="task-title">{task.title}</h3>
      </div>
      {task.description ? <p className="task-description">{task.description}</p> : null}
      <div className="badges">
        <span className={`badge priority-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
        <span className="badge category">{categoryName}</span>
        {task.dueDate ? (
          <span className={`badge due${overdue ? " due-overdue" : ""}`}>
            {overdue ? "Zaległe: " : "Termin: "}
            {formatDueDate(task.dueDate)}
          </span>
        ) : (
          <span className="badge due">Bez terminu</span>
        )}
      </div>
      <div className="task-actions">
        <button type="button" className="secondary" onClick={() => onEdit(task.id)}>
          Edytuj
        </button>
        {confirming ? (
          <div className="confirm">
            <span>Usunąć to zadanie?</span>
            <button type="button" className="danger" onClick={() => onDelete(task.id)}>
              Tak
            </button>
            <button type="button" className="secondary" onClick={() => setConfirming(false)}>
              Nie
            </button>
          </div>
        ) : (
          <button type="button" className="danger" onClick={() => setConfirming(true)}>
            Usuń
          </button>
        )}
      </div>
    </article>
  );
}
