import { getUserEmail } from "@/lib/auth-helper";
import { enforceBucketLimit } from "@/lib/plan-enforcer";
import { getBucketsByUserEmail, createBucket, bucketToJSON } from "@/models/Bucket";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userEmail = await getUserEmail(req);

  try {
    const buckets = await getBucketsByUserEmail(userEmail);
    return NextResponse.json(buckets.map((b) => bucketToJSON(b)));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userEmail = await getUserEmail(req);

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
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
