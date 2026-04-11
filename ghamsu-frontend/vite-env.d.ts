/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID: string
  readonly VITE_SANITY_DATASET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react-responsive-masonry' {
  import React from 'react'
  const Masonry: React.FC<{
    children: React.ReactNode
    columnsCount?: number
    gutter?: string | number
  }>
  export default Masonry
}

