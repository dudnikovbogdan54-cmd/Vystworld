"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
export default function SignOutButton(){const router=useRouter();return <button className="btn" onClick={async()=>{await createClient().auth.signOut();router.push("/");router.refresh();}}>Выйти ↗</button>}
