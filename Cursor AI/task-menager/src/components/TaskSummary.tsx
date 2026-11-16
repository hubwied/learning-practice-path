import { summarizeTasks } from "../domain.ts";
import type { Task } from "../types.ts";

type TaskSummaryProps = {
  tasks: Task[];
};

export function TaskSummary({ tasks }: TaskSummaryProps) {
  const { total, active, done } = summarizeTasks(tasks);

  return (
    <section className="task-summary" aria-labelledby="task-summary-heading">
      <h2 id="task-summary-heading" className="visually-hidden">
        Podsumowanie zadań
      </h2>
      <ul>
        <li>
          Wszystkie: <strong>{total}</strong>
        </li>
        <li>
          Aktywne: <strong>{active}</strong>
        </li>
        <li>
          Ukończone: <strong>{done}</strong>
        </li>
      </ul>
    </section>
  );
}
