// src/pages/ResultPage.tsx
import React from "react";

export default function ResultPage() {
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const query = Object.fromEntries(url.searchParams.entries());
    const hash = url.hash?.slice(1) ?? "";
    console.log("[ResultPage] query:", query, "| hash:", hash);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, -apple-system, Arial",
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 700 }}>ok</div>
    </div>
  );
}
