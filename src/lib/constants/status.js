// Workflow statuses shared by the customer, vendor and admin interfaces.

export const VENDOR_STATUS = {
  PENDING: "pending", // registered, documents under review
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const VEHICLE_STATUS = {
  PENDING: "pending", // awaiting admin review of photos/documents
  APPROVED: "approved", // visible to customers, eligible for enquiries
  REJECTED: "rejected",
};

export const ENQUIRY_STATUS = {
  OPEN: "open", // accepting quotes
  BOOKED: "booked", // customer accepted a quote
  CANCELLED: "cancelled",
};

export const QUOTE_STATUS = {
  SUBMITTED: "submitted",
  ACCEPTED: "accepted",
  DECLINED: "declined", // another quote was accepted
};

export const STATUS_TONE = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
  open: "info",
  booked: "success",
  cancelled: "neutral",
  submitted: "info",
  accepted: "success",
  declined: "neutral",
};
