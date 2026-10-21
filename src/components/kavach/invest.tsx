"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { BRAND, computeQuote, formatINR, formatNum, LIMITS } from "@/lib/brand";
import { DSA, PPA_SUMMARY } from "@/lib/legal";
import {
  ArrowLeft, ArrowRight, CheckCircle2, FileText, Loader2, Lock,
  MapPin, ScrollText, ShieldCheck, Sparkles, Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StepProps {
  step: number;
  setStep: (n: number) => void;
}

const STEP_LABELS = ["Reservation", "Review Agreement", "PPA & Accept", "Confirmed"];

/* ================= WIZARD ================= */

export function InvestWizard() {
  const { investIntent, user, clearInvestIntent, setView } = useApp();
  const [step, setStep] = useState(0);
  const [projectMeta, setProjectMeta] = useState<{
    id: string; name: string; code: string; location: string; state: string;
    pricePerKw: number; creditsPerKwh: number; p90KwhPerKw: number;
    tenureMonths: number; annualDegradation: number; availableKw: number; utility: string;
  } | null>(null);
  const [amount, setAmount] = useState<number>(25000);
  const [utilityName, setUtilityName] = useState("");
  const [consumerNumber, setConsumerNumber] = useState("");
  const [dsaRead, setDsaRead] = useState(false);
  const [dsaAgree, setDsaAgree] = useState(false);
  const [ppaRead, setPpaRead] = useState(false);
  const [ppaAgree, setPpaAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booking, setBooking] = useState<{
    ref: string; id: string; capacityWatts: number; totalPayable: number;
    monthlyCredit: number; docHash: string; agreementVersion: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      setUtilityName(user.utilityName ?? "");
      setConsumerNumber(user.consumerNumber ?? "");
    }
  }, [user]);

  useEffect(() => {
    const pid = investIntent?.projectId;
    if (!pid) return;
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => {
        const p = (d.projects ?? []).find((x: { id: string }) => x.id === pid);
        if (p) {
          setProjectMeta(p);
          if (investIntent?.amount) setAmount(Math.min(investIntent.amount, Math.floor(p.availableKw * p.pricePerKw)));
        }
      })
      .catch(() => {});
  }, [investIntent]);

  const quote = useMemo(() => {
    if (!projectMeta) return null;
    return computeQuote({
      investment: amount,
      pricePerKw: projectMeta.pricePerKw,
      creditsPerKwh: projectMeta.creditsPerKwh,
      p90KwhPerKw: projectMeta.p90KwhPerKw,
      tenureMonths: projectMeta.tenureMonths,
      degradationPct: projectMeta.annualDegradation,
    });
  }, [projectMeta, amount]);

  if (!investIntent || !projectMeta || !quote || !user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Preparing your reservation…</p>
        {!investIntent && (
          <Button variant="outline" className="mt-6" onClick={() => setView("projects")}>
            Browse projects
          </Button>
        )}
      </div>
    );
  }

  const canNext0 = quote.amount >= LIMITS.minInvestment && quote.amount <= LIMITS.maxInvestment &&
    quote.capacityKw <= projectMeta.availableKw + 1e-9 &&
    utilityName.trim().length > 1 && consumerNumber.trim().length > 2;

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectMeta!.id,
          investment: amount,
          agreeDSA: true,
          agreePPA: true,
          utilityName,
          consumerNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Booking failed", description: data.error ?? "Please try again.", variant: "destructive" });
        return;
      }
      setBooking(data.booking);
      setStep(3);
      window.scrollTo({ top: 0 });
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function finish() {
    clearInvestIntent();
    setView("dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      {/* stepper */}
      <ol className="mb-8 flex items-center gap-1.5 text-xs sm:gap-3">
        {STEP_LABELS.map((l, i) => (
          <li key={i} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                i < step ? "bg-blue-600 text-white" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? "✓" : i + 1}
            </span>
            <span className={cn("hidden font-medium sm:block", i === step ? "text-foreground" : "text-muted-foreground")}>{l}</span>
            {i < STEP_LABELS.length - 1 && <span className="h-px flex-1 bg-border" />}
          </li>
        ))}
      </ol>

      {/* ============ STEP 0: RESERVATION ============ */}
      {step === 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border bg-card p-6">
            <h1 className="text-xl font-bold">Reserve your solar share</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {projectMeta.name} · {projectMeta.code}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {projectMeta.location}, {projectMeta.state} · {projectMeta.utility}
            </p>

            <div className="mt-6 grid gap-4">
              <div>
                <Label htmlFor="inv-amt">Reservation amount (₹1,000 to ₹1,00,000)</Label>
                <Input
                  id="inv-amt"
                  type="number"
                  min={LIMITS.minInvestment}
                  max={LIMITS.maxInvestment}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(LIMITS.minInvestment, Math.min(LIMITS.maxInvestment, Number(e.target.value) || LIMITS.minInvestment)))}
                  className="mt-1.5 h-12 text-lg font-semibold"
                />
                <input
                  type="range"
                  min={LIMITS.minInvestment}
                  max={LIMITS.maxInvestment}
                  step={500}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-3 w-full accent-blue-600"
                  aria-label="Amount slider"
                />
                {quote.amount > projectMeta.availableKw * projectMeta.pricePerKw && (
                  <p className="mt-1.5 text-xs font-medium text-destructive">
                    Only {formatNum(projectMeta.availableKw * 1000, 0)} W available; please reduce the amount.
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="util">Your electricity board (DISCOM)</Label>
                  <Input id="util" value={utilityName} onChange={(e) => setUtilityName(e.target.value)} placeholder="e.g. TPCODL, MSEDCL, BESCOM" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cons">Consumer number</Label>
                  <Input id="cons" value={consumerNumber} onChange={(e) => setConsumerNumber(e.target.value)} placeholder="On your electricity bill" className="mt-1.5" />
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Your monthly credits will be adjusted against this utility account through our Bill Payment Service.
                You can update these details anytime from your dashboard.
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setView("projects")}>Cancel</Button>
              <Button
                className="ml-auto gap-2"
                disabled={!canNext0}
                onClick={() => { setStep(1); window.scrollTo({ top: 0 }); }}
              >
                Review agreement <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <QuotePanel quote={quote} projectName={projectMeta.name} />
        </div>
      )}

      {/* ============ STEP 1: DSA ============ */}
      {step === 1 && (
        <AgreementReviewStep
          title={<><ScrollText className="h-5 w-5 text-primary" /> Review: Digital Solar Service Agreement</>}
          subtitle="The complete paperless contract you are entering into with GridKavach (operated by Sreesamvridhi Enterprises Private Limited). Scroll through the full text to continue."
          doc={DSA}
          docMeta={`Version ${BRAND.agreementVersion} · applies to ${projectMeta.name} (${projectMeta.code})`}
          read={dsaRead}
          setRead={setDsaRead}
          agree={dsaAgree}
          setAgree={setDsaAgree}
          agreeLabel="I have read and accept the Digital Solar Service Agreement, including Annexures A-D"
          onBack={() => { setStep(0); window.scrollTo({ top: 0 }); }}
          onNext={() => { setStep(2); window.scrollTo({ top: 0 }); }}
        />
      )}

      {/* ============ STEP 2: PPA + ACCEPT ============ */}
      {step === 2 && (
        <div>
          <AgreementReviewStep
            title={<><FileText className="h-5 w-5 text-primary" /> Review: PPA Summary (Annexure D)</>}
            subtitle="How the underlying Power Purchase Agreement backs your reservation. GridKavach holds the PPA; your rights flow from the Service Agreement."
            doc={PPA_SUMMARY}
            docMeta={`Annexure D to ${BRAND.agreementVersion} · ${projectMeta.name}`}
            read={ppaRead}
            setRead={setPpaRead}
            agree={ppaAgree}
            setAgree={setPpaAgree}
            agreeLabel="I acknowledge the PPA summary and confirm my reservation"
            onBack={() => { setStep(1); window.scrollTo({ top: 0 }); }}
            onNext={submit}
            nextLabel={submitting ? "Sealing your contract…" : "Accept & reserve digitally"}
            nextDisabled={submitting}
            nextIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            footer={
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs leading-relaxed text-blue-900">
                <p className="font-semibold">What happens when you accept:</p>
                <p className="mt-1">
                  Your acceptance is recorded with a booking reference (GK-…) and sealed with a SHA-256 fingerprint,
                  a valid electronic record under the IT Act, 2000. Your executed contract appears instantly in your dashboard.
                  Amount payable today: <strong>{formatINR(quote.totalPayable, 2)}</strong> (invoiced electronically),
                  credited to the dedicated <strong>{projectMeta.name} Escrow Account</strong>.
                </p>
              </div>
            }
          />
        </div>
      )}

      {/* ============ STEP 3: SUCCESS ============ */}
      {step === 3 && booking && (
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border bg-card p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <CheckCircle2 className="h-9 w-9 text-blue-600" />
            </div>
            <h1 className="mt-5 text-2xl font-bold">Reservation confirmed. Welcome to the grid.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatNum(booking.capacityWatts, 0)} W of {projectMeta.name} is now yours, fully paperless.
            </p>

            <div className="mt-6 rounded-2xl bg-muted/60 p-5 text-left text-sm">
              <Row label="Booking reference" value={<span className="font-mono font-semibold">{booking.ref}</span>} />
              <Row label="Fixed monthly credit" value={<span className="font-semibold text-blue-700">{formatINR(booking.monthlyCredit)}/month</span>} />
              <Row label="Total payable" value={formatINR(booking.totalPayable, 2)} />
              <Row label="Agreement version" value={booking.agreementVersion} />
              <Row
                label="Document fingerprint (SHA-256)"
                value={<span className="break-all font-mono text-[11px]">{booking.docHash}</span>}
                last
              />
            </div>

            <div className="mt-6 space-y-2.5 text-left text-sm text-muted-foreground">
              {[
                "Electronic invoice issued. No physical documents, ever.",
                `Your funds are now held in the ${projectMeta.name} Escrow Account and released against verified execution milestones.`,
                "Once the plant is live, your first Fixed Monthly Credit appears at the next metering cycle, auto-adjusted against your bill.",
              ].map((t, i) => (
                <p key={i} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> {t}
                </p>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1" onClick={finish}>Go to dashboard</Button>
              <Button className="flex-1 gap-2" onClick={finish}>
                <Zap className="h-4 w-4" /> View my contract
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, last }: { label: string; value: React.ReactNode; last?: boolean }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-2", !last && "border-b border-border/70")}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}

function QuotePanel({ quote, projectName }: { quote: NonNullable<ReturnType<typeof computeQuote>>; projectName: string }) {
  return (
    <div className="h-fit rounded-2xl border bg-card p-6 lg:sticky lg:top-24">
      <h2 className="font-semibold">Your reservation summary</h2>
      <p className="text-sm text-muted-foreground">{projectName}</p>
      <div className="mt-4 space-y-2.5 text-sm">
        <Row label="Reserved capacity" value={<strong>{formatNum(quote.capacityWatts, quote.capacityWatts < 1000 ? 1 : 0)} W</strong>} />
        <Row label="Fixed monthly credit" value={<strong className="text-blue-700">{formatINR(quote.monthlyCredit)}</strong>} />
        <Row label="Monthly units secured" value={`${formatNum(quote.securedKwhYear1 / 12, 1)} kWh`} />
        <Row label="Annual savings (Yr 1)" value={formatINR(quote.annualSavingsYear1)} />
        <Separator className="my-3" />
        <Row label="Capacity cost" value={formatINR(quote.amount, 2)} />
        <Row label="Onboarding fee (1%)" value={formatINR(quote.onboardingFee, 2)} />
        <Row label="GST (12%)" value={formatINR(quote.gstAmount, 2)} />
        <Row label={<span>Total payable today</span>} value={<strong>{formatINR(quote.totalPayable, 2)}</strong>} last />
      </div>
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800 ring-1 ring-amber-200">
        <ShieldCheck className="mb-0.5 mr-1 inline h-3.5 w-3.5" />
        Fixed credit is guaranteed at Secured Generation (75% of P90). Shortfalls are auto-topped-up under the GridKavach Assurance.
        Your payment is held in the project&apos;s dedicated escrow account, released against execution milestones.
      </p>
    </div>
  );
}

/* ================= agreement review step ================= */

function AgreementReviewStep({
  title, subtitle, doc, docMeta, read, setRead, agree, setAgree,
  agreeLabel, onBack, onNext, nextLabel = "Continue", nextDisabled, nextIcon, footer,
}: {
  title: React.ReactNode;
  subtitle: string;
  doc: typeof DSA;
  docMeta: string;
  read: boolean;
  setRead: (v: boolean) => void;
  agree: boolean;
  setAgree: (v: boolean) => void;
  agreeLabel: string;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextIcon?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function onScroll() {
    const el = scrollRef.current;
    if (!el || read) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setRead(true);
  }

  return (
    <div>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="kg-scroll mt-5 max-h-[420px] overflow-y-auto rounded-2xl border bg-card p-6"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{docMeta}</p>
        <h2 className="mt-1 text-lg font-bold">{doc.title}</h2>
        <div className="mt-4 space-y-3">
          {doc.preamble.map((p, i) => (
            <p key={`pre-${i}`} className="text-[13px] leading-relaxed text-foreground/90">{p}</p>
          ))}
        </div>
        {doc.clauses.map((c, i) => (
          <div key={`cl-${i}`} className="mt-6">
            <h3 className="text-[15px] font-semibold text-foreground">{c.heading}</h3>
            <div className="mt-2 space-y-2">
              {c.body.map((b, j) =>
                b.startsWith("• ") ? (
                  <p key={j} className="ml-4 border-l-2 border-blue-200 pl-3 text-[13px] leading-relaxed text-foreground/85">{b.slice(2)}</p>
                ) : (
                  <p key={j} className="text-[13px] leading-relaxed text-foreground/85">{b}</p>
                )
              )}
            </div>
          </div>
        ))}
        <div className="mt-6 rounded-lg bg-muted/60 p-4 text-center text-xs text-muted-foreground">
          End of document · {docMeta}
        </div>
      </div>

      {!read && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ScrollText className="h-3.5 w-3.5" /> Scroll to the end of the document to enable acceptance.
        </p>
      )}

      <div className={cn("mt-4 rounded-2xl border p-5 transition-opacity", !read && "opacity-60")}>
        <label className="flex cursor-pointer items-start gap-3">
          <Checkbox checked={agree} onCheckedChange={(v) => setAgree(v === true)} disabled={!read} className="mt-0.5" />
          <span className="text-sm leading-relaxed">{agreeLabel}</span>
        </label>
        {footer && <div className="mt-4">{footer}</div>}
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            className="ml-auto gap-2"
            disabled={!read || !agree || nextDisabled}
            onClick={onNext}
          >
            {nextIcon ?? <ArrowRight className="h-4 w-4" />} {nextLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
