/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_BETA_CONSENT_REQUIRED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

