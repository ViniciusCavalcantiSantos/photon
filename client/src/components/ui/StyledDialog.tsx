import { Dialog, DialogProps } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

interface StyledDialogProps extends Omit<DialogProps, "slotProps"> {
  /**
   * `sm` breakpoint min-width in px. Defaults to 480.
   * Automatically adds `xs: 'calc(100vw - 32px)'` for mobile.
   */
  minWidth?: number;
  /** Additional sx merged onto the Paper element. */
  paperSx?: SxProps<Theme>;
  /** Additional sx merged onto the Backdrop element. */
  backdropSx?: SxProps<Theme>;
}

/**
 * Drop-in for MUI Dialog with the Stitch dark-theme paper and backdrop styling
 * baked in. Use `paperSx` / `backdropSx` to extend or override per-dialog.
 *
 * @example
 * <StyledDialog open={open} onClose={close} minWidth={520}>
 *   ...
 * </StyledDialog>
 */
export default function StyledDialog({
  minWidth = 480,
  paperSx,
  backdropSx,
  children,
  ...props
}: StyledDialogProps) {
  return (
    <Dialog
      slotProps={{
        paper: {
          sx: [
            {
              backgroundColor: "var(--st-bg-paper)",
              backgroundImage: "none",
              border: "1px solid var(--st-border)",
              borderRadius: "16px",
              color: "var(--st-text)",
              minWidth: { xs: "calc(100vw - 32px)", sm: minWidth },
              overflow: "visible",
            },
            ...(Array.isArray(paperSx) ? paperSx : paperSx != null ? [paperSx] : []),
          ],
        },
        backdrop: {
          sx: [
            { backgroundColor: "var(--st-bg-mask)" },
            ...(Array.isArray(backdropSx)
              ? backdropSx
              : backdropSx != null
                ? [backdropSx]
                : []),
          ],
        },
      }}
      {...props}
    >
      {children}
    </Dialog>
  );
}
