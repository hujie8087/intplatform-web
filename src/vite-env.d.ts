/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_APP_BASE_FILE: string;
  readonly VITE_APP_FOOD_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
