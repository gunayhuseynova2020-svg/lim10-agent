import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { task } = await request.json();

    if (!task || typeof task !== "string" || task.trim().length < 2) {
      return NextResponse.json(
        { error: "Tapşırıq boş ola bilməz." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY əlavə edilməyib." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      instructions:
        "You are Gunay's practical personal assistant. Reply in clear Azerbaijani unless asked otherwise. Be concise, action-oriented, and honest. For now, do not claim you made calls, sent emails, booked appointments, or completed external actions. Instead, prepare the exact next steps, questions, scripts, and notes needed.",
      input: task.trim()
    });

    return NextResponse.json({
      answer: response.output_text || "Cavab alınmadı."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server xətası baş verdi." },
      { status: 500 }
    );
  }
}
