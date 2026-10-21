"use client";

import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "./home";
import {
  ShieldCheck, CloudSun, TrendingUp, FileSignature,
  Droplets, Activity, Wrench, Truck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  GRIDKAVACH ASSURANCE: dark band                                   */
/* ------------------------------------------------------------------ */

const ASSURANCE_CARDS = [
  {
    icon: TrendingUp,
    title: "A sunny month?",
    body: "Generation above the secured level pays you upside credits: you keep the bonus units.",
  },
  {
    icon: CloudSun,
    title: "A cloudy month?",
    body: "If generation dips below the secured level, GridKavach tops your credit back up to the committed amount.",
  },
  {
    icon: FileSignature,
    title: "Every single year?",
    body: "The floor is written into your project's Service Agreement, signed digitally and binding for the full tenure.",
  },
];

export function Assurance() {
  return (
    <section className="kg-hero-bg relative overflow-hidden text-white">
      <div className="kg-grid-lines absolute inset-0 opacity-50" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-2xl">
          <Badge className="gap-1.5 border-0 bg-amber-400 px-3.5 py-1.5 text-xs font-bold text-blue-950 hover:bg-amber-400">
            <ShieldCheck className="h-3.5 w-3.5" /> The GridKavach Assurance
          </Badge>
          <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Weather changes. <span className="text-amber-400">Your credit doesn&apos;t.</span>
          </h2>
          <p className="mt-4 leading-relaxed text-blue-100/75">
            Solar output naturally rises and falls with the seasons. The Assurance pins your savings to a committed
            floor, the project's Secured Generation at 75% of its P90 yield, so your bill planning survives even
            a bad monsoon.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {ASSURANCE_CARDS.map((c, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                <c.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-blue-100/70">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-blue-950/40 px-6 py-5">
          <p className="text-sm leading-relaxed text-blue-100/70">
            <strong className="font-bold text-white">Example:</strong> a 1.8 kW reservation in the current open
            listing carries a committed credit of{" "}
            <strong className="text-amber-300">₹811/month</strong> (Year 1). In a bright January it might pay ₹1,051
            with upside credits; in a wet June, GridKavach tops it back up to ₹811. Either way, the floor holds.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  AMC / OPERATIONS                                                   */
/* ------------------------------------------------------------------ */

const AMC_ITEMS = [
  { icon: Droplets, title: "Scheduled cleaning", body: "Dust cuts output by up to 15%. We keep the array washed on a fixed calendar." },
  { icon: Activity, title: "24×7 monitoring", body: "Every inverter is tracked remotely; dips trigger a service ticket automatically." },
  { icon: Wrench, title: "Annual maintenance contract", body: "The AMC on every listed plant is GridKavach's responsibility, never the investor's." },
  { icon: Truck, title: "On-ground servicing", body: "Regional technicians handle repairs and warranty claims through the tenure." },
];

export function AmcSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="lg:sticky lg:top-24">
            <Eyebrow>Operations &amp; maintenance</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
              We run the plant. You just watch the savings.
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              A solar plant is a 15-year asset, and assets need looking after. As the aggregator, GridKavach takes
              full responsibility for operations on every listed project: cleaning, monitoring, the AMC and
              on-ground service, at no extra cost to investors.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
              <ShieldCheck className="h-4 w-4" /> Included with every reservation
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {AMC_ITEMS.map((a, i) => (
              <div key={i} className="rounded-2xl border border-blue-900/10 bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-blue-950/8">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <a.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-blue-950">{a.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PARTNERS                                                           */
/* ------------------------------------------------------------------ */

const PARTNERS = [
  "Tata Power Solar",
  "Adani Solar",
  "Waaree Solar",
  "Vikram Solar",
  "Goldi Solar",
  "Jakson Group",
  "Emmvee",
  "RenewSys",
  "Luminous",
  "SolarSquare",
];

export function Partners() {
  return (
    <section id="partners" className="scroll-mt-24 border-t border-blue-900/10 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Eyebrow>Execution network</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
              Delivered with India&apos;s leading solar brands
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-right">
            As the aggregator, GridKavach engages established module manufacturers and EPC companies for
            construction, while long-term O&amp;M and AMC remain our own responsibility.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PARTNERS.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center rounded-xl border border-blue-900/10 bg-card px-4 py-5 text-center text-sm font-bold text-foreground/70 transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:text-foreground hover:shadow-md"
            >
              {name}
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          Partner scope spans module supply, EPC execution and O&amp;M for projects listed on the marketplace. All
          brand names belong to their respective owners.
        </p>
      </div>
    </section>
  );
}
