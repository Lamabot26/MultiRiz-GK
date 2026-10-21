import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { computeQuote, makeBookingRef, LIMITS, BRAND, round2 } from "@/lib/brand";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in to reserve solar capacity." }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, investment, agreeDSA, agreePPA, utilityName, consumerNumber } = body ?? {};

    const amount = Number(investment);
    if (!projectId || !Number.isFinite(amount)) {
      return NextResponse.json({ error: "Project and investment amount are required." }, { status: 400 });
    }
    if (amount < LIMITS.minInvestment) {
      return NextResponse.json({ error: `Minimum reservation is ₹${LIMITS.minInvestment.toLocaleString("en-IN")}.` }, { status: 400 });
    }
    if (amount > LIMITS.maxInvestment) {
      return NextResponse.json({ error: `Maximum reservation is ₹${LIMITS.maxInvestment.toLocaleString("en-IN")}.` }, { status: 400 });
    }
    if (!agreeDSA || !agreePPA) {
      return NextResponse.json({ error: "You must review and accept both the Service Agreement and the PPA summary." }, { status: 400 });
    }

    const project = await db.project.findUnique({ where: { id: String(projectId) } });
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    if (project.status === "FULL") {
      return NextResponse.json({ error: "This project is fully subscribed." }, { status: 409 });
    }

    const quote = computeQuote({
      investment: amount,
      pricePerKw: project.pricePerKw,
      creditsPerKwh: project.creditsPerKwh,
      p90KwhPerKw: project.p90KwhPerKw,
      tenureMonths: project.tenureMonths,
      degradationPct: project.annualDegradation,
    });

    // capacity availability check (the amount is capacity cost, before fees)
    if (quote.capacityKw > project.availableKw + 1e-9) {
      return NextResponse.json(
        { error: `Only ${(project.availableKw * 1000).toFixed(0)} W is available in this project. Please reduce your reservation.` },
        { status: 409 }
      );
    }

    const count = await db.investment.count();
    const ref = makeBookingRef(count + 1);

    // Document fingerprint: SHA-256 of the canonical contract payload
    const payload = JSON.stringify({
      ref,
      v: BRAND.agreementVersion,
      user: { id: user.id, name: user.name, email: user.email },
      project: { code: project.code, name: project.name },
      amount: quote.amount,
      capacityWatts: quote.capacityWatts,
      totalPayable: quote.totalPayable,
      monthlyCredit: quote.monthlyCredit,
      ts: Date.now(),
    });
    const docHash = crypto.createHash("sha256").update(payload).digest("hex");

    // Persist utility details on the user if provided at booking time
    await db.user.update({
      where: { id: user.id },
      data: {
        utilityName: utilityName ? String(utilityName).trim() : user.utilityName,
        consumerNumber: consumerNumber ? String(consumerNumber).trim() : user.consumerNumber,
      },
    });

    const investmentRow = await db.investment.create({
      data: {
        ref,
        userId: user.id,
        projectId: project.id,
        amount: quote.amount,
        capacityWatts: quote.capacityWatts,
        onboardingFee: quote.onboardingFee,
        gstAmount: quote.gstAmount,
        totalPayable: quote.totalPayable,
        annualKwhP90: quote.annualKwhP90,
        securedKwhYear1: quote.securedKwhYear1,
        monthlyCredit: quote.monthlyCredit,
        status: "ACTIVE",
        agreementVersion: BRAND.agreementVersion,
        docHash,
        acceptedAt: new Date(),
        acceptedIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0",
      },
    });

    // Update project availability
    await db.project.update({
      where: { id: project.id },
      data: {
        availableKw: round2(Math.max(project.availableKw - quote.capacityKw, 0)),
        status: project.availableKw - quote.capacityKw <= 0.001 ? "FULL" : project.status,
      },
    });

    // Generate the first 3 projected monthly credit entries (PENDING until metering)
    const now = new Date();
    const entries = [0, 1, 2].map((i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      const variance = i === 0 ? 1 : 0.97 + Math.random() * 0.06; // simulated generation
      const units = round2((quote.securedKwhYear1 / 12) * variance);
      const gross = round2(units * project.creditsPerKwh);
      const topUp = i === 0 ? 0 : Math.max(0, round2(quote.monthlyCredit - gross));
      return {
        investmentId: investmentRow.id,
        periodLabel: label,
        periodStart: d,
        unitsKwh: units,
        grossAmount: gross,
        topUpAmount: topUp,
        netAmount: round2(gross + topUp),
        billStatus: "PENDING",
      };
    });
    await db.creditEntry.createMany({ data: entries });

    return NextResponse.json({
      booking: {
        ref: investmentRow.ref,
        id: investmentRow.id,
        capacityWatts: quote.capacityWatts,
        totalPayable: quote.totalPayable,
        monthlyCredit: quote.monthlyCredit,
        docHash,
        agreementVersion: BRAND.agreementVersion,
      },
    });
  } catch (e) {
    console.error("invest error", e);
    return NextResponse.json({ error: "Booking failed. Please try again." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const investments = await db.investment.findMany({
      where: { userId: user.id },
      include: {
        project: { select: { name: true, code: true, location: true, state: true, creditsPerKwh: true, imageKey: true } },
        credits: { orderBy: { periodStart: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    const summary = investments.reduce(
      (acc, inv) => {
        acc.invested += inv.amount;
        acc.capitalDeployed += inv.totalPayable;
        const applied = inv.credits.filter((c) => c.billStatus === "APPLIED");
        acc.creditsEarned += applied.reduce((s, c) => s + c.netAmount, 0);
        acc.pending += inv.credits.filter((c) => c.billStatus !== "APPLIED").reduce((s, c) => s + c.netAmount, 0);
        acc.units += applied.reduce((s, c) => s + c.unitsKwh, 0);
        acc.active += inv.status === "ACTIVE" ? 1 : 0;
        return acc;
      },
      { invested: 0, capitalDeployed: 0, creditsEarned: 0, pending: 0, units: 0, active: 0 }
    );

    // Carbon offset: ~0.82 kg CO2 per kWh (India grid avg) → tonnes
    const co2Tonnes = Math.round(((summary.units * 0.82) / 1000) * 1000) / 1000;

    return NextResponse.json({
      investments: investments.map((inv) => ({
        id: inv.id,
        ref: inv.ref,
        status: inv.status,
        amount: inv.amount,
        capacityWatts: inv.capacityWatts,
        totalPayable: inv.totalPayable,
        monthlyCredit: inv.monthlyCredit,
        agreementVersion: inv.agreementVersion,
        docHash: inv.docHash,
        acceptedAt: inv.acceptedAt,
        createdAt: inv.createdAt,
        exitRequestedAt: inv.exitRequestedAt,
        exitPayout: inv.exitPayout,
        project: inv.project,
        credits: inv.credits,
      })),
      summary: {
        ...summary,
        invested: round2(summary.invested),
        capitalDeployed: round2(summary.capitalDeployed),
        creditsEarned: round2(summary.creditsEarned),
        pending: round2(summary.pending),
        units: round2(summary.units),
        co2Tonnes,
      },
    });
  } catch (e) {
    console.error("investments list error", e);
    return NextResponse.json({ error: "Failed to load investments." }, { status: 500 });
  }
}
