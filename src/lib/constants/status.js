// Workflow statuses shared by the customer, operator and admin interfaces.
//
// Approval rules:
//   - An operator (bus owner) is approved ONCE by admin.
//   - Every bus is approved separately, and only after its operator is approved.
//   - A bus is bookable ("live") only when both the operator and the bus are approved.

export const REVIEW_STATUS = {
  PENDING: "pending", // waiting for admin review
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const BOOKING_STATUS = {
  PENDING: "pending", // customer booked, waiting for the operator to confirm
  CONFIRMED: "confirmed", // operator confirmed; contacts are shared with both sides
  DECLINED: "declined", // operator could not take the trip
  CANCELLED: "cancelled", // customer cancelled
  COMPLETED: "completed", // trip done
};

// Bookings in these states hold the bus for their dates.
export const BLOCKING_BOOKING_STATUSES = [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED];

export const STATUS_TONE = {
  pending: "warning",
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
    pending: "Awaiting confirmation",
    confirmed: "Confirmed",
    declined: "Declined",
    cancelled: "Cancelled",
    completed: "Completed",
  },
};
