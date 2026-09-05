# Property Genie

V1 Build Prompt for Lovable — Property Microsite + Lead Capture for Brokers

Product framing (context for the AI, keep this at the top of the Lovable prompt)

Build a web app for independent real-estate brokers in Chennai. A broker enters a property once (manual form OR by pasting a messy WhatsApp-style description + uploading photos), and the app instantly generates:

A polished, mobile-first public property page with its own shareable URL

A ready-to-send WhatsApp share message

A downloadable PDF brochure

A lead capture form on the page that notifies the broker when a buyer enquires

This is NOT a CRM and NOT a property portal. It is a single-broker "digital sales catalogue" tool. Keep the scope tight — no team accounts, no buyer-property matching, no payments in v1.

Design direction

Bright, clean, high-trust aesthetic — think fintech/proptech, not a generic admin panel.

Primary background: white / off-white (#FAFAFA). Avoid dark mode for v1.

Accent color: a confident teal or deep blue (e.g. #0F766E or #1D4ED8) for primary actions (Publish, Share, Enquire). Use a warm accent (amber/orange) sparingly for "new lead" badges only.

Typography: a modern geometric sans (Inter or Manrope). Large, confident headings on the property page (buyers should feel like they're looking at a real listing, not a form output).

Generous white space, rounded-xl cards, soft shadows — no harsh borders.

Property pages must look premium enough that a buyer never suspects it was AI-generated in 30 seconds.

Broker dashboard should feel like a lightweight SaaS tool: clear numbers, no clutter, mobile-usable since brokers work from their phones.

Use shadcn/ui components + Tailwind. Fully responsive, mobile-first (most brokers and buyers will be on phones).

Tech stack

Frontend: React + TypeScript + Tailwind + shadcn/ui

Backend/DB/Auth: Supabase (Postgres + Supabase Auth + Storage for photos/PDFs)

AI: Anthropic API (Claude) for parsing raw text into structured property data and generating listing copy — call via an edge function, never expose the API key client-side

PDF generation: server-side (edge function) using a PDF library, generated from the same structured property data as the web page

Hosting: standard Lovable/Supabase deploy

Roles

Broker (authenticated) — creates/manages properties, views leads and analytics

Buyer (no login) — views public property pages, submits enquiries

No agency/team roles in v1. One broker = one account = one workspace.

Database schema (Supabase)

brokers

id (uuid, = auth.users.id)

name

phone

whatsapp_number

agency_name (optional)

subdomain_slug (unique, e.g. "kailash" → used in property URLs)

plan (enum: free/starter/pro — just a flag for v1, no real billing)

property_limit (int, default 3 for free plan)

created_at

properties

id (uuid)

broker_id (fk)

slug (unique per broker, e.g. "2bhk-anna-nagar")

title

description (AI-generated or manual)

property_type (apartment/villa/plot/commercial)

listing_type (sale/rent)

price (numeric)

price_display (text, e.g. "₹85 Lakhs")

bhk (int, nullable)

area_sqft (numeric)

floor (text, nullable)

facing (text, nullable)

parking (text, nullable)

status (enum: draft/active/sold/rented/inactive)

locality

city (default "Chennai")

address_text

lat, lng (nullable — for map embed)

amenities (text[])

rera_number (nullable)

rera_status (enum: not_provided/provided_unverified — never "verified" unless you build actual verification)

photos (jsonb array of storage URLs)

floor_plan_url (nullable)

pdf_url (nullable, generated brochure)

view_count (int, default 0)

whatsapp_click_count (int, default 0)

call_click_count (int, default 0)

created_at, updated_at

leads

id (uuid)

property_id (fk)

broker_id (fk, denormalized for easy dashboard queries)

name

phone

whatsapp_number (nullable)

budget_min, budget_max (nullable)

message (nullable)

status (enum: new/contacted/site_visit/closed/lost — simple, no full pipeline)

created_at

property_events (lightweight analytics)

id

property_id

event_type (enum: view/whatsapp_click/call_click/enquiry_submit)

created_at

Row-level security: brokers can only read/write their own properties and leads. Property pages and lead-submit endpoint are public (no auth) but rate-limited.

Screens & end-to-end logic

1. Marketing landing page (public, /)

Headline: "Turn your property listings into a digital sales catalogue"

Subhead explaining: one link per property, WhatsApp-native, AI writes the listing for you

CTA: "Start Free" → signup

Below the fold: 3-step visual (Paste your listing → AI builds the page → Share on WhatsApp), sample property page screenshot/mock, simple pricing (Free / Starter / Pro cards, no functional billing yet — just display, "Coming soon" or plan selection stored on signup)

2. Signup / Login (/signup, /login)

Supabase Auth (email + password, or phone OTP if feasible)

On first signup: onboarding step asking for name, WhatsApp number, agency name (optional), and desired subdomain slug (check uniqueness live)

3. Broker Dashboard (/dashboard, authenticated)

Top summary cards: Active properties, Total views (7d), Total leads (7d), New leads (unread count badge)

"Add Property" primary button, always visible

Property list (table/cards): thumbnail, title, price, status, views, leads count, quick actions (Edit / Share / View Page / Deactivate)

Sidebar/nav: Dashboard, Properties, Leads, Settings

4. Add/Edit Property (/dashboard/properties/new)

Two entry modes, tabbed:

Mode A — Manual form: standard fields (type, BHK, price, area, locality, facing, floor, parking, amenities checklist, description textarea, photo upload — drag/drop multiple, up to 15).

Mode B — AI Quick Add (the differentiator):

One big textarea: "Paste your property details — even a rough WhatsApp message works"

e.g. "Anna Nagar 2bhk 1200 sqft 85 lakhs east facing 4th floor covered car parking good location"

Photo upload (same as above)

On submit → call edge function → Claude API parses the raw text into structured fields (property_type, bhk, area, price, facing, floor, parking, locality) AND generates: a listing title, a polished description (2-3 short paragraphs), a WhatsApp share message, and an SEO-style meta description.

Show the AI-extracted fields in an editable form (pre-filled) so broker can correct anything before publishing — never auto-publish without a review step.

"Regenerate description" button if broker doesn't like the AI copy.

Bottom of both modes: Save as Draft / Publish buttons. Publish requires: title, price, at least 1 photo, locality.

On Publish: generate unique slug, create public URL {subdomain}.yourapp.in/p/{slug} (or /b/{subdomain}/p/{slug} if wildcard subdomains aren't feasible in Lovable — use path-based routing for v1, subdomains can come later), trigger PDF brochure generation in background, show success screen with the shareable link + a "Copy WhatsApp message" button pre-filled with the AI-generated share text + link.

5. Public Property Page (/b/{subdomain}/p/{slug}, no auth)

Mobile-first, image-forward layout

Hero: swipeable photo gallery, price badge, BHK/type/locality overlay

Quick facts grid: Type, BHK, Area, Floor, Facing, Parking, Status

Full description

Amenities as icon chips

Floor plan image if provided

Map embed if lat/lng present

RERA line: "RERA No. provided by broker: {number}" with a small (i) tooltip clarifying it's broker-provided, not platform-verified — never say "verified"

Broker card: name, agency, WhatsApp button, Call button (both fire property_events on click)

Sticky bottom bar (mobile): "WhatsApp" + "I'm Interested" buttons

"I'm Interested" opens a lead form (name, phone, budget range, message) → inserts into leads, fires enquiry_submit event, and (stretch goal, do if time allows) sends the broker a WhatsApp/email notification via a webhook — otherwise it just shows up in their dashboard

Every page load fires a view event (debounced/deduped per session to avoid inflating counts)

Download PDF Brochure button

6. Leads Inbox (/dashboard/leads)

List of all leads across properties, newest first, filter by property/status

Each row: buyer name, phone, property, budget, message, status dropdown (new/contacted/site_visit/closed/lost), WhatsApp/Call quick-action buttons

Mark as read/unread for the dashboard badge count

7. Settings (/dashboard/settings)

Edit broker profile, WhatsApp number, subdomain slug, agency name

Plan display (Free/Starter/Pro) with property count vs limit shown (e.g. "3/3 properties used — upgrade to add more") — enforce the limit in the UI even though billing isn't wired up yet

Explicitly OUT of scope for v1 (do not build)

Team/agency multi-agent accounts

Buyer-property AI matching

Payments/subscription billing (Razorpay integration comes v2)

Property "Collections" (bundling multiple properties into one link)

Full CRM pipeline / follow-up automation

WhatsApp Business API integration (v1 just generates a pre-filled wa.me share link, not automated messaging)

Any "verified" badges beyond broker self-declaration

Definition of done for v1

A broker can: sign up → paste a rough WhatsApp-style property description + upload photos → get an AI-structured, editable listing → publish it → get a shareable link, WhatsApp message, and PDF → a buyer can open the link on their phone, see a clean listing, and submit an enquiry → the broker sees that lead and basic view/click analytics in their dashboard.

That loop, working end to end and looking genuinely polished on mobile, is the entire v1. Nothing else matters until 10 Chennai brokers are actually using it.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://listing-buddy-22.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f3fd8334-26d3-470d-8ef1-471d06484b8b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
