import type { Action, Element, Fiber, FunctionComponent, Hook } from "../types";

import { createDom, updateDom } from "./dom";
import { createElement } from "./jsx-element";

// 全局变量
let currentRoot: Fiber | null = null;
let wipRoot: Fiber | null = null;
let deletions: Fiber[] | null = null;
let nextUnitOfWork: Fiber | null = null;
let wipFiber: Fiber | null = null;
let hookIndex: number = 0;

// DOM 提交相关逻辑
function commitRoot() {
  if (deletions) {
    deletions.forEach(commitWork);
  }
  if (wipRoot?.child) {
    commitWork(wipRoot.child);
  }
  currentRoot = wipRoot;
  wipRoot = null;
}
function commitWork(fiber: Fiber | null) {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (!domParentFiber?.dom) {
    domParentFiber = domParentFiber?.parent || null;
  }

  const domParent = domParentFiber.dom;
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  }

  if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDom(fiber.dom, fiber.alternate?.props || {}, fiber.props || {});
  }

  if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
function commitDeletion(fiber: Fiber, domParent: Node) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else if (fiber.child) {
    commitDeletion(fiber.child, domParent);
  }
}

// 工作循环相关逻辑
function workLoop(deadline: IdleDeadline) {
  let shouldYield = null;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork) || null;
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}
function performUnitOfWork(fiber: Fiber): Fiber | void {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber: Fiber | null = fiber;

  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }

    nextFiber = nextFiber.parent;
  }
}
function updateFunctionComponent(fiber: Fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [(fiber.type as FunctionComponent)(fiber.props)];
  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber: Fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props?.children || []);
}
requestIdleCallback(workLoop);

// Hooks
function useState<S>(initial: S): [S, (action: Action<S>) => void] {
  const oldHook = wipFiber?.alternate?.hooks?.[hookIndex];
  const hook: Hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };

  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action: Function) => {
    hook.state = action(hook.state);
  });

  const setState = (action: Action<S>) => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot?.dom || null,
      props: currentRoot?.props || null,
      alternate: currentRoot,
      type: currentRoot?.type || null,
      parent: null,
      child: null,
      sibling: null,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber?.hooks?.push(hook);
  hookIndex++;

  return [hook.state, setState];
}

// Fiber 协调相关逻辑
function reconcileChildren(wipFiber: Fiber, elements: Element[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling: any = null;

  while (
    index < elements.length ||
    (oldFiber !== null && oldFiber !== undefined)
  ) {
    const element = elements[index];
    let newFiber: Fiber | null = null;

    const sameType = oldFiber && element && oldFiber.type === element.type;

    if (sameType) {
      newFiber = {
        type: oldFiber?.type || null,
        props: element.props,
        dom: oldFiber?.dom || null,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
        child: null,
        sibling: null,
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
        child: null,
        sibling: null,
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

// 渲染函数
function render(element: Element, container: HTMLElement): void {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
    type: "div",
    parent: null,
    child: null,
    sibling: null,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

export const MiniReact = {
  createElement,
  render,
  useState,
};
