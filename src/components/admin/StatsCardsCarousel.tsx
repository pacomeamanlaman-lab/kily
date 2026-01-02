"use client";

import { useState, useRef } from "react";
import { ArrowUp, LucideIcon } from "lucide-react";

interface StatsCard {
  id: string;
  icon: LucideIcon;
  gradient: string;
  border: string;
  bgIcon: string;
  textIcon: string;
  label: string;
  value: string;
  change?: string;
  changeColor?: string;
}

interface StatsCardsCarouselProps {
  cards: StatsCard[];
}

export default function StatsCardsCarousel({ cards }: StatsCardsCarouselProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe left - next card
      setCurrentCardIndex((prev) => (prev + 1) % cards.length);
    } else {
      // Swipe right - previous card
      setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <>
      {/* Desktop Grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl sm:rounded-2xl p-4 sm:p-6`}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${card.bgIcon} rounded-lg sm:rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.textIcon}`} />
                </div>
                {card.change && (
                  <div className={`flex items-center gap-1 ${card.changeColor || "text-green-400"} text-xs sm:text-sm`}>
                    <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{card.change}</span>
                  </div>
                )}
              </div>
              <h3 className="text-gray-400 text-xs sm:text-sm mb-1">{card.label}</h3>
              <p className="text-2xl sm:text-3xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Mobile Carousel */}
      <div className="sm:hidden mb-6 relative">
        <div
          className="overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
          >
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.id} className="min-w-full px-2">
                  <div className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${card.bgIcon} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${card.textIcon}`} />
                      </div>
                      {card.change && (
                        <div className={`flex items-center gap-1 ${card.changeColor || "text-green-400"} text-sm`}>
                          <ArrowUp className="w-4 h-4" />
                          <span>{card.change}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-gray-400 text-sm mb-1">{card.label}</h3>
                    <p className="text-3xl font-bold">{card.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots Indicator */}
        {cards.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {cards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentCardIndex(index)}
                className={`transition-all ${
                  index === currentCardIndex
                    ? "w-8 h-2 bg-violet-500 rounded-full"
                    : "w-2 h-2 bg-gray-600 rounded-full hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

