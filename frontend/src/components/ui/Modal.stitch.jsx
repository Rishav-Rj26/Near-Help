import { styled } from "../../styles/theme.js";

/**
 * Modal.stitch.jsx
 *
 * Bottom-sheet on mobile, centered dialog on larger screens (>= $sm).
 * Used for the crisis-type picker and radius confirmation in the SOS
 * trigger flow.
 *
 * Usage:
 *   <ModalOverlay onClick={onClose}>
 *     <ModalSheet onClick={(e) => e.stopPropagation()}>...</ModalSheet>
 *   </ModalOverlay>
 */
export const ModalOverlay = styled("div", {
  position: "fixed",
  inset: 0,
  backgroundColor: "$overlayScrim",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  zIndex: 1000,

  "@sm": { alignItems: "center" },
});

export const ModalSheet = styled("div", {
  backgroundColor: "$fog",
  color: "$ink",
  width: "100%",
  maxWidth: "420px",
  borderRadius: "$lg $lg 0 0",
  padding: "$xl",

  "@sm": { borderRadius: "$lg" },
});

export const ModalTitle = styled("h2", {
  fontFamily: "$display",
  textTransform: "uppercase",
  letterSpacing: "1.5px",
  fontSize: "$title",
  margin: "0 0 $lg 0",
});

export default ModalOverlay;
