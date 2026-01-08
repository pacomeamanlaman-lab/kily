"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { login, isLoggedIn } from "@/lib/supabase/auth.service";
import { getRedirectPath } from "@/lib/supabase/users.service";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Vérifier les paramètres d'URL pour les erreurs de bannissement/suspension
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'banned') {
      setErrors({ email: 'Votre compte a été banni. Veuillez contacter le support pour plus d\'informations.' });
    } else if (errorParam === 'suspended') {
      setErrors({ email: 'Votre compte a été suspendu. Veuillez contacter le support pour plus d\'informations.' });
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = await isLoggedIn();
      if (loggedIn) {
        router.push("/feed");
      }
    };
    checkAuth();
  }, [router]);

  // Validation temps réel
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "email":
        if (!value.trim()) {
          newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Format d'email invalide (ex: exemple@email.com)";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value.trim()) {
          newErrors.password = "Le mot de passe est requis";
        } else if (value.length < 6) {
          newErrors.password = "Minimum 6 caractères";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Connexion avec Google OAuth
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      // Utiliser l'URL actuelle (production ou localhost selon l'environnement)
      // En production, utiliser toujours l'URL de production pour éviter les redirections vers localhost
      let redirectUrl = '/auth/callback';
      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        // Si on est en production (pas localhost), utiliser l'URL de production
        if (origin.includes('vercel.app') || origin.includes('kily')) {
          redirectUrl = `${origin}/auth/callback`;
        } else if (!origin.includes('localhost')) {
          // Si ce n'est pas localhost, utiliser l'origine actuelle
          redirectUrl = `${origin}/auth/callback`;
        } else {
          // En localhost, utiliser localhost
          redirectUrl = `${origin}/auth/callback`;
        }
      }
      
      console.log('🔗 URL de redirection OAuth:', redirectUrl);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Erreur Google login:', error);
        setErrors({ email: 'Erreur lors de la connexion avec Google' });
        setIsGoogleLoading(false);
      }
      // Si succès, l'utilisateur sera redirigé vers Google puis vers /auth/callback
    } catch (error) {
      console.error('Erreur Google login:', error);
      setErrors({ email: 'Erreur lors de la connexion avec Google' });
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider tous les champs
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide (ex: exemple@email.com)";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est requis";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 caractères";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        // Connexion Supabase
        const { success, user, error } = await login(formData.email, formData.password);

        if (!success || !user) {
          // User not found or password incorrect - show error
          setErrors({ email: error || "Email ou mot de passe incorrect" });
          setIsLoading(false);
          return;
        }

        // Redirect to intended page or user-specific default
        const intendedPath = sessionStorage.getItem("redirectAfterLogin");
        sessionStorage.removeItem("redirectAfterLogin");

        // Use intended path if exists, otherwise get user-specific redirect
        const redirectPath = intendedPath || getRedirectPath(user);
        router.push(redirectPath);
      } catch (error: any) {
        setErrors({ email: "Une erreur est survenue lors de la connexion" });
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">Kily</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Bon retour sur <span className="text-violet-500">Kily</span>
          </h1>
          <p className="text-gray-400">Connectez-vous pour continuer</p>
        </motion.div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (touched.email) {
                validateField("email", e.target.value);
              }
            }}
            onBlur={() => {
              setTouched({ ...touched, email: true });
              validateField("email", formData.email);
            }}
            error={touched.email ? errors.email : undefined}
            placeholder="exemple@email.com"
            icon={<Mail className="w-5 h-5" />}
          />

          <div className="relative">
            <Input
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (touched.password) {
                  validateField("password", e.target.value);
                }
              }}
              onBlur={() => {
                setTouched({ ...touched, password: true });
                validateField("password", formData.password);
              }}
              error={touched.password ? errors.password : undefined}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 bg-white/5 border border-white/10 rounded accent-violet-500"
              />
              <span className="text-gray-400">Se souvenir de moi</span>
            </label>
            <button
              type="button"
              className="text-violet-500 hover:text-violet-400 transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connexion...
              </div>
            ) : (
              "Se connecter"
            )}
          </Button>
        </motion.form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-gray-400">ou</span>
          </div>
        </div>

        {/* Social Login (Mockés) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Connexion...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continuer avec Google</span>
              </>
            )}
          </button>

        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-gray-400"
        >
          Vous n&apos;avez pas de compte ?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-violet-500 hover:text-violet-400 font-semibold transition-colors"
          >
            Créer un compte
          </button>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
