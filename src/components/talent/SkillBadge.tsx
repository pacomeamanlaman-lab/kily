import { CheckCircle, Clock } from "lucide-react";
import { Skill } from "@/types";
import Badge from "@/components/ui/Badge";

interface SkillBadgeProps {
  skill: Skill;
  showLevel?: boolean;
  showExperience?: boolean;
}

export default function SkillBadge({
  skill,
  showLevel = true,
  showExperience = false,
}: SkillBadgeProps) {
  const levelColors = {
    beginner: "bg-blue-600/30 text-blue-300 border-blue-500/30",
    intermediate: "bg-green-600/30 text-green-300 border-green-500/30",
    expert: "bg-violet-600/30 text-violet-300 border-violet-500/30",
  };

  const levelLabels = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    expert: "Expert",
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Badge variant="primary" size="md" className="font-medium">
          {skill.name}
        </Badge>
        {skill.verified && (
          <CheckCircle className="w-4 h-4 text-violet-500 fill-violet-500" />
        )}
      </div>
      <div className="flex items-center gap-2 text-xs">
        {showLevel && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${levelColors[skill.level]}`}
          >
            {levelLabels[skill.level]}
          </span>
        )}
        {showExperience && skill.yearsExperience && (
          <span className="inline-flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            {skill.yearsExperience} an{skill.yearsExperience > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
