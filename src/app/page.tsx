"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Briefcase,
  CheckCircle,
  Zap,
  Globe,
  Hammer,
  ChefHat,
  Code,
  Palette,
  Wrench,
  Camera,
  Menu,
  X
} from "lucide-react";
import { useRef, useState } from "react";

// Mock data pour les talents populaires
const popularTalents = [
  {
    id: 1,
    name: "Amina Koné",
    skill: "Cuisinière",
    category: "Cuisine",
    rating: 4.9,
    reviews: 127,
    location: "Abidjan, Côte d'Ivoire",
    verified: true,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
  },
  {
    id: 2,
    name: "Kofi Mensah",
    skill: "Développeur Web",
    category: "Tech",
    rating: 4.8,
    reviews: 89,
    location: "Accra, Ghana",
    verified: true,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: 3,
    name: "Fatoumata Diallo",
    skill: "Couturière",
    category: "Artisanat",
    rating: 5.0,
    reviews: 203,
    location: "Dakar, Sénégal",
    verified: true,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
  },
  {
    id: 4,
    name: "Jean-Pierre Kamga",
    skill: "Électricien",
    category: "Bricolage",
    rating: 4.7,
    reviews: 156,
    location: "Yaoundé, Cameroun",
    verified: true,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  },
];

// Catégories de compétences
const categories = [
  { name: "Cuisine", icon: ChefHat, color: "violet" },
  { name: "Tech", icon: Code, color: "violet" },
  { name: "Artisanat", icon: Palette, color: "violet" },
  { name: "Bricolage", icon: Hammer, color: "violet" },
  { name: "Mécanique", icon: Wrench, color: "violet" },
  { name: "Photographie", icon: Camera, color: "violet" },
];

// Fonctionnalités
const features = [
  {
    icon: Award,
    title: "Talents Bruts",
    description: "Pas de diplôme requis, juste vos compétences réelles",
  },
  {
    icon: Users,
    title: "Communauté Locale",
    description: "Connectez-vous avec vos voisins et professionnels",
  },
  {
    icon: Briefcase,
    title: "Opportunités Pro",
    description: "Entreprises recrutent des talents autodidactes",
  },
  {
    icon: Globe,
    title: "100% Africain",
    description: "Valorisation des talents du continent",
  },
];

export default function Home() {
  const ref = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden pb-20 sm:pb-0">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-lg border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">Kily</span>
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#talents" className="hover:text-violet-500 transition-colors">Talents</a>
              <a href="#categories" className="hover:text-violet-500 transition-colors">Catégories</a>
              <a href="#features" className="hover:text-violet-500 transition-colors">Fonctionnalités</a>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <a href="/login">
                <button className="hover:text-violet-500 transition-colors">
                  Connexion
                </button>
              </a>
              <a href="/register">
                <button className="bg-violet-600 hover:bg-violet-700 px-6 py-2 rounded-full font-medium transition-all hover:scale-105">
                  S'inscrire
                </button>
              </a>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              <a href="/register">
                <button className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-full text-sm font-medium transition-all">
                  S'inscrire
                </button>
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 py-4"
            >
              <div className="flex flex-col gap-4">
                <a
                  href="#talents"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Talents
                </a>
                <a
                  href="#categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Catégories
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Fonctionnalités
                </a>
                <a
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Connexion
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-black to-black" />

        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/30 px-4 py-2 rounded-full mb-8"
          >
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-violet-300">Valorisez vos talents sans diplôme</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Vos compétences valent
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-violet-600 text-transparent bg-clip-text">
              plus qu'un diplôme
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
          >
            Connectez-vous avec vos voisins, partagez vos talents et trouvez des opportunités professionnelles.
            Kily valorise vos compétences réelles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="/register">
              <button className="group bg-violet-600 hover:bg-violet-700 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center">
                <Zap className="w-5 h-5" />
                Commencer maintenant
                <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </a>
            <button className="hidden sm:block border-2 border-white/20 hover:border-violet-500 px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105">
              En savoir plus
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              <span>10K+ talents</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-violet-500" />
              <span>50+ compétences</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-500" />
              <span>500+ recruteurs</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-violet-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* Séparateur */}
      <div className="max-w-3xl mx-auto h-[2px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent opacity-90" />

      {/* Talents populaires */}
      <section id="talents" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-violet-950/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Talents <span className="text-violet-500">populaires</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Découvrez des professionnels talentueux de votre région
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTalents.map((talent, index) => (
              <a key={talent.id} href={`/profile/${talent.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative bg-gradient-to-b from-white/5 to-white/0 border border-white/10 rounded-2xl overflow-hidden cursor-pointer"
                >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={talent.image}
                    alt={talent.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{talent.name}</h3>
                    {talent.verified && (
                      <CheckCircle className="w-4 h-4 text-violet-500 fill-violet-500" />
                    )}
                  </div>
                  <p className="text-violet-400 font-medium mb-1">{talent.skill}</p>
                  <p className="text-sm text-gray-400 mb-3">{talent.location}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">{talent.rating}</span>
                      <span className="text-sm text-gray-400">({talent.reviews})</span>
                    </div>
                    <button className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-full text-sm font-medium transition-all group-hover:scale-105">
                      Contacter
                    </button>
                  </div>
                </div>
              </motion.div>
              </a>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <a href="/discover">
              <button className="border-2 border-violet-500 hover:bg-violet-600 px-8 py-3 rounded-full font-medium transition-all hover:scale-105">
                Voir tous les talents
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Catégories */}
      <section id="categories" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-black/95 to-black" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Explorez par <span className="text-violet-500">catégorie</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Des compétences variées pour tous vos besoins
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const categoryId = category.name.toLowerCase();

              return (
                <a key={category.name} href={`/discover?category=${categoryId}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group relative cursor-pointer"
                  >
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-2xl p-6 hover:border-violet-500/60 transition-all">
                      <div className="bg-violet-600/25 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-600/40 transition-colors">
                        <Icon className="w-7 h-7 text-violet-200" />
                      </div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                    </div>
                  </motion.div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Séparateur */}
      <div className="max-w-3xl mx-auto h-[2px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent opacity-90" />

      {/* Fonctionnalités */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-violet-950/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Pourquoi <span className="text-violet-500">Kily</span> ?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Une plateforme qui valorise vos talents réels
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl mb-6"
                  >
                    <Icon className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-violet-600/10 to-violet-900/20" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center relative z-10"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Prêt à valoriser vos <span className="text-violet-500">talents</span> ?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Rejoignez des milliers de talents et trouvez des opportunités
          </p>
          <a href="/register">
            <button className="bg-violet-600 hover:bg-violet-700 px-10 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 inline-flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Commencer maintenant
              <TrendingUp className="w-5 h-5" />
            </button>
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="hidden sm:block">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-700 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">Kily</span>
              </div>
              <p className="text-gray-400 text-sm">
                La plateforme qui valorise vos talents sans barrière de diplôme
              </p>
            </div>

            <div className="hidden sm:block">
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/discover" className="hover:text-violet-500 transition-colors">Talents</a></li>
                <li><a href="/discover" className="hover:text-violet-500 transition-colors">Catégories</a></li>
                <li><a href="/recruiter/dashboard" className="hover:text-violet-500 transition-colors">Recruteurs</a></li>
                <li><a href="#features" className="hover:text-violet-500 transition-colors">À propos</a></li>
              </ul>
            </div>

            <div className="hidden sm:block">
              <h4 className="font-semibold mb-4">Devenir Talent</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/register" className="hover:text-violet-500 transition-colors">S'inscrire</a></li>
                <li><a href="/register" className="hover:text-violet-500 transition-colors">Créer son profil</a></li>
                <li><a href="/login" className="hover:text-violet-500 transition-colors">Connexion</a></li>
                <li><a href="/settings" className="hover:text-violet-500 transition-colors">Paramètres</a></li>
              </ul>
            </div>

            <div className="hidden md:block">
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-violet-500 transition-colors">CGU</a></li>
                <li><a href="#" className="hover:text-violet-500 transition-colors">Confidentialité</a></li>
                <li><a href="#" className="hover:text-violet-500 transition-colors">Cookies</a></li>
                <li><a href="#" className="hover:text-violet-500 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              © 2024 Kily. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Made with ❤️ in Africa</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



