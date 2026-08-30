export const runtime = 'nodejs';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { CREDITS_PER_TYPE } from "@/lib/plan-guards";
import { refundCredits } from "@/models/UserSubscription";
import { getBucketById, updateBucket } from "@/models/Bucket";
import { getSourceById, deleteSource } from "@/models/Source";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userEmail = await getUserEmailOrNull(req);
  if (!userEmail) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const source = await getSourceById(id);

    if (!source) {
      return NextResponse.json({ error: "Fonte non trovata" }, { status: 404 });
    }

    const bucket = await getBucketById(source.bucket_id);

    if (!bucket || bucket.user_email !== userEmail) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const creditsCost = CREDITS_PER_TYPE[source.type] || 5;
    const creditResult = await refundCredits(userEmail, creditsCost);

    await deleteSource(id);

    await updateBucket(source.bucket_id, { updated_at: new Date().toISOString() });

    return NextResponse.json({
      success: true,
      creditsUsed: creditResult.creditsUsed,
      creditsRemaining: creditResult.creditsRemaining,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
