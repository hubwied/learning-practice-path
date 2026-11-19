const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const memoryFlagEl = document.getElementById("memory-flag");
const historyEl = document.getElementById("history");
const keysEl = document.querySelector(".keys");
const memoryKeysEl = document.querySelector(".memory-keys");

const HISTORY_LIMIT = 20;

const state = {
  current: "0",
  stored: null,
  operator: null,
  overwrite: false,
  lastResult: null,
  memory: 0,
  history: [],
};

const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

function roundNumber(value) {
  return Math.round(value * 1e10) / 1e10;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Błąd";
  }

  return String(roundNumber(value));
}

function renderHistory() {
  historyEl.replaceChildren();
  historyEl.hidden = state.history.length === 0;

  state.history.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "history-row";
    item.dataset.index = String(index);

    const equation = document.createElement("button");
    equation.type = "button";
    equation.className = "history-equation";
    equation.dataset.history = "equation";
    equation.textContent = entry.expression;

    const result = document.createElement("button");
    result.type = "button";
    result.className = "history-result";
    result.dataset.history = "result";
    result.textContent = `= ${entry.result.replace(".", ",")}`;

    item.append(equation, result);
    historyEl.append(item);
  });
}

function updateDisplay() {
  displayEl.textContent = state.current.replace(".", ",");
  memoryFlagEl.hidden = state.memory === 0;

  if (state.stored !== null && state.operator) {
    const symbol = operatorSymbols[state.operator];
    expressionEl.textContent = `${formatNumber(state.stored).replace(".", ",")} ${symbol}`;
  } else {
    expressionEl.textContent = "";
  }

  document.querySelectorAll("[data-operator]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.operator === state.operator && state.overwrite);
  });

  renderHistory();
}

function inputDigit(digit) {
  if (state.current === "Błąd") {
    clearAll();
  }

  if (state.overwrite || state.current === "0") {
    state.current = digit;
    state.overwrite = false;
    return;
  }

  if (state.current.replace("-", "").length >= 12) {
    return;
  }

  state.current += digit;
}

function inputDecimal() {
  if (state.current === "Błąd") {
    clearAll();
  }

  if (state.overwrite) {
    state.current = "0.";
    state.overwrite = false;
    return;
  }

  if (!state.current.includes(".")) {
    state.current += ".";
  }
}

function toggleSign() {
  if (state.current === "Błąd" || state.current === "0") {
    return;
  }

  state.current = state.current.startsWith("-")
    ? state.current.slice(1)
    : `-${state.current}`;
}

function applyPercent() {
  const value = Number(state.current);
  if (!Number.isFinite(value)) {
    return;
  }

  state.current = formatNumber(value / 100);
  state.overwrite = true;
}

function calculate(left, operator, right) {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? Infinity : left / right;
    default:
      return right;
  }
}

function commitOperation(recordHistory = false) {
  if (state.operator === null || state.stored === null || state.overwrite) {
    return false;
  }

  const right = state.current;
  const left = formatNumber(state.stored);
  const operator = state.operator;
  const formatted = formatNumber(calculate(state.stored, operator, Number(right)));

  state.current = formatted;
  state.stored = null;
  state.operator = null;
  state.overwrite = true;

  if (formatted === "Błąd") {
    return true;
  }

  state.lastResult = formatted;

  if (recordHistory) {
    const symbol = operatorSymbols[operator];
    state.history.unshift({
      expression: `${left.replace(".", ",")} ${symbol} ${right.replace(".", ",")}`,
      left,
      operator,
      right,
      result: formatted,
    });

    if (state.history.length > HISTORY_LIMIT) {
      state.history.pop();
    }
  }

  return true;
}

function setOperator(operator) {
  if (state.current === "Błąd") {
    return;
  }

  if (state.operator && !state.overwrite) {
    commitOperation(false);
  }

  if (state.current === "Błąd") {
    state.stored = null;
    state.operator = null;
    return;
  }

  state.stored = Number(state.current);
  state.operator = operator;
  state.overwrite = true;
}

function equals() {
  commitOperation(true);
}

function clearAll() {
  state.current = "0";
  state.stored = null;
  state.operator = null;
  state.overwrite = false;
}

function backspace() {
  if (state.overwrite || state.current === "Błąd") {
    return;
  }

  if (state.current.length <= 1 || (state.current.length === 2 && state.current.startsWith("-"))) {
    state.current = "0";
    return;
  }

  state.current = state.current.slice(0, -1);
}

function insertValue(raw) {
  if (state.current === "Błąd") {
    clearAll();
  }

  const value = String(raw);

  if (state.overwrite || state.current === "0") {
    state.current = value;
    state.overwrite = false;
    return;
  }

  // A leading minus would glue into the number being typed ("12" + "-4").
  const digits = value.startsWith("-") ? value.slice(1) : value;

  for (const char of digits) {
    if (char === ".") {
      if (!state.current.includes(".")) {
        state.current += ".";
      }
      continue;
    }

    if (!/\d/.test(char)) {
      continue;
    }

    if (state.current.replace("-", "").length >= 12) {
      return;
    }

    state.current += char;
  }
}

function recallAnswer() {
  if (state.lastResult === null) {
    return;
  }

  insertValue(state.lastResult);
}

function displayedNumber() {
  const value = Number(state.current);
  return Number.isFinite(value) ? value : null;
}

function changeMemory(sign) {
  if (state.current === "Błąd") {
    return;
  }

  const value = displayedNumber();
  if (value === null) {
    return;
  }

  state.memory = roundNumber(state.memory + sign * value);
}

function recallMemory() {
  insertValue(formatNumber(state.memory));
}

function clearMemory() {
  if (state.current === "Błąd") {
    return;
  }

  state.memory = 0;
}

function restoreEquation(entry) {
  state.stored = Number(entry.left);
  state.operator = entry.operator;
  state.current = entry.right;
  state.overwrite = false;
}

function applyAction(action) {
  if (action === "decimal") {
    inputDecimal();
  } else if (action === "sign") {
    toggleSign();
  } else if (action === "percent") {
    applyPercent();
  } else if (action === "equals") {
    equals();
  } else if (action === "clear") {
    clearAll();
  } else if (action === "ans") {
    recallAnswer();
  } else if (action === "memory-add") {
    changeMemory(1);
  } else if (action === "memory-subtract") {
    changeMemory(-1);
  } else if (action === "memory-recall") {
    recallMemory();
  } else if (action === "memory-clear") {
    clearMemory();
  } else {
    return false;
  }

  return true;
}

function handleKeypadClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.digit) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.operator) {
    setOperator(button.dataset.operator);
  } else if (!applyAction(button.dataset.action)) {
    return;
  }

  updateDisplay();
}

keysEl.addEventListener("click", handleKeypadClick);
memoryKeysEl.addEventListener("click", handleKeypadClick);

historyEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const entry = state.history[Number(button.closest("[data-index]")?.dataset.index)];
  if (!entry) {
    return;
  }

  if (button.dataset.history === "result") {
    insertValue(entry.result);
  } else if (button.dataset.history === "equation") {
    restoreEquation(entry);
  }

  updateDisplay();
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^\d$/.test(key)) {
    inputDigit(key);
  } else if (key === "+" || key === "-" || key === "*" || key === "/") {
    setOperator(key);
  } else if (key === "," || key === ".") {
    inputDecimal();
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    equals();
  } else if (key === "Escape") {
    clearAll();
  } else if (key === "Backspace") {
    backspace();
  } else {
    return;
  }

  updateDisplay();
});

updateDisplay();
