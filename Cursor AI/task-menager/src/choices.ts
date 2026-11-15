import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "./domain.ts";
import type { Priority, Status } from "./types.ts";

export type ChoiceOption<T extends string> = {
  value: T;
  label: string;
};

export const PRIORITY_CHOICES: readonly ChoiceOption<Priority>[] = PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABEL[value],
}));

export const STATUS_CHOICES: readonly ChoiceOption<Status>[] = STATUSES.map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));

export const PRIORITY_FILTER_CHOICES: readonly ChoiceOption<"all" | Priority>[] = [
  { value: "all", label: "wszystkie" },
  ...PRIORITY_CHOICES,
];

export const STATUS_FILTER_CHOICES: readonly ChoiceOption<"all" | Status>[] = [
  { value: "all", label: "wszystkie" },
  ...STATUS_CHOICES,
];
