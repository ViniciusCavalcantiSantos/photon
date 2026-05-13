import { Button, ButtonProps } from "@mui/material";

/**
 * Cancel / secondary action button for modal footers.
 * Renders as a plain (text) button in the Stitch secondary style.
 * Pass `sx` to extend or override.
 */
export default function DialogCancelButton({ sx, ...props }: ButtonProps) {
  return (
    <Button
      sx={[
        {
          borderRadius: "10px",
          textTransform: "none",
          color: "var(--st-text-sec)",
          "&:hover": { backgroundColor: "var(--st-bg-elevated)" },
        },
        ...(Array.isArray(sx) ? sx : sx != null ? [sx] : []),
      ]}
      {...props}
    />
  );
}
