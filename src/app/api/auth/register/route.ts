import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, password, utilityName, consumerNumber, state } = body ?? {};

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: "Name, email, phone and password are required." }, { status: 400 });
    }
    const emailNorm = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(String(phone).replace(/\s|-/g, ""))) {
      return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: emailNorm } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        name: String(name).trim(),
        email: emailNorm,
        phone: String(phone).trim(),
        passwordHash: hashPassword(String(password)),
        utilityName: utilityName ? String(utilityName).trim() : null,
        consumerNumber: consumerNumber ? String(consumerNumber).trim() : null,
        state: state ? String(state).trim() : null,
      },
    });

    await setSessionCookie(user.id);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (e) {
    console.error("register error", e);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
