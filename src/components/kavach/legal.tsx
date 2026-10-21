"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DSA, PPA_SUMMARY, TERMS, PRIVACY, type LegalDoc } from "@/lib/legal";
import { BRAND, LIMITS, formatINR, formatNum } from "@/lib/brand";
import { ArrowLeft, Mail, MapPin, Phone, Sun, ShieldCheck, FileText, Leaf, Users, Printer, Landmark } from "lucide-react";

interface ProjectCtx {
  id: string;
  code: string;
  name: string;
  hostSociety: string;
  location: string;
  state: string;
  utility: string;
  capacityKw: number;
  creditsPerKwh: number;
  pricePerKw: number;
  p90KwhPerKw: number;
}

function useProjectContext(): ProjectCtx | null {
  const selectedProjectId = useApp((s) => s.selectedProjectId);
  const [project, setProject] = useState<ProjectCtx | null>(null);
  useEffect(() => {
    if (!selectedProjectId) return;
    let cancelled = false;
    fetch(`/api/projects/${selectedProjectId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (!cancelled) setProject(d.project ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);
  return project;
}

function ProjectDocBanner({ project, doc }: { project: ProjectCtx; doc: "agreement" | "ppa" }) {
  const openProject = useApp((s) => s.openProject);
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <Landmark className="h-3.5 w-3.5" /> Project-specific document
          </p>
          <h2 className="mt-1.5 text-lg font-bold text-amber-900">{project.name} · {project.code}</h2>
          <p className="mt-1 text-sm leading-relaxed text-amber-900/80">
            {doc === "agreement"
              ? `This Service Agreement applies to your booking in ${project.name}. Project-specific values (capacity ${formatNum(project.capacityKw, 2)} kW, price ${formatINR(project.pricePerKw)}/kW, credit rate ₹${project.creditsPerKwh.toFixed(2)}/kWh and P90 ${formatNum(project.p90KwhPerKw)} kWh/kW/yr) are stated in Annexures A & B.`
              : `This PPA summary describes the power purchase arrangement backing ${project.name}, hosted by ${project.hostSociety}, ${project.location} (${project.utility}).`}
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 border-amber-300 bg-white/60 hover:bg-white" onClick={() => openProject(project.id)}>
          <ArrowLeft className="h-4 w-4" /> Back to project
        </Button>
      </div>
    </div>
  );
}

function DocHeader({ title, subtitle, projectId }: { title: string; subtitle: string; projectId?: string }) {
  const setView = useApp((s) => s.setView);
  const openProject = useApp((s) => s.openProject);
  return (
    <div className="mb-6">
      {projectId ? (
        <Button variant="ghost" className="-ml-2 mb-4 gap-2" onClick={() => openProject(projectId)}>
          <ArrowLeft className="h-4 w-4" /> Back to project
        </Button>
      ) : (
        <Button variant="ghost" className="-ml-2 mb-4 gap-2" onClick={() => setView("home")}>
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Button>
      )}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function LegalDocView({ doc }: { doc: LegalDoc }) {
  return (
    <article className="rounded-2xl border bg-card p-6 sm:p-10">
      <h2 className="text-xl font-bold">{doc.title}</h2>
      <div className="mt-4 space-y-3">
        {doc.preamble.map((p, i) => (
          <p key={`p-${i}`} className="text-sm leading-relaxed text-foreground/90">{p}</p>
        ))}
      </div>
      {doc.clauses.map((c, i) => (
        <section key={`c-${i}`} className="mt-8">
          <h3 className="text-base font-semibold">{c.heading}</h3>
          <div className="mt-2.5 space-y-2.5">
            {c.body.map((b, j) =>
              b.startsWith("• ") ? (
                <p key={j} className="ml-4 border-l-2 border-blue-200 pl-3 text-sm leading-relaxed text-foreground/85">{b.slice(2)}</p>
              ) : (
                <p key={j} className="text-sm leading-relaxed text-foreground/85">{b}</p>
              )
            )}
          </div>
        </section>
      ))}
      <div className="mt-10 border-t pt-6 text-center">
        <Button variant="outline" className="gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </Button>
      </div>
    </article>
  );
}

export function AgreementPage() {
  const project = useProjectContext();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <DocHeader
        projectId={project?.id}
        title="Digital Solar Service Agreement"
        subtitle={`The paperless contract between you and ${BRAND.legalName} (GridKavach), executed at the individual project level. This is the exact agreement you review and accept inside every project's booking, complete with annexures covering project configuration, secured generation and buy-back values.`}
      />
      {project && <ProjectDocBanner project={project} doc="agreement" />}
      <LegalDocView doc={DSA} />
    </div>
  );
}

export function PpaPage() {
  const project = useProjectContext();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <DocHeader
        projectId={project?.id}
        title="Power Purchase Agreement: Summary"
        subtitle="Each project listed on GridKavach carries its own PPA under the bankable RESCO structure: long-term power sale to the host building, novation protections, deemed-generation methodology and financing provisions."
      />
      {project && <ProjectDocBanner project={project} doc="ppa" />}
      <LegalDocView doc={PPA_SUMMARY} />
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <DocHeader title="Terms of Use" subtitle={`Rules for using ${BRAND.domain}.`} />
      <LegalDocView doc={TERMS} />
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <DocHeader title="Privacy Policy" subtitle="What we collect, why, and how we protect it." />
      <LegalDocView doc={PRIVACY} />
    </div>
  );
}

/* ---------------- about ---------------- */

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <DocHeader
        title="About GridKavach"
        subtitle={`${BRAND.tagline}: a marketplace for rooftop solar projects, operated by ${BRAND.legalName}.`}
      />
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Our mission</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">
            India has millions of rooftops sitting idle under the sun while households face some of the fastest-rising
            electricity tariffs in the world. GridKavach (<em>kavach</em>, the shield) was founded on a simple idea:
            every family should be able to turn those rooftops into protection for their monthly budget. That is why we
            built a <strong>marketplace for rooftop solar</strong>. Schools, housing societies and businesses list their
            projects; investors fund them from {formatINR(LIMITS.minInvestment)} to {formatINR(LIMITS.maxInvestment)}
            {" "}through dedicated, ring-fenced <strong>project escrow accounts</strong>; and GridKavach, the aggregator
            between the project owner and investors, executes each project with leading solar partners. The plant sells
            power under a long-term PPA, and investors earn <strong>fixed monthly credits adjusted directly against
            their electricity bill</strong>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">
            We started with investments from {formatINR(LIMITS.minInvestment)} because we believe climate-positive
            investing should not need lakhs of capital or a rooftop of your own. And we built every step (listing,
            booking, agreement, activation, credits, exits) to be fully paperless and specific to each project, because
            protecting the planet while drowning it in printed contracts never made sense to us.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <ValueCard icon={ShieldCheck} title="GridKavach Assurance" body="A fixed monthly credit at Secured Generation (75% of P90), auto-topped-up if generation dips. Your savings plan stays intact." />
          <ValueCard icon={FileText} title="Paperless by design" body="SHA-256 sealed digital agreements, electronic invoices, digital exits. The only thing we print is nothing." />
          <ValueCard icon={Landmark} title="Marketplace + escrow backbone" body="Project owners list, investors fund through ring-fenced project escrow accounts released against milestones, and GridKavach executes as the aggregator with leading solar partners." />
          <ValueCard icon={Leaf} title="Real climate impact" body="Every reserved watt displaces coal from the grid. Your dashboard tracks your personal CO₂ avoidance in real time." />
        </div>

        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <h2 className="text-xl font-semibold">The company</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground/85">
            GridKavach is operated by <strong>{BRAND.legalName}</strong>, registered at {BRAND.registeredOffice}. The
            platform combines the team&apos;s experience across solar EPC, DISCOM regulations (net metering, banking
            settlement) and consumer fintech to deliver rooftop solar as a simple monthly saving, for the project
            owners who host the plants and the investors who fund them.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat icon={Users} value="50 kWp" label="Planned capacity on the marketplace" />
            <MiniStat icon={Sun} value="1 listed" label="Project open for funding" />
            <MiniStat icon={FileText} value="0 pages" label="Paper used since day one" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-4 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1.5 text-lg font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

/* ---------------- contact ---------------- */

export function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <DocHeader
        title="Contact & Grievance Redressal"
        subtitle="Questions about reservations, credits, agreements or exits? Our team replies within one working day."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <Mail className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Email</h3>
          <p className="mt-1 text-sm text-muted-foreground">{BRAND.supportEmail}</p>
          <p className="mt-1 text-xs text-muted-foreground">Acknowledged within 48 hours, resolved within 15 days.</p>
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <Phone className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Support line</h3>
          <p className="mt-1 text-sm text-muted-foreground">{BRAND.supportPhone}</p>
          <p className="mt-1 text-xs text-muted-foreground">Mon-Sat, 9:30 am to 6:30 pm IST</p>
        </div>
        <div className="rounded-2xl border bg-card p-6 sm:col-span-2">
          <MapPin className="h-6 w-6 text-primary" />
          <h3 className="mt-3 font-semibold">Registered office</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {BRAND.legalName}, {BRAND.registeredOffice}
          </p>
          <p className="mt-3 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
            <strong>Grievance Officer:</strong> In accordance with applicable intermediary guidelines, complaints may be
            raised via the in-platform support widget or by email. Unresolved grievances escalate to arbitration under
            Clause 19.2 of the Digital Solar Service Agreement, seated at {BRAND.jurisdiction}.
          </p>
        </div>
      </div>
    </div>
  );
}
