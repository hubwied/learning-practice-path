import { CategoryManager } from "./components/CategoryManager.tsx";
import { TaskFilters } from "./components/TaskFilters.tsx";
import { TaskForm } from "./components/TaskForm.tsx";
import { TaskList } from "./components/TaskList.tsx";
import { TaskSummary } from "./components/TaskSummary.tsx";
import { useTasks } from "./hooks/useTasks.ts";
import "./App.css";

export default function App() {
  const {
    categories,
    tasks,
    visibleTasks,
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
  } = useTasks();

  return (
    <main className="app">
      <header className="header">
        <h1>Task Manager</h1>
        <p className="counts">
          Do zrobienia: {todoCount}
          <span aria-hidden="true"> · </span>
          W trakcie: {inProgressCount}
        </p>
        <TaskSummary tasks={tasks} />
      </header>
      {notice ? (
        <div className={`notice notice-${notice.kind}`} role="status">
          <p>{notice.text}</p>
          <button type="button" className="secondary" onClick={dismissNotice}>
            Zamknij
          </button>
        </div>
      ) : null}
      <CategoryManager
        categories={categories}
        onAdd={addCategory}
        onRename={renameCategory}
        onDelete={deleteCategory}
      />
      <TaskForm
        categories={categories}
        editingTask={editingTask}
        onAdd={addTask}
        onUpdate={updateTask}
        onCancel={cancelEdit}
      />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskList
        tasks={visibleTasks}
        totalCount={tasks.length}
        categoryNameById={categoryNameById}
        today={today}
        editingId={editingTask?.id ?? null}
        onStatus={setStatus}
        onEdit={startEdit}
        onDelete={deleteTask}
      />
    </main>
  );
}
