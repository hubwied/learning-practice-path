import type { ChangeEvent } from "react";
import type { ChoiceOption } from "../choices.ts";

type ChoiceSelectProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: readonly ChoiceOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  wrapLabel?: boolean;
  labelClassName?: string;
};

export function ChoiceSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
  disabled,
  wrapLabel = false,
  labelClassName,
}: ChoiceSelectProps<T>) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = options.find((option) => option.value === event.target.value);
    if (next) onChange(next.value);
  }

  const select = (
    <select id={id} value={value} disabled={disabled} onChange={handleChange}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  if (wrapLabel) {
    return (
      <label className={labelClassName} htmlFor={id}>
        {label}
        {select}
      </label>
    );
  }

  return (
    <>
      <label htmlFor={id}>{label}</label>
      {select}
    </>
  );
}
