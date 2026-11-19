import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

function createElement(tagName) {
  const element = {
    tagName: tagName.toUpperCase(),
    children: [],
    parent: null,
    id: "",
    className: "",
    type: "",
    hidden: false,
    dataset: {},
    listeners: {},
    text: "",
  };

  Object.defineProperty(element, "textContent", {
    get() {
      return element.text;
    },
    set(value) {
      element.text = String(value);
    },
  });

  element.classList = {
    toggle(name, force) {
      const classes = new Set(element.className.split(/\s+/).filter(Boolean));
      const enabled = force === undefined ? !classes.has(name) : Boolean(force);
      if (enabled) {
        classes.add(name);
      } else {
        classes.delete(name);
      }
      element.className = [...classes].join(" ");
      return enabled;
    },
  };

  element.append = (...nodes) => {
    for (const node of nodes) {
      node.parent = element;
      element.children.push(node);
    }
  };

  element.replaceChildren = (...nodes) => {
    for (const child of element.children) {
      child.parent = null;
    }
    element.children = [];
    element.append(...nodes);
  };

  element.addEventListener = (type, handler) => {
    element.listeners[type] ??= [];
    element.listeners[type].push(handler);
  };

  element.closest = (selector) => {
    let current = element;
    while (current) {
      if (matches(current, selector)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  };

  element.click = () => {
    const event = { target: element, preventDefault() {} };
    let current = element;
    while (current) {
      for (const handler of current.listeners.click ?? []) {
        handler(event);
      }
      current = current.parent;
    }
  };

  return element;
}

function matches(element, selector) {
  if (selector.startsWith(".")) {
    return element.className.split(/\s+/).includes(selector.slice(1));
  }

  if (selector === "button") {
    return element.tagName === "BUTTON";
  }

  if (selector.startsWith("[data-") && selector.endsWith("]")) {
    const key = selector
      .slice(6, -1)
      .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    return Object.hasOwn(element.dataset, key);
  }

  return false;
}

function walk(element, visit) {
  for (const child of element.children) {
    visit(child);
    walk(child, visit);
  }
}

function queryAll(element, selector) {
  const found = [];
  walk(element, (node) => {
    if (matches(node, selector)) {
      found.push(node);
    }
  });
  return found;
}

function applyAttributes(element, source) {
  for (const match of source.matchAll(/([^\s=]+)(?:="([^"]*)")?/g)) {
    const [, name, value = ""] = match;
    if (name === "id") {
      element.id = value;
    } else if (name === "class") {
      element.className = value;
    } else if (name === "type") {
      element.type = value;
    } else if (name === "hidden") {
      element.hidden = true;
    } else if (name.startsWith("data-")) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
      element.dataset[key] = value;
    }
  }
}

function parseHtml(html) {
  const document = createElement("document");
  const stack = [document];
  const pattern = /<!--[\s\S]*?-->|<\/([A-Za-z0-9]+)>|<([A-Za-z0-9]+)([^>]*)>/g;

  for (const match of html.matchAll(pattern)) {
    if (match[0].startsWith("<!--") || match[0].startsWith("</")) {
      if (match[1]) {
        stack.pop();
      }
      continue;
    }

    const element = createElement(match[2]);
    applyAttributes(element, match[3]);
    stack.at(-1).append(element);

    const closing = match[0].endsWith("/>") || ["meta", "link"].includes(match[2].toLowerCase());
    if (!closing) {
      stack.push(element);
    }
  }

  document.getElementById = (id) => {
    let found = null;
    walk(document, (node) => {
      if (!found && node.id === id) {
        found = node;
      }
    });
    return found;
  };

  document.querySelector = (selector) => queryAll(document, selector)[0] ?? null;
  document.querySelectorAll = (selector) => queryAll(document, selector);
  document.createElement = createElement;
  document.addEventListener = (type, handler) => {
    document.listeners[type] ??= [];
    document.listeners[type].push(handler);
  };

  return document;
}

function loadCalculator() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const body = html.match(/<body>([\s\S]*)<\/body>/i)[1].replace(/<script[\s\S]*?<\/script>/gi, "");
  const document = parseHtml(body);
  const context = vm.createContext({
    document,
    console,
    Number,
    String,
    Math,
    Object,
    Array,
    Boolean,
  });
  vm.runInContext(fs.readFileSync(path.join(root, "script.js"), "utf8"), context);

  const click = (token) => {
    const controls = {
      "=": ["action", "equals"],
      ",": ["action", "decimal"],
      C: ["action", "clear"],
      ANS: ["action", "ans"],
      "M+": ["action", "memory-add"],
      "M-": ["action", "memory-subtract"],
      MR: ["action", "memory-recall"],
      MC: ["action", "memory-clear"],
      "+": ["operator", "+"],
      "-": ["operator", "-"],
      "*": ["operator", "*"],
      "/": ["operator", "/"],
    };
    const buttons = queryAll(document, "button");
    const mapped = controls[token];
    const button = mapped
      ? buttons.find((item) => item.dataset[mapped[0]] === mapped[1])
      : buttons.find((item) => item.dataset.digit === token);

    if (!button) {
      throw new Error(`Missing button: ${token}`);
    }

    button.click();
  };

  const read = () => ({
    display: document.getElementById("display").textContent,
    expression: document.getElementById("expression").textContent,
    memoryHidden: document.getElementById("memory-flag").hidden,
    historyHidden: document.getElementById("history").hidden,
    equations: queryAll(document, ".history-equation").map((item) => item.textContent),
    results: queryAll(document, ".history-result").map((item) => item.textContent),
  });

  return { document, click, read, queryAll };
}

test("adds, subtracts, multiplies, and divides", () => {
  const { click, read } = loadCalculator();
  click("1");
  click("2");
  click("+");
  click("3");
  click("=");
  assert.equal(read().display, "15");

  click("C");
  click("8");
  click("-");
  click("3");
  click("=");
  assert.equal(read().display, "5");

  click("C");
  click("6");
  click("*");
  click("7");
  click("=");
  assert.equal(read().display, "42");

  click("C");
  click("9");
  click("/");
  click("2");
  click("=");
  assert.equal(read().display, "4,5");
});

test("shows an error for division by zero and does not record it", () => {
  const { click, read } = loadCalculator();
  click("8");
  click("/");
  click("0");
  click("=");

  const view = read();
  assert.equal(view.display, "Błąd");
  assert.equal(view.historyHidden, true);
  assert.deepEqual(view.equations, []);
});

test("ANS does nothing before the first successful result", () => {
  const { click, read } = loadCalculator();
  click("ANS");
  assert.equal(read().display, "0");
  assert.equal(read().historyHidden, true);
});

test("ANS restores the last successful result after division by zero", () => {
  const { click, read } = loadCalculator();
  click("9");
  click("+");
  click("1");
  click("=");
  click("8");
  click("/");
  click("0");
  click("=");
  assert.equal(read().display, "Błąd");
  assert.deepEqual(read().equations, ["9 + 1"]);

  click("ANS");
  assert.equal(read().display, "10");
  assert.deepEqual(read().equations, ["9 + 1"]);
});

test("runs a full memory sequence and recalls zero after MC", () => {
  const { click, read } = loadCalculator();
  click("5");
  click("+");
  click("3");
  click("M+");

  let view = read();
  assert.equal(view.display, "3");
  assert.equal(view.expression, "5 +");
  assert.equal(view.memoryHidden, false);

  click("=");
  assert.equal(read().display, "8");

  click("MR");
  assert.equal(read().display, "3");

  click("M-");
  view = read();
  assert.equal(view.display, "3");
  assert.equal(view.memoryHidden, true);

  click("C");
  click("MR");
  assert.equal(read().display, "0");
  assert.equal(read().memoryHidden, true);
});

test("appends MR of zero while a number is being typed", () => {
  const { click, read } = loadCalculator();
  click("1");
  click("2");
  click("MR");
  assert.equal(read().display, "120");
});

test("records only explicit equals and restores an equation or its result", () => {
  const { click, read, queryAll, document } = loadCalculator();
  click("2");
  click("+");
  click("3");
  click("+");

  assert.equal(read().display, "5");
  assert.equal(read().expression, "5 +");
  assert.equal(read().historyHidden, true);

  click("ANS");
  assert.equal(read().display, "5");

  click("C");
  click("1");
  click("2");
  click("+");
  click("3");
  click("=");

  let view = read();
  assert.equal(view.display, "15");
  assert.deepEqual(view.equations, ["12 + 3"]);
  assert.deepEqual(view.results, ["= 15"]);

  click("4");
  queryAll(document, ".history-result")[0].click();
  view = read();
  assert.equal(view.display, "415");
  assert.equal(view.expression, "");
  assert.deepEqual(view.equations, ["12 + 3"]);

  click("C");
  click("5");
  click("+");
  click("1");
  click("2");
  queryAll(document, ".history-result")[0].click();
  view = read();
  assert.equal(view.display, "1215");
  assert.equal(view.expression, "5 +");

  queryAll(document, ".history-equation")[0].click();
  view = read();
  assert.equal(view.display, "3");
  assert.equal(view.expression, "12 +");
  assert.deepEqual(view.equations, ["12 + 3"]);

  click("=");
  view = read();
  assert.equal(view.display, "15");
  assert.deepEqual(view.equations, ["12 + 3", "12 + 3"]);
});

test("keeps at most 20 history entries", () => {
  const { click, read } = loadCalculator();

  for (let count = 0; count < 21; count += 1) {
    click("1");
    click("+");
    click("1");
    click("=");
    click("C");
  }

  assert.equal(read().equations.length, 20);
  assert.equal(read().equations[0], "1 + 1");
});
