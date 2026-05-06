# Photon — Ant Design → MUI Migration Context

> Use this file to give an AI assistant full context when continuing this migration in a new chat.

---

## Project Overview

**Photon** is a Next.js (App Router) web application for event photography management. The frontend lives in `client/` and uses:

- **Next.js** (App Router, i18n routing via `[lng]` segment)
- **Tailwind CSS v4** (via `@import "tailwindcss"` — no config file, CSS-first)
- **Material UI v9** (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`)
- **Ant Design** (still present for backwards compatibility — being migrated away)
- **TanStack Query** for server state
- **dayjs** for date handling
- **pnpm** as package manager

---

## Migration Goal

Gradually replace **Ant Design** components with **MUI v9** across the `client/` app, following the design produced in **Stitch** (Google's AI UI design tool).

**The Stitch project** is:
- **Project ID:** `2023443750637308397`
- **Title:** Photon Cloud Event Dashboard

The Stitch design uses a **dark-first aesthetic**:
- Background: `#0B0C10` (page), `#171821` (cards/paper), `#1f2130` (elevated)
- Primary accent: `#0C66E4` (blue)
- Text: `#e8eaf0` (primary), `#9CA3AF` (secondary)
- Borders: `#2a2f45`
- Cards: 16px border-radius, subtle shadow

---

## Design Token System

### CSS Variables (in `client/src/app/[lng]/globals.css`)

Two sets of variables coexist:

1. **`--ant-*` variables** — kept for backwards compatibility (antd still injects these)
2. **`--st-*` variables** — new Stitch/MUI tokens, defined manually per theme

#### Stitch tokens defined (light & dark):

```css
/* Light (:root) */
--st-bg: #f0f2f5;
--st-bg-paper: #ffffff;
--st-bg-elevated: #ffffff;
--st-text: #1a1a2e;
--st-text-sec: #5a6474;
--st-text-disabled: #a0aab4;
--st-primary: #0C66E4;
--st-primary-hover: #0a55c0;
--st-primary-light: rgba(12, 102, 228, 0.12);
--st-border: #dde1e7;
--st-divider: #eaecef;
--st-success / --st-warning / --st-error / --st-info
--st-shadow-card / --st-shadow-elevated

/* Dark (:root[data-theme="dark"]) */
--st-bg: #0B0C10;
--st-bg-paper: #171821;
--st-bg-elevated: #1f2130;
--st-text: #e8eaf0;
--st-text-sec: #9CA3AF;
--st-text-disabled: #4a5568;
--st-primary: #0C66E4;
--st-primary-hover: #3b82f6;
--st-primary-light: rgba(12, 102, 228, 0.18);
--st-border: #2a2f45;
--st-divider: #252a3d;
```

These are also exposed as Tailwind utilities via `@theme inline` in globals.css (e.g. `text-st-text`, `bg-st-bg-paper`).

### `theme.ts` (`client/src/theme.ts`)

Exports both old and new tokens:

```ts
export default theme                          // primary, secondary, overlay
export { themeBody }                          // --overlay CSS var for <body>
export { themeAntd, themeAntdLight, themeAntdDark }  // antd AliasToken partials (kept)
export { stitchTokens }                       // new palette reference object
```

---

## Shared MUI Input Styling Pattern

New MUI components use these shared `sx` snippets (defined at the top of each file):

```tsx
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'var(--st-bg-elevated)',
    color: 'var(--st-text)',
    '& fieldset': { borderColor: 'var(--st-border)' },
    '&:hover fieldset': { borderColor: 'var(--st-primary)' },
    '&.Mui-focused fieldset': { borderColor: 'var(--st-primary)' },
  },
  '& .MuiInputLabel-root': { color: 'var(--st-text-sec)' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'var(--st-primary)' },
  '& .MuiInputBase-input': { color: 'var(--st-text)' },
  '& .MuiInputBase-input::placeholder': { color: 'var(--st-text-disabled)', opacity: 1 },
  '& .MuiSvgIcon-root': { color: 'var(--st-text)' },         // bright for dark theme
  '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: 'var(--st-text-sec)' },
} as const;

const selectSx = {
  borderRadius: '12px',
  backgroundColor: 'var(--st-bg-elevated)',
  color: 'var(--st-text)',
  '& fieldset': { borderColor: 'var(--st-border)' },
  '&:hover fieldset': { borderColor: 'var(--st-primary)' },
  '&.Mui-focused fieldset': { borderColor: 'var(--st-primary)' },
  '& .MuiSvgIcon-root': { color: 'var(--st-text)' },
} as const;

const labelSx = {
  color: 'var(--st-text)',
  fontWeight: 600,
  fontSize: '0.85rem',
  mb: 0.75,
  '& .required-star': {
    color: 'var(--st-primary)',   // required asterisk is blue, not same as label
    ml: 0.25,
  },
} as const;
```

Required field labels use a `<span className="required-star">*</span>` to distinguish the asterisk from the label text.

---

## MUI v9 API Notes (Breaking Changes)

MUI v9 changed several APIs — always use these patterns:

```tsx
// ✅ Dialog paper styling (v9)
<Dialog slotProps={{ paper: { sx: { ... } }, backdrop: { sx: { ... } } }}>

// ❌ Old (v5/v6)
<Dialog PaperProps={{ sx: { ... } }}>

// ✅ Select dropdown styling (v9)
<Select MenuProps={{ slotProps: { paper: { sx: { ... } } } }}>

// ❌ Old
<Select MenuProps={{ PaperProps: { sx: { ... } } }}>

// ✅ Stack justifyContent (must be in sx)
<Stack sx={{ justifyContent: 'center' }}>

// ❌ Doesn't compile in v9
<Stack justifyContent="center">

// ✅ Grid v9 (uses `size` prop)
<Grid size={{ xs: 12, sm: 6 }}>

// ❌ Old
<Grid item xs={12} sm={6}>
```

---

## Files Migrated So Far

### `client/src/app/[lng]/globals.css`
- Kept all `--ant-*` aliases intact (backwards compat)
- Added `--st-*` token block for light + dark themes

### `client/src/theme.ts`
- Kept all antd exports (`themeAntd`, `themeAntdLight`, `themeAntdDark`)
- Added `stitchTokens` export

### `client/src/components/common/layout/PageHeader.tsx`
- Changed `text-ant-text` → `text-st-text` Tailwind class

### `client/src/components/features/app/events/EventManager/EventManager.tsx`
- **Before:** antd `Table`, `Card`, `Button`, antd `Search`
- **After:** MUI card-based layout with `TextField` search, `Button`, `Skeleton` loading, `Fab` for mobile, empty/error states with MUI components

### `client/src/components/features/app/events/EventManager/_components/ActionButtons.tsx`
- **Before:** antd `Button`, `Space`, `Tooltip` + `@ant-design/icons`
- **After:** MUI `IconButton`, `Stack`, `Tooltip` + `@mui/icons-material`

### `client/src/components/features/app/events/EventManager/_components/EventCard.tsx` *(new file)*
- Card component following the Stitch design
- Category-colored `Avatar` with icon (Favorite/School/Cake/Celebration based on slug)
- Title + category `Chip` + contract `Chip`
- Meta row: date, time, photo count, size
- Action bar: **"View" button** (primary, contained) + **FileUpload icon** + **MoreVert (three-dot menu)** → edit / delete
- Hover lift effect, divider before action bar

### `client/src/components/features/app/events/EventManager/_modals/ManageEventModal.tsx`
- **Before:** antd `Modal`, `Form`, `Form.Item`, antd `Select`, `DatePicker`, `TimePicker`, `Checkbox`, `Input`, `TextArea`
- **After:** MUI `Dialog`, local `useState` form + manual `validate()`, MUI `Select`, native `<input type="date/time">` via `TextField`, `Checkbox`, `TextField multiline`
- Required `*` styled with `--st-primary` color via `.required-star` span

---

## What Still Uses Ant Design

These are **not yet migrated** (as of this session):

- `NotificationContext` — uses `antd/notification` (complex, deferred)
- `useServerTable` hook — still returns antd `TablePaginationConfig` and locale props (only used by old table code, now mostly bypassed)
- `getEventTableColumns.tsx` — still typed with antd `TableColumnsType`
- Various other pages/forms outside the Events module
- `ManageEventModal` sub-forms: contract loading uses `fetchEventTypes` directly (TODO: replace with a `useEventTypes` hook)

---

## Key Project Paths

```
client/
├── src/
│   ├── app/[lng]/globals.css          ← Tailwind + CSS vars (--ant-* and --st-*)
│   ├── theme.ts                        ← Design tokens (antd + stitch)
│   ├── components/
│   │   ├── common/layout/PageHeader.tsx
│   │   └── features/app/events/EventManager/
│   │       ├── EventManager.tsx        ← Main list (MUI cards)
│   │       ├── _components/
│   │       │   ├── EventCard.tsx       ← NEW — Stitch card design
│   │       │   └── ActionButtons.tsx   ← MUI icon buttons
│   │       ├── _config/
│   │       │   └── getEventTableColumns.tsx  ← Still antd typed
│   │       └── _modals/
│   │           └── ManageEventModal.tsx ← MUI Dialog form
│   ├── hooks/useServerTable.tsx        ← Still antd (pagination/table)
│   ├── contexts/NotificationContext.tsx ← Still antd notification
│   └── types/
│       ├── Event.ts                    ← type Event = components['schemas']['Event']
│       └── api.d.ts                    ← OpenAPI generated types
```

---

## Stitch Screens Reference

| Screen | Stitch ID | Status |
|---|---|---|
| Photon Cloud Dashboard with Search | `e13d801bc95b405d81c63ca90fedc523` | ✅ Implemented (EventManager) |
| Create New Event Popup | `2c3daf03a7234c70910a6529ac46c1fa` | ✅ Implemented (ManageEventModal) |

To fetch a new Stitch screen: use `mcp_stitch_get_screen` with project ID `2023443750637308397`.
