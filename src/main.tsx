import { MiniReact } from "./core/index.ts";

function Counter() {
  const [state, setState] = MiniReact.useState(1);
  return (
    <div>
      <h1>Count: {state}</h1>
      <button onClick={() => setState((c: never) => c + 1)}>点我+1</button>
      <h2 style={{ color: "red" }}>red</h2>
    </div>
  );
}
const element = <Counter />;
const container = document.getElementById("root")!;
// 初始渲染
MiniReact.render(element, container);
