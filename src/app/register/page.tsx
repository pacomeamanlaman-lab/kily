"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Users, Briefcase, ChevronRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import StepIndicator from "@/components/ui/StepIndicator";
import { countries, getCitiesByCountry, abidjanCommunes, requiresCommune } from "@/lib/locationData";

type UserType = "talent" | "neighbor" | "recruiter";

interface FormData {
  userType: UserType | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  commune: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    userType: null,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "Côte d'Ivoire", // Pays pilote pré-sélectionné
    city: "",
    commune: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const steps = [
    { title: "Type de compte", description: "Choisissez votre profil" },
    { title: "Informations", description: "Vos coordonnées" },
  ];

  const userTypes = [
    {
      type: "talent" as UserType,
      icon: User,
      title: "Talent",
      description: "Je veux montrer mes compétences",
      color: "violet",
    },
    {
      type: "neighbor" as UserType,
      icon: Users,
      title: "Voisin",
      description: "Je cherche des services de proximité",
      color: "blue",
    },
    {
      type: "recruiter" as UserType,
      icon: Briefcase,
      title: "Recruteur",
      description: "Je cherche des talents à recruter",
      color: "green",
    },
  ];

  // Validation Step 1
  const validateStep1 = () => {
    if (!formData.userType) {
      setErrors({ userType: "Veuillez sélectionner un type de compte" });
      return false;
    }
    setErrors({});
    return true;
  };

  // Validation Step 2
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    } else if (!/^[\d\s\+\-\(\)]{8,}$/.test(formData.phone)) {
      newErrors.phone = "Numéro de téléphone invalide";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Le pays est requis";
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ville est requise";
    }

    // Validation commune si nécessaire
    if (requiresCommune(formData.country, formData.city)) {
      if (!formData.commune.trim()) {
        newErrors.commune = "La commune est requise pour Abidjan";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Real-time validation for individual fields
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "firstName":
        if (!value.trim()) {
          newErrors.firstName = "Le prénom est requis";
        } else if (value.trim().length < 2) {
          newErrors.firstName = "Le prénom doit contenir au moins 2 caractères";
        } else {
          delete newErrors.firstName;
        }
        break;

      case "lastName":
        if (!value.trim()) {
          newErrors.lastName = "Le nom est requis";
        } else if (value.trim().length < 2) {
          newErrors.lastName = "Le nom doit contenir au moins 2 caractères";
        } else {
          delete newErrors.lastName;
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Format d'email invalide";
        } else {
          delete newErrors.email;
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Le téléphone est requis";
        } else if (!/^[\d\s\+\-\(\)]{8,}$/.test(value)) {
          newErrors.phone = "Numéro de téléphone invalide";
        } else {
          delete newErrors.phone;
        }
        break;

      case "country":
        if (!value.trim()) {
          newErrors.country = "Le pays est requis";
        } else {
          delete newErrors.country;
          // Réinitialiser ville et commune si le pays change
          if (formData.country !== value) {
            setFormData(prev => ({ ...prev, city: "", commune: "" }));
          }
        }
        break;

      case "city":
        if (!value.trim()) {
          newErrors.city = "La ville est requise";
        } else {
          delete newErrors.city;
          // Réinitialiser commune si la ville change et n'est plus Abidjan
          if (formData.city !== value && !requiresCommune(formData.country, value)) {
            setFormData(prev => ({ ...prev, commune: "" }));
          }
        }
        break;

      case "commune":
        if (requiresCommune(formData.country, formData.city)) {
          if (!value.trim()) {
            newErrors.commune = "La commune est requise pour Abidjan";
          } else {
            delete newErrors.commune;
          }
        } else {
          delete newErrors.commune;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
      if (isValid && formData.userType !== "talent") {
        // Si pas talent, skip step 3
        setCurrentStep(2);
      } else if (isValid) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
        city: true,
        commune: requiresCommune(formData.country, formData.city),
      });
      
      isValid = validateStep2();
      if (isValid) {
        // Tous les utilisateurs vont directement à l'onboarding après step 2
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    // Import createUser dynamically to avoid SSR issues
    import("@/lib/users").then(({ createUser }) => {
      try {
        // Create user in the system (bio and skills will be filled in onboarding)
        const newUser = createUser({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          commune: formData.commune || undefined,
          bio: "", // Will be filled in onboarding
          userType: formData.userType!,
          selectedSkills: [], // Will be filled in onboarding
        });

        // Also save in old format for backward compatibility
        localStorage.setItem("kily_user_data", JSON.stringify(formData));

        // Login the user
        import("@/lib/auth").then(({ login }) => {
          login(formData.email);
        });

        // Rediriger vers onboarding (nouvel utilisateur)
        router.push("/onboarding");
      } catch (error: any) {
        // Handle error (e.g., email already exists)
        setErrors({ email: error.message || "Une erreur est survenue" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
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

      <div className="flex-1 max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 lg:pb-16">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Créer un <span className="text-violet-500">compte</span>
          </h1>
          <p className="text-gray-400">
            Rejoignez Kily et valorisez vos talents
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={formData.userType === "talent" ? 3 : 2}
          steps={formData.userType === "talent" ? steps : steps.slice(0, 2)}
        />

        {/* Step 1: Type utilisateur */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold mb-6">Quel est votre profil ?</h2>
            <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
              {userTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.userType === type.type;

                return (
                  <Card
                    key={type.type}
                    variant="hover"
                    className={`p-6 lg:p-8 cursor-pointer transition-all ${
                      isSelected ? "border-violet-500 bg-violet-600/10" : ""
                    }`}
                    onClick={() => {
                      setFormData({ ...formData, userType: type.type });
                      // Scroll vers les boutons en desktop après un court délai
                      if (window.innerWidth >= 1024) {
                        setTimeout(() => {
                          buttonsRef.current?.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'end' 
                          });
                        }, 300);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 lg:flex-col lg:text-center">
                      <div
                        className={`w-12 h-12 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isSelected ? "bg-violet-600" : "bg-white/10"
                        }`}
                      >
                        <Icon className="w-6 h-6 lg:w-10 lg:h-10" />
                      </div>
                      <div className="flex-1 lg:flex-none">
                        <h3 className="text-xl lg:text-2xl font-semibold mb-1 lg:mb-2">{type.title}</h3>
                        <p className="text-gray-400 text-sm lg:text-base">{type.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 lg:w-10 lg:h-10 bg-violet-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-4 h-4 lg:w-6 lg:h-6" />
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            {errors.userType && (
              <p className="text-red-400 text-sm mt-4">{errors.userType}</p>
            )}
          </motion.div>
        )}

        {/* Step 2: Informations de base */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8">Vos informations</h2>
            
            {/* Message d'erreur global si des champs sont invalides */}
            {Object.keys(errors).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 lg:mb-8 p-4 lg:p-6 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <p className="text-red-400 font-semibold mb-2 lg:text-lg">
                  Veuillez corriger les erreurs suivantes :
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm lg:text-base text-red-300">
                  {errors.firstName && <li>{errors.firstName}</li>}
                  {errors.lastName && <li>{errors.lastName}</li>}
                  {errors.email && <li>{errors.email}</li>}
                  {errors.phone && <li>{errors.phone}</li>}
                  {errors.country && <li>{errors.country}</li>}
                  {errors.city && <li>{errors.city}</li>}
                  {errors.commune && <li>{errors.commune}</li>}
                </ul>
              </motion.div>
            )}
            
            <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
              <Input
                label="Nom"
                type="text"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value });
                  if (touched.lastName) {
                    validateField("lastName", e.target.value);
                  }
                }}
                onBlur={() => {
                  setTouched({ ...touched, lastName: true });
                  validateField("lastName", formData.lastName);
                }}
                error={touched.lastName ? errors.lastName : undefined}
                placeholder="Ex: Koné"
              />
              <Input
                label="Prénom(s)"
                type="text"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value });
                  if (touched.firstName) {
                    validateField("firstName", e.target.value);
                  }
                }}
                onBlur={() => {
                  setTouched({ ...touched, firstName: true });
                  validateField("firstName", formData.firstName);
                }}
                error={touched.firstName ? errors.firstName : undefined}
                placeholder="Ex: Amina"
              />
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
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (touched.phone) {
                    validateField("phone", e.target.value);
                  }
                }}
                onBlur={() => {
                  setTouched({ ...touched, phone: true });
                  validateField("phone", formData.phone);
                }}
                error={touched.phone ? errors.phone : undefined}
                placeholder="+225 XX XX XX XX XX"
              />
              <div>
                <label className="block text-sm lg:text-base font-medium text-gray-300 mb-2 lg:mb-3">
                  Pays
                </label>
                <div className="w-full px-4 py-3 lg:px-6 lg:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm lg:text-base opacity-60 cursor-not-allowed">
                  {formData.country}
                </div>
                <p className="text-xs lg:text-sm text-gray-400 mt-1.5 lg:mt-2">
                  Disponible dans ce pays pour l'instant
                </p>
              </div>
              <div>
                <label className="block text-sm lg:text-base font-medium text-gray-300 mb-2 lg:mb-3">
                  Ville
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => {
                    const newCity = e.target.value;
                    setFormData({ 
                      ...formData, 
                      city: newCity,
                      commune: requiresCommune(formData.country, newCity) ? formData.commune : ""
                    });
                    if (touched.city) {
                      validateField("city", newCity);
                    }
                  }}
                  onBlur={() => {
                    setTouched({ ...touched, city: true });
                    validateField("city", formData.city);
                  }}
                  disabled={!formData.country}
                  className={`w-full px-4 py-3 lg:px-6 lg:py-4 bg-white/5 border ${
                    touched.city && errors.city ? "border-red-500" : "border-white/10"
                  } rounded-xl text-white text-sm lg:text-base focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="" className="bg-gray-900 text-gray-400">{formData.country ? "Sélectionnez une ville" : "Sélectionnez d'abord un pays"}</option>
                  {formData.country && getCitiesByCountry(formData.country).map((city) => (
                    <option key={city} value={city} className="bg-gray-900 text-white">
                      {city}
                    </option>
                  ))}
                </select>
                {touched.city && errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
              </div>
              {/* Champ commune uniquement si Côte d'Ivoire et Abidjan sont sélectionnés */}
              {requiresCommune(formData.country, formData.city) && (
                <div className="lg:col-span-2">
                  <label className="block text-sm lg:text-base font-medium text-gray-300 mb-2 lg:mb-3">
                    Commune à Abidjan
                  </label>
                  <select
                    value={formData.commune}
                    onChange={(e) => {
                      setFormData({ ...formData, commune: e.target.value });
                      if (touched.commune) {
                        validateField("commune", e.target.value);
                      }
                    }}
                    onBlur={() => {
                      setTouched({ ...touched, commune: true });
                      validateField("commune", formData.commune);
                    }}
                    className={`w-full px-4 py-3 lg:px-6 lg:py-4 bg-white/5 border ${
                      touched.commune && errors.commune ? "border-red-500" : "border-white/10"
                    } rounded-xl text-white text-sm lg:text-base focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                  >
                    <option value="" className="bg-gray-900 text-gray-400">Sélectionnez votre commune</option>
                    {abidjanCommunes.map((commune) => (
                      <option key={commune} value={commune} className="bg-gray-900 text-white">
                        {commune}
                      </option>
                    ))}
                  </select>
                  {touched.commune && errors.commune && <p className="text-red-400 text-sm mt-1">{errors.commune}</p>}
                </div>
              )}
              {formData.userType === "talent" && (
                <div className="lg:col-span-2">
                  <label className="block text-sm lg:text-base font-medium text-gray-300 mb-2 lg:mb-3">
                    Bio (optionnel)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 lg:px-6 lg:py-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm lg:text-base placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                    placeholder="Présentez-vous en quelques mots..."
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Buttons - Sticky en bas */}
      <div ref={buttonsRef} className="sticky bottom-0 z-30 bg-black/95 backdrop-blur-lg border-t border-white/10 lg:border-t-0 lg:bg-transparent lg:relative lg:mt-8 mb-6 lg:mb-8">
        <div className="max-w-2xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-0">
          <div className="flex gap-4 lg:justify-end">
            <Button variant="secondary" onClick={handleBack} className="flex-1 lg:flex-none lg:min-w-[150px]">
              Retour
            </Button>
            <Button variant="primary" onClick={handleNext} className="flex-1 lg:flex-none lg:min-w-[200px]">
              {currentStep === 2 ? "Créer mon compte" : "Continuer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
