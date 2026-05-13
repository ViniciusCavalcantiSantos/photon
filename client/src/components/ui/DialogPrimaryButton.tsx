import { Button, ButtonProps } from "@mui/material";

interface DialogPrimaryButtonProps extends Omit<ButtonProps, "color"> {
  /**
   * "primary" (default) — blue contained button.
   * "warning" — amber/warning contained button (e.g. for destructive actions).
   */
  color?: "primary" | "warning";
}

/**
 * Primary / confirm action button for modal footers.
 * Renders as a contained button in the Stitch primary (blue) or warning
 * (amber) style. Pass `sx` to extend or override.
 *
 * @example
 * <DialogPrimaryButton onClick={handleOk}>{t('save')}</DialogPrimaryButton>
 * <DialogPrimaryButton color="warning" onClick={handleDelete}>{t('delete')}</DialogPrimaryButton>
 */
export default function DialogPrimaryButton({
  color = "primary",
  sx,
  ...props
}: DialogPrimaryButtonProps) {
  const bg = color === "warning" ? "var(--st-warning)" : "var(--st-primary)";
  const bgHover = color === "warning" ? "#d97706" : "var(--st-primary-hover)";

  return (
    <Button
      variant="contained"
      sx={[
        {
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          backgroundColor: bg,
          "&:hover": { backgroundColor: bgHover },
        },
        ...(Array.isArray(sx) ? sx : sx != null ? [sx] : []),
      ]}
      {...props}
    />
  );
}
