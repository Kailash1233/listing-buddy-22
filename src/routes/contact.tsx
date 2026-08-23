import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MarketingHeader } from "@/components/MarketingHeader";
import { PoweredByAdszoo } from "@/components/PoweredByAdszoo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Plotly by Adszoo" },
      {
        name: "description",
        content:
          "Get in touch with the Plotly team at Adszoo. Support email, phone and business address for Chennai.",
      },
      { property: "og:title", content: "Contact Us — Plotly by Adszoo" },
      {
        property: "og:description",
        content: "Get in touch with the Plotly team at Adszoo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:askar@adszoo.in?subject=${encodeURIComponent(
      `Plotly enquiry from ${name || "website"}`,
    )}&body=${body}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingHeader />

      <main className="flex-1">
        <div className="navy-gradient">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center">
            <p className="eyebrow opacity-60">Support</p>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-4 max-w-xl opacity-70">
              Questions about Plotly? We&apos;re here to help.
            </p>
          </div>
        </div>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold">Adszoo</h2>
                <p className="mt-2 text-muted-foreground">
                  Plotly is built and operated by Adszoo, a Chennai-based proptech company.
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a
                      href="mailto:askar@adszoo.in"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      askar@adszoo.in
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <a
                      href="tel:8190069737"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      81900 69737
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-sm text-muted-foreground">
                      Chrompet, Hasthinapuram, Chennai — 600 064
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="surface p-6 sm:p-8">
              <h3 className="text-lg font-bold">Send a message</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional — opens your email app with the details filled in.
              </p>
              <form onSubmit={submit} className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Name</Label>
                  <Input
                    id="contact-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help?"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send message
                </Button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <PoweredByAdszoo />
    </div>
  );
}
