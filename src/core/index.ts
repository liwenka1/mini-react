function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text: string) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function render(element, container) {
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  Object.keys(element.props).forEach((name) => {
    if (name === "style" && typeof element.props[name] === "object") {
      // 如果是 style 属性，将其应用到 DOM 元素
      Object.assign(dom.style, element.props[name]);
    } else if (name !== "children") {
      dom[name] = element.props[name];
    }
  });

  element.props.children.forEach((child) => render(child, dom));

  container.appendChild(dom);
}

export const MiniReact = {
  createElement,
  render,
};
