"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import PublishModal from "../publish/PublishModal";

export default function BottomNavWrapper() {
  const [showPublishModal, setShowPublishModal] = useState(false);

  return (
    <>
      <BottomNav onPublishClick={() => setShowPublishModal(true)} />
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
      />
    </>
  );
}
