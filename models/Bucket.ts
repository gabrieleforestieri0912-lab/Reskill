import { supabase } from "@/lib/supabase";

export interface IBucket {
  id: string;
  name: string;
  description: string;
  user_email: string;
  generated_skill: string | null;
  created_at: string;
  updated_at: string;
  sources?: ISourceRow[];
}

interface ISourceRow {
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT");
}

export function bucketToJSON(b: IBucket & { sources?: ISourceRow[] }) {
  return {
    id: b.id,
    name: b.name,
    description: b.description,
    userEmail: b.user_email,
    generatedSkill: b.generated_skill,
    createdAt: b.created_at,
    updatedAt: formatDate(b.updated_at),
    sources: (b.sources || []).map((s) => ({
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
    })),
  };
}

export async function getBucketsByUserEmail(userEmail: string) {
  const { data } = await supabase
    .from("buckets")
    .select("*, sources(*)")
    .eq("user_email", userEmail)
    .order("updated_at", { ascending: false });
  return (data || []) as (IBucket & { sources: ISourceRow[] })[];
}

export async function getBucketById(id: string) {
  const { data } = await supabase
    .from("buckets")
    .select("*, sources(*)")
    .eq("id", id)
    .single();
  return data as (IBucket & { sources: ISourceRow[] }) | null;
}

export async function createBucket(data: {
  name: string;
  description: string;
  userEmail: string;
}) {
  const { data: bucket } = await supabase
    .from("buckets")
    .insert({
      name: data.name,
      description: data.description,
      user_email: data.userEmail,
    })
    .select()
    .single();
  return bucket as IBucket | null;
}

export async function updateBucket(
  id: string,
  data: {
    generated_skill?: string;
    description?: string;
    name?: string;
    updated_at?: string;
  }
) {
  const payload: Record<string, unknown> = { ...data };
  if (data.generated_skill !== undefined)
    payload.generated_skill = data.generated_skill;
  if (data.description !== undefined) payload.description = data.description;
  if (data.name !== undefined) payload.name = data.name;
  if (data.updated_at !== undefined) payload.updated_at = data.updated_at;

  const { data: bucket } = await supabase
    .from("buckets")
    .update(payload)
    .eq("id", id)
    .select("*, sources(*)")
    .single();
  return bucket as (IBucket & { sources: ISourceRow[] }) | null;
}

export async function deleteBucket(id: string) {
  await supabase.from("sources").delete().eq("bucket_id", id);
  await supabase.from("buckets").delete().eq("id", id);
}
