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

export type FunctionComponent<P = any> = (props: P) => Element;

export interface Fiber {
  type: string | FunctionComponent | null;
  props: Props | null;
  dom: Node | null;
  parent: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
  hooks?: Hook[];
}

export interface Hook {
  state: any;
  queue: Action[];
}

export type Action<S = any> = S | ((prevState: S) => S);
