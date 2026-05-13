import { Checkbox, CheckboxProps } from "@mui/material";

const checkboxSx = {
  p: 0.5,
  color: "var(--st-border)",
  "&.Mui-checked": { color: "var(--st-primary)" },
  "&.MuiCheckbox-indeterminate": { color: "var(--st-primary)" },
} as const;

/**
 * Drop-in replacement for MUI Checkbox with the Stitch dark-theme styling
 * baked in. Accepts all standard Checkbox props; pass `sx` to extend/override.
 */
export default function StyledCheckbox({ sx, ...props }: CheckboxProps) {
  return (
    <Checkbox
      sx={[checkboxSx, ...(Array.isArray(sx) ? sx : sx != null ? [sx] : [])]}
      {...props}
    />
  );
}
