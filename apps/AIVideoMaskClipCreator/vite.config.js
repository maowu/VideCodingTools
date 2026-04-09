import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/VideCodingTools/pages/AIVideoMaskClipCreator/",
  build: {
    outDir: "../../pages/AIVideoMaskClipCreator",
    emptyOutDir: true,
  },
});
