/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * GridKavach — marketplace model data update
 * - Removes all existing projects (Aarambh Bloc·2, Sundaram Heights, Green Meadows)
 * - Creates the single listed project: SP International School (Phase 1)
 *   50 kW · Bhubaneswar, Odisha · TPCODL · planned (funding via project escrow)
 * - Cleans orphaned investments/credits, recreates a demo investment for the
 *   demo user against the new project (escrow stage, no credits yet).
 */
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  // 1. Wipe credit entries + investments (avoid orphaned refs to removed projects)
  await db.creditEntry.deleteMany({});
  await db.investment.deleteMany({});

  // 2. Replace all projects with the single listed marketplace project
  await db.project.deleteMany({});
  const project = await db.project.create({
    data: {
      code: "GK-001",
      name: "SP International School (Phase 1)",
      hostSociety: "SP International School",
      location: "Bhubaneswar",
      state: "Odisha",
      utility: "TPCODL",
      capacityKw: 50,
      availableKw: 50,
      creditsPerKwh: 6.65,
      pricePerKw: 55000,
      tenureMonths: 180,
      p90KwhPerKw: 1300,
      annualDegradation: 1,
      status: "OPEN",
      commissionedOn: null,
      tagline:
        "Planned 50 kW rooftop solar plant for SP International School, Bhubaneswar. Funding is being collected into this project's dedicated Escrow Account — GridKavach executes the project with the owner and leading solar partners once subscribed.",
      imageKey: "emerald",
      sortOrder: 1,
    },
  });
  console.log("Project created:", project.id, project.name);

  // 3. Ensure the demo user exists (supports seeding a fresh database), then
  // recreate the demo investment (escrow stage — no credits yet)
  const hashPasswordSync = (pwd) => {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(pwd, salt, 64).toString("hex");
    return `${salt}:${hash}`; // same format as src/lib/auth.ts
  };
  const demo = await db.user.upsert({
    where: { email: "demo@gridkavach.com" },
    update: {},
    create: {
      email: "demo@gridkavach.com",
      name: "Ananya Sharma",
      phone: "9876543210",
      passwordHash: hashPasswordSync("demo1234"),
      utilityName: "MSEDCL",
      state: "Odisha",
      role: "INVESTOR",
    },
  });
  {
    const amount = 50000; // base capacity cost
    const capacityKw = amount / project.pricePerKw; // 0.9091 kW
    const capacityWatts = Math.round(capacityKw * 1000 * 100) / 100;
    const onboardingFee = Math.round(amount * 0.01 * 100) / 100;
    const gstAmount = Math.round(amount * 0.12 * 100) / 100;
    const totalPayable = Math.round((amount + onboardingFee + gstAmount) * 100) / 100;
    const securedY1 = project.p90KwhPerKw * 0.75; // 975 kWh/kW
    const securedKwhYear1 = Math.round(capacityKw * securedY1 * 100) / 100;
    const monthlyCredit = Math.round(((securedKwhYear1 / 12) * project.creditsPerKwh) * 100) / 100;
    const annualKwhP90 = Math.round(capacityKw * project.p90KwhPerKw * 100) / 100;

    const payload = JSON.stringify({
      ref: "GK-2026-000001",
      v: "DSA-GK-v2.1",
      user: { id: demo.id, email: demo.email },
      project: { code: project.code, name: project.name },
      amount,
      capacityWatts,
      totalPayable,
      monthlyCredit,
      ts: Date.now(),
    });
    const docHash = crypto.createHash("sha256").update(payload).digest("hex");

    const inv = await db.investment.create({
      data: {
        ref: "GK-2026-000001",
        userId: demo.id,
        projectId: project.id,
        amount,
        capacityWatts,
        onboardingFee,
        gstAmount,
        totalPayable,
        annualKwhP90,
        securedKwhYear1,
        monthlyCredit,
        status: "ACTIVE",
        agreementVersion: "DSA-GK-v2.1",
        docHash,
        acceptedAt: new Date(),
        acceptedIp: "127.0.0.1",
      },
    });
    console.log("Demo investment recreated:", inv.ref, `₹${amount} → ${capacityWatts} W, ₹${monthlyCredit}/mo`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
