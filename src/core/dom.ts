// 处理DOM操作相关逻辑
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
export function createDom(fiber: any) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

export function updateDom(
  dom: any,
  prevProps: Record<string, any>,
  nextProps: Record<string, any>
) {
  // 删除旧的或已更改的事件监听器
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // 删除旧属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = "";
    });

  // 设置新的或更改的属性
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === "style") {
        Object.assign(dom.style, nextProps["style"]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // 添加事件监听器
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}
