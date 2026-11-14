import { DUE_FILTER_OPTIONS, PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "../domain.ts";
import type { Category, Filters } from "../types.ts";

type TaskFiltersProps = {
  filters: Filters;
  categories: Category[];
  onChange: (patch: Partial<Filters>) => void;
};

export function TaskFilters({ filters, categories, onChange }: TaskFiltersProps) {
  return (
    <section className="panel" aria-labelledby="filters-heading">
      <h2 id="filters-heading">Filtry</h2>
      <div className="filters">
        <div className="filter-search">
          <label htmlFor="search">Szukaj</label>
          <input
            id="search"
            value={filters.query}
            placeholder="Fragment nazwy"
            onChange={(event) => onChange({ query: event.target.value })}
            autoComplete="off"
          />
        </div>
        <div>
          <label htmlFor="filter-status">Status</label>
          <select
            id="filter-status"
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value as Filters["status"] })}
          >
            <option value="all">wszystkie</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-priority">Priorytet</label>
          <select
            id="filter-priority"
            value={filters.priority}
            onChange={(event) => onChange({ priority: event.target.value as Filters["priority"] })}
          >
            <option value="all">wszystkie</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABEL[priority]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-category">Kategoria</label>
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(event) => onChange({ categoryId: event.target.value })}
          >
            <option value="all">wszystkie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-due">Termin</label>
          <select
            id="filter-due"
            value={filters.due}
            onChange={(event) => onChange({ due: event.target.value as Filters["due"] })}
          >
            {DUE_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
