/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string;
  readonly VITE_BASE_PATH?: string;
  readonly VITE_ENABLE_SOUND?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
