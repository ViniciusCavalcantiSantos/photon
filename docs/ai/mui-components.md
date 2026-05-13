# Photon — Shared MUI UI Component Library

> Use this file to give an AI assistant context when working on any form, modal, or MUI-based UI in this project.

---

## Why This Exists

Repeated `sx` style objects (`inputSx`, `selectSx`, `labelSx`, `dialogPaperSx`, etc.) were previously copy-pasted into every modal file. This created drift risk: a single design change (e.g. border-radius) would require touching every file.

The solution is a set of thin **styled wrapper components** in `client/src/components/ui/` that bake the Stitch design tokens in. Consumers write zero styling — just use the component.

---

## Component Reference

All components live in `client/src/components/ui/`.

### `StyledTextField`

Drop-in for MUI `TextField` with the Stitch input styling baked in.

```tsx
import StyledTextField from "@/components/ui/StyledTextField";

<StyledTextField
  fullWidth
  size="small"
  placeholder={t("enter_title")}
  value={form.title}
  onChange={(e) => setField("title", e.target.value)}
  error={!!errors.title}
  helperText={errors.title}
/>
```

- Accepts all standard `TextField` props.
- Pass `sx` to merge additional styles (array syntax supported).
- Baked-in styles: `borderRadius: 12px`, Stitch colors for border/hover/focus/text/placeholder/adornment icons.

---

### `StyledSelect`

Drop-in for the `FormControl` + `Select` pair with Stitch styling and the dark-themed dropdown menu baked in.

```tsx
import StyledSelect from "@/components/ui/StyledSelect";

<StyledSelect
  fullWidth
  displayEmpty
  value={form.contract}
  error={!!errors.contract}
  helperText={errors.contract}
  onChange={(e) => handleContractChange(e.target.value as number)}
>
  <MenuItem value="" disabled>{t("select_contract")}</MenuItem>
  {items.map(item => (
    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
  ))}
</StyledSelect>
```

**Props (in addition to `SelectProps`):**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `fullWidth` | `boolean` | — | Forwarded to `FormControl` |
| `size` | `"small" \| "medium"` | `"small"` | Forwarded to `FormControl` |
| `error` | `boolean` | — | Forwarded to `FormControl` |
| `helperText` | `ReactNode` | — | Renders `FormHelperText` below the select |
| `sx` | `SxProps` | — | Merged onto the `Select` element |

> [!NOTE]
> When a select needs **disabled-state styling** (e.g. dashed border, muted text while loading), define a small local `const disabledSelectSx = { ... }` and pass it via `sx`. See `ManageEventModal.tsx` for the pattern.

---

### `StyledCheckbox`

Drop-in for MUI `Checkbox` with Stitch colors baked in.

```tsx
import StyledCheckbox from "@/components/ui/StyledCheckbox";

<StyledCheckbox
  size="small"
  checked={form.require_address}
  onChange={(e) => set("require_address")(e.target.checked)}
/>
```

- Accepts all standard `Checkbox` props.
- Baked-in: border color `--st-border`, checked/indeterminate color `--st-primary`.

---

### `FieldLabel`

Styled `Typography` for form field labels with the correct font weight, size, and bottom margin. Use the `required` prop to append the blue asterisk automatically.

```tsx
import FieldLabel from "@/components/ui/FieldLabel";

<FieldLabel required>{t("title")}</FieldLabel>
<FieldLabel>{t("description_optional")}</FieldLabel>
```

**Props:**

| Prop | Type | Notes |
|---|---|---|
| `required` | `boolean` | Appends `<span className="required-star"> *</span>` styled in `--st-primary` |
| `sx` | `SxProps` | Merged onto the underlying `Typography` |
| all `TypographyProps` | — | Forwarded |

---

### `StyledDialog`

Drop-in for MUI `Dialog` with the Stitch paper and backdrop styling baked in. Avoid using plain `<Dialog>` for app modals — always prefer this component.

```tsx
import StyledDialog from "@/components/ui/StyledDialog";

// Common case
<StyledDialog open={open} onClose={close} minWidth={520}>
  ...
</StyledDialog>

// With custom paper/backdrop (e.g. ManageEventModal's blur effect)
<StyledDialog
  open={open}
  onClose={handleCancel}
  maxWidth="sm"
  fullWidth
  paperSx={{ borderRadius: "20px", overflow: "hidden", boxShadow: "var(--st-shadow-elevated)" }}
  backdropSx={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
>
  ...
</StyledDialog>
```

**Props (in addition to `DialogProps`):**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `minWidth` | `number` | `480` | Sets `sm` breakpoint min-width in px. `xs` is always `calc(100vw - 32px)`. |
| `paperSx` | `SxProps` | — | Merged onto paper; overrides base styles (bg, border, radius, overflow) |
| `backdropSx` | `SxProps` | — | Merged onto backdrop; overrides default `--st-bg-mask` background |

> [!IMPORTANT]
> `StyledDialog` does **not** render `DialogTitle`, `DialogContent`, or `DialogActions` — those are still composed manually inside the dialog body for layout flexibility.

---

### `DialogCancelButton`

The secondary / cancel action button for modal footers.

```tsx
import DialogCancelButton from "@/components/ui/DialogCancelButton";

<DialogCancelButton onClick={close} disabled={loading}>
  {t("cancel")}
</DialogCancelButton>
```

- Renders as a plain (text) `Button` — no `variant` needed.
- Pass `variant="outlined"` and additional `sx` for the outlined variant used in `ManageEventModal`.
- Accepts all `ButtonProps`.

---

### `DialogPrimaryButton`

The primary / confirm action button for modal footers.

```tsx
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";

// Standard confirm
<DialogPrimaryButton onClick={handleOk} disabled={loading}>
  {t("save")}
</DialogPrimaryButton>

// Destructive / warning action
<DialogPrimaryButton color="warning" onClick={handleDelete} disabled={loading}>
  {t("unassign")}
</DialogPrimaryButton>
```

**Props (in addition to `ButtonProps`):**

| Prop | Type | Default | Notes |
|---|---|---|---|
| `color` | `"primary" \| "warning"` | `"primary"` | `"warning"` renders amber (`--st-warning`) background |

- Always renders as `variant="contained"`.
- Pass `sx` to extend (e.g. `borderRadius: "12px"`, `px: 3` for `ManageEventModal`'s larger footer buttons).

---

## Typical Modal Skeleton

```tsx
import StyledDialog from "@/components/ui/StyledDialog";
import StyledTextField from "@/components/ui/StyledTextField";
import StyledSelect from "@/components/ui/StyledSelect";
import StyledCheckbox from "@/components/ui/StyledCheckbox";
import FieldLabel from "@/components/ui/FieldLabel";
import DialogCancelButton from "@/components/ui/DialogCancelButton";
import DialogPrimaryButton from "@/components/ui/DialogPrimaryButton";
import { Box, Divider, MenuItem, Typography } from "@mui/material";

export default function MyModal({ open, onClose }) {
  return (
    <StyledDialog open={open} onClose={onClose} minWidth={480}>
      {/* Header */}
      <Typography sx={{ color: "var(--st-text)", fontWeight: 700, px: 3, pt: 2.5, pb: 1 }}>
        {t("modal_title")}
      </Typography>
      <Divider sx={{ borderColor: "var(--st-divider)" }} />

      {/* Body */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <FieldLabel required>{t("field_label")}</FieldLabel>
        <StyledTextField fullWidth size="small" value={...} onChange={...} />
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: "var(--st-divider)" }} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, px: 3, py: 2 }}>
        <DialogCancelButton onClick={onClose}>{t("cancel")}</DialogCancelButton>
        <DialogPrimaryButton onClick={handleOk}>{t("confirm")}</DialogPrimaryButton>
      </Box>
    </StyledDialog>
  );
}
```

---

## Files Using These Components

| File | Components used |
|---|---|
| `EventManager/_modals/ManageEventModal.tsx` | `StyledDialog`, `StyledTextField`, `StyledSelect`, `FieldLabel`, `DialogCancelButton`, `DialogPrimaryButton` |
| `ClientManager/_modals/CreateRegisterLinkModal.tsx` | `StyledDialog`, `StyledTextField`, `StyledCheckbox`, `FieldLabel`, `DialogCancelButton`, `DialogPrimaryButton` |
| `ClientManager/_modals/RegisterTypeModal.tsx` | `StyledDialog`, `StyledSelect`, `FieldLabel`, `DialogCancelButton`, `DialogPrimaryButton` |
| `ClientManager/_modals/AssignModals.tsx` | `StyledDialog`, `DialogCancelButton`, `DialogPrimaryButton` |
| `components/ui/MuiTreeSelect.tsx` | `StyledCheckbox` |

---

## Design Tokens Used

All components reference CSS variables defined in `client/src/app/[lng]/globals.css`. See `mui-migration-context.md` for the full token list.

Key tokens used by these components:

| Token | Role |
|---|---|
| `--st-bg-elevated` | Input / select background |
| `--st-bg-paper` | Dialog paper background |
| `--st-bg-mask` | Default backdrop overlay |
| `--st-border` | Default border color |
| `--st-primary` | Hover/focus border, checked state, required star, primary button |
| `--st-primary-hover` | Primary button hover |
| `--st-primary-light` | MenuItem hover/selected, backdrop hover |
| `--st-text` | Primary text |
| `--st-text-sec` | Label, placeholder, secondary icon |
| `--st-text-disabled` | Placeholder / disabled text |
| `--st-warning` | Warning button background |
