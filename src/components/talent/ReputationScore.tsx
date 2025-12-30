import { Award, Star } from "lucide-react";

interface ReputationScoreProps {
  rating: number;
  reviewCount: number;
  size?: "sm" | "md" | "lg";
  showStars?: boolean;
}

export default function ReputationScore({
  rating,
  reviewCount,
  size = "md",
  showStars = false,
}: ReputationScoreProps) {
  const sizes = {
    sm: {
      icon: "w-4 h-4",
      text: "text-sm",
      stars: "w-4 h-4",
    },
    md: {
      icon: "w-5 h-5",
      text: "text-base",
      stars: "w-5 h-5",
    },
    lg: {
      icon: "w-6 h-6",
      text: "text-lg",
      stars: "w-6 h-6",
    },
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star
            key={i}
            className={`${sizes[size].stars} fill-yellow-500 text-yellow-500`}
          />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className={`${sizes[size].stars} text-gray-600`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${sizes[size].stars} fill-yellow-500 text-yellow-500`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <Star key={i} className={`${sizes[size].stars} text-gray-600`} />
        );
      }
    }
    return stars;
  };

  return (
    <div className="flex items-center gap-2">
      {showStars ? (
        <>
          <div className="flex items-center gap-1">{renderStars()}</div>
          <span className={`${sizes[size].text} font-semibold text-white`}>
            {rating.toFixed(1)}
          </span>
          <span className={`${sizes[size].text} text-gray-400`}>
            ({reviewCount} avis)
          </span>
        </>
      ) : (
        <>
          <Award className={`${sizes[size].icon} text-yellow-500`} />
          <span className={`${sizes[size].text} font-semibold text-white`}>
            {rating.toFixed(1)}
          </span>
          <span className={`${sizes[size].text} text-gray-400`}>
            ({reviewCount} avis)
          </span>
        </>
      )}
    </div>
  );
}
