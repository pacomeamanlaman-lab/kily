// Component to protect routes - redirects to login if not authenticated (Supabase version)

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn } from "@/lib/supabase/auth.service";
import { getCurrentUser } from "@/lib/supabase/users.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();

      if (!loggedIn) {
        // Save the intended destination
        sessionStorage.setItem("redirectAfterLogin", pathname);
        router.push("/login");
        return;
      }

      // Vérifier le status de l'utilisateur
      const user = await getCurrentUser();
      
      if (!user) {
        // Si getCurrentUser retourne null, l'utilisateur a peut-être été banni/suspendu
        router.push("/login");
        return;
      }

      if (user.status === 'banned' || user.status === 'suspended') {
        // L'utilisateur est banni ou suspendu, rediriger vers login avec message d'erreur
        router.push(`/login?error=${user.status}`);
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Vérification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


