import { extendTheme } from "@chakra-ui/react";

const lp = {
  bg: "#FAFDF8",
  surface: "#FFFFFF",
  surface2: "#E7F4E1",
  fg: "#15300C",
  fgMuted: "#46663A",
  fgDim: "#557050",
  line: "#CFE7BD",
  accent: "#3D7A29",
  accentMint: "#CAFFB8",
  accentSoft: "#DCF2CC",
  darkBg: "#0A0E0B",
  darkSurface: "#131815",
  darkFg: "#F2F4F2",
  // legacy aliases
  background: "#FAFDF8",
  black: "#0A0E0B",
  border: "#000000",
  foreground: "#15300C",
};

export const theme = extendTheme({
  colors: { lp },
  fontSizes: { "2xs": "0.625rem" },
  semanticTokens: {
    colors: {
      "text.secondary": { default: "#46663A" },
      "text.tertiary": { default: "#557050" },
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          bg: "#3D7A29",
          color: "white",
          border: "1px solid",
          borderColor: "#000000",
          boxShadow: "-2px 2px 0px 0px #000000",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          borderRadius: "0",
          _hover: { bg: "#2d6b20" },
          _active: { transform: "translate(2px, 2px)", boxShadow: "none" },
        },
        neon: {
          bg: "#CAFFB8",
          color: "#15300C",
          border: "1px solid",
          borderColor: "#000000",
          boxShadow: "-2px 2px 0px 0px #000000",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          borderRadius: "0",
          _hover: { bg: "#b8efaa" },
          _active: { transform: "translate(2px, 2px)", boxShadow: "none" },
        },
        outline: {
          border: "1px solid",
          borderColor: "#000000",
          bg: "transparent",
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          borderRadius: "0",
          color: "#000000",
          _hover: { bg: "#CAFFB8", borderColor: "#000000" },
        },
        ghost: {
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "wider",
          borderRadius: "0",
          color: "#15300C",
          _hover: { bg: "#E7F4E1" },
        },
      },
    },
  },
});
