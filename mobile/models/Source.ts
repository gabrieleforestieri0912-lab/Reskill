import { supabase } from "@/lib/supabase";

export interface ISource {
  id: string;
  type: string;
  title: string;
  url: string;
  domain: string;
  date: string;
  content: string;
  skill_markdown: string;
  bucket_id: string;
  created_at: string;
  updated_at: string;
}

export function sourceToJSON(s: ISource & { bucketName?: string }) {
  return {
    id: s.id,
    type: s.type,
    title: s.title,
    url: s.url,
    domain: s.domain,
    date: s.date,
    content: s.content,
    skillMarkdown: s.skill_markdown,
    bucketId: s.bucket_id,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    bucketName: s.bucketName,
  };
}

export async function getSourcesByBucketIds(bucketIds: string[]) {
  if (bucketIds.length === 0) return [];
  const { data } = await supabase
    .from("sources")
    .select("*")
    .in("bucket_id", bucketIds);
  return (data || []) as ISource[];
}

export async function getSourcesByUserEmail(userEmail: string) {
  const { data: buckets } = await supabase
    .from("buckets")
    .select("id, name")
    .eq("user_email", userEmail);
  const bucketIds = (buckets || []).map((b) => b.id);
  if (bucketIds.length === 0) return [];
  const { data: sources } = await supabase
    .from("sources")
    .select("*")
    .in("bucket_id", bucketIds)
    .order("created_at", { ascending: false });
  const bucketMap = new Map((buckets || []).map((b) => [b.id, b.name]));
  return ((sources || []) as ISource[]).map((s) => ({
    ...s,
    bucketName: bucketMap.get(s.bucket_id) || "",
  }));
}

export async function createSource(data: {
  type: string;
  title: string;
  url: string;
  domain: string;
  date: string;
  content: string;
  skill_markdown: string;
  bucket_id: string;
}) {
  const { data: source } = await supabase
    .from("sources")
    .insert(data)
    .select()
    .single();
  return source as ISource | null;
}

export async function getSourceById(id: string) {
  const { data } = await supabase
    .from("sources")
    .select("*")
    .eq("id", id)
    .single();
  return data as ISource | null;
}

export async function deleteSource(id: string) {
  await supabase.from("sources").delete().eq("id", id);
}
