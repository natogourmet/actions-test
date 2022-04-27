/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Serialized JSON with the application information */
  readonly APP_INFO: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
