"use client";

import { usePathname } from "next/navigation";
import DesktopHeader from "./DesktopHeader";

const PAGES_WITH_HEADER = ["/feed", "/discover", "/messages"];

export default function ConditionalDesktopHeader() {
  const pathname = usePathname();

  // Check if current page should show desktop header
  const shouldShowHeader = PAGES_WITH_HEADER.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  if (!shouldShowHeader) {
    return null;
  }

  return <DesktopHeader />;
}
