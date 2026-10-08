# General Travels — Implementation Plan

Premium bus-hire marketplace connecting travellers (corporate, government, institutions, events, families) with verified bus and tempo-traveller operators. Customers hire a **whole vehicle** for a route and dates at a **fixed, upfront fare** calculated from the operator's rates. This is not seat booking, and there are no quotes or negotiation.

```
Operator registers → Admin verifies operator (once) → Operator adds buses → Admin approves each bus → Bus is live
Customer searches → sees fixed fare → books → Operator confirms → contacts shared → trip → completed
```

---

## The three roles

| Role | Where | What they do |
|---|---|---|
| **Customer** (traveller) | `/buses`, `/bookings` | Search route + dates + group size, see the exact fare, book, track status, cancel before the trip. |
| **Operator** (bus owner) | `/operator` | Register once, add any number of buses, confirm/decline booking requests, mark trips completed. |
| **Admin** (General Travels team) | `/admin` | Verify each operator **once**, approve **every bus** separately, oversee all bookings. |

### Approval rules
- An operator is approved **once**. After that they can keep adding buses.
- Every bus is approved **separately**, and only after its operator is approved. The Approve button stays disabled until then, and the server enforces it too.
- A bus is **live** (searchable and bookable) only when operator **and** bus are both approved.
- Suspending an operator hides all of their buses. Suspending a bus hides only that bus.

### Fare formula (`src/lib/pricing.js`)
```
billable km = max(route km × (2 if round trip), min km/day × days)
fare        = billable km × rate/km + driver allowance/day × days
total       = fare + 5% GST          (tolls, parking, permits at actuals)
```
Route km is estimated from city coordinates (straight line × 1.25). Swap `distanceKm()` for a maps API when exact routing matters. The booking action always recomputes the fare on the server.

### Booking lifecycle
`pending` (customer booked) → `confirmed` (operator accepted) → `completed`, or `declined` / `cancelled`.
Pending and confirmed bookings block the bus for those dates, so it can't be double-booked.

### Anti-bypass rules
- Customers see a masked operator ("Verified operator · Delhi"). Operator name, phone and vehicle number are revealed only after the operator **confirms**.
- Operators see only the traveller's first name and pickup city until they confirm.
- Admin reviews every bus listing (no phone numbers or branding in listings) before it goes live.

---

## Tech decisions

| Area | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router), JavaScript | Server Components and Server Actions give a single codebase for site, operator portal and admin. SEO-friendly by default. |
| React | React 19 + **React Compiler** | Automatic memoisation, so no hand-written `useMemo` or `useCallback`. |
| Styling | **CSS Modules** + global design tokens (`src/app/globals.css`) | Navy + gold premium theme, Playfair Display + Manrope. Brand colours live in one place. |
| Icons | lucide-react | Tree-shaken SVG icons. Vehicle photos are Wikimedia Commons stock images per type (`lib/constants/photos.js`, credited on `/photo-credits`) until operators upload their own. |
| Auth (PoC) | Signed HTTP-only cookie session (`src/lib/session.js`) | Customers and operators sign in with their mobile number, and admin signs in with a password. |
| Data (PoC) | JSON file store (`.data/db.json`) | Runs with zero setup. All access goes through `src/lib/data/*`. |
| Data (MVP) | PostgreSQL (Neon / Supabase / RDS) + Prisma or Drizzle | Relational fits operators → buses → bookings. |
| Auth (MVP) | **Phone OTP** for customers and operators (MSG91 / Twilio Verify), email + 2FA for admins | Verify the OTP in `loginCustomer` / `loginOperator` before `writeSession`. |
| Files | S3 / Cloudflare R2 with signed uploads | Bus photos and RC / insurance / permit / fitness documents. |
| Notifications | WhatsApp Business API (Interakt / Gupshup / MSG91), SMS, email (Resend) | New booking → operator; confirmed or declined → customer. |
| Payments | Razorpay (advance at booking), if the business model needs it | UPI and GST invoices. |
| Hosting | Vercel (web) + managed Postgres | The JSON store must move to Postgres first (read-only filesystem). |

---

## Folder structure

```
src/
├── app/
│   ├── layout.js, globals.css        # fonts, design tokens
│   ├── (site)/                       # PUBLIC site (header + footer)
│   │   ├── page.js                   # home: search, three roles, fleet, featured buses
│   │   ├── how-it-works/             # swimlane of all three roles + ground rules
│   │   ├── buses/                    # search results with fixed fares + availability
│   │   │   └── [id]/                 # bus detail, fare breakdown, booking form
│   │   ├── bookings/ (+ [id])        # CUSTOMER: my bookings, status timeline, cancel
│   │   ├── login/                    # role picker: traveller / operator / admin
│   │   └── become-a-partner/         # operator registration
│   ├── operator/                     # OPERATOR PORTAL (requireOperator)
│   │   ├── page.js                   # dashboard + "getting live" onboarding tracker
│   │   ├── bookings/                 # confirm / decline / complete
│   │   └── buses/ (+ new/)           # fleet with per-bus approval state, add bus
│   └── admin/                        # ADMIN CONSOLE (requireAdmin)
│       ├── page.js                   # approval queues: operators (step 1), buses (step 2)
│       ├── operators/, buses/, bookings/
├── components/
│   ├── layout/    SiteHeader, Footer, PortalShell, AuthSplit, Logo
│   ├── forms/     TripSearch, BookingForm, BusForm, OperatorSignupForm, LoginForms
│   ├── vehicles/  BusCard, BusPhoto, FareBreakdown, Amenity*
│   ├── bookings/  OperatorBookingCard
│   └── ui/        Badge, Stepper, EmptyState, PageHeader, StatCard, ReviewActions
└── lib/
    ├── auth.js, session.js           # getViewer(), requireCustomer/Operator/Admin()
    ├── pricing.js                    # distance, parseTrip, calculateFare
    ├── constants/                    # amenities, vehicle types, cities, statuses
    ├── data/                         # store (persistence), queries, seed
    ├── actions/                      # server actions: auth, booking, operator, admin
    ├── validation.js, format.js
```

**Rule of thumb:** pages never touch storage directly. They call `lib/data/queries.js` to read and `lib/actions/*` to write, so swapping the JSON store for Postgres is a contained change. Every portal page **and** every action calls a `require*` helper, because layouts alone don't protect pages.

---

## Core data model

```
Customer ──< Booking >── Bus >── Operator

Customer   id, name, phone, email
Operator   id, businessName, ownerName, phone, email, city, fleetSize, panNumber, gstNumber,
           status (pending|approved|rejected), reviewedAt
Bus        id, operatorId, title, type, seats, ac, modelYear, registrationNumber (private),
           baseCity, serviceCities[], ratePerKm, minKmPerDay, driverAllowancePerDay,
           amenities[], documents{rc,insurance,permit,fitness}, status (pending|approved|rejected)
Booking    id, ref (GT-XXXXX), customerId, busId, operatorId, tripType, from, to,
           startDate, endDate, passengers, pickupAddress, notes,
           fare{billableKm, days, kmCharge, driverAllowance, gst, total} (snapshot),
           status (pending|confirmed|declined|cancelled|completed)
```

Amenities (35, in 6 categories) are defined in `src/lib/constants/amenities.js`. To add one, add a line there and map its icon in `AmenityIcon.js`.

---

## Phases

### Phase 0: PoC ✅ (this repo)
- [x] Three roles with sign-in and role-protected portals
- [x] Operator: register → under review → add buses → per-bus approval state → confirm bookings
- [x] Admin: approval queues, operator-before-bus rule, suspend, all bookings
- [x] Customer: search with fixed fares and availability, book, status timeline, cancel
- [x] Premium navy + gold design, responsive down to 375px

### Phase 1: MVP (web), about 6–8 weeks
1. **Database:** Postgres + Prisma. Rewrite `lib/data/store.js` and `queries.js`, then add migrations and seed. Use a DB constraint or transaction for double-booking.
2. **OTP sign-in** for customers and operators, plus admin accounts with 2FA and an audit log of approvals.
3. **Uploads:** bus photos and documents to R2/S3, with an admin document viewer. Replace `BusArt` with photos.
4. **Notifications:** WhatsApp/SMS on new booking (operator), confirm/decline (customer), and a reminder the day before the trip.
5. **Operator tools:** edit a bus (re-review on rate or document change), block dates, auto-decline unanswered requests after N hours.
6. **Assisted onboarding:** admin can create operators and buses on their behalf.
7. **SEO:** city and route landing pages (`/tempo-traveller-hire-in-delhi`, `/delhi-to-jaipur-bus-hire`), sitemap, JSON-LD.

### Phase 2: Payments and trust
- Razorpay advance at booking, refunds on decline/cancel, operator payouts ledger, GST invoices
- Ratings and reviews, operator response-time score
- Corporate accounts (multiple users, PO numbers, monthly billing)

### Phase 3: Mobile and scale
- Customer and operator apps (Expo) on the same API, live GPS trip tracking, dynamic pricing insights

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000
```

- Demo data is seeded into `.data/db.json` on first request. Delete that folder to reset.
- `/login` has one-click **demo access** buttons in development: traveller, approved operator, operator under review, and admin.
- Admin password defaults to `admin` in development. Set `ADMIN_PASSWORD` and `SESSION_SECRET` in production.

### Demo script
1. **Admin** → `/admin`: Pink City Tours is waiting for verification, and its bus can't be approved yet. Approve the operator, then the bus.
2. **Traveller** → `/buses`: search Delhi → Agra, pick dates and 15 passengers. Every bus shows its exact fare. Open one, then sign in and book.
3. **Operator (approved)** → `/operator`: the request appears with the traveller's first name only. Confirm it.
4. **Traveller** → `/bookings`: the status is Confirmed, and the operator's phone and vehicle number are now visible.
5. **List your bus** → register a new operator, add a bus, and watch it wait in the admin queue.

---

## Open questions for the client
1. Revenue model: commission per booking, operator subscription, or both? (This decides whether online payment is needed in the MVP.)
2. Should a booking take an advance payment, or stay pay-later?
3. How long may an operator take to confirm before the request auto-declines?
4. Cancellation policy and refund windows.
5. Old-site URL list and Search Console access, for the SEO migration.
6. The list of vehicle types and amenities: confirm it, or add any that are missing.
