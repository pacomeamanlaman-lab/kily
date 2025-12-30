"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Users, Briefcase, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import StepIndicator from "@/components/ui/StepIndicator";
import { mockSkills, skillCategories, cities } from "@/lib/mockData";

type UserType = "talent" | "neighbor" | "recruiter";

interface FormData {
  userType: UserType | null;
  name: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  selectedSkills: string[];
}

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    userType: null,
    name: "",
    email: "",
    phone: "",
    city: "",
    bio: "",
    selectedSkills: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { title: "Type de compte", description: "Choisissez votre profil" },
    { title: "Informations", description: "Vos coordonnées" },
    { title: "Compétences", description: "Vos talents" },
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

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email invalide";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Le téléphone est requis";
    }
    if (!formData.city.trim()) {
      newErrors.city = "La ville est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation Step 3
  const validateStep3 = () => {
    if (formData.userType === "talent" && formData.selectedSkills.length === 0) {
      setErrors({ skills: "Veuillez sélectionner au moins une compétence" });
      return false;
    }
    setErrors({});
    return true;
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
      isValid = validateStep2();
      if (isValid) {
        if (formData.userType === "talent") {
          setCurrentStep(3);
        } else {
          handleSubmit();
        }
      }
    } else if (currentStep === 3) {
      isValid = validateStep3();
      if (isValid) {
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
    // Sauvegarder dans localStorage (temporaire)
    localStorage.setItem("kily_user_data", JSON.stringify(formData));

    // Rediriger vers discover
    router.push("/discover");
  };

  const toggleSkill = (skillId: string) => {
    setFormData({
      ...formData,
      selectedSkills: formData.selectedSkills.includes(skillId)
        ? formData.selectedSkills.filter((id) => id !== skillId)
        : [...formData.selectedSkills, skillId],
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </button>

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
            <div className="space-y-4">
              {userTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.userType === type.type;

                return (
                  <Card
                    key={type.type}
                    variant="hover"
                    className={`p-6 cursor-pointer transition-all ${
                      isSelected ? "border-violet-500 bg-violet-600/10" : ""
                    }`}
                    onClick={() => setFormData({ ...formData, userType: type.type })}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-violet-600" : "bg-white/10"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">{type.title}</h3>
                        <p className="text-gray-400 text-sm">{type.description}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                          <ChevronRight className="w-4 h-4" />
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
            <h2 className="text-2xl font-bold mb-6">Vos informations</h2>
            <div className="space-y-4">
              <Input
                label="Nom complet"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
                placeholder="Ex: Amina Koné"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                placeholder="exemple@email.com"
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
                placeholder="+225 XX XX XX XX XX"
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ville
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full px-4 py-3 bg-white/5 border ${
                    errors.city ? "border-red-500" : "border-white/10"
                  } rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all`}
                >
                  <option value="">Sélectionnez une ville</option>
                  {cities.map((city) => (
                    <option key={city} value={city} className="bg-black">
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
              </div>
              {formData.userType === "talent" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio (optionnel)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                    placeholder="Présentez-vous en quelques mots..."
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Compétences (talents uniquement) */}
        {currentStep === 3 && formData.userType === "talent" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold mb-2">Vos compétences</h2>
            <p className="text-gray-400 mb-6">
              Sélectionnez les compétences que vous maîtrisez
            </p>

            <div className="space-y-6">
              {skillCategories.slice(0, 6).map((category) => {
                const categorySkills = mockSkills.filter(
                  (skill) => skill.category === category.id
                );

                if (categorySkills.length === 0) return null;

                return (
                  <div key={category.id}>
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">
                      {category.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {categorySkills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant={
                            formData.selectedSkills.includes(skill.id)
                              ? "primary"
                              : "secondary"
                          }
                          className="cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => toggleSkill(skill.id)}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {errors.skills && (
              <p className="text-red-400 text-sm mt-4">{errors.skills}</p>
            )}

            {formData.selectedSkills.length > 0 && (
              <div className="mt-6 p-4 bg-violet-600/10 border border-violet-500/30 rounded-xl">
                <p className="text-sm text-gray-300 mb-2">
                  Compétences sélectionnées ({formData.selectedSkills.length}) :
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedSkills.map((skillId) => {
                    const skill = mockSkills.find((s) => s.id === skillId);
                    return skill ? (
                      <Badge key={skillId} variant="primary" size="sm">
                        {skill.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={handleBack} className="flex-1">
            Retour
          </Button>
          <Button variant="primary" onClick={handleNext} className="flex-1">
            {currentStep === 3 || (currentStep === 2 && formData.userType !== "talent")
              ? "Terminer"
              : "Continuer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
