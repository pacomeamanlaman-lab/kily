// Component to protect admin routes - redirects to login if not authenticated or not admin

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isLoggedIn } from "@/lib/supabase/auth.service";
import { isAdmin } from "@/lib/supabase/admin.service";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export default function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
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

      // Check if user is admin
      const userIsAdmin = await isAdmin();
      
      if (!userIsAdmin) {
        // User is logged in but not admin - redirect to feed
        router.push("/feed");
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
          <p className="text-gray-400">Vérification des droits administrateur...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}




