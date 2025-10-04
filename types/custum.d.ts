// types/custom.d.ts

// This tells TypeScript that importing a CSS file is a valid operation.
declare module '*.css';

// This is a wildcard declaration for PrismJS components. It tells TypeScript
// to not worry about missing types for any module imported from this path.
declare module 'prismjs/components/*';