import { TextField, TextFieldProps } from "@mui/material";

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "var(--st-bg-elevated)",
    color: "var(--st-text)",
    "& fieldset": { borderColor: "var(--st-border)" },
    "&:hover fieldset": { borderColor: "var(--st-primary)" },
    "&.Mui-focused fieldset": { borderColor: "var(--st-primary)" },
  },
  "& .MuiInputLabel-root": { color: "var(--st-text-sec)" },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--st-primary)" },
  "& .MuiInputBase-input": { color: "var(--st-text)" },
  "& .MuiInputBase-input::placeholder": { color: "var(--st-text-disabled)", opacity: 1 },
  "& .MuiSvgIcon-root": { color: "var(--st-text)" },
  "& .MuiInputAdornment-root .MuiSvgIcon-root": { color: "var(--st-text-sec)" },
} as const;

/**
 * Drop-in replacement for MUI TextField with the Stitch dark-theme styling
 * baked in. Accepts all standard TextField props; pass `sx` to extend/override.
 */
export default function StyledTextField({ sx, ...props }: TextFieldProps) {
  return (
    <TextField
      sx={[inputSx, ...(Array.isArray(sx) ? sx : sx != null ? [sx] : [])]}
      {...props}
    />
  );
}
