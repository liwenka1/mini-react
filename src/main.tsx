import { MiniReact } from "./core/index.ts";

// 获取根容器，类型为 HTMLElement | null
const container: HTMLElement | null = document.getElementById("root");

// 定义事件处理函数的类型
const updateValue = (e: React.FormEvent<HTMLInputElement>): void => {
  const target = e.target as HTMLInputElement; // 类型断言，确保 target 是 HTMLInputElement
  rerender(target.value); // 使用 input 的 value 属性
};

// 定义 rerender 函数，接受一个字符串参数
const rerender = (value: string): void => {
  const element = (
    <div>
      <input onInput={updateValue} value={value} />
      <h2>Hello {value}</h2>
    </div>
  );
  if (container) {
    // 确保 container 不为 null
    MiniReact.render(element, container);
  }
};

// 初始渲染
rerender("World");
