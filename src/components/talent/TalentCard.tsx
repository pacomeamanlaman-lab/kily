"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle, MapPin } from "lucide-react";
import { Talent } from "@/types";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface TalentCardProps {
  talent: Talent;
  onClick?: () => void;
}

export default function TalentCard({ talent, onClick }: TalentCardProps) {
  return (
    <Card variant="hover" className="group relative" onClick={onClick}>
      {/* Avatar / Image principale */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={talent.avatar}
          alt={talent.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Badge vérifié */}
        {talent.verified && (
          <div className="absolute top-4 left-4 bg-violet-600/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">Vérifié</span>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* Nom */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-lg text-white">{talent.name}</h3>
        </div>

        {/* Compétence principale */}
        <div className="mb-3">
          {talent.skills.length > 0 && (
            <Badge variant="primary" size="sm">
              {talent.skills[0].name}
            </Badge>
          )}
          {talent.skills.length > 1 && (
            <span className="text-xs text-gray-400 ml-2">
              +{talent.skills.length - 1} autre{talent.skills.length > 2 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Localisation */}
        <div className="flex items-center gap-1 mb-3 text-sm text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{talent.location.city}, {talent.location.country}</span>
        </div>

        {/* Rating et bouton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Award className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-white">{talent.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-400">({talent.reviewCount})</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Voir profil
          </Button>
        </div>
      </div>
    </Card>
  );
}
