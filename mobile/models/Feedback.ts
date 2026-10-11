import { supabase } from "@/lib/supabase";

export interface IFeedback {
  id: string;
  name: string;
  email: string;
  type: "suggestion" | "bug" | "other";
  message: string;
  created_at: string;
}

export async function createFeedback(data: {
  name: string;
  email: string;
  type: string;
  message: string;
}) {
  const { data: feedback } = await supabase
    .from("feedbacks")
    .insert(data)
    .select()
    .single();
  return feedback as IFeedback | null;
}
