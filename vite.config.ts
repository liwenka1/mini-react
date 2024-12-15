import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          [
            "@babel/plugin-transform-react-jsx",
            {
              pragma: "MiniReact.createElement", // 指定你的自定义函数
            },
          ],
        ],
      },
    }),
  ],
});
