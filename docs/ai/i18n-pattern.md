# i18n Pattern

- Use `useT()` from `@/i18n/client` in client components; `getT()` from `@/i18n/index` in server components.
- Translation files: `client/public/locales/{en,pt-BR}/common.json` — always update both together.
- Never hardcode user-visible strings. No exceptions.
- Plural keys use `_one` / `_other` suffixes with a `count` option.
- Generic UI components call `useT()` internally for default labels and expose **plain string props** so callers can override with domain-specific text.