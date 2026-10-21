"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR, formatNum } from "@/lib/brand";
import { toast } from "@/hooks/use-toast";
import {
  ArrowRight, BadgeIndianRupee, CalendarClock, FileText, Leaf,
  LogOut, Printer, ShieldCheck, Sun, TrendingUp, Wallet, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "./logo";

/* ---------------- types ---------------- */

interface CreditEntry {
  id: string;
  periodLabel: string;
  periodStart: string;
  unitsKwh: number;
  grossAmount: number;
  topUpAmount: number;
  netAmount: number;
  billStatus: string;
}

interface Investment {
  id: string;
  ref: string;
  status: string;
  amount: number;
  capacityWatts: number;
  totalPayable: number;
  monthlyCredit: number;
  agreementVersion: string;
  docHash: string;
  acceptedAt: string;
  exitRequestedAt?: string | null;
  exitPayout?: number | null;
  project: { name: string; code: string; location: string; state: string; creditsPerKwh: number; imageKey: string };
  credits: CreditEntry[];
}

interface Summary {
  invested: number;
  capitalDeployed: number;
  creditsEarned: number;
  pending: number;
  units: number;
  co2Tonnes: number;
  active: number;
}

/* ================= DASHBOARD ================= */

export function Dashboard() {
  const { user, setView, startInvest, setUser } = useApp();
  const [inv, setInv] = useState<Investment[] | null>(null);
  const [sum, setSum] = useState<Summary | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetch("/api/investments")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setInv(d.investments);
        setSum(d.summary);
      })
      .catch(() => setInv([]));
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Your investor dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to view reservations, credits and contracts.</p>
        <Button className="mt-6" onClick={() => useApp.getState().setAuthOpen(true, "login")}>Sign in</Button>
      </div>
    );
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setView("home");
    toast({ title: "Signed out" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Namaste, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user.utilityName ? `${user.utilityName} · ${user.consumerNumber ?? ""}` : "Add your DISCOM details when reserving"} (credits auto-adjust here)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Capital deployed" value={sum ? formatINR(sum.capitalDeployed) : "₹0"} sub={`${sum?.active ?? 0} active reservation${(sum?.active ?? 0) === 1 ? "" : "s"}`} />
        <Kpi icon={BadgeIndianRupee} label="Credits earned" value={sum ? formatINR(sum.creditsEarned) : "₹0"} sub="applied to bills" accent />
        <Kpi icon={CalendarClock} label="Pending credits" value={sum ? formatINR(sum.pending) : "₹0"} sub="next metering cycle" />
        <Kpi icon={Leaf} label="CO₂ avoided" value={sum ? `${formatNum(sum.co2Tonnes, 2)} t` : "0 t"} sub="vs coal grid" />
      </div>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/70 sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="credits">Credit Ledger</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          {inv === null ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : inv.length === 0 ? (
            <EmptyState onInvest={() => setView("projects")} />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {inv.map((i) => (
                <InvestmentCard key={i.id} inv={i} onViewContract={() => setContractId(i.id)} />
              ))}
              <button
                onClick={() => setView("projects")}
                className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Zap className="h-6 w-6" />
                <span className="text-sm font-medium">Add another reservation</span>
                <span className="text-xs">From ₹1,000 on any live project</span>
              </button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="credits" className="mt-5">
          {inv === null ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : (
            <CreditLedger investments={inv} />
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-5">
          {inv === null ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : inv.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Your executed contracts will appear here after your first reservation.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {inv.map((i) => (
                <button
                  key={i.id}
                  onClick={() => setContractId(i.id)}
                  className="group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">Digital Solar Service Agreement</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {i.ref} · {i.agreementVersion}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {contractId && (
        <ContractDialog id={contractId} onClose={() => setContractId(null)} />
      )}
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-5", accent && "bg-amber-50/70 ring-1 ring-amber-200")}>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", accent && "text-amber-600")} /> {label}
      </p>
      <p className={cn("mt-1.5 text-xl font-bold tracking-tight sm:text-2xl", accent && "text-amber-700")}>{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

function EmptyState({ onInvest }: { onInvest: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center">
      <SunBig />
      <h3 className="mt-3 text-lg font-semibold">No reservations yet</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        Reserve rooftop solar from ₹1,000 and start earning a fixed monthly credit against your electricity bill.
      </p>
      <Button className="mt-5 gap-2" onClick={onInvest}>
        Explore projects <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
function SunBig() {
  return (
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
      <Sun className="h-7 w-7 text-amber-500" />
    </div>
  );
}

function InvestmentCard({ inv, onViewContract }: { inv: Investment; onViewContract: () => void }) {
  const applied = inv.credits.filter((c) => c.billStatus === "APPLIED");
  const totalApplied = applied.reduce((s, c) => s + c.netAmount, 0);

  async function requestExit() {
    const res = await fetch(`/api/investments/${inv.id}/exit`, { method: "POST" });
    const d = await res.json();
    if (!res.ok) {
      toast({ title: "Exit failed", description: d.error, variant: "destructive" });
      return;
    }
    toast({ title: "Exit requested", description: d.exit.message });
    window.location.reload();
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{inv.project.name}</h3>
            {inv.status === "ACTIVE" ? (
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Active</Badge>
            ) : inv.status === "EXIT_REQUESTED" ? (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Exit requested</Badge>
            ) : (
              <Badge variant="secondary">Exited</Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {inv.ref} · {inv.project.location}, {inv.project.state}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{formatNum(inv.capacityWatts, inv.capacityWatts < 1000 ? 1 : 0)} W</p>
          <p className="text-xs text-muted-foreground">reserved capacity</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-muted/60 p-3">
          <p className="text-xs text-muted-foreground">Fixed credit</p>
          <p className="font-bold text-blue-700">{formatINR(inv.monthlyCredit)}/mo</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-3">
          <p className="text-xs text-muted-foreground">Applied to bills</p>
          <p className="font-bold">{formatINR(totalApplied)}</p>
        </div>
        <div className="rounded-lg bg-muted/60 p-3">
          <p className="text-xs text-muted-foreground">Capital</p>
          <p className="font-bold">{formatINR(inv.amount)}</p>
        </div>
      </div>

      {inv.credits.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lifetime credits vs capital</span>
            <span>{Math.min(100, Math.round((totalApplied / inv.amount) * 100))}%</span>
          </div>
          <Progress value={Math.min(100, (totalApplied / inv.amount) * 100)} className="mt-1.5 h-2" />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onViewContract}>
          <FileText className="h-3.5 w-3.5" /> View contract
        </Button>
        {inv.status === "ACTIVE" && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={requestExit}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Exit / transfer
          </Button>
        )}
        {inv.status === "EXIT_REQUESTED" && inv.exitPayout != null && (
          <p className="text-xs text-muted-foreground">
            Payout of {formatINR(inv.exitPayout)} processing (within 45-60 days).
          </p>
        )}
      </div>
    </div>
  );
}

function CreditLedger({ investments }: { investments: Investment[] }) {
  const rows = investments.flatMap((i) =>
    i.credits.map((c) => ({ ...c, project: i.project.name, ref: i.ref }))
  );
  rows.sort((a, b) => new Date(b.periodStart).getTime() - new Date(a.periodStart).getTime());

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Your first credit will appear at the next metering cycle.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="max-h-[520px] overflow-y-auto kg-scroll">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
            <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Project</th>
              <th className="px-4 py-3 text-right font-medium">Units</th>
              <th className="px-4 py-3 text-right font-medium">Generation</th>
              <th className="px-4 py-3 text-right font-medium">Kavach top-up</th>
              <th className="px-4 py-3 text-right font-medium">Net credit</th>
              <th className="px-4 py-3 text-center font-medium">Bill</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-medium">{r.periodLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.project}</td>
                <td className="px-4 py-3 text-right">{formatNum(r.unitsKwh, 1)}</td>
                <td className="px-4 py-3 text-right">{formatINR(r.grossAmount, 2)}</td>
                <td className="px-4 py-3 text-right">
                  {r.topUpAmount > 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                      <ShieldCheck className="h-3.5 w-3.5" /> +{formatINR(r.topUpAmount, 2)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">Nil</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-bold text-blue-700">{formatINR(r.netAmount, 2)}</td>
                <td className="px-4 py-3 text-center">
                  {r.billStatus === "APPLIED" ? (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Applied</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= contract dialog (printable) ================= */

interface ContractData {
  booking: { ref: string; acceptedAt: string; acceptedIp?: string; agreementVersion: string; docHash: string; status: string };
  investor: { name: string; email: string; phone: string; utilityName?: string | null; consumerNumber?: string | null };
  project: { code: string; name: string; hostSociety: string; location: string; state: string; utility: string; capacityKw: number; creditsPerKwh: number; tenureMonths: number; p90KwhPerKw: number; annualDegradation: number };
  reservation: { amount: number; capacityWatts: number; onboardingFee: number; gstAmount: number; totalPayable: number; annualKwhP90: number; securedKwhYear1: number; monthlyCredit: number };
  annexures: { securedGeneration: { year: number; perKw: number; forCapacity: number }[]; buyback: { year: number; value: number }[] };
  brand: { name: string; legalName: string; domain: string; supportEmail: string; jurisdiction: string };
}

function ContractDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [data, setData] = useState<ContractData | null>(null);

  useEffect(() => {
    fetch(`/api/investments/${id}/contract`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d.contract))
      .catch(() => {});
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 sm:p-8" onClick={onClose}>
      <div
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Executed digital contract"
      >
        {!data ? (
          <div className="flex items-center justify-center p-16">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        ) : (
          <ExecutedContract data={data} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function ExecutedContract({ data, onClose }: { data: ContractData; onClose: () => void }) {
  const b = data.booking;
  const p = data.project;
  const r = data.reservation;
  const years = Math.ceil(p.tenureMonths / 12);

  return (
    <div className="p-6 sm:p-10">
      <div className="kg-no-print mb-6 flex items-center justify-between">
        <Badge className="gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100">
          <ShieldCheck className="h-3.5 w-3.5" /> Executed · {b.status}
        </Badge>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
          <Button size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Save as PDF
          </Button>
        </div>
      </div>

      {/* contract sheet */}
      <div className="rounded-xl border p-6 text-[13px] leading-relaxed sm:p-8">
        <div className="flex items-start justify-between border-b pb-5">
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <div>
              <p className="text-lg font-bold">GridKavach</p>
              <p className="text-xs text-muted-foreground">operated by {data.brand.legalName}</p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p className="font-mono font-semibold text-foreground">{b.ref}</p>
            <p>{new Date(b.acceptedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
            <p>{b.agreementVersion}</p>
          </div>
        </div>

        <h1 className="mt-6 text-center text-xl font-bold uppercase tracking-wide">
          Digital Solar Service Agreement
          <span className="mt-1 block text-xs font-medium normal-case text-muted-foreground">
            (executed electronically under the Information Technology Act, 2000)
          </span>
        </h1>

        <p className="mt-5">
          This Agreement is executed between <strong>{data.brand.legalName}</strong> ("GridKavach"), the Platform
          operator ({data.brand.domain}), and <strong>{data.investor.name}</strong> ("Investor"), {data.investor.email} ·{" "}
          {data.investor.phone}
          {data.investor.utilityName ? ` · ${data.investor.utilityName}${data.investor.consumerNumber ? ` (${data.investor.consumerNumber})` : ""}` : ""}.
        </p>

        <h2 className="mt-5 font-semibold">1. Reservation</h2>
        <p className="mt-1 text-foreground/85">
          The Investor has reserved Digital Solar Capacity in <strong>{p.name}</strong> ({p.code}), hosted at{" "}
          {p.hostSociety}, {p.location}, {p.state} ({p.utility} territory), as per Annexure A below.
        </p>

        <h2 className="mt-5 font-semibold">Annexure A: Digital Solar Configuration</h2>
        <div className="mt-2 overflow-hidden rounded-lg border">
          <table className="w-full text-[12.5px]">
            <tbody>
              {[
                ["Project", `${p.name} (${p.code})`],
                ["Project Developer / Service Provider", data.brand.legalName],
                ["Project Location", `${p.location}, ${p.state}`],
                ["Hosting Partner (Purchaser under PPA)", p.hostSociety],
                ["Reserved Digital Solar Capacity", `${formatNum(r.capacityWatts, r.capacityWatts < 1000 ? 1 : 0)} W`],
                ["Capacity Cost", formatINR(r.amount, 2)],
                ["Onboarding Fee (1%)", formatINR(r.onboardingFee, 2)],
                ["GST (12%)", formatINR(r.gstAmount, 2)],
                ["Total Payable", formatINR(r.totalPayable, 2)],
                ["Credits / kWh (Credit Rate)", `₹${p.creditsPerKwh.toFixed(2)}`],
                ["Fixed Monthly Credit (Secured)", `${formatINR(r.monthlyCredit)} / month`],
                ["P90 / kWh / Year (for capacity)", `${formatNum(r.annualKwhP90, 1)} kWh`],
                ["Secured Generation: Year 1", `${formatNum(r.securedKwhYear1, 1)} kWh`],
                ["Project Tenure", `${p.tenureMonths} months (~${years} years)`],
                ["Annual degradation", `${p.annualDegradation}% y-o-y`],
              ].map(([k, v], i) => (
                <tr key={i} className={i % 2 ? "bg-muted/40" : ""}>
                  <td className="px-3 py-1.5 text-muted-foreground">{k}</td>
                  <td className="px-3 py-1.5 text-right font-medium">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-5 font-semibold">Annexure B: Secured Generation (per kW, for reserved capacity)</h2>
        <p className="mt-1 text-foreground/85">
          Secured Generation is {75}% of P90 ({formatNum(p.p90KwhPerKw)} kWh/kW/yr Year 1) with {p.annualDegradation}% annual
          degradation. Shortfalls below this level are topped up under the GridKavach Assurance (Clause 7 of the Agreement).
        </p>
        <div className="mt-2 grid max-h-52 grid-cols-2 gap-x-6 overflow-y-auto rounded-lg border p-3 text-[12px] sm:grid-cols-3 kg-scroll">
          {data.annexures.securedGeneration.map((s) => (
            <div key={s.year} className="flex justify-between border-b border-dashed py-1">
              <span className="text-muted-foreground">Year {s.year}</span>
              <span className="font-medium">{formatNum(s.forCapacity, 1)} kWh</span>
            </div>
          ))}
        </div>

        <h2 className="mt-5 font-semibold">Annexure C: Buy-Back Values (for reserved capacity)</h2>
        <div className="mt-2 grid max-h-52 grid-cols-2 gap-x-6 overflow-y-auto rounded-lg border p-3 text-[12px] sm:grid-cols-3 kg-scroll">
          {data.annexures.buyback.map((s) => (
            <div key={s.year} className="flex justify-between border-b border-dashed py-1">
              <span className="text-muted-foreground">Year {s.year}</span>
              <span className="font-medium">{formatINR(s.value)}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-5 font-semibold">Annexure D: Power Purchase Arrangement</h2>
        <p className="mt-1 text-foreground/85">
          The Project operates under a long-term Power Purchase Agreement (RESCO model) between the Project owner and the
          Hosting Partner. GridKavach passes the PPA value to the Investor as Fixed Monthly Credits and upside Credits, and
          stands behind the GridKavach Assurance. Investors hold no direct rights under the PPA.
        </p>

        <h2 className="mt-5 font-semibold">2. Electronic Execution</h2>
        <p className="mt-1 text-foreground/85">
          The Investor electronically accepted this Agreement on the Platform at the time above, from IP {b.acceptedIp}.
          This electronic record is valid under the Information Technology Act, 2000 and does not require physical or
          digital signatures.
        </p>

        <div className="mt-6 grid gap-4 rounded-lg bg-muted/50 p-4 text-[12px] sm:grid-cols-2">
          <div>
            <p className="font-semibold">For GridKavach</p>
            <p className="mt-1 text-muted-foreground">{data.brand.legalName}</p>
            <p className="mt-3 font-mono text-[10px] leading-snug text-muted-foreground">
              Authorised signatory (recorded electronically)
            </p>
          </div>
          <div>
            <p className="font-semibold">For the Investor</p>
            <p className="mt-1 text-muted-foreground">{data.investor.name}</p>
            <p className="mt-3 font-mono text-[10px] leading-snug text-muted-foreground">
              e-Acceptance · {b.ref} · {new Date(b.acceptedAt).toISOString()}
            </p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-dashed p-3 text-center">
          <p className="text-[10px] text-muted-foreground">SHA-256 document fingerprint</p>
          <p className="mt-0.5 break-all font-mono text-[10.5px] font-medium">{b.docHash}</p>
        </div>
        <p className="mt-5 text-center text-[10.5px] text-muted-foreground">
          Governing law: India · Courts at {data.brand.jurisdiction} · Grievances: {data.brand.supportEmail}
        </p>
      </div>
    </div>
  );
}
