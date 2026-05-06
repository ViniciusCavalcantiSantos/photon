// theme.ts
import {AliasToken} from "antd/es/theme/interface";
import {CSSProperties} from "react";

const theme = {
  primary: "#0C66E4", // #FFAA40,fbbf24, ea580cff, f4d666ff
  secondary: "#78ebff",

  overlay: "#c8d1da66",
} as const;

const themeBody = {
  "--overlay": theme.overlay
} as CSSProperties

const themeAntd = {
  colorPrimary: theme.primary,
  fontFamily: "var(--font-geist-sans), sans-serif",
} as Partial<AliasToken>

const themeAntdLight = {
  ...themeAntd,
  colorBgMask: theme.overlay,
} as Partial<AliasToken>

const themeAntdDark = {
  ...themeAntd
} as Partial<AliasToken>

/** Stitch / MUI-aligned design tokens for new components */
const stitchTokens = {
  primary: "#0C66E4",
  primaryHover: "#3b82f6",
  primaryLight: "rgba(12, 102, 228, 0.18)",

  dark: {
    bg: "#0B0C10",
    bgPaper: "#171821",
    bgElevated: "#1f2130",
    text: "#e8eaf0",
    textSec: "#9CA3AF",
    border: "#2a2f45",
  },
  light: {
    bg: "#f0f2f5",
    bgPaper: "#ffffff",
    bgElevated: "#ffffff",
    text: "#1a1a2e",
    textSec: "#5a6474",
    border: "#dde1e7",
  },
} as const;

export default theme
export {themeBody, themeAntd, themeAntdLight, themeAntdDark, stitchTokens}