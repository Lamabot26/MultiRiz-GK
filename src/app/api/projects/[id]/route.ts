import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { securedGenerationSeries, ASSURANCE, BUYBACK_SCHEDULE } from "@/lib/brand";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const p = await db.project.findUnique({
      where: { id },
      include: { _count: { select: { investments: true } } },
    });
    if (!p) return NextResponse.json({ error: "Project not found." }, { status: 404 });

    const securedSeries = securedGenerationSeries(p.p90KwhPerKw, Math.ceil(p.tenureMonths / 12), p.annualDegradation);
    const months = Math.min(p.tenureMonths, 180);

    return NextResponse.json({
      project: {
        ...p,
        investors: p._count.investments,
        fillPct: Math.round(((p.capacityKw - p.availableKw) / p.capacityKw) * 100),
        securedY1: securedSeries[0],
        monthlyCreditPerKw: Math.round(((securedSeries[0] / 12) * p.creditsPerKwh) * 100) / 100,
        securedSeries,
        buybackSchedule: BUYBACK_SCHEDULE.slice(0, Math.ceil(p.tenureMonths / 12)).map((f, i) => ({
          year: i + 1,
          valuePerKw: Math.round(p.pricePerKw * f),
        })),
        monthlySeries: Array.from({ length: Math.min(months, 24) }, (_, m) => {
          const y = Math.floor(m / 12);
          const kwh = (securedSeries[Math.min(y, securedSeries.length - 1)] / 12) * p.creditsPerKwh;
          return { month: m + 1, credit: Math.round(kwh * 100) / 100 };
        }),
        assurancePct: Math.round(ASSURANCE.securedOfP90 * 100),
      },
    });
  } catch (e) {
    console.error("project detail error", e);
    return NextResponse.json({ error: "Failed to load project." }, { status: 500 });
  }
}
