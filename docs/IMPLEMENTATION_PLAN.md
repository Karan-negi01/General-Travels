# General Travels — Implementation Plan

Charter-rental e-marketplace connecting customers (corporate, government, institutions, events, retail) with verified bus and tempo-traveller operators. Customers request a **whole vehicle** for a route and dates, and matching vendors send **competing quotes**. This is not seat booking.

```
SEO / Ads → Customer enquiry → Matching vendors notified → Quotes → Customer accepts → Booking & payment
```

---

## Tech decisions

| Area | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router), JavaScript | Server Components and Server Actions give a single codebase for site, vendor portal and admin. SEO-friendly by default. |
| React | React 19 + **React Compiler** | Automatic memoisation, so no hand-written `useMemo` or `useCallback`. |
| Styling | **CSS Modules** + global design tokens (`src/app/globals.css`) | No Tailwind (as requested). Scoped styles, zero runtime, and brand colours live in one place. |
| Icons | lucide-react | Tree-shaken SVG icons (see `AmenityIcon.js`). |
| Data (PoC) | JSON file store (`.data/db.json`) | Runs with zero setup. All access goes through `src/lib/data/*`. |
| Data (MVP) | PostgreSQL (Neon / Supabase / RDS) + Prisma or Drizzle | Relational fits vendors → vehicles → enquiries → quotes → bookings. |
| Auth (MVP) | Auth.js or Clerk, **phone OTP** for customers and vendors, email + 2FA for admins | Many vendors have limited digital literacy, and an OTP is easier than a password. |
| Files | S3 / Cloudflare R2 with signed uploads | Vehicle photos and RC/insurance/permit/fitness documents. |
| Notifications | WhatsApp Business API (Interakt / Gupshup / MSG91), SMS (MSG91), email (Resend) | Vendors in India respond fastest on WhatsApp. |
| Payments | Razorpay (advance / commission), if the business model needs it | Common Indian gateway with UPI and support for GST invoices. |
| Mobile | Expo (React Native), reusing the same backend API | One JS skill set across web and mobile. |
| Hosting | Vercel (web) + managed Postgres, or AWS | The client wants one partner managing everything. |

---

## Folder structure

```
src/
├── app/
│   ├── layout.js, globals.css      # root layout, fonts, design tokens
│   ├── (site)/                     # PUBLIC customer site (header + footer)
│   │   ├── page.js                 # home: search, how it works, segments
│   │   ├── buses/                  # browse + filter by city/pax/type/amenities
│   │   │   └── [id]/               # vehicle detail
│   │   ├── enquiry/new/            # post a charter requirement
│   │   ├── enquiry/[id]/           # view quotes → accept
│   │   └── become-a-partner/       # vendor self-registration
│   ├── vendor/                     # VENDOR PORTAL (sidebar shell)
│   │   ├── page.js                 # dashboard
│   │   ├── enquiries/              # matching trip requests → send quote
│   │   └── vehicles/ (+ new/)      # fleet list, add vehicle with amenities
│   └── admin/                      # ADMIN DASHBOARD
│       ├── vendors/                # verify / reject vendors
│       ├── vehicles/               # approve listings
│       └── enquiries/              # all enquiries + quote counts
├── components/
│   ├── layout/                     # SiteHeader, SiteFooter, PortalShell
│   ├── forms/                      # EnquiryForm, VehicleForm, QuoteForm, …
│   ├── vehicles/                   # AmenityPicker, AmenityList, VehicleCard
│   └── ui/                         # Badge, Field, PageHeader, StatCard
└── lib/
    ├── constants/                  # amenities, vehicle types, cities, statuses
    ├── data/                       # store (persistence), queries, seed
    ├── actions/                    # server actions: enquiry, vendor, admin
    ├── auth.js                     # auth stub → replace with real sessions
    ├── validation.js, format.js
```

**Rule of thumb:** pages never touch storage directly. They call `lib/data/queries.js` to read and `lib/actions/*` to write, which is why swapping the JSON store for Postgres is a contained change.

---

## Core data model

```
Vendor ──< Vehicle
  id, name, contactName, phone, email, city,
  status (pending|approved|rejected), onboarding (self|assisted), documents{gst,pan,…}

Vehicle
  id, vendorId, title, type, seats, ac, modelYear, registrationNumber (private),
  baseCity, serviceCities[], ratePerKm, minKmPerDay, driverAllowancePerDay,
  amenities[] (ids from lib/constants/amenities.js), photos[], documents{rc,insurance,permit,fitness},
  status (pending|approved|rejected)

Enquiry ──< Quote
  id, tripType, pickupCity, dropCity, startDate, endDate, passengers,
  vehicleType?, requiredAmenities[], customerType, customer contact (private), status (open|booked|cancelled)

Quote
  id, enquiryId, vendorId, vehicleId, amount, includes[], notes, status (submitted|accepted|declined)
```

**Amenities** (35, in 6 categories: comfort, connectivity and power, food, entertainment, safety, accessibility) are defined in `src/lib/constants/amenities.js`. To add one, add a line there and map its icon in `AmenityIcon.js`. Both the vendor form and the customer filters pick it up automatically.

### Anti-bypass rules (from the brief)
- Customers see a masked operator ("Verified operator · Delhi"). The vendor's name, phone and registration number stay hidden until the customer accepts that vendor's quote.
- Vendors see the trip requirement but **not** the customer's name, phone or email.
- Admin reviews every vehicle listing (photos must not contain phone numbers or branding) before it goes live.

---

## Phases

### Phase 0: PoC foundation ✅ (this repo, today)
- [x] Next.js + JS + React Compiler + CSS Modules, `src/` structure
- [x] Customer: home, browse with amenity filters, vehicle detail, post enquiry, compare and accept quotes
- [x] Vendor: register, dashboard, add vehicle with amenities, matching trip requests, send or update a quote
- [x] Admin: overview, approve/reject vendors and vehicles, all enquiries
- [x] Matching engine: city served + seats ≥ pax + vehicle type + all required amenities
- [x] Contact masking on both sides

**Use it for:** the client and investor demo (the brief asks for a high-quality PoC).

### Phase 1: MVP (web), about 6–8 weeks
1. **Database:** Postgres + Prisma. Rewrite `lib/data/store.js` and `queries.js`, then add migrations and seed.
2. **Auth and roles:** phone OTP (customer, vendor), admin login, and real checks in `lib/auth.js` inside every action.
3. **Uploads:** vehicle photos and vendor/vehicle documents to R2/S3, with an admin document viewer.
4. **Assisted onboarding:** admin can create a vendor and list vehicles on the vendor's behalf (for the ~3,000 vendors).
5. **Notifications:** new enquiry → WhatsApp/SMS to matching vendors; new quote → customer; booking → both.
6. **Enquiry lifecycle:** quote expiry, enquiry auto-close, cancellation, and an admin override to assign a vendor manually.
7. **SEO:** city and route landing pages (`/tempo-traveller-hire-in-delhi`, `/delhi-to-jaipur-bus-hire`), sitemap, JSON-LD, metadata, and redirects from the old site's URLs.
8. **Analytics and monitoring:** GA4 or PostHog, Sentry, uptime checks, DB backups.

### Phase 2: Transactions and trust, about 4–6 weeks
- Razorpay advance payment or commission, GST invoices, payouts ledger
- Booking management (trip sheet, driver details, status updates)
- Ratings and reviews, vendor performance score (response time, acceptance rate)
- Corporate / government accounts (multiple users, PO numbers, monthly billing)
- Vendor portal as a PWA (installable, push notifications), which can serve as the vendor mobile app for now

### Phase 3: Mobile app and scale
- Customer app (Expo) using the same API: post enquiries, track quotes and trips
- Native vendor app only if PWA adoption is low
- Live GPS trip tracking, automated vendor ranking, pricing insights
- Admin: vendor acquisition CRM and bulk import

---

## Running locally

```bash
npm install
npm run dev          # http://localhost:3000 (or next free port)
```

- Demo data is seeded into `.data/db.json` on first request. Delete that folder to reset.
- `/vendor` acts as the demo vendor "General Travels (own fleet)" and `/admin` is open. Both are auth stubs in `src/lib/auth.js`.

### Demo script
1. `/buses`: filter Delhi, 40 passengers, Wi-Fi, and see the matching coach.
2. **Get quotes for this trip** → fill the form → you land on the enquiry page.
3. `/vendor/enquiries`: the request appears (no customer contact shown). Send a quote.
4. Back on the enquiry page, **Accept quote**. The operator's contact details are revealed.
5. `/admin/vehicles`: approve the pending mini bus, which then appears in `/buses`.

---

## Open questions for the client
1. Revenue model: commission per booking, vendor subscription, or both? (This decides whether payments are needed in the MVP.)
2. Should customers see indicative per-km prices, or only quotes?
3. How many quotes per enquiry (cap), and how long does a quote stay valid?
4. Do vendors need a native app at launch, or is WhatsApp plus a mobile-friendly portal enough?
5. Old-site URL list and Search Console access, for the SEO migration.
6. The list of vehicle types and amenities: confirm it, or add any that are missing.
