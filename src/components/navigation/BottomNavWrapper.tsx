"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import PublishModal from "../publish/PublishModal";

export default function BottomNavWrapper() {
  const pathname = usePathname();
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Pages où on ne doit pas afficher la navigation
  const hiddenPages = ["/login", "/register"];
  const shouldHide = hiddenPages.includes(pathname);

  // Afficher le bouton "+" uniquement sur la page feed (pas sur l'accueil /)
  // Vérification stricte : seulement /feed exactement
  const isFeedPage = pathname === "/feed";
  const showPublishButton = Boolean(isFeedPage);

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <BottomNav 
        onPublishClick={showPublishButton ? () => setShowPublishModal(true) : undefined}
        showPublishButton={showPublishButton}
      />
      {showPublishButton && (
        <PublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </>
  );
}
