/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUserEmail } from "@/lib/auth-helper";
import { enforceSourceLimit } from "@/lib/plan-enforcer";
import { getBucketById, updateBucket } from "@/models/Bucket";
import { createSource, sourceToJSON } from "@/models/Source";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userEmail = await getUserEmail(req);
  const { id: bucketId } = await params;

  try {
    const { type, title, url, domain, date, content, skillMarkdown } = await req.json();

    const bucket = await getBucketById(bucketId);

    if (!bucket || bucket.user_email !== userEmail) {
      return NextResponse.json({ error: "Non autorizzato o bucket inesistente" }, { status: 403 });
    }

    const limitError = await enforceSourceLimit(userEmail);
    if (limitError) {
      return NextResponse.json({ error: limitError, upgrade: true }, { status: 403 });
    }

    const source = await createSource({
      type,
      title,
      url,
      domain,
      date: date || new Date().toISOString().split("T")[0],
      content,
      skill_markdown: skillMarkdown,
      bucket_id: bucketId,
    });

    await updateBucket(bucketId, { updated_at: new Date().toISOString() });

    return NextResponse.json(sourceToJSON(source!));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
