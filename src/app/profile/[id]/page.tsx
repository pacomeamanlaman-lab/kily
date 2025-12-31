"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle,
  MessageCircle,
  Briefcase,
  Star,
  User as UserIcon,
  Heart,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { mockTalents, mockReviews } from "@/lib/mockData";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import BottomSheet from "@/components/ui/BottomSheet";
import SkillBadge from "@/components/talent/SkillBadge";
import ReputationScore from "@/components/talent/ReputationScore";
import Toast from "@/components/ui/Toast";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReviewsDrawer, setShowReviewsDrawer] = useState(false);
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; visible: boolean }>({
    message: "",
    type: "success",
    visible: false,
  });

  // Récupérer le talent depuis les données mockées
  const talent = mockTalents.find((t) => t.id === params.id);

  if (!talent) {
    router.push("/not-found");
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
    });
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    setToast({
      message: isSaved
        ? `${talent.name} retiré des favoris`
        : `${talent.name} ajouté aux favoris`,
      type: isSaved ? "info" : "success",
      visible: true,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header avec image de fond */}
      <div className="relative h-96 sm:h-80 overflow-hidden">
        <img
          src={talent.avatar}
          alt={talent.name}
          className="w-full h-full object-cover blur-xl scale-110 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />

        {/* Boutons header */}
        <div className="absolute top-6 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10">
          <button
            onClick={() => router.back()}
            className="p-2.5 sm:p-3 bg-black/50 backdrop-blur-lg rounded-full hover:bg-black/70 transition-all"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={handleSave}
            className={`p-2.5 sm:p-3 backdrop-blur-lg rounded-full transition-all ${
              isSaved
                ? "bg-violet-600 hover:bg-violet-700"
                : "bg-black/50 hover:bg-black/70"
            }`}
          >
            <Heart
              className={`w-5 h-5 sm:w-6 sm:h-6 ${
                isSaved ? "fill-white text-white" : "text-white"
              }`}
            />
          </button>
        </div>

        {/* Avatar et info principale */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-black shadow-2xl">
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {talent.verified && (
                <div className="absolute -bottom-2 -right-2 bg-violet-600 p-2 rounded-full border-4 border-black">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {talent.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {talent.location.city}, {talent.location.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Membre depuis {formatDate(talent.joinedDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setShowContactModal(true)}
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contacter
                  </Button>
                  <Button variant="outline" size="lg">
                    <Briefcase className="w-5 h-5" />
                    Recruter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <Card variant="default" className="p-6">
              <h2 className="text-2xl font-bold mb-4">À propos</h2>
              <p className="text-gray-300 leading-relaxed">{talent.bio}</p>
            </Card>

            {/* Compétences */}
            <Card variant="default" className="p-6">
              <h2 className="text-2xl font-bold mb-6">Compétences</h2>
              <div className="space-y-4">
                {talent.skills.map((skill) => (
                  <div key={skill.id}>
                    <SkillBadge
                      skill={skill}
                      showLevel={true}
                      showExperience={true}
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Portfolio */}
            {talent.portfolio.length > 0 && (
              <Card variant="default" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Portfolio</h2>
                  <button
                    onClick={() => setShowPortfolioDrawer(true)}
                    className="sm:hidden text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
                  >
                    Voir tout ({talent.portfolio.length})
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {talent.portfolio.slice(0, 4).map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedImage(item.url)}
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-sm font-medium">{item.title}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Bouton voir plus desktop */}
                {talent.portfolio.length > 4 && (
                  <button
                    onClick={() => setShowPortfolioDrawer(true)}
                    className="hidden sm:block w-full mt-4 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
                  >
                    Voir les {talent.portfolio.length - 4} autres images
                  </button>
                )}
              </Card>
            )}

            {/* Avis */}
            <Card variant="default" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Avis ({mockReviews.length})
                </h2>
                <button
                  onClick={() => setShowReviewsDrawer(true)}
                  className="sm:hidden text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
                >
                  Voir tous
                </button>
              </div>
              <div className="space-y-6">
                {mockReviews.slice(0, 2).map((review) => (
                  <div
                    key={review.id}
                    className="flex gap-4 pb-6 border-b border-white/10 last:border-0"
                  >
                    <img
                      src={review.fromUserAvatar}
                      alt={review.fromUserName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{review.fromUserName}</h4>
                        <span className="text-sm text-gray-400">
                          {new Date(review.date).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-300">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Bouton voir plus desktop */}
              {mockReviews.length > 2 && (
                <button
                  onClick={() => setShowReviewsDrawer(true)}
                  className="hidden sm:block w-full mt-6 text-violet-400 text-sm font-medium hover:text-violet-300 transition-colors"
                >
                  Voir les {mockReviews.length - 2} autres avis
                </button>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Réputation */}
            <Card variant="glass" className="p-6">
              <h3 className="text-xl font-bold mb-4">Réputation</h3>
              <div className="space-y-4">
                <ReputationScore
                  rating={talent.rating}
                  reviewCount={talent.reviewCount}
                  size="lg"
                  showStars={true}
                />
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">5 étoiles</span>
                    <span className="text-sm font-medium">
                      {Math.round((talent.reviewCount * talent.rating) / 5)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">4 étoiles</span>
                    <span className="text-sm font-medium">
                      {Math.round((talent.reviewCount * 0.2))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">3 étoiles</span>
                    <span className="text-sm font-medium">
                      {Math.round((talent.reviewCount * 0.05))}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Type de profil */}
            <Card variant="glass" className="p-6">
              <h3 className="text-xl font-bold mb-4">Type de profil</h3>
              <Badge variant="primary" size="lg" className="w-full justify-center">
                <UserIcon className="w-4 h-4" />
                {talent.userType === "talent"
                  ? "Talent"
                  : talent.userType === "neighbor"
                  ? "Voisin"
                  : "Recruteur"}
              </Badge>
            </Card>

            {/* CTA */}
            <Card variant="default" className="p-6 bg-gradient-to-br from-violet-900/20 to-violet-600/10 border-violet-500/30">
              <h3 className="text-xl font-bold mb-2">Besoin d'un talent ?</h3>
              <p className="text-sm text-gray-300 mb-4">
                Contactez {talent.name.split(" ")[0]} pour discuter de votre projet
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowContactModal(true)}
              >
                Envoyer un message
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal image */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img
            src={selectedImage}
            alt="Portfolio"
            className="max-w-full max-h-[90vh] rounded-2xl"
          />
        </motion.div>
      )}

      {/* Modal contact */}
      {showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowContactModal(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-b from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src={talent.avatar} alt={talent.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Contacter {talent.name}</h2>
                <p className="text-sm text-gray-400">{talent.location.city}</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Envoyez un message à {talent.name.split(" ")[0]} pour discuter de votre projet.
            </p>

            <textarea
              placeholder="Bonjour, je suis intéressé(e) par vos services..."
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none mb-4"
            />

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowContactModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  setShowContactModal(false);
                  router.push("/messages");
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Sheet - Portfolio */}
      <BottomSheet
        isOpen={showPortfolioDrawer}
        onClose={() => setShowPortfolioDrawer(false)}
        title="Portfolio complet"
      >
        <div className="grid grid-cols-2 gap-4">
          {talent.portfolio.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => {
                setSelectedImage(item.url);
                setShowPortfolioDrawer(false);
              }}
            >
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </BottomSheet>

      {/* Bottom Sheet - Avis */}
      <BottomSheet
        isOpen={showReviewsDrawer}
        onClose={() => setShowReviewsDrawer(false)}
        title={`Tous les avis (${mockReviews.length})`}
      >
        <div className="space-y-6">
          {mockReviews.map((review) => (
            <div
              key={review.id}
              className="flex gap-4 pb-6 border-b border-white/10 last:border-0"
            >
              <img
                src={review.fromUserAvatar}
                alt={review.fromUserName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{review.fromUserName}</h4>
                  <span className="text-sm text-gray-400">
                    {new Date(review.date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-300">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
