export const runtime = 'nodejs';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { getSourcesByUserEmail, getSourceById, sourceToJSON } from "@/models/Source";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userEmail = await getUserEmailOrNull(req);
  if (!userEmail) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const singleId = req.nextUrl.searchParams.get("single");
    if (singleId) {
      const source = await getSourceById(singleId);
      if (!source) {
        return NextResponse.json({ error: "Risorsa non trovata" }, { status: 404 });
      }
      return NextResponse.json(sourceToJSON(source));
    }

    const sources = await getSourcesByUserEmail(userEmail);
    return NextResponse.json(sources.map((s) => sourceToJSON(s)));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
