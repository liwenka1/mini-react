// 定义基本的 Props 接口
export interface Props {
  [key: string]: any;
  children?: Element[];
  style?: { [key: string]: string };
}

// 定义元素接口
export interface Element {
  type: string;
  props: Props;
}

// 定义文本元素接口
export interface TextElement extends Element {
  type: "TEXT_ELEMENT";
  props: {
    nodeValue: string;
    children: [];
  };
}

// 定义 Fiber 类型
export interface Fiber {
  type: string;
  props: any;
  dom: HTMLElement | Text | null;
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
}
