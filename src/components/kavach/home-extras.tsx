"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { FAQS } from "@/lib/legal";
import { LIMITS, MARKET, FEES, computeQuote, formatINR, formatNum, round2 } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./home";
import {
  ArrowRight, Zap, PanelTop, IndianRupee, Leaf, Wallet, MapPin, ChevronRight,
  Building2, User, Megaphone, BadgePercent, TrendingUp, Check, Users, Wrench,
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";

/* ------------------------------------------------------------------ */
/*  SAVINGS CALCULATORS: As User (investor) and As Project Owner        */
/* ------------------------------------------------------------------ */

interface CalcProject {
  id: string;
  name: string;
  location: string;
  capacityKw: number;
  availableKw: number;
  creditsPerKwh: number;
  pricePerKw: number;
  tenureMonths: number;
  p90KwhPerKw: number;
  status: string;
}

const GRID_CO2_KG_PER_KWH = 0.82; // CEA grid emission factor, indicative

const CALC_TABS = [
  { id: "user", label: "As User", icon: User },
  { id: "owner", label: "As Project Owner", icon: Building2 },
] as const;

type CalcTab = (typeof CALC_TABS)[number]["id"];

export function Calculator() {
  const setView = useApp((s) => s.setView);
  const startInvest = useApp((s) => s.startInvest);
  const [tab, setTab] = useState<CalcTab>("user");
  const [projects, setProjects] = useState<CalcProject[]>([]);
  const [selId, setSelId] = useState<string>("");
  const [avgBill, setAvgBill] = useState(2000);
  const [pct, setPct] = useState(60);
  const [ownerKw, setOwnerKw] = useState(50);
  const [booster, setBooster] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        const list: CalcProject[] = (d.projects ?? []).filter((p: CalcProject) => p.status === "OPEN");
        setProjects(list);
        if (list[0]) setSelId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const project = projects.find((p) => p.id === selId);

  const calc = useMemo(() => {
    if (!project) return null;
    const securedY1perKw = round2(project.p90KwhPerKw * 0.75); // Secured Generation
    const monthlyCreditPerKw = (securedY1perKw / 12) * project.creditsPerKwh;

    const wantedMonthly = (avgBill * pct) / 100;
    const wantedKw = wantedMonthly / monthlyCreditPerKw;
    const maxKw = Math.min(LIMITS.maxInvestment / project.pricePerKw, project.availableKw);
    const minKw = LIMITS.minInvestment / project.pricePerKw;
    const kw = Math.max(minKw, Math.min(wantedKw, maxKw));

    const investment = Math.round(kw * project.pricePerKw);
    const q = computeQuote({
      investment,
      pricePerKw: project.pricePerKw,
      creditsPerKwh: project.creditsPerKwh,
      p90KwhPerKw: project.p90KwhPerKw,
      tenureMonths: project.tenureMonths,
    });

    const years = Math.floor(project.tenureMonths / 12);
    const annualKwh = q.capacityKw * securedY1perKw;

    return {
      monthlyCredit: q.monthlyCredit,
      reservedW: q.capacityWatts,
      investment,
      payable: q.totalPayable,
      years,
      lifetime: q.totalSavingsTenure,
      co2YearKg: Math.round(annualKwh * GRID_CO2_KG_PER_KWH),
      capped: wantedKw > maxKw + 0.001,
      billAfter: Math.max(avgBill - q.monthlyCredit, 0),
      unitsMonth: Math.round(annualKwh / 12), // units your capacity generates every month
    };
  }, [project, avgBill, pct]);

  /* Same money, two routes: self-installed rooftop solar vs GridKavach */
  const compare = useMemo(() => {
    if (!calc || !project) return null;
    const securedY1perKw = round2(project.p90KwhPerKw * 0.75);
    const roofKw = calc.investment / MARKET.marketPricePerKw;
    const roofGross = ((roofKw * securedY1perKw) / 12) * MARKET.discomTariff;
    const roofOm = (roofKw * MARKET.rooftopOmPerKwYear) / 12;
    const roofNet = Math.max(roofGross - roofOm, 0); // upkeep borne by the owner
    const morePct = roofNet > 0 ? Math.round(((calc.monthlyCredit - roofNet) / roofNet) * 100) : 0;
    const roofLife = roofNet * calc.years * 12;
    return { roofKw, roofNet, roofLife, morePct };
  }, [calc, project]);

  /* Owner listing economics: generation, PPA bill payment and fees.
     Generation depends on the kW system installed; every unit generated,
     after maintenance, goes to users on the marketplace directly. */
  const owner = useMemo(() => {
    const pricePerKw = project?.pricePerKw ?? MARKET.ownerListPricePerKw;
    const creditRate = project?.creditsPerKwh ?? 6.65; // PPA rate per unit
    const p90 = project?.p90KwhPerKw ?? 1300;
    const securedPerKw = round2(p90 * 0.75); // secured units per kW, per year
    const projectCost = round2(ownerKw * pricePerKw);
    const marketCost = round2(ownerKw * MARKET.marketPricePerKw);
    const costSavingPct = Math.round((1 - pricePerKw / MARKET.marketPricePerKw) * 100);
    const boosterCost = booster ? ownerKw * FEES.boosterPerKw : 0;
    const marketplaceFee = round2(projectCost * (FEES.executionFeePct / 100));

    const annualUnits = round2(ownerKw * securedPerKw); // scales with the kW installed
    const monthlyUnits = round2(annualUnits / 12);
    const gridBill = round2(monthlyUnits * MARKET.discomTariff); // same units at the ₹8.5 grid tariff
    const ppaBill = round2(monthlyUnits * creditRate); // what the owner pays under the PPA
    const monthlyBillSavings = round2(gridBill - ppaBill);
    const annualBillSavings = round2(monthlyBillSavings * 12);

    // annual GridKavach service charges billed to the project owner
    const amcYear = round2(ownerKw * FEES.ownerAmcPerKwYear);
    const assuredYear = round2(ownerKw * FEES.ownerAssuranceInsurancePerKwYear);
    const annualCharges = round2(amcYear + assuredYear);
    const netAfterCharges = round2(annualBillSavings - annualCharges);

    return {
      pricePerKw, creditRate, securedPerKw, projectCost, marketCost, costSavingPct,
      boosterCost, marketplaceFee, annualUnits, monthlyUnits, gridBill, ppaBill,
      monthlyBillSavings, annualBillSavings, amcYear, assuredYear, annualCharges,
      netAfterCharges,
    };
  }, [project, ownerKw, booster]);

  return (
    <section id="calculator" className="scroll-mt-24 border-y border-blue-900/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Savings calculator</Eyebrow>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
            {tab === "user" ? "Do the math on your own bill" : "Your rooftop's generation and bill story"}
          </h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            {tab === "user"
              ? "Tell us what your DISCOM charges you today. We'll show the solar capacity that covers it, the one-time reservation, the credit you can expect every month, and how it beats putting panels on your own roof."
              : "Set your rooftop capacity and watch the numbers work: the secured generation your plant produces every month, what you pay per unit under the PPA at ₹6.65 against the ₹8.5 grid tariff, the one-time 2% platform fee, the annual AMC and GridKavach Assurance charges, and how every unit flows straight to users after maintenance."}
          </p>
          <div className="mt-7 inline-flex rounded-full border border-blue-200 bg-blue-50/70 p-1">
            {CALC_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all",
                  tab === t.id ? "bg-blue-950 text-white shadow" : "text-blue-800 hover:text-blue-950"
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "user" ? (
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_1.05fr]">
          {/* inputs */}
          <div className="rounded-3xl border border-blue-900/10 bg-card p-6 sm:p-8">
            {project && (
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-950 text-amber-300">
                  <PanelTop className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-blue-950">Open rooftop listing</p>
                  <p className="text-xs text-muted-foreground">
                    {project.location} · live until {new Date().getFullYear() + Math.floor(project.tenureMonths / 12)}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6">
              <label htmlFor="calc-bill" className="text-sm font-bold text-blue-950">
                Your average monthly electricity bill
              </label>
              <div className="mt-2 flex items-stretch overflow-hidden rounded-2xl border border-input focus-within:ring-2 focus-within:ring-ring">
                <span className="flex items-center border-r bg-muted px-4 text-lg font-bold text-muted-foreground">₹</span>
                <Input
                  id="calc-bill"
                  type="number"
                  min={0}
                  max={100000}
                  value={avgBill}
                  onChange={(e) => setAvgBill(Math.max(0, Math.min(Number(e.target.value) || 0, 100000)))}
                  className="h-13 rounded-none border-0 text-lg font-semibold shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-blue-950">How much of it should solar cover?</p>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-700">
                  {pct}%
                </span>
              </div>
              <Slider
                value={[pct]}
                min={10}
                max={90}
                step={5}
                onValueChange={(v) => setPct(v[0] ?? pct)}
                className="mt-3"
              />
              <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>10%</span><span>50%</span><span>90%</span>
              </div>
            </div>

            {calc && (
              <div className="mt-7 space-y-2.5 border-t border-dashed border-border pt-5 text-sm">
                <p className="flex justify-between">
                  <span className="text-muted-foreground">One-time reservation</span>
                  <span className="font-bold text-blue-950">{formatINR(calc.investment)}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-muted-foreground">+ Onboarding (1%) &amp; GST (12%)</span>
                  <span className="font-semibold text-foreground">{formatINR(Math.max(calc.payable - calc.investment, 0))}</span>
                </p>
                <p className="flex justify-between text-base">
                  <span className="font-bold text-blue-950">Total payable</span>
                  <span className="font-extrabold text-blue-950">{formatINR(calc.payable)}</span>
                </p>
              </div>
            )}
          </div>

          {/* results */}
          <div className="kg-hero-bg relative overflow-hidden rounded-3xl p-6 text-white sm:p-8">
            <div className="kg-grid-lines absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Zap className="h-4 w-4" /> Your fixed monthly credit
              </p>
              {calc ? (
                <>
                  <p className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl">
                    {formatINR(calc.monthlyCredit, 0)}
                    <span className="ml-1 text-lg font-semibold text-blue-100/60">/month</span>
                  </p>
                  <p className="mt-2 text-sm text-blue-100/70">
                    Estimated bill after credits:{" "}
                    <strong className="font-bold text-white">{formatINR(calc.billAfter)}</strong>{" "}
                    (was {formatINR(avgBill)})
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-blue-100/65">
                    Your capacity generates about {formatNum(calc.unitsMonth)} units a month. All of it, after
                    maintenance, flows directly to your bill as credits at ₹{project?.creditsPerKwh}/unit.
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/8 px-4 py-3.5 backdrop-blur-sm">
                      <p className="flex items-center gap-1.5 text-[11px] text-blue-100/65">
                        <PanelTop className="h-3.5 w-3.5" /> Capacity reserved
                      </p>
                      <p className="mt-1 text-xl font-extrabold">{formatNum(calc.reservedW)} W</p>
                    </div>
                    <div className="rounded-xl bg-white/8 px-4 py-3.5 backdrop-blur-sm">
                      <p className="flex items-center gap-1.5 text-[11px] text-blue-100/65">
                        <Wallet className="h-3.5 w-3.5" /> Credits over {calc.years} years
                      </p>
                      <p className="mt-1 text-xl font-extrabold">{formatINR(calc.lifetime)}</p>
                    </div>
                    <div className="rounded-xl bg-white/8 px-4 py-3.5 backdrop-blur-sm">
                      <p className="flex items-center gap-1.5 text-[11px] text-blue-100/65">
                        <Leaf className="h-3.5 w-3.5" /> CO₂ avoided / year
                      </p>
                      <p className="mt-1 text-xl font-extrabold">{formatNum(calc.co2YearKg)} kg</p>
                    </div>
                    <div className="rounded-xl bg-white/8 px-4 py-3.5 backdrop-blur-sm">
                      <p className="flex items-center gap-1.5 text-[11px] text-blue-100/65">
                        <IndianRupee className="h-3.5 w-3.5" /> Effective rate
                      </p>
                      <p className="mt-1 text-xl font-extrabold">₹{project?.creditsPerKwh}/unit</p>
                    </div>
                  </div>

                  {compare && (
                    <div className="mt-5 rounded-2xl bg-white/8 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                        <BadgePercent className="h-4 w-4" /> Same money, more savings
                      </p>
                      <div className="mt-3 space-y-2 text-sm">
                        <p className="flex items-center justify-between gap-3">
                          <span className="text-blue-100/70">
                            Panels on your own rooftop
                            <span className="block text-[10px] text-blue-200/60">
                              {formatNum(Math.round(compare.roofKw * 1000))} W at market pricing, upkeep on you
                            </span>
                          </span>
                          <span className="font-bold text-blue-100/85">
                            ≈ {formatINR(compare.roofNet)}/mo
                          </span>
                        </p>
                        <p className="flex items-center justify-between gap-3 rounded-xl bg-amber-400/15 px-3 py-2.5 ring-1 ring-amber-300/30">
                          <span className="font-semibold text-white">Through GridKavach</span>
                          <span className="text-xl font-extrabold text-amber-300">
                            {formatINR(calc.monthlyCredit)}/mo
                          </span>
                        </p>
                      </div>
                      <p className="mt-2.5 text-xs font-bold text-emerald-300">
                        +{compare.morePct}% more savings every month than rooftop solar, with zero maintenance.
                      </p>
                      <p className="mt-1 text-[11px] leading-relaxed text-blue-100/60">
                        Over {calc.years} years that is about {formatINR(calc.lifetime)} on GridKavach versus{" "}
                        {formatINR(compare.roofLife)} on a self-installed system.
                      </p>
                    </div>
                  )}

                  <p className="mt-4 rounded-xl bg-blue-950/40 px-3.5 py-2.5 text-[11px] leading-relaxed text-blue-100/70 ring-1 ring-white/10">
                    No subsidy applies here: listed projects are commercial-scale. Instead, bulk procurement and
                    direct purchase from module manufacturers cut project costing 30-40% below market pricing by
                    removing every middleman, and that discount is built into your per-kW price.
                  </p>

                  {calc.capped && (
                    <p className="mt-4 rounded-lg bg-amber-400/15 px-3.5 py-2 text-xs font-semibold text-amber-200">
                      Your target exceeds this project&apos;s available capacity or the ₹1,00,000 per-investor limit,
                      so we&apos;ve sized it to the maximum.
                    </p>
                  )}

                  <Button
                    onClick={() => project && startInvest(project.id, calc.investment)}
                    className="mt-6 w-full rounded-full bg-amber-400 py-6 text-base font-bold text-blue-950 shadow-lg shadow-amber-500/25 hover:bg-amber-300"
                  >
                    Reserve this capacity <ArrowRight className="h-4.5 w-4.5" />
                  </Button>
                </>
              ) : (
                <div className="mt-6 rounded-xl bg-white/8 px-5 py-6 text-sm text-blue-100/75">
                  No project is open for reservation right now. The calculator lights up as soon as the next listing
                  goes live; check the Projects page for the latest status.
                </div>
              )}
              <p className="mt-5 text-[11px] leading-relaxed text-blue-100/50">
                Estimates use Secured Generation (75% of P90) with 1% annual degradation and the project&apos;s credit
                rate; every unit your capacity generates, after maintenance, is credited directly to your bill. The
                rooftop comparison prices the same money at ₹85,000/kW retail, a ₹8.5/unit grid tariff and
                ₹2,500/kW yearly upkeep borne by the owner. Final numbers are committed in the project Service
                Agreement before you pay.
              </p>
            </div>
          </div>
        </div>
          ) : (
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1fr_1.05fr]">
              {/* owner inputs */}
              <div className="rounded-3xl border border-blue-900/10 bg-card p-6 sm:p-8">
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="owner-kw" className="text-sm font-bold text-blue-950">
                      Your rooftop capacity
                    </label>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-extrabold text-blue-900">
                      {ownerKw} kW
                    </span>
                  </div>
                  <Slider
                    value={[ownerKw]}
                    min={10}
                    max={500}
                    step={5}
                    onValueChange={(v) => setOwnerKw(v[0] ?? ownerKw)}
                    className="mt-3"
                  />
                  <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-400">
                    <span>10 kW</span>
                    <span>250 kW</span>
                    <span>500 kW</span>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                    ≈ {formatNum(owner.monthlyUnits)} secured units generated every month at{" "}
                    {owner.securedPerKw} units/kW/year. Generation scales directly with the kW you install.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setBooster(!booster)}
                  aria-pressed={booster}
                  className={cn(
                    "mt-7 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                    booster ? "border-amber-300 bg-amber-50" : "border-border bg-background hover:border-blue-300"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      booster ? "bg-amber-400 text-blue-950" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Megaphone className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-blue-950">
                      Add the Booster Plan
                      {booster && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                      ₹500 for every kW of your listing, spent entirely on ads that bring faster reservations.
                      Optional: you can list without it.
                    </span>
                  </span>
                </button>

                <div className="mt-7 space-y-3.5 border-t border-dashed border-border pt-5 text-sm">
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Listing &amp; onboarding fee</span>
                    <span className="font-extrabold text-emerald-600">FREE</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      Booster Plan
                      <span className="block text-[11px]">{ownerKw} kW × ₹500, as your ads budget</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {booster ? formatINR(owner.boosterCost) : "Not selected"}
                    </span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      Platform fee at execution
                      <span className="block text-[11px]">2% of project cost, only after 80% is reserved</span>
                    </span>
                    <span className="font-semibold text-foreground">{formatINR(owner.marketplaceFee)}</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      AMC &amp; plant care (annual)
                      <span className="block text-[11px]">₹{formatNum(FEES.ownerAmcPerKwYear)} per kW, every year</span>
                    </span>
                    <span className="font-semibold text-foreground">{formatINR(owner.amcYear)}/yr</span>
                  </p>
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">
                      GridKavach Assurance &amp; insurance (annual)
                      <span className="block text-[11px]">₹{FEES.ownerAssuranceInsurancePerKwYear} per kW, every year</span>
                    </span>
                    <span className="font-semibold text-foreground">{formatINR(owner.assuredYear)}/yr</span>
                  </p>
                </div>
              </div>

              {/* owner results: power generation, bill payment and where the power goes */}
              <div className="kg-hero-bg relative overflow-hidden rounded-3xl p-6 text-white sm:p-8">
                <div className="kg-grid-lines absolute inset-0 opacity-40" aria-hidden="true" />
                <div className="relative">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                    <Zap className="h-4 w-4" /> Power generation &amp; your bill
                  </p>
                  <p className="mt-3 text-5xl font-extrabold tracking-tight sm:text-6xl">
                    {formatNum(owner.monthlyUnits)}
                    <span className="ml-1 text-lg font-semibold text-blue-100/60">units/month</span>
                  </p>
                  <p className="mt-2 text-sm text-blue-100/70">
                    Secured generation from your {ownerKw} kW plant: {owner.securedPerKw} units per kW every year,
                    about {formatNum(owner.annualUnits)} units a year. Generation scales directly with the kW system
                    you install.
                  </p>

                  {/* owner bill payment: grid tariff vs PPA rate */}
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/8 px-4 py-3 backdrop-blur-sm">
                      <span className="text-blue-100/70">
                        Buying the same units from the grid
                        <span className="block text-[10px] text-blue-200/60">
                          @ ₹{MARKET.discomTariff}/unit grid tariff
                        </span>
                      </span>
                      <span className="font-bold text-blue-100/85">{formatINR(owner.gridBill)}/mo</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-400/15 px-4 py-3 ring-1 ring-amber-300/30 backdrop-blur-sm">
                      <span className="font-semibold text-white">
                        Your bill payment on the PPA
                        <span className="block text-[10px] text-amber-200/80">@ ₹{owner.creditRate}/unit PPA rate</span>
                      </span>
                      <span className="text-xl font-extrabold text-amber-300">{formatINR(owner.ppaBill)}/mo</span>
                    </div>
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                    <TrendingUp className="h-3.5 w-3.5" />
                    You pay {formatINR(owner.monthlyBillSavings)} less every month, about
                    {" "}{formatINR(owner.annualBillSavings)} in year one.
                  </p>

                  {/* GridKavach annual service charges, billed to the project owner */}
                  <div className="mt-5 rounded-2xl bg-white/8 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                      <Wrench className="h-4 w-4" /> Your GridKavach charges, every year
                    </p>
                    <div className="mt-2.5 space-y-1.5 text-xs">
                      <p className="flex items-center justify-between gap-3">
                        <span className="text-blue-100/70">
                          AMC &amp; plant care
                          <span className="block text-[10px] text-blue-200/60">
                            ₹{formatNum(FEES.ownerAmcPerKwYear)} × {ownerKw} kW, cleaning to repairs
                          </span>
                        </span>
                        <span className="font-bold text-blue-100/85">{formatINR(owner.amcYear)}/yr</span>
                      </p>
                      <p className="flex items-center justify-between gap-3">
                        <span className="text-blue-100/70">
                          GridKavach Assurance &amp; insurance
                          <span className="block text-[10px] text-blue-200/60">
                            ₹{FEES.ownerAssuranceInsurancePerKwYear} × {ownerKw} kW, generation assurance + asset cover
                          </span>
                        </span>
                        <span className="font-bold text-blue-100/85">{formatINR(owner.assuredYear)}/yr</span>
                      </p>
                      <p className="flex items-center justify-between gap-3 border-t border-white/10 pt-2">
                        <span className="text-blue-100/70">Net position after annual charges</span>
                        <span
                          className={cn(
                            "text-sm font-extrabold",
                            owner.netAfterCharges >= 0 ? "text-emerald-300" : "text-rose-300"
                          )}
                        >
                          {formatINR(owner.netAfterCharges)}/yr
                        </span>
                      </p>
                    </div>
                    <p className="mt-2.5 text-[10px] leading-relaxed text-blue-100/50">
                      Net position is your {formatINR(owner.annualBillSavings)} a year bill savings minus the
                      {" "}{formatINR(owner.annualCharges)} of annual charges. Your DISCOM tariff decides the final net:
                      on tariffs above ₹{MARKET.discomTariff}/unit the same plant nets more, and committed numbers
                      appear in your project documents.
                    </p>
                  </div>

                  {/* every unit goes to users */}
                  <div className="mt-5 rounded-2xl bg-white/8 p-4 ring-1 ring-white/15 backdrop-blur-sm">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
                      <Users className="h-4 w-4" /> Every unit goes straight to users
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-blue-100/75">
                      100% of your plant&apos;s generation, after maintenance, flows directly to users on the
                      marketplace as bill credits at ₹{owner.creditRate}/unit. Your monthly PPA payment funds exactly
                      those credits: you buy cheaper power, users earn from every unit your rooftop generates.
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[9px] font-bold uppercase tracking-wide text-blue-100/75">
                      {["Plant generates", "GridKavach maintains", "Users' bills credited"].map((s, i) => (
                        <div key={i} className="rounded-lg bg-white/8 px-1 py-2 backdrop-blur-sm">
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/8 px-4 py-3.5 backdrop-blur-sm">
                      <p className="text-[11px] text-blue-100/65">Project cost via GridKavach</p>
                      <p className="mt-1 text-xl font-extrabold">{formatINR(owner.projectCost)}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-emerald-300">
                        {owner.costSavingPct}% below market pricing
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/8 px-4 py-3.5 backdrop-blur-sm">
                      <p className="text-[11px] text-blue-100/65">Same plant at market rates</p>
                      <p className="mt-1 text-xl font-extrabold text-blue-100/60 line-through decoration-rose-300/70">
                        {formatINR(owner.marketCost)}
                      </p>
                      <p className="mt-0.5 text-[10px] text-blue-100/60">bulk buys, no middlemen</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-4 gap-1.5 text-center text-[9px] font-bold uppercase tracking-wide text-blue-100/75">
                    {["List free", "Booster (optional)", "80% reserved", "Pay 2%, execute"].map((s, i) => (
                      <div key={i} className="rounded-lg bg-white/8 px-1 py-2 backdrop-blur-sm">
                        {s}
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => setView("contact")}
                    className="mt-6 w-full rounded-full bg-amber-400 py-6 text-base font-bold text-blue-950 shadow-lg shadow-amber-500/25 hover:bg-amber-300"
                  >
                    List your project <ArrowRight className="h-4.5 w-4.5" />
                  </Button>

                  <p className="mt-5 text-[11px] leading-relaxed text-blue-100/50">
                    Generation depends on the kW system installed and assumes Secured Generation (75% of P90) with 1%
                    annual degradation. Figures use a ₹{MARKET.discomTariff}/unit grid tariff and a
                    ₹{owner.creditRate}/unit PPA rate; all generation, after maintenance, is credited directly to
                    users. Final values are fixed per project after the site survey; the Booster Plan is spent on
                    advertising, the one-time platform fee of {FEES.executionFeePct}% is payable only when you
                    initiate execution, and plant care is billed annually at ₹{formatNum(FEES.ownerAmcPerKwYear)}/kW for the AMC
                    plus ₹{FEES.ownerAssuranceInsurancePerKwYear}/kW for GridKavach Assurance &amp; insurance.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  PROJECT SPOTLIGHT: live listing                                    */
/* ------------------------------------------------------------------ */

interface SpotProject {
  id: string;
  name: string;
  location: string;
  state: string;
  utility: string;
  capacityKw: number;
  availableKw: number;
  fillPct: number;
  creditsPerKwh: number;
  pricePerKw: number;
  tenureMonths: number;
  status: string;
}

export function ProjectSpotlight() {
  const openProject = useApp((s) => s.openProject);
  const setView = useApp((s) => s.setView);
  const [p, setP] = useState<SpotProject | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setP((d.projects ?? []).find((x: SpotProject) => x.status === "OPEN") ?? null))
      .catch(() => {});
  }, []);

  if (!p) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      <div className="overflow-hidden rounded-3xl border border-blue-900/10 bg-card shadow-lg shadow-blue-950/5">
        <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-7 sm:p-9">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> FUNDING OPEN
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {p.location}, {p.state} · {p.utility}
              </span>
            </div>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">Open Rooftop Solar Project</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              A planned {p.capacityKw} kW rooftop plant for the host premises. Reserve a share of its generation and
              the units it produces arrive as a fixed monthly credit on your bill.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { v: `${p.capacityKw} kW`, l: "Capacity" },
                { v: `₹${p.creditsPerKwh}`, l: "Credit / unit" },
                { v: formatINR(p.pricePerKw), l: "Per kW" },
                { v: `${Math.floor(p.tenureMonths / 12)} yrs`, l: "Tenure" },
              ].map((s, i) => (
                <div key={i} className="rounded-xl bg-blue-50/70 px-3.5 py-3">
                  <p className="text-lg font-extrabold text-blue-950">{s.v}</p>
                  <p className="text-[11px] text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>Capacity reserved by investors</span>
                <span className="text-blue-950">{p.fillPct}%</span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-700 to-amber-400 transition-all"
                  style={{ width: `${Math.max(p.fillPct, 3)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 border-t border-blue-900/10 bg-blue-950 p-7 sm:p-9 lg:border-l lg:border-t-0">
            <p className="text-sm leading-relaxed text-blue-100/75">
              Agreement, PPA summary, generation estimates and escrow details live on the project page. Read them
              before you reserve.
            </p>
            <Button
              onClick={() => openProject(p.id)}
              className="w-full rounded-full bg-amber-400 py-6 text-base font-bold text-blue-950 hover:bg-amber-300"
            >
              View project &amp; documents <ArrowRight className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setView("projects")}
              className="w-full rounded-full text-blue-100/80 hover:bg-white/10 hover:text-white"
            >
              See all projects
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */

const FAQ_TABS = ["General", "Investing", "Bills & Credits"] as const;

function faqCategory(q: string): (typeof FAQ_TABS)[number] {
  const ql = q.toLowerCase();
  if (ql.includes("credit") || ql.includes("bill") || ql.includes("adjust") || ql.includes("discom")) return "Bills & Credits";
  if (ql.includes("invest") || ql.includes("money") || ql.includes("fee") || ql.includes("exit") || ql.includes("escrow") || ql.includes("reserve")) return "Investing";
  return "General";
}

export function Faq() {
  const [tab, setTab] = useState<(typeof FAQ_TABS)[number]>("General");
  const list = FAQS.filter((f) => faqCategory(f.q) === tab);
  return (
    <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 md:pb-24">
      <div className="text-center">
        <Eyebrow>Before you decide</Eyebrow>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
          Straight answers, no fine print
        </h2>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2.5">
        {FAQ_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors",
              tab === t
                ? "border-blue-950 bg-blue-950 text-white"
                : "border-border text-slate-500 hover:border-blue-300 hover:text-blue-900"
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <Accordion type="single" collapsible className="mt-8">
        {list.map((f, i) => (
          <AccordionItem key={`${tab}-${i}`} value={`${tab}-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold text-blue-950">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FINAL CTA: dual audience                                           */
/* ------------------------------------------------------------------ */

export function FinalCta() {
  const setView = useApp((s) => s.setView);
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="kg-hero-bg relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center text-white sm:px-12">
        <div className="kg-grid-lines absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            The sun rises on everyone&apos;s bill tomorrow. Be ready for it.
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-blue-100/75">
            Whether you want to offset your electricity bill or put a rooftop to work, it starts with a single
            reservation or listing: three minutes, fully digital.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => setView("projects")}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-8 py-3.5 text-base font-bold text-blue-950 shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-300"
            >
              Start investing <ChevronRight className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setView("contact")}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              List your rooftop
            </button>
          </div>
          <p className="mt-7 text-xs text-blue-100/50">
            Operated by Sreesamvridhi Enterprises Pvt Ltd · Investments from {formatINR(LIMITS.minInvestment)} to{" "}
            {formatINR(LIMITS.maxInvestment)} per project
          </p>
        </div>
      </div>
    </section>
  );
}
