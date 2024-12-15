// 定义基本的 Props 接口
interface Props {
  [key: string]: any;
  children?: Element[];
  style?: { [key: string]: string };
}

// 定义元素接口
interface Element {
  type: string;
  props: Props;
}

// 定义文本元素接口
interface TextElement extends Element {
  type: "TEXT_ELEMENT";
  props: {
    nodeValue: string;
    children: [];
  };
}

function createElement(
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

function render(element: Element, container: HTMLElement): void {
  const dom: HTMLElement | Text =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  Object.keys(element.props).forEach((name) => {
    if (name === "style" && typeof element.props[name] === "object") {
      Object.assign((dom as HTMLElement).style, element.props[name]);
    } else if (name !== "children") {
      (dom as any)[name] = element.props[name];
    }
  });

  element.props.children?.forEach((child) => render(child, dom as HTMLElement));

  container.appendChild(dom);
}

export const MiniReact = {
  createElement,
  render,
};
