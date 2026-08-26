import { createStitches } from "@stitches/react";

/**
 * NearHelp design tokens - see docs/NearHelp_PRD_Addendum_Design.md section 3.2
 * for the full rationale behind this palette ("dispatch ticket" direction).
 */
export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      // Core tokens
      ink: "#0B1F33",
      fog: "#F4F6F3",
      signal: "#FF7A1A",
      signalText: "#3A1B00", // dark-on-amber text, passes AA on `signal`
      slate: "#5B6B7C",
      alert: "#E2483D",
      verified: "#1F9E6D",

      // Crisis-type categorical set (tags, pins, badges only)
      crisisMedical: "#2F6FED",
      crisisFire: "#E2483D",
      crisisGasLeak: "#FF7A1A",
      crisisAccident: "#8B5CF6",
      crisisThreat: "#6B1E3B",
      crisisOther: "#5B6B7C",

      // Surfaces
      surfaceLight: "#FFFFFF",
      overlayScrim: "rgba(11, 31, 51, 0.6)",
    },
    fonts: {
      // Display/stamp face - bold, wide-tracked, used sparingly (wordmark, stamped labels)
      display: '"Oswald", "Arial Narrow", sans-serif',
      // Body face - everything read under stress needs to be fast to parse
      body: '"Inter", "Helvetica Neue", Arial, sans-serif',
      // Utility face - coordinates, timestamps, ticket numbers, AI step numbers
      mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
    },
    radii: {
      sm: "6px",
      md: "10px",
      lg: "16px",
      xl: "24px",
      pill: "999px",
    },
    space: {
      xs: "4px",
      sm: "8px",
      md: "12px",
      lg: "16px",
      xl: "24px",
      xxl: "32px",
    },
    fontSizes: {
      caption: "11px",
      body: "14px",
      subtitle: "13px",
      title: "16px",
      display: "20px",
    },
    transitions: {
      fast: "120ms ease",
      base: "200ms ease",
    },
  },
  media: {
    sm: "(min-width: 480px)",
    reducedMotion: "(prefers-reduced-motion: reduce)",
  },
  utils: {
    // Shorthand: px="$md" sets both paddingLeft and paddingRight
    px: (value) => ({ paddingLeft: value, paddingRight: value }),
    py: (value) => ({ paddingTop: value, paddingBottom: value }),
  },
});

/**
 * Global reset + font-face setup. Call once at the app root:
 *   import { globalStyles } from "./styles/theme";
 *   globalStyles();
 */
export const globalStyles = globalCss({
  "*": { boxSizing: "border-box" },
  "html, body": {
    margin: 0,
    padding: 0,
    backgroundColor: "$fog",
    color: "$ink",
    fontFamily: "$body",
  },
  "button": {
    fontFamily: "inherit",
  },
});

/**
 * Maps a crisis type enum value to its themed color token name.
 * Keeps every component's crisisType variant list in sync with one source.
 */
export const CRISIS_TYPE_COLOR_TOKEN = {
  medical: "crisisMedical",
  fire: "crisisFire",
  gas_leak: "crisisGasLeak",
  accident: "crisisAccident",
  threat: "crisisThreat",
  other: "crisisOther",
};

export const CRISIS_TYPE_LABEL = {
  medical: "Medical",
  fire: "Fire",
  gas_leak: "Gas leak",
  accident: "Accident",
  threat: "Threat",
  other: "Other",
};
