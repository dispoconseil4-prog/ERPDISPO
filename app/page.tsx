import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import Link from "next/link";
import { Button } from "@/components/ui";

export default async function HomePage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-700">ERP-DISPO</h1>
          <p className="mt-2 text-gray-500">Logiciel de gestion comptable et financière</p>
        </div>
        <div className="space-y-4">
          <Link href="/auth/login"><Button className="w-full">Se connecter</Button></Link>
        </div>
      </div>
    </div>
  );
}
