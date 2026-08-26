import { styled } from "../../styles/theme.js";
import { CRISIS_TYPE_COLOR_TOKEN } from "../../styles/theme.js";

/**
 * TriageTag.stitch.jsx
 *
 * The signature element of the design system - a die-cut tag silhouette
 * (small circular notch on the left edge) borrowed from real mass-casualty
 * triage tags. Used for crisis-type labels on pins/tickets AND for skill
 * badges (CPR, Doctor, Nurse, etc.) on responder cards.
 *
 * Usage:
 *   <TriageTag crisisType="medical">Medical · 1km</TriageTag>
 *   <TriageTag tone="skill">CPR</TriageTag>
 */
export const TriageTag = styled("span", {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  fontFamily: "$mono",
  fontWeight: 700,
  fontSize: "$caption",
  letterSpacing: "1px",
  textTransform: "uppercase",
  padding: "6px 12px 6px 18px",
  borderRadius: "0 $sm $sm 0",
  color: "$fog",
  whiteSpace: "nowrap",

  // The die-cut notch - a small circle in the tag's own background color,
  // ringed with the tag's foreground color, sitting half-off the left edge.
  "&::before": {
    content: "",
    position: "absolute",
    left: "-6px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    backgroundColor: "$fog",
    border: "1px solid currentColor",
  },

  variants: {
    crisisType: {
      medical: { backgroundColor: "$crisisMedical" },
      fire: { backgroundColor: "$crisisFire" },
      gas_leak: { backgroundColor: "$crisisGasLeak" },
      accident: { backgroundColor: "$crisisAccident" },
      threat: { backgroundColor: "$crisisThreat" },
      other: { backgroundColor: "$crisisOther" },
    },
    // A separate quieter tone for skill badges (CPR/Doctor/Nurse) so they
    // read as "credential" rather than "alert" - same silhouette, calmer color.
    tone: {
      skill: {
        backgroundColor: "#FAEEDA",
        color: "#854F0B",
      },
      skillOutline: {
        backgroundColor: "transparent",
        color: "#854F0B",
        border: "1px dashed #854F0B",
        "&::before": {
          border: "1px dashed currentColor",
          backgroundColor: "transparent",
        }
      },
      neutral: {
        backgroundColor: "$slate",
        color: "$fog",
      },
    },
  },
});

/**
 * Convenience wrapper: pass the raw enum crisisType string and it resolves
 * the right variant + label automatically, so screens don't need to know
 * the theme's internal token names.
 */
export function CrisisTag({ crisisType, radiusLabel, ...props }) {
  const variant = CRISIS_TYPE_COLOR_TOKEN[crisisType] ? crisisType : "other";
  const label = crisisType ? crisisType.replace("_", " ") : "other";

  return (
    <TriageTag crisisType={variant} {...props}>
      {label}
      {radiusLabel ? ` · ${radiusLabel}` : ""}
    </TriageTag>
  );
}

export default TriageTag;
