"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import PublishModal from "../publish/PublishModal";
import { getCurrentUser } from "@/lib/users";

export default function BottomNavWrapper() {
  const pathname = usePathname();
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [canPublish, setCanPublish] = useState(false);

  // Pages où on ne doit pas afficher la navigation
  const hiddenPages = ["/login", "/register", "/onboarding"];
  const shouldHide = hiddenPages.includes(pathname);

  // Check if user can publish (only Talents) - only on client side
  useEffect(() => {
    const currentUser = getCurrentUser();
    setCanPublish(currentUser?.userType === "talent");
  }, []);

  // Afficher le bouton "+" uniquement sur la page feed ET si l'user est un Talent
  const isFeedPage = pathname === "/feed";
  const showPublishButton = Boolean(isFeedPage && canPublish);

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
