/// <reference types="vite/client" />

// Allow importing .mmd files as raw text
declare module '*.mmd' {
  const content: string;
  export default content;
}

// Allow importing CSS files
declare module '*.css' {
  const content: string;
  export default content;
}
