import type { Element, Props, TextElement } from "../types";

export function createElement(
  type: string,
  props: Props | null,
  ...children: (Element | string | number | boolean)[]
): Element {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child.toString())
      ),
    },
  };
}

function createTextElement(text: string): TextElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}
