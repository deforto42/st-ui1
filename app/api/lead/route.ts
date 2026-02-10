import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;

export async function POST(req: NextRequest) {
  if (!GOOGLE_SHEET_WEBHOOK_URL) {
    console.error("GOOGLE_SHEET_WEBHOOK_URL is not configured");
    return NextResponse.json(
      { ok: false, error: "server not configured" },
      { status: 500 }
    );
  }

  const body = await req.json();

  try {
    const res = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("Google Sheets webhook error", await res.text());
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Google Sheets webhook exception", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

