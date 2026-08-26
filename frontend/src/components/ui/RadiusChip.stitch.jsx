import { styled } from "../../styles/theme.js";

/**
 * RadiusChip.stitch.jsx
 *
 * Usage:
 *   <RadiusChip active={radius === 500} onClick={() => setRadius(500)}>500m</RadiusChip>
 */
export const RadiusChip = styled("button", {
  fontFamily: "$body",
  fontSize: "$caption",
  fontWeight: 600,
  padding: "6px 14px",
  borderRadius: "$pill",
  border: "1px solid rgba(244, 246, 243, 0.3)",
  backgroundColor: "rgba(244, 246, 243, 0.12)",
  color: "$fog",
  cursor: "pointer",
  transition: "background-color $transitions$fast, color $transitions$fast",

  variants: {
    active: {
      true: {
        backgroundColor: "$fog",
        color: "$ink",
        border: "1px solid $fog",
      },
    },
  },
});

export default RadiusChip;
