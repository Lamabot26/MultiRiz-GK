"use client";

import { useApp } from "@/store/app";
import { BRAND } from "@/lib/brand";
import {
  Target, PanelTop, MapPin, Layers, ClipboardList, Info, Wrench,
  ShieldCheck, FileSearch, IndianRupee, ListChecks, Landmark,
  MessageCircle, HeartPulse, Scale, Mail, ArrowRight,
} from "lucide-react";

/* ============================================================
   Safety: GridKavach's layered-protection page:
   the plant → the project → the platform → the rules.
   ============================================================ */

function SectionHead({
  icon: Icon,
  title,
  sub,
  tone,
}: {
  icon: typeof PanelTop;
  title: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <Icon className={`mt-1 h-9 w-9 shrink-0 ${tone}`} />
      <div>
        <h2 className={`text-2xl font-bold sm:text-3xl ${tone}`}>{title}</h2>
        <p className={`mt-1 text-sm font-semibold sm:text-base ${tone}`}>{sub}</p>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-6 sm:p-7">
      <h3 className="text-xl font-bold text-blue-950 sm:text-2xl">{title}</h3>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-xl border bg-muted/50 px-4 py-3.5">
      <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 fill-slate-500 text-white" />
      <p className="text-sm font-semibold leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

const LEVELS = [
  { n: "1.", text: "The plant itself: module quality, warranties and insured hardware", tone: "text-blue-600" },
  { n: "2.", text: "The project around it: escrow funding, hosting terms and upkeep", tone: "text-orange-600" },
  { n: "3.", text: "The platform on top: transparent flows and regulated payments", tone: "text-indigo-600" },
];

export function SafetyPage() {
  const setView = useApp((s) => s.setView);
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
      {/* header */}
      <div className="flex items-start gap-4">
        <Target className="mt-1 h-10 w-10 shrink-0 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-blue-600 sm:text-4xl">How we protect your investment</h1>
          <p className="mt-1 text-base font-semibold text-blue-500">Layered safeguards, from hardware to your bill</p>
        </div>
      </div>

      {/* approach */}
      <div className="mt-8 rounded-2xl border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-blue-950">How we think about risk</h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          A solar reservation passes through many hands: a manufacturer, an installer, a DISCOM, a host site and our
          own platform. We map every one of those touchpoints, name what could go wrong at each, and put a specific
          control in place, then publish it here so you can hold us to it.
        </p>
        <ol className="mt-6 space-y-5">
          {LEVELS.map((l, i) => (
            <li key={i} className={`text-lg font-bold ${l.tone}`}>
              {l.n} {l.text}
            </li>
          ))}
        </ol>
      </div>

      {/* ============ PRODUCT ============ */}
      <div className="mt-14">
        <SectionHead icon={PanelTop} title="The plant" sub="Hardware and output guarantees" tone="text-blue-600" />
      </div>
      <div className="mt-6 space-y-6">
        <Card title="All panels are insured and warranted">
          <p>
            All solar modules used across listed projects have power output warranties that run for 20+ years. If the
            minimum power drops lower than the stated threshold (typically &lt; 85%), the warranty ensures replacement
            of the system.
          </p>
          <p>Furthermore, all systems are insured to protect them from damages, fire and theft.</p>
          <InfoNote>
            You can find specific details pertaining to the project by requesting access to project reports.
          </InfoNote>
        </Card>

        <Card title="Quality of components">
          <p>
            All modules in use for Digital Solar are high grade mono-crystalline panels that rank above the herd when
            it comes to efficiency and performance.
          </p>
          <p>
            We use components that are approved by the Ministry of New and Renewable Energy (MNRE). We have made our
            bill of materials public and we highly encourage you to get it cross-checked by a solar expert to base the
            quality of the system.
          </p>
        </Card>

        <Card title="Inference math is open for checks">
          <p>
            We have made public our inference data, simulated data on how much power panels generate in a given
            location and the forecasts on savings. Each project page publishes its P90/P50 yields, and the Secured
            Generation level (75% of P90) that powers the GridKavach Assurance is derived straight from this math.
          </p>
        </Card>

        <Card title="Real-time performance is always visible">
          <p>
            Anyone checking out our projects can always see how much power is generated on a minute-by-minute basis.
            Since this is fundamental to how much credit gets allotted, essentially everyone gets to be above board
            regarding how the panels are functioning. Investors can additionally view the entire historical data of
            the performance of their reserved Digital Solar from the dashboard.
          </p>
          <div className="mt-4 rounded-2xl border bg-white p-4">
            <p className="text-sm font-bold text-blue-950">Active power generation info</p>
            <svg viewBox="0 0 280 90" className="mt-2 h-24 w-full">
              <path
                d="M0 82 C 20 80, 35 74, 50 62 S 85 26, 105 28 S 140 60, 160 50 S 195 10, 215 18 S 250 52, 280 24"
                fill="none" stroke="oklch(0.623 0.214 259.815)" strokeWidth="2.5" strokeLinecap="round"
              />
              <path
                d="M0 82 C 20 80, 35 74, 50 62 S 85 26, 105 28 S 140 60, 160 50 S 195 10, 215 18 S 250 52, 280 24 L 280 90 L 0 90 Z"
                fill="oklch(0.623 0.214 259.815 / 0.15)"
              />
            </svg>
            <div className="mt-1 grid grid-cols-3 divide-x text-center">
              <div><p className="text-sm font-bold text-blue-950">31 kWh</p><p className="text-[10px] text-muted-foreground">Production Today</p></div>
              <div><p className="text-sm font-bold text-blue-950">9.61 kW</p><p className="text-[10px] text-muted-foreground">Current Output</p></div>
              <div><p className="text-sm font-bold text-blue-950">16:00</p><p className="text-[10px] text-muted-foreground">Last Recorded</p></div>
            </div>
          </div>
          <p className="text-sm italic">Find this nested inside the project details page.</p>
        </Card>
      </div>

      {/* ============ PROJECT ============ */}
      <div className="mt-14">
        <SectionHead icon={MapPin} title="The project" sub="Hosting, funding & upkeep protections" tone="text-orange-600" />
      </div>
      <div className="mt-6 space-y-6">
        <Card title="Comprehensive operations checklist (AMC by GridKavach)">
          <p>
            GridKavach is directly responsible for the Annual Maintenance Contract (AMC) of every listed plant. We
            follow a meticulous maintenance checklist that our ground partners must adhere to. Since panel surfaces
            need to be clean from dust and other obstructions, all sites have cleaning scheduled fortnightly.
            Periodically, inspection of components and related activities are conducted as well.
          </p>
          <p>
            This care is funded by the project owner, never by investors: the AMC is billed to the owner at ₹1,200
            per kW per year, and GridKavach Assurance and asset insurance are billed at ₹999 per kW per year. The
            checklist below stays enforced on every site for the full tenure because our own service fees depend on
            the plant performing.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-[11px] sm:text-xs">
              <thead className="bg-muted/70 font-semibold text-blue-950">
                <tr>
                  <th className="px-3 py-2">Mechanical maintenance</th>
                  <th className="px-2 py-2 text-center">Fortnightly</th>
                  <th className="px-2 py-2 text-center">Monthly</th>
                  <th className="px-2 py-2 text-center">Quarterly</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["Visually check array for broken/loose/missing modules, loose racking hardware, unsecured wiring or MC4 connectors", "✕", "", ""],
                  ["Mechanical cleaning of modules with water and squeegees (minimum 18 cycles/year, more as required to maintain guaranteed PR)", "✕", "", ""],
                  ["Visually check all DC disconnects and combiners: blown fuses, corrosion, heat distortion, moisture entry, insect or rodent issues", "", "✕", ""],
                  ["Visually inspect roof for damage / moisture entry points", "", "✕", ""],
                  ["Check for grounding continuity between frames and racking structure", "", "", "✕"],
                  ["Visual check for corrosion between copper wires and PV frames and galvanized steel racking structure", "", "✕", ""],
                ].map((row, i) => (
                  <tr key={i} className="align-top">
                    <td className="px-3 py-2 text-muted-foreground">{row[0]}</td>
                    <td className="px-2 py-2 text-center font-bold text-orange-600">{row[1]}</td>
                    <td className="px-2 py-2 text-center font-bold text-orange-600">{row[2]}</td>
                    <td className="px-2 py-2 text-center font-bold text-orange-600">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm italic">A snapshot of the maintenance checklist we manage with our ground partners.</p>
        </Card>

        <Card title="Prompt maintenance notifications">
          <p>
            While the operational checklist is more for the partners, users are also provided with information
            regarding these operational activities over the project communities (exclusive to the users of the
            specific project and can join only through the dashboard) and WhatsApp.
          </p>
          <p>
            Panels are cleaned once in two weeks. In certain months we increase the cleaning frequency if required as
            well. All updates, including after-cleaning snapshots, are shared with investors.
          </p>
        </Card>

        <Card title="Visibility to host due diligence">
          <p>
            At the upper limit, these projects are managed for around 15 years, hence it&apos;s important to ensure the
            hosts we select have the financial security to pay for solar power for the subscription duration.
          </p>
          <p>
            With housing societies and institutions, we evaluate a collection of parameters such as occupancy rates,
            collective corpus fund size and on-time vendor payment frequencies. For commercial enterprises, we take a
            step further and take their credit-ratings into account.
          </p>
          <InfoNote>
            You can find specific details pertaining to the project by requesting access to project reports.
          </InfoNote>
        </Card>

        <Card title="Deemed Generation for unused power">
          <p>
            In case the host shuts down power, for instance to conduct maintenance, the downtime is accounted for as
            deemed generation in the power purchase agreement. This means users are protected from these downtimes and
            still could collect credit benefits for the expected power output.
          </p>
          <p>The deemed generation can be found in the schedules or annexure section of the project specific PPAs.</p>
        </Card>

        <Card title="Secured Power Generation">
          <p>
            Secured Generation is the power output from a solar project that GridKavach ensures the developers
            guarantee. This is expressed in two phases:
          </p>
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <strong className="text-blue-950">On a monthly level:</strong> On the off chance that power output dips
              below this level (set at 75% of the forecast value for the month, which varies month to month based on
              seasonality), users would be compensated for the deficit through proportional addition of buffer
              credits.
            </li>
            <li>
              <strong className="text-blue-950">On a half-yearly basis:</strong> Every 6 months (count starts from the
              month the plant is listed on the platform) the performance of the plant is reviewed and if the
              generation is below 100% of the aggregated forecast value, buffer credits are released to balance out
              the deficit.
            </li>
          </ol>
          <InfoNote>
            You can find this and other user protection clauses in our Digital Solar Service Agreement on the project
            details page.
          </InfoNote>
        </Card>

        <Card title="Host Payment Security">
          <p>
            For all the projects we install, we collect a security deposit or instruments of similar function,
            estimating around 6 months of power bill value. That way in case there is a delay in payments due to any
            reason, users would get the credits for the generated power. Additionally, there is a penalty structure
            integrated into the PPA (power purchase agreement) in case of payment delays.
          </p>
        </Card>

        <Card title="Delisting a project">
          <p>
            In case any projects severely underperform or we have to exit the project due to host-level or
            platform-level issues, we have a multi-dimensional approach to resolve for:
          </p>
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              <strong className="text-blue-950">Reservation Transfer:</strong> When a plant has been tagged for
              exiting, the users who have a reservation on the particular plant are immediately transferred to another
              project of similar parameter, like credit rate, tenure etc., at no cost to the customer. Reservations
              will be mapped and rebalanced in such a manner that the performance yields and annualised savings
              (XIRR) remain unchanged for the user.
            </li>
            <li>
              <strong className="text-blue-950">Buyback:</strong> Every PPA comes with a buyback clause for the host
              location where the plant is installed to purchase the asset as per the pre-determined net-present value
              of the asset. When a buyback is triggered, reservation transfer gets activated or users get a refund
              such that credits received till date + refund value = 12% XIRR on their reservation.
            </li>
            <li>
              <strong className="text-blue-950">Asset Transfer:</strong> When we onboard solar developers to
              operationalize a plant, we ensure that the developer has a sufficient pipeline of projects in the same
              vicinity to ensure that the plant can be transferred to a new location and continue generation. In the
              interim where the transfer happens, the security instruments are leveraged to ensure credit disbursal
              under deemed generation continues without hurdles.
            </li>
            <li>
              <strong className="text-blue-950">Asset Sale:</strong> Since all reservations have an underlying
              physical asset, instead of buyback to the host, we may trade the PPA or hardware in secondary markets at
              net-present value and the retrieved value is disbursed pro-rata. The refund mechanics will be the same
              as a buyback.
            </li>
          </ol>
        </Card>
      </div>

      {/* ============ PLATFORM ============ */}
      <div className="mt-14">
        <SectionHead icon={Layers} title="The platform" sub="Transparency built into the interface" tone="text-indigo-600" />
      </div>
      <div className="mt-6 space-y-6">
        <Card title="Buffer Credits">
          <p>
            Buffer credits are secondary credits beyond generation credits that are disbursed to the customer for
            generation shortfalls as mentioned in the Secured Generation and Deemed Generation sections. They are also
            used during the curing period of newly listed plants where the data-loggers to track plant generation have
            not yet been activated.
          </p>
        </Card>

        <Card title="Escrow-protected funding">
          <p>
            Every rupee reserved towards a project is parked in that project&apos;s dedicated Project Escrow Account,
            ring-fenced per project, released only against verified execution milestones, and refunded in full if a
            project does not proceed. GridKavach does not commingle project monies with its own revenues.
          </p>
        </Card>

        <Card title="Zero-hassle utility payments">
          <p>
            Sometimes we often come across, in bill payment apps like Google Pay or PayTM, utility server related
            issues causing payment failures. We have developed a notification and collection system that collects the
            necessary dues and connects to the biller when servers get operational, making it hassle-free for our
            users.
          </p>
        </Card>

        <Card title="Community Stewardship">
          <p>
            We believe for the best of community solar, not only should better solar access exist, but also community
            tools that can enable users to become stewards of their solar. Community forums and project-exclusive
            groups enable all users to discuss and communicate with the team as well as between each other about
            project activity, billing related stuff and take collective decisions if required.
          </p>
        </Card>

        <Card title="Health Tracking Reports">
          <p>
            Every month, our users get a report over WhatsApp and email on how the solar system has been faring and an
            overview into the performance and credits generated for that period from all the systems they have
            reservations in, collectively.
          </p>
          <div className="mt-4 rounded-2xl bg-blue-950 p-5 text-white">
            <p className="text-sm font-semibold text-blue-100/80">GridKavach · Monthly Report</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-[11px] text-blue-100/70">Capacity Reserved</p>
                <p className="text-xl font-bold">3,072 W</p>
              </div>
              <div className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-[11px] text-blue-100/70">Available Credits</p>
                <p className="text-xl font-bold">₹720.50</p>
              </div>
              <div className="col-span-2 space-y-2 rounded-xl bg-white/10 px-4 py-3 text-sm">
                <div className="flex justify-between"><span className="text-blue-100/80">Credits Earned</span><span className="font-bold">₹2,333.36</span></div>
                <div className="flex justify-between"><span className="text-blue-100/80">Energy Generated</span><span className="font-bold">453.08 kWh</span></div>
                <div className="flex justify-between"><span className="text-blue-100/80">Carbon Offset</span><span className="font-bold">407.77 kgs</span></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* ============ POLICY ============ */}
      <div className="mt-14">
        <SectionHead icon={Scale} title="The rules" sub="Regulatory alignment & compliance" tone="text-blue-700" />
      </div>
      <div className="mt-6 space-y-6">
        <Card title="For generating solar power">
          <p>
            All solar projects are built as per regulatory mandates of CERC (Central Electricity Regulatory Commission)
            and its state-wise nodal agencies.
          </p>
          <p>
            Furthermore, credit generation and accounting is done as per standards determined for captive solar power
            production by the regulators and we operate grid-tied systems only in jurisdictions made permissible for
            third-party investment models.
          </p>
        </Card>

        <Card title="For using credits on power bills">
          <p>
            The application of credits and billing of power is done via BBPS (Bharat BillPay) in accordance to rules
            and guidelines set by NPCI (National Payments Corporation of India) and managed through a BBPOU certified
            banking partner.
          </p>
        </Card>

        <Card title="For storing credits">
          <p>
            The wallets on GridKavach follow closed PPI (prepaid payment instrument) architecture mandated by the RBI.
          </p>
        </Card>
      </div>

      {/* ============ REACH OUT ============ */}
      <div className="mt-14">
        <SectionHead icon={MessageCircle} title="Still have questions?" sub="Our team is happy to walk you through any of these safeguards" tone="text-amber-500" />
      </div>
      <div className="mt-6 rounded-2xl border bg-card p-6 sm:p-7">
        <h3 className="text-xl font-bold text-blue-950 sm:text-2xl">Conversations make for better products</h3>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          We love to listen; and anything goes, both feedback and criticism. If there are aspects of building digital
          solar that can be made better or are currently inadequate, we would love to brainstorm it with you. Connect
          with us over email → {BRAND.supportEmail} for a nuanced discussion.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setView("contact")}
            className="inline-flex items-center gap-2 rounded-full bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
          >
            <Mail className="h-4 w-4" /> Contact Us <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <InfoNote>
          Couldn&apos;t find what you were looking for? Check the{" "}
          <button onClick={() => setView("home")} className="font-bold text-blue-700 underline">FAQs on our home page</button>.
        </InfoNote>
      </div>
    </div>
  );
}
