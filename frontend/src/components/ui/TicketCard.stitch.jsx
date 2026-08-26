import { styled } from "../../styles/theme.js";

/**
 * TicketCard.stitch.jsx
 *
 * The light "paper ticket" panel that holds incident details, responder
 * rows, AI guidance, and the resolve action. A perforated top edge (dashed
 * line inset from both sides) nods to a tear-off dispatch slip.
 *
 * Usage:
 *   <TicketCard>
 *     <TicketRow>...</TicketRow>
 *   </TicketCard>
 */
export const TicketCard = styled("div", {
  backgroundColor: "$fog",
  borderRadius: "$lg",
  padding: "$lg",
  color: "$ink",
  position: "relative",

  "&::after": {
    content: "",
    position: "absolute",
    top: 0,
    left: "$xl",
    right: "$xl",
    height: "1px",
    backgroundImage:
      "repeating-linear-gradient(90deg, #5B6B7C 0 6px, transparent 6px 12px)",
  },
});

export const TicketRow = styled("div", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "$sm $md",
  backgroundColor: "$surfaceLight",
  borderRadius: "$md",
  marginBottom: "$sm",
  fontSize: "$subtitle",
});

export const TicketLabel = styled("div", {
  fontSize: "$caption",
  color: "$slate",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  marginBottom: "$xs",
});

export const TicketNumber = styled("span", {
  fontFamily: "$mono",
  fontSize: "$caption",
  color: "$slate",
});

export default TicketCard;
