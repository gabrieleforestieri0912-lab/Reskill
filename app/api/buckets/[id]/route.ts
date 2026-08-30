export const runtime = 'nodejs';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { getBucketById, updateBucket, deleteBucket, bucketToJSON } from "@/models/Bucket";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userEmail = await getUserEmailOrNull(req);
  if (!userEmail) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const { generatedSkill, description, name } = await req.json();

    const existing = await getBucketById(id);

    if (!existing || existing.user_email !== userEmail) {
      return NextResponse.json({ error: "Non autorizzato o bucket inesistente" }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (generatedSkill !== undefined) updateData.generated_skill = generatedSkill;
    if (description !== undefined) updateData.description = description;
    if (name !== undefined) updateData.name = name;

    const updated = await updateBucket(id, updateData);
    return NextResponse.json(bucketToJSON(updated!));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const existing = await getBucketById(id);

    if (!existing || existing.user_email !== userEmail) {
      return NextResponse.json({ error: "Non autorizzato o bucket inesistente" }, { status: 403 });
    }

    await deleteBucket(id);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
