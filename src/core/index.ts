import type { Element } from "../types";

import { createElement } from "./jsx-element";

const isEvent = (key: string) => {
  return key.startsWith("on");
};
const isProperty = (key: string) => {
  return key !== "children" && !isEvent(key);
};
const isNew = (prev: Record<string, any>, next: Record<string, any>) => {
  return (key: string) => {
    return prev[key] !== next[key];
  };
};
const isGone = (_: unknown, next: Record<string, any>) => {
  return (key: string) => {
    return !(key in next);
  };
};
function updateDom(
  dom: any,
  prevProps: Record<string, any>,
  nextProps: Record<string, any>
) {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

type Fiber = any;

let nextUnitOfWork: any = null;
let wipRoot: any = null;
let currentRoot: any = null;
let deletions: Fiber[] | null = null;

function commitRoot() {
  deletions?.forEach(commitWork);
  commitWork(wipRoot?.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber: Fiber) {
  if (!fiber) {
    return;
  }

  const domParent = fiber.parent.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  }
  if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  if (fiber.effectTag === "DELETION") {
    domParent.removeChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function workLoop(deadline: any) {
  let shouldYield = null;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function reconcileChildren(wipFiber: Fiber, elements: any) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: any = null;
  console.log(oldFiber, "oldFiber");

  while (
    index < elements.length ||
    (oldFiber !== null && oldFiber !== undefined)
  ) {
    const element = elements[index];
    let newFiber = null;

    const sameType = oldFiber && element && oldFiber.type === element.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = "DELETION";
      deletions?.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function createDom(fiber: Fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

function render(element: Element, container: HTMLElement): void {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

export const MiniReact = {
  createElement,
  render,
};
