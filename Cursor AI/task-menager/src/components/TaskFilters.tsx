import { PRIORITY_FILTER_CHOICES, STATUS_FILTER_CHOICES } from "../choices.ts";
import { DUE_FILTER_OPTIONS } from "../domain.ts";
import type { Category, Filters } from "../types.ts";
import { ChoiceSelect } from "./ChoiceSelect.tsx";

type TaskFiltersProps = {
  filters: Filters;
  categories: Category[];
  onChange: (patch: Partial<Filters>) => void;
};

export function TaskFilters({ filters, categories, onChange }: TaskFiltersProps) {
  const categoryOptions = [
    { value: "all", label: "wszystkie" },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];

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
          <ChoiceSelect
            id="filter-status"
            label="Status"
            value={filters.status}
            options={STATUS_FILTER_CHOICES}
            onChange={(status) => onChange({ status })}
          />
        </div>
        <div>
          <ChoiceSelect
            id="filter-priority"
            label="Priorytet"
            value={filters.priority}
            options={PRIORITY_FILTER_CHOICES}
            onChange={(priority) => onChange({ priority })}
          />
        </div>
        <div>
          <ChoiceSelect
            id="filter-category"
            label="Kategoria"
            value={filters.categoryId}
            options={categoryOptions}
            onChange={(categoryId) => onChange({ categoryId })}
          />
        </div>
        <div>
          <ChoiceSelect
            id="filter-due"
            label="Termin"
            value={filters.due}
            options={DUE_FILTER_OPTIONS}
            onChange={(due) => onChange({ due })}
          />
        </div>
      </div>
    </section>
  );
}
