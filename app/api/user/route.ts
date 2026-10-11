export const runtime = 'nodejs';
import { NextResponse } from "next/server";
import { getUserEmailOrNull } from "@/lib/auth-helper";
import { getUserByEmail } from "@/models/User";
import { supabase } from "@/lib/supabase";

export async function PATCH(req: Request) {
  try {
    const email = await getUserEmailOrNull(req);
    if (!email) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome richiesto" }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    const { error } = await supabase
      .from("users")
      .update({ name: name.trim(), updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, name: name.trim() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Errore" }, { status: 500 });
  }
}
