const TEST_MODE_KEY = "kronodoc_test_mode";

export function isDevTestModeEnabled(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  const urlFlag = params.get("test") === "1";
  const storageFlag = window.localStorage.getItem(TEST_MODE_KEY) === "1";

  return urlFlag || storageFlag;
}

export function setDevTestMode(enabled: boolean): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);

  if (enabled) {
    url.searchParams.set("test", "1");
    window.localStorage.setItem(TEST_MODE_KEY, "1");
  } else {
    url.searchParams.delete("test");
    window.localStorage.removeItem(TEST_MODE_KEY);
  }

  window.history.replaceState({}, "", url.toString());
}
