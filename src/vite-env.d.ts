/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_MODE: string
  readonly VITE_TOKEN_EXPIRY: string
  readonly VITE_USE_MOCK_AUTH: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_API_LOGGING: string
  readonly VITE_TOKEN_TENANT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
