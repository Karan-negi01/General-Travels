// Workflow statuses shared by the customer, operator and admin interfaces.
//
// Approval rules:
//   - An operator (bus owner) is approved ONCE by admin.
//   - Every bus is approved separately, and only after its operator is approved.
//   - Every driver is approved separately too.
//   - A bus is bookable ("live") only when its operator, the bus itself and its
//     assigned driver are all approved.
//   - Every rejection carries a reason the owner sees, so they can fix it and re-apply.

export const REVIEW_STATUS = {
  PENDING: "pending", // waiting for admin review
  APPROVED: "approved",
  REJECTED: "rejected",
};

// There is no operator accept/decline step: a booking is confirmed as soon as
// the traveller pays. Owners keep their buses' availability accurate with the
// availability calendar instead.
export const BOOKING_STATUS = {
  PAYMENT_PENDING: "payment_pending", // booked, waiting for the traveller to pay
  CONFIRMED: "confirmed", // paid (advance or full); contacts are shared with both sides
  CANCELLED: "cancelled", // cancelled by the traveller (refund issued if paid)
  COMPLETED: "completed", // trip done, owner paid out
};

// An unpaid booking holds the bus for this long so two travellers can't pay for the same dates.
export const PAYMENT_HOLD_MINUTES = 15;

export const STATUS_TONE = {
  pending: "warning",
  payment_pending: "warning",
  approved: "success",
  rejected: "danger",
  confirmed: "success",
  declined: "danger",
  cancelled: "neutral",
  completed: "info",
  live: "success",
};

// Friendly wording per audience. Falls back to the raw status.
export const STATUS_LABEL = {
  review: { pending: "Under review", approved: "Approved", rejected: "Rejected" },
  booking: {
    payment_pending: "Payment pending",
    confirmed: "Confirmed",
    declined: "Declined",
    cancelled: "Cancelled",
    completed: "Completed",
  },
};
