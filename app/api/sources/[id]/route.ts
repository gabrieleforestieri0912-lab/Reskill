import { getUserEmail } from "@/lib/auth-helper";
import { getBucketById, updateBucket } from "@/models/Bucket";
import { getSourceById, deleteSource } from "@/models/Source";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userEmail = await getUserEmail(req);
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

    await deleteSource(id);

    await updateBucket(source.bucket_id, { updated_at: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
