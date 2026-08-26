import { styled, keyframes } from "../../styles/theme.js";

/**
 * PulsingPin.stitch.jsx
 *
 * The live SOS marker. The expanding rings aren't purely decorative -
 * they're the visual read of the broadcast radius (500m/1km/2km), so the
 * "wow" animation doubles as functional information.
 *
 * Usage:
 *   <PulsingPinWrapper>
 *     <PinCore crisisType="medical" />
 *     <PinRing crisisType="medical" />
 *     <PinRing crisisType="medical" css={{ animationDelay: "0.6s" }} />
 *   </PulsingPinWrapper>
 */
const pulse = keyframes({
  "0%": { transform: "scale(0.4)", opacity: 0.9 },
  "100%": { transform: "scale(1.6)", opacity: 0 },
});

export const PulsingPinWrapper = styled("div", {
  position: "relative",
  width: "16px",
  height: "16px",
});

const crisisColorVariants = {
  medical: { backgroundColor: "$crisisMedical", color: "$crisisMedical" },
  fire: { backgroundColor: "$crisisFire", color: "$crisisFire" },
  gas_leak: { backgroundColor: "$crisisGasLeak", color: "$crisisGasLeak" },
  accident: { backgroundColor: "$crisisAccident", color: "$crisisAccident" },
  threat: { backgroundColor: "$crisisThreat", color: "$crisisThreat" },
  other: { backgroundColor: "$crisisOther", color: "$crisisOther" },
};

export const PinCore = styled("div", {
  width: "16px",
  height: "16px",
  borderRadius: "50%",
  position: "relative",
  zIndex: 1,

  variants: { crisisType: crisisColorVariants },
  defaultVariants: { crisisType: "other" },
});

export const PinRing = styled("span", {
  position: "absolute",
  inset: "-16px",
  borderRadius: "50%",
  border: "2px solid currentColor",
  backgroundColor: "transparent",
  animation: `${pulse} 1.8s ease-out infinite`,

  "@reducedMotion": {
    animation: "none",
    opacity: 0.4,
  },

  variants: {
    crisisType: {
      medical: { color: "$crisisMedical" },
      fire: { color: "$crisisFire" },
      gas_leak: { color: "$crisisGasLeak" },
      accident: { color: "$crisisAccident" },
      threat: { color: "$crisisThreat" },
      other: { color: "$crisisOther" },
    },
  },
  defaultVariants: { crisisType: "other" },
});

/**
 * Convenience composed component - two rings staggered for a continuous
 * pulse effect, matching the live map mockup.
 */
export function PulsingPin({ crisisType = "other" }) {
  return (
    <PulsingPinWrapper>
      <PinCore crisisType={crisisType} />
      <PinRing crisisType={crisisType} />
      <PinRing crisisType={crisisType} css={{ animationDelay: "0.6s" }} />
    </PulsingPinWrapper>
  );
}

export default PulsingPin;
