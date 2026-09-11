import { createFileRoute } from "@tanstack/react-router";
import { MarketingHeader } from "@/components/MarketingHeader";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — PropertyGenie by Adszoo" },
      {
        name: "description",
        content:
          "Terms and conditions for using PropertyGenie, the property microsite builder for independent real-estate brokers in Chennai.",
      },
      { property: "og:title", content: "Terms & Conditions — PropertyGenie by Adszoo" },
      {
        property: "og:description",
        content: "Terms and conditions for using PropertyGenie.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />

      <main className="flex-1">
        <div className="navy-gradient">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center">
            <p className="eyebrow opacity-60">Legal</p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Terms & Conditions
            </h1>
            <p className="mx-auto mt-4 max-w-xl opacity-70">
              Last updated: 23 August 2026
            </p>
          </div>
        </div>

        <article className="mx-auto max-w-3xl px-4 py-12">
          <div className="surface space-y-8 p-6 sm:p-10">
            <section>
              <h2 className="text-lg font-bold">1. Service description</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                PropertyGenie is a software-as-a-service product operated by Adszoo. It allows independent real-estate brokers and agencies in India to create single-property microsites, generate WhatsApp share copy and PDF brochures, and capture buyer enquiries. PropertyGenie is not a real-estate marketplace, CRM, or transaction facilitator.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">2. User eligibility</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You must be at least 18 years old and legally able to enter into contracts in India. By creating an account, you confirm that the information you provide is accurate and that you have the right to list the properties you publish.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">3. Account responsibilities</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. You agree not to share account access with unauthorised users. Adszoo may suspend accounts that show suspicious activity or violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">4. Listing credits and usage</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                PropertyGenie operates on a credit model. Free credits are granted at signup. Paid listing packs are one-time purchases that add credits to your account. Credits do not expire unless otherwise stated. Agency plans receive a shared pool of credits that resets each billing cycle according to the selected plan.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">5. Acceptable use</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                You may not use PropertyGenie to publish false, misleading, discriminatory, or illegal content. You may not scrape, reverse-engineer, or overload the platform. All property information, photos, and contact details must be accurate and must not infringe on third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">6. Payment terms</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. Payments are processed through secure third-party gateways. Failed or disputed payments may result in suspension of services until resolved.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">7. Limitation of liability</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                PropertyGenie provides tools for brokers to share listings. Adszoo is not a party to any transaction between a broker and a buyer, and does not verify property details, ownership documents, or RERA registrations. To the extent permitted by law, Adszoo&apos;s liability is limited to the amount paid by you to Adszoo in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">8. Governing law</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold">9. Contact for disputes</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                For questions or disputes related to these terms, contact us at{" "}
                <a href="mailto:askar@adszoo.in" className="text-primary hover:underline">
                  askar@adszoo.in
                </a>{" "}
                or call{" "}
                <a href="tel:8190069737" className="text-primary hover:underline">
                  81900 69737
                </a>
                .
              </p>
            </section>
          </div>
        </article>
      </main>

      <PoweredByAdszoo />
    </div>
  );
}
