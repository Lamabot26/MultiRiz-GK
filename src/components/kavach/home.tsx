"use client";

import { useApp } from "@/store/app";
import { LIMITS, formatINR } from "@/lib/brand";
import { cn } from "@/lib/utils";
import {
  ArrowRight, Sun, Zap, ShieldCheck, IndianRupee, ScrollText,
  ClipboardList, Wallet, Wrench, Receipt, CalendarCheck2, Building2,
  Check, X, Sparkles,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared bits                                                        */
/* ------------------------------------------------------------------ */

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]",
        dark ? "text-amber-300" : "text-blue-700"
      )}
    >
      <span className={cn("h-px w-6", dark ? "bg-amber-300/70" : "bg-blue-400/70")} />
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO: split layout with a "bill adjustment" visual                */
/* ------------------------------------------------------------------ */

export function Hero() {
  const setView = useApp((s) => s.setView);

  const scrollTo = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative overflow-hidden bg-background">
      {/* soft background accents */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 right-[-10%] h-[26rem] w-[26rem] rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-8%] h-[24rem] w-[24rem] rounded-full bg-blue-200/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.42 0.11 262 / 0.05) 1px, transparent 1px), linear-gradient(90deg, oklch(0.42 0.11 262 / 0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        {/* left: message */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-1.5 text-xs font-bold text-blue-800 shadow-sm backdrop-blur">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            India&apos;s marketplace for Digital Solar
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-blue-950 sm:text-5xl lg:text-[3.5rem]">
            Make the sun pay a part of your{" "}
            <span className="relative whitespace-nowrap text-primary">
              electricity bill
              <svg
                viewBox="0 0 220 10"
                className="absolute -bottom-1.5 left-0 w-full text-amber-400"
                aria-hidden="true"
              >
                <path d="M3 7 C 60 2, 150 2, 217 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            GridKavach lists verified rooftop solar projects. Reserve a share from{" "}
            <strong className="font-semibold text-foreground">{formatINR(LIMITS.minInvestment)}</strong> to{" "}
            <strong className="font-semibold text-foreground">{formatINR(LIMITS.maxInvestment)}</strong>, and the
            power it generates returns to you as a <strong className="font-semibold text-foreground">fixed monthly
            credit</strong>, adjusted straight onto your bill. No panels on your roof, no paperwork, no maintenance.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => setView("projects")}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/15 transition-all hover:bg-blue-900 hover:shadow-xl"
            >
              Explore live projects <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={scrollTo("calculator")}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-300 bg-white/60 px-7 py-3.5 text-base font-semibold text-blue-900 backdrop-blur transition-colors hover:bg-blue-50"
            >
              Estimate my savings
            </button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <button
              onClick={scrollTo("investors")}
              className="font-semibold text-blue-700 underline decoration-blue-300 decoration-2 underline-offset-4 transition-colors hover:text-blue-900"
            >
              Investing on GridKavach
            </button>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <button
              onClick={scrollTo("owners")}
              className="font-semibold text-blue-700 underline decoration-blue-300 decoration-2 underline-offset-4 transition-colors hover:text-blue-900"
            >
              Own a rooftop? List your project
            </button>
          </div>
        </div>

        {/* right: bill adjustment visual */}
        <div className="relative mx-auto w-full max-w-md min-w-0">
          <div
            className="kg-sun-pulse absolute -top-8 right-2 h-24 w-24 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 opacity-80 blur-[2px]"
            aria-hidden="true"
          />
          {/* electricity bill card */}
          <div className="relative z-10 rounded-2xl border border-blue-900/10 bg-white p-5 shadow-xl shadow-blue-950/8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Electricity bill</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">TPCODL · Bhubaneswar</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">OCT 2026</span>
            </div>
            <div className="mt-4 flex items-end justify-between border-b border-dashed border-border pb-4">
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>240 units consumed</p>
                <p>Fixed &amp; other charges</p>
              </div>
              <p className="text-2xl font-extrabold text-blue-950">{formatINR(1842)}</p>
            </div>
            {/* credit adjustment row */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 px-3.5 py-3 ring-1 ring-emerald-200">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Zap className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-emerald-900">GridKavach credit</p>
                  <p className="text-[10px] text-emerald-700/80">Fixed monthly credit · auto-adjusted</p>
                </div>
              </div>
              <p className="text-lg font-extrabold text-emerald-700">-{formatINR(612)}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground">You pay</p>
              <p className="text-2xl font-extrabold text-emerald-600">{formatINR(1230)}</p>
            </div>
          </div>

          {/* source project card */}
          <div className="relative z-20 mx-auto -mt-5 w-[86%] rounded-2xl border border-blue-900/10 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 grid-cols-3 gap-0.5 rounded-lg bg-blue-950 p-1.5" aria-hidden="true">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="rounded-[2px] bg-sky-400/80" />
                ))}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-blue-950">Verified rooftop project</p>
                <p className="text-[11px] text-muted-foreground">50 kW rooftop plant · Odisha</p>
              </div>
              <span className="ml-auto shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                0.9 kW reserved
              </span>
            </div>
          </div>

          {/* floating chips: clear of card content */}
          <div className="absolute -top-6 right-4 z-30 hidden rounded-xl border border-blue-900/10 bg-white px-3.5 py-2 shadow-lg sm:block">
            <p className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Escrow-secured funding
            </p>
          </div>
          <div className="absolute -bottom-6 left-4 z-30 hidden rounded-xl border border-blue-900/10 bg-white px-3.5 py-2 shadow-lg sm:block">
            <p className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
              <CalendarCheck2 className="h-4 w-4 text-amber-500" /> Same credit, every month
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FACTS STRIP                                                        */
/* ------------------------------------------------------------------ */

const FACTS = [
  { icon: IndianRupee, label: `${formatINR(LIMITS.minInvestment)} minimum`, sub: "start small, grow later" },
  { icon: ShieldCheck, label: "Project escrow", sub: "funds ring-fenced per project" },
  { icon: Zap, label: "Fixed monthly credit", sub: "committed in the agreement" },
  { icon: ScrollText, label: "100% paperless", sub: "bookings & contracts, fully digital" },
];

export function FactsStrip() {
  return (
    <section className="border-y border-blue-900/10 bg-blue-950">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-7 sm:px-6 lg:grid-cols-4">
        {FACTS.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-amber-300">
              <f.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">{f.label}</p>
              <p className="truncate text-xs text-blue-100/60">{f.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  HOW THE MARKETPLACE WORKS: 4 connected steps                      */
/* ------------------------------------------------------------------ */

const FLOW = [
  {
    icon: ClipboardList,
    step: "01",
    title: "A project goes live",
    body: "A rooftop owner lists a verified solar project. Site survey, DISCOM, capacity and tariff terms are published for everyone to see.",
  },
  {
    icon: Wallet,
    step: "02",
    title: "Investors reserve a share",
    body: `You choose capacity from ${formatINR(LIMITS.minInvestment)} to ${formatINR(LIMITS.maxInvestment)}. Funds flow into the project's dedicated escrow account, never into our pockets.`,
  },
  {
    icon: Wrench,
    step: "03",
    title: "GridKavach builds & runs it",
    body: "We execute the plant with leading solar partners, then carry the AMC (cleaning, monitoring, servicing) for its entire life.",
  },
  {
    icon: Receipt,
    step: "04",
    title: "Credits land on your bill",
    body: "Units generated convert into a fixed monthly credit, adjusted directly against your electricity bill through your DISCOM.",
  },
];

export function HowFlow() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-24">
      <div className="max-w-2xl">
        <Eyebrow>How the marketplace works</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
          From a rooftop to your bill, in four steps
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          GridKavach is the aggregator in the middle: we connect project owners with investors and carry the
          execution end-to-end, so nobody has to figure out solar alone.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((s, i) => (
          <div
            key={s.step}
            className="group relative rounded-2xl border border-blue-900/10 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/8"
          >
            {i < FLOW.length - 1 && (
              <span
                className="absolute -right-3.5 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-blue-900/10 bg-background lg:flex"
                aria-hidden="true"
              >
                <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
              </span>
            )}
            <div className="flex items-center justify-between">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-800 transition-colors group-hover:bg-amber-100 group-hover:text-amber-700">
                <s.icon className="h-5.5 w-5.5" />
              </span>
              <span className="text-3xl font-extrabold text-blue-100 transition-colors group-hover:text-amber-200">
                {s.step}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-bold text-blue-950">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  INVESTOR BENEFITS                                                  */
/* ------------------------------------------------------------------ */

const INVESTOR_POINTS = [
  {
    icon: CalendarCheck2,
    title: "A credit you can plan around",
    body: "Your monthly credit is fixed at the project's secured generation level and written into the Service Agreement, not a best-efforts promise that shifts with the seasons.",
  },
  {
    icon: Building2,
    title: "Flat, rented or shop: all fine",
    body: "The plant stands on a listed project's rooftop, not yours. Reserve once and offset any electricity bill you link, wherever you live next year.",
  },
  {
    icon: ShieldCheck,
    title: "Money that stays ring-fenced",
    body: "Every rupee you reserve lands in the project's escrow account and is released only as construction milestones are met. Full trail, fully digital.",
  },
  {
    icon: Wrench,
    title: "Zero maintenance duty",
    body: "Panels need cleaning, audits and repairs for 15 years. Under the AMC, that job belongs to GridKavach, never to the investor.",
  },
];

export function InvestorBenefits() {
  const setView = useApp((s) => s.setView);
  return (
    <section id="investors" className="scroll-mt-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>For investors &amp; bill payers</Eyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
              Solar savings, without owning a roof
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Roof ownership, shadow analysis, DISCOM approvals, inverters, service calls: traditional solar comes
              with a second job attached. A reservation on GridKavach skips all of it.
            </p>
          </div>
          <button
            onClick={() => setView("projects")}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border-2 border-blue-950 px-6 py-3 text-sm font-bold text-blue-950 transition-colors hover:bg-blue-950 hover:text-white md:self-auto"
          >
            View open projects <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {INVESTOR_POINTS.map((p, i) => (
            <div key={i} className="rounded-2xl bg-gradient-to-b from-blue-50/80 to-white p-6 ring-1 ring-blue-900/10">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-amber-300">
                <p.icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-blue-950">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPARISON MATRIX: GridKavach vs rooftop vs no solar              */
/* ------------------------------------------------------------------ */

type Cell = { text: string; good?: boolean; bad?: boolean };

const COMPARE_ROWS: { feature: string; gk: Cell; roof: Cell; none: Cell }[] = [
  {
    feature: "System cost",
    gk: { text: "30-40% below market: bulk deals direct from manufacturers", good: true },
    roof: { text: "Retail pricing with dealer margins built in", bad: true },
    none: { text: "Rising tariffs, no protection", bad: true },
  },
  {
    feature: "Upfront cost",
    gk: { text: `From ${formatINR(LIMITS.minInvestment)}`, good: true },
    roof: { text: "₹1.5-3 lakh for a typical home" },
    none: { text: "₹0 today, but tariffs keep rising", bad: true },
  },
  {
    feature: "Works for flats & rented homes",
    gk: { text: "Yes, any bill you link", good: true },
    roof: { text: "Needs an owned, shadow-free roof", bad: true },
    none: { text: "Not applicable", good: true },
  },
  {
    feature: "Savings certainty",
    gk: { text: "Fixed monthly credit with a guaranteed floor*", good: true },
    roof: { text: "Moves with weather, shade & upkeep", bad: true },
    none: { text: "None", bad: true },
  },
  {
    feature: "Maintenance for 15 years",
    gk: { text: "Included, AMC handled by GridKavach", good: true },
    roof: { text: "Cleaning, repairs & servicing on you", bad: true },
    none: { text: "Nothing to maintain", good: true },
  },
  {
    feature: "If you move house",
    gk: { text: "Credits follow your new bill", good: true },
    roof: { text: "System stays with the old roof", bad: true },
    none: { text: "Not applicable", good: true },
  },
  {
    feature: "Time to switch",
    gk: { text: "About 3 minutes, fully online", good: true },
    roof: { text: "Weeks of surveys, approvals and installation", bad: true },
    none: { text: "Instant", good: true },
  },
];

function CompareCell({ cell, highlight }: { cell: Cell; highlight?: boolean }) {
  return (
    <td
      className={cn(
        "px-4 py-4 text-sm align-top",
        highlight && "bg-blue-50/70 font-semibold text-blue-950",
        !highlight && "text-muted-foreground"
      )}
    >
      <span className="flex items-start gap-2">
        {cell.good === true && <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />}
        {cell.bad === true && <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />}
        {cell.text}
      </span>
    </td>
  );
}

export function CompareMatrix() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Do the comparison</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
          Digital Solar vs. rooftop solar vs. doing nothing
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          The honest way to choose. Here is how a GridKavach reservation stacks up against installing panels yourself
          or waiting for tariffs to fall.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto rounded-2xl border border-blue-900/10 bg-card shadow-sm kg-scroll">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-blue-900/10">
              <th className="w-[22%] px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                What matters
              </th>
              <th className="w-[28%] bg-blue-950 px-4 py-4 text-sm font-extrabold text-white rounded-tl-none">
                <span className="flex items-center gap-2">
                  <Sun className="h-4.5 w-4.5 text-amber-400" /> GridKavach Digital Solar
                </span>
              </th>
              <th className="px-4 py-4 text-sm font-bold text-slate-600">Owning rooftop solar</th>
              <th className="px-4 py-4 text-sm font-bold text-slate-600">Staying on grid only</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((r, i) => (
              <tr key={i} className="border-b border-border/60 last:border-0">
                <th scope="row" className="px-4 py-4 text-sm font-bold text-blue-950 align-top">
                  {r.feature}
                </th>
                <CompareCell cell={r.gk} highlight />
                <CompareCell cell={r.roof} />
                <CompareCell cell={r.none} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mx-auto mt-4 max-w-3xl text-center text-[11px] leading-relaxed text-muted-foreground">
        *Guaranteed floor = the project&apos;s Secured Generation (75% of P90), committed under the GridKavach
        Assurance in each project&apos;s Service Agreement.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  OWNER SECTION: for rooftop & project owners                       */
/* ------------------------------------------------------------------ */

const OWNER_POINTS = [
  {
    title: "Free to list, no onboarding fee",
    body: "Publishing your rooftop costs nothing upfront. Investors on the marketplace fund the plant, and you buy its power through a PPA priced below your DISCOM tariff.",
  },
  {
    title: "Optional Booster Plan, ₹500 per kW",
    body: "In a hurry? Opt into the Booster Plan and we spend ₹500 for every kW of your listing directly on ads that pull in faster reservations.",
  },
  {
    title: "2% platform fee, only at execution",
    body: "Once 80% of your capacity is reserved you can start execution. GridKavach charges a one-time platform fee of 2% of the project cost to initiate. That is the only one-time charge, with nothing hidden behind it.",
  },
  {
    title: "AMC at ₹1,200 and Assurance & insurance at ₹999 per kW a year",
    body: "GridKavach carries the annual maintenance contract, remote monitoring, the GridKavach Assurance generation guarantee and insurance coordination for the full tenure, billed simply per kW a year, and every PPA and agreement stays on your project page, fully paperless.",
  },
];

export function OwnerSection() {
  const setView = useApp((s) => s.setView);
  return (
    <section id="owners" className="scroll-mt-24 bg-blue-950">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
        <div>
          <Eyebrow dark>For rooftop &amp; project owners</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Your roof could be earning, not idling
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-blue-100/75">
            List your rooftop as a solar project on the GridKavach marketplace. Our investor community funds the
            plant through escrow, we execute it with leading solar partners, and you buy the power it produces
            through a transparent PPA, usually below your DISCOM tariff.
          </p>
          <ul className="mt-8 space-y-4">
            {OWNER_POINTS.map((p, i) => (
              <li key={i} className="flex gap-3.5">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-blue-100/65">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setView("contact")}
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-base font-bold text-blue-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-300 hover:shadow-xl"
          >
            <Sparkles className="h-4.5 w-4.5" /> List your project
          </button>
        </div>

        {/* listing mock card */}
        <div className="relative mx-auto w-full max-w-md min-w-0">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Listing preview</p>
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-extrabold text-blue-950">Your rooftop here</p>
                  <p className="text-xs text-muted-foreground">City, State · your DISCOM</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  FUNDING OPEN
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  { v: "120 kW", l: "Capacity" },
                  { v: "₹6.5/unit", l: "Credit rate" },
                  { v: "15 yrs", l: "Tenure" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl bg-blue-50 px-2 py-2.5">
                    <p className="text-sm font-extrabold text-blue-950">{s.v}</p>
                    <p className="text-[10px] text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>Escrow collections</span>
                  <span className="text-blue-950">68%</span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-blue-700 to-amber-400" />
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-blue-100/55">
              Investors see verified capacity, credit rate and P90 yield before they reserve, and documents stay on
              the project page, not in a drawer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
