import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function productExtraFieldsPlugin() {
  return {
    name: "opticana-product-extra-fields",
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, "/");
      if (!normalizedId.endsWith("/src/pages/ProductDetails.jsx")) return null;
      if (code.includes("ProductExtraFields")) return null;

      const importMarker = 'import Loading from "../components/ui/Loading";';
      const jsxMarker = "      {/* =====================================\n          REVIEWS";
      if (!code.includes(importMarker) || !code.includes(jsxMarker)) return null;

      const transformed = code
        .replace(
          importMarker,
          `${importMarker}\nimport ProductExtraFields from "../components/common/ProductExtraFields";`,
        )
        .replace(
          jsxMarker,
          `      <ProductExtraFields />\n\n\n${jsxMarker}`,
        );

      return { code: transformed, map: null };
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "VITE_");
  const apiTarget = env.VITE_DEV_API_TARGET || "http://localhost:4000";

  return {
    base: env.VITE_BASE_PATH || "/",
    plugins: [react(), tailwindcss(), productExtraFieldsPlugin()],
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
