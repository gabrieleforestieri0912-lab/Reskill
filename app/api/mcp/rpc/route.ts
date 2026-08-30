export const runtime = 'nodejs';
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { checkRateLimit } from "@/lib/rate-limit";
import { getBucketsByUserEmail, getBucketByUserAndName } from "@/models/Bucket";
import { getSourcesByUserEmail, createSource, sourceToJSON } from "@/models/Source";
import { extractUrl } from "@/lib/extract";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

interface RpcParams {
  method?: string;
  params?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const userEmail = await getUserEmailOrNull(req);
  if (!userEmail) {
    return NextResponse.json({ error: "Autenticazione richiesta" }, { status: 401 });
  }

  const body: RpcParams = await req.json().catch(() => ({}));
  const method = body.method;
  const params: Record<string, unknown> = body.params || {};

  if (!method || typeof method !== "string") {
    return NextResponse.json({ error: "Metodo mancante" }, { status: 400 });
  }

  const rateKey = `mcp:${method}:${userEmail}`;
  if (!await checkRateLimit(rateKey, 60, 60 * 1000)) {
    return NextResponse.json(
      { error: "Troppe richieste. Riprova tra qualche secondo." },
      { status: 429 }
    );
  }

  try {
    switch (method) {
      case "list_buckets":
        return handleListBuckets(userEmail);
      case "search_sources":
        return handleSearchSources(userEmail, params);
      case "capture_webpage":
        return handleCaptureWebpage(userEmail, params);
      default:
        return NextResponse.json({ error: `Metodo sconosciuto: ${method}` }, { status: 400 });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleListBuckets(userEmail: string) {
  const buckets = await getBucketsByUserEmail(userEmail);
  return NextResponse.json(
    buckets.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      sourceCount: (b.sources || []).length,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }))
  );
}

async function handleSearchSources(userEmail: string, params: Record<string, unknown>) {
  const q = (params.query as string | undefined)?.toString().trim().toLowerCase() || "";
  const bucketId = params.bucketId ? (params.bucketId as string).toString() : null;

  const all = await getSourcesByUserEmail(userEmail);
  const filtered = all.filter((s) => {
    if (bucketId && s.bucket_id !== bucketId) return false;
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      s.domain.toLowerCase().includes(q) ||
      s.type.toLowerCase().includes(q)
    );
  });

  return NextResponse.json(filtered.map(sourceToJSON));
}

async function handleCaptureWebpage(userEmail: string, params: Record<string, unknown>) {
  const url = params.url as string | undefined;
  const bucketName = params.bucketName as string | undefined;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL non valido" }, { status: 400 });
  }
  if (!bucketName || typeof bucketName !== "string") {
    return NextResponse.json({ error: "bucketName obbligatorio" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "URL malformato" }, { status: 400 });
  }

  const bucket = await getBucketByUserAndName(userEmail, bucketName);
  if (!bucket) {
    return NextResponse.json(
      { error: `Bucket "${bucketName}" non trovato. Usa list_buckets per vedere i tuoi bucket.` },
      { status: 404 }
    );
  }

  const result = await extractUrl(url);
  const source = await createSource({
    type: result.type,
    title: result.title,
    url: result.url,
    domain: result.domain,
    date: result.date,
    content: result.content,
    skill_markdown: "",
    bucket_id: bucket.id,
  });

  if (!source) {
    return NextResponse.json({ error: "Errore nel salvataggio della fonte" }, { status: 500 });
  }

  return NextResponse.json(sourceToJSON(source));
}