"use client";

import { usePathname } from "next/navigation";
import DesktopHeader from "./DesktopHeader";

const PAGES_WITH_HEADER = ["/feed", "/discover", "/messages", "/recruiter/dashboard"];
const PAGES_WITHOUT_AUTO_HIDE = ["/feed"]; // Pages where header stays visible
const PAGES_WITH_NOTIFICATIONS = ["/feed", "/recruiter/dashboard"]; // Pages where notification bell should be visible

export default function ConditionalDesktopHeader() {
  const pathname = usePathname();

  // Check if current page should show desktop header
  const shouldShowHeader = PAGES_WITH_HEADER.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!shouldShowHeader) {
    return null;
  }

  // Check if auto-hide should be disabled
  const disableAutoHide = PAGES_WITHOUT_AUTO_HIDE.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  // Check if notifications should be shown (only on feed page)
  const showNotifications = PAGES_WITH_NOTIFICATIONS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  return <DesktopHeader disableAutoHide={disableAutoHide} showNotifications={showNotifications} />;
}
