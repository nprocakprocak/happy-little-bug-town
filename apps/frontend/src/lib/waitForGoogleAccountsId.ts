export function waitForGoogleAccountsId(
  onReady: (accountsId: typeof google.accounts.id) => void,
): () => void {
  let cancelled = false;

  const tryReady = () => {
    if (cancelled || typeof google === "undefined" || !google.accounts?.id) {
      return false;
    }

    onReady(google.accounts.id);
    return true;
  };

  if (tryReady()) {
    return () => {
      cancelled = true;
    };
  }

  const intervalId = window.setInterval(() => {
    if (tryReady()) {
      window.clearInterval(intervalId);
    }
  }, 100);

  return () => {
    cancelled = true;
    window.clearInterval(intervalId);
  };
}
