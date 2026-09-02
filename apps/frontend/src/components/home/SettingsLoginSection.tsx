"use client";

import { useEffect, useRef, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { useMainStore } from "../../stores/main";
import { waitForGoogleAccountsId } from "../helpers/googleAuth";

export function SettingsLoginSection() {
  const { authUser, logout } = useAuth();
  const requiresLogin = useMainStore((state) => state.requiresLogin);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const googleSignInButtonRef = useRef<HTMLDivElement>(null);

  const isSignedIn = Boolean(authUser?.isLinked);
  const showGoogleButton = !isSignedIn;

  useEffect(() => {
    if (!showGoogleButton) {
      return;
    }

    return waitForGoogleAccountsId((accountsId) => {
      const buttonContainer = googleSignInButtonRef.current;
      if (!buttonContainer) {
        return;
      }

      buttonContainer.replaceChildren();
      accountsId.renderButton(buttonContainer, {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "signin",
        size: "large",
        logo_alignment: "left",
      });
    });
  }, [showGoogleButton]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const statusMessage = isSignedIn
    ? `Signed in as ${authUser?.name ?? authUser?.email ?? "Google user"}`
    : requiresLogin
      ? "This account requires Google login to save progress."
      : "Log in to save and use your progress between the tabs (we store only name and email)";

  return (
    <div className="flex flex-col items-center">
      <p className="text-center text-sm font-medium text-stone-800">Account</p>
      <p className="mt-2 text-center text-sm text-stone-600">{statusMessage}</p>
      {showGoogleButton && <div ref={googleSignInButtonRef} className="mt-3 flex justify-center" />}
      {isSignedIn && (
        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          className="mt-3 min-w-[20%] rounded-md bg-sky-500 px-6 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-600 disabled:opacity-60"
        >
          {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      )}
    </div>
  );
}
