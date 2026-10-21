/**
 * GridKavach: Brand & Product Constants
 * Platform operated by Sreesamvridhi Enterprises Private Limited
 *
 * NOTE: Registered office / CIN / jurisdiction are editable here and flow
 * through every legal document rendered on the platform.
 */

export const BRAND = {
  name: "GridKavach",
  legalName: "Sreesamvridhi Enterprises Private Limited",
  shortLegal: "Sreesamvridhi Enterprises Pvt Ltd",
  tagline: "Solar Panel for Everyone",
  taglineAlt: "Solar for Everyone.",
  domain: "www.gridkavach.com",
  supportEmail: "support@gridkavach.com",
  supportPhone: "+91 90000 00000",
  registeredOffice: "Bhubaneswar, Odisha, India",
  jurisdiction: "Bhubaneswar, Odisha",
  agreementVersion: "DSA-GK-v2.1",
} as const;

/** Investment limits (INR) */
export const LIMITS = {
  minInvestment: 1000,
  maxInvestment: 100000,
} as const;

/** Fee structure */
export const FEES = {
  onboardingPct: 1, // investor onboarding fee: 1% of capacity cost
  gstPct: 12, // GST on solar composite supply
  refundProcessingPct: 2.5, // exit processing fee
  ownerListingFee: 0, // project owners list for free (no onboarding fee)
  boosterPerKw: 500, // optional Booster Plan: Rs 500 per kW, spent on ads for fast reservations
  executionFeePct: 2, // owner platform fee: 2% of project cost, paid to initiate execution at 80% reserved
  ownerExecutionTriggerPct: 80, // owner may opt for execution once 80% of capacity is reserved
  ownerAmcPerKwYear: 1200, // AMC charge billed to the project owner every year (Rs/kW/yr)
  ownerAssuranceInsurancePerKwYear: 999, // GridKavach Assurance & insurance charge billed to the project owner every year (Rs/kW/yr)
} as const;

/**
 * Market comparison constants used by the savings calculators.
 * GridKavach projects are commercial-scale installations, so residential
 * capital subsidies do not apply. Instead, bulk procurement and direct
 * purchases from module manufacturers put project costing 30-40% below
 * prevailing market retail pricing, with no middlemen in the chain.
 */
export const MARKET = {
  marketPricePerKw: 85000, // typical retail price of a comparable rooftop system (Rs/kW)
  costAdvantageLowPct: 30, // project costing is 30-40% below market
  costAdvantageHighPct: 40,
  discomTariff: 8.5, // Rs/unit a self-consuming rooftop owner would save per unit
  rooftopOmPerKwYear: 2500, // annual cleaning, servicing and upkeep borne by a rooftop owner (Rs/kW/yr)
  ownerListPricePerKw: 55000, // indicative GridKavach project cost per kW shown in the owner calculator
} as const;

/** GridKavach Assurance: secured generation = 75% of P90 (guaranteed floor) */
export const ASSURANCE = {
  securedOfP90: 0.75,
} as const;

/**
 * Buy-back schedule (Annexure C of the DSA).
 * Exit value per ₹1 of capacity price, by completed year of tenure.
 * Mirrors the standard 15-year declining schedule used across Indian
 * community-solar RESCO projects.
 */
export const BUYBACK_SCHEDULE: number[] = [
  1.0, 0.96, 0.9167, 0.8697, 0.819, 0.7644, 0.7044, 0.6393, 0.5679, 0.49,
  0.4044, 0.3105, 0.207, 0.0931, 0.0,
];

/** Secured generation per kW for Year 1..15 at 1% annual degradation, given P90 */
export function securedGenerationSeries(
  p90KwhPerKw: number,
  years: number,
  degradationPct = 1,
  securedOfP90 = ASSURANCE.securedOfP90
): number[] {
  const y1 = p90KwhPerKw * securedOfP90;
  const d = 1 - degradationPct / 100;
  return Array.from({ length: years }, (_, i) => round2(y1 * Math.pow(d, i)));
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatINR(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatNum(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/** Investor-facing reservation quote */
export interface Quote {
  amount: number; // base capacity cost
  capacityWatts: number;
  capacityKw: number;
  onboardingFee: number;
  gstAmount: number;
  totalPayable: number;
  annualKwhP90: number; // P90 units/yr for the capacity
  securedKwhYear1: number;
  monthlyCredit: number; // fixed monthly credit (secured)
  monthlyCreditP50: number; // expected-case monthly credit (P50)
  annualSavingsYear1: number;
  totalSavingsTenure: number; // sum of credits over full tenure (degradation applied)
  tenureMonths: number;
  creditsPerKwh: number;
  buybackNow: number; // indicative exit value at end of Year 1
}

export interface QuoteInput {
  investment: number;
  pricePerKw: number;
  creditsPerKwh: number;
  p90KwhPerKw: number;
  p50KwhPerKw?: number;
  tenureMonths: number;
  degradationPct?: number;
}

/**
 * Core calculator implements the GridKavach FIXED monthly credit model:
 *   capacityWatts = investment / pricePerKw * 1000
 *   monthly fixed credit = capacity(kW) × securedY1 ÷ 12 × credits/kWh
 */
export function computeQuote(input: QuoteInput): Quote {
  const {
    investment,
    pricePerKw,
    creditsPerKwh,
    p90KwhPerKw,
    p50KwhPerKw = p90KwhPerKw * 1.08, // P50 ≈ 8% above P90 typical
    tenureMonths,
    degradationPct = 1,
  } = input;

  const capacityKw = investment / pricePerKw;
  const capacityWatts = round2(capacityKw * 1000);

  const base = round2(capacityKw * pricePerKw);
  const onboardingFee = round2(base * (FEES.onboardingPct / 100));
  const gstAmount = round2(base * (FEES.gstPct / 100));
  const totalPayable = round2(base + onboardingFee + gstAmount);

  const securedSeries = securedGenerationSeries(p90KwhPerKw, Math.ceil(tenureMonths / 12), degradationPct);
  const securedKwhYear1 = round2(capacityKw * securedSeries[0]);
  const monthlyKwhSecured = securedKwhYear1 / 12;
  const monthlyCredit = round2(monthlyKwhSecured * creditsPerKwh);

  const p50Y1 = capacityKw * p50KwhPerKw;
  const monthlyCreditP50 = round2((p50Y1 / 12) * creditsPerKwh);

  const annualKwhP90 = round2(capacityKw * p90KwhPerKw);
  const annualSavingsYear1 = round2(monthlyCredit * 12);

  const years = Math.floor(tenureMonths / 12);
  let total = 0;
  for (let y = 0; y < years; y++) {
    total += capacityKw * securedSeries[y] * creditsPerKwh;
  }
  const frac = (tenureMonths % 12) / 12;
  if (frac > 0 && years < securedSeries.length) {
    total += capacityKw * securedSeries[years] * creditsPerKwh * frac;
  }

  const buybackNow = round2(base * (BUYBACK_SCHEDULE[1] ?? 0)); // after Year 1

  return {
    amount: base,
    capacityWatts,
    capacityKw: round2(capacityKw),
    onboardingFee,
    gstAmount,
    totalPayable,
    annualKwhP90,
    securedKwhYear1,
    monthlyCredit,
    monthlyCreditP50,
    annualSavingsYear1,
    totalSavingsTenure: round2(total),
    tenureMonths,
    creditsPerKwh,
    buybackNow,
  };
}

/** Exit payout for a completed tenure year (buy-back schedule minus processing fee) */
export function computeExitPayout(
  capacityKw: number,
  pricePerKw: number,
  completedYears: number,
  onboardingFee = 0
): { gross: number; processingFee: number; net: number } {
  const idx = Math.min(Math.max(completedYears, 0), BUYBACK_SCHEDULE.length - 1);
  const gross = round2(capacityKw * pricePerKw * BUYBACK_SCHEDULE[idx]);
  const processingFee = round2(gross * (FEES.refundProcessingPct / 100));
  return { gross, processingFee, net: round2(gross - processingFee) };
}

/** Booking reference: GK-YYYY-##### */
export function makeBookingRef(seq: number): string {
  const year = new Date().getFullYear();
  return `GK-${year}-${String(seq).padStart(5, "0")}`;
}
