import { Typography, TypographyProps } from "@mui/material";
import { ReactNode } from "react";

interface FieldLabelProps extends Omit<TypographyProps, "children"> {
  children: ReactNode;
  /** When true, appends a blue asterisk after the label text. */
  required?: boolean;
}

const labelSx = {
  color: "var(--st-text)",
  fontWeight: 600,
  fontSize: "0.85rem",
  mb: 0.75,
  "& .required-star": {
    color: "var(--st-primary)",
    ml: 0.25,
  },
} as const;

/**
 * Form field label following the Stitch design system.
 * Use the `required` prop to append the styled asterisk automatically.
 *
 * @example
 * <FieldLabel required>{t('title')}</FieldLabel>
 */
export default function FieldLabel({ children, required, sx, ...props }: FieldLabelProps) {
  return (
    <Typography
      sx={[labelSx, ...(Array.isArray(sx) ? sx : sx != null ? [sx] : [])]}
      {...props}
    >
      {children}
      {required && <span className="required-star"> *</span>}
    </Typography>
  );
}
