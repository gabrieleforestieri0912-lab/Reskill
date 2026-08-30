export const runtime = 'nodejs';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { enforceBucketLimit } from "@/lib/plan-enforcer";
import { getBucketsByUserEmail, createBucket, bucketToJSON } from "@/models/Bucket";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userEmail = await getUserEmailOrNull(req);
  if (!userEmail) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const buckets = await getBucketsByUserEmail(userEmail);
    return NextResponse.json(buckets.map((b) => bucketToJSON(b)));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userEmail = await getUserEmailOrNull(req);
  if (!userEmail) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  try {
    const error = await enforceBucketLimit(userEmail);
    if (error) {
      return NextResponse.json({ error, upgrade: true }, { status: 403 });
    }

    const { name, description } = await req.json();

    const bucket = await createBucket({
      name,
      description: description || "Nessuna descrizione fornita.",
      userEmail,
    });

    const bucketJSON = bucketToJSON(bucket!);
    bucketJSON.sources = [];

    return NextResponse.json(bucketJSON);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
