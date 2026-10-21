/**
 * GridKavach — Database Seed
 * Seeds live projects (adapted from the reference PPA / Argo Bloc-2 documents)
 * and a demo investor account with a 6-month credit history.
 *
 * Run: npx tsx scripts/seed.ts   (or bun run scripts/seed.ts)
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { hashPasswordSync } from "./hash";

const db = new PrismaClient();

async function main() {
  console.log("Seeding GridKavach…");

  await db.creditEntry.deleteMany();
  await db.investment.deleteMany();
  await db.project.deleteMany();
  await db.user.deleteMany();

  /* ---------- Projects ---------- */
  const p1 = await db.project.create({
    data: {
      code: "GK-001",
      name: "Aarambh Bloc·2",
      hostSociety: "Tulsi Aarambh CHS Ltd",
      location: "Badlapur East, Thane",
      state: "Maharashtra",
      utility: "MSEDCL",
      capacityKw: 106.79,
      availableKw: 12.4,
      creditsPerKwh: 6.71,
      pricePerKw: 55326,
      tenureMonths: 177,
      p90KwhPerKw: 1300,
      annualDegradation: 1,
      status: "FILLING",
      commissionedOn: new Date("2025-12-01"),
      tagline: "Brownfield project generating since Dec 2025 — credits flowing from month one.",
      imageKey: "emerald",
      sortOrder: 1,
    },
  });

  const p2 = await db.project.create({
    data: {
      code: "KG-002",
      name: "Sundaram Heights",
      hostSociety: "Sundaram Heights RWA",
      location: "Gandhipuram, Coimbatore",
      state: "Tamil Nadu",
      utility: "TNEB",
      capacityKw: 145.0,
      availableKw: 61.5,
      creditsPerKwh: 6.85,
      pricePerKw: 56100,
      tenureMonths: 180,
      p90KwhPerKw: 1350,
      annualDegradation: 1,
      status: "OPEN",
      commissionedOn: new Date("2026-03-01"),
      tagline: "High-irradiance western corridor site with a 15-year fixed-tariff PPA.",
      imageKey: "amber",
      sortOrder: 2,
    },
  });

  const p3 = await db.project.create({
    data: {
      code: "KG-003",
      name: "Green Meadows",
      hostSociety: "Green Meadows CHS Ltd",
      location: "Wakad, Pune",
      state: "Maharashtra",
      utility: "MSEDCL",
      capacityKw: 84.6,
      availableKw: 84.6,
      creditsPerKwh: 6.58,
      pricePerKw: 54750,
      tenureMonths: 180,
      p90KwhPerKw: 1280,
      annualDegradation: 1,
      status: "OPEN",
      commissionedOn: new Date("2026-06-01"),
      tagline: "Newly opened — be among the first investors on this fresh rooftop.",
      imageKey: "teal",
      sortOrder: 3,
    },
  });

  /* ---------- Demo investor with history ---------- */
  const demo = await db.user.create({
    data: {
      name: "Ananya Sharma",
      email: "demo@gridkavach.com",
      phone: "9876543210",
      passwordHash: hashPasswordSync("demo1234"),
      utilityName: "MSEDCL",
      consumerNumber: "MSEB-441209-8871",
      state: "Maharashtra",
    },
  });

  const demoAmount = 50000;
  const capacityKw = demoAmount / p1.pricePerKw; // ≈ 0.9037 kW = 903.7 W
  const p90Ann = capacityKw * p1.p90KwhPerKw;
  const securedY1 = capacityKw * p1.p90KwhPerKw * 0.75;
  const monthlyCredit = Math.round(((securedY1 / 12) * p1.creditsPerKwh) * 100) / 100;
  const base = demoAmount;
  const onboarding = Math.round(base * 0.01 * 100) / 100;
  const gst = Math.round(base * 0.12 * 100) / 100;

  const acceptedAt = new Date();
  acceptedAt.setMonth(acceptedAt.getMonth() - 6);

  const payload = JSON.stringify({
    ref: "GK-2026-000001",
    demo: true,
    user: demo.id,
    project: p1.code,
  });

  const inv = await db.investment.create({
    data: {
      ref: "GK-2026-000001",
      userId: demo.id,
      projectId: p1.id,
      amount: base,
      capacityWatts: Math.round(capacityKw * 1000 * 10) / 10,
      onboardingFee: onboarding,
      gstAmount: gst,
      totalPayable: Math.round((base + onboarding + gst) * 100) / 100,
      annualKwhP90: Math.round(p90Ann * 100) / 100,
      securedKwhYear1: Math.round(securedY1 * 100) / 100,
      monthlyCredit,
      status: "ACTIVE",
      agreementVersion: "DSA-KG-v2.0",
      docHash: crypto.createHash("sha256").update(payload).digest("hex"),
      acceptedAt,
      acceptedIp: "103.21.58.14",
    },
  });

  // 6 months of credit history; month 4 dips below secured → Kavach Assurance top-up
  const now = new Date();
  for (let i = 6; i >= 1; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    const variance = i === 4 ? 0.82 : 0.98 + Math.random() * 0.07; // one monsoon dip
    const units = Math.round(((securedY1 / 12) * variance) * 100) / 100;
    const gross = Math.round(units * p1.creditsPerKwh * 100) / 100;
    const topUp = i === 4 ? Math.round((monthlyCredit - gross) * 100) / 100 : 0;
    await db.creditEntry.create({
      data: {
        investmentId: inv.id,
        periodLabel: label,
        periodStart: d,
        unitsKwh: units,
        grossAmount: gross,
        topUpAmount: topUp,
        netAmount: Math.round((gross + topUp) * 100) / 100,
        billStatus: "APPLIED",
        appliedAt: new Date(d.getFullYear(), d.getMonth(), 20),
      },
    });
  }

  // next month projection
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  await db.creditEntry.create({
    data: {
      investmentId: inv.id,
      periodLabel: next.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      periodStart: next,
      unitsKwh: Math.round(((securedY1 / 12) * 1.0) * 100) / 100,
      grossAmount: Math.round(((securedY1 / 12) * p1.creditsPerKwh) * 100) / 100,
      topUpAmount: 0,
      netAmount: monthlyCredit,
      billStatus: "PENDING",
    },
  });

  console.log("✔ Projects:", p1.code, p2.code, p3.code);
  console.log("✔ Demo investor: demo@gridkavach.com / demo1234 (ref GK-2026-000001)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
