import { MiniReact } from "./core/index.ts";

const element = (
  <div style={{ background: "salmon" }}>
    <h1>Hello World</h1>
    <h2 style={{ textAlign: "right" }}>from Didact11</h2>
  </div>
);

const container = document.getElementById("root");
MiniReact.render(element, container);
