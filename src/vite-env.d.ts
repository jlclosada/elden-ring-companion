/// <reference types="vite/client" />

declare module 'pagedjs' {
  export class Previewer {
    on(event: 'page' | 'rendered', cb: (arg: unknown) => void): void
    preview(content: string | Element | DocumentFragment, stylesheets: (string | Record<string, string>)[], renderTo: Element): Promise<{ total?: number; pages: unknown[] }>
  }
}
