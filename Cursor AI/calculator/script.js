const displayEl = document.getElementById("display");
const expressionEl = document.getElementById("expression");
const keysEl = document.querySelector(".keys");

const state = {
  current: "0",
  stored: null,
  operator: null,
  overwrite: false,
};

const operatorSymbols = {
  "+": "+",
  "-": "−",
  "*": "×",
  "/": "÷",
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Błąd";
  }

  const rounded = Math.round(value * 1e10) / 1e10;
  return String(rounded);
}

function updateDisplay() {
  displayEl.textContent = state.current.replace(".", ",");

  if (state.stored !== null && state.operator) {
    const symbol = operatorSymbols[state.operator];
    expressionEl.textContent = `${formatNumber(state.stored).replace(".", ",")} ${symbol}`;
  } else {
    expressionEl.textContent = "";
  }

  document.querySelectorAll("[data-operator]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.operator === state.operator && state.overwrite);
  });
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

function commitOperation() {
  if (state.operator === null || state.stored === null || state.overwrite) {
    return false;
  }

  const result = calculate(state.stored, state.operator, Number(state.current));
  state.current = formatNumber(result);
  state.stored = null;
  state.operator = null;
  state.overwrite = true;
  return true;
}

function setOperator(operator) {
  if (state.current === "Błąd") {
    return;
  }

  if (state.operator && !state.overwrite) {
    commitOperation();
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
  commitOperation();
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

keysEl.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.digit) {
    inputDigit(button.dataset.digit);
  } else if (button.dataset.operator) {
    setOperator(button.dataset.operator);
  } else if (button.dataset.action === "decimal") {
    inputDecimal();
  } else if (button.dataset.action === "sign") {
    toggleSign();
  } else if (button.dataset.action === "percent") {
    applyPercent();
  } else if (button.dataset.action === "equals") {
    equals();
  } else if (button.dataset.action === "clear") {
    clearAll();
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
