import {
  FormControl,
  FormHelperText,
  Select,
  SelectProps,
} from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { ReactNode } from "react";

const selectSx = {
  borderRadius: "12px",
  backgroundColor: "var(--st-bg-elevated)",
  color: "var(--st-text)",
  "& fieldset": { borderColor: "var(--st-border)" },
  "&:hover fieldset": { borderColor: "var(--st-primary)" },
  "&.Mui-focused fieldset": { borderColor: "var(--st-primary)" },
  "& .MuiSvgIcon-root": { color: "var(--st-text)" },
} as const;

const menuProps = {
  slotProps: {
    paper: {
      sx: {
        backgroundColor: "var(--st-bg-elevated)",
        border: "1px solid var(--st-border)",
        borderRadius: "12px",
        "& .MuiMenuItem-root": {
          color: "var(--st-text)",
          fontSize: "0.85rem",
          "&:hover": { backgroundColor: "var(--st-primary-light)" },
          "&.Mui-selected": { backgroundColor: "var(--st-primary-light)" },
        },
      },
    },
  },
} as const;

interface StyledSelectProps extends Omit<SelectProps, "sx"> {
  /** Forwarded to the wrapping FormControl. */
  fullWidth?: boolean;
  /** Forwarded to the wrapping FormControl. */
  size?: "small" | "medium";
  /** When set, shows a FormHelperText below the select. */
  helperText?: ReactNode;
  /** Additional sx merged onto the Select element. */
  sx?: SxProps<Theme>;
}

/**
 * Drop-in for MUI `<FormControl><Select>` with the Stitch dark-theme styling
 * and dropdown menu appearance baked in.
 *
 * @example
 * <StyledSelect fullWidth size="small" value={...} onChange={...} error={!!err} helperText={err}>
 *   <MenuItem value="a">Option A</MenuItem>
 * </StyledSelect>
 */
export default function StyledSelect({
  fullWidth,
  size = "small",
  error,
  helperText,
  sx,
  children,
  ...props
}: StyledSelectProps) {
  return (
    <FormControl fullWidth={fullWidth} size={size} error={error}>
      <Select
        sx={[selectSx, ...(Array.isArray(sx) ? sx : sx != null ? [sx] : [])]}
        MenuProps={menuProps}
        {...props}
      >
        {children}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}
