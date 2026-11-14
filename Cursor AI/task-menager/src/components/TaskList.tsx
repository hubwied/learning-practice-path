import { TaskItem } from "./TaskItem.tsx";
import type { Status, Task } from "../types.ts";

type TaskListProps = {
  tasks: Task[];
  totalCount: number;
  categoryNameById: ReadonlyMap<string, string>;
  today: string;
  editingId: string | null;
  onStatus: (id: string, status: Status) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export function TaskList({
  tasks,
  totalCount,
  categoryNameById,
  today,
  editingId,
  onStatus,
  onEdit,
  onDelete,
}: TaskListProps) {
  return (
    <section className="panel" aria-labelledby="tasks-heading">
      <h2 id="tasks-heading">Zadania</h2>
      {totalCount === 0 ? <p className="empty">Brak zadań.</p> : null}
      {totalCount > 0 && tasks.length === 0 ? (
        <p className="empty">Żadne zadanie nie pasuje do filtrów.</p>
      ) : null}
      <div className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            categoryName={categoryNameById.get(task.categoryId) ?? "—"}
            today={today}
            isEditing={editingId === task.id}
            onStatus={onStatus}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
