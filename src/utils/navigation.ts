// src/utils/navigation.ts

/** Phát sự kiện URL thay đổi để App biết re-render */
function notifyUrlChanged() {
  // 1) phát popstate (một số trình duyệt sẽ ignore, nhưng không sao)
  window.dispatchEvent(new Event("popstate"));
  // 2) phát thêm custom event ổn định
  window.dispatchEvent(new Event("urlchange"));
}

/** Điều hướng sang /mbapp/result và giữ lại loginToken + gắn params nếu truyền vào */
export function navigateToResult(
  params?: Record<string, string | number | undefined>
) {
  const url = new URL(window.location.href);
  const q = url.searchParams;

  // giữ lại loginToken (nếu đã có)
  const loginToken = q.get("loginToken");

  // clear query, set lại loginToken trước
  url.search = "";
  if (loginToken) url.searchParams.set("loginToken", loginToken);

  // merge thêm params mới
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    });
  }

  // đổi path
  url.pathname = "/mbapp/result";

  // cập nhật URL không reload
  window.history.replaceState(null, "", url.toString());

  // thông báo cho App
  notifyUrlChanged();
}
