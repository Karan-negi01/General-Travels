// Payment and commission rules. Pure functions, shared by pages and actions.
//
// DEMO: payments are simulated. The checkout looks like Razorpay's, but no money
// moves. To go live, create a Razorpay order in `startPayment`, open Razorpay
// Checkout in the browser, and verify the payment signature on the server before
// marking the booking paid. Razorpay Route can then split each payment between
// General Travels' commission and the owner's account.

export const ADVANCE_RATE = 0.25; // a traveller can pay 25% now and the rest before the trip
export const DEFAULT_COMMISSION_RATE = 10; // % of the fare before GST

export const PAYMENT_OPTIONS = [
  { id: "advance", label: "Pay 25% advance" },
  { id: "full", label: "Pay in full" },
];

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI" },
  { id: "card", label: "Card" },
  { id: "netbanking", label: "Net banking" },
];

export function advanceAmount(fare) {
  return Math.round(fare.total * ADVANCE_RATE);
}

export function amountFor(option, fare) {
  return option === "advance" ? advanceAmount(fare) : fare.total;
}

export function paidAmount(booking) {
  return (booking.payments ?? []).reduce((sum, p) => sum + p.amount, 0);
}

export function balanceDue(booking) {
  return Math.max(booking.fare.total - paidAmount(booking), 0);
}

// Commission is charged on the fare before GST. The owner receives the rest.
export function splitFare(fare, ratePercent) {
  const commission = Math.round((fare.subtotal * ratePercent) / 100);
  return { commissionRate: ratePercent, commission, ownerPayout: fare.total - commission };
}

export function demoPaymentId() {
  return `pay_demo_${Math.random().toString(36).slice(2, 12)}`;
}
