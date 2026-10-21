import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { computeExitPayout } from "@/lib/brand";

export async function POST(
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
    if (inv.status !== "ACTIVE") {
      return NextResponse.json({ error: "An exit has already been requested for this reservation." }, { status: 409 });
    }

    const completedYears = Math.max(
      0,
      Math.floor((Date.now() - new Date(inv.acceptedAt).getTime()) / (365.25 * 24 * 3600 * 1000))
    );
    const payout = computeExitPayout(inv.capacityWatts / 1000, inv.project.pricePerKw, completedYears);

    await db.investment.update({
      where: { id },
      data: { status: "EXIT_REQUESTED", exitRequestedAt: new Date(), exitPayout: payout.net },
    });

    return NextResponse.json({
      exit: {
        ...payout,
        completedYears,
        message: `Exit request recorded. Payout of ₹${payout.net.toLocaleString("en-IN")} (post 2.5% processing fee) will be processed within 45-60 days as per Clause 15 of your Service Agreement.`,
      },
    });
  } catch (e) {
    console.error("exit error", e);
    return NextResponse.json({ error: "Exit request failed." }, { status: 500 });
  }
}
