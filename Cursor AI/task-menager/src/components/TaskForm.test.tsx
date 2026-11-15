import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.tsx";

beforeEach(() => {
  localStorage.clear();
});

async function addCategory(name: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nowa kategoria"), name);
  await user.click(screen.getByRole("button", { name: /^Dodaj$/ }));
  return user;
}

describe("formularz dodawania zadań", () => {
  it("poprawnie wypełniony formularz pozwala dodać nowe zadanie", async () => {
    render(<App />);
    const user = await addCategory("Praca");

    await user.type(screen.getByLabelText("Nazwa"), "Raport");
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }));

    expect(screen.getByRole("heading", { name: "Raport" })).toBeInTheDocument();
  });

  it("pusty tytuł powoduje wyświetlenie błędu walidacji", async () => {
    render(<App />);
    const user = await addCategory("Praca");

    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }));

    expect(screen.getByText("Podaj nazwę zadania.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("po poprawnym dodaniu zadania formularz zostaje wyczyszczony", async () => {
    render(<App />);
    const user = await addCategory("Praca");
    const title = screen.getByLabelText("Nazwa");
    const description = screen.getByLabelText("Opis");

    await user.type(title, "Raport");
    await user.type(description, "Szczegóły");
    await user.click(screen.getByRole("button", { name: "Dodaj zadanie" }));

    expect(title).toHaveValue("");
    expect(description).toHaveValue("");
  });
});
