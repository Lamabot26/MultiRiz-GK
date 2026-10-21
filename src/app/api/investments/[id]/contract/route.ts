import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { securedGenerationSeries, BUYBACK_SCHEDULE, BRAND, FEES } from "@/lib/brand";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const inv = await db.investment.findUnique({ where: { id }, include: { project: true } });
    if (!inv || inv.userId !== user.id) {
      return NextResponse.json({ error: "Reservation not found." }, { status: 404 });
    }

    const years = Math.ceil(inv.project.tenureMonths / 12);
    const securedSeries = securedGenerationSeries(inv.project.p90KwhPerKw, years, inv.project.annualDegradation);

    return NextResponse.json({
      contract: {
        booking: {
          ref: inv.ref,
          acceptedAt: inv.acceptedAt,
          acceptedIp: inv.acceptedIp,
          agreementVersion: inv.agreementVersion,
          docHash: inv.docHash,
          status: inv.status,
        },
        investor: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          utilityName: user.utilityName,
          consumerNumber: user.consumerNumber,
        },
        project: {
          code: inv.project.code,
          name: inv.project.name,
          hostSociety: inv.project.hostSociety,
          location: inv.project.location,
          state: inv.project.state,
          utility: inv.project.utility,
          capacityKw: inv.project.capacityKw,
          creditsPerKwh: inv.project.creditsPerKwh,
          tenureMonths: inv.project.tenureMonths,
          p90KwhPerKw: inv.project.p90KwhPerKw,
          annualDegradation: inv.project.annualDegradation,
        },
        reservation: {
          amount: inv.amount,
          capacityWatts: inv.capacityWatts,
          onboardingFee: inv.onboardingFee,
          gstAmount: inv.gstAmount,
          totalPayable: inv.totalPayable,
          annualKwhP90: inv.annualKwhP90,
          securedKwhYear1: inv.securedKwhYear1,
          monthlyCredit: inv.monthlyCredit,
        },
        annexures: {
          securedGeneration: securedSeries.map((kwh, i) => ({
            year: i + 1,
            perKw: kwh,
            forCapacity: Math.round(kwh * (inv.capacityWatts / 1000) * 100) / 100,
          })),
          buyback: BUYBACK_SCHEDULE.slice(0, years).map((f, i) => ({
            year: i + 1,
            value: Math.round(inv.project.pricePerKw * f * (inv.capacityWatts / 1000)),
          })),
        },
        brand: {
          name: BRAND.name,
          legalName: BRAND.legalName,
          domain: BRAND.domain,
          supportEmail: BRAND.supportEmail,
          jurisdiction: BRAND.jurisdiction,
          onboardingPct: FEES.onboardingPct,
          gstPct: FEES.gstPct,
          refundProcessingPct: FEES.refundProcessingPct,
        },
      },
    });
  } catch (e) {
    console.error("contract error", e);
    return NextResponse.json({ error: "Failed to load contract." }, { status: 500 });
  }
}
