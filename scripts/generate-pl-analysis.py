#!/usr/bin/env python3
"""
GridKavach: Project Profit & Loss analysis (after distribution of credits to users).
Generates a self-contained branded HTML report:
  download/gridkavach-pl-analysis.html
Model basis: the platform's own published numbers (50 kW, Rs 55,000/kW, P90 1,300,
secured = 75% of P90, credit/PPA rate Rs 6.65/unit, grid Rs 8.5/unit, 15-yr tenure,
1% degradation; one-time fees 1% investor onboarding + 2% owner platform fee +
Booster; recurring owner charges AMC Rs 1,200/kW/yr and GridKavach Assurance &
insurance Rs 999/kW/yr).
"""

OUT = "/home/z/my-project/download/gridkavach-pl-analysis.html"
TODAY = "21 October 2026"

# ---------------- formatting helpers ----------------

def ind(n):
    """Indian digit grouping for an integer magnitude string."""
    neg = n < 0
    n = int(round(abs(n)))
    s = str(n)
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        parts = []
        while len(head) > 2:
            parts.insert(0, head[-2:])
            head = head[:-2]
        if head:
            parts.insert(0, head)
        s = ",".join(parts) + "," + tail
    return ("-" + s) if neg else s

def rs(n, paren=True):
    """Rupee amount, negatives in parentheses when paren=True."""
    if n < 0:
        v = ind(abs(n))
        return f"(₹{v})" if paren else f"-₹{v}"
    return f"₹{ind(n)}"

def lakh(n):
    """Compact lakh label."""
    v = abs(n) / 100000.0
    sign = "-" if n < 0 else ""
    return f"{sign}₹{v:.2f} L"

def units(n):
    return f"{ind(n)}"

# ---------------- model constants ----------------

CAP_KW = 50
PRICE_KW = 55000
MARKET_KW = 85000
CAPEX = CAP_KW * PRICE_KW                 # 27,50,000
P90_KW = 1300.0
SECURED_KW = P90_KW * 0.75                # 975
P50_KW = P90_KW * 1.08                    # 1404 (platform convention)
CREDIT = 6.65                             # Rs/unit, PPA rate = user credit rate
GRID = 8.5                                # Rs/unit
YEARS = 15
DEG = 0.99                                # 1% annual degradation

FEE_ONBOARD = round(CAPEX * 0.01)         # 27,500 (investor onboarding 1%)
FEE_EXEC = round(CAPEX * 0.02)            # 55,000 (owner platform fee 2% at execution)
BOOSTER = 500 * CAP_KW                    # 25,000
FEES_TOTAL = FEE_ONBOARD + FEE_EXEC + BOOSTER   # 1,07,500
OLD_FEES_TOTAL = FEE_ONBOARD + round(CAPEX * 0.01) + BOOSTER   # 80,000 (earlier 1% + 1% + Booster)

AMC_CHARGE_KW = 1200                      # owner-billed AMC charge (Rs/kW/yr)
AI_CHARGE_KW = 999                        # owner-billed GridKavach Assurance & insurance (Rs/kW/yr)
AMC_CHARGE = AMC_CHARGE_KW * CAP_KW       # 60,000 / yr
AI_CHARGE = AI_CHARGE_KW * CAP_KW         # 49,950 / yr
RECUR_CHARGE = AMC_CHARGE + AI_CHARGE     # 1,09,950 / yr

AMC = 2500 * CAP_KW                       # 1,25,000 / yr platform delivery-cost benchmark
MONITOR = 15000                           # / yr
INSURANCE = 11000                         # / yr (0.4% of capex)
ASSURANCE = 5000                          # / yr provision
ADMIN = 24000                             # / yr
BBPS_PCT = 0.0025                         # 0.25% of credits distributed
ADS = BOOSTER                             # Yr-1 ads, funded by Booster

sum_factor = sum(DEG ** i for i in range(YEARS))   # ~13.99416

# ---------------- core series (secured base case) ----------------

years = []
gen0 = CAP_KW * SECURED_KW                # 48,750
cum = 0.0
for i in range(YEARS):
    y = i + 1
    gen = gen0 * DEG ** i
    ppa = gen * CREDIT
    credits = ppa                          # 1:1 pass-through to users
    fees = FEES_TOTAL if y == 1 else 0.0
    charges = RECUR_CHARGE                 # owner AMC + Assurance & insurance, every year
    revenue = ppa + fees + charges
    net_after_dist = revenue - credits
    exp = AMC + MONITOR + INSURANCE + ASSURANCE + ADMIN + BBPS_PCT * credits
    if y == 1:
        exp += ADS
    pnl = net_after_dist - exp
    cum += pnl
    years.append({
        "y": y, "gen": gen, "ppa": ppa, "fees": fees, "charges": charges,
        "revenue": revenue, "credits": credits, "net": net_after_dist, "exp": exp,
        "pnl": pnl, "cum": cum,
    })

T_GEN = sum(r["gen"] for r in years)
T_PPA = sum(r["ppa"] for r in years)
T_REV = sum(r["revenue"] for r in years)
T_CREDITS = sum(r["credits"] for r in years)
T_NET = sum(r["net"] for r in years)
T_EXP = sum(r["exp"] for r in years)
T_PNL = sum(r["pnl"] for r in years)

Y1 = years[0]

# detail expense lines, Year 1 and cumulative
exp_lines = [
    ("AMC & plant maintenance", AMC, AMC * YEARS),
    ("Remote monitoring & platform operations", MONITOR, MONITOR * YEARS),
    ("Asset insurance", INSURANCE, INSURANCE * YEARS),
    ("GridKavach Assurance top-up provision", ASSURANCE, ASSURANCE * YEARS),
    ("Payment & collection charges (0.25% of credits)", BBPS_PCT * T_CREDITS, BBPS_PCT * T_CREDITS),
    ("Administration, reporting & compliance", ADMIN, ADMIN * YEARS),
    ("Marketing (Booster-funded ads, Year 1)", ADS, ADS),
]

# ---------------- scenario totals: secured / P90 / P50 ----------------

def scenario(secured_kwh_per_kw):
    g0 = CAP_KW * secured_kwh_per_kw
    gen = g0 * sum_factor
    ppa = gen * CREDIT
    bbps = BBPS_PCT * ppa
    exp = (AMC + MONITOR + INSURANCE + ASSURANCE + ADMIN) * YEARS + bbps + ADS
    charges_tot = RECUR_CHARGE * YEARS
    rev = ppa + FEES_TOTAL + charges_tot
    net = FEES_TOTAL + charges_tot
    return {
        "gen": gen, "ppa": ppa, "rev": rev, "credits": ppa, "charges": charges_tot,
        "net": net, "exp": exp, "pnl": net - exp,
    }

SC = {
    "Secured (75% of P90)": scenario(SECURED_KW),
    "P90 (90% confidence)": scenario(P90_KW),
    "P50 (expected case)": scenario(P50_KW),
}

# ---------------- Sensitivities on the decided charge structure ----------------

CHARGE_ESC = 0.03                          # optional 3%/yr escalation on owner charges
AMC_BULK = 1200 * CAP_KW                   # AMC delivered by bulk partners at Rs 1,200/kW/yr

def sens_run(amc_cost, esc):
    """15-year cumulative P&L under alternative AMC delivery cost and charge escalation."""
    total = 0.0
    for i in range(YEARS):
        y = i + 1
        gen = gen0 * DEG ** i
        credits = gen * CREDIT
        charges = RECUR_CHARGE * (1 + esc) ** i
        fees = FEES_TOTAL if y == 1 else 0.0
        net = fees + charges
        exp = amc_cost + MONITOR + INSURANCE + ASSURANCE + ADMIN + BBPS_PCT * credits
        if y == 1:
            exp += ADS
        total += net - exp
    return total

S_BASE = sens_run(AMC, 0.0)                # decided structure, AMC at benchmark delivery
S_BULK = sens_run(AMC_BULK, 0.0)           # + AMC delivered at the charged rate
S_ESC = sens_run(AMC, CHARGE_ESC)          # + charges escalate 3%/yr
S_BOTH = sens_run(AMC_BULK, CHARGE_ESC)    # both

def old_model_run():
    """Earlier structure for comparison: 1% owner fee, no recurring owner charges."""
    total = 0.0
    for i in range(YEARS):
        y = i + 1
        gen = gen0 * DEG ** i
        credits = gen * CREDIT
        fees = OLD_FEES_TOTAL if y == 1 else 0.0
        exp = AMC + MONITOR + INSURANCE + ASSURANCE + ADMIN + BBPS_PCT * credits
        if y == 1:
            exp += ADS
        total += fees - exp
    return total

OLD_MODEL_PNL = old_model_run()            # approx -26.56 L

# Host-side economics of the two charges at the reference tariff pair
HOST_CHARGE_KW = AMC_CHARGE_KW + AI_CHARGE_KW          # 2,199 per kW/yr
HOST_SAVE_KW = SECURED_KW * (GRID - CREDIT)            # 1,803.75 per kW/yr energy savings
HOST_NET_KW = HOST_SAVE_KW - HOST_CHARGE_KW           # -395.25 per kW/yr
PPA_BREAK = GRID - HOST_CHARGE_KW / SECURED_KW        # ~Rs 6.24/unit keeps the host whole
GRID_BREAK = CREDIT + HOST_CHARGE_KW / SECURED_KW     # ~Rs 8.91/unit grid tariff keeps the host whole

RECUR_COVER_PCT = RECUR_CHARGE / years[1]["exp"] * 100     # share of Year-2 cost covered by charges
IMPROVE_PCT = (abs(OLD_MODEL_PNL) - abs(T_PNL)) / abs(OLD_MODEL_PNL) * 100   # vs earlier 1% structure

# ---------------- SVG charts ----------------

def y1_bar_chart():
    W, H = 680, 340
    base = 250
    k = 170 / Y1["revenue"]
    bars = [
        ("Total revenue", Y1["revenue"], "#172554"),
        ("Credits distributed", Y1["credits"], "#3b82f6"),
        ("Owner charges kept", Y1["charges"], "#0891b2"),
        ("Operating expenses", Y1["exp"], "#f59e0b"),
        ("Net profit / (loss)", Y1["pnl"], "#e11d48"),
    ]
    bw, gap = 100, 16
    x0 = 40
    def vlabel(v):
        return lakh(v) if abs(v) >= 100000 else rs(round(v))
    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Year 1 bar chart" style="width:100%;height:auto">',
             f'<line x1="24" y1="{base}" x2="{W - 16}" y2="{base}" stroke="#cbd5e1" stroke-width="1.5"/>']
    for i, (lbl, val, color) in enumerate(bars):
        h = abs(val) * k
        x = x0 + i * (bw + gap)
        if val >= 0:
            yv = base - h
            vy = yv - 10
            cy = base + 34
        else:
            yv = base
            vy = base + h + 20
            cy = base + h + 38
        parts.append(f'<rect x="{x}" y="{yv:.1f}" width="{bw}" height="{max(h, 1.2):.1f}" rx="7" fill="{color}"/>')
        parts.append(f'<text x="{x + bw / 2}" y="{vy:.1f}" text-anchor="middle" font-size="13" font-weight="700" fill="#0f172a">{vlabel(val)}</text>')
        parts.append(f'<text x="{x + bw / 2}" y="{cy:.1f}" text-anchor="middle" font-size="10.5" font-weight="600" fill="#64748b">{lbl}</text>')
    parts.append("</svg>")
    return "".join(parts)

def cum_line_chart():
    W, H = 700, 330
    top, bottom = 34, 262
    cums = [r["cum"] for r in years]
    max_abs = max(abs(min(cums)), abs(max(cums)))
    ymax = int((max_abs * 1.18 + 99999) // 100000 * 100000)   # round up to next lakh
    x0, x1 = 64, 656
    def px(i):
        return x0 + (x1 - x0) * i / (YEARS - 1)
    def py(v):
        return top + (bottom - top) * (abs(v) / ymax)
    parts = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Cumulative P and L line chart" style="width:100%;height:auto">']
    for gv in range(0, int(ymax // 100000) + 1, 2):
        yy = py(-gv * 100000.0)
        parts.append(f'<line x1="{x0}" y1="{yy:.1f}" x2="{x1}" y2="{yy:.1f}" stroke="#e2e8f0" stroke-width="1"/>')
        parts.append(f'<text x="{x0 - 8}" y="{yy + 4:.1f}" text-anchor="end" font-size="10" fill="#64748b">-₹{gv} L</text>')
    pts = " ".join(f"{px(i):.1f},{py(r['cum']):.1f}" for i, r in enumerate(years))
    area = f"{px(0)},{py(0)} " + pts + f" {px(YEARS - 1)},{py(0)}"
    parts.append(f'<polygon points="{area}" fill="rgba(225,29,72,0.09)"/>')
    parts.append(f'<polyline points="{pts}" fill="none" stroke="#e11d48" stroke-width="2.6" stroke-linejoin="round"/>')
    for i, r in enumerate(years):
        parts.append(f'<circle cx="{px(i):.1f}" cy="{py(r["cum"]):.1f}" r="3" fill="#172554"/>')
    for i in range(YEARS):
        if (i + 1) % 2 == 1 or i == YEARS - 1:
            parts.append(f'<text x="{px(i):.1f}" y="{bottom + 18}" text-anchor="middle" font-size="10" fill="#64748b">Y{i + 1}</text>')
    parts.append(f'<text x="{px(YEARS - 1) - 10:.1f}" y="{py(years[-1]["cum"]) + 16:.1f}" text-anchor="end" font-size="12.5" font-weight="700" fill="#e11d48">{lakh(T_PNL)}</text>')
    parts.append("</svg>")
    return "".join(parts)

BAR_SVG = y1_bar_chart()
LINE_SVG = cum_line_chart()

# ---------------- CSS ----------------

CSS = """
:root { --navy:#101f4a; --navy2:#172554; --ink:#0f172a; --muted:#64748b; --line:#e2e8f0;
        --orange:#f59e0b; --amber:#fbbf24; --rose:#e11d48; --green:#059669; --bg:#f4f7fc; }
* { box-sizing: border-box; }
html, body { margin:0; padding:0; }
body { background:var(--bg); color:var(--ink); font-family:'Poppins','Segoe UI',system-ui,-apple-system,sans-serif; font-size:14.5px; line-height:1.55; }
.wrap { max-width:1140px; margin:0 auto; padding:28px 20px 60px; }
.doc-head { background:linear-gradient(120deg,#0b1533 0%,#172554 55%,#1d3a8a 100%); color:#fff; border-radius:22px; padding:34px 36px; position:relative; overflow:hidden; }
.doc-head .grid-lines { position:absolute; inset:0; opacity:.16;
  background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px); background-size:34px 34px; }
.doc-head .rel { position:relative; }
.brandline { display:flex; align-items:center; gap:12px; }
.wordmark { font-size:21px; font-weight:800; letter-spacing:.2px; }
.wordmark span { color:var(--amber); }
.doc-head h1 { margin:16px 0 6px; font-size:30px; line-height:1.2; font-weight:800; }
.doc-head p.sub { margin:0; color:rgba(226,232,240,.85); font-size:14px; }
.headmeta { margin-top:18px; display:flex; flex-wrap:wrap; gap:8px; }
.chip { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); color:#e2e8f0; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:600; }
.chip b { color:var(--amber); }
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:18px; }
.kpi { background:#fff; border-radius:16px; padding:18px 20px; box-shadow:0 8px 24px rgba(16,31,74,.07); border:1px solid var(--line); }
.kpi .l { font-size:11.5px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--muted); }
.kpi .v { margin-top:6px; font-size:23px; font-weight:800; color:var(--navy2); }
.kpi .s { margin-top:3px; font-size:11.5px; color:var(--muted); }
.kpi.neg .v { color:var(--rose); }
.card { background:#fff; border-radius:20px; padding:28px 30px; box-shadow:0 10px 30px rgba(16,31,74,.06); border:1px solid var(--line); margin-top:26px; }
.eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:11.5px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; color:var(--orange); }
.eyebrow::before { content:""; width:26px; height:2.5px; background:var(--orange); border-radius:2px; }
h2 { margin:8px 0 4px; font-size:22px; font-weight:800; color:var(--navy2); }
p.lead { margin:6px 0 0; color:var(--muted); max-width:860px; }
.scroll { overflow-x:auto; }
table.tbl { width:100%; border-collapse:collapse; margin-top:16px; font-size:13.6px; }
.tbl th { background:var(--navy); color:#fff; text-align:left; padding:11px 14px; font-size:12px; letter-spacing:.05em; text-transform:uppercase; }
.tbl th.num, .tbl td.num { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
.tbl td { padding:9px 14px; border-bottom:1px solid #eef2f9; }
.tbl tr:nth-child(even) td { background:#f8fafd; }
.tbl td.sect { background:#eaf0ff; color:var(--navy2); font-weight:800; font-size:11.5px; letter-spacing:.08em; text-transform:uppercase; border-bottom:none; padding-top:12px; }
.tbl tr.sub td { font-weight:700; color:var(--navy2); background:#f3f7ff; }
.tbl tr.tot td { font-weight:800; color:var(--navy2); border-top:2px solid var(--navy2); border-bottom:none; font-size:14.2px; background:#fff; }
.tbl tr.grand td { font-weight:800; font-size:15px; color:#fff; background:var(--navy2); border-bottom:none; }
.tbl tr.grand td.negtxt { color:#fecdd3; }
.neg { color:var(--rose); font-weight:700; }
.pos { color:var(--green); font-weight:700; }
.note { margin-top:18px; background:#fffbeb; border:1px solid #fde68a; border-radius:14px; padding:16px 18px; font-size:13px; color:#713f12; }
.note b { color:#92400e; }
.grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px; }
.grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:16px; }
.mini { background:#f8fafd; border:1px solid var(--line); border-radius:14px; padding:14px 16px; }
.mini .l { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--muted); }
.mini .v { margin-top:3px; font-weight:800; color:var(--navy2); font-size:15.5px; }
.obs { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:18px; }
.ob { background:#f8fafd; border:1px solid var(--line); border-radius:16px; padding:18px 20px; }
.ob .n { display:inline-flex; width:30px; height:30px; border-radius:10px; background:var(--navy2); color:var(--amber); align-items:center; justify-content:center; font-weight:800; font-size:14px; }
.ob h3 { margin:10px 0 6px; font-size:14.5px; color:var(--navy2); }
.ob p { margin:0; font-size:13px; color:#334155; }
.chart-card svg { margin-top:10px; }
.foot { margin-top:30px; color:var(--muted); font-size:12px; text-align:center; }
.noprint { display:inline-flex; gap:8px; }
.btn { border:none; cursor:pointer; background:var(--orange); color:#3b2405; font-weight:800; font-size:13px; padding:10px 20px; border-radius:999px; }
@media (max-width:900px){ .kpi-grid{grid-template-columns:1fr 1fr;} .grid2,.obs{grid-template-columns:1fr;} .grid3{grid-template-columns:1fr;} .doc-head h1{font-size:24px;} }
@media print { body{background:#fff;} .wrap{max-width:100%; padding:0;} .card{box-shadow:none; border:1px solid var(--line); page-break-inside:avoid;} .noprint{display:none;} .doc-head{border-radius:0;} @page{ size:A4; margin:12mm; } }
"""

LOGO_SVG = """<svg width="40" height="40" viewBox="0 0 48 48" aria-hidden="true">
<rect x="3" y="7" width="42" height="34" rx="9" fill="#ffffff14" stroke="#fbbf24" stroke-width="2.4"/>
<circle cx="36" cy="15" r="5.4" fill="#fbbf24"/>
<g stroke="#dbe6ff" stroke-width="1.6" opacity=".85">
<line x1="17" y1="12" x2="17" y2="36"/><line x1="27" y1="12" x2="27" y2="36"/>
<line x1="8" y1="20" x2="36" y2="20"/><line x1="8" y1="28" x2="36" y2="28"/>
</g></svg>"""

# ---------------- HTML assembly ----------------

H = []
H.append(f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>GridKavach | Profit &amp; Loss Analysis: 50 kW Digital Solar Project</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style>
</head>
<body>
<div class="wrap">

<div class="doc-head">
  <div class="grid-lines"></div>
  <div class="rel">
    <div class="brandline">{LOGO_SVG}
      <div class="wordmark">Grid<span>Kavach</span> <span style="font-size:12px;font-weight:600;color:rgba(226,232,240,.75);letter-spacing:.14em;">&nbsp;SOLAR PANEL FOR EVERYONE</span></div>
    </div>
    <h1>Profit &amp; Loss Statement: After Distribution of Credits to Users</h1>
    <p class="sub">Project financial analysis of a 50 kW commercial rooftop solar project, Bhubaneswar, Odisha, over the full 15-year Digital Solar tenure, under the decided fee schedule: a 2% owner platform fee plus annual AMC and GridKavach Assurance &amp; insurance charges of ₹1,200 and ₹999 per kW. Prepared for internal planning by the marketplace operator.</p>
    <div class="headmeta">
      <span class="chip">Capacity: <b>50 kW</b></span>
      <span class="chip">Project cost: <b>{rs(CAPEX)}</b> ({rs(PRICE_KW)}/kW)</span>
      <span class="chip">PPA &amp; credit rate: <b>₹6.65/unit</b></span>
      <span class="chip">Grid tariff: <b>₹8.5/unit</b></span>
      <span class="chip">Owner platform fee: <b>2% at execution</b></span>
      <span class="chip">Owner charges: <b>₹1,200 + ₹999/kW/yr</b></span>
      <span class="chip">Tenure: <b>15 years</b></span>
      <span class="chip">Prepared: <b>{TODAY}</b></span>
    </div>
  </div>
</div>

<div class="kpi-grid">
  <div class="kpi"><p class="l">Total generation, 15 yrs</p><p class="v">{units(T_GEN)}</p><p class="s">Secured basis, 75% of P90, 1% degradation</p></div>
  <div class="kpi"><p class="l">Total revenue, 15 yrs</p><p class="v">{rs(T_REV)}</p><p class="s">PPA receipts {lakh(T_PPA)} + one-time fees {lakh(FEES_TOTAL)} + owner charges {lakh(RECUR_CHARGE * YEARS)}</p></div>
  <div class="kpi"><p class="l">Credits distributed to users</p><p class="v">{rs(T_CREDITS)}</p><p class="s">100% of PPA receipts passed through at ₹6.65/unit</p></div>
  <div class="kpi neg"><p class="l">P&amp;L after expenses</p><p class="v">{rs(T_PNL)}</p><p class="s">Year 1 breaks even; from Year 2 the recurring gap is about {lakh(-years[1]["pnl"])} a year</p></div>
</div>
""")

# Section 1: basis & assumptions
H.append(f"""
<div class="card">
  <span class="eyebrow">Section 1</span>
  <h2>Basis of preparation &amp; key assumptions</h2>
  <p class="lead">This statement follows the marketplace's own published economics. The plant is fully funded by investors at {rs(PRICE_KW)} per kW into the project escrow account, the host buys its power under the PPA at ₹6.65 per unit against a ₹8.5 per unit grid tariff, and every unit generated, after maintenance, is distributed to users as bill credits at the same ₹6.65 per unit. Because the PPA rate and the user credit rate are identical, the credits distributed to users equal the host's PPA receipts unit for unit, so the statement nets them out first. What remains is the platform's own income: one-time fees (1% investor onboarding, 2% owner platform fee at execution, and the ad-funded Booster) plus the recurring annual charges billed to the project owner (AMC at ₹1,200/kW/yr and GridKavach Assurance &amp; insurance at ₹999/kW/yr).</p>
  <div class="grid3">
    <div class="mini"><p class="l">Plant &amp; cost</p><p class="v">50 kW at {rs(PRICE_KW)}/kW</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">{rs(CAPEX)} total, about 35% below the ₹85,000/kW market price through bulk buying and direct purchase from manufacturers. No residential subsidy applies to this commercial project.</p></div>
    <div class="mini"><p class="l">Generation</p><p class="v">975 units/kW/yr secured</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">75% of P90 (1,300 units/kW). Year 1: {units(gen0)} units across 50 kW, degrading 1% per year. P50 expected case is 1,404 units/kW and is shown in the scenario table.</p></div>
    <div class="mini"><p class="l">Rates</p><p class="v">₹6.65 PPA, ₹8.5 grid</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">The host pays ₹6.65 per unit of solar generation instead of ₹8.5 per unit on the grid, saving ₹1.85 per unit. Users receive the generated units as credits at ₹6.65 per unit.</p></div>
    <div class="mini"><p class="l">One-time platform fees</p><p class="v">{rs(FEES_TOTAL)}</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">Investor onboarding 1% ({rs(FEE_ONBOARD)}), owner platform fee 2% at execution ({rs(FEE_EXEC)}), Booster Plan ₹500 × 50 kW ({rs(BOOSTER)}). The Booster fee is fully spent on reservation ads, so it is self-funding.</p></div>
    <div class="mini"><p class="l">Owner service charges</p><p class="v">₹{ind(RECUR_CHARGE)}/yr</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">Billed to the project owner annually for the tenure: AMC at ₹1,200/kW/yr ({rs(AMC_CHARGE)}/yr) and GridKavach Assurance &amp; insurance at ₹999/kW/yr ({rs(AI_CHARGE)}/yr), {rs(RECUR_CHARGE * YEARS)} over 15 years.</p></div>
    <div class="mini"><p class="l">Operating expenses</p><p class="v">{rs(AMC)}/yr AMC</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">AMC delivery benchmarked at ₹2,500/kW/yr (retail rooftop upkeep rate), monitoring ₹15,000/yr, insurance ₹11,000/yr, Assurance top-up provision ₹5,000/yr, administration ₹24,000/yr, payment collection 0.25% of credits distributed.</p></div>
    <div class="mini"><p class="l">Excluded (pass-through)</p><p class="v">GST</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">GST on the capacity cost (12%) and on PPA billing is collected and remitted or recovered as input credit, so it is excluded throughout. Figures are pre-tax and indicative, pending site survey and DISCOM approval.</p></div>
  </div>
</div>
""")

# Section 2: main P&L statement
exp_rows_y1 = sum(v for _, v, _ in exp_lines)
exp_rows_tot = sum(t for _, _, t in exp_lines)
statement_rows = []
statement_rows.append('<tr><td class="sect" colspan="3">Revenue</td></tr>')
statement_rows.append(f'<tr><td>Host PPA receipts ({units(Y1["gen"])} units in Year 1 × ₹6.65)</td><td class="num">{rs(Y1["ppa"])}</td><td class="num">{rs(T_PPA)}</td></tr>')
statement_rows.append(f'<tr><td>Investor onboarding fee (1% of {rs(CAPEX)})</td><td class="num">{rs(FEE_ONBOARD)}</td><td class="num">{rs(FEE_ONBOARD)}</td></tr>')
statement_rows.append(f'<tr><td>Owner platform fee (2% of project cost, at execution)</td><td class="num">{rs(FEE_EXEC)}</td><td class="num">{rs(FEE_EXEC)}</td></tr>')
statement_rows.append(f'<tr><td>Booster Plan (₹500 × 50 kW, optional)</td><td class="num">{rs(BOOSTER)}</td><td class="num">{rs(BOOSTER)}</td></tr>')
statement_rows.append(f'<tr><td>AMC charge collected from owner (₹1,200 × 50 kW/yr)</td><td class="num">{rs(AMC_CHARGE)}</td><td class="num">{rs(AMC_CHARGE * YEARS)}</td></tr>')
statement_rows.append(f'<tr><td>GridKavach Assurance &amp; insurance charge from owner (₹999 × 50 kW/yr)</td><td class="num">{rs(AI_CHARGE)}</td><td class="num">{rs(AI_CHARGE * YEARS)}</td></tr>')
statement_rows.append(f'<tr class="sub"><td>Total revenue</td><td class="num">{rs(Y1["revenue"])}</td><td class="num">{rs(T_REV)}</td></tr>')
statement_rows.append('<tr><td class="sect" colspan="3">Less: distribution of credits to users</td></tr>')
statement_rows.append(f'<tr><td>Fixed monthly credits on secured generation @ ₹6.65/unit</td><td class="num">{rs(-Y1["credits"])}</td><td class="num">{rs(-T_CREDITS)}</td></tr>')
statement_rows.append(f'<tr><td>Upside credits (zero when generation performs at the secured level)</td><td class="num">₹0</td><td class="num">₹0</td></tr>')
statement_rows.append(f'<tr class="sub"><td>Total credits distributed</td><td class="num">{rs(-Y1["credits"])}</td><td class="num">{rs(-T_CREDITS)}</td></tr>')
statement_rows.append(f'<tr class="tot"><td>Net revenue after distribution of credits</td><td class="num">{rs(Y1["net"])}</td><td class="num">{rs(T_NET)}</td></tr>')
statement_rows.append('<tr><td class="sect" colspan="3">Operating expenses (after distribution)</td></tr>')
for lbl, v1, vt in exp_lines:
    statement_rows.append(f'<tr><td>{lbl}</td><td class="num">{rs(round(v1))}</td><td class="num">{rs(round(vt))}</td></tr>')
statement_rows.append(f'<tr class="sub"><td>Total operating expenses</td><td class="num">({ind(Y1["exp"])})</td><td class="num">({ind(T_EXP)})</td></tr>')
H.append(f"""
<div class="card">
  <span class="eyebrow">Section 2</span>
  <h2>Statement of profit &amp; loss after distribution of credits</h2>
  <p class="lead">Year 1 and 15-year cumulative, on secured generation (75% of P90). Amounts in ₹, negatives in parentheses.</p>
  <div class="scroll"><table class="tbl">
    <thead><tr><th>Particulars</th><th class="num">Year 1</th><th class="num">15-Year total</th></tr></thead>
    <tbody>{''.join(statement_rows)}</tbody>
    <tfoot><tr class="grand"><td>Net profit / (loss) after expenses</td><td class="num negtxt">{rs(round(Y1["pnl"]))}</td><td class="num negtxt">{rs(round(T_PNL))}</td></tr></tfoot>
  </table></div>
  <div class="note"><b>How to read this:</b> the host's PPA payments are distributed to users as bill credits at the same ₹6.65 per unit, so what remains after distribution is the one-time fee income of {rs(FEES_TOTAL)} plus the recurring owner charges of {rs(RECUR_CHARGE)} a year. Year 1 income of {rs(round(Y1["net"]))} just covers the Year 1 cost base of {rs(round(Y1["exp"]))}, a profit of {rs(round(Y1["pnl"]))}: effectively break-even. From Year 2 the charges fund only about {RECUR_COVER_PCT:.0f}% of the operating cost, and the cumulative position drifts to {rs(round(T_PNL))} by Year 15. Section 6 quantifies the sensitivities that close this gap.</div>
</div>
""")

# Section 3: separate summary generation vs revenue vs P&L
sc_rows = []
sc_rows.append(f'<tr><td>Total generation over 15 years (units)</td>' + ''.join(f'<td class="num">{units(v["gen"])}</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr><td>Host PPA receipts @ ₹6.65/unit</td>' + ''.join(f'<td class="num">{rs(round(v["ppa"]))}</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr><td>One-time platform fees (1% + 2% + Booster)</td>' + ''.join(f'<td class="num">{rs(FEES_TOTAL)}</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr><td>Owner charges collected (AMC ₹1,200 + Assurance &amp; insurance ₹999 per kW/yr)</td>' + ''.join(f'<td class="num">{rs(round(v["charges"]))}</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr class="sub"><td>Total revenue</td>' + ''.join(f'<td class="num">{rs(round(v["rev"]))}</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr><td>Less: credits distributed to users @ ₹6.65/unit</td>' + ''.join(f'<td class="num">({ind(v["credits"])})</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr class="tot"><td>Net revenue after distribution</td>' + ''.join(f'<td class="num">{rs(round(v["net"]))}</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr><td>Less: total operating expenses</td>' + ''.join(f'<td class="num">({ind(v["exp"])})</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr class="grand"><td>Net profit / (loss) after expenses</td>' + ''.join(f'<td class="num negtxt">{rs(round(v["pnl"]))}</td>' for v in SC.values()) + '</tr>')
sc_rows.append(f'<tr><td>P&amp;L as % of total revenue</td>' + ''.join(f'<td class="num neg">{v["pnl"] / v["rev"] * 100:.1f}%</td>' for v in SC.values()) + '</tr>')
H.append(f"""
<div class="card">
  <span class="eyebrow">Section 3</span>
  <h2>Total generation vs revenue vs profit &amp; loss after expenses</h2>
  <p class="lead">The same statement across three generation scenarios. Because power is billed and distributed at the identical ₹6.65 per unit, the P&amp;L after distribution barely moves between scenarios; only the pass-through volume changes.</p>
  <div class="scroll"><table class="tbl">
    <thead><tr><th>15-year totals</th><th class="num">Secured<br>(75% of P90)</th><th class="num">P90<br>(90% confidence)</th><th class="num">P50<br>(expected case)</th></tr></thead>
    <tbody>{''.join(sc_rows)}</tbody>
  </table></div>
  <div class="grid2">
    <div class="mini"><p class="l">Year 1 snapshot (secured)</p><p class="v">Revenue {rs(round(Y1["revenue"]))} · Credits {rs(round(Y1["credits"]))} · Expenses {rs(round(Y1["exp"]))}</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">Net after distribution {rs(round(Y1["net"]))} (fees plus the first year's owner charges) leaves a Year 1 profit of {rs(round(Y1["pnl"]))}: effectively break-even.</p></div>
    <div class="mini"><p class="l">Recurring gap (Years 2 to 15)</p><p class="v">{rs(round(-years[1]["pnl"]))}/yr unfunded</p><p class="s" style="font-weight:400;color:var(--muted);font-size:12px;">From Year 2 the owner charges of {rs(RECUR_CHARGE)} a year cover about {RECUR_COVER_PCT:.0f}% of the {lakh(years[1]["exp"])} yearly operating cost; the remaining {lakh(-years[1]["pnl"])} a year is the unfunded gap.</p></div>
  </div>
</div>
""")

# Section 4: year-by-year table
yr_rows = []
for r in years:
    pnl_cls = "neg" if r["pnl"] < 0 else "pos"
    cum_cls = "neg" if r["cum"] < 0 else "pos"
    yr_rows.append(
        f'<tr><td>Year {r["y"]}</td>'
        f'<td class="num">{units(round(r["gen"]))}</td>'
        f'<td class="num">{rs(round(r["revenue"]))}</td>'
        f'<td class="num">({ind(round(r["credits"]))})</td>'
        f'<td class="num">{rs(round(r["net"]))}</td>'
        f'<td class="num">({ind(round(r["exp"]))})</td>'
        f'<td class="num {pnl_cls}">{rs(round(r["pnl"]))}</td>'
        f'<td class="num {cum_cls}">{rs(round(r["cum"]))}</td></tr>')
yr_rows.append(
    f'<tr class="grand"><td>15-Year total</td>'
    f'<td class="num">{units(round(T_GEN))}</td>'
    f'<td class="num">{rs(round(T_REV))}</td>'
    f'<td class="num">({ind(round(T_CREDITS))})</td>'
    f'<td class="num">{rs(round(T_NET))}</td>'
    f'<td class="num">({ind(round(T_EXP))})</td>'
    f'<td class="num negtxt">{rs(round(T_PNL))}</td>'
    f'<td class="num negtxt">{rs(round(T_PNL))}</td></tr>')
H.append(f"""
<div class="card">
  <span class="eyebrow">Section 4</span>
  <h2>Year-by-year statement (secured base case)</h2>
  <p class="lead">Generation declines 1% per year from {units(gen0)} units in Year 1. Revenue is the host PPA at ₹6.65 per unit plus Year 1 fees plus the annual owner charges of {rs(RECUR_CHARGE)}; credits distributed always equal the PPA receipts.</p>
  <div class="scroll"><table class="tbl">
    <thead><tr><th>Year</th><th class="num">Generation<br>(units)</th><th class="num">Revenue</th><th class="num">Credits<br>distributed</th><th class="num">Net after<br>distribution</th><th class="num">Operating<br>expenses</th><th class="num">Net P&amp;L</th><th class="num">Cumulative<br>P&amp;L</th></tr></thead>
    <tbody>{''.join(yr_rows)}</tbody>
  </table></div>
</div>
""")

# Section 5: charts
H.append(f"""
<div class="card chart-card">
  <span class="eyebrow">Section 5</span>
  <h2>Visual summary</h2>
  <div class="grid2">
    <div>
      <h3 style="margin:14px 0 0;font-size:15px;color:var(--navy2);">Year 1: revenue, credits, charges and net</h3>
      {BAR_SVG}
    </div>
    <div>
      <h3 style="margin:14px 0 0;font-size:15px;color:var(--navy2);">Cumulative P&amp;L after owner charges</h3>
      {LINE_SVG}
    </div>
  </div>
</div>
""")

# Section 6: observations + sensitivities
H.append(f"""
<div class="card">
  <span class="eyebrow">Section 6</span>
  <h2>What the numbers say &amp; the sensitivities that close the gap</h2>
  <div class="obs">
    <div class="ob"><span class="n">1</span><h3>The power flow is still a 1:1 pass-through</h3><p>Every unit is billed to the host at ₹6.65 and distributed to users at ₹6.65, so credits absorb 100% of PPA receipts. The P&amp;L after distribution now comprises the one-time fees plus the recurring owner charges, and it stays almost invariant across the secured, P90 and P50 scenarios; only the pass-through volume moves.</p></div>
    <div class="ob"><span class="n">2</span><h3>Year 1 breaks even, Years 2 to 15 run short</h3><p>Year 1 collects the fees of {rs(FEES_TOTAL)} plus the first year's charges of {rs(RECUR_CHARGE)}, {rs(round(Y1["net"]))} in all, against operating costs of {rs(round(Y1["exp"]))}: a profit of just {rs(round(Y1["pnl"]))}. From Year 2 the charges fund about {RECUR_COVER_PCT:.0f}% of the {lakh(years[1]["exp"])} yearly cost, so the cumulative position drifts to {rs(round(T_PNL))} by Year 15, a {IMPROVE_PCT:.0f}% improvement on the earlier {lakh(OLD_MODEL_PNL)} shortfall.</p></div>
    <div class="ob"><span class="n">3</span><h3>The AMC charge recovers 48% of the benchmark delivery cost</h3><p>The ₹1,200/kW/yr AMC charge recovers about 48% of the ₹2,500/kW/yr retail-benchmark delivery cost assumed in the expense base. If bulk partner contracts deliver the AMC at the charged ₹1,200/kW/yr, the AMC line nets to zero and the 15-year gap narrows from {lakh(S_BASE)} to about {lakh(S_BULK)}.</p></div>
    <div class="ob"><span class="n">4</span><h3>Host bill of health: watch the tariff maths</h3><p>The two charges total ₹{ind(HOST_CHARGE_KW)} per kW a year against the host's energy savings of ₹{ind(round(HOST_SAVE_KW))} per kW a year at the ₹8.5 grid / ₹6.65 PPA reference, leaving the host about ₹{ind(round(-HOST_NET_KW))} per kW a year behind. A PPA rate at or below ₹{PPA_BREAK:.2f} per unit, or DISCOM tariffs above ₹{GRID_BREAK:.2f} per unit, restores a positive host net, so tariff-justified targeting or a rate review should accompany these charges.</p></div>
  </div>

  <h3 style="margin:26px 0 0;font-size:16px;color:var(--navy2);">Sensitivities on the decided charge structure</h3>
  <p class="lead">Fifteen-year cumulative P&amp;L under alternative AMC delivery costs and an optional 3% annual escalation on the owner charges. Users continue to receive credits at ₹6.65 per unit in every case.</p>
  <div class="scroll"><table class="tbl">
    <thead><tr><th>Case</th><th class="num">15-Year P&amp;L</th><th class="num">Difference vs base</th></tr></thead>
    <tbody>
      <tr><td>Base: charges flat, AMC delivered at the ₹2,500/kW/yr benchmark</td><td class="num neg">{rs(round(S_BASE))}</td><td class="num">-</td></tr>
      <tr><td>AMC delivered at the charged rate (bulk partners, ₹1,200/kW/yr)</td><td class="num {'neg' if S_BULK < 0 else 'pos'}">{rs(round(S_BULK))}</td><td class="num pos">{rs(round(S_BULK - S_BASE))}</td></tr>
      <tr><td>Owner charges escalate 3% per year (₹{ind(RECUR_CHARGE)} growing with O&amp;M inflation)</td><td class="num {'neg' if S_ESC < 0 else 'pos'}">{rs(round(S_ESC))}</td><td class="num pos">{rs(round(S_ESC - S_BASE))}</td></tr>
      <tr><td>Both: bulk AMC delivery and 3% escalation together</td><td class="num {'neg' if S_BOTH < 0 else 'pos'}">{rs(round(S_BOTH))}</td><td class="num pos">{rs(round(S_BOTH - S_BASE))}</td></tr>
    </tbody>
  </table></div>
  <div class="note"><b>Reading the sensitivities:</b> the decided charges transform the statement from the earlier {lakh(OLD_MODEL_PNL)} shortfall to {lakh(S_BASE)}, with Year 1 at break-even. Escalating the charges 3% per year, in line with O&amp;M inflation, is worth about {rs(round(S_ESC - S_BASE))} over the tenure, and securing AMC delivery at the charged rate is worth a further {rs(round(S_BULK - S_BASE))}; together they turn the 15-year position positive at about {lakh(S_BOTH)}. The residual lever is the host tariff maths in observation 4, which protects demand for the next listing.</div>
</div>
""")

# Footer
H.append(f"""
<p class="foot">GridKavach, a marketplace for Digital Solar, operated by Sreesamvridhi Enterprises Private Limited, Bhubaneswar, Odisha, India. Prepared {TODAY} for internal planning. All figures are indicative and pre-tax, based on the stated assumptions; actual results depend on the site survey, DISCOM approvals, metering arrangements and the executed agreements for each project.</p>
</div>
<div class="noprint" style="text-align:center;margin:-40px 0 40px;"><button class="btn" onclick="window.print()">Print / Save as PDF</button></div>
</body>
</html>
""")

html = "".join(H)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)

print("written:", OUT, len(html), "bytes")
print("check: T_GEN", round(T_GEN), "T_PPA", round(T_PPA), "T_REV", round(T_REV),
      "T_EXP", round(T_EXP), "T_PNL", round(T_PNL))
print("Y1: rev", round(Y1["revenue"]), "net", round(Y1["net"]), "exp", round(Y1["exp"]), "pnl", round(Y1["pnl"]))
print("Recurring: charges", RECUR_CHARGE, "Y2 exp", round(years[1]["exp"]), "Y2 pnl", round(years[1]["pnl"]))
print("Sensitivities: base", round(S_BASE), "bulk", round(S_BULK), "esc", round(S_ESC), "both", round(S_BOTH))
print("Old model 15-yr:", round(OLD_MODEL_PNL), "| Host net/kW/yr:", round(HOST_NET_KW, 2),
      "| PPA break", round(PPA_BREAK, 2), "| Grid break", round(GRID_BREAK, 2))
