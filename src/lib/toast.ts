type ToastType = "success" | "error" | "info";

export function showToast(message: string, type: ToastType = "info") {
  // TODO: Implement with a proper toast library or custom component
  // For MVP, using console.log
  const emoji = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  console.log(`${emoji} ${message}`);

  // Browser alert fallback for MVP
  if (typeof window !== "undefined") {
    alert(`${emoji} ${message}`);
  }
}
