import { getUserEmail, getUserEmailOrNull } from "@/lib/auth-helper";
import { getSourcesByUserEmail, getSourceById, sourceToJSON } from "@/models/Source";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userEmail = await getUserEmailOrNull(req);
  if (!userEmail) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    // Support ?single=id to get a specific source
    const singleId = req.nextUrl.searchParams.get("single");
    if (singleId) {
      const source = await getSourceById(singleId);
      if (!source) {
        return NextResponse.json({ error: "Risorsa non trovata" }, { status: 404 });
      }
      return NextResponse.json(sourceToJSON(source));
    }

    const sources = await getSourcesByUserEmail(userEmail);
    return NextResponse.json(sources.map((s: any) => ({
      ...sourceToJSON(s),
      bucketName: (s as any).bucketName,
    })));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
