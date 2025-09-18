// src/pages/ResultPage.tsx
import React from "react";

export default function ResultPage() {
  const [params, setParams] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const url = new URL(window.location.href);

    // Nếu thiếu result => tự thêm result=oke
    if (!url.searchParams.get("result")) {
      url.searchParams.set("result", "Payment Successful");
      window.history.replaceState(null, "", url.toString());
    }

    // Lấy toàn bộ query param thành object
    const queryObj = Object.fromEntries(url.searchParams.entries());
    setParams(queryObj);

    // Log cho BE/dev xem
    console.log(
      "[ResultPage] query:",
      queryObj,
      "| hash:",
      url.hash?.slice(1) ?? ""
    );
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        fontFamily: "system-ui, -apple-system, Arial",
      }}
    ></div>
  );
}
