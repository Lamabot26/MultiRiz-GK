"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { computeQuote, formatINR, formatNum, LIMITS } from "@/lib/brand";
import {
  ArrowLeft, ArrowRight, MapPin, Users, Zap, IndianRupee, Building2,
  CalendarClock, Gauge, Sun, ShieldCheck, Wallet, FileText, Landmark, School, Wrench,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ---------------- types ---------------- */

export interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  hostSociety: string;
  location: string;
  state: string;
  utility: string;
  capacityKw: number;
  availableKw: number;
  fillPct: number;
  creditsPerKwh: number;
  pricePerKw: number;
  tenureMonths: number;
  p90KwhPerKw: number;
  annualDegradation: number;
  status: string;
  tagline?: string | null;
  imageKey: string;
  investors: number;
  securedY1: number;
  monthlyCreditPerKw: number;
}

export interface ProjectDetail extends ProjectSummary {
  securedSeries: number[];
  buybackSchedule: { year: number; valuePerKw: number }[];
  assurancePct: number;
}

const IMG_STYLES: Record<string, { chip: string; bar: string }> = {
  emerald: { chip: "bg-blue-100 text-blue-800", bar: "bg-blue-500" },
  amber: { chip: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
  teal: { chip: "bg-teal-100 text-teal-800", bar: "bg-teal-500" },
};

function statusBadge(status: string) {
  if (status === "FILLING") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Filling fast</Badge>;
  if (status === "FULL") return <Badge className="bg-stone-200 text-stone-600 hover:bg-stone-200">Fully subscribed</Badge>;
  return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Open</Badge>;
}

/* ---------------- projects list ---------------- */

export function ProjectsView() {
  const { openProject, startInvest, user } = useApp();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(d.projects ?? []))
      .catch(() => setProjects([]));
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Invest in listed solar projects</h1>
        <p className="mt-3 text-muted-foreground">
          GridKavach is a marketplace for rooftop solar. Project owners list their projects here, you reserve a share
          from {formatINR(LIMITS.minInvestment)} to {formatINR(LIMITS.maxInvestment)}, and your money is collected into
          that project&apos;s dedicated Escrow Account. GridKavach, the aggregator between the owner and investors,
          executes the project and delivers your fixed monthly credit.
        </p>
      </div>

      {!projects ? (
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
          New projects are being onboarded. Please check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const style = IMG_STYLES[p.imageKey] ?? IMG_STYLES.emerald;
            return (
              <div key={p.id} className="flex flex-col rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl font-bold", style.chip)}>
                    {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                  </div>
                  {statusBadge(p.status)}
                </div>
                <button onClick={() => openProject(p.id)} className="mt-4 text-left">
                  <h3 className="text-lg font-semibold hover:text-primary">{p.name}</h3>
                </button>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {p.location}, {p.state}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" /> Host: {p.hostSociety}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-muted/60 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Credit rate</p>
                    <p className="font-semibold">₹{p.creditsPerKwh.toFixed(2)}/unit</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Fixed credit / kW</p>
                    <p className="font-semibold">{formatINR(p.monthlyCreditPerKw)}/mo</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatNum(p.availableKw, 1)} kW available of {formatNum(p.capacityKw, 1)} kW</span>
                    <span>{p.fillPct}% filled</span>
                  </div>
                  <Progress value={p.fillPct} className="mt-1.5 h-2" />
                </div>

                <div className="mt-4 flex flex-1 items-end gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => openProject(p.id)}>
                    Details
                  </Button>
                  <Button
                    className="flex-1 gap-1.5"
                    disabled={p.status === "FULL" || p.availableKw * p.pricePerKw < LIMITS.minInvestment}
                    onClick={() => (user ? openProject(p.id) : startInvest(p.id))}
                  >
                    Reserve <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-blue-300 bg-blue-50/50 p-6 sm:flex-row sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <School className="h-5.5 w-5.5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Own a rooftop? List your project on GridKavach.</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Schools, housing societies and businesses can list their rooftop for solar; investors fund it through the
            project escrow account and GridKavach executes end to end. Listing is free, the optional Booster Plan
            (₹500/kW, spent on ads) speeds up reservations, and a 2% platform fee applies only when execution begins at
            80% reserved. Once live, GridKavach also carries the plant: AMC at ₹1,200/kW a year and GridKavach
            Assurance &amp; insurance at ₹999/kW a year, billed annually.
          </p>
        </div>
        <Button variant="outline" className="shrink-0" onClick={() => setView("contact")}>
          List your project <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}

export function Calculator({
  project,
  compact = false,
}: {
  project: Pick<ProjectSummary, "pricePerKw" | "creditsPerKwh" | "p90KwhPerKw" | "tenureMonths" | "annualDegradation" | "availableKw" | "status">;
  compact?: boolean;
}) {
  const startInvest = useApp((s) => s.startInvest);
  const [mode, setMode] = useState<"amount" | "bill">("amount");
  const [amount, setAmount] = useState(25000);
  const [bill, setBill] = useState(3000);
  const [pct, setPct] = useState(10);

  const maxInvest = Math.min(LIMITS.maxInvestment, Math.max(Math.floor(project.availableKw * project.pricePerKw), LIMITS.minInvestment));

  const quote = useMemo(() => {
    if (mode === "amount") {
      return computeQuote({
        investment: amount,
        pricePerKw: project.pricePerKw,
        creditsPerKwh: project.creditsPerKwh,
        p90KwhPerKw: project.p90KwhPerKw,
        tenureMonths: project.tenureMonths,
        degradationPct: project.annualDegradation,
      });
    }
    // bill mode: target monthly savings = bill × pct%
    const targetMonthly = bill * (pct / 100);
    const monthlyKwhNeeded = targetMonthly / project.creditsPerKwh;
    const capacityKwNeeded = (monthlyKwhNeeded * 12) / (project.p90KwhPerKw * 0.75);
    const inv = Math.min(maxInvest, Math.max(LIMITS.minInvestment, Math.round((capacityKwNeeded * project.pricePerKw) / 100) * 100));
    return computeQuote({
      investment: inv,
      pricePerKw: project.pricePerKw,
      creditsPerKwh: project.creditsPerKwh,
      p90KwhPerKw: project.p90KwhPerKw,
      tenureMonths: project.tenureMonths,
      degradationPct: project.annualDegradation,
    });
  }, [mode, amount, bill, pct, project, maxInvest]);

  const years = Math.floor(project.tenureMonths / 12);
  const tenureLabel = `${years}+ yrs`;

  return (
    <div className={cn("rounded-2xl border bg-card", compact ? "p-5" : "p-6")}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Reservation calculator</h3>
        <div className="flex rounded-lg bg-muted p-0.5 text-xs font-medium">
          {(["amount", "bill"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn("rounded-md px-2.5 py-1.5 transition-colors", mode === m ? "bg-card shadow-sm" : "text-muted-foreground")}
            >
              {m === "amount" ? "By amount" : "By bill"}
            </button>
          ))}
        </div>
      </div>

      {mode === "amount" ? (
        <div className="mt-5">
          <Label htmlFor="amt" className="text-sm text-muted-foreground">
            Choose reservation amount (₹{LIMITS.minInvestment.toLocaleString("en-IN")} to {formatINR(maxInvest)})
          </Label>
          <div className="relative mt-2">
            <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="amt"
              type="number"
              min={LIMITS.minInvestment}
              max={maxInvest}
              step={500}
              value={amount}
              onChange={(e) => {
                const v = Math.max(LIMITS.minInvestment, Math.min(maxInvest, Number(e.target.value) || LIMITS.minInvestment));
                setAmount(v);
              }}
              className="h-12 pl-9 text-lg font-semibold"
            />
          </div>
          <input
            type="range"
            min={LIMITS.minInvestment}
            max={maxInvest}
            step={500}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-4 w-full accent-blue-600"
            aria-label="Reservation amount slider"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹1,000</span>
            <span>{formatINR(maxInvest)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="bill" className="text-sm text-muted-foreground">Enter average monthly power bill</Label>
            <div className="relative mt-2">
              <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="bill"
                type="number"
                min={200}
                step={100}
                value={bill}
                onChange={(e) => setBill(Math.max(200, Number(e.target.value) || 200))}
                className="h-12 pl-9 text-lg font-semibold"
              />
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Choose savings range (% of bill to offset)</Label>
            <Slider value={[pct]} onValueChange={(v) => setPct(v[0] ?? 10)} min={5} max={50} step={1} className="mt-3" />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>5%</span>
              <span className="font-semibold text-foreground">{pct}% · {formatINR(bill * (pct / 100), 0)}/month</span>
              <span>50%</span>
            </div>
          </div>
        </div>
      )}

      {/* quote cards */}
      <div className="mt-6 grid grid-cols-2 gap-2.5 text-sm">
        <QuoteCard icon={Wallet} label="Fixed monthly credit" value={formatINR(quote.monthlyCredit)} highlight />
        <QuoteCard icon={Gauge} label="Reserved capacity" value={`${formatNum(quote.capacityWatts, quote.capacityWatts < 1000 ? 1 : 0)} W`} />
        <QuoteCard icon={Zap} label="Monthly units secured" value={`${formatNum(quote.securedKwhYear1 / 12, 1)} kWh`} />
        <QuoteCard icon={CalendarClock} label="Annual savings (Yr 1)" value={formatINR(quote.annualSavingsYear1)} />
        <QuoteCard icon={Sun} label={`Total savings over ${tenureLabel}`} value={formatINR(quote.totalSavingsTenure)} />
        <QuoteCard icon={ShieldCheck} label="Indicative exit (Yr-1 end)" value={formatINR(quote.buybackNow)} />
      </div>

      <div className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Capacity cost</span>
          <span>{formatINR(quote.amount, 2)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Onboarding fee (1%)</span>
          <span>{formatINR(quote.onboardingFee, 2)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>GST (12%)</span>
          <span>{formatINR(quote.gstAmount, 2)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-blue-200/70 pt-2 font-semibold">
          <span>Total payable today</span>
          <span>{formatINR(quote.totalPayable, 2)}</span>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-5 h-12 w-full gap-2 text-base"
        disabled={project.status === "FULL"}
        onClick={() => {
          if (quote.amount > project.availableKw * project.pricePerKw) {
            toast({ title: "Not enough capacity", description: `Only ${formatNum(project.availableKw * 1000, 0)} W remains in this project.`, variant: "destructive" });
            return;
          }
          startInvest(useApp.getState().selectedProjectId ?? "", quote.amount);
        }}
      >
        Reserve {formatNum(quote.capacityWatts, quote.capacityWatts < 1000 ? 1 : 0)} W for {formatINR(quote.totalPayable, 0)} <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-2.5 text-center text-[11px] leading-relaxed text-muted-foreground">
        Fixed credit computed at Secured Generation (75% of P90). Actual generation above secured level earns upside credits.
        Figures before annual 1% degradation adjustment from Year 2.
      </p>
    </div>
  );
}

function QuoteCard({ icon: Icon, label, value, highlight }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-xl p-3.5", highlight ? "bg-amber-50 ring-1 ring-amber-200" : "bg-muted/60")}>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className={cn("mt-1 font-bold", highlight ? "text-amber-700" : "")}>{value}</p>
    </div>
  );
}

/* ---------------- project detail ---------------- */

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { setView } = useApp();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/projects/${projectId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (!cancelled) setProject(data.project);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-lg font-semibold">Project not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => setView("projects")}>Back to projects</Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  const style = IMG_STYLES[project.imageKey] ?? IMG_STYLES.emerald;
  const years = Math.ceil(project.tenureMonths / 12);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <Button variant="ghost" className="mb-6 gap-2 -ml-2" onClick={() => setView("projects")}>
        <ArrowLeft className="h-4 w-4" /> All projects
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        {/* left: info */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold", style.chip)}>
              {project.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{project.name}</h1>
                {statusBadge(project.status)}
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {project.code} · {project.location}, {project.state} · {project.utility}
              </p>
            </div>
          </div>

          {project.tagline && (
            <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-900">
              {project.tagline}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <SpecCard icon={Building2} label="Project owner / Purchaser" value={project.hostSociety} />
            <SpecCard icon={Gauge} label="Planned capacity" value={`${formatNum(project.capacityKw, 2)} kW`} />
            <SpecCard icon={Users} label="Investors on board" value={String(project.investors)} />
            <SpecCard icon={IndianRupee} label="Credit rate" value={`₹${project.creditsPerKwh.toFixed(2)} / kWh`} />
            <SpecCard icon={CalendarClock} label="Tenure" value={`${years} years`} />
            <SpecCard icon={ShieldCheck} label="P90 yield" value={`${formatNum(project.p90KwhPerKw)} kWh/kW/yr`} />
          </div>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/60 p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Wrench className="h-5 w-5 text-blue-700" /> AMC &amp; support: handled by GridKavach
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-blue-900/90">
              GridKavach is responsible for the Annual Maintenance Contract and all ongoing support of this plant:
              fortnightly panel cleaning, preventive electrical checks, generation monitoring, inverter &amp; component
              servicing through our Solar Partners, and insurance administration. No added operational cost on
              investors, for the entire tenure.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Landmark className="h-5 w-5 text-amber-600" /> Escrow-protected funding
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
              Every investment in this project is collected into the dedicated{" "}
              <strong>“{project.name}” Escrow Account</strong>. Funds are released to the project owner and solar
              partners only against verified execution milestones: procurement, installation, net-metering and
              commissioning. If the project does not proceed, escrowed amounts are refunded to investors in full.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" /> GridKavach Assurance: Secured Generation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              This project guarantees {project.assurancePct}% of its P90 yield as Secured Generation. If any month falls
              short, GridKavach tops your credit up to the committed Fixed Monthly Credit, automatically.
            </p>
            <div className="mt-4 max-h-44 overflow-y-auto rounded-xl border kg-scroll">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/95 backdrop-blur">
                  <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Year</th>
                    <th className="px-4 py-2 font-medium">Secured kWh / kW</th>
                    <th className="px-4 py-2 font-medium">Fixed credit / kW / mo</th>
                  </tr>
                </thead>
                <tbody>
                  {project.securedSeries.slice(0, years).map((kwh, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">Year {i + 1}</td>
                      <td className="px-4 py-2">{formatNum(kwh, 2)}</td>
                      <td className="px-4 py-2 font-medium text-blue-700">
                        {formatINR((kwh / 12) * project.creditsPerKwh, 2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-6">
            <h2 className="font-semibold">Buy-back schedule (exit value per kW)</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Exit anytime. Your payout follows this transparent year-wise schedule (Annexure C), less a 2.5% processing fee.
            </p>
            <div className="mt-4 flex h-32 items-end gap-1.5 overflow-x-auto kg-scroll pb-1">
              {project.buybackSchedule.map((b) => (
                <div key={b.year} className="flex min-w-[34px] flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400"
                    style={{ height: `${Math.max(4, (b.valuePerKw / project.pricePerKw) * 100)}%` }}
                    title={`Year ${b.year}: ${formatINR(b.valuePerKw)}`}
                  />
                  <span className="text-[10px] text-muted-foreground">Y{b.year}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border bg-card p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <FileText className="h-5 w-5 text-primary" /> Documents &amp; contracts: {project.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every agreement on GridKavach belongs to its project. These are the exact documents you review and
              e-sign inside this project&apos;s paperless booking flow, sealed with a booking reference and SHA-256 fingerprint.
            </p>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              <button
                onClick={() => setView("agreement")}
                className="flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50"
              >
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>
                  <span className="block text-sm font-semibold">Digital Solar Service Agreement</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Project-specific: capacity, ₹/kW price, credit rate and secured generation in Annexures A &amp; B.
                  </span>
                </span>
              </button>
              <button
                onClick={() => setView("ppa")}
                className="flex items-start gap-3 rounded-xl border p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/50"
              >
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>
                  <span className="block text-sm font-semibold">PPA Summary (Annexure D)</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    The power purchase arrangement backing this specific project under the RESCO model.
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* right: sticky calculator */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Calculator project={project} />
        </div>
      </div>
    </div>
  );
}

function SpecCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold" title={value}>{value}</p>
    </div>
  );
}
