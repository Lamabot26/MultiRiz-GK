import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { securedGenerationSeries, ASSURANCE } from "@/lib/brand";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { investments: true } } },
    });

    const data = projects.map((p) => {
      const securedY1 = Math.round(p.p90KwhPerKw * ASSURANCE.securedOfP90);
      const monthlyCreditPerKw = Math.round((securedY1 / 12) * p.creditsPerKwh * 100) / 100;
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        hostSociety: p.hostSociety,
        location: p.location,
        state: p.state,
        utility: p.utility,
        capacityKw: p.capacityKw,
        availableKw: p.availableKw,
        fillPct: Math.round(((p.capacityKw - p.availableKw) / p.capacityKw) * 100),
        creditsPerKwh: p.creditsPerKwh,
        pricePerKw: p.pricePerKw,
        tenureMonths: p.tenureMonths,
        p90KwhPerKw: p.p90KwhPerKw,
        annualDegradation: p.annualDegradation,
        status: p.status,
        tagline: p.tagline,
        imageKey: p.imageKey,
        investors: p._count.investments,
        securedY1,
        monthlyCreditPerKw,
      };
    });

    return NextResponse.json({ projects: data });
  } catch (e) {
    console.error("projects error", e);
    return NextResponse.json({ error: "Failed to load projects." }, { status: 500 });
  }
}
