import { styled } from "../../styles/theme.js";

/**
 * Button.stitch.jsx
 *
 * Usage:
 *   <Button intent="sos" size="pill">SOS</Button>
 *   <Button intent="resolve" size="block">Mark resolved</Button>
 *   <Button intent="ghost">Cancel</Button>
 */
export const Button = styled("button", {
  fontFamily: "$body",
  fontWeight: 700,
  letterSpacing: "0.4px",
  border: "none",
  cursor: "pointer",
  borderRadius: "$md",
  padding: "12px 20px",
  fontSize: "$body",
  transition: "transform $transitions$fast",

  "&:active": { transform: "scale(0.97)" },
  "&:disabled": { opacity: 0.5, cursor: "not-allowed" },

  variants: {
    intent: {
      // The one loud color in the system - reserved for the primary SOS action.
      sos: {
        backgroundColor: "$signal",
        color: "$signalText",
      },
      resolve: {
        backgroundColor: "$verified",
        color: "#04241A",
      },
      respond: {
        backgroundColor: "$verified",
        color: "#04241A",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "$ink",
        border: "1px solid $slate",
      },
      danger: {
        backgroundColor: "$alert",
        color: "#3D0A08",
      },
    },
    size: {
      normal: {},
      block: { width: "100%" },
      pill: { borderRadius: "$pill" },
      circle: {
        width: "76px",
        height: "76px",
        borderRadius: "50%",
        padding: 0,
        fontSize: "$subtitle",
      },
    },
  },

  defaultVariants: {
    intent: "ghost",
    size: "normal",
  },
});

export default Button;
