import { supabase } from "@/lib/supabase";

export interface IUser {
  id: string;
  email: string;
  password?: string | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(email: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();
  return data as IUser | null;
}

export async function getUserById(id: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  return data as IUser | null;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const { data: user } = await supabase
    .from("users")
    .insert({
      email: data.email.toLowerCase(),
      password: data.password,
      name: data.name,
    })
    .select()
    .single();
  return user as IUser | null;
}

export async function createUserFromOAuth(data: {
  email: string;
  name: string;
}) {
  const { data: user } = await supabase
    .from("users")
    .insert({
      email: data.email.toLowerCase(),
      password: null,
      name: data.name,
    })
    .select()
    .single();
  return user as IUser | null;
}
